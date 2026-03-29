import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

/**
 * Public settings endpoint
 *
 * 1. Auto-provisions the `settings` table (idempotent).
 * 2. Seeds comprehensive defaults so the UI always has data.
 * 3. Returns a flat key → value record for quick lookup on the client.
 */
export async function GET() {
  try {
    /* ────────────────────────────────────────────────────────────
       1. Ensure the table exists (preview-friendly)
    ────────────────────────────────────────────────────────────*/
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id         SERIAL PRIMARY KEY,
        key        VARCHAR(100) UNIQUE NOT NULL,
        value      TEXT,
        type       VARCHAR(50) DEFAULT 'text',
        category   VARCHAR(50) DEFAULT 'general',
        label      VARCHAR(200),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    /* ────────────────────────────────────────────────────────────
       2. Seed comprehensive defaults only on first run
    ────────────────────────────────────────────────────────────*/
    await sql`
      INSERT INTO settings (key, value, type, category, label, description) VALUES
      ('restaurant_name', 'Motoclub', 'text', 'general', 'Restaurant Name', 'The name of your restaurant'),
      ('restaurant_logo', '', 'image', 'appearance', 'Restaurant Logo', 'Upload your restaurant logo'),
      ('currency_code', 'INR', 'text', 'payment', 'Currency Code', 'Currency code (USD, EUR, GBP, etc.)'),
      ('currency_symbol', '₹', 'text', 'payment', 'Currency Symbol', 'Currency symbol to display'),
      ('address_line1', 'Moto club Kottakkal, Thoppil tower, Parakkori, Puthoor', 'text', 'contact', 'Address Line 1', 'Street address'),
      ('address_line2', 'Kottakkal, Malappuram dist., Kerala', 'text', 'contact', 'Address Line 2', 'Additional address info'),
      ('city', '', 'text', 'contact', 'City', 'City name'),
      ('state', '', 'text', 'contact', 'State/Province', 'State or province'),
      ('postal_code', '676503', 'text', 'contact', 'Postal Code', 'ZIP or postal code'),
      ('country', 'India', 'text', 'contact', 'Country', 'Country name'),
      ('phone', '99954 42239', 'text', 'contact', 'Phone Number', 'Primary phone number'),
      ('email', 'motoclubkottakkal@gmail.com', 'text', 'contact', 'Email Address', 'Primary email address'),
      ('website', 'https://motoclub.in', 'text', 'contact', 'Website URL', 'Restaurant website'),
      ('opening_hours', '{"monday": "5:00 PM - 10:00 PM", "tuesday": "5:00 PM - 10:00 PM", "wednesday": "5:00 PM - 10:00 PM", "thursday": "5:00 PM - 10:00 PM", "friday": "5:00 PM - 11:00 PM", "saturday": "5:00 PM - 11:00 PM", "sunday": "4:00 PM - 9:00 PM"}', 'json', 'general', 'Opening Hours', 'Restaurant opening hours'),
      ('social_facebook', '', 'text', 'contact', 'Facebook URL', 'Facebook page URL'),
      ('social_instagram', '', 'text', 'contact', 'Instagram URL', 'Instagram profile URL'),
      ('social_twitter', '', 'text', 'contact', 'Twitter URL', 'Twitter profile URL')
      ON CONFLICT (key) DO NOTHING;
    `

    /* ────────────────────────────────────────────────────────────
       3. Fetch & return as a key-value object
    ────────────────────────────────────────────────────────────*/
    const rows = await sql`SELECT key, value FROM settings;`

    const settings = rows.reduce(
      (acc, cur) => {
        acc[cur.key] = cur.value
        return acc
      },
      {} as Record<string, string>,
    )

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
