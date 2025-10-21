import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET() {
  try {
    const categories = await sql`
      SELECT 
        id,
        name,
        description,
        image_url,
        is_active,
        is_special,
        sort_order,
        created_at,
        updated_at
      FROM categories 
      ORDER BY sort_order ASC, name ASC
    `

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { name, description, image_url, is_active, is_special, sort_order } = data

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    // If no sort_order provided, find the next available sort_order (fill gaps first)
    let finalSortOrder = sort_order
    if (finalSortOrder === undefined || finalSortOrder === null) {
      // Get all existing sort orders to find gaps
      const existingSortOrders = await sql`
        SELECT sort_order FROM categories ORDER BY sort_order ASC
      `
      
      const sortOrderNumbers = existingSortOrders.map(row => row.sort_order)
      
      // Find the first gap in the sequence, starting from 0
      let nextAvailable = 0
      for (const currentOrder of sortOrderNumbers) {
        if (currentOrder === nextAvailable) {
          nextAvailable++
        } else {
          // Found a gap, use this number
          break
        }
      }
      
      finalSortOrder = nextAvailable
    } else {
      // Check if the provided sort_order already exists
      const existingCategory = await sql`
        SELECT id FROM categories WHERE sort_order = ${finalSortOrder}
      `
      if (existingCategory.length > 0) {
        return NextResponse.json({ 
          error: `Sort order ${finalSortOrder} is already in use. Please choose a different value or leave empty for auto-assignment.` 
        }, { status: 400 })
      }
    }

    const [category] = await sql`
      INSERT INTO categories (name, description, image_url, is_active, is_special, sort_order)
      VALUES (${name}, ${description || ""}, ${image_url || ""}, ${is_active || true}, ${is_special || false}, ${finalSortOrder})
      RETURNING *
    `

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: "Failed to create category", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
