// app/api/admin/products/route.ts
import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET() {
  try {
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
      GROUP BY p.id, c.name
      ORDER BY p.created_at DESC;
    `

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      image_urls,
      category_id,
      shop_category,
      store_name,
      is_available,
      is_featured,
      is_new,
      new_until_date,
      features,
      specifications_text,
      warranty_months,
      brand,
      model,
      condition_type,
      warranty_period,
      storage_capacity,
      color,
      sku,
      variants
    } = body

    // Validate required fields
    if (!name || !category_id) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      )
    }

    // Validate shop_category
    if (!shop_category || !['A', 'B', 'Both'].includes(shop_category)) {
      return NextResponse.json(
        { error: "Shop category is required and must be 'A', 'B', or 'Both'" },
        { status: 400 }
      )
    }

    // Validate variants
    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { error: "At least one variant is required" },
        { status: 400 }
      )
    }

    // Validate variant names
    const hasInvalidVariant = variants.some(v => !v.name?.trim())
    if (hasInvalidVariant) {
      return NextResponse.json(
        { error: "All variants must have a name" },
        { status: 400 }
      )
    }

    // Generate SKU if not provided
    const finalSku = sku || `${shop_category}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`

    // Prepare arrays - ensure they are proper JavaScript arrays
    const imageUrlsArray = Array.isArray(image_urls) ? image_urls.filter(url => url && url.trim()) : []
    const featuresArray = Array.isArray(features) 
      ? features.filter(f => f && f.trim()) 
      : (typeof features === 'string' 
          ? features.split(',').map(f => f.trim()).filter(Boolean)
          : [])

    // console.log('Arrays being inserted:', { imageUrlsArray, featuresArray }) 

    // Create product with proper handling for mixed column types
    const [product] = await sql`
      INSERT INTO products (
        name, description, image_urls, category_id, shop_category, store_name,
        is_available, is_featured, is_new, new_until_date, features, specifications_text,
        warranty_months, brand, model, condition_type, warranty_period,
        storage_capacity, color, sku
      ) VALUES (
        ${name},
        ${description || ''},
        ${JSON.stringify(imageUrlsArray)},
        ${category_id},
        ${shop_category},
        ${store_name || ''},
        ${is_available ?? true},
        ${is_featured ?? false},
        ${is_new ?? false},
        ${new_until_date || null},
        ${featuresArray},
        ${specifications_text || ''},
        ${warranty_months || 0},
        ${brand || ''},
        ${model || ''},
        ${condition_type || 'new'},
        ${warranty_period || 0},
        ${storage_capacity || ''},
        ${color || ''},
        ${finalSku}
      )
      RETURNING *;
    `

    // Insert variants
    for (const variant of variants) {
      await sql`
        INSERT INTO product_variants (
          product_id, name, price_aed, price_inr, discount_aed, discount_inr,
          available_aed, available_inr, stock_quantity
        ) VALUES (
          ${product.id}, ${variant.name}, ${variant.price_aed || 0}, ${variant.price_inr || 0},
          ${variant.discount_aed || 0}, ${variant.discount_inr || 0},
          ${variant.available_aed ?? true}, ${variant.available_inr ?? true}, ${variant.stock_quantity || 0}
        );
      `
    }

    // Fetch the complete product with variants
    const [completeProduct] = await sql`
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
      WHERE p.id = ${product.id}
      GROUP BY p.id, c.name;
    `

    return NextResponse.json(completeProduct)
  } catch (error) {
    console.error("Error creating product:", error)
    
    // Handle duplicate SKU error
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: "Product with this SKU already exists. Please use a different SKU." },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create product", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}