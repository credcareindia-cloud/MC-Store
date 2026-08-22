import type { Metadata } from "next"
import { buildPageMetadata } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: "Return & Refund Policy",
  description: "Learn about returns, refunds, and exchange eligibility for MotoCart automobile parts orders.",
  path: "/return-refund-policy",
})

export default function ReturnRefundLayout({ children }: { children: React.ReactNode }) {
  return children
}
