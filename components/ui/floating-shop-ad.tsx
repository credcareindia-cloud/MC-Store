"use client"

import React, { useState, useEffect } from 'react'
import { X, Sparkles, Watch, ArrowRight, ShoppingBag, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShop } from '@/lib/contexts/shop-context'
import { Badge } from '@/components/ui/badge'

interface FloatingShopAdProps {
  isVisible: boolean
  onClose: () => void
  onSwitchShop: () => void
}

export default function FloatingShopAd({ isVisible, onClose, onSwitchShop }: FloatingShopAdProps) {
  const { shop } = useShop()
  const [isAnimating, setIsAnimating] = useState(false)
  
  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
    }
  }, [isVisible])

  if (!isVisible) return null

  const otherShop = shop === "A" ? "B" : "A"
  const currentShopName = shop === "A" ? "Beauty" : "Style"
  const otherShopName = otherShop === "A" ? "Beauty" : "Style"
  
  const shopData = {
    A: {
      name: "Beauty Products",
      shortName: "Beauty",
      icon: <Sparkles className="w-5 h-5" />,
      gradient: "from-orange-400 via-pink-500 to-red-500",
      bgGradient: "from-orange-50 to-pink-50",
      textColor: "text-orange-600",
      description: "Premium beauty essentials await!",
      offer: "Up to 50% OFF",
      features: ["Skincare", "Makeup", "Fragrances"],
      emoji: "✨"
    },
    B: {
      name: "Style Accessories", 
      shortName: "Style",
      icon: <Watch className="w-5 h-5" />,
      gradient: "from-purple-400 via-blue-500 to-indigo-600",
      bgGradient: "from-purple-50 to-blue-50",
      textColor: "text-purple-600",
      description: "Trendy accessories collection!",
      offer: "New Arrivals",
      features: ["Watches", "Jewelry", "Gadgets"],
      emoji: "⌚"
    }
  }

  const targetShop = shopData[otherShop as keyof typeof shopData]

  return (
    <div 
      className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-[10000] transition-all duration-500 ${
        isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{ maxWidth: '280px' }}
    >
      <div className={`bg-gradient-to-br ${targetShop.bgGradient} border border-white/20 rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {/* Header */}
        <div className={`bg-gradient-to-r ${targetShop.gradient} p-4 text-white relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              {targetShop.icon}
              <h3 className="font-bold text-lg">{targetShop.shortName}</h3>
            </div>
            <p className="text-white/90 text-sm">{targetShop.description}</p>
          </div>
          
          {/* Decorative Element */}
          <div className="absolute -top-2 -right-2 text-4xl opacity-20">
            {targetShop.emoji}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Offer Badge */}
          <div className="flex justify-center mb-3">
            <Badge className={`bg-gradient-to-r ${targetShop.gradient} text-white border-0 px-3 py-1`}>
              <Star className="w-3 h-3 mr-1" />
              {targetShop.offer}
            </Badge>
          </div>

          {/* Features */}
          <div className="space-y-2 mb-4">
            {targetShop.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${targetShop.gradient}`}></div>
                <span className={targetShop.textColor}>{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            onClick={onSwitchShop}
            className={`w-full bg-gradient-to-r ${targetShop.gradient} hover:opacity-90 text-white border-0 text-sm py-2`}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            <span>Explore {targetShop.shortName}</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {/* Small text */}
          <p className="text-xs text-gray-500 text-center mt-2">
            Currently browsing {currentShopName}
          </p>
        </div>
      </div>
    </div>
  )
}