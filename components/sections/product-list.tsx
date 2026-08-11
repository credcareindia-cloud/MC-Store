"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import { fetchProducts, fetchCategories, setSelectedCategory } from "@/lib/store/slices/productSlice"
import { addToCart } from "@/lib/store/slices/orderSlice"
import { useCurrency } from "@/lib/contexts/currency-context"
import { Button } from "@/components/ui/button"
import { useLoginModal } from '@/lib/stores/useLoginModal'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ChevronRight, Zap, Grid3X3, List, SlidersHorizontal, Tag, Heart, ChevronDown, ShoppingCart, Loader2, Flame, ArrowRight, Bookmark } from "lucide-react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { addToWishlistAPI, removeFromWishlistAPI } from '@/lib/store/slices/wishlistSlice'
import SearchFilters from "@/components/ui/search-filters"

interface ProductListProps {
  showSpinner?: boolean
  onCloseSpinner?: () => void
}

export default function ProductList({ showSpinner = false, onCloseSpinner }: ProductListProps) {
  const { user, isAuthenticated } = useAuth()
  const [authInitialized, setAuthInitialized] = useState(false)
  const { openModal } = useLoginModal()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [categoryTransition, setCategoryTransition] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Animation states
  const [showBlur, setShowBlur] = useState(false)
  const [animationType, setAnimationType] = useState<'cart' | 'wishlist' | null>(null)

  const dispatch = useDispatch<AppDispatch>()
  const { items, categories, selectedCategory, loading } = useSelector((state: RootState) => state.products)
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items)
  const { selectedCurrency, formatPrice, formatPriceWithSmallDecimals } = useCurrency()
  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get("category")
  const router = useRouter()

  const isInWishlist = (productId: number) => {
    return wishlistItems.some(item => item.id === productId)
  }

  const hasSelectedCurrencyPrice = (product: any) => {
    // if (selectedCurrency === 'AED') {
    //   return product.price_aed && product.price_aed > 0
    // } else if (selectedCurrency === 'INR') {
    //   return product.price_inr && product.price_inr > 0
    // }
    return true
  }

  // Trigger blur animation
  const triggerBlurAnimation = (type: 'cart' | 'wishlist') => {
    setAnimationType(type)
    setShowBlur(true)
    
    // Hide animation after 2 seconds
    setTimeout(() => {
      setShowBlur(false)
      setAnimationType(null)
    }, 2000)
  }

  const handleToggleWishlist = async (product: any) => {
    if (!isAuthenticated) {
      // alert('Please login to add items to wishlist')
      openModal()
      return
    }

    try {
      if (isInWishlist(product.id)) {
        await dispatch(removeFromWishlistAPI(product.id)).unwrap()
      } else {
        // Get the best available variant for pricing
        const availableVariant = product.variants?.find((v: any) => 
          v.available_aed || v.available_inr
        ) || product.variants?.[0];

        const wishlistItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          price_aed: availableVariant?.discount_aed || availableVariant?.price_aed || product.price_aed,
          price_inr: availableVariant?.discount_inr || availableVariant?.price_inr || product.price_inr,
          default_currency: product.default_currency || "AED",
          image_url: product.image_urls?.[0] || product.image_url || '',
          image_urls: product.image_urls || [],
          category_id: product.category_id,
          category_name: product.category_name,
          description: product.description,
          brand: product.brand,
          is_available: product.is_available,
          shop_category: product.shop_category,
          features: product.features,
          variants: product.variants,
          condition_type: product.condition_type
        }
        await dispatch(addToWishlistAPI(wishlistItem)).unwrap()
        // Trigger wishlist animation
        triggerBlurAnimation('wishlist')
      }
    } catch (error) {
      console.error('wishlist operation failed:', error)
      const errorMessage = typeof error === 'string' ? error : 'Unknown error occurred'
      alert(`Failed to update wishlist: ${errorMessage}`)
    }
  }

  useEffect(() => {
    const initTimer = setTimeout(() => {
      setAuthInitialized(true)
    }, 300)

    return () => clearTimeout(initTimer)
  }, [isAuthenticated])

  // Debug currency changes
  useEffect(() => {
    console.log('Currency changed to:', selectedCurrency)
  }, [selectedCurrency])

  useEffect(() => {
    dispatch(fetchProducts())
    dispatch(fetchCategories())
    if (categoryFromUrl) {
      dispatch(setSelectedCategory(Number(categoryFromUrl)))
    }
  }, [dispatch, categoryFromUrl])

  // Add this useEffect to handle search from URL
  useEffect(() => {
    const searchFromUrl = searchParams.get("search")
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl)
    } else {
      setSearchTerm("")
    }
  }, [searchParams])

  const handleCategoryChange = (categoryId: number | null) => {
    setCategoryTransition(true)
    setTimeout(() => {
      dispatch(setSelectedCategory(categoryId))
      setCategoryTransition(false)
    }, 150)
  }

  const handleAddToCart = (product: any) => {
    if (!isAuthenticated) {
      openModal()
      return
    }
    dispatch(addToCart({
      menuItem: product,
      quantity: 1,
      selectedCurrency,
      userId: user?.id
    }))
    // Trigger cart animation
    triggerBlurAnimation('cart')
  }

  const shopFilteredItems = items

  const currencyFilteredItems = shopFilteredItems.filter((item: any) => {
    return hasSelectedCurrencyPrice(item)
  })

  // State for search results
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [currentSearchQuery, setCurrentSearchQuery] = useState("")
  const [searchSortBy, setSearchSortBy] = useState("relevance")
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [activeFilters, setActiveFilters] = useState<any>({})

  // Apply filters to search results
  const applyFilters = (items: any[], filters: any) => {
    if (!filters || Object.keys(filters).length === 0) return items
    
    return items.filter(item => {
      // Get the best available variant for filtering
      const availableVariant = item.variants?.find((v: any) => 
        selectedCurrency === 'AED' ? v.available_aed : v.available_inr
      ) || item.variants?.[0]

      const originalPrice = selectedCurrency === 'AED' 
        ? (availableVariant?.price_aed || 0)
        : (availableVariant?.price_inr || 0)

      const discountPrice = selectedCurrency === 'AED' 
        ? (availableVariant?.discount_aed || 0)
        : (availableVariant?.discount_inr || 0)

      // A product has a discount only if:
      // 1. Both original price and discount price exist and are > 0
      // 2. Discount price is meaningfully less than original price (at least 1% difference)
      const hasDiscount = originalPrice > 0 && 
                         discountPrice > 0 && 
                         discountPrice < originalPrice &&
                         ((originalPrice - discountPrice) / originalPrice) >= 0.01

      // Use discount price if available, otherwise original price
      const currentPrice = hasDiscount ? discountPrice : originalPrice

      // Apply discount filter
      if (filters.discount && !hasDiscount) return false

      // Calculate discount percentage for range filters
      const discountPercentage = hasDiscount ? ((originalPrice - currentPrice) / originalPrice) * 100 : 0

      // Apply discount percentage range filters
      if (filters.discount_10_20 && (discountPercentage < 10 || discountPercentage >= 20)) return false
      if (filters.discount_20_30 && (discountPercentage < 20 || discountPercentage >= 30)) return false
      if (filters.discount_30_40 && (discountPercentage < 30 || discountPercentage >= 40)) return false
      if (filters.discount_40_plus && discountPercentage < 40) return false

      // Apply price range slider filter
      if (filters.priceRange && Array.isArray(filters.priceRange)) {
        const [minPrice, maxPrice] = filters.priceRange
        if (currentPrice < minPrice || currentPrice > maxPrice) return false
      }

      // Apply featured filter
      if (filters.featured && !item.is_featured) return false

      // Apply new arrivals filter
      if (filters.new_arrivals && !item.is_new) return false

      return true
    })
  }

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters)
  }

  // Use search API when there's a search term
  useEffect(() => {
    const searchFromUrl = searchParams.get("search")
    if (searchFromUrl && searchFromUrl.trim().length >= 2) {
      setIsSearchActive(true)
      setCurrentSearchQuery(searchFromUrl.trim())
      setIsSearchLoading(true)
      // Clear category selection when searching to show results across all categories
      dispatch(setSelectedCategory(null))
      fetchSearchResults(searchFromUrl.trim(), searchSortBy)
    } else {
      setIsSearchActive(false)
      setSearchResults([])
      setCurrentSearchQuery("")
      setIsSearchLoading(false)
    }
  }, [searchParams, selectedCurrency, searchSortBy, dispatch])

  const fetchSearchResults = async (query: string, sort: string = 'relevance') => {
    try {
      setIsSearchLoading(true)
      const searchUrl = new URL('/api/products/search', window.location.origin)
      searchUrl.searchParams.set('q', query)
      searchUrl.searchParams.set('currency', selectedCurrency)
      if (selectedCategory) {
        searchUrl.searchParams.set('category', selectedCategory.toString())
      }
      searchUrl.searchParams.set('limit', '50')
      searchUrl.searchParams.set('sort', sort)

      const response = await fetch(searchUrl.toString())
      const searchData = await response.json()
      
      let results = searchData.items || []
      
      // Apply client-side sorting for options not handled by API
      if (sort === 'name') {
        results = results.sort((a: any, b: any) => a.name.localeCompare(b.name))
      } else if (sort === 'newest') {
        results = results.sort((a: any, b: any) => {
          // First priority: items with is_new flag
          if (a.is_new && !b.is_new) return -1
          if (!a.is_new && b.is_new) return 1
          
          // Second priority: creation date (newest first)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
      } else if (sort === 'price_low' || sort === 'price_high') {
        results = results.sort((a: any, b: any) => {
          const aVariant = a.variants?.find((v: any) => 
            selectedCurrency === 'AED' ? v.available_aed : v.available_inr
          ) || a.variants?.[0]
          const bVariant = b.variants?.find((v: any) => 
            selectedCurrency === 'AED' ? v.available_aed : v.available_inr
          ) || b.variants?.[0]
          
          // Get the actual selling price (discount price if available, otherwise regular price)
          const aPrice = selectedCurrency === 'AED' 
            ? (aVariant?.discount_aed && aVariant.discount_aed > 0 ? aVariant.discount_aed : aVariant?.price_aed || 0)
            : (aVariant?.discount_inr && aVariant.discount_inr > 0 ? aVariant.discount_inr : aVariant?.price_inr || 0)
          const bPrice = selectedCurrency === 'AED' 
            ? (bVariant?.discount_aed && bVariant.discount_aed > 0 ? bVariant.discount_aed : bVariant?.price_aed || 0)
            : (bVariant?.discount_inr && bVariant.discount_inr > 0 ? bVariant.discount_inr : bVariant?.price_inr || 0)
          
          return sort === 'price_low' ? aPrice - bPrice : bPrice - aPrice
        })
      } else if (sort === 'discount') {
        results = results.sort((a: any, b: any) => {
          const aVariant = a.variants?.find((v: any) => 
            selectedCurrency === 'AED' ? v.available_aed : v.available_inr
          ) || a.variants?.[0]
          const bVariant = b.variants?.find((v: any) => 
            selectedCurrency === 'AED' ? v.available_aed : v.available_inr
          ) || b.variants?.[0]
          
          // Calculate discount percentage for each product
          const aOriginalPrice = selectedCurrency === 'AED' ? (aVariant?.price_aed || 0) : (aVariant?.price_inr || 0)
          const aDiscountPrice = selectedCurrency === 'AED' ? (aVariant?.discount_aed || 0) : (aVariant?.discount_inr || 0)
          const aDiscountPercent = aOriginalPrice > 0 && aDiscountPrice > 0 
            ? Math.round(((aOriginalPrice - aDiscountPrice) / aOriginalPrice) * 100) 
            : 0
          
          const bOriginalPrice = selectedCurrency === 'AED' ? (bVariant?.price_aed || 0) : (bVariant?.price_inr || 0)
          const bDiscountPrice = selectedCurrency === 'AED' ? (bVariant?.discount_aed || 0) : (bVariant?.discount_inr || 0)
          const bDiscountPercent = bOriginalPrice > 0 && bDiscountPrice > 0 
            ? Math.round(((bOriginalPrice - bDiscountPrice) / bOriginalPrice) * 100) 
            : 0
          
          // Sort by highest discount first
          return bDiscountPercent - aDiscountPercent
        })
      }
      
      setSearchResults(results)
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setIsSearchLoading(false)
    }
  }

  const handleSortChange = (newSort: string) => {
    setSearchSortBy(newSort)
    if (currentSearchQuery) {
      fetchSearchResults(currentSearchQuery, newSort)
    }
  }

  const handleClearSearch = () => {
    router.push('/products')
  }

  // Updated filteredItems logic with filters applied
  const baseFilteredItems = isSearchActive ? searchResults : currencyFilteredItems.filter((item) => {
    return selectedCategory === null || item.category_id === selectedCategory
  })
  
  // Apply sorting to regular products (non-search)
  const sortedBaseItems = !isSearchActive && searchSortBy !== 'relevance' ? 
    [...baseFilteredItems].sort((a: any, b: any) => {
      if (searchSortBy === 'name') {
        return a.name.localeCompare(b.name)
      } else if (searchSortBy === 'newest') {
        // First priority: items with is_new flag
        if (a.is_new && !b.is_new) return -1
        if (!a.is_new && b.is_new) return 1
        
        // Second priority: creation date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (searchSortBy === 'price_low' || searchSortBy === 'price_high') {
        const aVariant = a.variants?.find((v: any) => 
          selectedCurrency === 'AED' ? v.available_aed : v.available_inr
        ) || a.variants?.[0]
        const bVariant = b.variants?.find((v: any) => 
          selectedCurrency === 'AED' ? v.available_aed : v.available_inr
        ) || b.variants?.[0]
        
        // Get the actual selling price (discount price if available, otherwise regular price)
        const aPrice = selectedCurrency === 'AED' 
          ? (aVariant?.discount_aed && aVariant.discount_aed > 0 ? aVariant.discount_aed : aVariant?.price_aed || 0)
          : (aVariant?.discount_inr && aVariant.discount_inr > 0 ? aVariant.discount_inr : aVariant?.price_inr || 0)
        const bPrice = selectedCurrency === 'AED' 
          ? (bVariant?.discount_aed && bVariant.discount_aed > 0 ? bVariant.discount_aed : bVariant?.price_aed || 0)
          : (bVariant?.discount_inr && bVariant.discount_inr > 0 ? bVariant.discount_inr : bVariant?.price_inr || 0)
        
        return searchSortBy === 'price_low' ? aPrice - bPrice : bPrice - aPrice
      } else if (searchSortBy === 'discount') {
        const aVariant = a.variants?.find((v: any) => 
          selectedCurrency === 'AED' ? v.available_aed : v.available_inr
        ) || a.variants?.[0]
        const bVariant = b.variants?.find((v: any) => 
          selectedCurrency === 'AED' ? v.available_aed : v.available_inr
        ) || b.variants?.[0]
        
        // Calculate discount percentage for each product
        const aOriginalPrice = selectedCurrency === 'AED' ? (aVariant?.price_aed || 0) : (aVariant?.price_inr || 0)
        const aDiscountPrice = selectedCurrency === 'AED' ? (aVariant?.discount_aed || 0) : (aVariant?.discount_inr || 0)
        const aDiscountPercent = aOriginalPrice > 0 && aDiscountPrice > 0 
          ? Math.round(((aOriginalPrice - aDiscountPrice) / aOriginalPrice) * 100) 
          : 0
        
        const bOriginalPrice = selectedCurrency === 'AED' ? (bVariant?.price_aed || 0) : (bVariant?.price_inr || 0)
        const bDiscountPrice = selectedCurrency === 'AED' ? (bVariant?.discount_aed || 0) : (bVariant?.discount_inr || 0)
        const bDiscountPercent = bOriginalPrice > 0 && bDiscountPrice > 0 
          ? Math.round(((bOriginalPrice - bDiscountPrice) / bOriginalPrice) * 100) 
          : 0
        
        // Sort by highest discount first
        return bDiscountPercent - aDiscountPercent
      }
      return 0
    }) : baseFilteredItems
  
  const filteredItems = applyFilters(sortedBaseItems, activeFilters)

  const shouldShowSpinButton = authInitialized && !isAuthenticated && !showSpinner

  // Updated getCurrentCategoryName function
  const getCurrentCategoryName = () => {
    const searchFromUrl = searchParams.get("search")
    if (searchFromUrl) {
      return `Search results for "${searchFromUrl}" (${selectedCurrency})`
    }
    if (selectedCategory === null) return `All products (${selectedCurrency})`
    const category = categories.find((cat) => cat.id === selectedCategory)
    return `${category?.name || "Products"} (${selectedCurrency})`
  }

  const lightningDeals = filteredItems.filter((item) => item.is_featured).slice(0, 4)
  const clearanceDeals = filteredItems.filter((item) => {
    if (selectedCurrency === 'AED' && item.price_aed) {
      return item.price_aed < 50
    } else if (selectedCurrency === 'INR' && item.price_inr) {
      return item.price_inr < 2000
    }
    return item.price < 50
  }).slice(0, 4)
  const newArrivals = filteredItems.filter((item) => item.is_new).slice(0, 12)

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Search Filters */}
      <SearchFilters
        isSearchActive={isSearchActive}
        searchQuery={currentSearchQuery}
        totalResults={filteredItems.length}
        sortBy={searchSortBy}
        onSortChange={handleSortChange}
        onClearSearch={handleClearSearch}
        onFilterChange={handleFilterChange}
        products={sortedBaseItems}
      />

      {/* Blur Overlay with Animation */}
      {showBlur && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop blur */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" />
          
          {/* Animated Icon */}
          <div className="relative z-10">
            {animationType === 'wishlist' && (
              <div className="animate-in zoom-in duration-500 animate-out zoom-out fade-out delay-1000 duration-1000">
                <div className="bg-zinc-900 rounded-full p-8 shadow-lg">
                  <Heart 
                    className="w-16 h-16 text-white fill-white" 
                  />
                </div>
              </div>
            )}
            
            {animationType === 'cart' && (
              <div className="animate-in zoom-in duration-500 animate-out zoom-out fade-out delay-1000 duration-1000">
                <div className="bg-zinc-900 rounded-full p-8 shadow-lg">
                  <ShoppingCart 
                    className="w-16 h-16 text-white" 
                  />
                </div>
                {/* Floating effect */}
              </div>
            )}
          </div>
        </div>
      )}

      <div
        className={`transition-all duration-300 ${categoryTransition ? "opacity-50 scale-95" : "opacity-100 scale-100"} ${showBlur ? "blur-sm" : ""}`}
      >
        {/* Desktop Controls */}
        <div className="hidden lg:block px-6 mt-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* <h3 className="text-xl font-bold text-gray-900">{`Lightning deals in ${getCurrentCategoryName() === 'shop A' ? 'Beauty' : 'Accessories'}`}</h3> */}
            
              {currencyFilteredItems.length !== shopFilteredItems.length && (
                <Badge variant="outline" className="text-zinc-700 border-zinc-300">
                  Filtered by {selectedCurrency} availability
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Top Picks */}
    {lightningDeals.length > 0 && !isSearchActive && (
  <div className="px-4 lg:px-6 mt-6 lg:mt-8">
    <div className="max-w-7xl mx-auto">

      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-zinc-900" />
        <h3 className="text-base lg:text-lg font-bold text-zinc-900">Top Picks</h3>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
        {lightningDeals.map((item) => {
          const v = item.variants?.find((vt: any) => vt.available_aed || vt.available_inr) || item.variants?.[0];

          let off = 0;
          if (v) {
            if (selectedCurrency === "AED" && v.price_aed && v.discount_aed && v.price_aed > v.discount_aed)
              off = Math.round(((v.price_aed - v.discount_aed) / v.price_aed) * 100);
            else if (selectedCurrency === "INR" && v.price_inr && v.discount_inr && v.price_inr > v.discount_inr)
              off = Math.round(((v.price_inr - v.discount_inr) / v.price_inr) * 100);
          }

          const unavail =
            (selectedCurrency === "AED" && !v?.available_aed) ||
            (selectedCurrency === "INR" && !v?.available_inr);

          return (
            <div
              key={item.id}
              onClick={() => router.push(`/product/${item.id}`)}
              className="flex-shrink-0 w-36 lg:w-44 cursor-pointer group"
            >
              {/* Image */}
              <div className="relative aspect-square rounded-2xl bg-white border border-zinc-200 overflow-hidden mb-2.5">
                <Image
                  src={item.image_urls?.[0] || `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(item.name)}`}
                  alt={item.name || "Product"}
                  fill
                  className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                />

                {off > 0 && (
                  <span className="absolute top-2 left-2 bg-zinc-900 text-white text-[10px] font-bold rounded-md px-1.5 py-0.5 leading-none">
                    {off}% OFF
                  </span>
                )}

                <button
                  onClick={(e) => { e.stopPropagation(); handleToggleWishlist(item); }}
                  className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    isInWishlist(item.id)
                      ? "bg-red-50 text-red-500"
                      : "bg-white/90 text-zinc-400 hover:text-red-500"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isInWishlist(item.id) ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Text */}
              <p className="text-[13px] font-medium text-zinc-800 leading-tight line-clamp-1">{item.name}</p>
              <div className="mt-1">
                {unavail ? (
                  <span className="text-xs text-zinc-400">Unavailable</span>
                ) : v ? (
                  <span className="text-sm font-bold text-zinc-900">
                    {formatPriceWithSmallDecimals(v.discount_aed, v.discount_inr, "AED", true, "#18181b")}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
)}

        {/* Main Section with Zytheme Autoshop 2-Column Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Left Sidebar (Desktop & Tablet Collapsible) */}
            <div className="lg:col-span-1 space-y-8">
              {/* CATEGORIES Section */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200 flex items-center justify-between">
                  <span>Categories</span>
                  <span className="h-0.5 w-6 bg-red-600"></span>
                </h2>
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className={`flex items-center justify-between w-full text-sm font-medium py-2 px-2.5 rounded-lg transition-colors ${
                      selectedCategory === null
                        ? "bg-red-50 text-red-600 font-bold"
                        : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-red-500 font-bold">&raquo;</span> All Products
                    </span>
                    <span className="text-xs text-gray-400 font-normal">({items.length})</span>
                  </button>
                  {categories.map((cat) => {
                    const count = items.filter((i) => i.category_id === cat.id).length
                    const isSelected = selectedCategory === cat.id
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`flex items-center justify-between w-full text-sm font-medium py-2 px-2.5 rounded-lg transition-colors ${
                          isSelected
                            ? "bg-red-50 text-red-600 font-bold"
                            : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <span className="text-red-500 font-bold">&raquo;</span> {cat.name}
                        </span>
                        <span className="text-xs text-gray-400 font-normal">({count})</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* RECENT ITEMS Section */}
              {items.length > 0 && (
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hidden md:block">
                  <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200 flex items-center justify-between">
                    <span>Recent Items</span>
                    <span className="h-0.5 w-6 bg-red-600"></span>
                  </h2>
                  <div className="space-y-4">
                    {items.slice(0, 3).map((item) => {
                      const v = item.variants?.find((vt: any) => vt.available_aed || vt.available_inr) || item.variants?.[0]
                      return (
                        <div
                          key={item.id}
                          onClick={() => router.push(`/product/${item.id}`)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div className="relative w-14 h-14 bg-stone-100 rounded-lg overflow-hidden shrink-0 border border-gray-200 p-1">
                            <Image
                              src={item.image_urls?.[0] || item.image_url || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-gray-900 uppercase truncate group-hover:text-red-600 transition-colors">
                              {item.name}
                            </h4>
                            <p className="text-xs font-bold text-red-600 mt-1">
                              {v
                                ? formatPriceWithSmallDecimals(v.discount_aed || v.price_aed, v.discount_inr || v.price_inr, "AED", true, "#dc2626")
                                : `₹ ${item.price}`}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* FILTER BY PRICE Section */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200 flex items-center justify-between">
                  <span>Filter By Price</span>
                  <span className="h-0.5 w-6 bg-red-600"></span>
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-600">
                    <span>Price: ₹ 50 - ₹ 50,000</span>
                  </div>
                  <Button
                    onClick={() => {
                      // Apply price filter or trigger reset
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-xs tracking-wider py-2 rounded-lg transition-colors"
                  >
                    Filter
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Main Grid Area */}
            <div className="lg:col-span-3">
              {/* Header Bar with Count and Sort Dropdown (Matching Zytheme Screenshot 1) */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm font-semibold text-gray-800">
                  Showing <span className="text-red-600 font-bold">1 : {filteredItems.length}</span> Of <span className="font-bold">{items.length}</span> Products
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Sort By:</span>
                  <select
                    value={searchSortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2 font-medium"
                  >
                    <option value="relevance">Default Sorting</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                    <option value="discount">Highest Discount</option>
                  </select>
                </div>
              </div>

              {/* Product Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-white p-4 rounded-xl border border-gray-200 h-72"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => {
                    const availableVariant = item.variants?.find((v: any) => v.available_aed || v.available_inr) || item.variants?.[0]
                    let discountPercent = 0
                    if (availableVariant) {
                      if (selectedCurrency === 'AED' && availableVariant.price_aed && availableVariant.discount_aed && availableVariant.price_aed > availableVariant.discount_aed) {
                        discountPercent = Math.round(((availableVariant.price_aed - availableVariant.discount_aed) / availableVariant.price_aed) * 100)
                      } else if (selectedCurrency === 'INR' && availableVariant.price_inr && availableVariant.discount_inr && availableVariant.price_inr > availableVariant.discount_inr) {
                        discountPercent = Math.round(((availableVariant.price_inr - availableVariant.discount_inr) / availableVariant.price_inr) * 100)
                      }
                    }

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col cursor-pointer"
                        onClick={() => router.push(`/product/${item.id}`)}
                      >
                        {/* Image Container (Zytheme Light Gray Box) */}
                        <div className="relative bg-stone-100 p-6 flex items-center justify-center h-52 group-hover:bg-stone-200/60 transition-colors">
                          <Image
                            src={item.image_urls?.[0] || item.image_url || "/placeholder.svg"}
                            alt={item.name}
                            width={200}
                            height={200}
                            className="object-contain h-44 w-full group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Wishlist Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleWishlist(item)
                            }}
                            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${
                              isInWishlist(item.id) ? "bg-red-50 text-red-600" : "bg-white text-gray-400 hover:text-red-600"
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${isInWishlist(item.id) ? "fill-current" : ""}`} />
                          </button>

                          {/* Discount Badge */}
                          {discountPercent > 0 && (
                            <Badge className="absolute top-3 left-3 bg-red-600 text-white text-xs px-2 py-0.5 rounded-md font-bold">
                              {discountPercent}% OFF
                            </Badge>
                          )}
                        </div>

                        {/* Card Content (Brand, Title, Price, Add to Cart) */}
                        <div className="p-4 flex-1 flex flex-col justify-between text-center">
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                              {item.brand || item.category_name || "Spare Parts"}
                            </p>
                            <h3 className="font-bold text-gray-900 text-sm uppercase line-clamp-2 min-h-[2.5rem] group-hover:text-red-600 transition-colors">
                              {item.name}
                            </h3>
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-center gap-2 mb-3">
                              <span className="text-base font-extrabold text-red-600">
                                {availableVariant
                                  ? formatPriceWithSmallDecimals(
                                      availableVariant.discount_aed || availableVariant.price_aed,
                                      availableVariant.discount_inr || availableVariant.price_inr,
                                      "AED",
                                      true,
                                      "#dc2626"
                                    )
                                  : `₹ ${item.price}`}
                              </span>
                              {discountPercent > 0 && availableVariant && (
                                <span className="text-xs text-gray-400 line-through font-normal">
                                  {formatPriceWithSmallDecimals(
                                    availableVariant.price_aed,
                                    availableVariant.price_inr,
                                    "AED",
                                    true,
                                    "#9ca3af"
                                  )}
                                </span>
                              )}
                            </div>

                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAddToCart(item)
                              }}
                              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                              disabled={item.stock_quantity <= 0}
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              {item.stock_quantity > 0 ? "Add To Cart" : "Out of Stock"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* No items state */}
              {filteredItems.length === 0 && !loading && (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                  <div className="text-5xl mb-3">🚗</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No products found</h3>
                  <p className="text-sm text-gray-500 mb-4">Try selecting another category or resetting search filters.</p>
                  <Button onClick={() => handleCategoryChange(null)} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase px-4 py-2 rounded-lg">
                    View All Products
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}