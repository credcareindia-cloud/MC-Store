import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

async function ensureSchema() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL DEFAULT '',
        user_id TEXT,
        clerk_user_id TEXT,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(20) NOT NULL,
        order_type VARCHAR(20) DEFAULT 'delivery',
        payment_method VARCHAR(20) DEFAULT 'cod',
        payment_id VARCHAR(255),
        payment_status VARCHAR(20) DEFAULT 'pending',
        razorpay_order_id VARCHAR(255),
        razorpay_payment_id VARCHAR(255),
        razorpay_signature VARCHAR(255),
        bank_reference_num VARCHAR(255),
        bank_transaction_id VARCHAR(255),
        payment_method_type VARCHAR(50),
        payment_card_id VARCHAR(255),
        payment_wallet VARCHAR(50),
        payment_vpa VARCHAR(255),
        payment_bank VARCHAR(100),
        payment_amount INTEGER,
        payment_fee INTEGER,
        payment_tax INTEGER,
        payment_created_at TIMESTAMP,
        table_number INTEGER,
        delivery_address TEXT,
        subtotal DECIMAL(10,2) DEFAULT 0,
        delivery_fee DECIMAL(10,2) DEFAULT 0,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        coupon_code VARCHAR(50),
        currency VARCHAR(3) DEFAULT 'AED',
        special_instructions TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        menu_item_id INTEGER,
        variant_id INTEGER,
        menu_item_name VARCHAR(255) NOT NULL,
        variant_name VARCHAR(255),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        special_requests TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Add order_number column if it doesn't exist
    try {
      const orderNumberExists = await sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'orders' AND column_name = 'order_number'
        )
      `
      
      if (!orderNumberExists[0].exists) {
        await sql`ALTER TABLE orders ADD COLUMN order_number VARCHAR(50) DEFAULT ''`
        console.log("Added order_number column")
        
        // Update existing orders with professional order numbers
        const ordersWithoutNumbers = await sql`
          SELECT id FROM orders WHERE order_number = '' ORDER BY id ASC
        `
        
        let startingNumber = 10001
        for (const order of ordersWithoutNumbers) {
          const orderNumber = `SAB-${startingNumber}`
          await sql`
            UPDATE orders 
            SET order_number = ${orderNumber}
            WHERE id = ${order.id}
          `
          startingNumber++
        }
        
        // Now add the UNIQUE constraint
        try {
          await sql`ALTER TABLE orders ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number)`
          console.log("Added UNIQUE constraint to order_number column")
        } catch (error) {
          console.log("UNIQUE constraint might already exist:", error)
        }
      }
    } catch (error) {
      console.log("order_number column might already exist or error adding:", error)
    }

    try {
      const columnExists = await sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'orders' AND column_name = 'estimated_completion_time'
        )
      `
      
      if (!columnExists[0].exists) {
        await sql`ALTER TABLE orders ADD COLUMN estimated_completion_time TIMESTAMP`
        console.log("Added estimated_completion_time column")
      }
    } catch (error) {
      console.log("estimated_completion_time column might already exist or error adding:", error)
    }

    console.log("Schema ensured successfully")
  } catch (error) {
    console.error("Error ensuring schema:", error)
    throw error
  }
}

export async function GET() {
  try {
    console.log("Fetching orders for admin...")
    
    await ensureSchema()

    const orders = await sql`
      SELECT
        o.id,
        o.order_number,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        COALESCE(o.order_type, 'delivery') as order_type,
        COALESCE(o.payment_method, 'cod') as payment_method,
        COALESCE(o.payment_status, 'pending') as payment_status,
        o.payment_id,
        o.razorpay_order_id,
        o.razorpay_payment_id,
        o.razorpay_signature,
        o.bank_reference_num,
        o.bank_transaction_id,
        o.payment_method_type,
        o.payment_card_id,
        o.payment_wallet,
        o.payment_vpa,
        o.payment_bank,
        o.payment_amount,
        o.payment_fee,
        o.payment_tax,
        o.payment_created_at,
        o.table_number,
        o.delivery_address,
        o.special_instructions,
        COALESCE(o.subtotal, 0) as total_amount,
        0 as tax_amount,
        COALESCE(o.delivery_fee, 0) as delivery_fee,
        o.total_amount as final_total,
        COALESCE(o.discount_amount, 0) as discount_amount,
        o.coupon_code,
        COALESCE(o.currency, 'INR') as currency,
        o.status,
        o.tracking_url,
        o.tracking_id,
        o.created_at,
        o.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id',            oi.id,
              'menu_item_id',  oi.menu_item_id,
              'variant_id',    oi.variant_id,
              'menu_item_name',oi.menu_item_name,
              'variant_name',  oi.variant_name,
              'quantity',      oi.quantity,
              'unit_price',    oi.unit_price,
              'total_price',   oi.total_price,
              'special_requests', oi.special_requests,
              'product_image_url', oi.product_image_url
            ) ORDER BY oi.id
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'::json
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `

    const formattedOrders = orders.map(order => ({
      id: parseInt(order.id),
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      order_type: order.order_type,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      payment_id: order.payment_id,
      razorpay_order_id: order.razorpay_order_id,
      razorpay_payment_id: order.razorpay_payment_id,
      razorpay_signature: order.razorpay_signature,
      bank_reference_num: order.bank_reference_num,
      bank_transaction_id: order.bank_transaction_id,
      payment_method_type: order.payment_method_type,
      payment_card_id: order.payment_card_id,
      payment_wallet: order.payment_wallet,
      payment_vpa: order.payment_vpa,
      payment_bank: order.payment_bank,
      payment_amount: order.payment_amount,
      payment_fee: order.payment_fee,
      payment_tax: order.payment_tax,
      payment_created_at: order.payment_created_at,
      table_number: order.table_number,
      delivery_address: order.delivery_address,
      special_instructions: order.special_instructions,
      total_amount: parseFloat(order.total_amount || '0'),
      tax_amount: parseFloat(order.tax_amount || '0'),
      delivery_fee: parseFloat(order.delivery_fee || '0'),
      final_total: parseFloat(order.final_total || '0'),
      discount_amount: parseFloat(order.discount_amount || '0'),
      coupon_code: order.coupon_code,
      currency: order.currency,
      status: order.status,
      tracking_url: order.tracking_url,
      tracking_id: order.tracking_id,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: Array.isArray(order.items) ? order.items.map((item: any) => ({
        id: parseInt(item.id || '0'),
        menu_item_id: parseInt(item.menu_item_id || '0'),
        variant_id: item.variant_id ? parseInt(item.variant_id) : null,
        menu_item_name: item.menu_item_name,
        variant_name: item.variant_name,
        quantity: parseInt(item.quantity || '0'),
        unit_price: parseFloat(item.unit_price || '0'),
        total_price: parseFloat(item.total_price || '0'),
        special_requests: item.special_requests,
        product_image_url: item.product_image_url
      })) : []
    }))

    // Post-process to fetch product images for all order items
    for (const order of formattedOrders) {
      for (const item of order.items) {
        if (item.menu_item_id && !item.product_image_url) {
          try {
            const productResult = await sql`
              SELECT image_urls 
              FROM products 
              WHERE id = ${item.menu_item_id}
              LIMIT 1
            `
            
            if (productResult.length > 0 && productResult[0].image_urls) {
              const imageUrls = productResult[0].image_urls
              if (Array.isArray(imageUrls) && imageUrls.length > 0) {
                item.product_image_url = imageUrls[0]
              } else if (typeof imageUrls === 'string' && imageUrls !== '[]' && imageUrls !== 'null') {
                try {
                  const parsedUrls = JSON.parse(imageUrls)
                  if (Array.isArray(parsedUrls) && parsedUrls.length > 0) {
                    item.product_image_url = parsedUrls[0]
                  }
                } catch {
                  // If parsing fails, treat as single URL
                  item.product_image_url = imageUrls
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching image for product ${item.menu_item_id}:`, error)
            // Continue processing other items even if one fails
          }
        }
      }
    }

    return NextResponse.json(formattedOrders, { status: 200 })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch orders", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    )
  }
}
