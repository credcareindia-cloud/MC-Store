import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import nodemailer from "nodemailer"

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Function to send status update email to customer (copied from status route)
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

// Function to send tracking notification email
async function sendTrackingNotificationEmail(orderData: any, trackingUrl: string, trackingId: string, orderNumber?: string) {
  try {
    const currencySymbol = orderData.currency === 'AED' ? 'AED' : '₹'
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tracking Information Updated</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔄 Tracking Information Updated!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Order ${orderNumber}</p>
        </div>

        <div style="background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <h2 style="color: #f97316; margin: 0 0 10px 0;">We've updated your tracking information!</h2>

            ${trackingId ? `
              <div style="background: #e3f2fd; border: 1px solid #2196f3; border-radius: 6px; padding: 15px; margin: 15px 0; text-align: center;">
                <p style="margin: 0 0 8px 0; color: #1976d2; font-weight: bold; font-size: 14px;">📦 Tracking ID</p>
                <p style="margin: 0; font-family: monospace; font-size: 16px; font-weight: bold; color: #0d47a1; background: white; padding: 8px; border-radius: 4px; display: inline-block;">${trackingId}</p>
              </div>
            ` : ''}

            ${trackingUrl ? `
              <a href="${trackingUrl}" target="_blank" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px;">
                🔍 Track Your Order Online
              </a>
            ` : ''}
          </div>

          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Order Details</h3>
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Customer:</strong> ${orderData.customer_name}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> ${currencySymbol} ${parseFloat(orderData.final_total || orderData.total_amount).toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #f97316; font-weight: bold;">${orderData.status.toUpperCase()}</span></p>
            ${orderData.delivery_address ? `<p style="margin: 5px 0;"><strong>Delivery Address:</strong> ${orderData.delivery_address}</p>` : ''}
          </div>

          <div style="background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 5px; padding: 15px; margin-top: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #0066cc;">📱 Stay Updated</h4>
            <p style="margin: 0; font-size: 14px;">Use the tracking information above to monitor your package's journey. If you have any questions, please contact us at <a href="tel:+919037888193" style="color: #f97316;">+91 9037888193</a></p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="margin: 0; color: #666; font-size: 14px;">Thank you for choosing Sabs Online!</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Tracking updated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: orderData.customer_email,
      subject: `📦 Your Order ${orderNumber} is On Its Way - Tracking Information`,
      html: emailHtml,
    }

    await transporter.sendMail(mailOptions)
    console.log('Tracking notification email sent successfully to:', orderData.customer_email)
  } catch (error) {
    console.error('Error sending tracking notification email:', error)
    // Don't throw error to avoid breaking the tracking update
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const orderId = parseInt(id)
    const { tracking_url, tracking_id, send_notification } = await request.json()

    if (!tracking_url && !tracking_id) {
      return NextResponse.json(
        { error: "At least one tracking field (URL or ID) is required" },
        { status: 400 }
      )
    }

    // First, get the current order details
    const orderRows = await sql`
      SELECT * FROM orders WHERE id = ${orderId}
    `

    if (!orderRows || orderRows.length === 0) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    const order = orderRows[0] as any

    // Update the tracking information - preserve existing values if new ones are empty
    const finalTrackingUrl = (tracking_url && tracking_url.trim() !== '') ? tracking_url : (order.tracking_url || null)
    const finalTrackingId = (tracking_id && tracking_id.trim() !== '') ? tracking_id : (order.tracking_id || null)
    
    await sql`
      UPDATE orders 
      SET tracking_url = ${finalTrackingUrl}, 
          tracking_id = ${finalTrackingId}, 
          updated_at = NOW()
      WHERE id = ${orderId}
    `

    // Send email notification based on whether tracking is new or being updated
    if (send_notification && order.customer_email) {
      const hadExistingTracking = order.tracking_url || order.tracking_id
      const notificationStatuses = ['confirmed', 'dispatched', 'out for delivery', 'delivered']
      
      if (notificationStatuses.includes(order.status.toLowerCase())) {
        if (!hadExistingTracking) {
          // First time adding tracking - send status email with tracking info
          await sendStatusUpdateEmail(order, order.status.toLowerCase(), finalTrackingUrl, finalTrackingId, order.order_number)
          console.log(`First-time tracking: Status email (${order.status}) sent for order ${orderId} with new tracking info`)
        } else {
          // Updating existing tracking - send tracking update email
          await sendTrackingNotificationEmail(order, finalTrackingUrl, finalTrackingId, order.order_number)
          console.log(`Tracking UPDATE email sent for order ${orderId} with status: ${order.status}`)
        }
      } else {
        console.log(`Skipping tracking email for order ${orderId} with status: ${order.status} (not in notification statuses)`)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Tracking information updated successfully",
      tracking_url,
      tracking_id,
      notification_sent: send_notification && order.customer_email ? true : false
    })

  } catch (error) {
    console.error("Error updating tracking information:", error)
    return NextResponse.json(
      { error: "Failed to update tracking information" },
      { status: 500 }
    )
  }
}
