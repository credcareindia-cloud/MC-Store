import type { Metadata } from "next"
import { buildPageMetadata } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Service",
  description: "Terms and conditions for shopping automobile spare parts and accessories at MotoCart.",
  path: "/terms-of-service",
})

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children
}
