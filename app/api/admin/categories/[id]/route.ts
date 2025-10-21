import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const { name, description, image_url, is_active, is_special, sort_order } = data
    const id = params.id

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    // Only update sort_order if explicitly provided, otherwise keep existing value
    let category
    if (sort_order !== undefined && sort_order !== null) {
      // Check if the provided sort_order already exists (excluding current category)
      const existingCategory = await sql`
        SELECT id FROM categories WHERE sort_order = ${sort_order} AND id != ${id}
      `
      if (existingCategory.length > 0) {
        return NextResponse.json({ 
          error: `Sort order ${sort_order} is already in use by another category. Please choose a different value.` 
        }, { status: 400 })
      }
      [category] = await sql`
        UPDATE categories 
        SET 
          name = ${name}, 
          description = ${description || ""}, 
          image_url = ${image_url || ""}, 
          is_active = ${is_active !== undefined ? is_active : true}, 
          is_special = ${is_special !== undefined ? is_special : false}, 
          sort_order = ${sort_order},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `
    } else {
      [category] = await sql`
        UPDATE categories 
        SET 
          name = ${name}, 
          description = ${description || ""}, 
          image_url = ${image_url || ""}, 
          is_active = ${is_active !== undefined ? is_active : true}, 
          is_special = ${is_special !== undefined ? is_special : false}, 
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `
    }

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json(
      { error: "Failed to update category", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const productItems = await sql`
      SELECT COUNT(*) as count FROM products WHERE category_id = ${id}
    `

    if (productItems[0].count > 0) {
      return NextResponse.json({ error: "Cannot delete category with existing Products" }, { status: 400 })
    }

    const result = await sql`DELETE FROM categories WHERE id = ${id} RETURNING id`

    if (result.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: "Failed to delete category", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
