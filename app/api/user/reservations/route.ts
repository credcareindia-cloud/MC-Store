import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify JWT
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as number

    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(20) NOT NULL,
        party_size INTEGER NOT NULL,
        reservation_date DATE NOT NULL,
        reservation_time TIME NOT NULL,
        special_requests TEXT,
        table_preference VARCHAR(50),
        occasion VARCHAR(50),
        dietary_restrictions TEXT,
        confirmation_code VARCHAR(20),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Get user reservations
    const reservations = await sql`
      SELECT * FROM reservations 
      WHERE user_id = ${userId}
      ORDER BY reservation_date DESC, reservation_time DESC
    `

    return NextResponse.json(reservations)
  } catch (error) {
    console.error("Error fetching user reservations:", error)
    return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 })
  }
}
