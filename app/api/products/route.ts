/**
 * GET /api/products
 * Returns ERP products where own_ecom_status = 'active'.
 * Query params:
 *   category  – category ID (number)
 *   search    – text search
 *   page      – page number (default 1)
 *   limit     – items per page (default 24, max 96)
 *   sort      – price_asc | price_desc | newest | name | trending
 *   trending  – "true" for trending-only
 */
import { NextResponse } from "next/server"
import { getProducts } from "@/lib/services/product-service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const categoryParam = searchParams.get("category")
    const search = searchParams.get("search") ?? undefined
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
    const limit = Math.min(96, Math.max(1, parseInt(searchParams.get("limit") ?? "24", 10)))
    const sortParam = searchParams.get("sort") ?? "newest"
    const trendingOnly = searchParams.get("trending") === "true"

    const validSorts = ["price_asc", "price_desc", "newest", "name", "trending"] as const
    type SortBy = typeof validSorts[number]
    const sortBy: SortBy = validSorts.includes(sortParam as SortBy) ? (sortParam as SortBy) : "newest"

    const result = await getProducts({
      categoryId: categoryParam && !isNaN(Number(categoryParam)) ? Number(categoryParam) : undefined,
      search,
      trending: trendingOnly || undefined,
      page,
      limit,
      sortBy,
    })

    return NextResponse.json({
      items: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      filters: {
        category: categoryParam ?? "all",
        search: search ?? "",
        sort: sortBy,
      },
    })
  } catch (error) {
    console.error("[/api/products] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}