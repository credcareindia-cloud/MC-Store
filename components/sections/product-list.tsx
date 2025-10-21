"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import { fetchProducts, fetchCategories, setSelectedCategory } from "@/lib/store/slices/productSlice"
import { addToCart } from "@/lib/store/slices/orderSlice"
import { useShop } from "@/lib/contexts/shop-context"
import { useCurrency } from "@/lib/contexts/currency-context"
import { Button } from "@/components/ui/button"
import { useLoginModal } from '@/lib/stores/useLoginModal'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ChevronRight, Zap, Grid3X3, List, SlidersHorizontal, Tag, Heart, ChevronDown, ShoppingCart, Loader2 } from "lucide-react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { addToWishlistAPI, removeFromWishlistAPI } from '@/lib/store/slices/wishlistSlice'
import SearchFilters from "@/components/ui/search-filters"
import ShopSwitchPopup from "@/components/ui/shop-switch-popup"
import { useShopSwitchPopup } from "@/lib/hooks/useShopSwitchPopup"
import FloatingShopAd from "@/components/ui/floating-shop-ad"
import { useFloatingShopAd } from "@/lib/hooks/useFloatingShopAd"

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
  const { shop } = useShop()

  // Shop switching popup
  const { isPopupOpen, closePopup, switchShop } = useShopSwitchPopup({
    intervalMinutes: 3, // Show every 3 minutes
    initialDelayMinutes: 1, // Wait 1 minute before first show
    maxShowsPerSession: 4 // Max 4 times per session
  })

  // Floating shop ad
  const { isAdVisible, closeAd, switchShop: switchShopFromAd } = useFloatingShopAd({
    showAfterScrollPixels: 400, // Show after scrolling 400px
    displayDurationMinutes: 2, // Show for 2 minutes
    cooldownMinutes: 4, // 4 minute cooldown
    maxShowsPerSession: 3 // Max 3 times per session
  })
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
          default_currency: product.default_currency || "INR",
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

  const shopFilteredItems = items.filter((item: any) => {
    return item.shop_category === shop || item.shop_category === 'Both'
  })

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
  }, [searchParams, shop, selectedCurrency, searchSortBy, dispatch])

  const fetchSearchResults = async (query: string, sort: string = 'relevance') => {
    try {
      setIsSearchLoading(true)
      const searchUrl = new URL('/api/products/search', window.location.origin)
      searchUrl.searchParams.set('q', query)
      searchUrl.searchParams.set('shop', shop)
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
      return `Search results for "${searchFromUrl}" in SHOP ${shop} (${selectedCurrency})`
    }
    if (selectedCategory === null) return `SHOP ${shop} (${selectedCurrency})`
    const category = categories.find((cat) => cat.id === selectedCategory)
    return `Shop ${shop} - ${category?.name || "Products"} (${selectedCurrency})`
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
                <div className="bg-red-500 rounded-full p-8 shadow-2xl animate-bounce">
                  <Heart 
                    className="w-16 h-16 text-white fill-white animate-pulse" 
                  />
                </div>
                {/* Floating effect */}
                <div className="absolute inset-0 bg-red-500 rounded-full p-8 opacity-30 animate-ping" />
              </div>
            )}
            
            {animationType === 'cart' && (
              <div className="animate-in zoom-in duration-500 animate-out zoom-out fade-out delay-1000 duration-1000">
                <div className="bg-orange-500 rounded-full p-8 shadow-2xl animate-bounce">
                  <ShoppingCart 
                    className="w-16 h-16 text-white animate-pulse" 
                  />
                </div>
                {/* Floating effect */}
                <div className="absolute inset-0 bg-orange-500 rounded-full p-8 opacity-30 animate-ping" />
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
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  Filtered by {selectedCurrency} availability
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Lightning Deals Section - Only show when not searching */}
    {lightningDeals.length > 0 && !isSearchActive && (
  <div className="px-4 lg:px-6 mt-6">
    <div className="max-w-7xl mx-auto">
    
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-500" />
          <h3 className="text-xl font-bold text-gray-900">Lightning deals</h3>
          <span className="text-gray-500">({lightningDeals.length} items)</span>
        </div>
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </div>
      
      {/* Horizontally Scrollable Container */}
      <div className="relative">
        <div className="flex gap-3 lg:gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {lightningDeals.map((item, index) => {
            // Get the best available variant
            const availableVariant = item.variants?.find((v: any) => 
              v.available_aed || v.available_inr
            ) || item.variants?.[0];
            
            // Calculate discount percentage based on selected currency
            let discountPercent = 0;
            if (availableVariant) {
              console.log('Lightning Deals - Currency:', selectedCurrency, 'Variant:', availableVariant);
              if (selectedCurrency === 'AED' && availableVariant.price_aed && availableVariant.discount_aed && availableVariant.price_aed > availableVariant.discount_aed) {
                discountPercent = Math.round(((availableVariant.price_aed - availableVariant.discount_aed) / availableVariant.price_aed) * 100);
                console.log('AED Discount:', discountPercent, 'Price:', availableVariant.price_aed, 'Discount:', availableVariant.discount_aed);
              } else if (selectedCurrency === 'INR' && availableVariant.price_inr && availableVariant.discount_inr && availableVariant.price_inr > availableVariant.discount_inr) {
                discountPercent = Math.round(((availableVariant.price_inr - availableVariant.discount_inr) / availableVariant.price_inr) * 100);
                console.log('INR Discount:', discountPercent, 'Price:', availableVariant.price_inr, 'Discount:', availableVariant.discount_inr);
              }
            }

            return (
              <Card
                key={item.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border hover:border-orange-200 flex-shrink-0 w-44 lg:w-52"
              >
                <div className="relative">
                  <Image
                    key={item.id}
                    onClick={() => router.push(`/product/${item.id}`)}
                    src={
                      item.image_urls?.[0] ||
                      `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(item.name) || "/placeholder.svg"}`
                    }
                    alt={item.name || "Product"}
                    width={200}
                    height={200}
                    className="w-full h-32 lg:h-40 object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                  />
                  
                  {/* Ranking Badge */}
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center text-xs lg:text-sm font-bold shadow-lg">
                    #{index + 1}
                  </div>

                  {/* TOP SELLING Badge - only show if featured */}
                  {item.is_featured && (
                    <Badge className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-pulse font-semibold">
                      ⭐ TOP SELLING
                    </Badge>
                  )}

                  {/* Feature Badge */}
                  <Badge className="absolute bottom-2 left-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                    {item.features?.[0]
                      ? item.features[0].length > 7
                        ? item.features[0].slice(0, 7) + "..."
                        : item.features[0]
                      : "Assured"}
                  </Badge>

                  {/* Discount Percentage Badge */}
                  {discountPercent > 0 && (
                    <Badge className="absolute bottom-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full shadow-lg font-bold animate-pulse">
                      -{discountPercent}% 
                    </Badge>
                  )}
                </div>

                <CardContent className="p-3 lg:p-4">
                  {/* Enhanced Price Section */}
                  <div className="mb-2">
                    {availableVariant && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {(
                          // Check currency availability
                          (selectedCurrency === "AED" && !availableVariant.available_aed) ||
                          (selectedCurrency === "INR" && !availableVariant.available_inr)
                        ) ? (
                          // Show "Not Available" in red if unavailable
                          <span className="text-red-600 font-bold text-sm lg:text-base">
                            Not Available
                          </span>
                        ) : (
                          <>
                            {/* Discounted Price with smaller decimal */}
                            <span className="text-red-500 font-bold text-sm lg:text-base">
                              {formatPriceWithSmallDecimals(
                                availableVariant.discount_aed,
                                availableVariant.discount_inr,
                                "AED",
                                true,             // show symbol
                                "#ef4444"    // color applied
                              )}
                            </span>

                            {/* Original Price if discount is available */}
                            {discountPercent > 0 && (
                              <span className="text-gray-500 text-xs line-through">
                               {formatPriceWithSmallDecimals(
                                availableVariant.price_aed,
                                availableVariant.price_inr,
                                "AED",
                                true,           
                                "#6B7280"  
                              )}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-xs lg:text-sm text-gray-600 mt-1 line-clamp-2">{item.name}</p>

                  <Button
                    onClick={() => router.push(`/product/${item.id}`)}
                    className="w-full mt-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full py-2 text-xs lg:text-sm font-medium transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                  >
                    Buy Now
                  </Button>
                  
                  <Button
                    onClick={() => handleToggleWishlist(item)}
                    className={`w-full mt-2 rounded-full py-2 text-xs lg:text-sm font-medium transform transition-all duration-200 hover:scale-105 active:scale-95 ${
                      isInWishlist(item.id)
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-md'
                        : 'bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Heart className={`w-3 h-3 ${isInWishlist(item.id) ? 'fill-current' : ''}`} />
                      {isInWishlist(item.id) ? 'Saved' : 'Save'}
                    </div>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  </div>
)}

        {/* Main Products Grid */}
        <div className="px-4 lg:px-6 mt-6 pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Show section header only when not searching */}
            {!isSearchActive && (
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-green-500" />
                  <span className="font-bold text-lg lg:text-xl">Fast Selling Products</span>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            )}
            
            {/* Show unified search results header when searching */}
            {isSearchActive && (
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="font-bold text-lg lg:text-xl">Search Results</span>
                  <span className="text-gray-500">({filteredItems.length} products)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
            {loading ? (
              <div
                className={`grid gap-3 lg:gap-6 ${viewMode === "list" ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                  }`}
              >
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-300 h-40 lg:h-48 rounded-xl mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`grid gap-3 lg:gap-6 ${viewMode === "list" ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                  }`}
              >
             {filteredItems.map((item) => {
  // Get the best available variant
  const availableVariant =
    item.variants?.find(
      (v: any) => v.available_aed || v.available_inr
    ) || item.variants?.[0];

  // Calculate discount percentage based on selected currency
  let discountPercent = 0;
  if (availableVariant) {
    console.log('Main Grid - Currency:', selectedCurrency, 'Variant:', availableVariant);
    if (selectedCurrency === 'AED' && availableVariant.price_aed && availableVariant.discount_aed && availableVariant.price_aed > availableVariant.discount_aed) {
      discountPercent = Math.round(((availableVariant.price_aed - availableVariant.discount_aed) / availableVariant.price_aed) * 100);
      console.log('AED Main Discount:', discountPercent, 'Price:', availableVariant.price_aed, 'Discount:', availableVariant.discount_aed);
    } else if (selectedCurrency === 'INR' && availableVariant.price_inr && availableVariant.discount_inr && availableVariant.price_inr > availableVariant.discount_inr) {
      discountPercent = Math.round(((availableVariant.price_inr - availableVariant.discount_inr) / availableVariant.price_inr) * 100);
      console.log('INR Main Discount:', discountPercent, 'Price:', availableVariant.price_inr, 'Discount:', availableVariant.discount_inr);
    }
  }

// Condition label mapping
const conditionLabels = {
  master: "Master",
  "first-copy": "1st Copy",
  "second-copy": "2nd Copy",
  hot: "Hot",
  sale: "Sale"
};

// Badge background color mapping
const conditionColors = {
  master: "bg-green-600",
  "first-copy": "bg-yellow-600",
  "second-copy": "bg-purple-600",
  hot: "bg-red-600",
  sale: "bg-blue-600"
};

const conditionLabel = conditionLabels[item.condition_type as keyof typeof conditionLabels] || "";
const badgeColor = conditionColors[item.condition_type as keyof typeof conditionColors] || "bg-gray-500";

  return (
    <div key={item.id} className="cursor-pointer">
      <Card
        className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group ${
          viewMode === "list" ? "flex items-center" : ""
        }`}
      >
        <div
          className={`relative ${
            viewMode === "list" ? "w-32 h-32 flex-shrink-0" : ""
          }`}
        >
          <Image
            onClick={() => router.push(`/product/${item.id}`)}
            src={
              item.image_urls?.[0] ||
              `/placeholder.svg?height=200&width=200&query=${
                encodeURIComponent(item.name) || "/placeholder.svg"
              }`
            }
            alt={item.name}
            width={200}
            height={200}
            className={`object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer ${
              viewMode === "list" ? "w-32 h-32 rounded-lg" : "w-full h-40 lg:h-48"
            }`}
          />

          {item.is_new && (
            <Badge className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
              NEW
            </Badge>
          )}

          {item.condition_type && item.condition_type !== "none" && (
  <Badge
    className={`absolute top-2 right-2 ${badgeColor} text-white text-xs px-2 py-1 rounded capitalize`}
  >
    {conditionLabel}
  </Badge>
)}
  {discountPercent > 0 && (
                    <Badge className="absolute bottom-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full shadow-lg font-bold animate-pulse">
                      {discountPercent}% off
                    </Badge>
                  )}

        </div>

        <CardContent
          className={`p-3 lg:p-4 ${viewMode === "list" ? "flex-1" : ""}`}
        >
          <div className="flex items-center justify-between mb-2">
            {/* Price */}
            <p className="text-red-500 font-bold text-sm lg:text-lg">
             {availableVariant && (
    <div className="flex items-center gap-2 flex-wrap">
      {(
        // Check currency availability
        (selectedCurrency === "AED" && !availableVariant.available_aed) ||
        (selectedCurrency === "INR" && !availableVariant.available_inr)
      ) ? (
        // Show "Not Available" in red if unavailable
        <span className="text-red-600 font-bold text-sm lg:text-base">
          Not Available
        </span>
      ) : (
        <>
          {/* Discounted Price with smaller decimal */}
          <span className="text-red-500 font-bold text-sm lg:text-base">
            {formatPriceWithSmallDecimals(
              availableVariant.discount_aed,
              availableVariant.discount_inr,
              "AED",
              true,             // show symbol
              "#ef4444"    // ✅ color applied
            )}
          </span>

          {/* Original Price if discount is available */}
          {/* {discountPercent > 0 && (
            <span className="text-gray-500 text-xs line-through">
              {formatPriceWithSmallDecimals(
                availableVariant.price_aed,
                availableVariant.price_inr,
                "AED",
                false,          
                "#6B7280"
              )}
            </span>
          )} */}
        </>
      )}
    </div>
  )}
            </p>

            {/* Discount Percentage */}
             {discountPercent > 0 && (
                              <span className="text-gray-500 text-xs line-through">
                               {formatPriceWithSmallDecimals(
                                availableVariant.price_aed,
                                availableVariant.price_inr,
                                "AED",
                                true,           
                                "#6B7280"  
                              )}
                              </span>
                            )}
          </div>

          {/* Product Name */}
          <h3 className={`font-medium text-gray-900 mb-2 ${
            viewMode === "list" 
              ? "text-base lg:text-lg line-clamp-2" 
              : "text-sm lg:text-base line-clamp-2"
          }`}>
            {viewMode === "list" ? item.name : (item.name.length > 15 ? item.name.slice(0, 17) + "..." : item.name)}
          </h3>

          {viewMode === "list" && (
            <p className="text-sm text-gray-600 line-clamp-3 mb-3">
              {item.description}
            </p>
          )}


<div className="flex gap-2">
  <Button
    onClick={() => router.push(`/product/${item.id}`)}
    className={`flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full py-2 lg:py-3 text-sm lg:text-base font-medium shadow-lg transform transition-all duration-200 flex items-center justify-center gap-2 ${
      viewMode === "list" 
        ? "hover:from-orange-600 hover:to-red-600 hover:scale-102" 
        : "hover:from-orange-600 hover:to-red-600 hover:scale-105"
    } active:scale-95`}
    disabled={!item.is_available}
  >
    {item.is_available ? (
      <>
        <ShoppingCart className="w-4 h-4" />
        Buy
      </>
    ) : (
      "Unavailable"
    )}
  </Button>

  <Button
    onClick={() => handleToggleWishlist(item)}
    className={`px-3 lg:px-4 rounded-full py-2 text-sm font-medium transform transition-all duration-200 hover:scale-105 active:scale-95 ${
      isInWishlist(item.id)
        ? "bg-red-500 hover:bg-red-600 text-white"
        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
    }`}
  >
    <Heart
      className={`w-4 h-4 ${isInWishlist(item.id) ? "fill-current" : ""}`}
    />
  </Button>
</div>

        </CardContent>
      </Card>
    </div>
  );
})}

              </div>
            )}
            {/* Loading state for search */}
            {isSearchLoading && (
              <div className="text-center py-16">
                <div className="flex justify-center mb-4">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Searching for "{searchParams.get("search")}"...
                </h3>
                <p className="text-gray-500">
                  Finding the best products for you
                </p>
              </div>
            )}
            
            {/* Updated no products found section */}
            {filteredItems.length === 0 && !loading && !isSearchLoading && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                {searchParams.get("search") ? (
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No products found for "{searchParams.get("search")}"
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Try different keywords or browse categories below
                    </p>
                    <Button
                      onClick={() => {
                        setSearchTerm("")
                        router.push("/products")
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Clear Search
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found in Shop {shop === "A" ? "Beauty" : "Style"}</h3>
                    <p className="text-gray-500">
                      No products available with {selectedCurrency} pricing. Try switching currency or check the other shop.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shop Switch Popup */}
      <ShopSwitchPopup
        isOpen={isPopupOpen}
        onClose={closePopup}
        onSwitchShop={switchShop}
      />

      {/* Floating Shop Ad */}
      <FloatingShopAd
        isVisible={isAdVisible}
        onClose={closeAd}
        onSwitchShop={switchShopFromAd}
      />
    </div>
    
  )
}