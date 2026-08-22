import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { ensureReturnTablesExist } from "@/lib/returns-schema"

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
 * GET /api/returns/[id]
 * Fetch single return request details by ID.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await ensureReturnTablesExist()
    const { id } = await params
    const returnRequestId = Number(id)

    if (isNaN(returnRequestId)) {
      return NextResponse.json({ error: "Invalid return request ID" }, { status: 400 })
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
              'variant_id', ri.variant_id,
              'variant_name', ri.variant_name,
              'product_image_url', ri.product_image_url,
              'unit_price', ri.unit_price,
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
      WHERE r.id = ${returnRequestId}
      GROUP BY r.id
      LIMIT 1
    `

    if (returnRequests.length === 0) {
      return NextResponse.json({ error: "Return request not found" }, { status: 404 })
    }

    const returnRequest = returnRequests[0]

    // Verify customer ownership
    const userIdStr = user.userId.toString()
    const userEmailStr = (user.email || "").toLowerCase()
    const isOwner =
      returnRequest.user_id?.toString() === userIdStr ||
      (returnRequest.customer_email || "").toLowerCase() === userEmailStr

    if (!isOwner) {
      return NextResponse.json(
        { error: "Forbidden. You do not have permission to view this return request." },
        { status: 403 }
      )
    }

    return NextResponse.json({
      ...returnRequest,
      items: Array.isArray(returnRequest.items) ? returnRequest.items : [],
      images: Array.isArray(returnRequest.images) ? returnRequest.images : []
    })
  } catch (error) {
    console.error("Error fetching single return request:", error)
    return NextResponse.json({ error: "Failed to fetch return request" }, { status: 500 })
  }
}
