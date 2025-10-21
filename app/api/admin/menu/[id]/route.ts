import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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
    const id = params.id

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Menu item name is required" }, { status: 400 })
    }

    if (!price || price <= 0) {
      return NextResponse.json({ error: "Valid price is required" }, { status: 400 })
    }

    const [menuItem] = await sql`
      UPDATE menu_items 
      SET 
        name = ${name},
        description = ${description || ""},
        price = ${price},
        image_url = ${image_url || ""},
        category_id = ${category_id},
        is_available = ${is_available || true},
        is_featured = ${is_featured || false},
        ingredients = ${ingredients || []},
        allergens = ${allergens || []},
        preparation_time = ${preparation_time || 0},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    if (!menuItem) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
    }

    return NextResponse.json(menuItem)
  } catch (error) {
    console.error("Error updating menu item:", error)
    return NextResponse.json(
      { error: "Failed to update menu item", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const result = await sql`DELETE FROM menu_items WHERE id = ${id} RETURNING id`

    if (result.length === 0) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting menu item:", error)
    return NextResponse.json(
      { error: "Failed to delete menu item", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
