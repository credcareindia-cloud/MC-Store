/**
 * GET /api/store/trending-products
 *
 * Returns ERP trending products ranked by sales activity and filtered by inventory & active status.
 * Query params:
 *   limit - max number of products to return (default 8, max 24)
 */

import { NextResponse } from "next/server"
import { getTrendingProducts } from "@/lib/services/product-service"

export const dynamic = "force-dynamic"

function slugify(text: string, id: number): string {
  if (!text) return String(id)
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return slug || String(id)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get("limit")
    const limit = Math.min(24, Math.max(1, parseInt(limitParam ?? "8", 10)))

    const rawProducts = await getTrendingProducts(limit)

    // Format products for standard API response schema
    const products = rawProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: slugify(p.name, p.id),
      price: p.price,
      price_aed: p.price_aed,
      price_inr: p.price_inr,
      image: p.image_url ?? p.image_urls?.[0] ?? null,
      image_url: p.image_url ?? p.image_urls?.[0] ?? null,
      image_urls: p.image_urls,
      stock: p.stock_quantity ?? p.total_stock ?? 0,
      stock_quantity: p.stock_quantity ?? p.total_stock ?? 0,
      category: p.category_name ?? "General",
      category_name: p.category_name ?? "General",
      category_id: p.category_id,
      brand: p.brand ?? "",
      is_available: (p.stock_quantity ?? p.total_stock ?? 0) > 0,
      variants: p.variants ?? []
    }))

    return NextResponse.json(
      { products },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"
        }
      }
    )
  } catch (error) {
    console.error("[/api/store/trending-products] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch trending products",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
