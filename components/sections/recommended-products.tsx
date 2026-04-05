"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCurrency } from "@/lib/contexts/currency-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronRight } from "lucide-react"
import Image from "next/image"

interface Variant {
  id: number
  name: string
  price_aed: number
  price_inr: number
  discount_aed?: number
  discount_inr?: number
  available_aed: boolean
  available_inr: boolean
  stock_quantity: number
}

interface Product {
  id: number
  name: string
  description: string
  image_urls: string[]
  category_id: number
  category_name: string
  is_available: boolean
  is_featured: boolean
  is_new: boolean
  brand?: string
  model?: string
  shop_category: string
  variants: Variant[]
}

interface RecommendedProductsProps {
  currentProductId: number
  categoryId: number
}

export default function RecommendedProducts({ 
  currentProductId, 
  categoryId, 
}: RecommendedProductsProps) {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { selectedCurrency, getCurrencySymbol } = useCurrency()
  const router = useRouter()

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        setLoading(true)
        
        const response = await fetch(`/api/products/recommended?categoryId=${categoryId}&excludeId=${currentProductId}&limit=8`)
        
        if (response.ok) {
          const data = await response.json()
          setRecommendedProducts(data.products || [])
        }
      } catch (error) {
        console.error('Error fetching recommended products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendedProducts()
  }, [currentProductId, categoryId])

  const getProductPrice = (product: Product) => {
    if (!product.variants || product.variants.length === 0) {
      return { price: 0, originalPrice: 0, hasDiscount: false }
    }

    const variant = product.variants[0]
    const isAED = selectedCurrency === 'AED'
    const isAvailable = isAED ? variant.available_aed : variant.available_inr
    
    if (!isAvailable) {
      return { price: 0, originalPrice: 0, hasDiscount: false }
    }

    const price = isAED ? variant.price_aed : variant.price_inr
    const discount = isAED ? (variant.discount_aed || 0) : (variant.discount_inr || 0)
    const finalPrice = discount > 0 ? discount : price
    const hasDiscount = discount > 0 && discount < price

    return {
      price: finalPrice,
      originalPrice: hasDiscount ? price : 0,
      hasDiscount
    }
  }

  const handleProductClick = (productId: number) => {
    router.push(`/product/${productId}`)
  }

  if (loading) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-6 w-48 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 rounded-lg animate-pulse mt-2" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-100 aspect-square rounded-2xl mb-3" />
                <div className="h-3 bg-gray-100 rounded-full mb-2 w-3/4" />
                <div className="h-4 bg-gray-200 rounded-full w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (recommendedProducts.length === 0) {
    return null
  }

  const ProductCard = ({ product, compact = false }: { product: Product; compact?: boolean }) => {
    const { price, originalPrice, hasDiscount } = getProductPrice(product)
    const currencySymbol = getCurrencySymbol(selectedCurrency)
    const discountPercent = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

    return (
      <div
        className="group cursor-pointer"
        onClick={() => handleProductClick(product.id)}
      >
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100 mb-3 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-black/[0.06] group-hover:border-gray-200">
          <Image
            src={product.image_urls?.[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
          />

          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Top-left badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {hasDiscount && (
              <span className="bg-rose-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full tracking-wide">
                -{discountPercent}%
              </span>
            )}
            {product.is_new && (
              <span className="bg-emerald-500 text-white text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full">
                New
              </span>
            )}
          </div>

          {/* Quick view pill on hover */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <span className="bg-zinc-900/90 backdrop-blur-sm text-white text-xs font-medium px-4 py-1.5 rounded-full whitespace-nowrap">
              Quick View
            </span>
          </div>
        </div>

        {/* Product info */}
        <div className={compact ? "px-0.5" : "px-1"}>
          {product.brand && (
            <p className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">
              {product.brand}
            </p>
          )}
          <h3 className={`font-medium text-gray-900 line-clamp-2 group-hover:text-zinc-600 transition-colors leading-snug ${compact ? "text-xs" : "text-sm"}`}>
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 mt-1.5">
            {price > 0 ? (
              <>
                <span className={`font-bold text-gray-900 ${compact ? "text-sm" : "text-base"}`}>
                  {currencySymbol}{price.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-gray-400 line-through">
                    {currencySymbol}{originalPrice.toLocaleString()}
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-400">Unavailable</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              You Might Also Like
            </h2>
            <p className="text-sm text-gray-500 mt-1 hidden sm:block">
              Similar products picked for you
            </p>
          </div>
          <button
            onClick={() => router.push(`/products?category=${categoryId}`)}
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-1 group/btn shrink-0"
          >
            View all
            <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
          </button>
        </div>

        {/* Desktop grid */}
        <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {recommendedProducts.slice(0, 5).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile horizontal scroll */}
        <div className="sm:hidden -mx-4 px-4">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {recommendedProducts.slice(0, 6).map((product) => (
              <div 
                key={product.id}
                className="flex-none w-[42%] snap-start"
              >
                <ProductCard product={product} compact />
              </div>
            ))}
            {/* "See more" card */}
            <div
              className="flex-none w-[42%] snap-start cursor-pointer group"
              onClick={() => router.push(`/products?category=${categoryId}`)}
            >
              <div className="aspect-square rounded-2xl bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 transition-all duration-300 group-hover:bg-gray-100 group-hover:border-gray-300 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                  <ArrowRight className="w-5 h-5 text-gray-500" />
                </div>
                <span className="text-xs font-medium text-gray-500">See more</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
