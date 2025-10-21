import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ valid: false, error: "Token is required" }, { status: 400 })
    }

    // Check if token exists and is not expired
    const users = await sql`
      SELECT id, reset_token_expiry
      FROM users
      WHERE reset_token = ${token}
      AND reset_token_expiry > NOW()
      LIMIT 1
    `

    if (users.length === 0) {
      return NextResponse.json({
        valid: false,
        error: "Invalid or expired reset token"
      })
    }

    return NextResponse.json({ valid: true })

  } catch (error) {
    console.error("Error verifying reset token:", error)
    return NextResponse.json(
      { valid: false, error: "Failed to verify reset token" },
      { status: 500 }
    )
  }
}