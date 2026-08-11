/**
 * GET /api/products/search
 * Rewritten search API using server-side product-service.
 * Reads from ERP products where own_ecom_status = 'active'.
 */
import { NextResponse } from "next/server"
import { searchProducts } from "@/lib/services/product-service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")?.trim()
    const categoryParam = searchParams.get("category")
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "24", 10)))

    if (!query || query.length < 2) {
      return NextResponse.json({
        items: [],
        total: 0,
        query: query || "",
        suggestions: [],
      })
    }

    const categoryId = categoryParam && !isNaN(Number(categoryParam)) ? Number(categoryParam) : null

    const result = await searchProducts(query, {
      categoryId,
      limit,
    })

    return NextResponse.json({
      items: result.items,
      total: result.total,
      query: result.query,
      suggestions: [], // Simple placeholder or dynamic suggestions could be added if needed
    })
  } catch (error) {
    console.error("[/api/products/search] Error:", error)
    return NextResponse.json(
      {
        error: "Search failed",
        details: error instanceof Error ? error.message : String(error),
        items: [],
        total: 0,
        query: "",
        suggestions: [],
      },
      { status: 500 }
    )
  }
}