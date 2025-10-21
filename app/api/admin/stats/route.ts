import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

/**
 * Lazily create the core tables the dashboard depends on.
 * This lets the preview environment work even if migrations
 * have not been executed yet.
 */
async function ensureSchema() {
  // Orders ----------------------------------------------------
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id                SERIAL PRIMARY KEY,
      customer_name     VARCHAR(200) NOT NULL,
      customer_email    VARCHAR(200),
      customer_phone    VARCHAR(50)  NOT NULL,
      order_type        VARCHAR(50)  DEFAULT 'dine-in',
      table_number      INTEGER,
      delivery_address  TEXT,
      total_amount      DECIMAL(10,2) NOT NULL,
      tax_amount        DECIMAL(10,2) DEFAULT 0,
      delivery_fee      DECIMAL(10,2) DEFAULT 0,
      final_total       DECIMAL(10,2) NOT NULL,
      currency          VARCHAR(10)  DEFAULT 'AED',
      status            VARCHAR(50)  DEFAULT 'pending',
      special_instructions TEXT,
      estimated_completion_time TIMESTAMP,
      created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `

  // Add currency column if it doesn't exist (for existing tables)
  await sql`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'AED';
  `

  // Add order_number column if it doesn't exist
  await sql`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(50);
  `

  // Order items ----------------------------------------------
  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id              SERIAL PRIMARY KEY,
      order_id        INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      menu_item_id    INTEGER,
      menu_item_name  VARCHAR(200) NOT NULL,
      quantity        INTEGER NOT NULL,
      unit_price      DECIMAL(10,2) NOT NULL,
      total_price     DECIMAL(10,2) NOT NULL,
      special_requests TEXT,
      created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `

  // Reservations ---------------------------------------------
  await sql`
    CREATE TABLE IF NOT EXISTS reservations (
      id                 SERIAL PRIMARY KEY,
      customer_name      VARCHAR(200) NOT NULL,
      customer_email     VARCHAR(200),
      customer_phone     VARCHAR(50) NOT NULL,
      party_size         INTEGER NOT NULL CHECK (party_size > 0),
      reservation_date   DATE NOT NULL,
      reservation_time   TIME NOT NULL,
      status             VARCHAR(50) DEFAULT 'pending',
      special_requests   TEXT,
      table_preference   VARCHAR(100),
      occasion           VARCHAR(100),
      dietary_restrictions TEXT,
      confirmation_code  VARCHAR(20) UNIQUE,
      created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `

  // Users table already exists, no need to create
}

/**
 * GET /api/admin/stats
 * Returns high-level metrics for the admin dashboard.
 */
export async function GET() {
  try {
    // Make sure the required tables exist
    await ensureSchema()

    // Aggregate metrics ----------------------------------------------------
    const [{ total_revenue_aed }] = await sql`
      SELECT COALESCE(SUM(final_total), 0) AS total_revenue_aed
      FROM orders
      WHERE (status = 'completed' OR status = 'delivered') AND COALESCE(currency, 'AED') = 'AED'
    `

    const [{ total_revenue_inr }] = await sql`
      SELECT COALESCE(SUM(final_total), 0) AS total_revenue_inr
      FROM orders
      WHERE (status = 'completed' OR status = 'delivered') AND COALESCE(currency, 'AED') = 'INR'
    `

    // Debug query to see what data we have
    const debugData = await sql`
      SELECT
        currency,
        status,
        COUNT(*) as count,
        SUM(final_total) as total
      FROM orders
      GROUP BY currency, status
      ORDER BY currency, status
    `

    // Additional debug - check completed orders specifically
    const completedOrdersDebug = await sql`
      SELECT
        id,
        customer_name,
        currency,
        status,
        final_total
      FROM orders
      WHERE (status = 'completed' OR status = 'delivered')
      LIMIT 10
    `

    const [{ total_orders }] = await sql`
      SELECT COUNT(*)::int AS total_orders
      FROM orders
    `

    const [{ pending_orders }] = await sql`
      SELECT COUNT(*)::int AS pending_orders
      FROM orders
      WHERE status IN ('pending')
    `

    // const [{ today_reservations }] = await sql`
    //   SELECT COUNT(*)::int AS today_reservations
    //   FROM reservations
    //   WHERE reservation_date = CURRENT_DATE
    //     AND status IN ('pending', 'confirmed')
    // `

    // Recent activity ------------------------------------------------------
    const recentOrders = await sql`
      SELECT id,
             order_number,
             customer_name,
             total_amount,
             COALESCE(currency, 'AED') as currency,
             status,
             created_at,
             order_type
      FROM   orders
      ORDER  BY created_at DESC
      LIMIT  10
    `

    const recentUsers = await sql`
      SELECT u.id,
             u.name,
             u.email,
             u.phone,
             COALESCE(user_stats.total_orders, 0) as total_orders,
             COALESCE(user_stats.total_spent, 0) as total_spent,
             u.created_at
      FROM   users u
      LEFT JOIN (
        SELECT
          customer_email,
          COUNT(*) as total_orders,
          SUM(final_total) as total_spent
        FROM orders
        WHERE (status = 'completed' OR status = 'delivered') AND customer_email IS NOT NULL
        GROUP BY customer_email
      ) user_stats ON (u.email = user_stats.customer_email)
      WHERE u.name IS NOT NULL
      ORDER  BY u.created_at DESC
      LIMIT  10
    `

    const upcomingReservations = await sql`
      SELECT id,
             customer_name,
             party_size,
             reservation_date,
             reservation_time,
             status
      FROM   reservations
      WHERE  reservation_date >= CURRENT_DATE
        AND  status IN ('pending', 'confirmed')
      ORDER  BY reservation_date, reservation_time
      LIMIT  10
    `

    const monthlyRevenue = await sql`
      SELECT DATE_TRUNC('month', created_at) AS month,
             SUM(final_total)::numeric   AS revenue,
             COUNT(*)::int               AS orders
      FROM   orders
      WHERE  (status = 'completed' OR status = 'delivered')
        AND  created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP  BY 1
      ORDER  BY month DESC
    `

    const totalOrders = total_orders // Declare totalOrders variable
    const pendingOrders = pending_orders // Declare pendingOrders variable

    // console.log('Debug data:', debugData)
    // console.log('AED Revenue:', total_revenue_aed, 'INR Revenue:', total_revenue_inr)
    // console.log('Completed orders debug:', completedOrdersDebug)

    return NextResponse.json({
      totalRevenueAED: Number(total_revenue_aed),
      totalRevenueINR: Number(total_revenue_inr),
      totalOrders,
      pendingOrders,
      // todayReservations: today_reservations,
      recentOrders,
      recentUsers,
      upcomingReservations,
      monthlyRevenue,
      debugData, // Temporary for debugging
      completedOrdersDebug, // Additional debug info
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
