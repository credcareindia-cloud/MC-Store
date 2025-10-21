import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { requireAdminAuth } from "@/lib/admin-auth"
import { canManageAdmins, canManageUser, ADMIN_CONFIG } from "@/lib/admin-config"
import bcrypt from "bcryptjs"

// GET - Fetch specific admin user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentAdmin = await requireAdminAuth(request)
    const userId = parseInt(params.id)

    // Check if user has permission to manage admins (only super admin)
    if (!canManageAdmins(currentAdmin.role)) {
      return NextResponse.json(
        { success: false, message: "Access denied. Only super admin can view user details." },
        { status: 403 }
      )
    }

    const user = await sql`
      SELECT 
        id, name, email, role, is_verified, created_at, updated_at
      FROM admin_users 
      WHERE id = ${userId}
    `

    if (user.length === 0) {
      return NextResponse.json(
        { success: false, message: "Admin user not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        role: user[0].role,
        isVerified: user[0].is_verified,
        createdAt: user[0].created_at,
        updatedAt: user[0].updated_at,
        isCurrentUser: user[0].id === currentAdmin.id
      }
    })

  } catch (error) {
    console.error("Admin user fetch error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch admin user" },
      { status: 500 }
    )
  }
}

// PUT - Update admin user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentAdmin = await requireAdminAuth(request)
    const userId = parseInt(params.id)
    const { name, email, role, password } = await request.json()

    // Check if user has permission to manage admins (only super admin)
    if (!canManageAdmins(currentAdmin.role)) {
      return NextResponse.json(
        { success: false, message: "Access denied. Only super admin can update users." },
        { status: 403 }
      )
    }

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Name and email are required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await sql`
      SELECT id FROM admin_users WHERE id = ${userId}
    `

    if (existingUser.length === 0) {
      return NextResponse.json(
        { success: false, message: "Admin user not found" },
        { status: 404 }
      )
    }

    // Check if email is already taken by another user
    const emailCheck = await sql`
      SELECT id FROM admin_users WHERE email = ${email} AND id != ${userId}
    `

    if (emailCheck.length > 0) {
      return NextResponse.json(
        { success: false, message: "Email is already taken by another admin" },
        { status: 400 }
      )
    }

    // Prepare update data
    let updateData: any = {
      name,
      email,
      role: role || 'admin',
      updated_at: new Date()
    }

    // Hash new password if provided
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, message: "Password must be at least 6 characters long" },
          { status: 400 }
        )
      }
      updateData.password = await bcrypt.hash(password, 12)
    }

    // Update user
    const updatedUser = await sql`
      UPDATE admin_users 
      SET 
        name = ${updateData.name},
        email = ${updateData.email},
        role = ${updateData.role},
        ${password ? sql`password = ${updateData.password},` : sql``}
        updated_at = ${updateData.updated_at}
      WHERE id = ${userId}
      RETURNING id, name, email, role, is_verified, created_at, updated_at
    `

    return NextResponse.json({
      success: true,
      message: "Admin user updated successfully",
      user: {
        id: updatedUser[0].id,
        name: updatedUser[0].name,
        email: updatedUser[0].email,
        role: updatedUser[0].role,
        isVerified: updatedUser[0].is_verified,
        createdAt: updatedUser[0].created_at,
        updatedAt: updatedUser[0].updated_at
      }
    })

  } catch (error) {
    console.error("Admin user update error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update admin user" },
      { status: 500 }
    )
  }
}

// DELETE - Delete admin user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentAdmin = await requireAdminAuth(request)
    const userId = parseInt(params.id)

    // Check if user has permission to manage admins (only super admin)
    if (!canManageAdmins(currentAdmin.role)) {
      return NextResponse.json(
        { success: false, message: "Access denied. Only super admin can delete users." },
        { status: 403 }
      )
    }

    // Prevent self-deletion
    if (userId === currentAdmin.id) {
      return NextResponse.json(
        { success: false, message: "You cannot delete your own account" },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await sql`
      SELECT id, email FROM admin_users WHERE id = ${userId}
    `

    if (existingUser.length === 0) {
      return NextResponse.json(
        { success: false, message: "Admin user not found" },
        { status: 404 }
      )
    }

    // Delete the user
    await sql`
      DELETE FROM admin_users WHERE id = ${userId}
    `

    return NextResponse.json({
      success: true,
      message: "Admin user deleted successfully"
    })

  } catch (error) {
    console.error("Admin user deletion error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete admin user" },
      { status: 500 }
    )
  }
}
