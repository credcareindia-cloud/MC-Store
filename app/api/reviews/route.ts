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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "5", 10)))
    const offset = (page - 1) * limit

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    // Ensure reviews table exists
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

    // Count reviews
    const countRes = await sql`
      SELECT COUNT(*)::int AS total FROM product_reviews WHERE product_id = ${productId}
    `
    const total = countRes[0]?.total || 0

    // Fetch paginated reviews
    const reviews = await sql`
      SELECT id, rating, review, customer_name, created_at 
      FROM product_reviews
      WHERE product_id = ${productId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    return NextResponse.json({
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId, orderId, rating, review } = await request.json()

    // Validate inputs
    const ratingNum = parseInt(rating, 10)
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    if (!review || typeof review !== "string" || review.trim().length === 0) {
      return NextResponse.json({ error: "Review text cannot be empty" }, { status: 400 })
    }

    const cleanReview = review.trim()

    // Retrieve customer name from users table
    const [userRecord] = await sql`
      SELECT name, email FROM users WHERE id = ${user.userId}
    `
    const customerName = userRecord?.name || userRecord?.email?.split("@")[0] || "Customer"

    // Verify eligibility: does the user have a delivered order for this product?
    const eligibility = await sql`
      SELECT o.id 
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ${orderId}
        AND o.user_id = ${user.userId.toString()}
        AND oi.menu_item_id = ${productId}
        AND o.status = 'delivered'
      LIMIT 1
    `

    if (eligibility.length === 0) {
      return NextResponse.json({ error: "You are not eligible to review this product" }, { status: 403 })
    }

    // Ensure reviews table exists
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

    // Prevent duplicates: check if already reviewed
    const existing = await sql`
      SELECT id FROM product_reviews 
      WHERE user_id = ${user.userId.toString()}
        AND product_id = ${productId}
        AND order_id = ${orderId}
    `

    if (existing.length > 0) {
      return NextResponse.json({ error: "You have already reviewed this product for this order" }, { status: 400 })
    }

    // Insert review
    await sql`
      INSERT INTO product_reviews (product_id, user_id, order_id, rating, review, customer_name)
      VALUES (${productId}, ${user.userId.toString()}, ${orderId}, ${ratingNum}, ${cleanReview}, ${customerName})
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 })
  }
}
