import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
import nodemailer from 'nodemailer'

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Function to send status update email to customer
async function sendStatusUpdateEmail(order: any, newStatus: string, trackingUrl?: string, trackingId?: string, orderNumber?: string) {
  try {
    const customerEmail = order.customer_email
    if (!customerEmail) {
      console.log('No customer email provided, skipping status update email')
      return
    }

    const currency = order.currency || 'AED'
    const currencySymbol = currency === 'AED' ? 'AED' : '₹'

    // Only send emails for specific status changes
    if (!['confirmed', 'dispatched', 'out for delivery', 'delivered'].includes(newStatus)) {
      console.log(`Skipping email for status: ${newStatus}`)
      return
    }

    const statusMessages = {
      'confirmed': {
        emoji: '✅',
        title: 'Order Confirmed!',
        message: 'Your order has been confirmed and is being prepared.',
        color: '#3b82f6'
      },
      'dispatched': {
        emoji: '📦',
        title: 'Order Shipped!',
        message: 'Your order has been shipped and is on its way to you.',
        color: '#f97316'
      },
      'out for delivery': {
        emoji: '🚚',
        title: 'Your Order is Out for Delivery!',
        message: 'Great news! Your order is now on its way to you.',
        color: '#f97316'
      },
      'delivered': {
        emoji: '✅',
        title: 'Order Delivered Successfully!',
        message: 'Your order has been delivered. Thank you for shopping with us!',
        color: '#10b981'
      }
    }

    const statusInfo = statusMessages[newStatus as keyof typeof statusMessages]

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Status Update</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, ${statusInfo.color}, #dc2626); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">${statusInfo.emoji} ${statusInfo.title}</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Order ${orderNumber}</p>
        </div>

        <div style="background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <h2 style="color: ${statusInfo.color}; margin: 0 0 10px 0;">${statusInfo.message}</h2>

            ${trackingId ? `
              <div style="background: #e3f2fd; border: 1px solid #2196f3; border-radius: 6px; padding: 15px; margin: 15px 0; text-align: center;">
                <p style="margin: 0 0 8px 0; color: #1976d2; font-weight: bold; font-size: 14px;">📦 Tracking ID</p>
                <p style="margin: 0; font-family: monospace; font-size: 16px; font-weight: bold; color: #0d47a1; background: white; padding: 8px; border-radius: 4px; display: inline-block;">${trackingId}</p>
              </div>
            ` : ''}

            ${trackingUrl ? `
              <a href="${trackingUrl}" target="_blank" style="display: inline-block; background: ${statusInfo.color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px;">
                🔍 Track Your Order Online
              </a>
            ` : ''}
          </div>

          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Order Details</h3>
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Customer:</strong> ${order.customer_name}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> ${currencySymbol} ${parseFloat(order.final_total || order.total_amount).toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${statusInfo.color}; font-weight: bold;">${newStatus.toUpperCase()}</span></p>
            ${order.delivery_address ? `<p style="margin: 5px 0;"><strong>Delivery Address:</strong> ${order.delivery_address}</p>` : ''}
          </div>

          ${newStatus === 'delivered' ? `
          <div style="background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 5px; padding: 15px; margin-top: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #0066cc;">🌟 We hope you love your order!</h4>
            <p style="margin: 0; font-size: 14px;">If you have any questions or feedback, please don't hesitate to contact us at <a href="tel:+919037888193" style="color: ${statusInfo.color};">+91 9037888193</a></p>
          </div>
          ` : ''}

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="margin: 0; color: #666; font-size: 14px;">Thank you for choosing Sabs Online!</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Status updated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: `${statusInfo.emoji} Order ${orderNumber} - ${statusInfo.title}`,
      html: emailHtml,
    }

    await transporter.sendMail(mailOptions)
    console.log(`Status update email sent successfully to: ${customerEmail} for status: ${newStatus}`)
  } catch (error) {
    console.error('Error sending status update email:', error)
    // Don't throw error to avoid breaking order status update
  }
}

// Comprehensive stock management for all status transitions
async function handleStockUpdate(orderId: number, previousStatus: string, newStatus: string, orderItems: any[], orderNumber: string) {
  /*
  STOCK MANAGEMENT RULES:
  1. From pending to any other (except cancel) = REDUCE stock
  2. From any other to pending (except cancel) = RESTORE stock  
  3. From any other to cancel (except pending) = RESTORE stock
  4. From cancel to any other (except pending) = REDUCE stock
  5. No change for: pending↔cancel, same status, or other transitions
  */
  
  let stockAction = 'none' // 'reduce' | 'restore' | 'none'
  
  // Rule 1: From pending to any other (except cancel) = REDUCE stock
  if (previousStatus === 'pending' && newStatus !== 'cancel' && newStatus !== 'pending') {
    stockAction = 'reduce'
  }
  
  // Rule 2: From any other to pending (except cancel) = RESTORE stock
  else if (newStatus === 'pending' && previousStatus !== 'cancel' && previousStatus !== 'pending') {
    stockAction = 'restore'
  }
  
  // Rule 3: From any other to cancel (except pending) = RESTORE stock
  else if (newStatus === 'cancel' && previousStatus !== 'pending' && previousStatus !== 'cancel') {
    stockAction = 'restore'
  }
  
  // Rule 4: From cancel to any other (except pending) = REDUCE stock
  else if (previousStatus === 'cancel' && newStatus !== 'pending' && newStatus !== 'cancel') {
    stockAction = 'reduce'
  }
  
  if (stockAction === 'none') {
    console.log(`No stock update needed for transition: ${previousStatus} → ${newStatus}`)
    return
  }
  
  console.log(`Stock ${stockAction} for order ${orderNumber}: ${previousStatus} → ${newStatus}`)
  
  for (const item of orderItems) {
    const quantity = parseInt(item.quantity)
    // For reduce: negative change, For restore: positive change
    const changeAmount = quantity * (stockAction === 'reduce' ? -1 : 1)
    
    try {
      if (item.variant_id) {
        // Update variant stock
        await sql`
          UPDATE product_variants 
          SET stock_quantity = GREATEST(0, stock_quantity + ${changeAmount})
          WHERE id = ${item.variant_id}
        `
        console.log(`${stockAction === 'reduce' ? 'Reduced' : 'Restored'} variant ${item.variant_id} stock by ${Math.abs(changeAmount)}`)
      } else if (item.menu_item_id) {
        // Fallback: update product stock
        await sql`
          UPDATE products 
          SET stock_quantity = GREATEST(0, stock_quantity + ${changeAmount})
          WHERE id = ${item.menu_item_id}
        `
        console.log(`${stockAction === 'reduce' ? 'Reduced' : 'Restored'} product ${item.menu_item_id} stock by ${Math.abs(changeAmount)}`)
      }
    } catch (error) {
      console.error(`Error updating stock for item ${item.variant_id || item.menu_item_id}:`, error)
    }
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { status, tracking_url, tracking_id } = await request.json()
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    const validStatuses = ["pending", "confirmed", "packed", "dispatched", "out for delivery", "delivered", "cancel"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status. Valid statuses: " + validStatuses.join(', ') }, { status: 400 })
    }

    // Get current order details first
    const [currentOrder] = await sql`
      SELECT o.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'menu_item_id', oi.menu_item_id,
              'variant_id', oi.variant_id,
              'quantity', oi.quantity
            ) ORDER BY oi.id
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'::json
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.id = ${id}
      GROUP BY o.id
    `

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const previousStatus = currentOrder.status
    
    // Handle stock management based on status changes
    await handleStockUpdate(id, previousStatus, status, currentOrder.items, currentOrder.order_number)

    // Update order status, tracking URL, and tracking ID
    const result = await sql`
      UPDATE orders
      SET
        status = ${status},
        tracking_url = ${tracking_url || null},
        tracking_id = ${tracking_id || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING 
        id,
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        COALESCE(order_type, 'delivery') as order_type,
        COALESCE(payment_method, 'cod') as payment_method,
        payment_status,
        payment_id,
        delivery_address,
        special_instructions,
        COALESCE(subtotal, 0) as total_amount,
        0 as tax_amount,
        COALESCE(delivery_fee, 0) as delivery_fee,
        total_amount as final_total,
        currency,
        discount_amount,
        coupon_code,
        status,
        tracking_url,
        tracking_id,
        created_at,
        updated_at
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    const order = result[0]
    console.log(`Order ${id} status updated from ${previousStatus} to ${status}`)
    console.log(`Order number for email: ${order.order_number}`)

    // Send status update email if status changed OR if tracking is being added for first time
    const hadPreviousTracking = currentOrder.tracking_url || currentOrder.tracking_id
    const hasNewTracking = tracking_url || tracking_id
    const isFirstTimeTracking = !hadPreviousTracking && hasNewTracking
    
    if (status !== previousStatus || isFirstTimeTracking) {
      try {
        await sendStatusUpdateEmail(order, status, tracking_url, tracking_id, order.order_number)
        if (isFirstTimeTracking) {
          console.log(`First-time tracking email sent for order ${id} with status: ${status}`)
        }
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError)
        // Continue with the response even if email fails
      }
    }

    // Return formatted response
    const formattedOrder = {
      id: parseInt(order.id),
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      order_type: order.order_type,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      payment_id: order.payment_id,
      delivery_address: order.delivery_address,
      special_instructions: order.special_instructions,
      total_amount: parseFloat(order.total_amount || '0'),
      tax_amount: parseFloat(order.tax_amount || '0'),
      delivery_fee: parseFloat(order.delivery_fee || '0'),
      final_total: parseFloat(order.final_total || '0'),
      currency: order.currency || 'INR',
      discount_amount: parseFloat(order.discount_amount || '0'),
      coupon_code: order.coupon_code,
      status: order.status,
      tracking_url: order.tracking_url,
      tracking_id: order.tracking_id,
      created_at: order.created_at,
      updated_at: order.updated_at
    }

    return NextResponse.json(formattedOrder)


    return NextResponse.json(formattedOrder)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json(
      { error: "Failed to update order", details: error instanceof Error ? error.message : "Unknown error" }, 
      { status: 500 }
    )
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    const result = await sql`
      SELECT
        o.id,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        COALESCE(o.order_type, 'dine-in') as order_type,
        COALESCE(o.payment_method, 'cod') as payment_method,
        o.delivery_address,
        o.special_instructions as customer_address,
        COALESCE(o.subtotal, 0) as total_amount,
        0 as tax_amount,
        COALESCE(o.delivery_fee, 0) as delivery_fee,
        o.total_amount as final_total,
        o.status,
        o.special_instructions,
        o.created_at,
        o.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id',            oi.id,
              'menu_item_id',  oi.menu_item_id,
              'menu_item_name',oi.menu_item_name,
              'quantity',      oi.quantity,
              'unit_price',    oi.unit_price,
              'total_price',   oi.total_price,
              'special_requests', oi.special_requests
            ) ORDER BY oi.id
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'::json
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.id = ${id}
      GROUP BY o.id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = result[0]
    const formattedOrder = {
      id: parseInt(order.id),
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      order_type: order.order_type,
      payment_method: order.payment_method,
      delivery_address: order.delivery_address,
      customer_address: order.customer_address,
      total_amount: parseFloat(order.total_amount || '0'),
      tax_amount: parseFloat(order.tax_amount || '0'),
      delivery_fee: parseFloat(order.delivery_fee || '0'),
      final_total: parseFloat(order.final_total || '0'),
      status: order.status,
      special_instructions: order.special_instructions,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: Array.isArray(order.items) ? order.items.map((item: any) => ({
        id: parseInt(item.id || '0'),
        menu_item_id: parseInt(item.menu_item_id || '0'),
        menu_item_name: item.menu_item_name,
        quantity: parseInt(item.quantity || '0'),
        unit_price: parseFloat(item.unit_price || '0'),
        total_price: parseFloat(item.total_price || '0'),
        special_requests: item.special_requests
      })) : []
    }

    return NextResponse.json(formattedOrder)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}
