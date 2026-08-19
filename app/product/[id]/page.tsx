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
import { ArrowLeft, ShoppingCart, Heart, Share2, AlertCircle, Plus, Minus, Truck, Shield, Zap, ChevronRight, Sparkles, Verified, Check, Package, Info, Star, MessageCircle } from "lucide-react"
import Image from "next/image"
import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import toast from 'react-hot-toast'
import LoginModal from "@/components/auth/login-modal"
import RecommendedProducts from "@/components/sections/recommended-products"
import { Metadata } from 'next'
import { handleWhatsAppProductRequest } from "@/lib/whatsapp-request"

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
      const response = await fetch(`/api/products/${params.id}`)
      if (response.ok) {
        const resData = await response.json()
        const data = resData.product || resData
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
    const maxStock = selectedVariant?.stock_quantity ?? product?.stock_quantity ?? 0
    if (maxStock <= 0) {
      toast.error('This variant is currently out of stock')
      return
    }
    if (quantity > maxStock) {
      toast.error(`Cannot order more than available stock (${maxStock})`)
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
    } else {
      toast.error('Unable to add to cart. Please try again.')
    }
  }

  const handleBuyNow = () => {
    const maxStock = selectedVariant?.stock_quantity ?? product?.stock_quantity ?? 0
    if (maxStock <= 0) {
      toast.error('This variant is currently out of stock')
      return
    }
    if (quantity > maxStock) {
      toast.error(`Cannot order more than available stock (${maxStock})`)
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
      triggerBlurAnimation('buy')
      setTimeout(() => {
        router.push('/order')
      }, 1500)
    } else if (!hasSelectedCurrencyPrice(selectedVariant)) {
      toast.error("This product is not available in INR")
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

            {/* ─── Right: Product Info (Zytheme Autoshop Screenshot 2 Style) ─── */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 uppercase tracking-tight">
                  {product.name}
                </h1>

                {/* Rating + Reviews */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center text-red-600">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-red-600" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-semibold">5 Review(s) / Add Review</span>
                </div>
              </div>

              {/* Price block - ONLY MRP */}
              <div className="flex items-baseline gap-3">
                {currencyAvailable && selectedVariant ? (
                  <span className="text-3xl font-extrabold text-red-600">
                    {formatPriceWithSmallDecimals(
                      selectedVariant.price_aed,
                      selectedVariant.price_inr,
                      selectedCurrency,
                      true,
                      "#dc2626"
                    )}
                  </span>
                ) : (
                  <span className="text-lg text-gray-500">Not available in {selectedCurrency}</span>
                )}
              </div>

              {/* Short description */}
              {product.description && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* OTHER DETAILS Section (Screenshot 2) */}
              <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl space-y-2">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                  OTHER DETAILS :
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-semibold text-gray-700">Product : </span>
                    <span className="text-gray-600">{product.category_name}</span>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-700">Availability : </span>
                    <span className={stockQty > 0 ? "text-red-600 font-bold" : "text-gray-400 font-bold"}>
                      {stockQty > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Brand : </span>
                    <span className="text-red-600 font-bold">{product.brand || "Motoclub"}</span>
                  </div>
                </div>
              </div>

              {/* Quantity + Add To Cart + Wishlist OR WhatsApp Request */}
              <div className="space-y-4 pt-2">
                {stockQty > 0 && product.is_available ? (
                  <>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase text-gray-700">Quantity :</span>
                        <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold"
                            disabled={!currencyAvailable}
                          >
                            -
                          </button>
                          <span className="w-10 h-8 flex items-center justify-center text-xs font-bold border-x border-gray-300">
                            {quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(Math.min(stockQty, quantity + 1))}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold"
                            disabled={!currencyAvailable}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <Button
                        onClick={handleAddToCart}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-xs tracking-wider px-6 py-2.5 rounded-lg shadow-sm transition-colors"
                      >
                        Add To Cart
                      </Button>

                      <Button
                        onClick={() => handleToggleWishlist(product)}
                        variant="outline"
                        className="border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs py-2.5 rounded-lg"
                      >
                        Wishlist
                      </Button>
                    </div>

                    <Button
                      onClick={handleBuyNow}
                      className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold uppercase text-xs tracking-wider py-3 rounded-lg shadow-sm transition-colors mt-2"
                    >
                      Buy Now
                    </Button>
                  </>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-emerald-900">Currently Out of Stock</h4>
                        <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                          Is it possible to get this product? Click below to send product details to our team on WhatsApp (<strong>8075191055</strong>) to check if we can order it for you!
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={(e) => handleWhatsAppProductRequest(e, {
                        productName: product.name,
                        productId: product.id,
                        sku: product.sku,
                        brand: product.brand,
                        priceText: selectedVariant
                          ? selectedCurrency === 'AED' && selectedVariant.price_aed
                            ? `AED ${selectedVariant.price_aed}`
                            : `₹ ${selectedVariant.price_inr || product.price}`
                          : `₹ ${product.price}`,
                        productUrl: typeof window !== 'undefined' ? window.location.href : undefined
                      })}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-lg shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                    >
                      <MessageCircle className="w-4.5 h-4.5 fill-white" />
                      Request Product via WhatsApp
                    </Button>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[11px] text-emerald-800 font-medium">Fast inquiry response</span>
                      <Button
                        onClick={() => handleToggleWishlist(product)}
                        variant="ghost"
                        className="text-xs text-gray-600 hover:text-gray-900 underline p-0 h-auto font-medium"
                      >
                        {isInWishlist(product.id) ? 'In Wishlist' : 'Add to Wishlist'}
                      </Button>
                    </div>
                  </div>
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
      {product && (
        <div className="fixed bottom-[52px] left-0 right-0 z-30 bg-white border-t border-gray-100 p-2.5 lg:hidden shadow-md">
          {stockQty <= 0 || !product.is_available ? (
            <Button
              onClick={(e) => handleWhatsAppProductRequest(e, {
                productName: product.name,
                productId: product.id,
                sku: product.sku,
                brand: product.brand,
                priceText: selectedVariant
                  ? selectedCurrency === 'AED' && selectedVariant.price_aed
                    ? `AED ${selectedVariant.price_aed}`
                    : `₹ ${selectedVariant.price_inr || product.price}`
                  : `₹ ${product.price}`,
                productUrl: typeof window !== 'undefined' ? window.location.href : undefined
              })}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              Request Product via WhatsApp
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                variant="outline"
                className="flex-1 h-12 rounded-xl border-gray-200 text-sm font-semibold"
                disabled={!currencyAvailable || !selectedVariant}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart
              </Button>
              <Button
                onClick={handleBuyNow}
                className="flex-[2] h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm font-semibold shadow-sm"
                disabled={!currencyAvailable || !selectedVariant}
              >
                <Zap className="w-4 h-4 mr-2" />
                Buy Now
              </Button>
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  )
}
