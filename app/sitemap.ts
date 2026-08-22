import type { MetadataRoute } from "next"
import { getSiteUrl } from "@/lib/seo"
import { getCategories, getProducts } from "@/lib/services/product-service"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl()
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/shipping-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms-of-service`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/return-refund-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/cancellation-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ]

  let categoryRoutes: MetadataRoute.Sitemap = []
  let productRoutes: MetadataRoute.Sitemap = []

  try {
    const categories = await getCategories()
    categoryRoutes = categories
      .filter((category) => category.product_count > 0)
      .map((category) => ({
        url: `${baseUrl}/products?category=${category.id}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.75,
      }))
  } catch (error) {
    console.error("[sitemap] Failed to load categories:", error)
  }

  try {
    const { items } = await getProducts({ page: 1, limit: 5000, sortBy: "newest" })
    productRoutes = items.map((product) => ({
      url: `${baseUrl}/product/${product.id}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.error("[sitemap] Failed to load products:", error)
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
