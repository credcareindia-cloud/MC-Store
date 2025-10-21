import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { ensureBannerColumns } from "@/lib/migrations/ensure-banner-columns"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await ensureBannerColumns()

    const data = await request.json()
    const id = params.id

    /* basic validation */
    if (!data.title || !data.message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 })
    }

    const [banner] = await sql`
      UPDATE banners SET
        title = ${data.title},
        message = ${data.message},
        banner_type = ${data.banner_type || "promotion"},
        background_color = ${data.background_color || "#f59e0b"},
        text_color = ${data.text_color || "#ffffff"},
        button_text = ${data.button_text || ""},
        button_link = ${data.button_link || ""},
        button_color = ${data.button_color || "#ffffff"},
        background_image_url = ${data.background_image_url || ""},
        auto_disappear_seconds = ${data.auto_disappear_seconds || 0},
        display_pages = ${data.display_pages || ["all"]},
        is_active = ${data.is_active ?? true},
        start_date = ${data.start_date || null},
        end_date = ${data.end_date || null},
        priority = ${data.priority || 0},
        is_dismissible = ${data.is_dismissible ?? true},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 })
    }

    return NextResponse.json(banner)
  } catch (error) {
    console.error("Error updating banner:", error)
    return NextResponse.json(
      { error: "Failed to update banner", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await ensureBannerColumns()
    const id = params.id

    const result = await sql`
      DELETE FROM banners
      WHERE id = ${id}
      RETURNING id
    `
    if (result.length === 0) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting banner:", error)
    return NextResponse.json(
      { error: "Failed to delete banner", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
