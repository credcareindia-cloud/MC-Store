"use client"

export const dynamic = "force-dynamic"

import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"
import ProductList from "@/components/sections/product-list"
import { ProductListSkeleton } from "@/components/sections/product-list-skeleton"
import { Suspense } from "react"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
      {/* Top Navbar with Category Scrolling Bar */}
      <Navbar />

      {/* Category Sidebar Filtration & All Products Catalog */}
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList showTopPicks={false} />
      </Suspense>

      {/* Main Footer */}
      <Footer />
    </main>
  )
}
