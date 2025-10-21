import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const excludeId = searchParams.get('excludeId')
    const shop = searchParams.get('shop')
    const limit = parseInt(searchParams.get('limit') || '8')

    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    // Multi-tier recommendation system
    // 1. First try to get products from same category
    const sameCategoryProducts = await sql`
      SELECT 
        p.*,
        c.name as category_name,
        'same_category' as recommendation_type,
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
        ) as variants
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variants v ON p.id = v.product_id
      WHERE p.category_id = ${categoryId}
        AND p.is_available = true
        ${excludeId ? sql`AND p.id != ${excludeId}` : sql``}
        ${shop && shop !== 'Both' ? 
          sql`AND (p.shop_category = ${shop} OR p.shop_category = 'Both')` : 
          sql``
        }
      GROUP BY p.id, c.name
      ORDER BY 
        p.is_featured DESC,
        p.is_new DESC,
        p.created_at DESC
      LIMIT ${limit}
    `

    let allProducts = [...sameCategoryProducts]
    const remainingSlots = limit - allProducts.length

    // 2. If we need more products, get from same shop (different categories)
    if (remainingSlots > 0) {
      const sameShopProducts = await sql`
        SELECT 
          p.*,
          c.name as category_name,
          'same_shop' as recommendation_type,
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
          ) as variants
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_variants v ON p.id = v.product_id
        WHERE p.is_available = true
          AND p.category_id != ${categoryId}
          ${excludeId ? sql`AND p.id != ${excludeId}` : sql``}
          ${shop && shop !== 'Both' ? 
            sql`AND (p.shop_category = ${shop} OR p.shop_category = 'Both')` : 
            sql``
          }
        GROUP BY p.id, c.name
        ORDER BY 
          p.is_featured DESC,
          p.is_new DESC,
          p.created_at DESC
        LIMIT ${remainingSlots}
      `
      
      // Filter out any products already in allProducts
      const filteredSameShop = sameShopProducts.filter(p => 
        !allProducts.some(existing => existing.id === p.id)
      )
      
      allProducts = [...allProducts, ...filteredSameShop]
    }

    // 3. If still need more, get popular/featured products from any category
    const finalRemainingSlots = limit - allProducts.length
    if (finalRemainingSlots > 0) {
      const popularProducts = await sql`
        SELECT 
          p.*,
          c.name as category_name,
          'popular' as recommendation_type,
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
          ) as variants
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_variants v ON p.id = v.product_id
        WHERE p.is_available = true
          ${excludeId ? sql`AND p.id != ${excludeId}` : sql``}
        GROUP BY p.id, c.name
        ORDER BY 
          p.is_featured DESC,
          p.is_new DESC,
          p.created_at DESC
        LIMIT ${finalRemainingSlots}
      `
      
      // Filter out any products already in allProducts
      const filteredPopular = popularProducts.filter(p => 
        !allProducts.some(existing => existing.id === p.id)
      )
      
      allProducts = [...allProducts, ...filteredPopular]
    }

    const result = allProducts

    // Process the results to parse JSON fields
    const products = result.map((row: any) => ({
      ...row,
      image_urls: typeof row.image_urls === 'string' ? JSON.parse(row.image_urls) : row.image_urls,
      features: typeof row.features === 'string' ? JSON.parse(row.features) : row.features,
      variants: Array.isArray(row.variants) ? row.variants : []
    }))

    return NextResponse.json({ 
      products,
      total: products.length 
    })

  } catch (error) {
    console.error('Error fetching recommended products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommended products' },
      { status: 500 }
    )
  }
}
