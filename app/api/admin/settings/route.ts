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

    // Update or insert each setting
    for (const setting of settings) {
      await sql`
        INSERT INTO settings (key, value, category, created_at, updated_at)
        VALUES (${setting.key}, ${setting.value}, ${setting.category || 'general'}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (key) 
        DO UPDATE SET 
          value = EXCLUDED.value,
          updated_at = CURRENT_TIMESTAMP
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
