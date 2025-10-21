import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

// Ensure about_content table exists
async function ensureAboutTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS about_content (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        description TEXT NOT NULL,
        image_url VARCHAR(500),
        button_text VARCHAR(100) DEFAULT 'Reserve a Table',
        button_link VARCHAR(255) DEFAULT '/reservations',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Insert default content if table is empty
    const existing = await sql`SELECT COUNT(*) as count FROM about_content`
    if (Number(existing[0].count) === 0) {
      await sql`
        INSERT INTO about_content (title, subtitle, description, image_url, button_text, button_link) VALUES
        ('A Legacy of Culinary Excellence', 'Our Story', 'Founded by passionate chefs and hospitality experts, Lumière combines timeless techniques with modern innovation to deliver unforgettable dining experiences. Every ingredient is hand-selected, every plate meticulously crafted—because you deserve nothing less than perfection.

Join us for an evening of sophistication, where ambiance, service, and taste converge into a single, unforgettable memory.', '/placeholder.svg?height=800&width=800', 'Reserve a Table', '/reservations')
      `
    }
  } catch (error) {
    console.error("Error ensuring about table:", error)
  }
}

export async function GET() {
  try {
    await ensureAboutTable()
    const aboutContent = await sql`
      SELECT * FROM about_content 
      ORDER BY created_at DESC
    `
    return NextResponse.json(aboutContent)
  } catch (error) {
    console.error("Error fetching about content:", error)
    return NextResponse.json({ error: "Failed to fetch about content" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureAboutTable()
    const body = await request.json()
    const { title, subtitle, description, image_url, button_text, button_link, is_active } = body

    console.log("Received POST data:", body)

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO about_content (title, subtitle, description, image_url, button_text, button_link, is_active)
      VALUES (${title}, ${subtitle || null}, ${description}, ${image_url || null}, ${button_text || "Reserve a Table"}, ${button_link || "/reservations"}, ${is_active !== false})
      RETURNING *
    `

    console.log("Created about content:", result[0])
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating about content:", error)
    return NextResponse.json({ error: "Failed to create about content" }, { status: 500 })
  }
}
