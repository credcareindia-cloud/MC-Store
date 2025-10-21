import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import crypto from "crypto"
import nodemailer from "nodemailer"

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Ensure password reset tokens table exists
async function ensurePasswordResetTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_password_resets (
      id SERIAL PRIMARY KEY,
      admin_user_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
      token VARCHAR(255) UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
}

export async function POST(request: NextRequest) {
  try {
    await ensurePasswordResetTable()
    
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      )
    }

    // Find admin user by email
    const adminUsers = await sql`
      SELECT id, email, name FROM admin_users WHERE email = ${email}
    `

    if (adminUsers.length === 0) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: "If an admin account with this email exists, you will receive a password reset link."
      })
    }

    const adminUser = adminUsers[0]

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Save reset token to database
    await sql`
      INSERT INTO admin_password_resets (admin_user_id, token, expires_at)
      VALUES (${adminUser.id}, ${resetToken}, ${expiresAt})
    `

    // Send password reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://sabsonlinestore.com'}/admin/reset-password?token=${resetToken}`
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Password Reset</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Admin Password Reset</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Sabs Online Admin Panel</p>
        </div>

        <div style="background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #dc2626; margin-bottom: 20px;">Password Reset Request</h2>
          
          <p>Hello ${adminUser.name},</p>
          
          <p>You have requested to reset your admin password for Sabs Online. Click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #dc2626; word-break: break-all; font-size: 14px;">${resetUrl}</p>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>⚠️ Security Notice:</strong><br>
              • This link will expire in 1 hour<br>
              • If you didn't request this reset, please ignore this email<br>
              • Never share this link with anyone
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="margin: 0; color: #666; font-size: 14px;">Sabs Online Admin Team</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🔐 Admin Password Reset - Sabs Online",
      html: emailHtml,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: "If an admin account with this email exists, you will receive a password reset link."
    })
  } catch (error) {
    console.error("Admin forgot password error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
