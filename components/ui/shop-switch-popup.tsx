"use client"

import React, { useState, useEffect } from 'react'
import { X, Sparkles, Watch, ArrowRight, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShop } from '@/lib/contexts/shop-context'
import Image from 'next/image'

interface ShopSwitchPopupProps {
  isOpen: boolean
  onClose: () => void
  onSwitchShop: () => void
}

export default function ShopSwitchPopup({ isOpen, onClose, onSwitchShop }: ShopSwitchPopupProps) {
  const { shop } = useShop()
  
  if (!isOpen) return null

  const otherShop = shop === "A" ? "B" : "A"
  const currentShopName = shop === "A" ? "Beauty Products" : "Style Accessories"
  const otherShopName = otherShop === "A" ? "Beauty Products" : "Style Accessories"
  
  const shopData = {
    A: {
      name: "Beauty Products",
      icon: <Sparkles className="w-8 h-8" />,
      gradient: "from-orange-400 via-pink-500 to-red-500",
      description: "Discover premium beauty essentials",
      features: ["Premium Skincare", "Makeup Essentials", "Beauty Tools", "Fragrances"],
      emoji: "✨"
    },
    B: {
      name: "Style Accessories", 
      icon: <Watch className="w-8 h-8" />,
      gradient: "from-purple-400 via-blue-500 to-indigo-600",
      description: "Explore trendy style accessories",
      features: ["Smart Watches", "Fashion Jewelry", "Tech Gadgets", "Lifestyle Items"],
      emoji: "⌚"
    }
  }

  const targetShop = shopData[otherShop as keyof typeof shopData]

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10001] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all duration-200 hover:scale-105"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {/* Header with Gradient */}
        <div className={`bg-gradient-to-r ${targetShop.gradient} p-6 text-white relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              {targetShop.icon}
              <h2 className="text-2xl font-bold">{targetShop.name}</h2>
            </div>
            <p className="text-white/90 text-sm">{targetShop.description}</p>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -top-4 -right-4 text-6xl opacity-20">
            {targetShop.emoji}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Why not explore our {targetShop.name}?
            </h3>
            <p className="text-gray-600 text-sm">
              You've been browsing {currentShopName}. Discover amazing deals in our other collection!
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {targetShop.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${targetShop.gradient}`}></div>
                {feature}
              </div>
            ))}
          </div>

          {/* Special Offer Badge */}
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-200 rounded-lg p-3 mb-6">
            <div className="flex items-center gap-2 text-orange-800">
              <Gift className="w-4 h-4" />
              <span className="text-sm font-medium">Special offers available in {targetShop.name}!</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Maybe Later
            </Button>
            <Button
              onClick={onSwitchShop}
              className={`flex-1 bg-gradient-to-r ${targetShop.gradient} hover:opacity-90 text-white border-0`}
            >
              <span>Explore Now</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
