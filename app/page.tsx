"use client"

export const dynamic = "force-dynamic"

import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"
import EcommerceHeroCarousel from "@/components/sections/ecommerce-hero-carousel"
import TrendingProducts from "@/components/sections/trending-products"
import AboutSection from "@/components/sections/about-section"
import TrustHighlights from "@/components/sections/trust-highlights"
import NewUserSpinnerSection from "@/components/sections/new-user-spinner-section"
import { useAuth } from "@/lib/contexts/auth-context"

export default function RootLandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
      {/* Top Navbar: Clean navbar with Home (/home), About Us, Contact Us & Icons (No category scrolling bar) */}
      <Navbar />

      {/* Optional New User Promo Spinner Modal */}
      {!isAuthenticated && <NewUserSpinnerSection />}

      {/* Full-Width Auto-Sliding Image Banner Carousel from master_data (PostgreSQL) */}
      <EcommerceHeroCarousel />

      {/* Trending Products Section */}
      <TrendingProducts limit={8} />

      {/* About Company & Description Section */}
      <AboutSection />

      {/* Trust Badges & Highlights */}
      <TrustHighlights />

      {/* Main Footer */}
      <Footer />
    </main>
  )
}