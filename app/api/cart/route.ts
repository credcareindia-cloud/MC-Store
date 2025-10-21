import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { currentUser } from "@clerk/nextjs/server"
import jwt from 'jsonwebtoken'

async function getAuthenticatedUser(request: NextRequest) {
  try {
    const clerkUser = await currentUser()
    if (clerkUser) {
      return { id: clerkUser.id, source: 'clerk' }
    }
  } catch (error) {
    console.log('cerk auth failed:', error)
  }

  try {
    const cookies = request.headers.get('cookie') || ''
    const authTokenMatch = cookies.match(/auth-token=([^;]+)/)
    
    if (authTokenMatch) {
      const token = authTokenMatch[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      return { id: decoded.userId.toString(), source: 'manual' }
    }
  } catch (error) {
    console.log('anual auth failed:', error)
  }

  return null
}

export async function GET(request: NextRequest) {  
  try {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const selectedCurrency = searchParams.get('currency') || 'AED'

    await sql`
      CREATE TABLE IF NOT EXISTS carts (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        cart_data JSONB NOT NULL,
        currency VARCHAR(3) DEFAULT 'AED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `

    const cartResult = await sql`
      SELECT cart_data FROM carts 
      WHERE user_id = ${user.id}
    `

    const cart = cartResult.length > 0 ? cartResult[0].cart_data : []
    
    return NextResponse.json({ cart, total: 0 }) 
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {  
  try {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return NextResponse.json({ error: "Please login to save cart" }, { status: 401 })
    }

    const { cart, selectedCurrency = 'AED' } = await request.json()

    await sql`
      CREATE TABLE IF NOT EXISTS carts (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        cart_data JSONB NOT NULL,
        currency VARCHAR(3) DEFAULT 'AED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `

    await sql`
      INSERT INTO carts (user_id, cart_data, currency, updated_at)
      VALUES (${user.id}, ${JSON.stringify(cart)}, ${selectedCurrency}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        cart_data = ${JSON.stringify(cart)},
        currency = ${selectedCurrency},
        updated_at = CURRENT_TIMESTAMP
    `
    return NextResponse.json({ success: true, message: "Cart saved successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save cart" },
      { status: 500 }
    )
  }
}
