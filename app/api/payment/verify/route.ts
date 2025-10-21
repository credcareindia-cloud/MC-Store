import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

    // Enhanced validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required payment parameters" },
        { status: 400 }
      )
    }

    // Validate format
    if (!razorpay_order_id.startsWith('order_') || 
        !razorpay_payment_id.startsWith('pay_') ||
        razorpay_signature.length !== 64) {
      return NextResponse.json(
        { error: "Invalid payment parameter format" },
        { status: 400 }
      )
    }

    // Verify signature using crypto.timingSafeEqual to prevent timing attacks
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex")

    const providedSignature = Buffer.from(razorpay_signature, 'hex')
    const expectedSignatureBuffer = Buffer.from(expectedSignature, 'hex')
    const isAuthentic = crypto.timingSafeEqual(providedSignature, expectedSignatureBuffer)

    if (isAuthentic) {
      // Log successful verification (without sensitive data)
      console.log(`Payment verified successfully: ${razorpay_order_id.slice(-8)}`)
      
      return NextResponse.json({ 
        success: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        verified_at: new Date().toISOString()
      })
    } else {
      // Log failed verification attempt
      console.warn(`Payment verification failed for order: ${razorpay_order_id.slice(-8)}`)
      
      return NextResponse.json(
        { error: "Payment signature verification failed" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Payment verification failed:", error)
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    )
  }
}
