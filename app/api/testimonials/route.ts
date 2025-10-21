import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

/**
 * Public testimonials endpoint
 * 1. Auto-provisions the testimonials table (idempotent)
 * 2. Seeds default testimonials if table is empty
 * 3. Returns active testimonials ordered by featured status and sort order
 */
export async function GET() {
  try {
    // 1️⃣ Auto-provision table if it's missing
    await sql`
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(200) NOT NULL,
        customer_role VARCHAR(200),
        customer_avatar TEXT,
        review_text TEXT NOT NULL,
        rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
        is_featured BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    // 2️⃣ Seed default testimonials if table is empty
    const existingTestimonials = await sql`SELECT COUNT(*) as count FROM testimonials;`

    if (existingTestimonials[0].count === 0) {
      await sql`
        INSERT INTO testimonials (customer_name, customer_role, customer_avatar, review_text, rating, is_featured, is_active, sort_order) VALUES
        ('Isabella Rodriguez', 'Food Critic', '/placeholder.svg?height=80&width=80', 'Every bite at Lumière is a revelation. The flavors, presentation, and service are simply world-class. This restaurant has redefined my understanding of fine dining.', 5, true, true, 1),
        ('Daniel Kim', 'Sommelier', '/placeholder.svg?height=80&width=80', 'An exceptional wine list paired with dishes that elevate every sip—truly unparalleled. The attention to detail in both food and wine pairings is extraordinary.', 5, true, true, 2),
        ('Sophia Martinez', 'Travel Blogger', '/placeholder.svg?height=80&width=80', 'The ambiance alone is worth the visit, but the cuisine makes it an experience I''ll never forget. Every element comes together to create pure magic.', 5, true, true, 3);
      `
    }

    // 3️⃣ Fetch active testimonials
    const testimonials = await sql`
      SELECT * FROM testimonials 
      WHERE is_active = true 
      ORDER BY is_featured DESC, sort_order ASC, created_at DESC
    `

    return NextResponse.json(testimonials)
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return NextResponse.json(
      { error: "Failed to fetch testimonials", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
