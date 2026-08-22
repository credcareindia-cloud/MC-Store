"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"

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

const DEFAULT_BANNERS: EcommerceBanner[] = [
  {
    id: 1,
    device_id: 1,
    category: "ecommerce_banner",
    name: "Modern Car Infotainment Systems",
    notes: "Upgrade Your Ride. Smarter. Sharper. Connected.",
    website: "/products",
    is_active: true,
    sort_order: 1,
    metadata: {
      subtitle: "Premium automotive electronics & accessories",
      ctaText: "Shop Now",
      imageUrl: "/vehicle-spare-parts.jpg",
    },
  },
  {
    id: 2,
    device_id: 1,
    category: "ecommerce_banner",
    name: "See Better. Drive Better",
    notes: "Premium headlamps designed for improved visibility and modern styling.",
    website: "/products",
    is_active: true,
    sort_order: 2,
    metadata: {
      subtitle: "Lighting upgrades for every drive",
      ctaText: "Shop Head Lamps",
      imageUrl: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?q=80&w=2000&auto=format&fit=crop",
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
        .map((img: { url?: string; imageUrl?: string; src?: string } | string) => {
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
      imageUrls = ["/vehicle-spare-parts.jpg"]
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

function MobileCarouselSkeleton() {
  return (
    <div className="px-4 pt-3 pb-4 md:hidden">
      <div className="aspect-[2.15/1] w-full animate-pulse rounded-2xl bg-zinc-200" />
      <div className="mt-3 flex justify-center gap-1.5">
        <div className="h-1.5 w-6 rounded-full bg-zinc-200" />
        <div className="h-1.5 w-1.5 rounded-full bg-zinc-200" />
        <div className="h-1.5 w-1.5 rounded-full bg-zinc-200" />
      </div>
    </div>
  )
}

function DesktopCarouselSkeleton() {
  return (
    <div className="hidden h-[calc(100dvh-var(--landing-header-height,5.75rem))] min-h-[480px] max-h-[920px] items-center justify-center bg-zinc-950 md:flex">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
    </div>
  )
}

function CarouselDots({
  slides,
  currentIndex,
  onSelect,
  variant = "mobile",
}: {
  slides: CarouselSlide[]
  currentIndex: number
  onSelect: (index: number) => void
  variant?: "mobile" | "desktop"
}) {
  if (slides.length <= 1) return null

  const isMobile = variant === "mobile"

  return (
    <div
      className={
        isMobile
          ? "mt-3 flex items-center justify-center gap-1.5"
          : "absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 md:bottom-8"
      }
    >
      {slides.map((slide, idx) => (
        <button
          key={slide.slideId}
          type="button"
          onClick={() => onSelect(idx)}
          aria-label={`Go to slide ${idx + 1}`}
          className={`rounded-full transition-all duration-300 ${
            isMobile
              ? `h-1.5 ${idx === currentIndex ? "w-5 bg-zinc-800" : "w-1.5 bg-zinc-300"}`
              : `h-1.5 ${idx === currentIndex ? "w-8 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"}`
          }`}
        />
      ))}
    </div>
  )
}

export default function EcommerceHeroCarousel() {
  const [banners, setBanners] = useState<EcommerceBanner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const touchStartX = useRef<number | null>(null)

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

  useEffect(() => {
    if (slides.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX
    if (diff > 40) nextSlide()
    else if (diff < -40) prevSlide()
    touchStartX.current = null
  }

  if (loading) {
    return (
      <>
        <MobileCarouselSkeleton />
        <DesktopCarouselSkeleton />
      </>
    )
  }

  if (slides.length === 0) return null

  const activeSlide = slides[currentIndex]
  const meta = activeSlide.metadata || {}

  return (
    <>
      {/* Mobile: app-style promo card carousel */}
      <section className="bg-white px-4 pt-3 pb-1 md:hidden">
        <div
          className="overflow-hidden rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.06]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {slides.map((slide, index) => {
              const slideMeta = slide.metadata || {}
              return (
                <article
                  key={slide.slideId}
                  className="relative aspect-[2.15/1] w-full shrink-0 overflow-hidden bg-zinc-100"
                >
                  <Image
                    src={slide.imageUrl}
                    alt={slide.name || "Promo banner"}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 0px"
                    className="object-cover object-center"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3.5">
                    <h2 className="line-clamp-2 flex-1 text-sm font-bold leading-tight text-white">
                      {slide.name}
                    </h2>
                    <Link
                      href={slide.website || "/products"}
                      className="shrink-0"
                    >
                      <span className="inline-flex items-center justify-center rounded-full bg-red-600 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-red-500 active:bg-red-700">
                        {slideMeta.ctaText || "Shop Now"}
                      </span>
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <CarouselDots
          slides={slides}
          currentIndex={currentIndex}
          onSelect={setCurrentIndex}
          variant="mobile"
        />
      </section>

      {/* Desktop: full-height hero */}
      <section
        className="relative hidden w-full overflow-hidden bg-zinc-950 md:block md:h-[calc(100dvh-var(--landing-header-height,5.75rem))] md:min-h-[480px] md:max-h-[920px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.slideId}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.imageUrl}
              alt={slide.name || "Hero banner"}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-[center_35%] lg:object-center"
            />
          </div>
        ))}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

        <div className="relative z-10 flex h-full flex-col justify-center">
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
            <div className="max-w-2xl space-y-4 md:space-y-6">
              {meta.subtitle && (
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-200/90 md:text-sm">
                  {meta.subtitle}
                </p>
              )}

              <h1 className="text-4xl font-semibold uppercase leading-[1.06] tracking-tight text-white md:text-5xl lg:text-[4.25rem]">
                {activeSlide.name}
              </h1>

              {activeSlide.notes && (
                <p className="max-w-xl text-base leading-relaxed text-white/90 md:text-lg">
                  {activeSlide.notes}
                </p>
              )}

              <div className="pt-2">
                <Link href={activeSlide.website || "/products"}>
                  <span className="inline-flex items-center justify-center rounded-full border border-amber-400/90 bg-black/20 px-8 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm transition-all hover:border-amber-300 hover:bg-amber-400/10">
                    {meta.ctaText || "Shop Now"}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <CarouselDots
          slides={slides}
          currentIndex={currentIndex}
          onSelect={setCurrentIndex}
          variant="desktop"
        />
      </section>
    </>
  )
}
