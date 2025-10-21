import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Ensure admin users table exists
async function ensureAdminUsersTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'admin',
      is_verified BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
}

export async function POST(request: NextRequest) {
  try {
    await ensureAdminUsersTable()
    
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      )
    }

    // Find admin user by email
    const adminUsers = await sql`
      SELECT * FROM admin_users WHERE email = ${email}
    `

    if (adminUsers.length === 0) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      )
    }

    const adminUser = adminUsers[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminUser.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: adminUser.id, 
        email: adminUser.email, 
        role: adminUser.role 
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    // Create response with user data (excluding password)
    const userData = {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      isVerified: adminUser.is_verified,
      createdAt: adminUser.created_at
    }

    const response = NextResponse.json({
      success: true,
      user: userData,
      message: "Login successful"
    })

    // Set HTTP-only cookie
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
