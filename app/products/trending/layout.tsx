import type { Metadata } from "next"
import { buildPageMetadata } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: "Trending Products",
  description: "Explore trending automotive products from Moto Cart.",
  path: "/products/trending",
  keywords: [
    "trending car parts",
    "trending auto accessories",
    "popular bike parts",
    "top selling car accessories",
  ],
})

export default function TrendingProductsLayout({ children }: { children: React.ReactNode }) {
  return children
}
