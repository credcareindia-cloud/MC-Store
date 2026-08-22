"use client"

export const dynamic = "force-dynamic"

import LandingNavbar from "@/components/ui/landing-navbar"
import Footer from "@/components/ui/footer"
import EcommerceHeroCarousel from "@/components/sections/ecommerce-hero-carousel"
import TrendingProducts from "@/components/sections/trending-products"
import VisitShopSection from "@/components/sections/visit-shop-section"
import AboutSection from "@/components/sections/about-section"
import TrustHighlights from "@/components/sections/trust-highlights"
import NewUserSpinnerSection from "@/components/sections/new-user-spinner-section"
import { useAuth } from "@/lib/contexts/auth-context"

export default function LandingPageClient() {
  const { isAuthenticated } = useAuth()

  return (
    <main className="min-h-screen bg-white text-zinc-900 antialiased">
      <LandingNavbar />
      <EcommerceHeroCarousel />

      {!isAuthenticated && <NewUserSpinnerSection />}

      <TrendingProducts limit={8} />
      <VisitShopSection />
      <AboutSection />
      <TrustHighlights />
      <Footer />
    </main>
  )
}
