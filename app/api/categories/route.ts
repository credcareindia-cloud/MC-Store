/**
 * GET /api/categories
 * Returns active categories from ERP database (product_categories).
 */
import { NextResponse } from "next/server"
import { getCategories } from "@/lib/services/product-service"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error("[/api/categories] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch categories",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
