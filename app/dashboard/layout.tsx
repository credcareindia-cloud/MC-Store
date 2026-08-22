import type { Metadata } from "next"
import { buildPageMetadata } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: "My Account",
  path: "/dashboard",
  noIndex: true,
})

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
