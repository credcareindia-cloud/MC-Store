import type { Metadata } from "next"
import { buildPageMetadata } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: "Read how MotoCart collects, uses, and protects your personal information when you shop automobile spare parts online.",
  path: "/privacy-policy",
})

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return children
}
