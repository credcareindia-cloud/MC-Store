import { NextRequest, NextResponse } from "next/server"
import { isValidAdminAccess } from "@/lib/admin-config"

export async function POST(request: NextRequest) {
  try {
    const { secretKey } = await request.json()

    if (!secretKey) {
      return NextResponse.json(
        { success: false, message: "Secret key is required" },
        { status: 400 }
      )
    }

    const isValid = isValidAdminAccess(secretKey)

    if (isValid) {
      // Set a temporary access cookie (valid for 1 hour)
      const response = NextResponse.json({ success: true, message: "Access granted" })
      response.cookies.set("admin_access_verified", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 3600 // 1 hour
      })
      return response
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid access key" },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error("Admin access verification error:", error)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
