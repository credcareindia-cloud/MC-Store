import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET() {
  try {
    const testimonials = await sql`
      SELECT * FROM testimonials 
      ORDER BY sort_order ASC, created_at DESC
    `

    return NextResponse.json(testimonials)
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return NextResponse.json(
      { error: "Failed to fetch testimonials", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { customer_name, customer_role, customer_avatar, review_text, rating, is_featured, is_active, sort_order } =
      data

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
      INSERT INTO testimonials (customer_name, customer_role, customer_avatar, review_text, rating, is_featured, is_active, sort_order)
      VALUES (${customer_name}, ${customer_role || ""}, ${customer_avatar || ""}, ${review_text}, ${rating || 5}, ${is_featured || false}, ${is_active || true}, ${sort_order || 0})
      RETURNING *
    `

    return NextResponse.json(testimonial)
  } catch (error) {
    console.error("Error creating testimonial:", error)
    return NextResponse.json(
      { error: "Failed to create testimonial", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
