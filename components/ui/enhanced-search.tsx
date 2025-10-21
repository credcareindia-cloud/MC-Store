"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Loader2, TrendingUp, Clock, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useShop } from "@/lib/contexts/shop-context"
import { useCurrency } from "@/lib/contexts/currency-context"

interface SearchResult {
  id: number
  name: string
  brand?: string
  image_urls?: string[]
  price_aed?: number
  price_inr?: number
  discount_aed?: number
  discount_inr?: number
  category_name?: string
  relevance_score?: number
  search_matches?: Array<{ field: string; snippet: string }>
  display_price?: {
    price: string
    original_price?: string
    symbol: string
    currency: string
  }
  has_discount?: boolean
}

interface EnhancedSearchProps {
  placeholder?: string
  onSearchSubmit?: (query: string) => void
  className?: string
}

export default function EnhancedSearch({ 
  placeholder, 
  onSearchSubmit,
  className = ""
}: EnhancedSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined)
  
  const router = useRouter()
  const { shop } = useShop()
  const { selectedCurrency, formatPrice, getCurrencySymbol } = useCurrency()

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`recent-searches-${shop}`)
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5))
      }
    }
  }, [shop])

  // Re-trigger search when currency changes
  useEffect(() => {
    if (searchTerm.length >= 2 && showDropdown) {
      // Clear previous debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      
      // Re-search with new currency
      debounceRef.current = setTimeout(() => {
        performSearch(searchTerm)
      }, 100)
    }
  }, [selectedCurrency, searchTerm, showDropdown])

  // Handle search with debouncing
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setIsTyping(true)
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Show dropdown if value length >= 2
    if (value.length >= 2) {
      setShowDropdown(true)
      
      // Debounce search API call
      debounceRef.current = setTimeout(() => {
        performSearch(value)
        setIsTyping(false)
      }, 150)
    } else {
      setShowDropdown(value.length > 0)
      setSearchResults([])
      setIsTyping(false)
    }
  }

  // Perform actual search
  const performSearch = async (query: string) => {
    if (!query.trim() || query.length < 2) return

    setIsSearching(true)
    try {
      const searchUrl = new URL('/api/products/search', window.location.origin)
      searchUrl.searchParams.set('q', query.trim())
      searchUrl.searchParams.set('shop', shop)
      searchUrl.searchParams.set('currency', selectedCurrency)
      searchUrl.searchParams.set('limit', '8') // Limit dropdown results
      searchUrl.searchParams.set('sort', 'relevance')

      const response = await fetch(searchUrl.toString())
      const data = await response.json()
      
      setSearchResults(data.items || [])
      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
      setSuggestions([])
    } finally {
      setIsSearching(false)
    }
  }

  // Handle search result click
  const handleResultClick = (productId: number) => {
    setShowDropdown(false)
    setSearchTerm("")
    router.push(`/product/${productId}`)
  }

  // Handle search submit
  const handleSubmit = (query?: string) => {
    const finalQuery = query || searchTerm
    if (!finalQuery.trim()) return

    // Save to recent searches
    const updated = [finalQuery, ...recentSearches.filter(s => s !== finalQuery)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem(`recent-searches-${shop}`, JSON.stringify(updated))

    setShowDropdown(false)
    
    if (onSearchSubmit) {
      onSearchSubmit(finalQuery)
    } else {
      router.push(`/products?search=${encodeURIComponent(finalQuery)}`)
    }
  }

  // Handle recent search click
  const handleRecentClick = (query: string) => {
    setSearchTerm(query)
    handleSubmit(query)
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion)
    handleSubmit(suggestion)
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm("")
    setSearchResults([])
    setSuggestions([])
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      inputRef.current?.blur()
    }
  }

  const defaultPlaceholder = shop === "A" 
    ? "Search beauty products..." 
    : "Search style accessories..."

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
        
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder || defaultPlaceholder}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
          className="w-full pl-12 pr-16 h-12 rounded-full bg-white border-0 text-base shadow-lg focus:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-blue-500/20 focus:outline-none placeholder:text-gray-400"
        />
        
        {/* Loading or Clear Button */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              </motion.div>
            ) : searchTerm.length > 0 ? (
              <motion.div
                key="clear"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Search Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-hidden"
          >
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border-b border-gray-100">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    {/* <Sparkles className="w-4 h-4 text-blue-500" /> */}
                    <span className="text-sm font-medium text-gray-700">
                      Found {searchResults.length} result{searchResults.length > 1 ? 's' : ''} in Shop {shop === "A" ? "Beauty" : "Style"}
                    </span>
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleResultClick(product.id)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors duration-200"
                    >
                      <div className="relative">
                        <Image
                          src={product.image_urls?.[0] || "/placeholder.svg"}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover"
                        />
                        {product.relevance_score && product.relevance_score > 80 && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                        {product.brand && (
                          <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                        )}
                        <div className="flex items-center gap-2">
                          {product.display_price ? (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <span className="text-blue-600 flex items-center">
                                  {getCurrencySymbol(selectedCurrency, 'text-blue-600')}
                                </span>
                                <span className="text-sm font-semibold text-blue-600">
                                  {(() => {
                                    const priceStr = String(product.display_price.price);
                                    return priceStr.includes('.') ? priceStr : `${priceStr}.00`;
                                  })()}
                                </span>
                              </div>
                              {product.has_discount && product.display_price.original_price && (
                                <>
                                  <span className="text-xs text-gray-400 line-through flex items-center gap-1">
                                    <span className="text-gray-400 flex items-center">
                                      {getCurrencySymbol(selectedCurrency, 'text-gray-400')}
                                    </span>
                                    {(() => {
                                      const originalPriceStr = String(product.display_price.original_price);
                                      return originalPriceStr.includes('.') ? originalPriceStr : `${originalPriceStr}.00`;
                                    })()}
                                  </span>
                                  <span className="text-xs text-green-600 font-medium">
                                    {product.display_price.original_price && Math.round(((parseFloat(product.display_price.original_price) - parseFloat(product.display_price.price)) / parseFloat(product.display_price.original_price)) * 100)}% OFF
                                  </span>
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="text-blue-600 flex items-center">
                                {getCurrencySymbol(selectedCurrency, 'text-blue-600')}
                              </span>
                              <span className="text-sm font-semibold text-blue-600">
                                {(() => {
                                  const rawPrice = selectedCurrency === 'AED' 
                                    ? (product.discount_aed || product.price_aed || 0)
                                    : (product.discount_inr || product.price_inr || 0);
                                  const priceStr = String(rawPrice);
                                  return priceStr.includes('.') ? priceStr : `${priceStr}.00`;
                                })()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {searchResults.length >= 8 && (
                  <div className="p-3 bg-gray-50 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      onClick={() => handleSubmit()}
                      className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      View all results for "{searchTerm}"
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && searchResults.length === 0 && searchTerm.length >= 2 && (
              <div className="border-b border-gray-100">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600">Suggestions</span>
                  </div>
                </div>
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-b-0"
                  >
                    {suggestion}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && searchTerm.length < 2 && (
              <div>
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600">Recent Searches</span>
                  </div>
                </div>
                {recentSearches.map((search, index) => (
                  <motion.div
                    key={search}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleRecentClick(search)}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-b-0"
                  >
                    {search}
                  </motion.div>
                ))}
              </div>
            )}

            {/* No Results */}
            {searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
              <div className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <p className="font-medium text-gray-900 mb-1">No products found</p>
                <p className="text-sm text-gray-500">
                  Try different keywords or browse our categories
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
