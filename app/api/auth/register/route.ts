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
    const name = (body.name || "").trim();
    const identifier = (body.identifier || body.email || body.phone || "").trim();
    const password = body.password;

    if (!name || !identifier || !password) {
      return NextResponse.json({ 
        error: "Full Name, Email/Phone Number, and Password are required" 
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ 
        error: "Password must be at least 6 characters long" 
      }, { status: 400 });
    }

    const isEmail = identifier.includes("@");
    const email = isEmail ? identifier : (body.email || null);
    const phone = !isEmail ? identifier : (body.phone || null);

    if (email) {
      const existingEmail = await sql`
        SELECT id FROM users WHERE LOWER(email) = LOWER(${email})
      `;
      if (existingEmail.length > 0) {
        return NextResponse.json({ 
          error: "An account with this email already exists" 
        }, { status: 400 });
      }
    }

    if (phone) {
      const existingPhone = await sql`
        SELECT id FROM users WHERE phone = ${phone}
      `;
      if (existingPhone.length > 0) {
        return NextResponse.json({ 
          error: "An account with this phone number already exists" 
        }, { status: 400 });
      }
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const users = await sql`
      INSERT INTO users (email, phone, name, password_hash, email_verified)
      VALUES (${email}, ${phone}, ${name}, ${passwordHash}, CURRENT_TIMESTAMP)
      RETURNING id, email, phone, name, email_verified, created_at
    `;

    const user = users[0];

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
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json({ 
      error: "Failed to register user" 
    }, { status: 500 });
  }
}