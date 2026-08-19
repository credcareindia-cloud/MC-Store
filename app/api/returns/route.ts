import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { ensureReturnTablesExist } from "@/lib/db/returns-schema"
import {
  isOrderEligibleForReturn,
  isItemEligibleForReturn,
  ActiveReturnItem
} from "@/lib/utils/return-eligibility"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
)

async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value
    if (!token) return null

    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      userId: payload.userId as number | string,
      email: (payload.email as string) || "",
    }
  } catch {
    return null
  }
}

/**
 * POST /api/returns
 * Create a new customer return request for eligible items of a delivered order.
 */
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
    }

    await ensureReturnTablesExist()

    const body = await request.json()
    const { order_id, items, reason, notes, image_urls } = body

    if (!order_id || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Order ID and at least one return item are required." },
        { status: 400 }
      )
    }

    // 1. Fetch order details from DB
    const orders = await sql`
      SELECT * FROM orders WHERE id = ${order_id} LIMIT 1
    `
    if (orders.length === 0) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 })
    }

    const order = orders[0]

    // 2. Validate order ownership & delivery status & 7-day return window
    const eligibility = isOrderEligibleForReturn(order as any, user.userId, user.email)
    if (!eligibility.canReturn) {
      return NextResponse.json({ error: eligibility.reason }, { status: 400 })
    }

    // 3. Fetch order items for this order from DB
    const dbOrderItems = await sql`
      SELECT * FROM order_items WHERE order_id = ${order_id}
    `
    const orderItemsMap = new Map<number, any>()
    dbOrderItems.forEach((oi: any) => orderItemsMap.set(oi.id, oi))

    // 4. Fetch existing active return items for this order
    const existingActiveItems = (await sql`
      SELECT ri.order_item_id, ri.quantity, r.status
      FROM return_request_items ri
      JOIN return_requests r ON ri.return_request_id = r.id
      WHERE r.order_id = ${Number(order_id)} AND LOWER(r.status) IN ('pending', 'approved', 'completed')
    `) as ActiveReturnItem[]

    // 5. Validate requested items
    const validatedItemsToInsert: Array<{
      order_item_id: number
      product_id: number | null
      product_name: string
      variant_id: number | null
      variant_name: string | null
      product_image_url: string | null
      unit_price: number
      quantity: number
      reason: string
      notes: string
    }> = []

    for (const requestedItem of items) {
      const { order_item_id, quantity, reason: itemReason, notes: itemNotes } = requestedItem
      const dbItem = orderItemsMap.get(Number(order_item_id))

      if (!dbItem) {
        return NextResponse.json(
          { error: `Order item ID ${order_item_id} does not belong to order #${order.order_number || order_id}.` },
          { status: 400 }
        )
      }

      const reqQty = Number(quantity) || 1
      if (reqQty <= 0) {
        return NextResponse.json(
          { error: `Requested quantity for "${dbItem.menu_item_name}" must be greater than zero.` },
          { status: 400 }
        )
      }

      // Check item eligibility against duplicate/exceeded requests
      const itemElig = isItemEligibleForReturn(dbItem, existingActiveItems)
      if (!itemElig.canReturn) {
        return NextResponse.json({ error: itemElig.reason }, { status: 400 })
      }

      if (reqQty > itemElig.remainingReturnableQty) {
        return NextResponse.json(
          {
            error: `Cannot return ${reqQty} units of "${dbItem.menu_item_name}". Maximum returnable quantity remaining is ${itemElig.remainingReturnableQty}.`
          },
          { status: 400 }
        )
      }

      validatedItemsToInsert.push({
        order_item_id: dbItem.id,
        product_id: dbItem.menu_item_id || null,
        product_name: dbItem.menu_item_name,
        variant_id: dbItem.variant_id || null,
        variant_name: dbItem.variant_name || null,
        product_image_url: dbItem.product_image_url || null,
        unit_price: Number(dbItem.unit_price) || 0,
        quantity: reqQty,
        reason: itemReason || reason || "Damaged product",
        notes: itemNotes || notes || ""
      })
    }

    // 6. Generate external reference ID for ERP integration
    const shortUuid = Math.random().toString(36).substring(2, 8).toUpperCase()
    const ecommerce_return_request_id = `RET-${order.order_number || order_id}-${shortUuid}`

    const userIdStr = user.userId.toString()
    const customerName = order.customer_name || ""
    const customerEmail = order.customer_email || user.email || ""
    const customerPhone = order.customer_phone || ""
    const overallReason = reason || validatedItemsToInsert[0]?.reason || "Damaged product"
    const overallNotes = notes || ""

    const imagesJson = JSON.stringify(Array.isArray(image_urls) ? image_urls : [])
    const itemsJson = JSON.stringify(validatedItemsToInsert)

    // 7. Insert return_requests record
    const createdRequests = await sql`
      INSERT INTO return_requests (
        ecommerce_return_request_id,
        order_id,
        order_number,
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        status,
        reason,
        notes,
        accounting_sync_status,
        images,
        items,
        requested_at
      ) VALUES (
        ${ecommerce_return_request_id},
        ${order_id},
        ${order.order_number || String(order_id)},
        ${userIdStr},
        ${customerName},
        ${customerEmail},
        ${customerPhone},
        'pending',
        ${overallReason},
        ${overallNotes},
        'pending',
        ${imagesJson}::jsonb,
        ${itemsJson}::jsonb,
        CURRENT_TIMESTAMP
      )
      RETURNING *
    `

    const returnRequest = createdRequests[0]

    // 8. Insert return_request_items
    for (const itemData of validatedItemsToInsert) {
      await sql`
        INSERT INTO return_request_items (
          return_request_id,
          order_item_id,
          product_id,
          product_variant_id,
          variant_id,
          variant_name,
          product_name,
          product_image_url,
          quantity,
          price,
          unit_price,
          reason,
          notes
        ) VALUES (
          ${returnRequest.id},
          ${itemData.order_item_id},
          ${itemData.product_id},
          ${itemData.variant_id},
          ${itemData.variant_id},
          ${itemData.variant_name},
          ${itemData.product_name},
          ${itemData.product_image_url},
          ${itemData.quantity},
          ${itemData.unit_price},
          ${itemData.unit_price},
          ${itemData.reason},
          ${itemData.notes}
        )
      `
    }

    // 9. Insert optional return_request_images
    if (Array.isArray(image_urls) && image_urls.length > 0) {
      for (const imgUrl of image_urls) {
        if (typeof imgUrl === "string" && imgUrl.trim()) {
          await sql`
            INSERT INTO return_request_images (
              return_request_id,
              image_url
            ) VALUES (
              ${returnRequest.id},
              ${imgUrl.trim()}
            )
          `
        }
      }
    }

    // Fetch items & images for response
    const insertedItems = await sql`
      SELECT * FROM return_request_items WHERE return_request_id = ${returnRequest.id}
    `
    const insertedImages = await sql`
      SELECT image_url FROM return_request_images WHERE return_request_id = ${returnRequest.id}
    `

    return NextResponse.json(
      {
        message: "Return request submitted successfully.",
        return_request: {
          ...returnRequest,
          items: insertedItems,
          images: insertedImages.map((img: any) => img.image_url)
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating return request:", error)
    return NextResponse.json(
      { error: "Failed to create return request", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/returns
 * Retrieve return requests for the logged-in customer.
 */
export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await ensureReturnTablesExist()

    const { searchParams } = new URL(request.url)
    const orderIdParam = searchParams.get("order_id")

    const userIdStr = user.userId.toString()
    const userEmailStr = user.email || ""

    let queryCondition = sql`
      r.user_id = ${userIdStr} 
      OR r.customer_email = ${userEmailStr}
      OR (r.customer_email IS NOT NULL AND LOWER(r.customer_email) = LOWER(${userEmailStr}))
      OR r.order_id IN (
        SELECT id FROM orders 
        WHERE user_id = ${userIdStr} 
           OR customer_email = ${userEmailStr} 
           OR (customer_email IS NOT NULL AND LOWER(customer_email) = LOWER(${userEmailStr}))
      )
    `
    if (orderIdParam) {
      queryCondition = sql`
        (${queryCondition}) AND r.order_id = ${Number(orderIdParam)}
      `
    }

    const returnRequests = await sql`
      SELECT 
        r.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', ri.id,
              'order_item_id', ri.order_item_id,
              'product_id', ri.product_id,
              'product_name', ri.product_name,
              'variant_id', COALESCE(ri.variant_id, ri.product_variant_id),
              'variant_name', ri.variant_name,
              'product_image_url', ri.product_image_url,
              'unit_price', COALESCE(ri.unit_price, ri.price),
              'price', COALESCE(ri.price, ri.unit_price),
              'quantity', ri.quantity,
              'reason', ri.reason,
              'notes', ri.notes
            )
          ) FILTER (WHERE ri.id IS NOT NULL),
          '[]'::json
        ) as items,
        COALESCE(
          json_agg(
            DISTINCT img.image_url
          ) FILTER (WHERE img.id IS NOT NULL),
          '[]'::json
        ) as images
      FROM return_requests r
      LEFT JOIN return_request_items ri ON r.id = ri.return_request_id
      LEFT JOIN return_request_images img ON r.id = img.return_request_id
      WHERE ${queryCondition}
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `

    const parseJsonArray = (val: any) => {
      if (Array.isArray(val)) return val
      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val)
          return Array.isArray(parsed) ? parsed : []
        } catch {
          return []
        }
      }
      return []
    }

    const cleanReturns = returnRequests.map((rr: any) => ({
      ...rr,
      items: parseJsonArray(rr.items),
      images: parseJsonArray(rr.images)
    }))

    return NextResponse.json(cleanReturns)
  } catch (error) {
    console.error("Error fetching return requests:", error)
    return NextResponse.json({ error: "Failed to fetch return requests" }, { status: 500 })
  }
}
