"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCurrency } from "@/lib/contexts/currency-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Flame, ShoppingCart, ArrowRight, RefreshCw, ChevronRight, PackageCheck } from "lucide-react"
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

interface TrendingProduct {
  id: number
  name: string
  slug: string
  price: number
  price_aed?: number | null
  price_inr?: number | null
  image?: string | null
  image_url?: string | null
  image_urls?: string[]
  stock: number
  stock_quantity?: number
  category: string
  category_name?: string
  brand?: string
  is_available?: boolean
  variants?: Variant[]
}

interface TrendingProductsProps {
  limit?: number
  title?: string
  subtitle?: string
}

export default function TrendingProducts({
  limit = 8,
  title = "Trending Products",
  subtitle = "Popular products customers buy"
}: TrendingProductsProps) {
  const [products, setProducts] = useState<TrendingProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { selectedCurrency, formatPriceWithSmallDecimals, getCurrencySymbol } = useCurrency()
  const router = useRouter()

  const fetchTrendingProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/store/trending-products?limit=${limit}`)
      if (!res.ok) {
        throw new Error(`Failed to fetch trending products (HTTP ${res.status})`)
      }
      const data = await res.json()
      setProducts(data.products || [])
    } catch (err) {
      console.error("[TrendingProducts] Fetch error:", err)
      setError(err instanceof Error ? err.message : "Failed to load trending products")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrendingProducts()
  }, [limit])

  const handleProductClick = (product: TrendingProduct) => {
    router.push(`/product/${product.id}`)
  }

  const getPriceInfo = (product: TrendingProduct) => {
    const isAED = selectedCurrency === "AED"
    const variant = product.variants?.[0]

    let price = isAED ? (product.price_aed ?? product.price / 22.5) : (product.price_inr ?? product.price)
    if (variant) {
      const isAvailable = isAED ? variant.available_aed : variant.available_inr
      if (isAvailable) {
        price = isAED ? variant.price_aed : variant.price_inr
      }
    }

    return { price, originalPrice: price, hasDiscount: false }
  }

  return (
    <section className="py-8 lg:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                Hot Selling
              </span>
            </div>
            <h2 className="text-xl lg:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {title}
            </h2>
            <p className="text-xs lg:text-sm text-zinc-500 mt-1">
              {subtitle}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/products")}
            className="text-zinc-700 hover:text-zinc-900 font-medium text-xs lg:text-sm flex items-center gap-1"
          >
            View All Catalog
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="animate-pulse bg-zinc-50 rounded-2xl p-4 border border-zinc-100 flex flex-col">
                <div className="bg-zinc-200 aspect-square rounded-xl mb-3" />
                <div className="h-3 bg-zinc-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-zinc-200 rounded w-3/4 mb-3" />
                <div className="h-5 bg-zinc-200 rounded w-1/2 mt-auto" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-md mx-auto my-4">
            <p className="text-sm font-medium text-rose-800 mb-3">{error}</p>
            <Button
              onClick={fetchTrendingProducts}
              variant="outline"
              size="sm"
              className="border-rose-300 text-rose-800 hover:bg-rose-100"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl p-8 text-center max-w-md mx-auto my-4">
            <PackageCheck className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-700">No trending products found</p>
            <p className="text-xs text-zinc-500 mt-1">Check back later for updated top sales items.</p>
          </div>
        )}

        {/* Trending Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
            {products.map((product) => {
              const { price, originalPrice, hasDiscount } = getPriceInfo(product)
              const stockQty = product.stock_quantity ?? product.stock ?? 0
              const mainImage = product.image || product.image_url || product.image_urls?.[0] || "/placeholder.svg"
              const categoryName = product.category || product.category_name || "Motorcycle Parts"
              const discountPercent = hasDiscount && originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="group cursor-pointer bg-white rounded-2xl border border-zinc-200/80 hover:border-zinc-300 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square bg-zinc-50 p-4 flex items-center justify-center overflow-hidden">
                    <Image
                      src={mainImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                      <span className="bg-zinc-900 text-white text-[10px] lg:text-xs font-bold px-2 py-0.5 rounded-md leading-none shadow-sm">
                        TRENDING
                      </span>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-3 lg:p-4 flex-1 flex flex-col">
                    {/* Category */}
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 truncate">
                      {categoryName}
                    </p>

                    {/* Product Title */}
                    <h3 className="font-semibold text-zinc-900 text-xs lg:text-sm line-clamp-2 leading-snug mb-2 group-hover:text-amber-600 transition-colors">
                      {product.name}
                    </h3>

                    {/* Pricing - ONLY MRP */}
                    <div className="mt-auto pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm lg:text-base font-extrabold text-zinc-900">
                            {formatPriceWithSmallDecimals(
                              selectedCurrency === "AED" ? price : undefined,
                              selectedCurrency === "INR" ? price : undefined,
                              selectedCurrency,
                              true,
                              "#18181b"
                            )}
                          </span>
                        </div>
                        {/* Stock status */}
                        <div className="mt-0.5">
                          {stockQty > 5 ? (
                            <span className="text-[10px] font-medium text-emerald-600">In Stock</span>
                          ) : stockQty > 0 ? (
                            <span className="text-[10px] font-medium text-amber-600">Only {stockQty} left</span>
                          ) : (
                            <span className="text-[10px] font-medium text-rose-500">Out of Stock</span>
                          )}
                        </div>
                      </div>

                      {/* View product button */}
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleProductClick(product)
                        }}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl px-3 py-1.5 text-xs font-semibold shrink-0"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
