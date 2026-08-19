import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET() {
  try {
    // Ensure about_content table exists
    await sql`
      CREATE TABLE IF NOT EXISTS about_content (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        description TEXT NOT NULL,
        image_url VARCHAR(500),
        button_text VARCHAR(100) DEFAULT 'Explore Spare Parts Catalog',
        button_link VARCHAR(255) DEFAULT '/products',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Update any legacy content in DB if it exists
    await sql`
      UPDATE about_content
      SET 
        title = 'Premium Vehicle Spare Parts & Accessories',
        subtitle = 'Affordable Prices, Uncompromising Quality',
        description = 'Welcome to MotoClub, your trusted destination for genuine vehicle spare parts and high-grade automotive components. We specialize in bringing you top-quality replacement parts, engine components, body fittings, and accessories at highly affordable prices.\n\nEvery part in our catalog is rigorously tested for durability, performance, and exact fit—ensuring your vehicle remains safe, reliable, and performing at its best on every road.',
        image_url = '/vehicle-spare-parts.jpg',
        button_text = 'Explore Spare Parts Catalog',
        button_link = '/products'
      WHERE title LIKE '%Culinary%' OR title LIKE '%Beauty%' OR title LIKE '%Legacy%' OR description LIKE '%skin%' OR description LIKE '%dining%' OR image_url LIKE '%unsplash%';
    `

    // Get active about content (latest first)
    const aboutContent = await sql`
      SELECT * FROM about_content 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `

    if (aboutContent.length === 0) {
      // Insert default content if none exists
      const defaultContent = await sql`
        INSERT INTO about_content (title, subtitle, description, image_url, button_text, button_link) 
        VALUES (
          'Premium Vehicle Spare Parts & Accessories', 
          'Affordable Prices, Uncompromising Quality', 
          'Welcome to MotoClub, your trusted destination for genuine vehicle spare parts and high-grade automotive components. We specialize in bringing you top-quality replacement parts, engine components, body fittings, and accessories at highly affordable prices.\n\nEvery part in our catalog is rigorously tested for durability, performance, and exact fit—ensuring your vehicle remains safe, reliable, and performing at its best on every road.', 
          '/vehicle-spare-parts.jpg', 
          'Explore Spare Parts Catalog', 
          '/products'
        )
        RETURNING *
      `
      return NextResponse.json([defaultContent[0]])
    }

    return NextResponse.json(aboutContent)
  } catch (error) {
    console.error("Error fetching about content:", error)
    return NextResponse.json({ error: "Failed to fetch about content" }, { status: 500 })
  }
}
