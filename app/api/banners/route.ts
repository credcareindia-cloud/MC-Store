import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

/**
 * Public banners endpoint
 * 1. Auto-provisions the banners table (idempotent)
 * 2. Seeds default banners if table is empty
 * 3. Returns active banners for the specified page
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "all"

    // 1️⃣ Auto-provision table if it's missing
    await sql`
      CREATE TABLE IF NOT EXISTS banners (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        banner_type VARCHAR(50) DEFAULT 'promotion',
        background_color VARCHAR(20) DEFAULT '#f59e0b',
        text_color VARCHAR(20) DEFAULT '#ffffff',
        button_text VARCHAR(100),
        button_link VARCHAR(200),
        button_color VARCHAR(20) DEFAULT '#ffffff',
        background_image_url VARCHAR(200),
        auto_disappear_seconds INTEGER DEFAULT 0,
        display_pages TEXT[] DEFAULT ARRAY['all'],
        is_active BOOLEAN DEFAULT true,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        priority INTEGER DEFAULT 0,
        is_dismissible BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    // 2️⃣ Seed default banners if table is empty
    const existingBanners = await sql`SELECT COUNT(*) as count FROM banners;`

    if (existingBanners[0].count === 0) {
      await sql`
        INSERT INTO banners (title, message, banner_type, background_color, text_color, button_text, button_link, background_image_url, auto_disappear_seconds, display_pages, is_active, priority) VALUES
        ('Grand Opening Special!', 'Join us for our grand opening celebration. Get 20% off your first order this week only!', 'promotion', '#f59e0b', '#ffffff', 'Order Now', '/menu', '', 10, ARRAY['all'], true, 1),
        ('New Menu Items', 'Discover our chef''s latest creations featuring seasonal ingredients and bold flavors.', 'announcement', '#3b82f6', '#ffffff', 'View Menu', '/menu', '', 0, ARRAY['home', 'menu'], true, 2);
      `
    }

    // 3️⃣ Fetch active banners for the specified page
    const now = new Date().toISOString()

    const banners = await sql`
      SELECT * FROM banners 
      WHERE is_active = true 
        AND (start_date IS NULL OR start_date <= ${now})
        AND (end_date IS NULL OR end_date >= ${now})
        AND ('all' = ANY(display_pages) OR ${page} = ANY(display_pages))
      ORDER BY priority DESC, created_at DESC
    `

    return NextResponse.json(banners)
  } catch (error) {
    console.error("Error fetching banners:", error)
    return NextResponse.json(
      { error: "Failed to fetch banners", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
