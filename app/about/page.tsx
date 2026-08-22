export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import AboutPageClient from "./about-client"
import { buildPageMetadata } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: "About Us",
  description:
    "MotoCart supplies automobile spare parts and riding accessories with reliable quality and nationwide delivery across India. Visit our Kottakkal store.",
  path: "/about",
  keywords: [
    "motocart",
    "motoclub kottakkal",
    "automobile parts India",
    "bike spare parts",
    "riding accessories",
  ],
})

export default function AboutPage() {
  return <AboutPageClient />
}
