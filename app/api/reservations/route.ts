import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

async function getUserFromToken() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) return null

    const { payload } = await jwtVerify(token, JWT_SECRET)
    return { userId: payload.userId as number, email: payload.email as string }
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  try {
    const reservationData = await request.json()
    const user = await getUserFromToken()

    // Validate required fields
    if (!reservationData.customerName || !reservationData.customerPhone) {
      return NextResponse.json({ error: "Customer name and phone are required" }, { status: 400 })
    }

    if (!reservationData.reservationDate || !reservationData.reservationTime) {
      return NextResponse.json({ error: "Reservation date and time are required" }, { status: 400 })
    }

    if (!reservationData.partySize || reservationData.partySize < 1) {
      return NextResponse.json({ error: "Valid party size is required" }, { status: 400 })
    }

    // Generate confirmation code
    const confirmationCode = `RES${Date.now().toString().slice(-6)}`

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

    // Check for existing reservations at the same time (basic conflict check)
    const existingReservations = await sql`
      SELECT COUNT(*) as count 
      FROM reservations 
      WHERE reservation_date = ${reservationData.reservationDate}
        AND reservation_time = ${reservationData.reservationTime}
        AND status IN ('pending', 'confirmed')
    `

    if (existingReservations[0].count >= 5) {
      // Assuming max 5 tables
      return NextResponse.json(
        {
          error: "Sorry, that time slot is fully booked. Please choose a different time.",
        },
        { status: 409 },
      )
    }

    // Insert reservation
    const [reservation] = await sql`
      INSERT INTO reservations (
        user_id, customer_name, customer_email, customer_phone,
        party_size, reservation_date, reservation_time,
        special_requests, table_preference, occasion,
        dietary_restrictions, confirmation_code, status
      ) VALUES (
        ${user?.userId || null},
        ${reservationData.customerName},
        ${reservationData.customerEmail || null},
        ${reservationData.customerPhone},
        ${reservationData.partySize},
        ${reservationData.reservationDate},
        ${reservationData.reservationTime},
        ${reservationData.specialRequests || null},
        ${reservationData.tablePreference === "none" ? null : reservationData.tablePreference},
        ${reservationData.occasion === "none" ? null : reservationData.occasion},
        ${reservationData.dietaryRestrictions || null},
        ${confirmationCode},
        'pending'
      ) RETURNING *
    `

    return NextResponse.json({
      success: true,
      reservationId: reservation.id,
      confirmationCode: reservation.confirmation_code,
      message: "Reservation request submitted successfully! We'll confirm within 24 hours.",
    })
  } catch (error) {
    console.error("Error creating reservation:", error)
    return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 })
  }
}

export async function GET() {
  try {
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

    const reservations = await sql`
      SELECT * FROM reservations 
      ORDER BY reservation_date DESC, reservation_time DESC
      LIMIT 50
    `

    return NextResponse.json(reservations)
  } catch (error) {
    console.error("Error fetching reservations:", error)
    return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 })
  }
}
