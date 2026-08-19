import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

export interface EcommerceBanner {
  id: number
  device_id: number
  category: string
  name: string
  notes: string | null
  website: string | null
  is_active: boolean
  sort_order: number
  metadata: {
    images?: Array<{ url: string }>
    imageUrl?: string
    subtitle?: string
    badgeText?: string
    ctaText?: string
    secondaryCtaText?: string
    themeColor?: string
    bannerType?: "custom" | "product_carousel"
    selectedProductIds?: number[]
    highlights?: string[]
  }
}

export async function GET() {
  try {
    const rows = await query<any>(
      `SELECT id, device_id, category, name, notes, website, is_active, sort_order, metadata
       FROM master_data
       WHERE category = 'ecommerce_banner' AND (is_active = true OR is_active IS NULL)
       ORDER BY sort_order ASC, id ASC;`
    )

    const banners: EcommerceBanner[] = rows.map((row) => {
      let parsedMetadata = row.metadata
      if (typeof parsedMetadata === "string") {
        try {
          parsedMetadata = JSON.parse(parsedMetadata)
        } catch {
          parsedMetadata = {}
        }
      }
      return {
        id: row.id,
        device_id: row.device_id ?? 1,
        category: row.category,
        name: row.name,
        notes: row.notes,
        website: row.website,
        is_active: row.is_active ?? true,
        sort_order: row.sort_order ?? 1,
        metadata: parsedMetadata || {},
      }
    })

    return NextResponse.json(banners)
  } catch (error) {
    console.error("Error fetching ecommerce banners from master_data:", error)
    return NextResponse.json(
      { error: "Failed to fetch ecommerce banners", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
