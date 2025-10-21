import { NextResponse } from "next/server";
import { sql } from "@/lib/database";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production");

async function ensureAuthSchema() {
  // Create users table with updated schema
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255),
      phone VARCHAR(20),
      email_verified TIMESTAMP,
      image TEXT,
      password_hash VARCHAR(255),
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

export async function POST(request: Request) {
  try {
    await ensureAuthSchema();

    const { email, otp, name } = await request.json();
    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    // Verify OTP
    const [otpRecord] = await sql`
      SELECT * FROM user_otps
      WHERE email = ${email}
        AND otp_code = ${otp}
        AND expires_at > NOW()
        AND is_used = FALSE
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    // Mark OTP as used
    await sql`UPDATE user_otps SET is_used = TRUE WHERE id = ${otpRecord.id}`;

    // Create or update user (for OTP-only login, no password) - using email_verified timestamp
    const [user] = await sql`
      INSERT INTO users (email, name, email_verified)
      VALUES (${email}, ${name || null}, CURRENT_TIMESTAMP)
      ON CONFLICT (email) DO UPDATE SET
        email_verified = CURRENT_TIMESTAMP,
        name = COALESCE(EXCLUDED.name, users.name),
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, email, name, email_verified, created_at
    `;

    // Generate JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: !!user.email_verified, // Convert timestamp to boolean
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}