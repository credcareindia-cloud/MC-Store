import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { currentUser } from "@clerk/nextjs/server"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

async function getAuthenticatedUser() {
  const clerkUser = await currentUser()
  if (clerkUser) {
    return {
      userId: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress || "",
      isClerkUser: true
    }
  }

  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value
    if (!token) return null
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return { userId: payload.userId as number, email: payload.email as string, isClerkUser: false }
  } catch {
    return null
  }
}

async function ensureAddressesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS user_addresses (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      label VARCHAR(50) DEFAULT 'Home',
      street TEXT NOT NULL,
      landmark TEXT,
      area TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode VARCHAR(10) NOT NULL,
      country TEXT DEFAULT 'India',
      is_default BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    await ensureAddressesTable()

    const addresses = await sql`
      SELECT * FROM user_addresses 
      WHERE user_id = ${user.userId.toString()}
      ORDER BY is_default DESC, updated_at DESC
    `

    return NextResponse.json(addresses)
  } catch (error) {
    console.error("Error fetching addresses:", error)
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    await ensureAddressesTable()

    const body = await request.json()
    const { label, street, landmark, area, city, state, pincode, country, is_default } = body

    const missing = []
    if (!street) missing.push('street')
    if (!area) missing.push('area')
    if (!city) missing.push('city')
    if (!state) missing.push('state')
    if (!pincode) missing.push('pincode')
    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 })
    }

    if (is_default) {
      await sql`
        UPDATE user_addresses SET is_default = false 
        WHERE user_id = ${user.userId.toString()}
      `
    }

    const [address] = await sql`
      INSERT INTO user_addresses (user_id, label, street, landmark, area, city, state, pincode, country, is_default)
      VALUES (
        ${user.userId.toString()},
        ${label || 'Home'},
        ${street},
        ${landmark || ''},
        ${area},
        ${city},
        ${state},
        ${pincode},
        ${country || 'India'},
        ${is_default || false}
      )
      RETURNING *
    `

    return NextResponse.json(address)
  } catch (error) {
    console.error("Error saving address:", error)
    return NextResponse.json({ error: "Failed to save address" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const addressId = searchParams.get("id")

    if (!addressId) {
      return NextResponse.json({ error: "Address ID required" }, { status: 400 })
    }

    await sql`
      DELETE FROM user_addresses 
      WHERE id = ${parseInt(addressId)} AND user_id = ${user.userId.toString()}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting address:", error)
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 })
  }
}
