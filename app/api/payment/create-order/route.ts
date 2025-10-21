import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

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

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise for INR or fils for AED
      currency: currency,
      receipt: receipt,
      notes: {
        order_id: receipt,
        created_at: new Date().toISOString(),
        source: 'sabs-online'
      },
    })

    return NextResponse.json({ 
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
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
