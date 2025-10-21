
"use client"

import { useState, useEffect } from "react"
import { Quote, Star, Heart, Zap } from "lucide-react"
import Image from "next/image"
import { useShop } from "@/lib/contexts/shop-context"

interface Testimonial {
  id: number
  customer_name: string
  customer_role: string
  customer_avatar: string
  review_text: string
  rating: number
  is_featured: boolean
  is_active: boolean
}

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const { shop } = useShop()

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/testimonials")
      if (response.ok) {
        const data = await response.json()
        const featured = data.filter((t: Testimonial) => t.is_featured)
        setTestimonials(featured.length > 0 ? featured : data.slice(0, 3))
      }
    } catch (error) {
      console.error("Failed to fetch testimonials:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (testimonials.length > 0) {
      const timer = setInterval(() => {
        setCurrent((prev) => (prev + 1) % testimonials.length)
      }, 6000)
      return () => clearInterval(timer)
    }
  }, [testimonials.length])

  // Enhanced theming
  const theme =
    shop === "A"
      ? {
          // Cosmetics Theme
          bg: "bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100",
          cardBg: "bg-white/90 backdrop-blur-xl border-pink-100",
          title: "font-serif text-gray-800",
          text: "text-gray-700",
          quote: "text-pink-500",
          star: "fill-pink-400 text-pink-400",
          indicator: "bg-pink-500",
          indicatorInactive: "bg-pink-200",
          shadow: "shadow-pink-100",
          icon: Heart,
          floatingElements: "from-pink-400/20 to-rose-400/20",
        }
      : {
          // Gadgets Theme
          bg: "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800",
          cardBg: "bg-slate-800/90 backdrop-blur-xl border-cyan-500/20",
          title: "font-mono text-cyan-100",
          text: "text-gray-300",
          quote: "text-cyan-400",
          star: "fill-cyan-400 text-cyan-400",
          indicator: "bg-cyan-500",
          indicatorInactive: "bg-cyan-500/30",
          shadow: "shadow-cyan-500/20",
          icon: Zap,
          floatingElements: "from-cyan-400/20 to-blue-400/20",
        }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-5 h-5 ${i < rating ? theme.star : "text-gray-300"}`} />
    ))
  }

  const IconComponent = theme.icon

  if (loading) {
    return (
      <section id="testimonials" className={`py-24 ${theme.bg} relative overflow-hidden`}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className={`text-5xl md:text-6xl font-bold mb-16 ${theme.title} animate-fade-in`}>
            What Our Customers Say
          </h2>
          <div className="animate-pulse">
            <div className={`${theme.cardBg} shadow-2xl rounded-3xl p-12 md:p-20 border`}>
              <div className={`h-6 ${shop === "A" ? "bg-pink-200" : "bg-slate-700"} rounded mb-6`}></div>
              <div className={`h-6 ${shop === "A" ? "bg-pink-200" : "bg-slate-700"} rounded mb-6 w-3/4 mx-auto`}></div>
              <div className={`h-6 ${shop === "A" ? "bg-pink-200" : "bg-slate-700"} rounded mb-10 w-1/2 mx-auto`}></div>
              <div
                className={`w-24 h-24 ${shop === "A" ? "bg-pink-200" : "bg-slate-700"} rounded-full mx-auto mb-6`}
              ></div>
              <div className={`h-6 ${shop === "A" ? "bg-pink-200" : "bg-slate-700"} rounded w-1/3 mx-auto`}></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) {
    return (
      <section id="testimonials" className={`py-24 ${theme.bg} relative overflow-hidden`}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className={`text-5xl md:text-6xl font-bold mb-16 ${theme.title} animate-fade-in`}>
            What Our Customers Say
          </h2>
          <div className={`${theme.cardBg} shadow-2xl rounded-3xl p-12 md:p-20 border`}>
            <p className={`${theme.text} text-xl`}>No testimonials available at the moment.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="testimonials" className={`py-24 ${theme.bg} relative overflow-hidden`}>
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 bg-gradient-to-r ${theme.floatingElements} rounded-full animate-float opacity-40`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
        <div className="mb-16 animate-fade-in">
          <div className="flex justify-center mb-6">
            <IconComponent className={`w-12 h-12 ${shop === "A" ? "text-pink-500" : "text-cyan-400"} animate-pulse`} />
          </div>
          <h2 className={`text-5xl md:text-7xl font-bold mb-6 ${theme.title} leading-tight`}>What Our Customers Say</h2>
          <p className={`text-xl md:text-2xl ${shop === "A" ? "text-rose-600" : "text-cyan-400"} font-light`}>
            {shop === "A" ? "Real stories from our beauty community" : "Testimonials from tech enthusiasts worldwide"}
          </p>
        </div>

        {testimonials.map((testimonial, i) => (
          <div
            key={testimonial.id}
            className={`transition-all duration-1000 ${
              i === current ? "opacity-100 scale-100" : "opacity-0 scale-95 h-0 overflow-hidden"
            }`}
          >
            <div
              className={`relative ${theme.cardBg} ${theme.shadow} shadow-2xl rounded-3xl p-12 md:p-20 animate-scale-in border transform hover:scale-105 transition-all duration-500`}
            >
              <Quote
                className={`absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 ${theme.quote} bg-white rounded-full p-3 shadow-xl ${shop === "B" ? "bg-slate-800" : ""}`}
              />

              <p className={`${theme.text} text-xl md:text-2xl leading-relaxed mb-8 font-light italic`}>
                "{testimonial.review_text}"
              </p>

              {/* Rating */}
              <div className="flex justify-center mb-8 gap-1">{renderStars(testimonial.rating)}</div>

              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 rounded-full overflow-hidden mb-6 shadow-xl">
                  {testimonial.customer_avatar ? (
                    <Image
                      src={testimonial.customer_avatar || "/placeholder.svg"}
                      alt={testimonial.customer_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full ${
                        shop === "A"
                          ? "bg-gradient-to-br from-pink-400 to-rose-400"
                          : "bg-gradient-to-br from-cyan-400 to-blue-400"
                      } flex items-center justify-center`}
                    >
                      <span className="text-white text-3xl font-bold">{testimonial.customer_name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <h3 className={`font-bold text-2xl mb-2 ${theme.title}`}>{testimonial.customer_name}</h3>
                {testimonial.customer_role && (
                  <span className={`${shop === "A" ? "text-gray-500" : "text-gray-400"} text-lg`}>
                    {testimonial.customer_role}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Enhanced Indicators */}
        {testimonials.length > 1 && (
          <div className="flex justify-center space-x-4 mt-12">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-4 h-4 rounded-full transition-all duration-300 transform hover:scale-125 ${
                  i === current ? `${theme.indicator} scale-125 shadow-lg` : theme.indicatorInactive
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
