import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET() {
  try {
    const settings = await sql`
      SELECT key, value, type 
      FROM settings 
      WHERE key IN (
        'popup_enabled',
        'popup_initial_delay', 
        'popup_interval',
        'popup_max_shows',
        'floating_ad_enabled',
        'floating_ad_scroll_trigger',
        'floating_ad_duration', 
        'floating_ad_cooldown',
        'floating_ad_max_shows',
        'default_shop',
        'shop_switch_enabled'
      )
    `

    // Convert to key-value object with defaults
    const settingsObj = {
      popup_enabled: 'false',
      popup_initial_delay: '10',
      popup_interval: '15', 
      popup_max_shows: '2',
      floating_ad_enabled: 'false',
      floating_ad_scroll_trigger: '400',
      floating_ad_duration: '2',
      floating_ad_cooldown: '4',
      floating_ad_max_shows: '3',
      default_shop: 'A',
      shop_switch_enabled: 'false'
    }

    // Override with database values
    settings.forEach((setting: any) => {
      settingsObj[setting.key as keyof typeof settingsObj] = setting.value
    })

    return NextResponse.json(settingsObj)
  } catch (error) {
    console.error("Failed to fetch shop features settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json()

    // Validate the setting key
    const validKeys = [
      'popup_enabled',
      'popup_initial_delay', 
      'popup_interval',
      'popup_max_shows',
      'floating_ad_enabled',
      'floating_ad_scroll_trigger',
      'floating_ad_duration', 
      'floating_ad_cooldown',
      'floating_ad_max_shows',
      'default_shop',
      'shop_switch_enabled'
    ]

    if (!validKeys.includes(key)) {
      return NextResponse.json(
        { error: "Invalid setting key" },
        { status: 400 }
      )
    }

    // Update or insert the setting
    await sql`
      INSERT INTO settings (key, value, type, category, label, description)
      VALUES (
        ${key}, 
        ${value}, 
        'text',
        'shop_features',
        ${key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())},
        'Shop features configuration'
      )
      ON CONFLICT (key) 
      DO UPDATE SET 
        value = EXCLUDED.value,
        updated_at = CURRENT_TIMESTAMP
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update shop features setting:", error)
    return NextResponse.json(
      { error: "Failed to update setting" },
      { status: 500 }
    )
  }
}
