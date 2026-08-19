"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"

export interface EcommerceBanner {
  id: number
  device_id: number
  category: string
  name: string
  notes: string | null
  website: string | null
  is_active: boolean
  sort_order: number
  metadata: {
    images?: Array<{ url: string } | string>
    imageUrl?: string
    subtitle?: string
    badgeText?: string
    ctaText?: string
    secondaryCtaText?: string
    themeColor?: string
    bannerType?: "custom" | "product_carousel"
    selectedProductIds?: number[]
    highlights?: string[]
  }
}

export interface CarouselSlide {
  slideId: string
  bannerId: number
  name: string
  notes: string | null
  website: string | null
  imageUrl: string
  metadata: EcommerceBanner["metadata"]
}

// Fallback banners if API returns empty
const DEFAULT_BANNERS: EcommerceBanner[] = [
  {
    id: 1,
    device_id: 1,
    category: "ecommerce_banner",
    name: "Latest Tech Gadgets",
    notes: "Explore cutting-edge gadgets that upgrade your lifestyle with top performance and sleek modern aesthetics.",
    website: "/products",
    is_active: true,
    sort_order: 1,
    metadata: {
      subtitle: "Discover. Shop. Upgrade.",
      badgeText: "NEW ARRIVALS",
      ctaText: "Shop Now",
      secondaryCtaText: "Browse Collection",
      themeColor: "red",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1600&auto=format&fit=crop",
    },
  },
  {
    id: 2,
    device_id: 1,
    category: "ecommerce_banner",
    name: "Next-Gen Spatial Audio",
    notes: "Immerse yourself in crystal clear soundscapes with active noise cancellation and high-fidelity wireless audio.",
    website: "/products?category=Audio",
    is_active: true,
    sort_order: 2,
    metadata: {
      subtitle: "Pure Acoustic Precision",
      badgeText: "HOT DEAL",
      ctaText: "Explore Audio",
      secondaryCtaText: "View Specs",
      themeColor: "violet",
      imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1600&auto=format&fit=crop",
    },
  },
  {
    id: 3,
    device_id: 1,
    category: "ecommerce_banner",
    name: "Smartwatches & Fitness Trackers",
    notes: "Track every step, heart rate metric, and fitness milestone with vibrant AMOLED touch displays.",
    website: "/products?category=Wearables",
    is_active: true,
    sort_order: 3,
    metadata: {
      subtitle: "Track. Achieve. Excel.",
      badgeText: "BEST SELLER",
      ctaText: "Shop Wearables",
      secondaryCtaText: "Compare Models",
      themeColor: "blue",
      imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1600&auto=format&fit=crop",
    },
  },
  {
    id: 4,
    device_id: 1,
    category: "ecommerce_banner",
    name: "Smart Home & Accessories",
    notes: "Transform your space with intelligent wireless hubs, high-fidelity speakers, and multi-device charging docks.",
    website: "/products?category=Smart%20Home",
    is_active: true,
    sort_order: 4,
    metadata: {
      subtitle: "Smarter Living Experience",
      badgeText: "FEATURED",
      ctaText: "Upgrade Now",
      secondaryCtaText: "Learn More",
      themeColor: "emerald",
      imageUrl: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?q=80&w=1600&auto=format&fit=crop",
    },
  },
]

function extractSlidesFromBanners(banners: EcommerceBanner[]): CarouselSlide[] {
  const slides: CarouselSlide[] = []

  banners.forEach((banner, bannerIdx) => {
    const meta = banner.metadata || {}
    let imageUrls: string[] = []

    if (Array.isArray(meta.images) && meta.images.length > 0) {
      imageUrls = meta.images
        .map((img: any) => {
          if (typeof img === "string") return img
          if (img && typeof img === "object") return img.url || img.imageUrl || img.src || ""
          return ""
        })
        .filter(Boolean)
    }

    if (imageUrls.length === 0 && meta.imageUrl) {
      imageUrls = [meta.imageUrl]
    }

    if (imageUrls.length === 0) {
      imageUrls = ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1600&auto=format&fit=crop"]
    }

    imageUrls.forEach((url, imgIdx) => {
      slides.push({
        slideId: `${banner.id || bannerIdx}-${imgIdx}`,
        bannerId: banner.id,
        name: banner.name,
        notes: banner.notes,
        website: banner.website,
        imageUrl: url,
        metadata: meta,
      })
    })
  })

  return slides
}

export default function EcommerceHeroCarousel() {
  const [banners, setBanners] = useState<EcommerceBanner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const touchStartX = useRef<number | null>(null)

  // Fetch banners from master_data API
  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await fetch("/api/ecommerce-banners")
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setBanners(data)
          } else {
            setBanners(DEFAULT_BANNERS)
          }
        } else {
          setBanners(DEFAULT_BANNERS)
        }
      } catch (err) {
        console.error("Failed to load banners from master_data:", err)
        setBanners(DEFAULT_BANNERS)
      } finally {
        setLoading(false)
      }
    }
    fetchBanners()
  }, [])

  const slides = useMemo(() => extractSlidesFromBanners(banners), [banners])

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  // Automatic image sliding timer (3 seconds interval)
  useEffect(() => {
    if (slides.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [slides.length])

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX
    if (diff > 50) {
      nextSlide()
    } else if (diff < -50) {
      prevSlide()
    }
    touchStartX.current = null
  }

  if (loading) {
    return (
      <div className="w-full h-[450px] sm:h-[540px] md:h-[620px] bg-slate-900 animate-pulse flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-400">Loading...</span>
        </div>
      </div>
    )
  }

  if (slides.length === 0) {
    return null
  }

  return (
    <section className="relative w-full overflow-hidden bg-slate-950">
      {/* Full Width Sliding Images Track */}
      <div
        className="relative w-full h-[460px] sm:h-[540px] md:h-[620px] lg:h-[680px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Carousel Slide Track */}
        <div
          className="flex w-full h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => {
            const meta = slide.metadata || {}

            return (
              <div
                key={slide.slideId}
                className="relative w-full h-full flex-shrink-0 flex items-center"
              >
                {/* 1. Full-Width Background Image */}
                <Image
                  src={slide.imageUrl}
                  alt={slide.name || "E-Commerce Banner"}
                  fill
                  priority={index === 0}
                  className="object-cover object-center w-full h-full"
                />

                {/* 2. Gradient Overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/20 sm:to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30 z-10" />

                {/* 3. Text & CTA Overlay Content */}
                <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-12 md:px-16">
                  <div className="max-w-2xl space-y-4 sm:space-y-6">
                    
                    {/* Badge & Subtitle */}
                    <div className="flex flex-wrap items-center gap-3">
                      {meta.badgeText && (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg">
                          <Sparkles className="w-3.5 h-3.5" />
                          {meta.badgeText}
                        </span>
                      )}
                      {meta.subtitle && (
                        <span className="text-xs sm:text-sm font-semibold tracking-wide text-slate-300 uppercase">
                          {meta.subtitle}
                        </span>
                      )}
                    </div>

                    {/* Headline */}
                    <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] drop-shadow-md">
                      {slide.name}
                    </h1>

                    {/* Description Notes */}
                    {slide.notes && (
                      <p className="text-sm sm:text-base md:text-lg text-slate-200 line-clamp-3 font-normal max-w-xl leading-relaxed drop-shadow">
                        {slide.notes}
                      </p>
                    )}

                    {/* CTA Action Buttons */}
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <Link href={slide.website || "/products"}>
                        <button className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base shadow-xl hover:shadow-red-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                          <span>{meta.ctaText || "Shop Now"}</span>
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </Link>

                      {meta.secondaryCtaText && (
                        <Link href="/products">
                          <button className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md font-semibold text-sm sm:text-base shadow-lg transition-all">
                            {meta.secondaryCtaText}
                          </button>
                        </Link>
                      )}
                    </div>

                  </div>
                </div>

              </div>
            )
          })}
        </div>

        {/* Previous Chevron Button */}
        {slides.length > 1 && (
          <button
            onClick={prevSlide}
            aria-label="Previous Banner"
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-4 rounded-full bg-slate-950/50 hover:bg-slate-900/90 text-white border border-white/20 backdrop-blur-md transition-all opacity-80 hover:opacity-100 hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Next Chevron Button */}
        {slides.length > 1 && (
          <button
            onClick={nextSlide}
            aria-label="Next Banner"
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-4 rounded-full bg-slate-950/50 hover:bg-slate-900/90 text-white border border-white/20 backdrop-blur-md transition-all opacity-80 hover:opacity-100 hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Bottom Pagination Dots Indicator Bar */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-950/40 backdrop-blur-md border border-white/10">
            {slides.map((slide, idx) => (
              <button
                key={slide.slideId}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to banner slide ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  idx === currentIndex
                    ? "w-8 bg-red-600 shadow-md shadow-red-600/50"
                    : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
