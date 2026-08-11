import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
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

    // Get active Razorpay credentials dynamically
    const { keySecret } = await getActiveRazorpayCredentials()

    // Verify signature using crypto.timingSafeEqual to prevent timing attacks
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
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
      { error: "Payment verification failed", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
