"use client"

import { Suspense, useEffect } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/lib/store"
import { fetchProducts, fetchCategories, setSelectedCategory } from "@/lib/store/slices/productSlice"
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