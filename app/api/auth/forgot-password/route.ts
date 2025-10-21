import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
import nodemailer from 'nodemailer'
import crypto from 'crypto'

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const users = await sql`
      SELECT id, name FROM users WHERE email = ${email} LIMIT 1
    `

    if (users.length === 0) {
      // For security, don't reveal if email exists or not
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, we've sent a reset link."
      })
    }

    const user = users[0]

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Store reset token in database
    await sql`
      UPDATE users
      SET reset_token = ${resetToken}, reset_token_expiry = ${resetTokenExpiry}
      WHERE id = ${user.id}
    `

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://sabsonlinestore.com'}/reset-password?token=${resetToken}`

    // Send reset email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f97316, #dc2626); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Reset your Sabs Online password</p>
        </div>

        <div style="background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #f97316; margin-bottom: 20px;">Hi ${user.name || 'there'}!</h2>

          <p style="margin-bottom: 20px;">
            We received a request to reset the password for your Sabs Online account associated with <strong>${email}</strong>.
          </p>

          <p style="margin-bottom: 20px;">
            Click the button below to reset your password:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
              Reset Password
            </a>
          </div>

          <p style="margin-bottom: 20px; color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:
            <br />
            <a href="${resetUrl}" style="color: #f97316; word-break: break-all;">${resetUrl}</a>
          </p>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin-top: 30px;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">⚠️ Important Notes:</h4>
            <ul style="margin: 0; color: #856404; font-size: 14px;">
              <li>This link will expire in 1 hour for security reasons</li>
              <li>If you didn't request this password reset, you can safely ignore this email</li>
              <li>For security, this link can only be used once</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="margin: 0; color: #666; font-size: 14px;">Need help? Contact us at <a href="tel:+919037888193" style="color: #f97316;">+91 9037888193</a></p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">This email was sent by Sabs Online</p>
          </div>
        </div>
      </body>
      </html>
    `

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🔐 Reset Your Password - Sabs Online',
      html: emailHtml,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: "Password reset link sent to your email."
    })

  } catch (error) {
    console.error("Error in forgot password:", error)
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    )
  }
}