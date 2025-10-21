import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Token and new password are required" },
        { status: 400 }
      )
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    // Find valid reset token
    const resetTokens = await sql`
      SELECT pr.*, au.id as admin_id, au.email
      FROM admin_password_resets pr
      JOIN admin_users au ON pr.admin_user_id = au.id
      WHERE pr.token = ${token} 
        AND pr.used = false 
        AND pr.expires_at > NOW()
    `

    if (resetTokens.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    const resetToken = resetTokens[0]

    // Hash new password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update admin user password
    await sql`
      UPDATE admin_users 
      SET password = ${hashedPassword}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${resetToken.admin_id}
    `

    // Mark reset token as used
    await sql`
      UPDATE admin_password_resets 
      SET used = true 
      WHERE id = ${resetToken.id}
    `

    return NextResponse.json({
      success: true,
      message: "Password reset successfully"
    })
  } catch (error) {
    console.error("Admin reset password error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
