import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET() {
  try {
    const settings = await sql`
      SELECT * FROM settings 
      ORDER BY category, key
    `

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { settings } = await request.json()

    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: "Settings must be an array" }, { status: 400 })
    }

    // Update each setting
    for (const setting of settings) {
      await sql`
        UPDATE settings 
        SET value = ${setting.value}, updated_at = CURRENT_TIMESTAMP
        WHERE key = ${setting.key}
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      { error: "Failed to update settings", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
