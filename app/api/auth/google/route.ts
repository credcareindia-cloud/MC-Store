import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { cookies } from "next/headers"
import { SignJWT, decodeJwt } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

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
  `
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS image TEXT;`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified TIMESTAMP;`
}

export async function POST(request: Request) {
  try {
    await ensureAuthSchema()

    const body = await request.json()
    let email = ""
    let name = ""
    let image = ""

    // 1. If Google ID Token / Credential string is provided
    if (body.credential || body.token) {
      const rawToken = body.credential || body.token
      try {
        const decoded = decodeJwt(rawToken) as any
        email = decoded.email || ""
        name = decoded.name || decoded.given_name || ""
        image = decoded.picture || ""
      } catch (err) {
        console.warn("Could not decode JWT payload, falling back to direct body fields:", err)
      }
    }

    // 2. Fallback to direct parameters if passed in body
    if (!email && body.email) {
      email = body.email.trim()
    }
    if (!name && body.name) {
      name = body.name.trim()
    }
    if (!image && body.image) {
      image = body.image
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required for Google Sign-In" }, { status: 400 })
    }

    // 3. Check if user already exists
    const existingUsers = await sql`
      SELECT id, email, phone, name, image, created_at
      FROM users
      WHERE LOWER(email) = LOWER(${email})
    `

    let user = existingUsers[0]

    if (user) {
      // Update image and email_verified timestamp if missing
      await sql`
        UPDATE users
        SET 
          email_verified = COALESCE(email_verified, CURRENT_TIMESTAMP),
          name = COALESCE(NULLIF(name, ''), ${name}),
          image = COALESCE(NULLIF(image, ''), ${image}),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${user.id}
      `
    } else {
      // Create new user for Google Sign-In
      const newUsers = await sql`
        INSERT INTO users (email, name, image, email_verified)
        VALUES (${email}, ${name || email.split("@")[0]}, ${image}, CURRENT_TIMESTAMP)
        RETURNING id, email, phone, name, image, created_at
      `
      user = newUsers[0]
    }

    // 4. Sign JWT session token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name || name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET)

    // 5. Store HTTP-only auth cookie
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name || name,
        isVerified: true,
        createdAt: user.created_at,
        image: user.image || image,
      },
    })
  } catch (error) {
    console.error("Error signing in with Google:", error)
    return NextResponse.json({ error: "Failed to sign in with Google" }, { status: 500 })
  }
}
