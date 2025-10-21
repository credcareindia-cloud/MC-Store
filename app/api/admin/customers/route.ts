import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET() {
  try {
    // Get registered users with their order statistics
    const registeredUsers = await sql`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.created_at,
        'registered' as customer_type,
        COALESCE(user_stats.total_orders, 0) as total_orders,
        COALESCE(user_stats.total_spent_aed, 0) as total_spent_aed,
        COALESCE(user_stats.total_spent_inr, 0) as total_spent_inr
      FROM users u
      LEFT JOIN (
        SELECT
          customer_email,
          COUNT(*) as total_orders,
          SUM(CASE WHEN COALESCE(currency, 'AED') = 'AED' THEN final_total ELSE 0 END) as total_spent_aed,
          SUM(CASE WHEN COALESCE(currency, 'AED') = 'INR' THEN final_total ELSE 0 END) as total_spent_inr
        FROM orders
        WHERE (status = 'completed' OR status = 'delivered') 
          AND customer_email IS NOT NULL
        GROUP BY customer_email
      ) user_stats ON (u.email = user_stats.customer_email)
      WHERE u.name IS NOT NULL
      ORDER BY u.created_at DESC
    `

    // Get guest customers (orders without user accounts)
    const guestCustomers = await sql`
      SELECT 
        customer_name as name,
        customer_email as email,
        customer_phone as phone,
        MIN(created_at) as created_at,
        'guest' as customer_type,
        COUNT(*) as total_orders,
        SUM(CASE WHEN COALESCE(currency, 'AED') = 'AED' THEN final_total ELSE 0 END) as total_spent_aed,
        SUM(CASE WHEN COALESCE(currency, 'AED') = 'INR' THEN final_total ELSE 0 END) as total_spent_inr
      FROM orders
      WHERE (status = 'completed' OR status = 'delivered')
        AND (customer_email IS NULL OR customer_email NOT IN (
          SELECT email FROM users WHERE email IS NOT NULL
        ))
      GROUP BY customer_name, customer_email, customer_phone
      ORDER BY MIN(created_at) DESC
    `

    // Combine and sort all customers
    const allCustomers = [
      ...registeredUsers.map(user => ({
        id: user.id || null,
        name: user.name,
        email: user.email || 'No email',
        phone: user.phone || 'No phone',
        created_at: user.created_at,
        customer_type: user.customer_type,
        total_orders: parseInt(user.total_orders) || 0,
        total_spent_aed: parseFloat(user.total_spent_aed) || 0,
        total_spent_inr: parseFloat(user.total_spent_inr) || 0,
        total_spent_display: {
          aed: parseFloat(user.total_spent_aed) || 0,
          inr: parseFloat(user.total_spent_inr) || 0
        }
      })),
      ...guestCustomers.map(guest => ({
        id: null,
        name: guest.name,
        email: guest.email || 'No email',
        phone: guest.phone || 'No phone', 
        created_at: guest.created_at,
        customer_type: guest.customer_type,
        total_orders: parseInt(guest.total_orders) || 0,
        total_spent_aed: parseFloat(guest.total_spent_aed) || 0,
        total_spent_inr: parseFloat(guest.total_spent_inr) || 0,
        total_spent_display: {
          aed: parseFloat(guest.total_spent_aed) || 0,
          inr: parseFloat(guest.total_spent_inr) || 0
        }
      }))
    ]

    // Sort by total spending (AED + INR converted) and recent activity
    const sortedCustomers = allCustomers.sort((a, b) => {
      const totalA = a.total_spent_aed + (a.total_spent_inr / 22) // Convert INR to AED for sorting
      const totalB = b.total_spent_aed + (b.total_spent_inr / 22)
      
      if (totalA !== totalB) {
        return totalB - totalA // Higher spenders first
      }
      
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime() // Recent first
    })

    return NextResponse.json({
      customers: sortedCustomers,
      summary: {
        total_customers: allCustomers.length,
        registered_users: registeredUsers.length,
        guest_customers: guestCustomers.length,
        total_revenue_aed: allCustomers.reduce((sum, c) => sum + c.total_spent_aed, 0),
        total_revenue_inr: allCustomers.reduce((sum, c) => sum + c.total_spent_inr, 0)
      }
    })

  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}
