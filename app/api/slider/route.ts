import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

/**
 * Public slider endpoint
 * Returns active slides for the selected shop, ordered by sort_order
 */
export async function GET(req) {
  try {
    // Get shop from query param, default to 'A'
    const { searchParams } = new URL(req.url)
    const shop = searchParams.get("shop") || "A"

    // Fetch active slides for the selected shop
    const slides = await sql`
      SELECT * FROM slider_content 
      WHERE is_active = true AND shop = ${shop}
      ORDER BY sort_order ASC, created_at ASC
    `

    return NextResponse.json(slides)
  } catch (error) {
    console.error("Error fetching slider content:", error)
    return NextResponse.json(
      { error: "Failed to fetch slider content", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
