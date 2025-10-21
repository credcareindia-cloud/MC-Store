import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shop = searchParams.get('shop')

    let categories
    
    if (shop && (shop === 'A' || shop === 'B')) {
      // Get categories that have products available in the specified shop
      categories = await sql`
        SELECT DISTINCT c.* 
        FROM categories c
        INNER JOIN products p ON c.id = p.category_id
        WHERE c.is_active = TRUE 
          AND (p.shop_category = ${shop} OR p.shop_category = 'Both')
        ORDER BY c.sort_order, c.name;
      `
    } else {
      // Get all active categories (default behavior)
      categories = await sql`
        SELECT * FROM categories 
        WHERE is_active = TRUE 
        ORDER BY sort_order, name;
      `
    }

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
