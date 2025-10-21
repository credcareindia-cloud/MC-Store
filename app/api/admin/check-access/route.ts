import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const accessCookie = request.cookies.get("admin_access_verified")?.value

    if (accessCookie === "true") {
      return NextResponse.json({ success: true, message: "Access verified" })
    } else {
      return NextResponse.json(
        { success: false, message: "Access not verified" },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error("Admin access check error:", error)
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    )
  }
}
