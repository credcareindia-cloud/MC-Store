import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify JWT
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as number

    // Get user from database - using email_verified instead of is_verified
    const [user] = await sql`
      SELECT id, email, name, email_verified, created_at, image
      FROM users 
      WHERE id = ${userId}
    `

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: !!user.email_verified, // Convert timestamp to boolean
        createdAt: user.created_at,
        image: user.image,
      },
    })
  } catch (error) {
    console.error("Error getting user:", error)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}