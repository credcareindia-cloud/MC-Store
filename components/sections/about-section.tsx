"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Wrench, ShieldCheck, Car, Zap, CheckCircle2 } from "lucide-react"

interface AboutContent {
  id: number
  title: string
  subtitle: string
  description: string
  image_url: string
  button_text: string
  button_link: string
  is_active: boolean
}

export default function AboutSection() {
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAboutContent()
  }, [])

  const fetchAboutContent = async () => {
    try {
      const response = await fetch("/api/about")
      if (response.ok) {
        const data = await response.json()
        setAboutContent(Array.isArray(data) ? data[0] || null : data || null)
      }
    } catch (error) {
      console.error("Failed to fetch about content:", error)
    } finally {
      setLoading(false)
    }
  }

  // Default automotive spare parts content
  const defaultContent = {
    title: "Premium Vehicle Spare Parts & Accessories",
    subtitle: "Affordable Prices, Uncompromising Quality",
    description: `Welcome to MotoClub, your trusted destination for genuine vehicle spare parts and high-grade automotive components. We specialize in bringing you top-quality replacement parts, engine components, body fittings, and accessories at highly affordable prices.\n\nEvery part in our catalog is rigorously tested for durability, performance, and exact fit—ensuring your vehicle remains safe, reliable, and performing at its best on every road.`,
    image_url: "/vehicle-spare-parts.jpg",
    button_text: "Explore Spare Parts Catalog",
    button_link: "/products",
  }

  const content = aboutContent || defaultContent

  if (loading) {
    return (
      <section id="about" className="py-20 bg-zinc-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="h-10 bg-zinc-800 rounded w-3/4"></div>
              <div className="h-6 bg-zinc-800 rounded w-1/2"></div>
              <div className="h-24 bg-zinc-800 rounded"></div>
            </div>
            <div className="h-[450px] bg-zinc-800 rounded-3xl"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="about" className="py-20 lg:py-28 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white relative overflow-hidden border-y border-zinc-800/60">
      {/* Background glow & subtle patterns */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Text Content */}
          <div className="space-y-6 lg:space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-red-500">
                About MotoClub Spare Parts
              </span>
              <div className="h-0.5 w-12 bg-red-600/60 rounded-full" />
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {content.title}
              </h2>
              {content.subtitle && (
                <p className="text-lg sm:text-xl font-medium text-red-400 mt-3">
                  {content.subtitle}
                </p>
              )}
            </div>

            <div className="space-y-4 text-zinc-300 text-base sm:text-lg leading-relaxed">
              {content.description.split("\n\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-zinc-200">Quality Tested Parts</span>
              </div>
              <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl">
                <Zap className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-zinc-200">Affordable Pricing</span>
              </div>
              <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl">
                <Car className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-zinc-200">Multi-Brand Fit</span>
              </div>
              <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-zinc-200">Fast Shipping</span>
              </div>
            </div>

            {content.button_text && content.button_link && (
              <div className="pt-2">
                <Button
                  asChild
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 text-sm sm:text-base uppercase tracking-wider rounded-xl transition-all duration-300 shadow-xl shadow-red-600/20 hover:scale-[1.02]"
                >
                  <a href={content.button_link} className="flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    {content.button_text}
                  </a>
                </Button>
              </div>
            )}
          </div>

          {/* Right Image Container */}
          <div className="relative">
            <div className="relative h-[420px] sm:h-[520px] lg:h-[600px] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl group">
              <Image
                src={content.image_url || "/vehicle-spare-parts.jpg"}
                alt={content.title}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-md">
                <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Guaranteed Performance</p>
                <h4 className="text-base sm:text-lg font-extrabold text-white mt-1">High-Grade Vehicle Components & Spares</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Tested for long-lasting endurance and maximum road safety.</p>
              </div>
            </div>

            {/* Decorative Corner Accents */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-red-600/20 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-zinc-700/20 rounded-full blur-xl pointer-events-none" />
          </div>

        </div>
      </div>
    </section>
  )
}
