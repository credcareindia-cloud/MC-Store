import type { Metadata } from "next"
import { buildPageMetadata } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: "Shop Automobile Spare Parts & Accessories",
  description:
    "Browse car and bike spare parts, LED lights, spoilers, stereos, and accessories. Filter by category, compare prices, and order online with delivery across India.",
  path: "/products",
  keywords: [
    "automobile spare parts online",
    "car accessories shop",
    "bike parts India",
    "LED head lights",
    "car spoilers online",
  ],
})

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children
}
