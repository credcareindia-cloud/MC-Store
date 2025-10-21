import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

/**
 * Public endpoint – returns all available menu items joined with their category.
 *
 * 1. Ensures both `categories` and `menu_items` tables exist (idempotent).
 * 2. Seeds a single demo record the very first time so the UI has data.
 * 3. Returns items ordered by category and item name.
 *
 * NOTE: In production you would use migrations; we provision the schema
 * here so the preview never crashes with “relation … does not exist”.
 */
export async function GET() {
  try {
    /* ───────────────────────────────────────────────────────────────
       1. AUTO-PROVISION SCHEMA (idempotent)
    ────────────────────────────────────────────────────────────────*/
    await sql`CREATE TABLE IF NOT EXISTS categories (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      image_url   TEXT,
      is_active   BOOLEAN      DEFAULT TRUE,
      is_special  BOOLEAN      DEFAULT FALSE,
      sort_order  INTEGER      DEFAULT 0,
      created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
    );`

    await sql`CREATE TABLE IF NOT EXISTS menu_items (
      id               SERIAL PRIMARY KEY,
      name             VARCHAR(200) NOT NULL,
      description      TEXT,
      price            NUMERIC(10,2) NOT NULL,
      image_url        TEXT,
      category_id      INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      is_available     BOOLEAN DEFAULT TRUE,
      is_featured      BOOLEAN DEFAULT FALSE,
      ingredients      TEXT[],
      allergens        TEXT[],
      preparation_time INTEGER,
      created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`

    /* ───────────────────────────────────────────────────────────────
       2. SEED MINIMAL DATA ON FIRST RUN
    ────────────────────────────────────────────────────────────────*/
    // Ensure “Today’s Special” exists
    // const [{ id: todaysId }] = await sql`
    //   INSERT INTO categories (name, description, is_special, sort_order)
    //   VALUES ('Today''s Special', 'Chef''s picks for today', TRUE, 0)
    //   ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    //   RETURNING id;
    // `

    // Add a sample item if menu_items is empty
    await sql`
      INSERT INTO menu_items (name, description, price, category_id, is_featured)
      SELECT 'Signature Truffle Pasta',
             'House-made tagliatelle, black truffle cream, aged parmesan.',
             29.00,
             ${todaysId},
             TRUE
      WHERE NOT EXISTS (SELECT 1 FROM menu_items);
    `

    /* ───────────────────────────────────────────────────────────────
       3. FETCH ITEMS FOR THE FRONTEND
    ────────────────────────────────────────────────────────────────*/
    const items = await sql`
      SELECT
        m.*,
        c.name AS category_name
      FROM menu_items m
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE m.is_available = TRUE
      ORDER BY c.sort_order, c.name, m.name;
    `

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Error fetching menu items:", error)
    return NextResponse.json(
      { error: "Failed to fetch menu items", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
