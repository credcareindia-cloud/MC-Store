import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { ADMIN_CONFIG, canRegisterAdmin } from "@/lib/admin-config"

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
    
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "Email, password, and name are required" },
        { status: 400 }
      )
    }

    // Check if registration is allowed
    const registrationCheck = await canRegisterAdmin()
    if (!registrationCheck.allowed) {
      return NextResponse.json(
        { success: false, message: registrationCheck.reason || "Registration not allowed" },
        { status: 403 }
      )
    }

    // Check current admin count
    const adminCount = await sql`
      SELECT COUNT(*) as count FROM admin_users
    `
    
    if (adminCount[0].count >= ADMIN_CONFIG.MAX_ADMIN_USERS) {
      return NextResponse.json(
        { success: false, message: `Maximum ${ADMIN_CONFIG.MAX_ADMIN_USERS} admin users allowed` },
        { status: 403 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    // Check if admin already exists
    const existingAdmin = await sql`
      SELECT id FROM admin_users WHERE email = ${email}
    `

    if (existingAdmin.length > 0) {
      return NextResponse.json(
        { success: false, message: "Admin with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new admin user
    const newUsers = await sql`
      INSERT INTO admin_users (email, password, name, role, is_verified)
      VALUES (${email}, ${hashedPassword}, ${name}, 'admin', true)
      RETURNING id, email, name, role, is_verified, created_at
    `

    const newUser = newUsers[0]

    // Create JWT token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    )

    // Create response with user data
    const userData = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      isVerified: newUser.is_verified,
      createdAt: newUser.created_at
    }

    const response = NextResponse.json({
      success: true,
      user: userData,
      message: "Admin account created successfully"
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
    console.error("Admin registration error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
