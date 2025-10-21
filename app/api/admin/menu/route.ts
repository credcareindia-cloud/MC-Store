import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET() {
  try {
    const menuItems = await sql`
      SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY c.sort_order, c.name, p.name
    `

    return NextResponse.json(menuItems)
  } catch (error) {
    console.error("Error fetching menu items:", error)
    return NextResponse.json(
      { error: "Failed to fetch menu items", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const {
      name,
      description,
      price,
      image_url,
      category_id,
      is_available,
      is_featured,
      ingredients,
      allergens,
      preparation_time,
    } = data

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Menu item name is required" }, { status: 400 })
    }

    if (!price || price <= 0) {
      return NextResponse.json({ error: "Valid price is required" }, { status: 400 })
    }

    if (!category_id) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 })
    }

    const [menuItem] = await sql`
      INSERT INTO menu_items (
        name, description, price, image_url, category_id, 
        is_available, is_featured, ingredients, allergens, preparation_time
      )
      VALUES (
        ${name}, ${description || ""}, ${price}, ${image_url || ""}, ${category_id},
        ${is_available || true}, ${is_featured || false}, ${ingredients || []}, 
        ${allergens || []}, ${preparation_time || 0}
      )
      RETURNING *
    `

    return NextResponse.json(menuItem)
  } catch (error) {
    console.error("Error creating menu item:", error)
    return NextResponse.json(
      { error: "Failed to create menu item", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
