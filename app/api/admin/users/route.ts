import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { requireAdminAuth } from "@/lib/admin-auth"
import { canManageAdmins, ADMIN_CONFIG } from "@/lib/admin-config"
import bcrypt from "bcryptjs"

// GET - Fetch all admin users
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const currentAdmin = await requireAdminAuth(request)

    // Check if user has permission to manage admins (only super admin)
    if (!canManageAdmins(currentAdmin.role)) {
      return NextResponse.json(
        { success: false, message: "Access denied. Only super admin can manage users." },
        { status: 403 }
      )
    }

    // Fetch all admin users
    const adminUsers = await sql`
      SELECT 
        id,
        name,
        email,
        role,
        is_verified,
        created_at,
        updated_at
      FROM admin_users 
      ORDER BY created_at DESC
    `

    const formattedUsers = adminUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.is_verified,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      isCurrentUser: user.id === currentAdmin.id
    }))

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      currentUserId: currentAdmin.id
    })

  } catch (error) {
    console.error("Admin users fetch error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch admin users" },
      { status: 500 }
    )
  }
}

// POST - Create new admin user
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const currentAdmin = await requireAdminAuth(request)

    // Check if user has permission to manage admins (only super admin)
    if (!canManageAdmins(currentAdmin.role)) {
      return NextResponse.json(
        { success: false, message: "Access denied. Only super admin can create users." },
        { status: 403 }
      )
    }

    const { name, email, password, role = ADMIN_CONFIG.ROLES.ADMIN } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      )
    }

    // Validate role - only super admin can create other super admins
    if (role === ADMIN_CONFIG.ROLES.SUPER_ADMIN && currentAdmin.role !== ADMIN_CONFIG.ROLES.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, message: "Cannot create super admin user" },
        { status: 403 }
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

    // Check admin limit
    const adminCount = await sql`
      SELECT COUNT(*) as count FROM admin_users
    `
    
    if (adminCount[0].count >= 5) {
      return NextResponse.json(
        { success: false, message: "Maximum 5 admin users allowed" },
        { status: 403 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new admin user
    const newAdmin = await sql`
      INSERT INTO admin_users (name, email, password, role, is_verified)
      VALUES (${name}, ${email}, ${hashedPassword}, ${role}, true)
      RETURNING id, name, email, role, is_verified, created_at
    `

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      user: {
        id: newAdmin[0].id,
        name: newAdmin[0].name,
        email: newAdmin[0].email,
        role: newAdmin[0].role,
        isVerified: newAdmin[0].is_verified,
        createdAt: newAdmin[0].created_at
      }
    })

  } catch (error) {
    console.error("Admin user creation error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create admin user" },
      { status: 500 }
    )
  }
}
