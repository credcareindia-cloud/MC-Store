import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const { customer_name, customer_role, customer_avatar, review_text, rating, is_featured, is_active, sort_order } =
      data
    const id = params.id

    if (!customer_name || customer_name.trim() === "") {
      return NextResponse.json({ error: "Customer name is required" }, { status: 400 })
    }

    if (!review_text || review_text.trim() === "") {
      return NextResponse.json({ error: "Review text is required" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const [testimonial] = await sql`
      UPDATE testimonials 
      SET 
        customer_name = ${customer_name},
        customer_role = ${customer_role || ""},
        customer_avatar = ${customer_avatar || ""},
        review_text = ${review_text},
        rating = ${rating || 5},
        is_featured = ${is_featured || false},
        is_active = ${is_active || true},
        sort_order = ${sort_order || 0},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 })
    }

    return NextResponse.json(testimonial)
  } catch (error) {
    console.error("Error updating testimonial:", error)
    return NextResponse.json(
      { error: "Failed to update testimonial", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const result = await sql`DELETE FROM testimonials WHERE id = ${id} RETURNING id`

    if (result.length === 0) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting testimonial:", error)
    return NextResponse.json(
      { error: "Failed to delete testimonial", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
