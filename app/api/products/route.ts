// /api/products/route.ts  
import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

/**
 * Public endpoint – returns all available products with variants and category info.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shop = searchParams.get('shop') // 'A', 'B', or null for both
    const category = searchParams.get('category')
    const currency = searchParams.get('currency') || 'AED' // Default to AED
    
    let whereConditions = ['p.is_available = TRUE']
    let queryParams: any[] = []
    
    // Filter by shop if specified
    if (shop && ['A', 'B'].includes(shop)) {
      whereConditions.push(`(p.shop_category = $${queryParams.length + 1} OR p.shop_category = 'Both')`)
      queryParams.push(shop)
    }
    
    // Filter by category if specified
    if (category && !isNaN(Number(category))) {
      whereConditions.push(`p.category_id = $${queryParams.length + 1}`)
      queryParams.push(Number(category))
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''
    
    // Fetch products with variants
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
              'available_inr', v.available_inr,
              'stock_quantity', v.stock_quantity
            ) ORDER BY v.id
          ) FILTER (WHERE v.id IS NOT NULL),
          '[]'::json
        ) AS variants
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variants v ON p.id = v.product_id
      WHERE p.is_available = TRUE
        ${shop && ['A', 'B'].includes(shop) ? 
          sql`AND (p.shop_category = ${shop} OR p.shop_category = 'Both')` : 
          sql``
        }
        ${category && !isNaN(Number(category)) ? 
          sql`AND p.category_id = ${Number(category)}` : 
          sql``
        }
      GROUP BY p.id, c.name, c.sort_order
      ORDER BY 
        CASE WHEN p.is_featured THEN 0 ELSE 1 END,
        CASE WHEN p.is_new THEN 0 ELSE 1 END,
        c.sort_order, 
        c.name, 
        p.name;
    `

    // Process products to add computed fields
    const processedProducts = products.map(product => ({
      ...product,
      // Add computed price fields for backward compatibility and easy access
      display_price: getDisplayPrice(product, currency),
      has_discount: hasDiscount(product),
      min_price_aed: getMinPrice(product, 'AED'),
      min_price_inr: getMinPrice(product, 'INR'),
      available_currencies: getAvailableCurrencies(product)
    }))

    return NextResponse.json({ 
      items: processedProducts,
      total: processedProducts.length,
      filters: {
        shop: shop || 'all',
        category: category || 'all',
        currency
      }
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

// Helper function to get display price based on currency preference
function getDisplayPrice(product: any, currency: string) {
  if (!product.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
    return null
  }
  
  const firstVariant = product.variants[0]
  if (currency === 'INR' && firstVariant.available_inr && firstVariant.price_inr > 0) {
    const finalPrice = firstVariant.price_inr - (firstVariant.discount_inr || 0)
    return {
      price: finalPrice,
      original_price: firstVariant.price_inr,
      discount: firstVariant.discount_inr || 0,
      currency: 'INR',
      symbol: '₹'
    }
  } else if (firstVariant.available_aed && firstVariant.price_aed > 0) {
    const finalPrice = firstVariant.price_aed - (firstVariant.discount_aed || 0)
    return {
      price: finalPrice,
      original_price: firstVariant.price_aed,
      discount: firstVariant.discount_aed || 0,
      currency: 'AED',
      symbol: 'AED'
    }
  }
  
  return null
}

// Helper function to check if any variant has a discount
function hasDiscount(product: any) {
  if (!product.variants || !Array.isArray(product.variants)) return false
  
  return product.variants.some(variant => 
    (variant.discount_aed && variant.discount_aed > 0) ||
    (variant.discount_inr && variant.discount_inr > 0)
  )
}

// Helper function to get minimum price for a currency
function getMinPrice(product: any, currency: string) {
  if (!product.variants || !Array.isArray(product.variants)) return null
  
  const field = currency === 'INR' ? 'price_inr' : 'price_aed'
  const availableField = currency === 'INR' ? 'available_inr' : 'available_aed'
  
  const prices = product.variants
    .filter(v => v[availableField] && v[field] > 0)
    .map(v => v[field])
    
  return prices.length > 0 ? Math.min(...prices) : null
}

// Helper function to get available currencies for a product
function getAvailableCurrencies(product: any) {
  if (!product.variants || !Array.isArray(product.variants)) return []
  
  const currencies = new Set()
  
  product.variants.forEach(variant => {
    if (variant.available_aed && variant.price_aed > 0) currencies.add('AED')
    if (variant.available_inr && variant.price_inr > 0) currencies.add('INR')
  })
  
  return Array.from(currencies)
}