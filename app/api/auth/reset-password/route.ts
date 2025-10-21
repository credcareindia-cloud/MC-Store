import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
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
        error: "Invalid or expired reset token"
      }, { status: 400 })
    }

    const user = users[0]

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user password and clear reset token
    await sql`
      UPDATE users
      SET password_hash = ${hashedPassword},
          reset_token = NULL,
          reset_token_expiry = NULL,
          updated_at = NOW()
      WHERE id = ${user.id}
    `

    return NextResponse.json({
      success: true,
      message: "Password has been successfully reset"
    })

  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    )
  }
}