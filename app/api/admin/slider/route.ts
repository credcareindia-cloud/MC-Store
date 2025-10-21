import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET() {
  try {
    const slides = await sql`
      SELECT * FROM slider_content 
      ORDER BY sort_order ASC, created_at ASC
    `

    return NextResponse.json(slides)
  } catch (error) {
    console.error("Error fetching slider content:", error)
    return NextResponse.json(
      { error: "Failed to fetch slider content", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { title, subtitle, image_url, button_text, button_link, is_active, sort_order, shop } = data

    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "Slide title is required" }, { status: 400 })
    }

    if (!image_url || image_url.trim() === "") {
      return NextResponse.json({ error: "Slide image is required" }, { status: 400 })
    }

    const [slide] = await sql`
      INSERT INTO slider_content (title, subtitle, image_url, button_text, button_link, is_active, sort_order, shop)
      VALUES (${title}, ${subtitle || ""}, ${image_url}, ${button_text || ""}, ${button_link || ""}, ${is_active ?? true}, ${sort_order || 0}, ${shop || "A"})
      RETURNING *
    `

    return NextResponse.json(slide)
  } catch (error) {
    console.error("Error creating slider content:", error)
    return NextResponse.json(
      { error: "Failed to create slider content", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
