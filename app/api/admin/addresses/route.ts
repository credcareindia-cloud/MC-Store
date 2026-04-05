import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_addresses'
      )
    `

    if (!tableCheck[0].exists) {
      return NextResponse.json([])
    }

    if (userId) {
      const addresses = await sql`
        SELECT * FROM user_addresses 
        WHERE user_id = ${userId}
        ORDER BY is_default DESC, updated_at DESC
      `
      return NextResponse.json(addresses)
    }

    const addresses = await sql`
      SELECT ua.*, 
        o.customer_name,
        o.customer_email,
        o.customer_phone
      FROM user_addresses ua
      LEFT JOIN LATERAL (
        SELECT customer_name, customer_email, customer_phone 
        FROM orders 
        WHERE user_id = ua.user_id OR clerk_user_id = ua.user_id
        ORDER BY created_at DESC
        LIMIT 1
      ) o ON true
      ORDER BY ua.updated_at DESC
    `

    return NextResponse.json(addresses)
  } catch (error) {
    console.error("Error fetching addresses:", error)
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 })
  }
}
