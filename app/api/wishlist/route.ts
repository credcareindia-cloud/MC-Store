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
    console.log('Clerk auth failed:', error)
  }

  try {
    const cookies = request.headers.get('cookie') || ''
    const authTokenMatch = cookies.match(/auth-token=([^;]+)/)
    
    if (authTokenMatch) {
      const token = authTokenMatch[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      console.log('manual auth user found:', decoded.userId)
      return { id: decoded.userId.toString(), source: 'manual' }
    }
  } catch (error) {
    console.log('manual auth failed:', error)
  }

  return null
}

export async function GET(request: NextRequest) {
  
  try {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await sql`
      CREATE TABLE IF NOT EXISTS wishlists (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        product_id INTEGER NOT NULL,
        product_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `

    const wishlistItems = await sql`
      SELECT product_data 
      FROM wishlists 
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `

    const items = wishlistItems.map(item => item.product_data)    
    return NextResponse.json({ items })
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  
  try {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return NextResponse.json({ error: "Please login to add items to wishlist" }, { status: 401 })
    }

    const { product } = await request.json()

    if (!product || !product.id) {
      return NextResponse.json({ error: "Product data is required" }, { status: 400 })
    }

    await sql`
      CREATE TABLE IF NOT EXISTS wishlists (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        product_id INTEGER NOT NULL,
        product_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `

    await sql`
      INSERT INTO wishlists (user_id, product_id, product_data)
      VALUES (${user.id}, ${product.id}, ${JSON.stringify(product)})
      ON CONFLICT (user_id, product_id) DO NOTHING
    `
    return NextResponse.json({ success: true, message: "Product added to wishlist" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {  
  try {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    await sql`
      DELETE FROM wishlists 
      WHERE user_id = ${user.id} AND product_id = ${parseInt(productId)}
    `
    return NextResponse.json({ success: true, message: "Product removed from wishlist" })
  } catch (error) {
    console.error("error removing from wishlist:", error)
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 }
    )
  }
}
