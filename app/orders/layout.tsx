import type { Metadata } from "next"
import { buildPageMetadata } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: "My Orders",
  path: "/orders",
  noIndex: true,
})

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return children
}
