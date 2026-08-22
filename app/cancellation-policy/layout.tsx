import type { Metadata } from "next"
import { buildPageMetadata } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: "Cancellation Policy",
  description: "Order cancellation rules and timelines for MotoCart purchases.",
  path: "/cancellation-policy",
})

export default function CancellationPolicyLayout({ children }: { children: React.ReactNode }) {
  return children
}
