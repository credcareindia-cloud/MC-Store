import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const aboutContent = await sql`
      SELECT * FROM about_content WHERE id = ${params.id}
    `

    if (aboutContent.length === 0) {
      return NextResponse.json({ error: "About content not found" }, { status: 404 })
    }

    return NextResponse.json(aboutContent[0])
  } catch (error) {
    console.error("Error fetching about content:", error)
    return NextResponse.json({ error: "Failed to fetch about content" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { title, subtitle, description, image_url, button_text, button_link, is_active } = body

    console.log("Received PUT data:", body)

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 })
    }

    const result = await sql`
      UPDATE about_content 
      SET 
        title = ${title},
        subtitle = ${subtitle || null},
        description = ${description},
        image_url = ${image_url || null},
        button_text = ${button_text || "Reserve a Table"},
        button_link = ${button_link || "/reservations"},
        is_active = ${is_active !== false},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "About content not found" }, { status: 404 })
    }

    console.log("Updated about content:", result[0])
    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating about content:", error)
    return NextResponse.json({ error: "Failed to update about content" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await sql`
      DELETE FROM about_content WHERE id = ${params.id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "About content not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "About content deleted successfully" })
  } catch (error) {
    console.error("Error deleting about content:", error)
    return NextResponse.json({ error: "Failed to delete about content" }, { status: 500 })
  }
}
