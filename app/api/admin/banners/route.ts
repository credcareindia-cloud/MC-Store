import { NextResponse } from "next/server"
import { z } from "zod"
import { sql } from "@/lib/database"
import { ensureBannerColumns } from "@/lib/migrations/ensure-banner-columns"

/* ---------- helpers ---------- */
const bannerSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  banner_type: z.enum(["promotion", "announcement", "warning", "info"]).default("promotion"),
  background_color: z.string().default("#f59e0b"),
  text_color: z.string().default("#ffffff"),
  button_text: z.string().optional().default(""),
  button_link: z.string().optional().default(""),
  button_color: z.string().default("#ffffff"),
  background_image_url: z.string().optional().default(""),
  auto_disappear_seconds: z.coerce.number().int().nonnegative().default(0),
  display_pages: z.array(z.string()).default(["all"]),
  is_active: z.boolean().default(true),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  priority: z.coerce.number().int().default(0),
  is_dismissible: z.boolean().default(true),
})

/* ---------- GET (list) ---------- */
export async function GET() {
  try {
    await ensureBannerColumns()

    const banners = await sql`
      SELECT *
      FROM banners
      ORDER BY priority DESC, created_at DESC
    `

    return NextResponse.json(banners)
  } catch (error) {
    console.error("Error fetching banners:", error)
    return NextResponse.json(
      { error: "Failed to fetch banners", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

/* ---------- POST (create) ---------- */
export async function POST(request: Request) {
  try {
    await ensureBannerColumns()

    const body = await request.json()
    const parse = bannerSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json({ error: "Invalid data", issues: parse.error.flatten() }, { status: 400 })
    }
    const data = parse.data

    const [banner] = await sql`
      INSERT INTO banners (
        title, message, banner_type, background_color, text_color,
        button_text, button_link, button_color,
        background_image_url, auto_disappear_seconds,
        display_pages, is_active,
        start_date, end_date,
        priority, is_dismissible
      ) VALUES (
        ${data.title}, ${data.message}, ${data.banner_type},
        ${data.background_color}, ${data.text_color},
        ${data.button_text}, ${data.button_link}, ${data.button_color},
        ${data.background_image_url}, ${data.auto_disappear_seconds},
        ${data.display_pages}, ${data.is_active},
        ${data.start_date}, ${data.end_date},
        ${data.priority}, ${data.is_dismissible}
      )
      RETURNING *
    `

    return NextResponse.json(banner)
  } catch (error) {
    console.error("Error creating banner:", error)
    return NextResponse.json(
      { error: "Failed to create banner", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
