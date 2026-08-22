import type { Metadata } from "next"
import HomeJsonLd from "@/components/seo/home-json-ld"
import LandingPageClient from "@/app/landing-page-client"
import { buildPageMetadata, SITE_DESCRIPTION, SITE_TAGLINE } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: SITE_TAGLINE,
  description: SITE_DESCRIPTION,
  path: "/",
})

export default function RootLandingPage() {
  return (
    <>
      <HomeJsonLd />
      <LandingPageClient />
    </>
  )
}
