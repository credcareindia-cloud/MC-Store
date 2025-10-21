"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/lib/store"
import { addToCart } from "@/lib/store/slices/orderSlice"
import { useSettings } from "@/lib/contexts/settings-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Eye } from "lucide-react"
import Image from "next/image"

interface ProductProps {
  product: {
    id: number
    name: string
    description: string
    price: number
    image_url: string
    category_id: number
    category_name?: string
    is_available: boolean
    is_featured: boolean
    is_new: boolean
    features?: string[]
    brand?: string
    shop_category?: string
  }
  viewMode?: "grid" | "list"
  showShopBadge?: boolean
}

export default function Product({ product, viewMode = "grid", showShopBadge = true }: ProductProps) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { formatPrice } = useSettings()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(addToCart({ menuItem: product, quantity: 1 }))
  }

  const handleViewProduct = () => {
    router.push(`/product/${product.id}`)
  }

  return (
    <Card
      className={`bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer ${
        viewMode === "list" ? "flex" : ""
      }`}
      onClick={handleViewProduct}
    >
      <div className={`relative ${viewMode === "list" ? "w-48 flex-shrink-0" : ""}`}>
        <Image
          src={
            product.image_url ||
            `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(product.name) || "/placeholder.svg"}`
          }
          alt={product.name}
          width={200}
          height={200}
          className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
            viewMode === "list" ? "w-full h-full" : "w-full h-40 lg:h-48"
          }`}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_new && <Badge className="bg-green-500 text-white text-xs">NEW</Badge>}
          {showShopBadge && product.shop_category && (
            <Badge className="bg-blue-500 text-white text-xs">{product.shop_category}</Badge>
          )}
        </div>

        {product.is_featured && <Badge className="absolute top-2 right-2 bg-orange-500 text-white text-xs">HOT</Badge>}

        {/* Rating overlay */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
          4.8
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/90 hover:bg-white text-gray-900"
            onClick={(e) => {
              e.stopPropagation()
              handleViewProduct()
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            Quick View
          </Button>
        </div>
      </div>

      <CardContent className={`p-3 lg:p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
        

        {/* Product name */}
        <h3 className="text-sm lg:text-base font-medium text-gray-900 line-clamp-2 mb-2">{product.name}</h3>

        {/* Description for list view */}
        {viewMode === "list" && <p className="text-sm text-gray-600 line-clamp-3 mb-3">{product.description}</p>}

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {product.features.slice(0, 2).map((feature: string, idx: number) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                >
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-xs text-gray-500 ml-1">(4.8) • 2.1k sold</span>
        </div>

        {/* Add to cart button */}
        <Button
          onClick={handleAddToCart}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full py-2 lg:py-3 text-sm lg:text-base font-medium shadow-lg"
          disabled={!product.is_available}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.is_available ? "Add to Cart" : "Unavailable"}
        </Button>
      </CardContent>
    </Card>
  )
}
