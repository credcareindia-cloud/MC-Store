"use client"

import { useState, useEffect } from "react"
import { useCurrency } from "@/lib/contexts/currency-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { SlidersHorizontal, X, ChevronDown, Filter, ArrowUpDown, Sparkles, TrendingUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"

interface SearchFiltersProps {
  isSearchActive: boolean
  searchQuery: string
  totalResults: number
  sortBy: string
  onSortChange: (sort: string) => void
  onClearSearch: () => void
  onFilterChange?: (filters: any) => void
  products?: any[] 
}

export default function SearchFilters({
  isSearchActive,
  searchQuery,
  totalResults,
  sortBy,
  onSortChange,
  onClearSearch,
  onFilterChange,
  products = []
}: SearchFiltersProps) {
  const { selectedCurrency, getCurrencySymbol } = useCurrency()
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<{
    priceRange: number[] | null,
    brand: string | null,
    category: string | null,
    discount: boolean,
    discount_10_20: boolean,
    discount_20_30: boolean,
    discount_30_40: boolean,
    discount_40_plus: boolean,
    featured: boolean,
    new_arrivals: boolean
  }>({
    priceRange: null,
    brand: null,
    category: null,
    discount: false,
    discount_10_20: false,
    discount_20_30: false,
    discount_30_40: false,
    discount_40_plus: false,
    featured: false,
    new_arrivals: false
  })
  
  // Calculate dynamic price range from actual products
  const calculatePriceRange = () => {
    if (!products || products.length === 0) {
      return selectedCurrency === 'AED' ? [0, 500] : [0, 20000]
    }

    let minPrice = Infinity
    let maxPrice = 0

    products.forEach(product => {
      const availableVariant = product.variants?.find((v: any) => 
        selectedCurrency === 'AED' ? v.available_aed : v.available_inr
      ) || product.variants?.[0]

      if (availableVariant) {
        const currentPrice = selectedCurrency === 'AED' 
          ? (availableVariant.discount_aed && availableVariant.discount_aed > 0 
              ? availableVariant.discount_aed 
              : availableVariant.price_aed || 0)
          : (availableVariant.discount_inr && availableVariant.discount_inr > 0 
              ? availableVariant.discount_inr 
              : availableVariant.price_inr || 0)

        if (currentPrice > 0) {
          minPrice = Math.min(minPrice, currentPrice)
          maxPrice = Math.max(maxPrice, currentPrice)
        }
      }
    })

    // If no valid prices found, use defaults
    if (minPrice === Infinity) {
      return selectedCurrency === 'AED' ? [0, 500] : [0, 20000]
    }

    // Add some padding to the range and round to nice numbers
    const padding = (maxPrice - minPrice) * 0.1
    const roundedMin = Math.max(0, Math.floor((minPrice - padding) / (selectedCurrency === 'AED' ? 5 : 100)) * (selectedCurrency === 'AED' ? 5 : 100))
    const roundedMax = Math.ceil((maxPrice + padding) / (selectedCurrency === 'AED' ? 5 : 100)) * (selectedCurrency === 'AED' ? 5 : 100)

    return [roundedMin, roundedMax]
  }

  const [minPrice, maxPrice] = calculatePriceRange()
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice])
  const [tempPriceRange, setTempPriceRange] = useState([minPrice, maxPrice])

  // Update price range when products change
  useEffect(() => {
    const [newMin, newMax] = calculatePriceRange()
    setPriceRange([newMin, newMax])
    setTempPriceRange([newMin, newMax])
  }, [products])

  // Handle currency changes separately to avoid dependency issues
  useEffect(() => {
    const [newMin, newMax] = calculatePriceRange()
    
    // Always clear ALL filters when currency changes to avoid any conflicts
    const clearedFilters = {
      priceRange: null,
      brand: null,
      category: null,
      discount: false,
      discount_10_20: false,
      discount_20_30: false,
      discount_30_40: false,
      discount_40_plus: false,
      featured: false,
      new_arrivals: false
    }
    
    // Update all states
    setActiveFilters(clearedFilters)
    onFilterChange?.(clearedFilters)
    
    // Reset slider to full range
    setPriceRange([newMin, newMax])
    setTempPriceRange([newMin, newMax])
    
    console.log('Currency changed to:', selectedCurrency, 'New range:', [newMin, newMax])
  }, [selectedCurrency])

  // Dynamic sort options based on currency
  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant', icon: '🎯' },
    { 
      value: 'price_low', 
      label: selectedCurrency === 'AED' ? 'Price: Low to High (AED)' : 'Price: Low to High (₹)', 
      icon: '💰' 
    },
    { 
      value: 'price_high', 
      label: selectedCurrency === 'AED' ? 'Price: High to Low (AED)' : 'Price: High to Low (₹)', 
      icon: '💸' 
    },
    { value: 'discount', label: 'Highest Discount', icon: '🏷️' },
    { value: 'name', label: 'Name A-Z', icon: '🔤' },
    { value: 'newest', label: 'Newest First', icon: '🆕' }
  ]

  // Non-price filter options (price range will be handled by slider)
  const filterOptions = [
    { value: 'discount', label: 'On Sale', icon: '🏷️' },
    { value: 'discount_10_20', label: '10-20% Off', icon: '🔥' },
    { value: 'discount_20_30', label: '20-30% Off', icon: '💥' },
    { value: 'discount_30_40', label: '30-40% Off', icon: '⚡' },
    { value: 'discount_40_plus', label: '40%+ Off', icon: '🎯' },
    { value: 'featured', label: 'Featured Products', icon: '⭐' },
    { value: 'new_arrivals', label: 'New Arrivals', icon: '🆕' }
  ]

  const currentSort = sortOptions.find(option => option.value === sortBy) || sortOptions[0]
  
  // Calculate active filter count including price range
  const isPriceRangeActive = priceRange[0] > 0 || priceRange[1] < maxPrice
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length + (isPriceRangeActive ? 1 : 0)

  const handleFilterChange = (filterType: string, value: any) => {
    const newFilters = { ...activeFilters, [filterType]: value }
    setActiveFilters(newFilters)
    onFilterChange?.({ ...newFilters, priceRange: isPriceRangeActive ? priceRange : null })
  }

  const handlePriceRangeChange = (newRange: number[]) => {
    setTempPriceRange(newRange)
  }

  const applyPriceRange = () => {
    setPriceRange(tempPriceRange)
    onFilterChange?.({ ...activeFilters, priceRange: tempPriceRange })
  }

  const resetPriceRange = () => {
    const defaultRange = [minPrice, maxPrice]
    setPriceRange(defaultRange)
    setTempPriceRange(defaultRange)
    onFilterChange?.({ ...activeFilters, priceRange: null })
  }

  if (!isSearchActive) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Search Results Header */}
        <div className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className="flex items-center gap-2"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div 
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <span className="text-sm text-gray-600">
                {totalResults} result{totalResults !== 1 ? 's' : ''} for
              </span>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 font-medium relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-purple-100/50"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <span className="relative">
                  "{searchQuery}"
                </span>
              </Badge>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={onClearSearch}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 hover:bg-red-50 px-2 rounded-full transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex items-center gap-3">
            {/* Filter Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="hidden md:flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 shadow-sm transition-all duration-200 relative rounded-lg px-4 py-2.5"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Filters</span>
                  {activeFilterCount > 0 && (
                    <Badge className="ml-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                      {activeFilterCount}
                    </Badge>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 bg-white border-2 border-gray-100 shadow-xl rounded-xl p-2 backdrop-blur-sm">
                <DropdownMenuLabel className="text-sm text-gray-700 font-semibold px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-2">
                  🔍 Filter Results
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Price Range Slider */}
                <div className="px-3 py-4 border-b border-gray-100 mb-2">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">💰 Price Range</span>
                    {isPriceRangeActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetPriceRange}
                        className="h-6 px-2 text-xs text-gray-500 hover:text-red-600"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="px-2 py-4">
                      {/* Custom visible slider track */}
                      <div className="relative">
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-blue-500 rounded-full absolute"
                            style={{
                              left: `${((tempPriceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                              width: `${((tempPriceRange[1] - tempPriceRange[0]) / (maxPrice - minPrice)) * 100}%`
                            }}
                          />
                        </div>
                        <Slider
                          value={tempPriceRange}
                          onValueChange={handlePriceRangeChange}
                          max={maxPrice}
                          min={minPrice}
                          step={selectedCurrency === 'AED' ? 5 : 100}
                          className="absolute inset-0 w-full opacity-0"
                        />
                        {/* Custom thumb indicators */}
                        <div 
                          className="absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg -mt-1 transform -translate-x-2"
                          style={{
                            left: `${((tempPriceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                            top: '0px'
                          }}
                        />
                        <div 
                          className="absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg -mt-1 transform -translate-x-2"
                          style={{
                            left: `${((tempPriceRange[1] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                            top: '0px'
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm font-medium">
                      <div className="bg-blue-50 px-2 py-1 rounded text-blue-700 flex items-center gap-1">
                        {getCurrencySymbol(selectedCurrency)} {tempPriceRange[0].toLocaleString()}
                      </div>
                      <div className="text-gray-400">to</div>
                      <div className="bg-blue-50 px-2 py-1 rounded text-blue-700 flex items-center gap-1">
                        {getCurrencySymbol(selectedCurrency)} {tempPriceRange[1].toLocaleString()}
                      </div>
                    </div>
                    {(tempPriceRange[0] !== priceRange[0] || tempPriceRange[1] !== priceRange[1]) && (
                      <Button
                        onClick={applyPriceRange}
                        size="sm"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-1.5"
                      >
                        Apply Range
                      </Button>
                    )}
                  </div>
                </div>
                
                {filterOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleFilterChange(option.value, !activeFilters[option.value as keyof typeof activeFilters])}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <span>{option.icon}</span>
                        <span className="text-sm">{option.label}</span>
                      </div>
                      {activeFilters[option.value as keyof typeof activeFilters] && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
                {activeFilterCount > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        // Reset all filters including price range slider
                        const defaultRange = [minPrice, maxPrice]
                        setPriceRange(defaultRange)
                        setTempPriceRange(defaultRange)
                        setActiveFilters({ 
                          priceRange: null, 
                          brand: null, 
                          category: null, 
                          discount: false, 
                          discount_10_20: false, 
                          discount_20_30: false, 
                          discount_30_40: false, 
                          discount_40_plus: false, 
                          featured: false, 
                          new_arrivals: false 
                        })
                        onFilterChange?.({ 
                          priceRange: null, 
                          brand: null, 
                          category: null, 
                          discount: false, 
                          discount_10_20: false, 
                          discount_20_30: false, 
                          discount_30_40: false, 
                          discount_40_plus: false, 
                          featured: false, 
                          new_arrivals: false 
                        })
                      }}
                      className="cursor-pointer text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear All Filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="hidden md:flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 shadow-sm transition-all duration-200 rounded-lg px-4 py-2.5"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  <span className="text-sm">{currentSort.label}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border-2 border-gray-100 shadow-xl rounded-xl p-2 backdrop-blur-sm">
                <DropdownMenuLabel className="text-sm text-gray-700 font-semibold px-3 py-2 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg mb-2">
                  📊 Sort Results
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => onSortChange(option.value)}
                    className={`cursor-pointer rounded-lg mx-1 my-0.5 px-3 py-2.5 transition-all duration-200 ${
                      sortBy === option.value 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md transform scale-[0.98]' 
                        : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <span>{option.icon}</span>
                        <span className="text-sm">{option.label}</span>
                      </div>
                      {sortBy === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Filter Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="md:hidden flex items-center gap-0.5 bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 shadow-sm transition-all duration-200 relative rounded-md px-1.5 py-1"
                >
                  <Filter className="w-3 h-3" />
                  <span className="text-xs">Filter</span>
                  {activeFilterCount > 0 && (
                    <Badge className="ml-0.5 bg-blue-500 text-white text-xs px-1 py-0.5 rounded-full min-w-[16px] h-[16px] flex items-center justify-center">
                      {activeFilterCount}
                    </Badge>
                  )}
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[14rem] w-56 max-h-[40vh] overflow-y-auto bg-white border-2 border-gray-100 shadow-xl rounded-xl p-2 backdrop-blur-sm z-[9999]">
                <DropdownMenuLabel className="text-sm text-gray-700 font-semibold px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-2">
                  🔍 Filter Results
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Price Range Slider for Mobile */}
                <div className="px-3 py-4 border-b border-gray-100 mb-2">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">💰 Price Range</span>
                    {isPriceRangeActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetPriceRange}
                        className="h-6 px-2 text-xs text-gray-500 hover:text-red-600"
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="px-2 py-4">
                      {/* Custom visible slider track */}
                      <div className="relative">
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-blue-500 rounded-full absolute"
                            style={{
                              left: `${((tempPriceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                              width: `${((tempPriceRange[1] - tempPriceRange[0]) / (maxPrice - minPrice)) * 100}%`
                            }}
                          />
                        </div>
                        <Slider
                          value={tempPriceRange}
                          onValueChange={handlePriceRangeChange}
                          max={maxPrice}
                          min={minPrice}
                          step={selectedCurrency === 'AED' ? 5 : 100}
                          className="absolute inset-0 w-full opacity-0"
                        />
                        {/* Custom thumb indicators */}
                        <div 
                          className="absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg -mt-1 transform -translate-x-2"
                          style={{
                            left: `${((tempPriceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                            top: '0px'
                          }}
                        />
                        <div 
                          className="absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg -mt-1 transform -translate-x-2"
                          style={{
                            left: `${((tempPriceRange[1] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                            top: '0px'
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm font-medium">
                      <div className="bg-blue-50 px-2 py-1 rounded text-blue-700 flex items-center gap-1">
                        {getCurrencySymbol(selectedCurrency)} {tempPriceRange[0].toLocaleString()}
                      </div>
                      <div className="text-gray-400">to</div>
                      <div className="bg-blue-50 px-2 py-1 rounded text-blue-700 flex items-center gap-1">
                        {getCurrencySymbol(selectedCurrency)} {tempPriceRange[1].toLocaleString()}
                      </div>
                    </div>
                    {(tempPriceRange[0] !== priceRange[0] || tempPriceRange[1] !== priceRange[1]) && (
                      <Button
                        onClick={applyPriceRange}
                        size="sm"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-1.5"
                      >
                        Apply Range
                      </Button>
                    )}
                  </div>
                </div>

                {/* Filter Options for Mobile */}
                {filterOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleFilterChange(option.value, !activeFilters[option.value as keyof typeof activeFilters])}
                    className={`cursor-pointer rounded-lg mx-1 my-0.5 px-3 py-2.5 transition-all duration-200 ${
                      activeFilters[option.value as keyof typeof activeFilters]
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transform scale-[0.98]' 
                        : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <span>{option.icon}</span>
                        <span className="text-sm">{option.label}</span>
                      </div>
                      {activeFilters[option.value as keyof typeof activeFilters] && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
                {activeFilterCount > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        // Reset all filters including price range slider
                        const defaultRange = [minPrice, maxPrice]
                        setPriceRange(defaultRange)
                        setTempPriceRange(defaultRange)
                        setActiveFilters({ 
                          priceRange: null, 
                          brand: null, 
                          category: null, 
                          discount: false, 
                          discount_10_20: false, 
                          discount_20_30: false, 
                          discount_30_40: false, 
                          discount_40_plus: false, 
                          featured: false, 
                          new_arrivals: false 
                        })
                        onFilterChange?.({ 
                          priceRange: null, 
                          brand: null, 
                          category: null, 
                          discount: false, 
                          discount_10_20: false, 
                          discount_20_30: false, 
                          discount_30_40: false, 
                          discount_40_plus: false, 
                          featured: false, 
                          new_arrivals: false 
                        })
                      }}
                      className="cursor-pointer text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear All Filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="md:hidden flex items-center gap-0.5 bg-white border border-gray-200 hover:border-orange-400 hover:bg-orange-50 shadow-sm transition-all duration-200 rounded-md px-1.5 py-1"
                >
                  <ArrowUpDown className="w-3 h-3" />
                  <span className="text-xs">Sort</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[12rem] w-48 max-h-[40vh] overflow-y-auto bg-white border-2 border-gray-100 shadow-xl rounded-xl p-2 backdrop-blur-sm z-[9999]">
                <DropdownMenuLabel className="text-sm text-gray-700 font-semibold px-3 py-2 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg mb-2">
                  📊 Sort Results
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => onSortChange(option.value)}
                    className={`cursor-pointer rounded-lg mx-1 my-0.5 px-3 py-2.5 transition-all duration-200 ${
                      sortBy === option.value 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md transform scale-[0.98]' 
                        : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <span>{option.icon}</span>
                        <span className="text-sm">{option.label}</span>
                      </div>
                      {sortBy === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>


      </div>
    </motion.div>
  )
}