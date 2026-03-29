"use client"

import type React from "react"
import { Suspense } from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { Search, ShoppingCart, Heart, Menu, X, User, LogOut, Settings, Package, Users, BarChart3, Calendar, MessageSquare, Star, ChevronDown, Zap, Crown, Gift, ShoppingBag, Bell } from "lucide-react"
import EnhancedSearch from "@/components/ui/enhanced-search"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSelector } from "react-redux"
import { useSettings } from "@/lib/contexts/settings-context"
import { useLoginModal } from '@/lib/stores/useLoginModal'
import { useAuth } from "@/lib/contexts/auth-context"
import { useCurrency } from "@/lib/contexts/currency-context"
import type { RootState } from "@/lib/store"
import Image from "next/image"
import Banner from "@/components/ui/banner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useShop } from "@/lib/contexts/shop-context"
import LoginModal from "@/components/auth/login-modal"
import { useUser } from "@clerk/nextjs"
import { NavbarSkeleton } from "@/components/ui/navbar-skeleton"

const baseNavigation = [
  { name: "All Products", href: "/products" },
]

interface Category {
  id: string | number
  name: string
  slug?: string
  shop?: "A" | "B" | "Both"
  is_special?: boolean
}

function Nav() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { isOpen: isLoginModalOpen, openModal, closeModal } = useLoginModal()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  const [autoScrollInterval, setAutoScrollInterval] = useState<NodeJS.Timeout | null>(null)
  const [isAutoScrolling, setIsAutoScrolling] = useState(false)

  const pathname = usePathname()
  const router = useRouter()
  const cartItems = useSelector((state: RootState) => state.order.cart)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const { settings } = useSettings()
  const { user, logout, isAuthenticated } = useAuth()
  const { shop } = useShop()
  const { user: clerkUser } = useUser()
  const { selectedCurrency } = useCurrency()
  const searchParams = useSearchParams()
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items)
  const wishlistCount = wishlistItems.length

  const currentPage = pathname === "/" ? "home" : pathname.split("/")[1] || "home"

  const handleSearch = async (term: string) => {
    setSearchTerm(term)
    
    // Clear previous debounce timer
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
    }
    
    if (term.trim().length === 0) {
      setShowSearchDropdown(false)
      setSearchResults([])
      setSearchSuggestions([])
      if (pathname === "/products") {
        const params = new URLSearchParams(searchParams.toString())
        params.delete('search')
        router.push(`/products?${params.toString()}`)
      }
      return
    }

    if (term.trim().length < 2) {
      setShowSearchDropdown(false)
      return
    }

    setIsSearching(true)
    setShowSearchDropdown(true)

    // Debounce search requests
    const timer = setTimeout(async () => {
      try {
        const searchUrl = new URL('/api/products/search', window.location.origin)
        searchUrl.searchParams.set('q', term.trim())
        searchUrl.searchParams.set('currency', selectedCurrency)
        searchUrl.searchParams.set('limit', '8') // Show 8 results in dropdown

        const response = await fetch(searchUrl.toString())
        const searchData = await response.json()
        
        setSearchResults(searchData.items || [])
        setSearchSuggestions(searchData.suggestions || [])
        
        // Update URL for products page
        if (pathname === "/products" || pathname === "/") {
          const params = new URLSearchParams(searchParams.toString())
          params.set('search', term)
          if (pathname === "/") {
            router.push(`/products?${params.toString()}`)
          } else {
            router.push(`/products?${params.toString()}`)
          }
        }
      } catch (error) {
        console.error('Search failed:', error)
        setSearchResults([])
        setSearchSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, 300) // 300ms debounce

    setSearchDebounceTimer(timer)
  }

  const handleSearchResultClick = (productId: number) => {
    setShowSearchDropdown(false)
    setSearchTerm("")
    router.push(`/product/${productId}`)
  }

  const handleViewAllResults = () => {
    setShowSearchDropdown(false)
    const params = new URLSearchParams()
    params.set('search', searchTerm)
    router.push(`/products?${params.toString()}`)
  }

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.querySelector('.search-container')
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setShowSearchDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        const categoriesResponse = await fetch('/api/categories')
        const categoriesData = await categoriesResponse.json()
        
        const productsResponse = await fetch('/api/admin/products')
        const productsData = await productsResponse.json()
        
      const shopFilteredCategories = categoriesData
      const shopFilteredProducts = productsData
        
        const productCounts = shopFilteredProducts.reduce((acc: any, product: any) => {
          const categoryId = product.category_id?.toString()
          if (categoryId) {
            acc[categoryId] = (acc[categoryId] || 0) + 1
          }
          return acc
        }, {})
        
        const categoriesWithProducts = shopFilteredCategories.filter((category: Category) => {
          const categoryId = category.id?.toString()
          return productCounts[categoryId] && productCounts[categoryId] > 0
        })
        
        setCategories(categoriesWithProducts)
        setProducts(shopFilteredProducts)
      } catch (error) {
        console.error('Error fetching data:', error)
        setCategories([
          { id: 1, name: "Parts", slug: "parts" },
          { id: 2, name: "Accessories", slug: "accessories" },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const navigation = [
    ...baseNavigation,
    ...categories.map(category => ({
      name: category.name,
      href: `/products?category=${category.slug || category.id}`,
      categoryId: category.id,
      isCategory: true
    }))
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const updateBannerHeight = () => {
      const bannerContainer = document.querySelector("[data-banner-container]")
      if (bannerContainer) {
        const height = (bannerContainer as HTMLElement).offsetHeight
        document.documentElement.style.setProperty("--banner-height", `${height}px`)
      } else {
        document.documentElement.style.setProperty("--banner-height", "0px")
      }
    }
    updateBannerHeight()
    const observer = new MutationObserver(updateBannerHeight)
    const bannerContainer = document.querySelector("[data-banner-container]")
    if (bannerContainer) {
      observer.observe(bannerContainer, {
        childList: true,
        subtree: true,
        attributes: true,
      })
    }
    return () => observer.disconnect()
  }, [])

  const handleLogout = async () => {
    await logout()
  }

  const startAutoScroll = () => {
    if (categories.length <= 5) return
    
    const navContainer = document.querySelector('.categories-scroll-container')
    if (!navContainer) return
    
    // Start from the beginning
    navContainer.scrollLeft = 0
    
    setIsAutoScrolling(true)
    const interval = setInterval(() => {
      const maxScroll = navContainer.scrollWidth - navContainer.clientWidth
      const currentScroll = navContainer.scrollLeft
      
      if (currentScroll >= maxScroll - 10) { // Small buffer to ensure we reach the end
        // Smooth scroll back to beginning
        navContainer.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        // Scroll by one category width approximately
        const categoryWidth = 120 // Approximate width of each category button
        navContainer.scrollTo({ 
          left: currentScroll + categoryWidth, 
          behavior: 'smooth' 
        })
      }
    }, 2500) // Scroll every 2.5 seconds
    
    setAutoScrollInterval(interval)
  }

  // Start auto-scroll when categories load and are more than 5
  useEffect(() => {
    if (categories.length > 5 && !loading && !isAutoScrolling) {
      setTimeout(() => startAutoScroll(), 2000) // Start after 2 seconds
    }
  }, [categories.length, loading])

  // Cleanup auto-scroll on unmount
  useEffect(() => {
    return () => {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval)
      }
    }
  }, [autoScrollInterval])

  const handleNavClick = async (item: (typeof navigation)[0], e: React.MouseEvent) => {
    if (item.name === "Logout") {
      e.preventDefault()
      await handleLogout()
      return
    }

    if (item.name === "All Products") {
      window.location.href = "/products"
      return
    }

    if ((item as any).isCategory) {
      return
    }

    if ((item as any).scroll && pathname === "/") {
      e.preventDefault()
      const targetId = item.href.split("#")[1]
      const element = document.getElementById(targetId)
      if (element) {
        const navbarHeight = 80
        const bannerHeight = Number.parseInt(
          getComputedStyle(document.documentElement).getPropertyValue("--banner-height") || "0",
        )
        const offset = navbarHeight + bannerHeight
        const elementPosition = element.offsetTop - offset
        window.scrollTo({
          top: elementPosition,
          behavior: "smooth",
        })
      }
      setIsOpen(false)
    }
  }

  const handleLoginClick = () => {
    openModal()
  }

  const isActiveCategoryLink = (item: any) => {
    if (item.name === "All Products") {
      if (pathname === "/products") {
        const categoryParam = searchParams.get('category')
        return !categoryParam
      }
      return false
    }

    if (item.isCategory) {
      if (pathname === "/products") {
        const categoryParam = searchParams.get('category')
        const itemCategoryParam = item.href.split('category=')[1] || ''
        return categoryParam === itemCategoryParam
      }
      return false
    }

    return pathname === item.href
  }

  return (
    <>
      <div data-banner-container>
        <Banner page={currentPage} />
      </div>
      <nav
        className={`sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950 transition-all duration-300 ${isScrolled ? "shadow-md shadow-black/20" : ""}`}
        style={{ top: "var(--banner-height, 0px)" }}
      >
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <div className="max-w-7xl mx-auto px-6 py-4 lg:py-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-8">
                {/* Logo */}
                <Link href="/" className="nav-logo-link flex items-center group shrink-0" aria-label={settings.restaurant_name}>
                  {settings.restaurant_logo ? (
                    <div className="relative w-72 h-20 sm:w-80 sm:h-20 overflow-visible rounded-lg">
                      <div className="nav-logo-3d h-full w-full">
                        <div className="nav-logo-exhaust" aria-hidden>
                          <span className="nav-logo-smoke nav-logo-smoke--haze" />
                          <span className="nav-logo-smoke nav-logo-smoke--billow" />
                          <span className="nav-logo-smoke nav-logo-smoke--wisp-1" />
                          <span className="nav-logo-smoke nav-logo-smoke--wisp-2" />
                          <span className="nav-logo-smoke nav-logo-smoke--core" />
                        </div>
                        <span className="nav-logo-streak nav-logo-streak--1" aria-hidden />
                        <span className="nav-logo-streak nav-logo-streak--2" aria-hidden />
                        <div className="relative z-[1] h-full w-full overflow-hidden rounded-lg">
                          <Image
                            src={settings.restaurant_logo || "/placeholder.svg"}
                            alt=""
                            fill
                            className="object-cover object-left"
                            sizes="(min-width: 640px) 320px, 288px"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-72 h-20 sm:w-80 sm:h-20 bg-zinc-800 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:bg-zinc-700">
                      <ShoppingBag className="w-10 h-10 sm:w-11 sm:h-11 text-zinc-100" />
                    </div>
                  )}
                </Link>

                {/* Enhanced Search Bar */}
                <EnhancedSearch 
                  className="flex-1 max-w-2xl"
                  placeholder="Search parts, brands, accessories..."
                />
              </div>

              {/* Right side buttons */}
              <div className="flex items-center gap-4">
                <Link href="/orders">
                  <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full p-3">
                    <ShoppingBag className="w-6 h-6" />
                  </Button>
                </Link>

                <Link href="/wishlist" className="relative group">
                  <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full p-3">
                    <Heart className={`w-6 h-6 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-zinc-100 text-zinc-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold border border-zinc-300">
                        {wishlistCount}
                      </span>
                    )}
                  </Button>
                </Link>

                <Link href="/order" className="relative group">
                  <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full p-3">
                    <ShoppingCart className="w-6 h-6" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-zinc-100 text-zinc-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold border border-zinc-300">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </Link>

                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full p-3">
                        {user?.isClerkUser ? (
                          clerkUser?.imageUrl ? (
                            <Image
                              src={clerkUser.imageUrl}
                              alt="Profile"
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          ) : (
                            <User className="w-6 h-6" />
                          )
                        ) : (
                          <User className="w-6 h-6" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 p-0 border-0 shadow-2xl">
                      <div className="bg-zinc-900 rounded-t-lg p-6 border-b border-zinc-800">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            {user?.isClerkUser && clerkUser?.imageUrl ? (
                              <Image
                                src={clerkUser.imageUrl}
                                alt="Profile"
                                width={48}
                                height={48}
                                className="rounded-full"
                              />
                            ) : (
                              <User className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg">{user?.name || "User"}</h3>
                            <p className="text-white/80 text-sm">{user?.email}</p>
                            {user?.isClerkUser && (
                              <p className="text-white/60 text-xs">Google Account</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-b-lg">
                        <div className="p-2">
                          <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-3 hover:bg-gray-50 transition-colors">
                            <Link href="/dashboard" className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
                                <User className="w-4 h-4 text-zinc-700" />
                              </div>
                              <span className="font-medium text-gray-700">My Profile</span>
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-3 hover:bg-gray-50 transition-colors">
                            <Link href="/orders" className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
                                <ShoppingBag className="w-4 h-4 text-zinc-700" />
                              </div>
                              <span className="font-medium text-gray-700">My Orders</span>
                            </Link>
                          </DropdownMenuItem>

                        </div>

                        <div className="border-t border-gray-100 p-2">
                          <DropdownMenuItem
                            onClick={handleLogout}
                            className="cursor-pointer rounded-lg p-3 hover:bg-red-50 transition-colors text-red-600 hover:text-red-700"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                <LogOut className="w-4 h-4 text-red-600" />
                              </div>
                              <span className="font-medium">Logout</span>
                            </div>
                          </DropdownMenuItem>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full p-3">
                        <User className="w-6 h-6" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-0 border-0 shadow-2xl">
                      <div className="bg-zinc-900 rounded-t-lg p-6 border-b border-zinc-800">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mx-auto mb-3">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-white font-semibold text-lg">Welcome!</h3>
                          <p className="text-white/80 text-sm">Sign in to access your account</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-b-lg p-4">
                        <Button
                          onClick={handleLoginClick}
                          className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-3 rounded-lg transition-colors"
                        >
                          Sign In / Login
                        </Button>
                        <p className="text-center text-xs text-gray-500 mt-3">
                          New customer? Create an account to get started
                        </p>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Desktop Navigation with Icon Toggle */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                {loading ? (
                  <div className="flex gap-4">
                    <div className="animate-pulse bg-white/20 rounded-full px-6 py-2 h-10 w-16 flex-shrink-0"></div>
                    <div className="animate-pulse bg-white/20 rounded-full px-6 py-2 h-10 w-20 flex-shrink-0"></div>
                    <div className="animate-pulse bg-white/20 rounded-full px-6 py-2 h-10 w-24 flex-shrink-0"></div>
                  </div>
                ) : (
                  <>
                    {/* All Products - Always visible and constant with hover dropdown */}
                    <div className="relative group">
                      <Link
                        key="all-products"
                        href="/products"
                        onClick={(e) => handleNavClick(baseNavigation[0], e)}
                        className={`hidden lg:flex items-center rounded-full px-6 py-2 font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                          pathname === '/products' && !searchParams.get('category')
                            ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
                            : "text-white hover:bg-white/20"
                        }`}
                      >
                        All Products
                        <span className="ml-1 text-xs opacity-70">▼</span>
                      </Link>
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 shadow-xl rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="p-3">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                            Categories
                          </div>
                          {categories.length > 0 ? (
                            <div className="space-y-1 max-h-80 overflow-y-auto">
                              {categories.map((category) => (
                                <Link
                                  key={category.id}
                                  href={`/products?category=${category.slug || category.id}`}
                                  className={`block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors ${
                                    category.is_special 
                                      ? "border-l-2 border-zinc-400 hover:bg-zinc-50" 
                                      : ""
                                  }`}
                                  onClick={(e) => {
                                    const item = {
                                      name: category.name,
                                      href: `/products?category=${category.slug || category.id}`,
                                      categoryId: category.id,
                                      isCategory: true
                                    }
                                    handleNavClick(item, e)
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{category.name}</span>
                                    {category.is_special && (
                                      <span className="text-xs text-zinc-500">★</span>
                                    )}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="px-3 py-4 text-sm text-gray-400 text-center">
                              No categories available
                            </div>
                          )}
                          <div className="border-t border-gray-100 mt-3 pt-3">
                            <Link
                              href="/products"
                              className="block px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                              onClick={(e) => handleNavClick(baseNavigation[0], e)}
                            >
                              View All Products
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scrolling Categories Container */}
                    <div 
                      className={`hidden lg:flex items-center space-x-2 categories-scroll-container ${
                        categories.length > 5 
                          ? 'overflow-x-auto scrollbar-hide' 
                          : ''
                      }`}
                      style={{
                        maxWidth: categories.length > 5 ? '1100px' : 'auto',
                        scrollBehavior: 'smooth',
                        WebkitOverflowScrolling: 'touch'
                      }}
                      onMouseEnter={() => {
                        if (categories.length > 5 && autoScrollInterval) {
                          clearInterval(autoScrollInterval)
                          setIsAutoScrolling(false)
                        }
                      }}
                      onMouseLeave={() => {
                        if (categories.length > 5) {
                          setTimeout(() => startAutoScroll(), 1000) // Delay restart
                        }
                      }}
                    >
                      {/* Category links only */}
                      {categories.map(category => {
                        const item = {
                          name: category.name,
                          href: `/products?category=${category.slug || category.id}`,
                          categoryId: category.id,
                          isCategory: true
                        }
                        return (
                          <Link
                            key={category.id}
                            href={item.href}
                            onClick={(e) => handleNavClick(item, e)}
                            className={`rounded-full px-6 py-2 font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 relative ${
                              isActiveCategoryLink(item)
                                ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
                                : "text-white hover:bg-white/20"
                            } ${
                              category.is_special 
                                ? "border-2 border-zinc-300 shadow-sm" 
                                : ""
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {category.name}
                              {category.is_special && (
                                <span className={`inline-flex items-center justify-center w-5 h-5 text-xs rounded-full font-bold ${
                                  shop === "A" 
                                    ? "bg-zinc-900 text-white"
                                    : "bg-zinc-600 text-white"
                                }`}>
                                  ✨
                                </span>
                              )}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Tablet Header */}
        <div className="hidden md:block lg:hidden">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <Link href="/" className="nav-logo-link flex items-center group shrink-0" aria-label={settings.restaurant_name}>
                {settings.restaurant_logo ? (
                  <div className="relative w-56 h-16 overflow-visible rounded-lg">
                    <div className="nav-logo-3d h-full w-full">
                      <div className="nav-logo-exhaust" aria-hidden>
                        <span className="nav-logo-smoke nav-logo-smoke--haze" />
                        <span className="nav-logo-smoke nav-logo-smoke--billow" />
                        <span className="nav-logo-smoke nav-logo-smoke--wisp-1" />
                        <span className="nav-logo-smoke nav-logo-smoke--wisp-2" />
                        <span className="nav-logo-smoke nav-logo-smoke--core" />
                      </div>
                      <span className="nav-logo-streak nav-logo-streak--1" aria-hidden />
                      <span className="nav-logo-streak nav-logo-streak--2" aria-hidden />
                      <div className="relative z-[1] h-full w-full overflow-hidden rounded-lg">
                        <Image
                          src={settings.restaurant_logo || "/placeholder.svg"}
                          alt=""
                          fill
                          className="object-cover object-left"
                          sizes="224px"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-56 h-16 bg-white/20 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105">
                    <ShoppingBag className="w-9 h-9 text-white" />
                  </div>
                )}
              </Link>
              <div className="flex items-center gap-3">
                <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full p-2">
                  <Bell className="w-5 h-5" />
                </Button>

                <Link href="/wishlist" className="relative">
                  <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full p-2">
                    <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {wishlistCount}
                      </span>
                    )}
                  </Button>
                </Link>

                {/* Cart and Profile icons - visible on tablet */}
                <Link href="/order" className="relative">
                  <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full p-2">
                    <ShoppingBag className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </Link>

                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full p-2">
                        {user?.isClerkUser && clerkUser?.imageUrl ? (
                          <Image
                            src={clerkUser.imageUrl}
                            alt="Profile"
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-0 border-0 shadow-2xl">
                      <div className="bg-zinc-900 rounded-t-lg p-4 border-b border-zinc-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            {user?.isClerkUser && clerkUser?.imageUrl ? (
                              <Image
                                src={clerkUser.imageUrl}
                                alt="Profile"
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            ) : (
                              <User className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold">{user?.name || "User"}</h3>
                            <p className="text-white/80 text-sm">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-b-lg p-2 space-y-1">
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                            <User className="w-4 h-4 text-zinc-300" />
                            <span className="text-gray-700">Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer">
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    onClick={handleLoginClick}
                    variant="ghost"
                    className="text-white hover:bg-white/20 rounded-full p-2"
                  >
                    <User className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>

            <div className="relative mb-3 search-container">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <Input
                placeholder="Search parts, brands, accessories..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-12 h-10 rounded-full bg-white border-0 text-sm shadow-lg"
                onFocus={() => searchTerm.length >= 2 && setShowSearchDropdown(true)}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                </div>
              )}
              
              {/* Search Dropdown for Tablet */}
              {showSearchDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border z-50 max-h-80 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <>
                      <div className="px-3 py-2 bg-gray-50 border-b text-xs font-medium text-gray-600">
                        {searchResults.length} result{searchResults.length > 1 ? 's' : ''}
                      </div>
                      {searchResults.map((product: any) => (
                        <div
                          key={product.id}
                          onClick={() => handleSearchResultClick(product.id)}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        >
                          <Image
                            src={product.image_urls?.[0] || "/placeholder.svg"}
                            alt={product.name}
                            width={35}
                            height={35}
                            className="rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm line-clamp-1">{product.name}</p>
                            {product.display_price ? (
                              <p className="text-zinc-700 font-semibold text-xs">
                                {product.display_price.symbol} {product.display_price.price}
                              </p>
                            ) : (
                              <p className="text-gray-500 text-xs">Price unavailable</p>
                            )}
                          </div>
                        </div>
                      ))}
                      <div
                        onClick={handleViewAllResults}
                        className="p-3 text-center text-zinc-800 hover:bg-zinc-50 cursor-pointer font-medium text-sm border-t border-zinc-200"
                      >
                        View all results
                      </div>
                    </>
                  ) : searchTerm.length >= 2 ? (
                    <div className="p-3 text-center text-gray-500">
                      <p className="text-sm">No products found</p>
                      {searchSuggestions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {searchSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setSearchTerm(suggestion)
                                handleSearch(suggestion)
                              }}
                              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className="flex overflow-x-auto scrollbar-hide gap-2">
              {loading ? (
                <div className="flex gap-2">
                  <div className="animate-pulse bg-white/20 rounded-full px-3 py-1 h-6 w-12"></div>
                  <div className="animate-pulse bg-white/20 rounded-full px-3 py-1 h-6 w-16"></div>
                  <div className="animate-pulse bg-white/20 rounded-full px-3 py-1 h-6 w-20"></div>
                </div>
              ) : (
                navigation.slice(0, 6).map((item) => {
                  const isSpecial = (item as any).isCategory && categories.find(cat => cat.id === (item as any).categoryId)?.is_special;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={(e) => handleNavClick(item, e)}
                      className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${isActiveCategoryLink(item) || ((item as any).scroll && pathname === "/" && item.href.includes("#"))
                        ? "bg-white text-zinc-900"
                        : "text-white hover:bg-white/20"
                        }`}
                    >
                      <span className={`flex items-center gap-1 ${
                        isSpecial 
                          ? "font-semibold text-zinc-800" 
                          : ""
                      }`}>
                        {item.name}
                        {isSpecial && (
                          <span className="text-zinc-500">★</span>
                        )}
                      </span>
                    </Link>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="block md:hidden">
          <div className="px-4 py-3">
            <div className="grid grid-cols-3 items-center gap-2 mb-3">
              <div className="flex justify-start min-w-0">
                <Button variant="ghost" onClick={() => setIsOpen(!isOpen)} className="text-white p-0 shrink-0">
                  {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </Button>
              </div>
              <div className="flex justify-center min-w-0">
                <Link href="/" className="nav-logo-link flex items-center justify-center group" aria-label={settings.restaurant_name}>
                  {settings.restaurant_logo ? (
                    <div className="relative h-14 w-[11.5rem] sm:w-52 sm:h-16 mx-auto overflow-visible rounded-md">
                      <div className="nav-logo-3d h-full w-full">
                        <div className="nav-logo-exhaust" aria-hidden>
                          <span className="nav-logo-smoke nav-logo-smoke--haze" />
                          <span className="nav-logo-smoke nav-logo-smoke--billow" />
                          <span className="nav-logo-smoke nav-logo-smoke--wisp-1" />
                          <span className="nav-logo-smoke nav-logo-smoke--wisp-2" />
                          <span className="nav-logo-smoke nav-logo-smoke--core" />
                        </div>
                        <span className="nav-logo-streak nav-logo-streak--1" aria-hidden />
                        <span className="nav-logo-streak nav-logo-streak--2" aria-hidden />
                        <div className="relative z-[1] h-full w-full overflow-hidden rounded-md">
                          <Image
                            src={settings.restaurant_logo || "/placeholder.svg"}
                            alt=""
                            fill
                            className="object-cover object-left"
                            sizes="(max-width: 768px) 184px, 208px"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-14 w-[11.5rem] sm:w-52 sm:h-16 bg-white/20 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105 mx-auto">
                      <ShoppingBag className="w-8 h-8 text-white" />
                    </div>
                  )}
                </Link>
              </div>
              <div className="flex items-center justify-end gap-2 min-w-0">
                <Link href="/wishlist" className="relative">
                  <Heart className={`w-5 h-5 text-white ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart and Profile icons are hidden on mobile - removed from here */}
              </div>
            </div>

            <div className="mb-3">
              <EnhancedSearch
                placeholder="Search parts, brands, accessories..."
                onSearchSubmit={(query) => {
                  router.push(`/products?search=${encodeURIComponent(query)}`)
                  setIsOpen(false)
                }}
                className="w-full"
              />
            </div>

            <div className="flex overflow-x-auto scrollbar-hide gap-2">
              {loading ? (
                <div className="flex gap-2">
                  <div className="animate-pulse bg-white/20 rounded-full px-3 py-1 h-6 w-12"></div>
                  <div className="animate-pulse bg-white/20 rounded-full px-3 py-1 h-6 w-16"></div>
                </div>
              ) : (
                navigation.slice(0, 6).map((item) => {
                  const isSpecial = (item as any).isCategory && categories.find(cat => cat.id === (item as any).categoryId)?.is_special;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={(e) => handleNavClick(item, e)}
                      className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${isActiveCategoryLink(item) || ((item as any).scroll && pathname === "/" && item.href.includes("#"))
                        ? "bg-white text-zinc-900"
                        : "text-white hover:bg-white/20"
                        }`}
                    >
                      <span className={`flex items-center gap-1 ${
                        isSpecial 
                          ? "font-semibold text-zinc-800" 
                          : ""
                      }`}>
                        {item.name}
                        {isSpecial && (
                          <span className="text-zinc-500">★</span>
                        )}
                      </span>
                    </Link>
                  )
                })
              )}
            </div>

            {/* Mobile Navigation Menu */}
            {isOpen && (
              <div className="mt-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl max-h-[40vh] overflow-hidden">
                {loading ? (
                  <div className="space-y-2 p-4">
                    <div className="animate-pulse bg-gray-200 rounded-lg h-10 w-full"></div>
                    <div className="animate-pulse bg-gray-200 rounded-lg h-10 w-3/4"></div>
                    <div className="animate-pulse bg-gray-200 rounded-lg h-10 w-1/2"></div>
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-[40vh]">
                    <div className="p-4 space-y-2">
                      {/* All Products - Featured */}
                      <Link
                        href="/products"
                        onClick={(e) => {
                          handleNavClick(baseNavigation[0], e)
                          setIsOpen(false)
                        }}
                        className={`block px-4 py-3 text-base font-semibold transition-colors rounded-lg border-2 ${
                          pathname === '/products' && !searchParams.get('category')
                            ? "text-zinc-900 bg-zinc-50 border-zinc-200"
                            : `text-gray-700 hover:bg-gray-50 border-gray-200`
                        }`}
                      >
                        All Products
                       </Link>

                       {/* Categories Section */}
                       {categories.length > 0 && (
                         <>
                           <div className="px-3 py-2 mt-6 text-xs font-medium text-gray-500 uppercase tracking-wider border-t border-gray-200 pt-4">
                             Categories
                           </div>
                          <div className="space-y-1 pb-4">
                            {categories.map((category) => {
                              const item = {
                                name: category.name,
                                href: `/products?category=${category.slug || category.id}`,
                                categoryId: category.id,
                                isCategory: true
                              }
                              return (
                                <Link
                                  key={category.id}
                                  href={item.href}
                                  onClick={(e) => {
                                    handleNavClick(item, e)
                                    setIsOpen(false)
                                  }}
                                  className={`block px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg relative overflow-hidden ${
                                    isActiveCategoryLink(item)
                                      ? "text-zinc-900 bg-zinc-50"
                                      : `text-gray-600 hover:bg-gray-50`
                                  } ${
                                    category.is_special 
                                      ? "border-l-4 border-zinc-400 bg-zinc-50 shadow-sm" 
                                      : ""
                                  }`}
                                >
                                  <div className="flex items-center justify-between relative z-10">
                                    <span className={category.is_special ? "font-semibold" : ""}>{category.name}</span>
                                    {category.is_special && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-zinc-300 bg-white text-zinc-700">
                                        Featured
                                      </span>
                                    )}
                                  </div>
                                </Link>
                              )
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </nav>

      <LoginModal isOpen={isLoginModalOpen} onClose={closeModal} />
    </>
  )
}

export default function Navbar() {
  return (
    <Suspense fallback={<NavbarSkeleton />}>
      <Nav />
    </Suspense>
  )
}