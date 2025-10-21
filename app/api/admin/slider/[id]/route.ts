import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const { title, subtitle, image_url, button_text, button_link, is_active, sort_order, shop } = data
    const id = params.id

    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "Slide title is required" }, { status: 400 })
    }

    if (!image_url || image_url.trim() === "") {
      return NextResponse.json({ error: "Slide image is required" }, { status: 400 })
    }

    const [slide] = await sql`
      UPDATE slider_content 
      SET 
        title = ${title},
        subtitle = ${subtitle || ""},
        image_url = ${image_url},
        button_text = ${button_text || ""},
        button_link = ${button_link || ""},
        is_active = ${is_active ?? true},
        sort_order = ${sort_order || 0},
        shop = ${shop || "A"},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    if (!slide) {
      return NextResponse.json({ error: "Slide not found" }, { status: 404 })
    }

    return NextResponse.json(slide)
  } catch (error) {
    console.error("Error updating slider content:", error)
    return NextResponse.json(
      { error: "Failed to update slider content", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const result = await sql`DELETE FROM slider_content WHERE id = ${id} RETURNING id`

    if (result.length === 0) {
      return NextResponse.json({ error: "Slide not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting slider content:", error)
    return NextResponse.json(
      { error: "Failed to delete slider content", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
