
import { NextResponse } from "next/server";
import { sql } from "@/lib/database";
import nodemailer from "nodemailer";

// Create tables if not exist
async function ensureAuthSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255),
      phone VARCHAR(20),
      is_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS user_otps (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      otp_code VARCHAR(6) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      is_used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

// Generate 6 digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send email using Nodemailer
async function sendOTPEmail(email: string, otp: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail", // You can change to another SMTP
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // App password
    },
  });

  await transporter.sendMail({
    from: `"Your App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    html: `<p>Your Sabs E-commerce verification code is:</p>
           <h2 style="color: #333;">${otp}</h2>
           <p>This code will expire in 5 minutes.</p>`,
  });
}

export async function POST(request: Request) {
  try {
    await ensureAuthSchema();

    const { email } = await request.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 5000); // 5 minutes

    await sql`
      INSERT INTO user_otps (email, otp_code, expires_at)
      VALUES (${email}, ${otp}, ${expiresAt})
    `;

    await sendOTPEmail(email, otp);

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

