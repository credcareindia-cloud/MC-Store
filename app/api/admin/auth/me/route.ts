import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      )
    }

    // Verify JWT token
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      )
    }

    // Get current user data from database
    const adminUsers = await sql`
      SELECT id, email, name, role, is_verified, created_at
      FROM admin_users 
      WHERE id = ${decoded.id}
    `

    if (adminUsers.length === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 401 }
      )
    }

    const adminUser = adminUsers[0]

    return NextResponse.json({
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      isVerified: adminUser.is_verified,
      createdAt: adminUser.created_at
    })
  } catch (error) {
    console.error("Admin auth check error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
