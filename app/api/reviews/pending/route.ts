import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value
    if (!token) return null
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return { userId: payload.userId as number, email: payload.email as string }
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json([]) // Return empty list for unauthenticated
    }

    // Ensure reviews table exists so the query doesn't fail
    await sql`
      CREATE TABLE IF NOT EXISTS product_reviews (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        order_id INTEGER NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
        review TEXT NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_user_product_order_review ON product_reviews(user_id, product_id, order_id);
    `

    // Query pending reviews
    const pendingReviews = await sql`
      SELECT 
        oi.menu_item_id AS product_id,
        o.id AS order_id,
        oi.menu_item_name AS product_name,
        oi.product_image_url
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ${user.userId.toString()} 
        AND o.status = 'delivered'
        AND NOT EXISTS (
          SELECT 1 FROM product_reviews pr 
          WHERE pr.user_id = o.user_id 
            AND pr.product_id = oi.menu_item_id 
            AND pr.order_id = o.id
        )
      ORDER BY o.created_at DESC
    `

    return NextResponse.json(pendingReviews)
  } catch (error) {
    console.error("Error fetching pending reviews:", error)
    return NextResponse.json({ error: "Failed to fetch pending reviews" }, { status: 500 })
  }
}
