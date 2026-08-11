/**
 * GET /api/products/[id]
 * Returns a single ERP product with full variants, images, and stock.
 * Only returns if own_ecom_status = 'active'.
 */
import { NextResponse } from "next/server"
import { getProductById } from "@/lib/services/product-service"

export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10)

    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const product = await getProductById(id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("[/api/products/[id]] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch product",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
