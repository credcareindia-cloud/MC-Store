import { NextResponse } from "next/server";
import { sql } from "@/lib/database";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";

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

    const { email, otp, name, password } = await request.json();
    
    if (!email || !otp || !name || !password) {
      return NextResponse.json({ 
        error: "Email, OTP, name, and password are required" 
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ 
        error: "Password must be at least 6 characters long" 
      }, { status: 400 });
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
      return NextResponse.json({ 
        error: "Invalid or expired OTP" 
      }, { status: 400 });
    }

    // Check if user already exists
    const [existingUser] = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser) {
      return NextResponse.json({ 
        error: "User with this email already exists" 
      }, { status: 400 });
    }

    // Mark OTP as used
    await sql`UPDATE user_otps SET is_used = TRUE WHERE id = ${otpRecord.id}`;

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user - using email_verified timestamp instead of is_verified boolean
    const [user] = await sql`
      INSERT INTO users (email, name, password_hash, email_verified)
      VALUES (${email}, ${name}, ${passwordHash}, CURRENT_TIMESTAMP)
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
    console.error("Error registering user:", error);
    return NextResponse.json({ 
      error: "Failed to register user" 
    }, { status: 500 });
  }
}