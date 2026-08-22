import type { Metadata } from "next"
import { buildPageMetadata } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: "Wishlist",
  path: "/wishlist",
  noIndex: true,
})

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children
}
