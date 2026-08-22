"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ShieldCheck, Car, Zap, CheckCircle2 } from "lucide-react"

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
      <section id="about" className="bg-zinc-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid animate-pulse grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="h-10 w-3/4 rounded bg-zinc-200" />
              <div className="h-6 w-1/2 rounded bg-zinc-200" />
              <div className="h-24 rounded bg-zinc-200" />
            </div>
            <div className="h-[450px] rounded-3xl bg-zinc-200" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="about" className="border-t border-zinc-100 bg-zinc-50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-6 lg:space-y-8">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-400">
              About MotoCart
            </p>

            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl md:text-5xl">
                {content.title}
              </h2>
              {content.subtitle && (
                <p className="mt-3 text-lg font-medium text-zinc-500 sm:text-xl">
                  {content.subtitle}
                </p>
              )}
            </div>

            <div className="space-y-4 text-base leading-relaxed text-zinc-600 sm:text-lg">
              {content.description.split("\n\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
                <ShieldCheck className="h-5 w-5 shrink-0 text-zinc-700" />
                <span className="text-sm font-medium text-zinc-700">Quality Tested Parts</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
                <Zap className="h-5 w-5 shrink-0 text-zinc-700" />
                <span className="text-sm font-medium text-zinc-700">Affordable Pricing</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
                <Car className="h-5 w-5 shrink-0 text-zinc-700" />
                <span className="text-sm font-medium text-zinc-700">Multi-Brand Fit</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-zinc-700" />
                <span className="text-sm font-medium text-zinc-700">Fast Shipping</span>
              </div>
            </div>

            {content.button_text && content.button_link && (
              <div className="pt-2">
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-zinc-300 px-8 text-sm font-medium uppercase tracking-[0.18em] text-zinc-800 hover:bg-white"
                >
                  <a href={content.button_link}>{content.button_text}</a>
                </Button>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="group relative h-[420px] overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm sm:h-[520px] lg:h-[600px]">
              <Image
                src={content.image_url || "/vehicle-spare-parts.jpg"}
                alt={content.title}
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
