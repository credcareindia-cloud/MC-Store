import { NextRequest } from "next/server"
import { sql } from "@/lib/database"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface AdminUser {
  id: number
  email: string
  name: string
  role: string
  isVerified: boolean
  createdAt: string
}

export async function getAdminFromRequest(request: NextRequest): Promise<AdminUser | null> {
  try {
    const token = request.cookies.get("admin_token")?.value

    if (!token) {
      return null
    }

    // Verify JWT token
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return null
    }

    // Get current user data from database
    const adminUsers = await sql`
      SELECT id, email, name, role, is_verified, created_at
      FROM admin_users 
      WHERE id = ${decoded.id}
    `

    if (adminUsers.length === 0) {
      return null
    }

    const adminUser = adminUsers[0]

    return {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      isVerified: adminUser.is_verified,
      createdAt: adminUser.created_at
    }
  } catch (error) {
    console.error("Admin auth middleware error:", error)
    return null
  }
}

export async function requireAdminAuth(request: NextRequest): Promise<AdminUser> {
  const admin = await getAdminFromRequest(request)
  
  if (!admin) {
    throw new Error("Unauthorized: Admin authentication required")
  }
  
  return admin
}
