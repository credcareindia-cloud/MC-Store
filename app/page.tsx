"use client"

export const dynamic = "force-dynamic"
import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"
import Services from "@/components/sections/services"
import NewUserSpinnerSection from "@/components/sections/new-user-spinner-section"
import UserCoupons from "@/components/sections/user-coupons"
import TrendingProducts from "@/components/sections/trending-products"
import ProductList from "@/components/sections/product-list"
import { ProductListSkeleton } from "@/components/sections/product-list-skeleton"
import { useAuth } from "@/lib/contexts/auth-context"
import { Suspense } from "react"

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  return (
    <main className="min-h-screen">

      <Navbar />
      {!isAuthenticated && <NewUserSpinnerSection />}

      {/* Trending Products Section powered by ERP PostgreSQL sales data */}
      <TrendingProducts limit={8} />

      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList />
      
      </Suspense>
      <Services />
      <Footer />
    </main>
  )
}