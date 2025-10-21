
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Zap, Heart, Cpu } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useShop } from "@/lib/contexts/shop-context"

interface Slide {
  id: number
  title: string
  subtitle: string
  image_url: string
  button_text: string
  button_link: string
  is_active: boolean
  sort_order: number
}

export default function HeroSection() {
  const { shop } = useShop()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSlides()
  }, [shop])

  const fetchSlides = async () => {
    try {
      const response = await fetch(`/api/slider?shop=${shop}`)
      if (response.ok) {
        const data = await response.json()
        setSlides(data)
      }
    } catch (error) {
      console.error("Failed to fetch slides:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (slides.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [slides.length])

  // Enhanced theming
  const theme =
    shop === "A"
      ? {
          // Cosmetics Theme
          bg: "bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100",
          overlay: "bg-gradient-to-r from-pink-900/60 via-rose-800/50 to-pink-700/60",
          title: "font-serif text-white drop-shadow-2xl",
          subtitle: "text-pink-100",
          button:
            "bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-2xl shadow-pink-500/30 border-0",
          buttonSecondary: "border-pink-200 text-pink-100 hover:bg-pink-100 hover:text-pink-900 backdrop-blur-sm",
          indicator: "bg-pink-400",
          indicatorInactive: "bg-pink-200/50",
          scroll: "border-pink-200",
          scrollDot: "bg-pink-200",
          loadingBg: "bg-gradient-to-br from-pink-100 via-rose-100 to-pink-200",
          loadingRing: "border-pink-400",
          loadingGlow: "bg-gradient-to-tr from-pink-400 via-pink-500 to-rose-500",
          icon: Heart,
          particles: "from-pink-400/20 to-rose-400/20",
        }
      : {
          // Gadgets Theme
          bg: "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800",
          overlay: "bg-gradient-to-r from-slate-900/80 via-gray-900/70 to-cyan-900/60",
          title: "font-mono text-white drop-shadow-2xl",
          subtitle: "text-cyan-100",
          button:
            "bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-2xl shadow-cyan-500/30 border-0",
          buttonSecondary: "border-cyan-400 text-cyan-100 hover:bg-cyan-400 hover:text-slate-900 backdrop-blur-sm",
          indicator: "bg-cyan-400",
          indicatorInactive: "bg-cyan-400/30",
          scroll: "border-cyan-400",
          scrollDot: "bg-cyan-400",
          loadingBg: "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800",
          loadingRing: "border-cyan-400",
          loadingGlow: "bg-gradient-to-tr from-cyan-400 via-blue-500 to-cyan-500",
          icon: Cpu,
          particles: "from-cyan-400/20 to-blue-400/20",
        }

  const IconComponent = theme.icon

  if (loading) {
    return (
      <section className={`relative h-screen overflow-hidden ${theme.loadingBg}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            <span
              className={`absolute inline-flex h-40 w-40 rounded-full ${theme.loadingGlow} opacity-80 blur-2xl animate-pulse`}
            />
            <span
              className={`absolute inline-flex h-44 w-44 rounded-full border-4 ${theme.loadingRing} opacity-60 animate-spin-slow`}
            />
            <div className={`relative z-10 rounded-full shadow-lg border-4 ${theme.loadingRing} bg-white p-6`}>
              <IconComponent className="w-12 h-12 text-gray-800" />
            </div>
          </div>
        </div>
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-gradient-to-r ${theme.particles} rounded-full animate-float`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      </section>
    )
  }

  if (slides.length === 0) {
    return (
      <section className={`relative h-screen overflow-hidden ${theme.bg}`}>
        <div className={`absolute inset-0 ${theme.overlay}`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-4xl mx-auto px-4">
            <div className="mb-8">
              <IconComponent className="w-20 h-20 mx-auto mb-6 text-white animate-pulse" />
            </div>
            <h1 className={`text-5xl md:text-7xl font-bold mb-6 ${theme.title} animate-fade-in`}>
              {shop === "A" ? "Beauty Redefined" : "Tech Innovation"}
            </h1>
            <p className={`text-xl md:text-2xl mb-8 ${theme.subtitle} animate-slide-up`}>
              {shop === "A" ? "Premium Beauty & Skincare Collection" : "Cutting-Edge Gadgets & Electronics"}
            </p>
            <Link href="/products">
              <Button
                className={`${theme.button} font-semibold px-8 py-4 text-lg rounded-full transform hover:scale-105 transition-all duration-300`}
              >
                {shop === "A" ? "Explore Beauty" : "Discover Tech"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {shop === "A" ? (
            <>
              <Sparkles className="absolute top-20 left-20 w-8 h-8 text-pink-300 animate-pulse" />
              <Heart className="absolute top-40 right-32 w-6 h-6 text-rose-300 animate-bounce" />
              <Sparkles className="absolute bottom-32 left-40 w-10 h-10 text-pink-400 animate-pulse" />
            </>
          ) : (
            <>
              <Zap className="absolute top-20 left-20 w-8 h-8 text-cyan-400 animate-pulse" />
              <Cpu className="absolute top-40 right-32 w-6 h-6 text-blue-400 animate-bounce" />
              <Zap className="absolute bottom-32 left-40 w-10 h-10 text-cyan-300 animate-pulse" />
            </>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ${
            index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        >
          <Image
            src={slide.image_url || "/placeholder.svg"}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className={`absolute inset-0 ${theme.overlay}`} />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center max-w-5xl mx-auto px-4">
          <div className="mb-8">
            <IconComponent className="w-16 h-16 mx-auto mb-6 text-white animate-pulse" />
          </div>
          <h1 className={`text-5xl md:text-8xl font-bold mb-6 ${theme.title} animate-fade-in leading-tight`}>
            {slides[currentSlide]?.title}
          </h1>
          {slides[currentSlide]?.subtitle && (
            <p className={`text-xl md:text-3xl mb-8 ${theme.subtitle} animate-slide-up font-light`}>
              {slides[currentSlide].subtitle}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-scale-in">
            {slides[currentSlide]?.button_text && slides[currentSlide]?.button_link && (
              <Link href={slides[currentSlide].button_link}>
                <Button
                  size="lg"
                  className={`${theme.button} font-semibold px-10 py-4 text-lg rounded-full transform hover:scale-105 transition-all duration-300`}
                >
                  {slides[currentSlide].button_text}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            )}
            <Button
              size="lg"
              variant="outline"
              className={`${theme.buttonSecondary} px-10 py-4 text-lg rounded-full transform hover:scale-105 transition-all duration-300`}
            >
              {shop === "A" ? "Learn More" : "View Specs"}
            </Button>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                index === currentSlide ? `${theme.indicator} scale-125` : theme.indicatorInactive
              }`}
            />
          ))}
        </div>
      )}

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 animate-bounce">
        <div className={`w-8 h-12 border-2 rounded-full flex justify-center ${theme.scroll}`}>
          <div className={`w-1 h-3 rounded-full mt-2 animate-pulse ${theme.scrollDot}`} />
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-gradient-to-r ${theme.particles} rounded-full animate-float opacity-60`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 6}s`,
            }}
          />
        ))}
      </div>
    </section>
  )
}
