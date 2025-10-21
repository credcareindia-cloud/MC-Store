import { NextResponse } from "next/server";
import { sql } from "@/lib/database";

export async function GET() {
  try {
    
    await sql`
      CREATE TABLE IF NOT EXISTS offers (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        offers TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const currentDate = new Date().toISOString().split('T')[0];

    // Fetch only active offers ordered by priority (same as coupon validation system)
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
    
    console.log("Active offers found:", activeOffers.length);
    console.log("Current date:", currentDate);
    
    return NextResponse.json(activeOffers);
  } catch (error) {
    console.error("Error fetching active offers:", error);
    return NextResponse.json(
      { error: "Failed to fetch active offers" }, 
      { status: 500 }
    );
  }
}