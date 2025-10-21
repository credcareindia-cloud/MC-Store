
"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import { fetchCategories } from "@/lib/store/slices/productSlice"
import Image from "next/image"
import Link from "next/link"
import { Sparkles, Zap } from "lucide-react"
import { useShop } from "@/lib/contexts/shop-context"

export default function CategoriesStories() {
  const dispatch = useDispatch<AppDispatch>()
  const { categories, loading } = useSelector((state: RootState) => state.products)
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const { shop } = useShop()

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  // Enhanced theming
  const theme =
    shop === "A"
      ? {
          // Cosmetics Theme
          bg: "bg-gradient-to-r from-pink-50 via-rose-50 to-pink-100",
          border: "border-pink-100",
          ring: "bg-gradient-to-tr from-pink-400 via-rose-400 to-pink-500",
          ringInactive: "bg-gradient-to-tr from-pink-200 to-rose-200",
          innerRing: "bg-white",
          text: "text-rose-800",
          textActive: "text-pink-600",
          shadow: "shadow-pink-100",
          icon: Sparkles,
        }
      : {
          // Gadgets Theme
          bg: "bg-gradient-to-r from-slate-800 via-gray-900 to-slate-800",
          border: "border-cyan-500/20",
          ring: "bg-gradient-to-tr from-cyan-400 via-blue-500 to-cyan-500",
          ringInactive: "bg-gradient-to-tr from-gray-600 to-slate-600",
          innerRing: "bg-slate-800",
          text: "text-cyan-100",
          textActive: "text-cyan-400",
          shadow: "shadow-cyan-500/20",
          icon: Zap,
        }

  const sortedCategories = [...categories].sort((a, b) => {
    return (a.sort_order || 0) - (b.sort_order || 0)
  })

  if (loading) {
    return (
      <section className={`py-6 ${theme.bg} border-b ${theme.border} sticky top-20 z-40 ${theme.shadow}`}>
        <div className="px-4">
          <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 animate-pulse">
                <div className={`w-20 h-20 ${theme.ringInactive} rounded-full mb-3 p-1`}>
                  <div className={`w-full h-full ${theme.innerRing} rounded-full`}></div>
                </div>
                <div className={`w-16 h-3 ${theme.ringInactive} rounded mx-auto`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className={`py-6 ${theme.bg} border-b ${theme.border} sticky top-20 z-40 backdrop-blur-xl ${theme.shadow}`}
    >
      <div className="px-4">
        <div className="flex space-x-6 overflow-x-auto scrollbar-hide pb-2">
          {sortedCategories.map((category, index) => {
            const isActive = activeCategory === category.id
            return (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="flex-shrink-0 text-center group transform transition-all duration-300 hover:scale-105"
                onMouseEnter={() => setActiveCategory(category.id)}
                onMouseLeave={() => setActiveCategory(null)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative">
                  {/* Enhanced Story Ring */}
                  <div
                    className={`w-20 h-20 rounded-full p-1 transition-all duration-500 transform ${
                      isActive ? `${theme.ring} scale-110 shadow-lg` : theme.ringInactive
                    } ${shop === "A" ? "shadow-pink-200" : "shadow-cyan-500/30"}`}
                  >
                    <div className={`w-full h-full ${theme.innerRing} rounded-full p-1 transition-all duration-300`}>
                      <div className="relative w-full h-full rounded-full overflow-hidden">
                        <Image
                          src={
                            category.image_url ||
                            `/placeholder.svg?height=80&width=80&query=${encodeURIComponent(category.name) || "/placeholder.svg"}`
                          }
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* Overlay effect */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-t ${
                            shop === "A" ? "from-pink-500/20 to-transparent" : "from-cyan-500/20 to-transparent"
                          } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Floating icon */}
                  {isActive && (
                    <div className="absolute -top-1 -right-1">
                      <theme.icon
                        className={`w-4 h-4 ${shop === "A" ? "text-pink-500" : "text-cyan-400"} animate-pulse`}
                      />
                    </div>
                  )}
                </div>

                {/* Category Name */}
                <p
                  className={`text-xs mt-3 font-medium transition-all duration-300 ${
                    isActive ? `${theme.textActive} font-semibold` : theme.text
                  } ${shop === "A" ? "font-serif" : "font-mono"}`}
                >
                  {category.name.length > 12 ? `${category.name.substring(0, 12)}...` : category.name}
                </p>

                {/* Active indicator */}
                {isActive && (
                  <div
                    className={`w-1 h-1 rounded-full mx-auto mt-1 ${
                      shop === "A" ? "bg-pink-500" : "bg-cyan-400"
                    } animate-pulse`}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
