
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Heart, Sparkles, Zap, Cpu } from "lucide-react"
import { useShop } from "@/lib/contexts/shop-context"

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
  const { shop } = useShop()

  useEffect(() => {
    fetchAboutContent()
  }, [])

  const fetchAboutContent = async () => {
    try {
      const response = await fetch("/api/about")
      if (response.ok) {
        const data = await response.json()
        setAboutContent(data[0] || null)
      }
    } catch (error) {
      console.error("Failed to fetch about content:", error)
    } finally {
      setLoading(false)
    }
  }

  // Enhanced theming
  const theme =
    shop === "A"
      ? {
          // Cosmetics Theme
          bg: "bg-gradient-to-br from-white via-pink-50 to-rose-50",
          title: "font-serif text-gray-800",
          subtitle: "text-pink-600",
          text: "text-gray-700",
          button:
            "bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-pink-200",
          decorCircle1: "bg-gradient-to-br from-pink-400 to-rose-400",
          decorCircle2: "bg-gradient-to-br from-pink-500 to-rose-500",
          decorCircle3: "bg-gradient-to-br from-pink-300 to-rose-300",
          imageOverlay: "bg-gradient-to-t from-pink-500/20 to-transparent",
          icon: Heart,
          floatingElements: "from-pink-400/20 to-rose-400/20",
        }
      : {
          // Gadgets Theme
          bg: "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800",
          title: "font-mono text-cyan-100",
          subtitle: "text-cyan-400",
          text: "text-gray-300",
          button:
            "bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-cyan-500/30",
          decorCircle1: "bg-gradient-to-br from-cyan-400 to-blue-400",
          decorCircle2: "bg-gradient-to-br from-cyan-500 to-blue-500",
          decorCircle3: "bg-gradient-to-br from-cyan-300 to-blue-300",
          imageOverlay: "bg-gradient-to-t from-cyan-500/20 to-transparent",
          icon: Cpu,
          floatingElements: "from-cyan-400/20 to-blue-400/20",
        }

  // Default content based on shop type
  const defaultContent =
    shop === "A"
      ? {
          title: "A Legacy of Beauty and Confidence",
          subtitle: "Where Tradition Inspires Radiance",
          description: `Founded by beauty enthusiasts and skincare experts, our brand blends time-honored rituals with cutting-edge innovation to bring out your natural glow. Every product is thoughtfully curated, every formula crafted with care—because your skin deserves nothing but the best.\n\nStep into a world of elegance and self-care, where quality, experience, and empowerment come together to redefine your beauty journey.`,
          image_url: "/placeholder.svg?height=600&width=500",
          button_text: "Explore Beauty Collection",
          button_link: "/products",
        }
      : {
          title: "Innovation Meets Performance",
          subtitle: "Technology That Transforms",
          description: `Built by tech enthusiasts and engineering experts, we deliver cutting-edge gadgets that push the boundaries of what's possible. Every device is meticulously designed, every feature optimized for peak performance—because your digital life deserves the best.\n\nDiscover a world of innovation and efficiency, where advanced technology, superior quality, and user experience converge to revolutionize your digital lifestyle.`,
          image_url: "/placeholder.svg?height=600&width=500",
          button_text: "Discover Tech Innovation",
          button_link: "/products",
        }

  const content = aboutContent || defaultContent
  const IconComponent = theme.icon

  if (loading) {
    return (
      <section id="about" className={`py-24 ${theme.bg} relative overflow-hidden`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className={`h-12 ${shop === "A" ? "bg-pink-200" : "bg-slate-700"} rounded w-3/4`}></div>
                <div className={`h-8 ${shop === "A" ? "bg-pink-200" : "bg-slate-700"} rounded w-1/2`}></div>
                <div className="space-y-4">
                  <div className={`h-6 ${shop === "A" ? "bg-pink-200" : "bg-slate-700"} rounded`}></div>
                  <div className={`h-6 ${shop === "A" ? "bg-pink-200" : "bg-slate-700"} rounded`}></div>
                  <div className={`h-6 ${shop === "A" ? "bg-pink-200" : "bg-slate-700"} rounded w-3/4`}></div>
                </div>
                <div className={`h-16 ${shop === "A" ? "bg-pink-200" : "bg-slate-700"} rounded w-1/3`}></div>
              </div>
              <div className={`h-[600px] ${shop === "A" ? "bg-pink-200" : "bg-slate-700"} rounded-3xl`}></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="about" className={`py-24 ${theme.bg} relative overflow-hidden`}>
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-4 h-4 bg-gradient-to-r ${theme.floatingElements} rounded-full animate-float opacity-30`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <IconComponent
                className={`w-10 h-10 ${shop === "A" ? "text-pink-500" : "text-cyan-400"} animate-pulse`}
              />
              <div className={`w-16 h-1 ${shop === "A" ? "bg-pink-400" : "bg-cyan-400"} rounded-full`}></div>
            </div>

            <div>
              <h2 className={`text-4xl md:text-6xl font-bold mb-6 ${theme.title} leading-tight`}>{content.title}</h2>
              {content.subtitle && (
                <p className={`text-2xl md:text-3xl font-light mb-8 ${theme.subtitle}`}>{content.subtitle}</p>
              )}
            </div>

            <div className={`prose prose-xl ${theme.text} leading-relaxed`}>
              {content.description.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-6 text-lg leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {content.button_text && content.button_link && (
              <Button
                asChild
                size="lg"
                className={`${theme.button} font-semibold px-10 py-4 text-lg rounded-full transform hover:scale-105 transition-all duration-300 shadow-2xl`}
              >
                <a href={content.button_link} className="flex items-center">
                  <IconComponent className="w-5 h-5 mr-2" />
                  {content.button_text}
                </a>
              </Button>
            )}
          </div>

          <div className="relative animate-scale-in">
            <div className="relative h-[600px] lg:h-[700px] rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500">
              <Image src={content.image_url || "/placeholder.svg"} alt={content.title} fill className="object-cover" />
              <div className={`absolute inset-0 ${theme.imageOverlay}`} />

              {/* Floating icons */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-500">
                {shop === "A" ? (
                  <>
                    <Sparkles className="absolute top-20 left-20 w-8 h-8 text-white animate-pulse" />
                    <Heart className="absolute bottom-20 right-20 w-6 h-6 text-white animate-bounce" />
                  </>
                ) : (
                  <>
                    <Zap className="absolute top-20 left-20 w-8 h-8 text-cyan-400 animate-pulse" />
                    <Cpu className="absolute bottom-20 right-20 w-6 h-6 text-cyan-400 animate-bounce" />
                  </>
                )}
              </div>
            </div>

            {/* Decorative elements */}
            <div
              className={`absolute -bottom-8 -left-8 w-32 h-32 ${theme.decorCircle1} rounded-full opacity-20 animate-pulse`}
            ></div>
            <div
              className={`absolute -top-8 -right-8 w-24 h-24 ${theme.decorCircle2} rounded-full opacity-30 animate-bounce`}
            ></div>
            <div
              className={`absolute top-1/2 -left-4 w-16 h-16 ${theme.decorCircle3} rounded-full opacity-25 animate-pulse`}
            ></div>
          </div>
        </div>
      </div>
    </section>
  )
}
