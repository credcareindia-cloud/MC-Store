import { NextResponse } from "next/server";
import { sql } from "@/lib/database";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production");

async function ensureAuthSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE,
      phone VARCHAR(50) UNIQUE,
      name VARCHAR(255),
      email_verified TIMESTAMP,
      image TEXT,
      password_hash VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified TIMESTAMP;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS image TEXT;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`;
}

export async function POST(request: Request) {
  try {
    await ensureAuthSchema();

    const body = await request.json();
    const identifier = (body.identifier || body.email || body.phone || "").trim();
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json({ 
        error: "Email or phone number and password are required" 
      }, { status: 400 });
    }

    const isEmail = identifier.includes("@");
    const cleanPhone = identifier.replace(/\D/g, "");

    const users = isEmail 
      ? await sql`
          SELECT id, email, phone, name, password_hash, email_verified, created_at, image
          FROM users 
          WHERE LOWER(email) = LOWER(${identifier})
        `
      : await sql`
          SELECT id, email, phone, name, password_hash, email_verified, created_at, image
          FROM users 
          WHERE phone = ${identifier} OR (LENGTH(${cleanPhone}) >= 7 AND phone LIKE ${'%' + cleanPhone})
        `;

    const user = users[0];

    if (!user) {
      return NextResponse.json({ 
        error: "Invalid email/phone or password" 
      }, { status: 401 });
    }

    if (!user.password_hash) {
      return NextResponse.json({ 
        error: "No password set for this account. Please register or reset your password." 
      }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return NextResponse.json({ 
        error: "Invalid email/phone or password" 
      }, { status: 401 });
    }

    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email || user.phone || "",
        phone: user.phone,
        name: user.name,
        isVerified: true,
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