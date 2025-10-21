
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

    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ 
        error: "Email and password are required" 
      }, { status: 400 });
    }

    // Find user by email - using email_verified instead of is_verified
    const [user] = await sql`
      SELECT id, email, name, password_hash, email_verified, created_at, image
      FROM users 
      WHERE email = ${email}
    `;

    if (!user) {
      return NextResponse.json({ 
        error: "Invalid email or password" 
      }, { status: 401 });
    }

    if (!user.password_hash) {
      return NextResponse.json({ 
        error: "This account was created with OTP. Please use OTP login or contact support to set a password." 
      }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return NextResponse.json({ 
        error: "Invalid email or password" 
      }, { status: 401 });
    }

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
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    return NextResponse.json({ 
      error: "Failed to login" 
    }, { status: 500 });
  }
}