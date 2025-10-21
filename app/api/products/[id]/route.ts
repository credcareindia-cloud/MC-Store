// app/api/admin/products/[id]/route.ts
import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id)
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      )
    }

    const result = await sql`
      SELECT
        p.*,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ${productId}
      LIMIT 1;
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ product: result[0] })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Failed to fetch product", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
