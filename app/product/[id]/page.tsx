"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import { addToCart } from "@/lib/store/slices/orderSlice"
import { addToWishlistAPI, removeFromWishlistAPI } from '@/lib/store/slices/wishlistSlice'
import { useCurrency } from "@/lib/contexts/currency-context"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { useLoginModal } from '@/lib/stores/useLoginModal'
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ShoppingCart, Heart, Share2, AlertCircle, Plus, Minus, Truck, Shield, Zap, ChevronRight, Sparkles, Verified, Check, Package, Info } from "lucide-react"
import Image from "next/image"
import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import toast from 'react-hot-toast'
import LoginModal from "@/components/auth/login-modal"
import RecommendedProducts from "@/components/sections/recommended-products"
import { Metadata } from 'next'

interface Variant {
  id: number
  name: string
  price_aed: number
  price_inr: number
  discount_aed: number
  discount_inr: number
  available_aed: boolean
  available_inr: boolean
  stock_quantity: number
}

interface Product {
  id: number
  name: string
  description: string
  price: number
  price_aed?: number | null
  price_inr?: number | null
  default_currency: 'AED' | 'INR'
  image_urls: string[]
  category_id: number
  category_name: string
  is_available: boolean
  is_featured: boolean
  is_new: boolean
  features: string[]
  specifications_text: string
  warranty_months: number
  brand?: string
  model?: string
  condition_type?: 'master' | 'first-copy' | 'second-copy' | 'hot' | 'sale' | 'none'
  shop_category: string
  storage_capacity?: string
  color?: string
  stock_quantity: number
  sku?: string
  variants: Variant[]
}


export default function ProductPage() {
  const { user, isAuthenticated } = useAuth()
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { selectedCurrency, formatPriceWithSmallDecimals, getCurrencySymbol } = useCurrency()
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items)

  const [product, setProduct] = useState<Product | null>(null)
  const { openModal } = useLoginModal()
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [showBlur, setShowBlur] = useState(false)
  const [animationType, setAnimationType] = useState<'cart' | 'wishlist' | 'buy' | null>(null)

  const triggerBlurAnimation = (type: 'cart' | 'wishlist' | 'buy') => {
    setAnimationType(type)
    setShowBlur(true)
    setTimeout(() => {
      setShowBlur(false)
      setAnimationType(null)
    }, 2500)
  }

  const isInWishlist = (productId: number) => {
    return wishlistItems.some(item => item.id === productId)
  }

  const hasSelectedCurrencyPrice = (variant: Variant | null) => {
    if (!variant) return false
    return selectedCurrency === 'AED' ? variant.available_aed : variant.available_inr
  }

  const isVariantAvailable = (variant: Variant) => {
    return hasSelectedCurrencyPrice(variant) && variant.stock_quantity > 0
  }

  const getStockMessage = (variant: Variant) => {
    if (variant.stock_quantity === 0) {
      return 'Out of Stock'
    } else if (!hasSelectedCurrencyPrice(variant)) {
      return "Not available in INR"
    } else if (variant.stock_quantity <= 5) {
      return `Only ${variant.stock_quantity} left`
    } else {
      return `${variant.stock_quantity} in stock`
    }
  }

  const handleToggleWishlist = async (product: Product) => {
    if (!isAuthenticated) {
      openModal()
      return
    }
    try {
      if (isInWishlist(product.id)) {
        await dispatch(removeFromWishlistAPI(product.id)).unwrap()
        toast.success('Removed from wishlist')
      } else {
        const wishlistItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          price_aed: selectedVariant?.discount_aed || selectedVariant?.price_aed || product.price_aed,
          price_inr: selectedVariant?.discount_inr || selectedVariant?.price_inr || product.price_inr,
          default_currency: product.default_currency,
          image_url: product.image_urls?.[0] || '',
          image_urls: product.image_urls || [],
          category_id: product.category_id,
          category_name: product.category_name,
          description: product.description,
          brand: product.brand,
          is_available: product.is_available,
          shop_category: product.shop_category,
          features: product.features,
          variants: product.variants,
          condition_type: product.condition_type,
          selectedVariant: selectedVariant
        }
        await dispatch(addToWishlistAPI(wishlistItem)).unwrap()
        toast.success('Added to wishlist')
        triggerBlurAnimation('wishlist')
      }
    } catch (error) {
      console.error('Wishlist operation failed:', error)
      toast.error('Failed to update wishlist')
    }
  }

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
        const defaultVariant = data.variants?.find((v: Variant) =>
          selectedCurrency === 'AED' ? v.available_aed : v.available_inr
        ) || data.variants?.[0]
        setSelectedVariant(defaultVariant || null)
      } else {
        console.error("Product not found")
        router.push('/not-found')
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      toast.error('Failed to load product')
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      openModal()
      return
    }
    if (product && selectedVariant && hasSelectedCurrencyPrice(selectedVariant)) {
      dispatch(addToCart({
        menuItem: product,
        quantity,
        selectedCurrency,
        userId: user?.id,
        variant_id: selectedVariant.id,
        selected_variant: selectedVariant
      }))
      triggerBlurAnimation('cart')
      toast.success('Added to cart')
    } else if (!hasSelectedCurrencyPrice(selectedVariant)) {
      toast.error("This product is not available in INR")
    } else if ((selectedVariant?.stock_quantity ?? 0) === 0) {
      toast.error('This variant is currently out of stock')
    } else {
      toast.error('Unable to add to cart. Please try again.')
    }
  }

  const handleBuyNow = () => {
    if (product && selectedVariant && hasSelectedCurrencyPrice(selectedVariant)) {
      dispatch(addToCart({
        menuItem: product,
        quantity,
        selectedCurrency,
        userId: user?.id,
        variant_id: selectedVariant.id,
        selected_variant: selectedVariant
      }))
      triggerBlurAnimation('buy')
      setTimeout(() => {
        router.push('/order')
      }, 1500)
    } else if (!hasSelectedCurrencyPrice(selectedVariant)) {
      toast.error("This product is not available in INR")
    } else if ((selectedVariant?.stock_quantity ?? 0) === 0) {
      toast.error('This variant is currently out of stock')
    } else {
      toast.error('Unable to process order. Please try again.')
    }
  }

  const handleVariantChange = (variant: Variant) => {
    setSelectedVariant(variant)
    setQuantity(1)
    if (variant.stock_quantity === 0) {
      toast.error('This variant is out of stock')
    } else if (variant.stock_quantity <= 5) {
      toast(`Only ${variant.stock_quantity} items left in stock!`, { icon: '⚠️' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-4 w-40 bg-gray-100 rounded-full mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              <div className="lg:col-span-7 space-y-3">
                <div className="bg-gray-50 aspect-square rounded-2xl" />
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-50 aspect-square rounded-xl" />
                  ))}
                </div>
              </div>
              <div className="lg:col-span-5 space-y-6">
                <div className="h-8 w-3/4 bg-gray-100 rounded-lg" />
                <div className="h-5 w-1/3 bg-gray-50 rounded-lg" />
                <div className="h-12 w-1/2 bg-gray-100 rounded-lg" />
                <div className="h-px bg-gray-100" />
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-50 rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Button
            onClick={() => router.back()}
            className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-8"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
        <Footer />
      </div>
    )
  }

  const currencyAvailable = selectedVariant ? hasSelectedCurrencyPrice(selectedVariant) : false

  const conditionLabels: Record<string, string> = {
    master: "Master",
    "first-copy": "1st Copy",
    "second-copy": "2nd Copy",
    hot: "Hot",
    sale: "Sale",
    none: ""
  }

  const discountPercent = selectedVariant
    ? selectedCurrency === 'AED' && selectedVariant.price_aed && selectedVariant.discount_aed
      ? Math.round(((selectedVariant.price_aed - selectedVariant.discount_aed) / selectedVariant.price_aed) * 100)
      : selectedCurrency === 'INR' && selectedVariant.price_inr && selectedVariant.discount_inr
        ? Math.round(((selectedVariant.price_inr - selectedVariant.discount_inr) / selectedVariant.price_inr) * 100)
        : 0
    : 0

  const stockQty = selectedVariant?.stock_quantity ?? 0

  const specEntries = [
    ...(product.brand ? [{ label: "Brand", value: product.brand }] : []),
    ...(product.model ? [{ label: "Model", value: product.model }] : []),
    ...(product.color ? [{ label: "Color", value: product.color }] : []),
    ...(product.storage_capacity ? [{ label: "Storage", value: product.storage_capacity }] : []),
    ...(product.condition_type && product.condition_type !== 'none' ? [{ label: "Condition", value: conditionLabels[product.condition_type] }] : []),
    ...(product.warranty_months && product.warranty_months !== "0"
      ? [{ label: "Warranty", value: `${product.warranty_months} months` }]
      : []),
    { label: "Availability", value: selectedCurrency },
    { label: "Stock", value: stockQty > 0 ? `${stockQty} available` : "Out of stock" },
  ]

  return (
    <div className="min-h-screen bg-white relative">
      <Navbar />

      {/* Blur Overlay */}
      {showBlur && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md animate-in fade-in duration-500" />
          <div className="relative z-10">
            {animationType === 'wishlist' && (
              <div className="animate-in zoom-in-50 duration-700">
                <div className="bg-white rounded-3xl p-8 shadow-2xl">
                  <Heart className="w-16 h-16 text-zinc-900 fill-zinc-900 mx-auto" />
                </div>
                <p className="text-center text-white font-semibold text-lg mt-4">
                  {isInWishlist(product.id) ? 'Removed from Wishlist' : 'Added to Wishlist'}
                </p>
              </div>
            )}
            {animationType === 'cart' && (
              <div className="animate-in zoom-in-50 duration-700">
                <div className="bg-white rounded-3xl p-8 shadow-2xl">
                  <ShoppingCart className="w-16 h-16 text-zinc-900 mx-auto" />
                </div>
                <p className="text-center text-white font-semibold text-lg mt-4">Added to Cart</p>
              </div>
            )}
            {animationType === 'buy' && (
              <div className="animate-in zoom-in-50 duration-700">
                <div className="bg-white rounded-3xl p-8 shadow-2xl">
                  <Zap className="w-16 h-16 text-zinc-900 mx-auto" />
                </div>
                <p className="text-center text-white font-semibold text-lg mt-4">Processing Your Order...</p>
                <div className="mt-3 w-40 h-1 bg-white/30 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: "100%", animation: "progress 1.5s ease-in-out" }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>

      <div className={`transition-all duration-300 ${showBlur ? "blur-sm" : ""}`}>
        {/* Breadcrumb */}
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 py-3 text-sm text-gray-500">
              <button onClick={() => router.push('/')} className="hover:text-gray-900 transition-colors">Home</button>
              <ChevronRight className="w-3.5 h-3.5" />
              <button
                onClick={() => router.push(`/products?category=${product.category_id}`)}
                className="hover:text-gray-900 transition-colors"
              >
                {product.category_name}
              </button>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
            </div>
          </div>
        </div>

        {/* Currency warning */}
        {!currencyAvailable && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            <Alert className="border-amber-200 bg-amber-50 rounded-xl">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                This product is not available in {selectedCurrency}. Please select another variant if listed.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Main product area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">

            {/* ─── Left: Images ─── */}
            <div className="lg:col-span-7">
              <div className="lg:sticky lg:top-24 space-y-3">
                {/* Main image */}
                <div className="relative bg-gray-50 rounded-2xl overflow-hidden aspect-square">
                  <Image
                    src={product.image_urls[selectedImageIndex] || `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(product.name)}`}
                    alt={product.name || 'Product image'}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 58vw, 660px"
                    className="object-contain p-6 sm:p-10"
                    priority
                  />

                  {/* Top-left badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.is_new && (
                      <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        New
                      </span>
                    )}
                    {product.condition_type && product.condition_type !== 'none' && (
                      <span className="bg-zinc-900 text-white text-xs font-semibold px-3 py-1 rounded-full capitalize">
                        {conditionLabels[product.condition_type]}
                      </span>
                    )}
                    {discountPercent > 0 && (
                      <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>

                  {/* Top-right actions */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleWishlist(product) }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isInWishlist(product.id)
                          ? 'bg-zinc-900 text-white shadow-lg'
                          : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white shadow-md hover:text-zinc-900'
                      }`}
                      aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-white' : ''}`} />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors text-gray-600 hover:text-zinc-900"
                          aria-label="Share product"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(window.location.href).then(() => toast.success('Link copied!')).catch(() => toast.error('Failed to copy'))}>
                          Copy Link
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Stock indicator */}
                  {stockQty > 0 && stockQty <= 5 && (
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Only {stockQty} left
                      </span>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {product.image_urls.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.image_urls.slice(0, 4).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative aspect-square rounded-xl overflow-hidden bg-gray-50 transition-all duration-200 ${
                          selectedImageIndex === index
                            ? "ring-2 ring-zinc-900 ring-offset-2"
                            : "hover:ring-2 hover:ring-gray-200 hover:ring-offset-1"
                        }`}
                        aria-label={`Select image ${index + 1}`}
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          sizes="100px"
                          className="object-contain p-2"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ─── Right: Product Info ─── */}
            <div className="lg:col-span-5">
              <div className="space-y-6">

                {/* Category + Brand */}
                <div>
                  <button
                    onClick={() => router.push(`/products?category=${product.category_id}`)}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors mb-2 block"
                  >
                    {product.category_name}
                  </button>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight tracking-tight">
                    {product.name}
                  </h1>
                  {product.brand && (
                    <p className="text-sm text-gray-500 mt-1">by <span className="font-medium text-gray-700">{product.brand}</span></p>
                  )}
                </div>

                {/* Price block */}
                <div className="space-y-3">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    {currencyAvailable && selectedVariant ? (
                      <>
                        <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                          {formatPriceWithSmallDecimals(
                            selectedVariant.discount_aed || selectedVariant.price_aed,
                            selectedVariant.discount_inr || selectedVariant.price_inr,
                            selectedCurrency,
                            true,
                            "#111827"
                          )}
                        </span>
                        {discountPercent > 0 && (
                          <span className="text-lg text-gray-400 line-through">
                            {formatPriceWithSmallDecimals(
                              selectedVariant.price_aed,
                              selectedVariant.price_inr,
                              selectedCurrency,
                              true,
                              "#9ca3af"
                            )}
                          </span>
                        )}
                        {discountPercent > 0 && (
                          <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                            Save {discountPercent}%
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-lg text-gray-500">Not available in {selectedCurrency}</span>
                    )}
                  </div>

                  {/* Trust signals */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4" />
                      Doorstep Delivery
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Verified className="w-4 h-4" />
                      Motoclub Verified
                    </span>
                    {product.warranty_months && product.warranty_months !== "0" ? (
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-4 h-4" />
                        {product.warranty_months}mo Warranty
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-4 h-4" />
                        Quality Assured
                      </span>
                    )}
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Variant selector */}
                {product.variants.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Variant
                      {selectedVariant && (
                        <span className="font-normal text-gray-500 ml-1">— {selectedVariant.name}</span>
                      )}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant) => {
                        const isDisabled = !hasSelectedCurrencyPrice(variant) || variant.stock_quantity === 0
                        const isSelected = selectedVariant?.id === variant.id

                        return (
                          <button
                            key={variant.id}
                            onClick={() => handleVariantChange(variant)}
                            disabled={isDisabled}
                            className={`relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                              isSelected
                                ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                                : isDisabled
                                  ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                                  : "bg-white text-gray-700 border-gray-200 hover:border-zinc-400 hover:shadow-sm"
                            }`}
                            aria-label={`Select variant ${variant.name}${isDisabled ? ' (not available)' : ''}`}
                          >
                            <span className="block">{variant.name}</span>
                            <span className={`block text-xs mt-0.5 ${isSelected ? 'text-white/70' : isDisabled ? 'text-gray-300' : 'text-gray-400'}`}>
                              {formatPriceWithSmallDecimals(
                                variant.discount_aed || variant.price_aed,
                                variant.discount_inr || variant.price_inr,
                                selectedCurrency,
                                true,
                                isSelected ? "rgba(255,255,255,0.7)" : isDisabled ? "#d1d5db" : "#9ca3af"
                              )}
                            </span>
                            {isSelected && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <Check className="w-2.5 h-2.5 text-zinc-900" />
                              </span>
                            )}
                            {isDisabled && variant.stock_quantity === 0 && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span className="w-full h-px bg-gray-300 rotate-[-12deg]" />
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                    {selectedVariant && (
                      <p className={`text-xs mt-2 ${stockQty <= 5 && stockQty > 0 ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
                        {getStockMessage(selectedVariant)}
                      </p>
                    )}
                  </div>
                )}

                <div className="h-px bg-gray-100" />

                {/* Quantity + Actions */}
                <div className="space-y-4">
                  {/* Quantity */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-900">Qty</span>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30"
                        disabled={!currencyAvailable || stockQty === 0}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 h-10 flex items-center justify-center text-sm font-bold border-x border-gray-200">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(stockQty, quantity + 1))}
                        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30"
                        disabled={!currencyAvailable || stockQty === 0}
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={handleBuyNow}
                      className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50"
                      disabled={!product.is_available || !selectedVariant || stockQty === 0 || !currencyAvailable}
                      aria-label="Buy now"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {!selectedVariant || !isVariantAvailable(selectedVariant)
                        ? (!hasSelectedCurrencyPrice(selectedVariant)
                            ? `Not available in ${selectedCurrency === 'INR' ? 'India' : 'UAE'}`
                            : 'Out of Stock')
                        : "Buy Now"}
                    </Button>
                    <Button
                      onClick={handleAddToCart}
                      variant="outline"
                      className="w-full h-12 rounded-xl border-gray-200 hover:border-zinc-400 text-sm font-semibold transition-all duration-200 hover:shadow-sm disabled:opacity-50"
                      disabled={!product.is_available || !selectedVariant || stockQty === 0 || !currencyAvailable}
                      aria-label="Add to cart"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>

                {/* About */}
                {product.description && (
                  <>
                    <div className="h-px bg-gray-100" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">About this product</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                    </div>
                  </>
                )}

                {/* Features */}
                {product.features?.length > 0 && (
                  <>
                    <div className="h-px bg-gray-100" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Features</h3>
                      <ul className="space-y-2">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2.5 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {/* Specifications */}
                {specEntries.length > 0 && (
                  <>
                    <div className="h-px bg-gray-100" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Specifications</h3>
                      <div className="rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
                        {specEntries.map((spec, index) => (
                          <div key={index} className="flex items-center justify-between px-4 py-2.5 even:bg-gray-50/50">
                            <span className="text-sm text-gray-500">{spec.label}</span>
                            <span className="text-sm font-medium text-gray-900">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      <RecommendedProducts
        currentProductId={product.id}
        categoryId={product.category_id}
      />

      {/* Mobile sticky bottom bar */}
      {product && currencyAvailable && stockQty > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 p-3 flex gap-3 lg:hidden safe-area-pb">
          <Button
            onClick={handleAddToCart}
            variant="outline"
            className="flex-1 h-12 rounded-xl border-gray-200 text-sm font-semibold"
            disabled={!product.is_available || !selectedVariant || stockQty === 0}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Cart
          </Button>
          <Button
            onClick={handleBuyNow}
            className="flex-[2] h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm font-semibold shadow-sm"
            disabled={!product.is_available || !selectedVariant || stockQty === 0}
          >
            <Zap className="w-4 h-4 mr-2" />
            Buy Now
          </Button>
        </div>
      )}

      <Footer />
    </div>
  )
}
