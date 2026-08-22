"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCurrency } from "@/lib/contexts/currency-context"
import { Button } from "@/components/ui/button"
import { RefreshCw, ChevronRight, PackageCheck } from "lucide-react"
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

function ProductCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-zinc-100 bg-white">
      <div className="aspect-square bg-zinc-100" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-3/4 rounded bg-zinc-100" />
        <div className="h-4 w-1/2 rounded bg-zinc-100" />
        <div className="h-3 w-1/3 rounded bg-zinc-100" />
      </div>
    </div>
  )
}

export default function TrendingProducts({
  limit = 8,
  title = "Trending Products",
  subtitle = "Popular products customers buy",
}: TrendingProductsProps) {
  const [products, setProducts] = useState<TrendingProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { selectedCurrency, formatPriceWithSmallDecimals } = useCurrency()
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

    return { price }
  }

  const renderProductCard = (product: TrendingProduct) => {
    const { price } = getPriceInfo(product)
    const stockQty = product.stock_quantity ?? product.stock ?? 0
    const mainImage = product.image || product.image_url || product.image_urls?.[0] || "/placeholder.svg"
    const categoryName = product.category || product.category_name || "Parts"

    return (
      <article
        key={product.id}
        onClick={() => handleProductClick(product)}
        className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white transition-all duration-200 active:scale-[0.98] md:rounded-2xl md:hover:border-zinc-300 md:hover:shadow-md"
      >
        <div className="relative aspect-square overflow-hidden bg-zinc-50">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105 sm:p-3 md:p-4"
          />
        </div>

        <div className="flex flex-1 flex-col p-2.5 sm:p-3 md:p-4">
          <p className="mb-1 hidden truncate text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-400 sm:block">
            {categoryName}
          </p>

          <h3 className="mb-1.5 line-clamp-2 text-xs font-medium leading-snug text-zinc-900 transition-colors group-hover:text-zinc-600 sm:mb-2 sm:text-sm md:mb-3 md:text-[15px]">
            {product.name}
          </h3>

          <div className="mt-auto space-y-0.5">
            <div className="text-xs font-bold text-zinc-900 sm:text-sm md:text-base md:font-semibold">
              {formatPriceWithSmallDecimals(
                selectedCurrency === "AED" ? price : undefined,
                selectedCurrency === "INR" ? price : undefined,
                selectedCurrency,
                true,
                "#18181b"
              )}
            </div>
            <p className="text-[10px] text-zinc-400 md:text-[11px]">
              {stockQty > 0 ? "In stock" : <span className="text-rose-500">Out of stock</span>}
            </p>
          </div>
        </div>
      </article>
    )
  }

  return (
    <section className="bg-white py-8 sm:py-12 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Section header */}
        <div className="mb-5 flex items-start justify-between gap-4 sm:mb-8 sm:items-end">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-red-500 sm:mb-2 sm:text-xs">
              Featured
            </p>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl lg:text-4xl">
              {title}
            </h2>
            <p className="mt-1 hidden text-sm text-zinc-500 sm:block lg:text-base">
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/products")}
            className="flex shrink-0 items-center gap-0.5 pt-1 text-xs font-semibold text-zinc-700 transition-colors hover:text-red-600 sm:pt-0 sm:text-sm"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 md:gap-5 lg:grid-cols-4 lg:gap-6">
            {[...Array(limit)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mx-auto my-4 max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
            <p className="mb-3 text-sm font-medium text-rose-800">{error}</p>
            <Button
              onClick={fetchTrendingProducts}
              variant="outline"
              size="sm"
              className="border-rose-300 text-rose-800 hover:bg-rose-100"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && products.length === 0 && (
          <div className="mx-auto my-4 max-w-md rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center">
            <PackageCheck className="mx-auto mb-2 h-10 w-10 text-zinc-400" />
            <p className="text-sm font-semibold text-zinc-700">No trending products found</p>
            <p className="mt-1 text-xs text-zinc-500">Check back later for updated top sales items.</p>
          </div>
        )}

        {/* Products */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 md:gap-5 lg:grid-cols-4 lg:gap-6">
            {products.map((product) => renderProductCard(product))}
          </div>
        )}
      </div>
    </section>
  )
}
