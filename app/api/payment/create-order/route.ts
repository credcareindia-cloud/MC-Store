import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"
import { neon } from "@neondatabase/serverless"

// Helper function to get active Razorpay account credentials
async function getActiveRazorpayCredentials() {
  try {
    // Initialize Neon DB connection
    const sql = neon(process.env.DATABASE_URL!)

    // Fetch active account number from settings
    const rows = await sql`
      SELECT value FROM settings WHERE key = 'active_razorpay_account' LIMIT 1
    `

    const activeAccount = rows[0]?.value || "1" // Default to account 1

    // Get credentials from environment variables
    const keyId = process.env[`RAZORPAY_ACCOUNT_${activeAccount}_KEY_ID`]
    const keySecret = process.env[`RAZORPAY_ACCOUNT_${activeAccount}_KEY_SECRET`]

    if (!keyId || !keySecret) {
      throw new Error(`Razorpay credentials not found for account ${activeAccount}`)
    }

    return { keyId, keySecret, accountNumber: activeAccount }
  } catch (error) {
    console.error("Failed to get Razorpay credentials:", error)
    throw error
  }
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
