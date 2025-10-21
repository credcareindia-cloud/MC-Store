import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { offerId, userId, userEmail, orderTotal, discountAmount } = await request.json()

    console.log('Tracking usage for:', { offerId, userId, userEmail })

    if (!offerId) {
      return NextResponse.json(
        { error: "Offer ID is required" },
        { status: 400 }
      )
    }

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: "User ID or email is required" },
        { status: 400 }
      )
    }

    // Use UPSERT pattern: update usage_count if record exists, insert if not
    await sql`
      INSERT INTO offer_usage (
        offer_id, 
        user_id, 
        user_email,
        usage_count,
        created_at
      ) VALUES (
        ${offerId}, 
        ${userId}, 
        ${userEmail},
        1,
        NOW()
      )
      ON CONFLICT (offer_id, user_email) 
      DO UPDATE SET 
        usage_count = offer_usage.usage_count + 1,
        created_at = NOW()
    `

    console.log('Usage tracked successfully')
    return NextResponse.json({
      success: true,
      message: "Offer usage tracked successfully"
    })

  } catch (error) {
    console.error("Error tracking offer usage:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error details:", errorMessage)
    return NextResponse.json(
      { error: "Failed to track offer usage", details: errorMessage },
      { status: 500 }
    )
  }
}
