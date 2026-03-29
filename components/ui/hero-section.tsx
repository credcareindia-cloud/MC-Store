"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSlides()
  }, [])

  const fetchSlides = async () => {
    try {
      const response = await fetch("/api/slider")
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
      }, 6000)
      return () => clearInterval(timer)
    }
  }, [slides.length])

  const overlay = "bg-gradient-to-b from-black/70 via-black/50 to-black/70"

  if (loading) {
    return (
      <section className="relative h-[min(85vh,720px)] overflow-hidden bg-zinc-100 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-zinc-300 border-t-zinc-900 animate-spin" aria-hidden />
        <span className="sr-only">Loading</span>
      </section>
    )
  }

  if (slides.length === 0) {
    return (
      <section className="relative h-[min(85vh,720px)] overflow-hidden bg-zinc-900">
        <div className={`absolute inset-0 ${overlay}`} />
        <div className="relative z-10 flex h-full items-center justify-center px-4">
          <div className="text-center max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white mb-4">
              Motoclub
            </h1>
            <p className="text-lg md:text-xl text-zinc-300 mb-8">
              Spare parts and riding accessories — delivered across India
            </p>
            <Link href="/products">
              <Button className="rounded-md bg-white text-zinc-900 hover:bg-zinc-200 px-8 py-6 text-base font-medium">
                Shop now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative h-[min(85vh,720px)] overflow-hidden bg-zinc-950">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100 z-0" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <Image
            src={slide.image_url || "/placeholder.svg"}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className={`absolute inset-0 ${overlay}`} />
        </div>
      ))}

      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white mb-4">
            {slides[currentSlide]?.title}
          </h1>
          {slides[currentSlide]?.subtitle && (
            <p className="text-lg md:text-xl text-zinc-300 mb-8 font-normal">
              {slides[currentSlide].subtitle}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {slides[currentSlide]?.button_text && slides[currentSlide]?.button_link && (
              <Link href={slides[currentSlide].button_link}>
                <Button className="rounded-md bg-white text-zinc-900 hover:bg-zinc-200 px-8 py-6 text-base font-medium w-full sm:w-auto">
                  {slides[currentSlide].button_text}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link href="/about">
              <Button
                variant="outline"
                className="rounded-md border-zinc-500 bg-transparent text-white hover:bg-white/10 px-8 py-6 text-base font-medium w-full sm:w-auto"
              >
                About us
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentSlide ? "w-8 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
