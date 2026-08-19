import { query } from "../lib/db"

async function seedBanners() {
  console.log("🌱 Seeding ecommerce_banner records into master_data table...")

  // Check if any banners already exist
  const existing = await query(
    `SELECT id FROM master_data WHERE category = 'ecommerce_banner'`
  )

  if (existing.length > 0) {
    console.log(`ℹ️ ${existing.length} banner(s) already exist in master_data. Skipping seed.`)
    process.exit(0)
  }

  const banners = [
    {
      name: "Latest Tech Gadgets",
      notes: "Explore cutting-edge gadgets that upgrade your lifestyle with unmatched performance and modern design.",
      website: "/products",
      is_active: true,
      sort_order: 1,
      metadata: {
        subtitle: "Discover. Shop. Upgrade.",
        badgeText: "NEW ARRIVALS",
        ctaText: "Shop Now",
        secondaryCtaText: "Browse Collection",
        themeColor: "red",
        bannerType: "custom",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
        images: [
          { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop" }
        ],
        highlights: ["US, UK, UAE Shipping", "Fast Delivery"]
      }
    },
    {
      name: "Next-Gen Spatial Audio",
      notes: "Immerse yourself in crystal clear soundscapes with active noise cancellation and high-fidelity wireless audio.",
      website: "/products?category=Audio",
      is_active: true,
      sort_order: 2,
      metadata: {
        subtitle: "Pure Acoustic Precision",
        badgeText: "HOT DEAL",
        ctaText: "Explore Audio",
        secondaryCtaText: "View Specs",
        themeColor: "violet",
        bannerType: "custom",
        imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1200&auto=format&fit=crop",
        images: [
          { url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1200&auto=format&fit=crop" }
        ],
        highlights: ["30-Hr Battery", "Active ANC"]
      }
    },
    {
      name: "Smartwatches & Fitness Trackers",
      notes: "Track every step, heart rate metric, and fitness milestone with vibrant AMOLED displays and long battery life.",
      website: "/products?category=Wearables",
      is_active: true,
      sort_order: 3,
      metadata: {
        subtitle: "Track. Achieve. Excel.",
        badgeText: "BEST SELLER",
        ctaText: "Shop Wearables",
        secondaryCtaText: "Compare Models",
        themeColor: "blue",
        bannerType: "custom",
        imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1200&auto=format&fit=crop",
        images: [
          { url: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1200&auto=format&fit=crop" }
        ],
        highlights: ["Water Resistant", "ECG Sensors"]
      }
    },
    {
      name: "Smart Home & Docks",
      notes: "Transform your space with intelligent wireless hubs, high-fidelity speakers, and fast multi-device charging stands.",
      website: "/products?category=Smart%20Home",
      is_active: true,
      sort_order: 4,
      metadata: {
        subtitle: "Smarter Living Experience",
        badgeText: "FEATURED",
        ctaText: "Upgrade Now",
        secondaryCtaText: "Learn More",
        themeColor: "emerald",
        bannerType: "custom",
        imageUrl: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?q=80&w=1200&auto=format&fit=crop",
        images: [
          { url: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?q=80&w=1200&auto=format&fit=crop" }
        ],
        highlights: ["Voice Control", "100% Safe"]
      }
    }
  ]

  for (const b of banners) {
    await query(
      `INSERT INTO master_data (device_id, category, name, notes, website, is_active, sort_order, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [1, "ecommerce_banner", b.name, b.notes, b.website, b.is_active, b.sort_order, JSON.stringify(b.metadata)]
    )
  }

  console.log("✅ Successfully inserted default ecommerce_banner records into master_data!")
  process.exit(0)
}

seedBanners().catch((err) => {
  console.error("❌ Seed Error:", err)
  process.exit(1)
})
