"use client"

import { Suspense, useEffect } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/lib/store"
import { fetchProducts, fetchCategories, setSelectedCategory } from "@/lib/store/slices/productSlice"
import { useShop } from "@/lib/contexts/shop-context"
import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"
import { useSearchParams } from "next/navigation"
import NewUserSpinnerSection from "@/components/sections/new-user-spinner-section"
import Services from "@/components/sections/services"
import ProductList from "@/components/sections/product-list"
import { useAuth } from "@/lib/contexts/auth-context"

function ProductsContent() {
  const { isAuthenticated } = useAuth() 
  const dispatch = useDispatch<AppDispatch>()
  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get("category")
  const { shop } = useShop();

  // Theme colors
  const theme = shop === "A"
    ? {
      accent: "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black border-yellow-400",
      badge: "bg-yellow-400 text-black",
      price: "text-yellow-600",
      shadow: "shadow-gold",
      btn: "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black border-yellow-400",
      star: "fill-yellow-400 text-yellow-400",
    }
    : {
      accent: "bg-gradient-to-r from-gray-200 via-gray-300 to-white text-gray-900 border-gray-400",
      badge: "bg-gradient-to-r from-gray-300 via-gray-400 to-white text-gray-900 border-gray-400",
      price: "text-gray-500",
      shadow: "shadow-platinum",
      btn: "bg-gradient-to-r from-gray-200 via-gray-300 to-white hover:from-gray-300 hover:to-gray-400 text-gray-900 border-gray-300",
      star: "fill-gray-400 text-gray-400",
    }

  useEffect(() => {
    dispatch(fetchProducts())
    dispatch(fetchCategories())

    if (categoryFromUrl) {
      dispatch(setSelectedCategory(Number(categoryFromUrl)))
    }
  }, [dispatch, categoryFromUrl])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <ProductList />
       <Services />
      <Footer />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  )
}