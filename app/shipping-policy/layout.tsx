import type { Metadata } from "next"
import { buildPageMetadata } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: "Shipping Policy",
  description: "Shipping rates, delivery timelines, and dispatch information for MotoCart orders across India.",
  path: "/shipping-policy",
})

export default function ShippingPolicyLayout({ children }: { children: React.ReactNode }) {
  return children
}
