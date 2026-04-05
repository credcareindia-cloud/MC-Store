import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"
import { neon } from "@neondatabase/serverless"

async function getActiveRazorpayCredentials() {
  const sql = neon(process.env.DATABASE_URL!)
  const rows = await sql`
    SELECT value FROM settings WHERE key = 'active_razorpay_account' LIMIT 1
  `
  const activeAccount = rows[0]?.value || "1"
  const keyId = process.env[`RAZORPAY_ACCOUNT_${activeAccount}_KEY_ID`]
  const keySecret = process.env[`RAZORPAY_ACCOUNT_${activeAccount}_KEY_SECRET`]

  if (!keyId || !keySecret) {
    throw new Error(`Razorpay credentials not found for account ${activeAccount}`)
  }
  return { keyId, keySecret }
}

export async function POST(request: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Fetch the order from DB
    const orders = await sql`
      SELECT id, razorpay_order_id, razorpay_payment_id, payment_id, 
             payment_status, payment_method
      FROM orders WHERE id = ${orderId}
    `

    if (orders.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = orders[0]

    if (order.payment_method !== 'upi') {
      return NextResponse.json({ error: "Only UPI/Razorpay payments can be verified" }, { status: 400 })
    }

    const { keyId, keySecret } = await getActiveRazorpayCredentials()
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })

    let razorpayStatus: string = 'unknown'
    let razorpayPaymentData: any = null
    let verifiedVia: string = ''

    // Strategy 1: Fetch payment directly if we have razorpay_payment_id
    if (order.razorpay_payment_id) {
      try {
        const payment = await razorpay.payments.fetch(order.razorpay_payment_id)
        razorpayPaymentData = payment
        razorpayStatus = payment.status // captured, authorized, failed, refunded, etc.
        verifiedVia = 'payment_id'
      } catch (e) {
        console.error("Failed to fetch payment by ID:", e)
      }
    }

    // Strategy 2: Fetch via Razorpay order if we have razorpay_order_id
    if (razorpayStatus === 'unknown' && order.razorpay_order_id) {
      try {
        const rzpOrder = await razorpay.orders.fetch(order.razorpay_order_id)
        razorpayStatus = rzpOrder.status // created, attempted, paid

        // Also try to get payments for this order
        const payments = await razorpay.orders.fetchPayments(order.razorpay_order_id)
        if (payments && payments.items && payments.items.length > 0) {
          // Get the latest payment
          const latestPayment = payments.items[payments.items.length - 1] as any
          razorpayPaymentData = latestPayment
          razorpayStatus = latestPayment.status
          verifiedVia = 'order_payments'
        } else {
          verifiedVia = 'order_status'
        }
      } catch (e) {
        console.error("Failed to fetch order from Razorpay:", e)
      }
    }

    // Strategy 3: Try payment_id field as fallback
    if (razorpayStatus === 'unknown' && order.payment_id && order.payment_id.startsWith('pay_')) {
      try {
        const payment = await razorpay.payments.fetch(order.payment_id)
        razorpayPaymentData = payment
        razorpayStatus = payment.status
        verifiedVia = 'fallback_payment_id'
      } catch (e) {
        console.error("Failed to fetch payment by payment_id:", e)
      }
    }

    if (razorpayStatus === 'unknown') {
      return NextResponse.json({
        success: false,
        error: "Could not verify payment - no Razorpay payment ID or order ID found",
        current_db_status: order.payment_status,
        razorpay_order_id: order.razorpay_order_id,
        razorpay_payment_id: order.razorpay_payment_id
      }, { status: 400 })
    }

    // Map Razorpay status to our payment status
    const statusMap: Record<string, string> = {
      'captured': 'paid',
      'authorized': 'paid',
      'paid': 'paid',        // Order-level status
      'refunded': 'refunded',
      'failed': 'failed',
      'created': 'pending',
      'attempted': 'pending',
    }
    const newPaymentStatus = statusMap[razorpayStatus] || order.payment_status
    const statusChanged = newPaymentStatus !== order.payment_status

    // Update DB with verified status + any extra Razorpay data we got
    const updateFields: any = { payment_status: newPaymentStatus }

    if (razorpayPaymentData) {
      if (razorpayPaymentData.id && !order.razorpay_payment_id) {
        updateFields.razorpay_payment_id = razorpayPaymentData.id
      }
      if (razorpayPaymentData.order_id && !order.razorpay_order_id) {
        updateFields.razorpay_order_id = razorpayPaymentData.order_id
      }
    }

    // Build and run UPDATE
    if (razorpayPaymentData) {
      await sql`
        UPDATE orders SET
          payment_status = ${newPaymentStatus},
          razorpay_payment_id = COALESCE(razorpay_payment_id, ${razorpayPaymentData.id || null}),
          razorpay_order_id = COALESCE(razorpay_order_id, ${razorpayPaymentData.order_id || null}),
          bank_reference_num = ${razorpayPaymentData.acquirer_data?.bank_transaction_id || razorpayPaymentData.acquirer_data?.rrn || null},
          payment_method_type = ${razorpayPaymentData.method || null},
          payment_bank = ${razorpayPaymentData.bank || null},
          payment_vpa = ${razorpayPaymentData.vpa || null},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${orderId}
      `
    } else {
      await sql`
        UPDATE orders SET
          payment_status = ${newPaymentStatus},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${orderId}
      `
    }

    return NextResponse.json({
      success: true,
      verified_via: verifiedVia,
      previous_status: order.payment_status,
      razorpay_status: razorpayStatus,
      new_status: newPaymentStatus,
      status_changed: statusChanged,
      payment_details: razorpayPaymentData ? {
        id: razorpayPaymentData.id,
        order_id: razorpayPaymentData.order_id,
        amount: razorpayPaymentData.amount ? razorpayPaymentData.amount / 100 : null,
        currency: razorpayPaymentData.currency,
        status: razorpayPaymentData.status,
        method: razorpayPaymentData.method,
        bank: razorpayPaymentData.bank,
        vpa: razorpayPaymentData.vpa,
        email: razorpayPaymentData.email,
        contact: razorpayPaymentData.contact,
        fee: razorpayPaymentData.fee ? razorpayPaymentData.fee / 100 : null,
        tax: razorpayPaymentData.tax ? razorpayPaymentData.tax / 100 : null,
        error_code: razorpayPaymentData.error_code,
        error_description: razorpayPaymentData.error_description,
        created_at: razorpayPaymentData.created_at ? new Date(razorpayPaymentData.created_at * 1000).toISOString() : null,
      } : null
    })
  } catch (error) {
    console.error("Payment verification failed:", error)
    return NextResponse.json(
      { error: "Payment verification failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
