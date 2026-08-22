import type { Metadata } from "next"
import { buildPageMetadata } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: "Contact Us",
  description:
    "Contact MotoCart for fitment help, bulk orders, and product inquiries. Call, WhatsApp, or visit our Kottakkal store in Kerala.",
  path: "/contact",
})

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
