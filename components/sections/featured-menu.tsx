
"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import { fetchProducts } from "@/lib/store/slices/productSlice"
import { addToCart } from "@/lib/store/slices/orderSlice"
import { useSettings } from "@/lib/contexts/settings-context"
import { useShop } from "@/lib/contexts/shop-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Star, Heart, Zap, Sparkles, Cpu } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function FeaturedMenu() {
  const dispatch = useDispatch<AppDispatch>()
  const { featuredItems, loading } = useSelector((state: RootState) => state.products)
  const { formatPrice } = useSettings()
  const { shop } = useShop()

  // Enhanced theme colors
  const theme =
    shop === "A"
      ? {
          // Cosmetics Theme - Elegant Pink
          bg: "bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100",
          cardBg: "bg-white/80 backdrop-blur-xl border-pink-100",
          accent: "bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white border-pink-400",
          badge: "bg-gradient-to-r from-pink-400 to-rose-400 text-white",
          badgeNew: "bg-gradient-to-r from-pink-500 to-rose-500 text-white",
          price: "text-pink-600",
          shadow: "shadow-pink-100 hover:shadow-pink-200",
          btn: "bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-700 text-white border-pink-400",
          title: "font-serif text-gray-800",
          subtitle: "text-rose-600",
          divider: "bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500",
          star: "fill-pink-400 text-pink-400",
          icon: Sparkles,
          floatingParticles: "from-pink-400/30 to-rose-400/30",
        }
      : {
          // Gadgets Theme - Professional Dark
          bg: "bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800",
          cardBg: "bg-slate-800/90 backdrop-blur-xl border-cyan-500/20",
          accent: "bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-600 text-white border-cyan-400",
          badge: "bg-gradient-to-r from-cyan-400 to-blue-400 text-slate-900",
          badgeNew: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white",
          price: "text-cyan-400",
          shadow: "shadow-cyan-500/20 hover:shadow-cyan-500/30",
          btn: "bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-600 hover:from-cyan-600 hover:to-blue-700 text-white border-cyan-400",
          title: "font-mono text-cyan-100",
          subtitle: "text-cyan-400",
          divider: "bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500",
          star: "fill-cyan-400 text-cyan-400",
          icon: Cpu,
          floatingParticles: "from-cyan-400/30 to-blue-400/30",
        }

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  const handleAddToCart = (product: any) => {
    dispatch(addToCart({ menuItem: product, quantity: 1 }))
  }

  const IconComponent = theme.icon

  if (loading) {
    return (
      <section className={`py-24 ${theme.bg} relative overflow-hidden`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className={`text-5xl md:text-6xl font-bold mb-6 ${theme.title}`}>Featured Products</h2>
            <div className={`w-32 h-2 mx-auto ${theme.divider} rounded-full`}></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className={`${theme.cardBg} h-80 rounded-3xl mb-4`}></div>
                <div className={`h-6 ${theme.cardBg} rounded mb-3`}></div>
                <div className={`h-4 ${theme.cardBg} rounded w-3/4`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`py-24 ${theme.bg} relative overflow-hidden`}>
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 bg-gradient-to-r ${theme.floatingParticles} rounded-full animate-float opacity-40`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-20 animate-fade-in">
          <div className="flex justify-center mb-6">
            <IconComponent className={`w-12 h-12 ${shop === "A" ? "text-pink-500" : "text-cyan-400"} animate-pulse`} />
          </div>
          <h2 className={`text-5xl md:text-7xl font-bold mb-6 ${theme.title} leading-tight`}>Featured Products</h2>
          <p className={`text-xl md:text-2xl mb-8 ${theme.subtitle} font-light`}>
            {shop === "A"
              ? "Discover our premium beauty collection crafted for your elegance"
              : "Cutting-edge technology designed for the modern innovator"}
          </p>
          <div className={`w-32 h-2 mx-auto ${theme.divider} rounded-full`}></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {featuredItems.slice(0, 6).map((item, index) => (
            <Card
              key={item.id}
              className={`group hover:shadow-2xl transition-all duration-500 animate-slide-up rounded-3xl border-0 ${theme.cardBg} ${theme.shadow} transform hover:scale-105 hover:-translate-y-2`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="relative overflow-hidden rounded-t-3xl">
                <Image
                  src={item.image_url || `/placeholder.svg?height=320&width=400&query=${encodeURIComponent(item.name)}`}
                  alt={item.name}
                  width={400}
                  height={320}
                  className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700 rounded-t-3xl"
                />

                {/* Gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${
                    shop === "A"
                      ? "from-pink-900/20 via-transparent to-transparent"
                      : "from-slate-900/40 via-transparent to-transparent"
                  } opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {item.is_new && (
                    <Badge className={`animate-pulse ${theme.badgeNew} shadow-lg font-semibold`}>NEW</Badge>
                  )}
                  {item.is_featured && <Badge className={`${theme.badge} shadow-lg font-semibold`}>Featured</Badge>}
                </div>

                {/* Rating */}
                <div className="absolute top-4 right-4">
                  <div
                    className={`${
                      shop === "A" ? "bg-white/90" : "bg-slate-800/90"
                    } backdrop-blur-sm px-3 py-2 rounded-full text-sm flex items-center shadow-lg`}
                  >
                    <Star className={`w-4 h-4 ${theme.star} mr-1`} />
                    <span className={shop === "A" ? "text-gray-800" : "text-cyan-100"}>4.9</span>
                  </div>
                </div>

                {/* Floating heart/zap on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                  {shop === "A" ? (
                    <Heart className="w-8 h-8 text-white animate-pulse" />
                  ) : (
                    <Zap className="w-8 h-8 text-cyan-400 animate-pulse" />
                  )}
                </div>
              </div>

              <CardContent className="p-8">
                <h3
                  className={`text-2xl font-bold mb-3 ${theme.title} group-hover:${theme.subtitle} transition-colors duration-300`}
                >
                  {item.name}
                </h3>
                <p className={`${shop === "A" ? "text-gray-600" : "text-gray-400"} mb-6 line-clamp-2 leading-relaxed`}>
                  {item.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className={`text-3xl font-bold ${theme.price}`}>{formatPrice(item.price)}</span>
                  <Button
                    onClick={() => handleAddToCart(item)}
                    size="lg"
                    className={`${theme.btn} rounded-full px-6 py-3 font-semibold shadow-lg transform hover:scale-110 transition-all duration-300`}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                </div>

                {item.warranty_months && (
                  <p className={`text-sm ${shop === "A" ? "text-gray-500" : "text-gray-400"} flex items-center`}>
                    <IconComponent className="w-4 h-4 mr-2" />
                    {shop === "A" ? "Expiry" : "Warranty"}: {item.warranty_months} months
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link href="/products">
            <Button
              size="lg"
              className={`${theme.btn} font-semibold px-12 py-4 text-lg rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300`}
            >
              <IconComponent className="w-5 h-5 mr-2" />
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
