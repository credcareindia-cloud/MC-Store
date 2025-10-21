import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { clerkId, email, name, phone } = await request.json()

    if (!clerkId || !email) {
      return NextResponse.json(
        { error: "Clerk ID and email are required" },
        { status: 400 }
      )
    }

    // Check if user already exists in database
    const existingUser = await sql`
      SELECT id, email, name, phone, clerk_id, created_at 
      FROM users 
      WHERE clerk_id = ${clerkId} OR email = ${email}
      LIMIT 1
    `

    if (existingUser.length > 0) {
      const user = existingUser[0]
      
      // Update user info if needed (in case name or phone changed)
      const updatedUser = await sql`
        UPDATE users 
        SET 
          name = COALESCE(${name}, name),
          phone = COALESCE(${phone}, phone),
          clerk_id = ${clerkId},
          is_verified = true,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${user.id}
        RETURNING id, email, name, phone, clerk_id, is_verified, created_at, updated_at
      `

      return NextResponse.json({
        success: true,
        user: updatedUser[0],
        action: 'updated'
      })
    }

    // Create new user in database
    const newUser = await sql`
      INSERT INTO users (clerk_id, email, name, phone, is_verified, created_at, updated_at)
      VALUES (${clerkId}, ${email}, ${name || ''}, ${phone || ''}, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, email, name, phone, clerk_id, is_verified, created_at, updated_at
    `

    return NextResponse.json({
      success: true,
      user: newUser[0],
      action: 'created'
    })

  } catch (error) {
    console.error("Error syncing Clerk user to database:", error)
    return NextResponse.json(
      { error: "Failed to sync user to database" },
      { status: 500 }
    )
  }
}
