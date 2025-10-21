import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET() {
  try {
    // Get counts for each order status
    const statusCounts = await sql`
      SELECT 
        status,
        COUNT(*)::int as count
      FROM orders 
      GROUP BY status
      ORDER BY status
    `

    // Get total orders
    const [{ total_orders }] = await sql`
      SELECT COUNT(*)::int as total_orders FROM orders
    `

    // Get today's orders
    const [{ today_orders }] = await sql`
      SELECT COUNT(*)::int as today_orders 
      FROM orders 
      WHERE DATE(created_at) = CURRENT_DATE
    `

    // Get this week's orders (last 7 days)
    const [{ week_orders }] = await sql`
      SELECT COUNT(*)::int as week_orders 
      FROM orders 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    `

    // Get this month's orders (current calendar month)
    const [{ month_orders }] = await sql`
      SELECT COUNT(*)::int as month_orders 
      FROM orders 
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `

    // Convert status counts to object for easier access
    const statusStats = statusCounts.reduce((acc: any, item: any) => {
      acc[item.status] = item.count
      return acc
    }, {})

    return NextResponse.json({
      statusStats,
      totalOrders: total_orders,
      todayOrders: today_orders,
      weekOrders: week_orders,
      monthOrders: month_orders,
      // Individual status counts for easy access
      pending: statusStats.pending || 0,
      confirmed: statusStats.confirmed || 0,
      packed: statusStats.packed || 0,
      dispatched: statusStats.dispatched || 0,
      outForDelivery: statusStats['out for delivery'] || 0,
      delivered: statusStats.delivered || 0,
      cancelled: statusStats.cancel || 0
    })

  } catch (error) {
    console.error('Error fetching order stats:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch order stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
