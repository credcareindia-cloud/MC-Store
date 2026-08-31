"use client"

import { useEffect, useState, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import { fetchProducts, fetchCategories, setSelectedCategory } from "@/lib/store/slices/productSlice"
import { addToCart } from "@/lib/store/slices/orderSlice"
import { useCurrency } from "@/lib/contexts/currency-context"
import { Button } from "@/components/ui/button"
import { useLoginModal } from '@/lib/stores/useLoginModal'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ChevronLeft, ChevronRight, Zap, Grid3X3, List, SlidersHorizontal, Tag, Heart, ChevronDown, ShoppingCart, Loader2, Flame, ArrowUpDown, Bookmark, MessageCircle, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import { addToWishlistAPI, removeFromWishlistAPI } from '@/lib/store/slices/wishlistSlice'
import SearchFilters from "@/components/ui/search-filters"
import { handleWhatsAppProductRequest } from "@/lib/whatsapp-request"

interface ProductListProps {
  showSpinner?: boolean
  onCloseSpinner?: () => void
  showTopPicks?: boolean
}

function getVariantDisplayName(v: any) {
  const parts = []
  if (v.name && v.name.toLowerCase() !== "default" && v.name.toLowerCase() !== "default variant") {
    parts.push(v.name)
  }
  if (v.color) parts.push(v.color)
  if (v.size) parts.push(v.size)

  if (parts.length === 0) {
    return v.name || `Variant ${v.id}`
  }
  return parts.join(" / ")
}

function getProductSellingPrice(product: any, currency: string) {
  const availableVariant =
    product.variants?.find((v: any) =>
      currency === "AED" ? v.available_aed : v.available_inr
    ) || product.variants?.[0]

  if (!availableVariant) return 0

  const originalPrice =
    currency === "AED" ? availableVariant.price_aed || 0 : availableVariant.price_inr || 0
  const discountPrice =
    currency === "AED" ? availableVariant.discount_aed || 0 : availableVariant.discount_inr || 0

  const hasDiscount =
    originalPrice > 0 &&
    discountPrice > 0 &&
    discountPrice < originalPrice &&
    (originalPrice - discountPrice) / originalPrice >= 0.01

  return hasDiscount ? discountPrice : originalPrice
}

function formatSidebarPrice(amount: number, currency: string) {
  if (currency === "INR") {
    return `₹ ${amount.toLocaleString("en-IN")}`
  }
  return `AED ${amount.toLocaleString()}`
}

export default function ProductList({ showSpinner = false, onCloseSpinner, showTopPicks = false }: ProductListProps) {
  const { user, isAuthenticated } = useAuth()
  const [authInitialized, setAuthInitialized] = useState(false)
  const [selectedVariants, setSelectedVariants] = useState<Record<number, any>>({})
  const { openModal } = useLoginModal()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [categoryTransition, setCategoryTransition] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categorySearchTerm, setCategorySearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  
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

  const handleAddToCart = (product: any, selectedVariant?: any) => {
    if (!isAuthenticated) {
      openModal()
      return
    }
    dispatch(addToCart({
      menuItem: product,
      quantity: 1,
      selectedCurrency,
      userId: user?.id,
      variant_id: selectedVariant?.id,
      selected_variant: selectedVariant
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
  const [sidebarPriceRange, setSidebarPriceRange] = useState<[number, number]>([0, 50000])
  const [showPriceFilter, setShowPriceFilter] = useState(false)
  const [showCategoryPanel, setShowCategoryPanel] = useState(false)

  // Apply filters to search results
  const applyFilters = (items: any[], filters: any) => {
    if (!filters || Object.keys(filters).length === 0) return items
    
    return items.filter(item => {
      const validVariants = item.variants?.filter((v: any) => 
        selectedCurrency === 'AED' ? v.available_aed : v.available_inr
      ) || []
      
      if (validVariants.length === 0 && item.variants?.[0]) {
        validVariants.push(item.variants[0])
      }

      // Apply discount filter
      if (filters.discount) {
        const hasDiscount = validVariants.some((v: any) => {
          const originalPrice = selectedCurrency === 'AED' ? (v.price_aed || 0) : (v.price_inr || 0)
          const discountPrice = selectedCurrency === 'AED' ? (v.discount_aed || 0) : (v.discount_inr || 0)
          return originalPrice > 0 && discountPrice > 0 && discountPrice < originalPrice && ((originalPrice - discountPrice) / originalPrice) >= 0.01
        })
        if (!hasDiscount) return false
      }

      // Discount ranges:
      const matchDiscountRange = (min: number, max: number) => {
        return validVariants.some((v: any) => {
          const originalPrice = selectedCurrency === 'AED' ? (v.price_aed || 0) : (v.price_inr || 0)
          const discountPrice = selectedCurrency === 'AED' ? (v.discount_aed || 0) : (v.discount_inr || 0)
          const hasDiscount = originalPrice > 0 && discountPrice > 0 && discountPrice < originalPrice && ((originalPrice - discountPrice) / originalPrice) >= 0.01
          const pct = hasDiscount ? ((originalPrice - discountPrice) / originalPrice) * 100 : 0
          return pct >= min && pct < max
        })
      }

      if (filters.discount_10_20 && !matchDiscountRange(10, 20)) return false
      if (filters.discount_20_30 && !matchDiscountRange(20, 30)) return false
      if (filters.discount_30_40 && !matchDiscountRange(30, 40)) return false
      if (filters.discount_40_plus && !validVariants.some((v: any) => {
        const originalPrice = selectedCurrency === 'AED' ? (v.price_aed || 0) : (v.price_inr || 0)
        const discountPrice = selectedCurrency === 'AED' ? (v.discount_aed || 0) : (v.discount_inr || 0)
        const hasDiscount = originalPrice > 0 && discountPrice > 0 && discountPrice < originalPrice && ((originalPrice - discountPrice) / originalPrice) >= 0.01
        const pct = hasDiscount ? ((originalPrice - discountPrice) / originalPrice) * 100 : 0
        return pct >= 40
      })) return false

      // Apply price range slider filter
      if (filters.priceRange && Array.isArray(filters.priceRange)) {
        const [minPrice, maxPrice] = filters.priceRange
        const hasPriceMatch = validVariants.some((v: any) => {
          const originalPrice = selectedCurrency === 'AED' ? (v.price_aed || 0) : (v.price_inr || 0)
          const discountPrice = selectedCurrency === 'AED' ? (v.discount_aed || 0) : (v.discount_inr || 0)
          const hasDiscount = originalPrice > 0 && discountPrice > 0 && discountPrice < originalPrice && ((originalPrice - discountPrice) / originalPrice) >= 0.01
          const price = hasDiscount ? discountPrice : originalPrice
          return price >= minPrice && price <= maxPrice
        })
        if (!hasPriceMatch) return false
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

  const categoriesWithProducts = categories.filter(
    (cat) => items.filter((i) => i.category_id === cat.id).length > 0
  )

  const filteredCategories = categorySearchTerm.trim()
    ? categoriesWithProducts.filter((cat) =>
        cat.name.toLowerCase().includes(categorySearchTerm.trim().toLowerCase())
      )
    : categoriesWithProducts

  const selectedCategoryName =
    selectedCategory === null
      ? "All Products"
      : categories.find((cat) => cat.id === selectedCategory)?.name ?? "Category"

  const handleCategorySelect = (categoryId: number | null) => {
    handleCategoryChange(categoryId)
    setShowCategoryPanel(false)
  }

  const renderCategoryPicker = (onSelect: (categoryId: number | null) => void) => (
    <>
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          value={categorySearchTerm}
          onChange={(e) => setCategorySearchTerm(e.target.value)}
          placeholder="Search categories..."
          className="h-9 border-gray-200 bg-white pl-9 pr-8 text-sm focus-visible:ring-red-500"
        />
        {categorySearchTerm && (
          <button
            type="button"
            onClick={() => setCategorySearchTerm("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Clear category search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="max-h-[240px] space-y-1 overflow-y-auto pr-1 sm:max-h-[280px] lg:max-h-[380px]">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
            selectedCategory === null
              ? "bg-red-50 font-bold text-red-600"
              : "text-gray-700 hover:bg-gray-100 hover:text-red-600"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span className="font-bold text-red-500">&raquo;</span> All Products
          </span>
          <span className="text-xs font-normal text-gray-400">({items.length})</span>
        </button>
        {filteredCategories.length === 0 ? (
          <p className="px-2.5 py-3 text-center text-xs text-gray-500">
            No categories match &ldquo;{categorySearchTerm}&rdquo;
          </p>
        ) : (
          filteredCategories.map((cat) => {
            const count = items.filter((i) => i.category_id === cat.id).length
            const isSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelect(cat.id)}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                  isSelected
                    ? "bg-red-50 font-bold text-red-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-red-600"
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span className="font-bold text-red-500">&raquo;</span> {cat.name}
                </span>
                <span className="shrink-0 text-xs font-normal text-gray-400">({count})</span>
              </button>
            )
          })
        )}
      </div>
    </>
  )

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

  const catalogPriceBounds = useMemo((): [number, number] => {
    let min = Infinity
    let max = 0

    for (const item of sortedBaseItems) {
      const validVariants = item.variants?.filter((v: any) => 
        selectedCurrency === 'AED' ? v.available_aed : v.available_inr
      ) || []
      
      for (const v of validVariants) {
        const originalPrice = selectedCurrency === 'AED' ? (v.price_aed || 0) : (v.price_inr || 0)
        const discountPrice = selectedCurrency === 'AED' ? (v.discount_aed || 0) : (v.discount_inr || 0)
        const hasDiscount = originalPrice > 0 && discountPrice > 0 && discountPrice < originalPrice && ((originalPrice - discountPrice) / originalPrice) >= 0.01
        const price = hasDiscount ? discountPrice : originalPrice
        if (price > 0) {
          min = Math.min(min, price)
          max = Math.max(max, price)
        }
      }
    }

    if (min === Infinity) {
      return selectedCurrency === "AED" ? [0, 500] : [0, 50000]
    }

    const padding = Math.max((max - min) * 0.05, selectedCurrency === "AED" ? 5 : 100)
    return [Math.max(0, Math.floor(min - padding)), Math.ceil(max + padding)]
  }, [sortedBaseItems, selectedCurrency])

  const catalogMin = catalogPriceBounds[0]
  const catalogMax = catalogPriceBounds[1]
  const isPriceFilterActive = Boolean(activeFilters.priceRange)

  useEffect(() => {
    setSidebarPriceRange((prev) =>
      prev[0] === catalogMin && prev[1] === catalogMax ? prev : [catalogMin, catalogMax]
    )
  }, [catalogMin, catalogMax])

  useEffect(() => {
    setActiveFilters((prev: Record<string, unknown>) => {
      if (!prev.priceRange) return prev
      const { priceRange, ...rest } = prev
      return rest
    })
  }, [selectedCategory, selectedCurrency])

  const handleApplyPriceFilter = () => {
    const [min, max] = sidebarPriceRange
    const [catalogMin, catalogMax] = catalogPriceBounds

    if (min <= catalogMin && max >= catalogMax) {
      setActiveFilters((prev: Record<string, unknown>) => {
        const { priceRange, ...rest } = prev
        return rest
      })
      return
    }

    setActiveFilters((prev: Record<string, unknown>) => ({
      ...prev,
      priceRange: sidebarPriceRange,
    }))
    setShowPriceFilter(false)
  }

  const handleResetPriceFilter = () => {
    setSidebarPriceRange([catalogMin, catalogMax])
    setActiveFilters((prev: Record<string, unknown>) => {
      const { priceRange, ...rest } = prev
      return rest
    })
    setShowPriceFilter(false)
  }

  // Reset pagination to page 1 when filters or sorting change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, activeFilters, searchSortBy, searchParams])

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, filteredItems.length)
  const paginatedItems = filteredItems.slice(startIndex, endIndex)
  const isProductListLoading = loading || categoryTransition || isSearchLoading

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
    {showTopPicks && lightningDeals.length > 0 && !isSearchActive && (
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
            
            {/* Left Sidebar (Hidden on mobile so products render first; sticky on desktop) */}
            <div className="hidden lg:block lg:col-span-1 space-y-6 lg:sticky lg:top-24 self-start">
              {/* CATEGORIES Section */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200 flex items-center justify-between">
                  <span>Categories</span>
                  <span className="h-0.5 w-6 bg-red-600"></span>
                </h2>

                {renderCategoryPicker(handleCategoryChange)}
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
                                ? formatPriceWithSmallDecimals(v.price_aed, v.price_inr, "AED", true, "#dc2626")
                                : `₹ ${item.price}`}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Right Main Grid Area */}
            <div className="lg:col-span-3">
              {/* Header Bar with Count and Sort Dropdown (Matching Zytheme Screenshot 1) */}
              <div
                id="product-catalog-grid"
                className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="border-b border-gray-100 px-4 py-3">
                  <div className="text-sm font-semibold text-gray-800">
                    {isProductListLoading ? (
                      <div className="flex items-center gap-2 font-medium text-red-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading products...</span>
                      </div>
                    ) : (
                      <p className="leading-snug">
                        Showing{" "}
                        <span className="font-bold text-red-600">
                          {filteredItems.length > 0 ? startIndex + 1 : 0}–{endIndex}
                        </span>{" "}
                        of <span className="font-bold">{filteredItems.length}</span> products
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 p-3">
                  <div className="grid grid-cols-3 gap-2 lg:flex lg:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCategoryPanel((open) => !open)
                        setShowPriceFilter(false)
                      }}
                      className={`h-10 justify-center gap-1.5 rounded-lg border-gray-200 bg-gray-50 px-2 text-xs font-semibold text-gray-800 hover:bg-gray-100 lg:hidden ${
                        showCategoryPanel || selectedCategory !== null
                          ? "border-red-300 bg-red-50 text-red-700"
                          : ""
                      }`}
                    >
                      <Grid3X3 className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Category</span>
                    </Button>

                    <div className="relative min-w-0">
                      <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 hidden h-3.5 w-3.5 -translate-y-1/2 text-gray-400 sm:block" />
                      <select
                        value={searchSortBy}
                        onChange={(e) => handleSortChange(e.target.value)}
                        aria-label="Sort products"
                        className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 pl-3 pr-8 text-xs font-semibold text-gray-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 sm:min-w-[170px] sm:pl-9"
                      >
                        <option value="relevance">Default</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="newest">Newest First</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPriceFilter((open) => !open)
                        setShowCategoryPanel(false)
                      }}
                      className={`h-10 justify-center gap-1.5 rounded-lg border-gray-200 bg-gray-50 text-xs font-semibold text-gray-800 hover:bg-gray-100 ${
                        isPriceFilterActive || showPriceFilter
                          ? "border-red-300 bg-red-50 text-red-700"
                          : ""
                      }`}
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      Price
                      {isPriceFilterActive && (
                        <span className="ml-0.5 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          On
                        </span>
                      )}
                    </Button>
                  </div>

                  {selectedCategory !== null && (
                    <p className="truncate text-xs font-medium text-red-600 lg:hidden">
                      {selectedCategoryName}
                    </p>
                  )}
                </div>

                {showCategoryPanel && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 lg:hidden">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Browse categories
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowCategoryPanel(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-800"
                        aria-label="Close categories"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {renderCategoryPicker(handleCategorySelect)}
                  </div>
                )}

                {showPriceFilter && (
                  <div className="space-y-4 border-t border-gray-100 bg-gray-50 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Price range
                      </p>
                      <p className="text-xs font-bold text-gray-800">
                        {formatSidebarPrice(sidebarPriceRange[0], selectedCurrency)} –{" "}
                        {formatSidebarPrice(sidebarPriceRange[1], selectedCurrency)}
                      </p>
                    </div>

                    {catalogMin < catalogMax ? (
                      <div className="px-1 py-2">
                        <Slider
                          min={catalogMin}
                          max={catalogMax}
                          step={selectedCurrency === "AED" ? 5 : 100}
                          value={sidebarPriceRange}
                          onValueChange={(value) => setSidebarPriceRange([value[0], value[1]])}
                          className="w-full"
                        />
                        <div className="mt-2 flex justify-between text-[10px] font-medium text-gray-400">
                          <span>{formatSidebarPrice(catalogMin, selectedCurrency)}</span>
                          <span>{formatSidebarPrice(catalogMax, selectedCurrency)}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">Not enough price data to filter.</p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={handleApplyPriceFilter}
                        className="h-9 flex-1 rounded-lg bg-red-600 text-xs font-bold uppercase tracking-wide text-white hover:bg-red-700"
                      >
                        Apply
                      </Button>
                      {isPriceFilterActive && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleResetPriceFilter}
                          className="h-9 shrink-0 rounded-lg border-gray-300 px-4 text-xs font-semibold text-gray-600"
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Grid (2-Column on Mobile like real-world e-commerce apps) */}
              {isProductListLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-white p-3 sm:p-4 rounded-xl border border-gray-200 h-64 sm:h-72 flex flex-col justify-between">
                      <div className="bg-gray-200 h-36 rounded-lg w-full"></div>
                      <div className="space-y-2 mt-3">
                        <div className="bg-gray-200 h-3 rounded w-1/3 mx-auto"></div>
                        <div className="bg-gray-200 h-4 rounded w-3/4 mx-auto"></div>
                        <div className="bg-gray-200 h-4 rounded w-1/2 mx-auto"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-6">
                  {paginatedItems.map((item) => {
                    const validVariants = item.variants?.filter((v: any) => 
                      selectedCurrency === 'AED' ? v.available_aed : v.available_inr
                    ) || []
                    
                    let defaultVariant = item.variants?.find((v: any) => 
                      selectedCurrency === 'AED' ? v.available_aed : v.available_inr
                    ) || item.variants?.[0]

                    if (activeFilters.priceRange && Array.isArray(activeFilters.priceRange)) {
                      const [minPrice, maxPrice] = activeFilters.priceRange
                      const matchingVariant = validVariants.find((v: any) => {
                        const price = selectedCurrency === 'AED' 
                          ? (v.discount_aed && v.discount_aed > 0 ? v.discount_aed : v.price_aed || 0)
                          : (v.discount_inr && v.discount_inr > 0 ? v.discount_inr : v.price_inr || 0)
                        return price >= minPrice && price <= maxPrice
                      })
                      if (matchingVariant) {
                        defaultVariant = matchingVariant
                      }
                    }

                    const currentVariant = selectedVariants[item.id] || defaultVariant
                    const stockQty = currentVariant?.stock_quantity ?? item.stock_quantity ?? 0

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col cursor-pointer"
                        onClick={() => router.push(`/product/${item.id}`)}
                      >
                        {/* Image Container (Responsive Height for 2-column mobile grid) */}
                        <div className="relative bg-stone-100 p-3 sm:p-6 flex items-center justify-center h-36 sm:h-52 group-hover:bg-stone-200/60 transition-colors">
                          <Image
                            src={currentVariant?.image_url || item.image_urls?.[0] || item.image_url || "/placeholder.svg"}
                            alt={item.name}
                            width={200}
                            height={200}
                            className="object-contain h-28 sm:h-44 w-full group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Wishlist Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleWishlist(item)
                            }}
                            className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${
                              isInWishlist(item.id) ? "bg-red-50 text-red-600" : "bg-white text-gray-400 hover:text-red-600"
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isInWishlist(item.id) ? "fill-current" : ""}`} />
                          </button>
                        </div>

                        {/* Card Content (Brand, Title, Price, Add to Cart) */}
                        <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between text-center">
                          <div>
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 truncate">
                              {item.brand || item.category_name || "Spare Parts"}
                            </p>
                            <h3 className="font-bold text-gray-900 text-xs sm:text-sm uppercase line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] group-hover:text-red-600 transition-colors">
                              {item.name}
                            </h3>
                            
                            {/* Variant Dropdown Selector */}
                            {item.variants && item.variants.length > 1 && (
                              <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                <select
                                  value={currentVariant?.id || ""}
                                  onChange={(e) => {
                                    const selectedId = Number(e.target.value)
                                    const found = item.variants.find((v: any) => v.id === selectedId)
                                    if (found) {
                                      setSelectedVariants(prev => ({
                                        ...prev,
                                        [item.id]: found
                                      }))
                                    }
                                  }}
                                  className="w-full text-[11px] font-semibold border border-gray-200 rounded-lg p-1 bg-white focus:outline-none focus:ring-1 focus:ring-red-500 text-gray-700"
                                >
                                  {item.variants.map((v: any) => {
                                    const isAvail = selectedCurrency === 'AED' ? v.available_aed : v.available_inr;
                                    const displayName = getVariantDisplayName(v);
                                    const price = selectedCurrency === 'AED' ? v.price_aed : v.price_inr;
                                    const priceStr = price != null ? (selectedCurrency === 'AED' ? `AED ${price.toFixed(2)}` : `₹${price.toFixed(2)}`) : 'N/A';
                                    return (
                                      <option key={v.id} value={v.id} disabled={!isAvail || v.stock_quantity <= 0}>
                                        {displayName} - {priceStr} {(!isAvail || v.stock_quantity <= 0) ? " (Out of stock)" : ""}
                                      </option>
                                    );
                                  })}
                                </select>
                              </div>
                            )}
                          </div>

                          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
                              <span className="text-sm sm:text-base font-extrabold text-red-600">
                                {currentVariant
                                  ? formatPriceWithSmallDecimals(
                                      currentVariant.price_aed,
                                      currentVariant.price_inr,
                                      "AED",
                                      true,
                                      "#dc2626"
                                    )
                                  : `₹ ${item.price}`}
                              </span>
                            </div>

                            {stockQty > 0 ? (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAddToCart(item, currentVariant)
                                }}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider py-1.5 sm:py-2 rounded-lg transition-colors flex items-center justify-center gap-1 sm:gap-2"
                              >
                                <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                Add To Cart
                              </Button>
                            ) : (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleWhatsAppProductRequest(e, {
                                    productName: item.name,
                                    productId: item.id,
                                    sku: currentVariant?.sku || item.sku,
                                    brand: item.brand || item.category_name,
                                    priceText: currentVariant
                                      ? `AED ${currentVariant.price_aed || ''} / ₹ ${currentVariant.price_inr || ''}`
                                      : `₹ ${item.price}`,
                                    productUrl: typeof window !== 'undefined' ? `${window.location.origin}/product/${item.id}` : undefined
                                  })
                                }}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider py-1.5 sm:py-2 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
                              >
                                <MessageCircle className="w-3.5 h-3.5 fill-white shrink-0" />
                                Request Stock
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Interactive Pagination Bar */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="text-xs text-gray-500 font-medium">
                    Page <span className="font-bold text-gray-900">{currentPage}</span> of{" "}
                    <span className="font-bold text-gray-900">{totalPages}</span> ({filteredItems.length} items total)
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                        const el = document.getElementById("product-catalog-grid")
                        if (el) el.scrollIntoView({ behavior: "smooth" })
                      }}
                      className="text-xs font-semibold px-3 py-1.5 h-8 border-gray-300"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          return (
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1
                          )
                        })
                        .map((page, index, array) => {
                          const showEllipsis = index > 0 && page - array[index - 1] > 1
                          return (
                            <div key={page} className="flex items-center">
                              {showEllipsis && (
                                <span className="px-1.5 text-xs text-gray-400">...</span>
                              )}
                              <Button
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  setCurrentPage(page)
                                  const el = document.getElementById("product-catalog-grid")
                                  if (el) el.scrollIntoView({ behavior: "smooth" })
                                }}
                                className={`w-8 h-8 p-0 text-xs font-bold ${
                                  currentPage === page
                                    ? "bg-red-600 hover:bg-red-700 text-white"
                                    : "text-gray-700 hover:bg-gray-50 border-gray-300"
                                }`}
                              >
                                {page}
                              </Button>
                            </div>
                          )
                        })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                        const el = document.getElementById("product-catalog-grid")
                        if (el) el.scrollIntoView({ behavior: "smooth" })
                      }}
                      className="text-xs font-semibold px-3 py-1.5 h-8 border-gray-300"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* No items state */}
              {filteredItems.length === 0 && !isProductListLoading && (
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