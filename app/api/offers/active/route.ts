import { NextResponse } from "next/server";
import { sql } from "@/lib/database";

export async function GET() {
  try {
    // Dynamically ensure offers table is created with all required columns
    await sql`
      CREATE TABLE IF NOT EXISTS offers (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        offers TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        priority INTEGER DEFAULT 0,
        minimum_order_value_aed NUMERIC DEFAULT 0,
        maximum_order_value_aed NUMERIC,
        minimum_order_value_inr NUMERIC DEFAULT 0,
        maximum_order_value_inr NUMERIC,
        usage_limit_per_user INTEGER,
        total_usage_limit INTEGER,
        shop_restriction VARCHAR(255),
        user_type_restriction VARCHAR(255),
        allowed_categories TEXT,
        excluded_categories TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Retroactively add columns to handle existing old schemas
    const columns = [
      { name: "is_active", type: "BOOLEAN DEFAULT TRUE" },
      { name: "priority", type: "INTEGER DEFAULT 0" },
      { name: "minimum_order_value_aed", type: "NUMERIC DEFAULT 0" },
      { name: "maximum_order_value_aed", type: "NUMERIC" },
      { name: "minimum_order_value_inr", type: "NUMERIC DEFAULT 0" },
      { name: "maximum_order_value_inr", type: "NUMERIC" },
      { name: "usage_limit_per_user", type: "INTEGER" },
      { name: "total_usage_limit", type: "INTEGER" },
      { name: "shop_restriction", type: "VARCHAR(255)" },
      { name: "user_type_restriction", type: "VARCHAR(255)" },
      { name: "allowed_categories", type: "TEXT" },
      { name: "excluded_categories", type: "TEXT" }
    ];

    for (const col of columns) {
      try {
        await sql.query(`ALTER TABLE offers ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
      } catch (err) {
        // Suppress column exists errors
      }
    }

    const currentDate = new Date().toISOString().split('T')[0];

    // Fetch active offers
    const activeOffers = await sql`
      SELECT * FROM offers 
      WHERE start_date <= ${currentDate} 
      AND end_date >= ${currentDate}
      AND is_active = true
      ORDER BY 
        priority DESC NULLS LAST,
        CASE WHEN minimum_order_value_aed > 0 OR maximum_order_value_aed IS NOT NULL OR 
                  minimum_order_value_inr > 0 OR maximum_order_value_inr IS NOT NULL OR
                  usage_limit_per_user IS NOT NULL OR total_usage_limit IS NOT NULL OR 
                  shop_restriction IS NOT NULL OR user_type_restriction IS NOT NULL OR 
                  allowed_categories IS NOT NULL OR excluded_categories IS NOT NULL 
             THEN 0 ELSE 1 END,
        created_at DESC;
    `;
    
    return NextResponse.json(activeOffers);
  } catch (error) {
    console.error("Error fetching active offers:", error);
    return NextResponse.json(
      { error: "Failed to fetch active offers" }, 
      { status: 500 }
    );
  }
}