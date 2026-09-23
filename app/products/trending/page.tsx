"use client"

export const dynamic = "force-dynamic"

import { Suspense, useEffect } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/lib/store"
import { fetchProducts, fetchCategories, setSelectedCategory } from "@/lib/store/slices/productSlice"
import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"
import { useSearchParams } from "next/navigation"
import Services from "@/components/sections/services"
import ProductList from "@/components/sections/product-list"

function TrendingProductsContent() {
  const dispatch = useDispatch<AppDispatch>()
  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get("category")
  
  // Fetching is handled internally by ProductList with trendingOnly={true}

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Title Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trending Products</h1>
          <p className="text-gray-500">Popular products customers buy</p>
        </div>
      </div>

      <ProductList trendingOnly={true} />
      <Services />
      <Footer />
    </div>
  )
}

export default function TrendingProductsPage() {
  return (
    <Suspense fallback={<div>Loading trending products...</div>}>
      <TrendingProductsContent />
    </Suspense>
  )
}
