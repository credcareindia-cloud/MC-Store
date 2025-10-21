// app/api/products/search/route.ts
import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()
    const shop = searchParams.get('shop') // 'A', 'B', or null for both
    const category = searchParams.get('category')
    const currency = searchParams.get('currency') || 'AED'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50) // Max 50 results
    const sortBy = searchParams.get('sort') || 'relevance' // relevance, price_low, price_high, name, newest

    // If no query, return empty results
    if (!query || query.length < 2) {
      return NextResponse.json({
        items: [],
        total: 0,
        query: query || '',
        suggestions: []
      })
    }


    // Execute search using proper SQL template
    const products = await sql`
      SELECT
        p.*,
        c.name AS category_name,
        COALESCE(
          json_agg(
            json_build_object(
              'id', v.id,
              'name', v.name,
              'price_aed', v.price_aed,
              'price_inr', v.price_inr,
              'discount_aed', v.discount_aed,
              'discount_inr', v.discount_inr,
              'available_aed', v.available_aed,
              'available_inr', v.available_inr
            ) ORDER BY v.id
          ) FILTER (WHERE v.id IS NOT NULL),
          '[]'::json
        ) AS variants,
        -- Search relevance scoring
        (
          CASE WHEN LOWER(p.name) LIKE ${`%${query.toLowerCase()}%`} THEN 100 ELSE 0 END +
          CASE WHEN LOWER(p.name) ILIKE ${`%${query.toLowerCase()}%`} THEN 80 ELSE 0 END +
          CASE WHEN LOWER(p.description) ILIKE ${`%${query.toLowerCase()}%`} THEN 60 ELSE 0 END +
          CASE WHEN LOWER(p.brand) ILIKE ${`%${query.toLowerCase()}%`} THEN 70 ELSE 0 END +
          CASE WHEN LOWER(p.model) ILIKE ${`%${query.toLowerCase()}%`} THEN 50 ELSE 0 END +
          CASE WHEN LOWER(c.name) ILIKE ${`%${query.toLowerCase()}%`} THEN 40 ELSE 0 END +
          CASE WHEN EXISTS (
            SELECT 1 FROM unnest(p.features) AS f 
            WHERE LOWER(f) ILIKE ${`%${query.toLowerCase()}%`}
          ) THEN 30 ELSE 0 END +
          CASE WHEN LOWER(p.specifications_text) ILIKE ${`%${query.toLowerCase()}%`} THEN 20 ELSE 0 END +
          CASE WHEN p.is_featured THEN 10 ELSE 0 END +
          CASE WHEN p.is_new THEN 5 ELSE 0 END
        ) AS relevance_score
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variants v ON p.id = v.product_id
      WHERE p.is_available = TRUE
        ${shop && ['A', 'B'].includes(shop) ? 
          sql`AND (p.shop_category = ${shop} OR p.shop_category = 'Both')` : 
          sql``}
        ${category && !isNaN(Number(category)) ? 
          sql`AND p.category_id = ${Number(category)}` : 
          sql``}
        AND (
          LOWER(p.name) ILIKE ${`%${query.toLowerCase()}%`}
          OR LOWER(p.description) ILIKE ${`%${query.toLowerCase()}%`}
          OR LOWER(p.brand) ILIKE ${`%${query.toLowerCase()}%`}
          OR LOWER(p.model) ILIKE ${`%${query.toLowerCase()}%`}
          OR LOWER(c.name) ILIKE ${`%${query.toLowerCase()}%`}
          OR EXISTS (
            SELECT 1 FROM unnest(p.features) AS f 
            WHERE LOWER(f) ILIKE ${`%${query.toLowerCase()}%`}
          )
          OR LOWER(p.specifications_text) ILIKE ${`%${query.toLowerCase()}%`}
          OR LOWER(p.sku) ILIKE ${`%${query.toLowerCase()}%`}
        )
      GROUP BY p.id, c.name, c.sort_order
      HAVING (
        CASE WHEN LOWER(p.name) LIKE ${`%${query.toLowerCase()}%`} THEN 100 ELSE 0 END +
        CASE WHEN LOWER(p.name) ILIKE ${`%${query.toLowerCase()}%`} THEN 80 ELSE 0 END +
        CASE WHEN LOWER(p.description) ILIKE ${`%${query.toLowerCase()}%`} THEN 60 ELSE 0 END +
        CASE WHEN LOWER(p.brand) ILIKE ${`%${query.toLowerCase()}%`} THEN 70 ELSE 0 END +
        CASE WHEN LOWER(p.model) ILIKE ${`%${query.toLowerCase()}%`} THEN 50 ELSE 0 END +
        CASE WHEN LOWER(c.name) ILIKE ${`%${query.toLowerCase()}%`} THEN 40 ELSE 0 END +
        CASE WHEN EXISTS (
          SELECT 1 FROM unnest(p.features) AS f 
          WHERE LOWER(f) ILIKE ${`%${query.toLowerCase()}%`}
        ) THEN 30 ELSE 0 END +
        CASE WHEN LOWER(p.specifications_text) ILIKE ${`%${query.toLowerCase()}%`} THEN 20 ELSE 0 END +
        CASE WHEN p.is_featured THEN 10 ELSE 0 END +
        CASE WHEN p.is_new THEN 5 ELSE 0 END
      ) > 0
      ORDER BY 
        ${sortBy === 'price_low' || sortBy === 'price_high' ? sql`
          (SELECT 
            CASE WHEN ${currency === 'AED' ? sql`v2.available_aed` : sql`v2.available_inr`} THEN 
              COALESCE(${currency === 'AED' ? sql`v2.discount_aed` : sql`v2.discount_inr`}, ${currency === 'AED' ? sql`v2.price_aed` : sql`v2.price_inr`})
            ELSE ${sortBy === 'price_low' ? sql`999999` : sql`0`} END
           FROM product_variants v2 
           WHERE v2.product_id = p.id 
             AND ${currency === 'AED' ? sql`v2.available_aed = TRUE` : sql`v2.available_inr = TRUE`}
           ORDER BY 
             COALESCE(${currency === 'AED' ? sql`v2.discount_aed` : sql`v2.discount_inr`}, ${currency === 'AED' ? sql`v2.price_aed` : sql`v2.price_inr`}) ${sortBy === 'price_low' ? sql`ASC` : sql`DESC`}
           LIMIT 1
          ) ${sortBy === 'price_low' ? sql`ASC` : sql`DESC`},
        ` : sortBy === 'name' ? sql`
          p.name ASC,
        ` : sortBy === 'newest' ? sql`
          p.created_at DESC,
        ` : sql``}
        relevance_score DESC, p.is_featured DESC, p.is_new DESC, p.name ASC
      LIMIT ${limit}
    `

    // Process products to add computed fields
    const processedProducts = products.map(product => ({
      ...product,
      display_price: getDisplayPrice(product, currency),
      has_discount: hasDiscount(product),
      min_price_aed: getMinPrice(product, 'AED'),
      min_price_inr: getMinPrice(product, 'INR'),
      available_currencies: getAvailableCurrencies(product),
      search_matches: getSearchMatches(product, query)
    }))

    // Generate search suggestions if few results
    let suggestions: string[] = []
    if (processedProducts.length < 3) {
      suggestions = await generateSearchSuggestions(query, shop, category)
    }

    return NextResponse.json({
      items: processedProducts,
      total: processedProducts.length,
      query,
      suggestions,
      filters: {
        shop: shop || 'all',
        category: category || 'all',
        currency,
        sort: sortBy
      }
    })

  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { 
        error: "Search failed", 
        details: error instanceof Error ? error.message : String(error),
        items: [],
        total: 0,
        query: '',
        suggestions: []
      },
      { status: 500 }
    )
  }
}

// Helper functions
function getDisplayPrice(product: any, currency: string) {
  if (!product.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
    return null
  }
  
  const firstVariant = product.variants[0]
  if (currency === 'INR' && firstVariant.available_inr && firstVariant.price_inr > 0) {
    const finalPrice = firstVariant.discount_inr || firstVariant.price_inr
    return {
      price: finalPrice,
      original_price: firstVariant.price_inr,
      discount: firstVariant.discount_inr || 0,
      currency: 'INR',
      symbol: '₹'
    }
  } else if (firstVariant.available_aed && firstVariant.price_aed > 0) {
    const finalPrice = firstVariant.discount_aed || firstVariant.price_aed
    return {
      price: finalPrice,
      original_price: firstVariant.price_aed,
      discount: firstVariant.discount_aed || 0,
      currency: 'AED',
      symbol: 'د.إ'
    }
  }
  
  return null
}

function hasDiscount(product: any) {
  if (!product.variants || !Array.isArray(product.variants)) return false
  
  return product.variants.some((variant: any) => 
    (variant.discount_aed && variant.discount_aed > 0 && variant.discount_aed < variant.price_aed) ||
    (variant.discount_inr && variant.discount_inr > 0 && variant.discount_inr < variant.price_inr)
  )
}

function getMinPrice(product: any, currency: string) {
  if (!product.variants || !Array.isArray(product.variants)) return null
  
  const field = currency === 'INR' ? 'price_inr' : 'price_aed'
  const discountField = currency === 'INR' ? 'discount_inr' : 'discount_aed'
  const availableField = currency === 'INR' ? 'available_inr' : 'available_aed'
  
  const prices = product.variants
    .filter((v: any) => v[availableField] && v[field] > 0)
    .map((v: any) => v[discountField] || v[field])
    
  return prices.length > 0 ? Math.min(...prices) : null
}

function getAvailableCurrencies(product: any) {
  if (!product.variants || !Array.isArray(product.variants)) return []
  
  const currencies = new Set()
  
  product.variants.forEach((variant: any) => {
    if (variant.available_aed && variant.price_aed > 0) currencies.add('AED')
    if (variant.available_inr && variant.price_inr > 0) currencies.add('INR')
  })
  
  return Array.from(currencies)
}

function getSearchMatches(product: any, query: string) {
  const matches = []
  const lowerQuery = query.toLowerCase()
  
  if (product.name && product.name.toLowerCase().includes(lowerQuery)) {
    matches.push({ field: 'name', value: product.name })
  }
  if (product.brand && product.brand.toLowerCase().includes(lowerQuery)) {
    matches.push({ field: 'brand', value: product.brand })
  }
  if (product.category_name && product.category_name.toLowerCase().includes(lowerQuery)) {
    matches.push({ field: 'category', value: product.category_name })
  }
  if (product.features && product.features.some((f: string) => f.toLowerCase().includes(lowerQuery))) {
    const matchingFeatures = product.features.filter((f: string) => f.toLowerCase().includes(lowerQuery))
    matches.push({ field: 'features', value: matchingFeatures.join(', ') })
  }
  
  return matches
}

async function generateSearchSuggestions(query: string, shop?: string | null, category?: string | null): Promise<string[]> {
  try {
    // Get popular search terms and related products
    const suggestions = await sql`
      SELECT DISTINCT 
        LOWER(name) as suggestion,
        COUNT(*) as frequency
      FROM products p
      WHERE p.is_available = TRUE
        ${shop && ['A', 'B'].includes(shop) ? 
          sql`AND (p.shop_category = ${shop} OR p.shop_category = 'Both')` : 
          sql``}
        ${category && !isNaN(Number(category)) ? 
          sql`AND p.category_id = ${Number(category)}` : 
          sql``}
        AND (
          LOWER(p.name) LIKE ${'%' + query.toLowerCase() + '%'}
          OR LOWER(p.brand) LIKE ${'%' + query.toLowerCase() + '%'}
          OR LOWER(p.model) LIKE ${'%' + query.toLowerCase() + '%'}
        )
      GROUP BY LOWER(name)
      ORDER BY frequency DESC, suggestion ASC
      LIMIT 5
    `

    return suggestions.map(s => s.suggestion).slice(0, 3)
  } catch (error) {
    console.error('Error generating suggestions:', error)
    return []
  }
}