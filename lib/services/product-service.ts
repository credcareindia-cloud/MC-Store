/**
 * lib/services/product-service.ts
 *
 * Server-side ONLY service for reading products from the ERP database.
 * - Never import this in client components or pages marked "use client".
 * - All access is READ-ONLY. No writes to ERP tables.
 * - Single source of truth: the ERP PostgreSQL database (ecommerce_db).
 *
 * Filter policy:
 *   products.own_ecom_status != 'not_listed' (or 'active' / NULL / default) -> published online
 *   products.own_ecom_status = 'not_listed' -> unlisted from ecommerce store
 *
 * ERP Schema mapping:
 *   products.own_ecom_status = 'active'  → published online
 *   products.price                       → selling price (INR)
 *   product_variants.mrp                 → compare-at / original price
 *   product_categories                   → category table (NOT old `categories`)
 *   product_device_stock SUM(stock)      → live inventory
 */

import { query } from "@/lib/db"

// ── Types ────────────────────────────────────────────────────────────────────

export interface ErpCategory {
  id: number
  name: string
  parent_id: number | null
  description: string | null
  product_count: number
}

export interface ErpVariant {
  id: number
  product_id: number
  name: string
  sku: string | null
  barcode: string | null
  color: string | null
  size: string | null
  price: number          // selling price
  mrp: number | null     // compare-at (MRP)
  msp: number | null     // minimum selling price
  cost_price: number | null
  image_url: string | null
  image_urls: string[]
  attributes: Record<string, unknown>
  status: string         // 'active' | other
  stock: number          // total stock across all devices
}

export interface ErpProduct {
  id: number
  name: string
  category: string | null
  category_id: number | null
  description: string | null
  price: number          // selling price
  msp: number | null     // min selling price
  barcode: string | null
  company_name: string | null
  color: string | null
  size: string | null
  attributes: Record<string, unknown>
  image_url: string | null
  image_urls: string[]
  video_url: string | null
  trending: boolean
  has_variants: boolean
  own_ecom_status: string   // 'active' | 'not_listed'
  created_at: string
  updated_at: string
  // Computed / joined
  category_name: string | null
  total_stock: number
  variants: ErpVariant[]
  avg_rating?: number
  total_reviews?: number
}

export interface ProductFilters {
  categoryId?: number | null
  search?: string
  trending?: boolean
  page?: number
  limit?: number
  sortBy?: "price_asc" | "price_desc" | "newest" | "name" | "trending"
}

export interface ProductListResult {
  items: ErpProduct[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ── Helper: parse JSONB image_urls safely ────────────────────────────────────

function parseImageUrls(raw: unknown): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter((u): u is string => typeof u === "string" && u.length > 0)
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.filter((u): u is string => typeof u === "string")
    } catch { /* ignore */ }
  }
  return []
}

function parseAttributes(raw: unknown): Record<string, unknown> {
  if (!raw) return {}
  if (typeof raw === "object" && !Array.isArray(raw)) return raw as Record<string, unknown>
  if (typeof raw === "string") {
    try { return JSON.parse(raw) } catch { /* ignore */ }
  }
  return {}
}

function toNumber(val: unknown): number {
  if (val === null || val === undefined || val === "") return 0
  const n = Number(val)
  return isNaN(n) ? 0 : n
}

function mapVariant(row: Record<string, unknown>): any {
  const price = toNumber(row.price)
  const mrp = row.mrp !== null && row.mrp !== undefined ? toNumber(row.mrp) : price
  const stock = toNumber(row.stock)
  const status = String(row.status ?? "active")
  
  return {
    id: toNumber(row.id),
    product_id: toNumber(row.product_id),
    name: String(row.name ?? "Default"),
    sku: row.sku as string | null ?? null,
    barcode: row.barcode as string | null ?? null,
    color: row.color as string | null ?? null,
    size: row.size as string | null ?? null,
    price: price,
    mrp: mrp,
    msp: row.msp !== null && row.msp !== undefined ? toNumber(row.msp) : null,
    cost_price: row.cost_price !== null ? toNumber(row.cost_price) : null,
    image_url: typeof row.image_url === "string" && row.image_url.trim() !== "" ? row.image_url.trim() : null,
    image_urls: parseImageUrls(row.image_urls),
    attributes: parseAttributes(row.attributes),
    status: status,
    stock: stock,
    
    // Front-end compatibility properties:
    price_inr: mrp,
    discount_inr: price,
    price_aed: parseFloat((mrp / 22.5).toFixed(2)),
    discount_aed: parseFloat((price / 22.5).toFixed(2)),
    available_inr: status === "active",
    available_aed: status === "active",
    stock_quantity: stock
  }
}

function mapProduct(row: Record<string, unknown>, variants: any[] = []): any {
  const id = toNumber(row.id)
  const price = toNumber(row.price)
  const msp = row.msp !== null ? toNumber(row.msp) : null
  const totalStock = toNumber(row.total_stock)
  const image_urls = parseImageUrls(row.image_urls)
  
  const raw_image = typeof row.image_url === "string" ? row.image_url.trim() : null
  const main_image = (raw_image && raw_image !== "") ? raw_image : (image_urls[0] ?? null)
  
  // Parse features and specs from attributes
  const attrs = parseAttributes(row.attributes)
  const features = Array.isArray(attrs.features) ? attrs.features : []
  const specs = typeof attrs.specifications === "string" ? attrs.specifications : ""
  
  let mappedVariants = variants.map(v => mapVariant(v))
  if (mappedVariants.length === 0) {
    // Synthesise default variant
    mappedVariants = [{
      id: id,
      product_id: id,
      name: "Default",
      sku: row.barcode as string | null ?? "",
      barcode: row.barcode as string | null ?? "",
      color: row.color as string | null ?? "",
      size: row.size as string | null ?? "",
      price: price,
      mrp: price,
      msp: msp,
      cost_price: null,
      image_url: main_image,
      image_urls: image_urls,
      attributes: {},
      status: "active",
      stock: totalStock,
      
      // Frontend compatibility:
      price_inr: price,
      discount_inr: price,
      price_aed: parseFloat((price / 22.5).toFixed(2)),
      discount_aed: parseFloat((price / 22.5).toFixed(2)),
      available_inr: true,
      available_aed: true,
      stock_quantity: totalStock
    }]
  }

  const firstVariant = mappedVariants[0]
  const mrp = firstVariant?.mrp ?? price
  const mrp_inr = firstVariant?.price_inr ?? mrp
  const mrp_aed = firstVariant?.price_aed ?? parseFloat((mrp / 22.5).toFixed(2))

  return {
    id: id,
    name: String(row.name ?? ""),
    description: row.description as string | null ?? "",
    price: price,
    price_aed: parseFloat((price / 22.5).toFixed(2)),
    price_inr: price,
    mrp: mrp,
    mrp_inr: mrp_inr,
    mrp_aed: mrp_aed,
    primary_currency: "INR",
    image_url: main_image,
    image_urls: image_urls.length > 0 ? image_urls : (main_image ? [main_image] : []),
    category_id: row.category_id !== null ? toNumber(row.category_id) : null,
    category_name: row.category_name as string | null ?? row.category as string | null ?? "Common",
    is_available: totalStock > 0,
    is_featured: Boolean(row.trending),
    is_new: true, // Mark all listed active products as new
    features: features,
    specifications_text: specs,
    warranty_months: 0,
    brand: row.company_name as string | null ?? "",
    model: "",
    condition_type: "none",
    shop_category: "Both",
    stock_quantity: totalStock,
    sku: row.barcode as string | null ?? "",
    variants: mappedVariants,
    own_ecom_status: String(row.own_ecom_status ?? "active"),
    created_at: row.created_at ? new Date(row.created_at as string).toISOString() : new Date().toISOString(),
    updated_at: row.updated_at ? new Date(row.updated_at as string).toISOString() : new Date().toISOString(),
    total_stock: totalStock
  }
}
export const PRODUCT_ELIGIBILITY_SQL = `
  (p.own_ecom_status IS NULL OR p.own_ecom_status != 'not_listed')
  AND p.price > 0
  AND (
    (p.image_url IS NOT NULL AND TRIM(p.image_url) != '' AND p.image_url NOT IN ('[]', 'null', '"[]"', '"null"') AND p.image_url LIKE '%/%')
    OR (p.image_urls IS NOT NULL AND p.image_urls::text NOT IN ('[]', 'null', '"[]"', '"null"') AND TRIM(p.image_urls::text) != '' AND p.image_urls::text LIKE '%/%')
  )
`

// ── Category Service ─────────────────────────────────────────────────────────

export async function getCategories(): Promise<ErpCategory[]> {
  const filterPart = `AND ${PRODUCT_ELIGIBILITY_SQL}`

  const rows = await query<Record<string, unknown>>(`
    SELECT 
      pc.id,
      pc.name,
      pc.parent_id,
      pc.description,
      COUNT(p.id)::int AS product_count
    FROM product_categories pc
    LEFT JOIN products p 
      ON p.category_id = pc.id 
      ${filterPart}
    GROUP BY pc.id, pc.name, pc.parent_id, pc.description
    HAVING COUNT(p.id) > 0
    ORDER BY COUNT(p.id) DESC, pc.name ASC
  `)

  return rows.map(r => ({
    id: toNumber(r.id),
    name: String(r.name ?? ""),
    parent_id: r.parent_id !== null ? toNumber(r.parent_id) : null,
    description: r.description as string | null ?? null,
    product_count: toNumber(r.product_count),
  }))
}

// ── Product List Service ──────────────────────────────────────────────────────

// ── Fast In-Memory Cache ───────────────────────────────────────────────────
interface CacheEntry {
  data: ProductListResult
  timestamp: number
}
const productCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 15000 // 15 seconds fast cache

export async function getProducts(filters: ProductFilters = {}): Promise<ProductListResult> {
  const {
    categoryId,
    search,
    trending,
    page = 1,
    limit = 24,
    sortBy = "newest",
  } = filters

  const cacheKey = JSON.stringify({ categoryId, search, trending, page, limit, sortBy })
  const cached = productCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }

  const offset = (Math.max(1, page) - 1) * limit
  const params: unknown[] = []
  
  const conditions: string[] = [PRODUCT_ELIGIBILITY_SQL]

  if (categoryId != null) {
    params.push(categoryId)
    conditions.push(`p.category_id = $${params.length}`)
  }

  if (trending) {
    conditions.push(`p.trending = TRUE`)
  }

  if (search && search.trim().length >= 2) {
    const term = `%${search.trim().toLowerCase()}%`
    params.push(term)
    conditions.push(`(
      LOWER(p.name) LIKE $${params.length}
      OR LOWER(p.description) LIKE $${params.length}
      OR LOWER(p.category) LIKE $${params.length}
      OR LOWER(p.barcode) LIKE $${params.length}
    )`)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ''

  const orderMap: Record<string, string> = {
    price_asc:  "p.price ASC",
    price_desc: "p.price DESC",
    newest:     "p.created_at DESC",
    name:       "p.name ASC",
    trending:   "p.trending DESC, p.created_at DESC",
  }
  const orderBy = orderMap[sortBy] ?? "p.created_at DESC"

  // Count
  const countRows = await query<{ total: string }>(
    `SELECT COUNT(*)::text AS total FROM products p ${where}`,
    params
  )
  const total = parseInt(countRows[0]?.total ?? "0", 10)

  // Products with stock (optimized fast query)
  params.push(limit, offset)
  const productRows = await query<Record<string, unknown>>(`
    SELECT 
      p.*,
      pc.name AS category_name,
      COALESCE(
        (SELECT SUM(GREATEST(0, pds.stock))::int FROM product_device_stock pds WHERE pds.product_id = p.id),
        (SELECT SUM(GREATEST(0, pb.remaining_quantity))::int FROM product_batches pb WHERE pb.product_id = p.id),
        10
      )::int AS total_stock
    FROM products p
    LEFT JOIN product_categories pc ON pc.id = p.category_id
    ${where}
    ORDER BY ${orderBy}
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `, params)

  // For products with variants, fetch variants in a single batch query
  const productIds = productRows.map(r => toNumber(r.id))
  const variantMap = await batchGetVariants(productIds)

  const items = productRows.map(row => mapProduct(row, variantMap[toNumber(row.id)] ?? []))

  const result: ProductListResult = {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }

  // Save to fast cache
  productCache.set(cacheKey, { data: result, timestamp: Date.now() })
  return result
}

// ── Batch variant fetch ───────────────────────────────────────────────────────

async function batchGetVariants(productIds: number[]): Promise<Record<number, ErpVariant[]>> {
  if (productIds.length === 0) return {}

  const variantRows = await query<Record<string, unknown>>(`
    SELECT 
      pv.*,
      (
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM product_batches pb 
            JOIN product_batch_device_stock pbds ON pbds.batch_id = pb.id 
            WHERE pb.product_variant_id = pv.id
          ) THEN (
            SELECT COALESCE(SUM(GREATEST(0, pbds.stock))::int, 0)
            FROM product_batches pb 
            JOIN product_batch_device_stock pbds ON pbds.batch_id = pb.id 
            WHERE pb.product_variant_id = pv.id
          )
          WHEN EXISTS (
            SELECT 1 FROM product_batches pb 
            WHERE pb.product_variant_id = pv.id
          ) THEN (
            SELECT COALESCE(SUM(GREATEST(0, pb.remaining_quantity))::int, 0)
            FROM product_batches pb 
            WHERE pb.product_variant_id = pv.id
          )
          ELSE (
            SELECT COALESCE(SUM(GREATEST(0, pds.stock))::int, 0)
            FROM product_device_stock pds 
            WHERE pds.product_id = pv.product_id
          )
        END
      )::int AS stock
    FROM product_variants pv
    WHERE pv.product_id = ANY($1::int[])
      AND (pv.status IS NULL OR pv.status = 'active')
    ORDER BY pv.id
  `, [productIds])

  const map: Record<number, ErpVariant[]> = {}
  for (const row of variantRows) {
    const pid = toNumber(row.product_id)
    if (!map[pid]) map[pid] = []
    map[pid].push(mapVariant(row))
  }
  return map
}

// ── Single Product Service ────────────────────────────────────────────────────

let _reviewsTableCreated = false
async function ensureReviewsTableExists() {
  if (_reviewsTableCreated) return
  await query(`
    CREATE TABLE IF NOT EXISTS product_reviews (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      user_id VARCHAR(255) NOT NULL,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
      review TEXT NOT NULL,
      customer_name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_user_product_order_review ON product_reviews(user_id, product_id, order_id);
  `)
  _reviewsTableCreated = true
}

export async function getProductById(id: number): Promise<ErpProduct | null> {
  const filterPart = `AND ${PRODUCT_ELIGIBILITY_SQL}`

  const rows = await query<Record<string, unknown>>(`
    SELECT 
      p.*,
      pc.name AS category_name,
      (
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM product_batches pb 
            JOIN product_batch_device_stock pbds ON pbds.batch_id = pb.id 
            WHERE pb.product_id = p.id OR pb.product_variant_id IN (SELECT id FROM product_variants WHERE product_id = p.id)
          ) THEN (
            SELECT COALESCE(SUM(GREATEST(0, pbds.stock))::int, 0)
            FROM product_batches pb 
            JOIN product_batch_device_stock pbds ON pbds.batch_id = pb.id 
            WHERE pb.product_id = p.id OR pb.product_variant_id IN (SELECT id FROM product_variants WHERE product_id = p.id)
          )
          WHEN EXISTS (
            SELECT 1 FROM product_batches pb 
            WHERE pb.product_id = p.id OR pb.product_variant_id IN (SELECT id FROM product_variants WHERE product_id = p.id)
          ) THEN (
            SELECT COALESCE(SUM(GREATEST(0, pb.remaining_quantity))::int, 0)
            FROM product_batches pb 
            WHERE pb.product_id = p.id OR pb.product_variant_id IN (SELECT id FROM product_variants WHERE product_id = p.id)
          )
          ELSE (
            SELECT COALESCE(SUM(GREATEST(0, pds.stock))::int, 0)
            FROM product_device_stock pds 
            WHERE pds.product_id = p.id
          )
        END
      )::int AS total_stock
    FROM products p
    LEFT JOIN product_categories pc ON pc.id = p.category_id
    WHERE p.id = $1 ${filterPart}
    LIMIT 1
  `, [id])

  if (rows.length === 0) return null

  const variantRows = await query<Record<string, unknown>>(`
    SELECT 
      pv.*,
      (
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM product_batches pb 
            JOIN product_batch_device_stock pbds ON pbds.batch_id = pb.id 
            WHERE pb.product_variant_id = pv.id
          ) THEN (
            SELECT COALESCE(SUM(GREATEST(0, pbds.stock))::int, 0)
            FROM product_batches pb 
            JOIN product_batch_device_stock pbds ON pbds.batch_id = pb.id 
            WHERE pb.product_variant_id = pv.id
          )
          WHEN EXISTS (
            SELECT 1 FROM product_batches pb 
            WHERE pb.product_variant_id = pv.id
          ) THEN (
            SELECT COALESCE(SUM(GREATEST(0, pb.remaining_quantity))::int, 0)
            FROM product_batches pb 
            WHERE pb.product_variant_id = pv.id
          )
          ELSE (
            SELECT COALESCE(SUM(GREATEST(0, pds.stock))::int, 0)
            FROM product_device_stock pds 
            WHERE pds.product_id = pv.product_id
          )
        END
      )::int AS stock
    FROM product_variants pv
    WHERE pv.product_id = $1
      AND (pv.status IS NULL OR pv.status = 'active')
    ORDER BY pv.id
  `, [id])

  const variants = variantRows.map(mapVariant)
  
  await ensureReviewsTableExists()
  const statsRes = await query<Record<string, unknown>>(`
    SELECT 
      COALESCE(AVG(rating), 0)::float AS avg_rating,
      COUNT(*)::int AS total_reviews
    FROM product_reviews
    WHERE product_id = $1
  `, [id])

  const avgRating = statsRes[0] ? toNumber(statsRes[0].avg_rating) : 0
  const totalReviews = statsRes[0] ? toNumber(statsRes[0].total_reviews) : 0

  const productData = mapProduct(rows[0], variants)
  productData.avg_rating = avgRating
  productData.total_reviews = totalReviews
  return productData
}

// ── Related Products ──────────────────────────────────────────────────────────

export async function getRelatedProducts(categoryId: number | null, excludeId: number, limit = 8): Promise<ErpProduct[]> {
  if (categoryId == null) return []
  const filterPart = `AND ${PRODUCT_ELIGIBILITY_SQL}`

  const rows = await query<Record<string, unknown>>(`
    SELECT 
      p.*,
      pc.name AS category_name,
      (
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM product_batches pb 
            JOIN product_batch_device_stock pbds ON pbds.batch_id = pb.id 
            WHERE pb.product_id = p.id OR pb.product_variant_id IN (SELECT id FROM product_variants WHERE product_id = p.id)
          ) THEN (
            SELECT COALESCE(SUM(GREATEST(0, pbds.stock))::int, 0)
            FROM product_batches pb 
            JOIN product_batch_device_stock pbds ON pbds.batch_id = pb.id 
            WHERE pb.product_id = p.id OR pb.product_variant_id IN (SELECT id FROM product_variants WHERE product_id = p.id)
          )
          WHEN EXISTS (
            SELECT 1 FROM product_batches pb 
            WHERE pb.product_id = p.id OR pb.product_variant_id IN (SELECT id FROM product_variants WHERE product_id = p.id)
          ) THEN (
            SELECT COALESCE(SUM(GREATEST(0, pb.remaining_quantity))::int, 0)
            FROM product_batches pb 
            WHERE pb.product_id = p.id OR pb.product_variant_id IN (SELECT id FROM product_variants WHERE product_id = p.id)
          )
          ELSE (
            SELECT COALESCE(SUM(GREATEST(0, pds.stock))::int, 0)
            FROM product_device_stock pds 
            WHERE pds.product_id = p.id
          )
        END
      )::int AS total_stock
    FROM products p
    LEFT JOIN product_categories pc ON pc.id = p.category_id
    WHERE p.category_id = $1
      AND p.id != $2
      ${filterPart}
    ORDER BY p.trending DESC, RANDOM()
    LIMIT $3
  `, [categoryId, excludeId, limit])

  const productIds = rows.map(r => toNumber(r.id))
  const variantMap = await batchGetVariants(productIds)
  return rows.map(row => mapProduct(row, variantMap[toNumber(row.id)] ?? []))
}

// ── Search Service ────────────────────────────────────────────────────────────

export interface SearchResult {
  items: ErpProduct[]
  total: number
  query: string
}

export async function searchProducts(
  searchQuery: string,
  filters: { categoryId?: number | null; limit?: number } = {}
): Promise<SearchResult> {
  const { categoryId, limit = 48 } = filters
  const rawTerm = searchQuery.trim().toLowerCase()

  if (rawTerm.length < 2) return { items: [], total: 0, query: searchQuery }

  const words = rawTerm.split(/\s+/).filter(w => w.length > 0)
  const fullLike = `%${rawTerm}%`

  const params: unknown[] = [fullLike]
  const conditions: string[] = [PRODUCT_ELIGIBILITY_SQL]

  if (categoryId != null) {
    params.push(categoryId)
    conditions.push(`p.category_id = $${params.length}`)
  }

  // Require matching all search words across fields
  words.forEach((word) => {
    params.push(`%${word}%`)
    const idx = params.length
    conditions.push(`(
      LOWER(p.name) LIKE $${idx}
      OR LOWER(p.description) LIKE $${idx}
      OR LOWER(p.category) LIKE $${idx}
      OR LOWER(p.barcode) LIKE $${idx}
      OR LOWER(p.company_name) LIKE $${idx}
      OR LOWER(p.color) LIKE $${idx}
      OR LOWER(pc.name) LIKE $${idx}
      OR EXISTS (
        SELECT 1 FROM product_variants pv 
        WHERE pv.product_id = p.id 
          AND (LOWER(pv.name) LIKE $${idx} OR LOWER(pv.sku) LIKE $${idx} OR LOWER(pv.barcode) LIKE $${idx})
      )
    )`)
  })

  params.push(limit)
  const limitIdx = params.length
  const where = `WHERE ${conditions.join(" AND ")}`

  const rows = await query<Record<string, unknown>>(`
    SELECT 
      p.*,
      pc.name AS category_name,
      (
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM product_batches pb 
            JOIN product_batch_device_stock pbds ON pbds.batch_id = pb.id 
            WHERE pb.product_id = p.id OR pb.product_variant_id IN (SELECT id FROM product_variants WHERE product_id = p.id)
          ) THEN (
            SELECT COALESCE(SUM(GREATEST(0, pbds.stock))::int, 0)
            FROM product_batches pb 
            JOIN product_batch_device_stock pbds ON pbds.batch_id = pb.id 
            WHERE pb.product_id = p.id OR pb.product_variant_id IN (SELECT id FROM product_variants WHERE product_id = p.id)
          )
          WHEN EXISTS (
            SELECT 1 FROM product_batches pb 
            WHERE pb.product_id = p.id OR pb.product_variant_id IN (SELECT id FROM product_variants WHERE product_id = p.id)
          ) THEN (
            SELECT COALESCE(SUM(GREATEST(0, pb.remaining_quantity))::int, 0)
            FROM product_batches pb 
            WHERE pb.product_id = p.id OR pb.product_variant_id IN (SELECT id FROM product_variants WHERE product_id = p.id)
          )
          ELSE (
            SELECT COALESCE(SUM(GREATEST(0, pds.stock))::int, 0)
            FROM product_device_stock pds 
            WHERE pds.product_id = p.id
          )
        END
      )::int AS total_stock,
      (
        CASE WHEN LOWER(p.name) LIKE $1 THEN 200 ELSE 0 END +
        CASE WHEN LOWER(pc.name) LIKE $1 THEN 100 ELSE 0 END +
        CASE WHEN LOWER(p.company_name) LIKE $1 THEN 80 ELSE 0 END +
        CASE WHEN LOWER(p.description) LIKE $1 THEN 40 ELSE 0 END +
        CASE WHEN p.trending THEN 20 ELSE 0 END
      ) AS relevance_score
    FROM products p
    LEFT JOIN product_categories pc ON pc.id = p.category_id
    ${where}
    ORDER BY relevance_score DESC, p.created_at DESC
    LIMIT $${limitIdx}
  `, params)

  const productIds = rows.map(r => toNumber(r.id))
  const variantMap = await batchGetVariants(productIds)
  const items = rows.map(r => mapProduct(r, variantMap[toNumber(r.id)] ?? []))

  return { items, total: items.length, query: searchQuery }
}

// ── Trending Products Service ──────────────────────────────────────────────────

export async function getTrendingProducts(limit = 12): Promise<ErpProduct[]> {
  const filterPart = `AND ${PRODUCT_ELIGIBILITY_SQL}`

  const rows = await query<Record<string, unknown>>(`
    WITH max_sale_date AS (
      SELECT COALESCE(MAX(created_at), NOW()) as max_date FROM sales
    )
    SELECT 
      p.*,
      pc.name AS category_name,
      (
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM product_batches pb 
            JOIN product_batch_device_stock pbds ON pbds.batch_id = pb.id 
            WHERE pb.product_id = p.id OR pb.product_variant_id IN (SELECT id FROM product_variants WHERE product_id = p.id)
          ) THEN (
            SELECT COALESCE(SUM(GREATEST(0, pbds.stock))::int, 0)
            FROM product_batches pb 
            JOIN product_batch_device_stock pbds ON pbds.batch_id = pb.id 
            WHERE pb.product_id = p.id OR pb.product_variant_id IN (SELECT id FROM product_variants WHERE product_id = p.id)
          )
          WHEN EXISTS (
            SELECT 1 FROM product_batches pb 
            WHERE pb.product_id = p.id OR pb.product_variant_id IN (SELECT id FROM product_variants WHERE product_id = p.id)
          ) THEN (
            SELECT COALESCE(SUM(GREATEST(0, pb.remaining_quantity))::int, 0)
            FROM product_batches pb 
            WHERE pb.product_id = p.id OR pb.product_variant_id IN (SELECT id FROM product_variants WHERE product_id = p.id)
          )
          ELSE (
            SELECT COALESCE(SUM(GREATEST(0, pds.stock))::int, 0)
            FROM product_device_stock pds 
            WHERE pds.product_id = p.id
          )
        END
      )::int AS total_stock,
      COALESCE(SUM(CASE WHEN s.created_at >= (msd.max_date - INTERVAL '30 days') THEN si.quantity ELSE 0 END), 0)::int AS recent_sales_qty,
      COALESCE(SUM(si.quantity), 0)::int AS total_sales_qty,
      (
        COALESCE(SUM(CASE WHEN s.created_at >= (msd.max_date - INTERVAL '30 days') THEN si.quantity ELSE 0 END), 0) * 5 +
        COALESCE(SUM(si.quantity), 0) * 2
      )::int AS trending_score
    FROM products p
    CROSS JOIN max_sale_date msd
    LEFT JOIN product_categories pc ON pc.id = p.category_id
    LEFT JOIN sale_items si ON si.product_id = p.id
    LEFT JOIN sales s ON s.id = si.sale_id
    WHERE p.name IS NOT NULL 
      AND p.name != '' 
      AND p.price > 0
      AND LOWER(p.name) NOT LIKE '%dummy%'
      AND LOWER(p.name) NOT LIKE '%test%'
      AND LOWER(p.name) NOT LIKE '%-=-=%'
      ${filterPart}
    GROUP BY p.id, pc.name, msd.max_date
    ORDER BY p.trending DESC, trending_score DESC, total_sales_qty DESC, p.created_at DESC
    LIMIT $1
  `, [limit])

  const productIds = rows.map(r => toNumber(r.id))
  const variantMap = await batchGetVariants(productIds)

  return rows.map(row => mapProduct(row, variantMap[toNumber(row.id)] ?? []))
}

// ── DB Health Check ───────────────────────────────────────────────────────────

export async function getDbHealth() {
  const rows = await query<Record<string, unknown>>(`
    SELECT 
      current_database() AS db_name,
      current_schema() AS schema_name,
      (SELECT COUNT(*) FROM products p WHERE ${PRODUCT_ELIGIBILITY_SQL})::int AS active_products,
      (SELECT COUNT(*) FROM product_categories)::int AS categories,
      (SELECT COUNT(*) FROM product_variants)::int AS variants
  `)
  return rows[0]
}

