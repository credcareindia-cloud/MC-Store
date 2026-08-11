import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"
import { query } from "@/lib/db"

// Helper function to get active Razorpay account credentials
async function getActiveRazorpayCredentials() {
  let activeAccount = "1"
  try {
    const rows = await query<{ value: string }>(
      "SELECT value FROM settings WHERE key = 'active_razorpay_account' LIMIT 1"
    )
    if (rows[0]?.value) {
      activeAccount = rows[0].value
    }
  } catch (error) {
    console.warn("Could not read active_razorpay_account from settings, defaulting to 1:", error)
  }

  // Check all standard Razorpay env variable formats
  const keyId =
    process.env[`RAZORPAY_ACCOUNT_${activeAccount}_KEY_ID`] ||
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    process.env.RAZORPAY_ACCOUNT_1_KEY_ID ||
    ""

  const keySecret =
    process.env[`RAZORPAY_ACCOUNT_${activeAccount}_KEY_SECRET`] ||
    process.env.RAZORPAY_KEY_SECRET ||
    process.env.RAZORPAY_SECRET ||
    process.env.RAZORPAY_ACCOUNT_1_KEY_SECRET ||
    ""

  if (!keyId || !keySecret) {
    throw new Error(
      `Razorpay credentials missing. Please set RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET (or RAZORPAY_ACCOUNT_${activeAccount}_KEY_ID & RAZORPAY_ACCOUNT_${activeAccount}_KEY_SECRET) in .env`
    )
  }

  return { keyId, keySecret, accountNumber: activeAccount }
}

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, receipt } = await request.json()

    // Enhanced validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      )
    }

    if (!currency || !['INR', 'AED'].includes(currency)) {
      return NextResponse.json(
        { error: "Invalid currency. Only INR and AED are supported" },
        { status: 400 }
      )
    }

    if (!receipt || typeof receipt !== 'string' || receipt.length < 5) {
      return NextResponse.json(
        { error: "Invalid receipt ID" },
        { status: 400 }
      )
    }

    // Limit amount to prevent abuse (max 100,000 INR or 5,000 AED)
    const maxAmount = currency === 'INR' ? 100000 : 5000
    if (amount > maxAmount) {
      return NextResponse.json(
        { error: `Amount cannot exceed ${currency} ${maxAmount}` },
        { status: 400 }
      )
    }

    // Get active Razorpay credentials dynamically
    const { keyId, keySecret } = await getActiveRazorpayCredentials()

    // Initialize Razorpay with active account credentials
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: currency,
      receipt: receipt,
      notes: {
        order_id: receipt,
        created_at: new Date().toISOString(),
        source: 'motoclub'
      },
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
      receipt: order.receipt
    })
  } catch (error) {
    console.error("Payment order creation failed:", error)
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    )
  }
}
