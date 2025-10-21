"use client"

import type React from "react"
import { useState } from "react"
import { Gift, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import SpinnerWheel from "@/components/ui/offer-spinner"
import { useShop } from "@/lib/contexts/shop-context"

const NewUserSpinnerSection: React.FC = () => {
  const [showSpinner, setShowSpinner] = useState(false)
  const { shop } = useShop()

  const shouldShowSpinButton = true
  const isAuthenticated = false

  const getShopContent = () => {
    if (shop === "A") {
      return {
        title: "Exclusive Offers for New Users Claim Now!",
        subtitle: "Spin to get Beauty Discounts",
        description: "Beauty coupon bundle waiting!",
        discount: "Get up to 100% OFF on beauty products!",
        icon: <Sparkles className="w-6 h-6 lg:w-8 lg:h-8 text-white animate-bounce" />,
        gradient: "bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500",
        textColor: "text-orange-600",
        hoverColor: "hover:bg-gray-100 border-orange-200"
      }
    } else {
      return {
        title: "Exclusive Offers for New Users Claim Now!",
        subtitle: "Spin to get Style Discounts", 
        description: "Style coupon bundle waiting!",
        discount: "Get up to 100% OFF on style accessories!",
        icon: <Zap className="w-6 h-6 lg:w-8 lg:h-8 text-white animate-bounce" />,
        gradient: "bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700",
        textColor: "text-purple-600",
        hoverColor: "hover:bg-gray-100 border-purple-200"
      }
    }
  }

  const shopContent = getShopContent()

  return (
    <div>
      {shouldShowSpinButton && !showSpinner && (
        <div className="px-4 lg:px-6 mt-4 lg:mt-6">
          <div className="max-w-7xl mx-auto">
            <div
              className={`rounded-2xl p-6 lg:p-8 text-center relative overflow-hidden shadow-xl border-4 border-white transition-all duration-500 ${shopContent.gradient}`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Gift className="w-6 h-6 lg:w-8 lg:h-8 text-white animate-bounce" />
                  <h3 className="text-white font-bold text-xl lg:text-3xl">
                    {shopContent.title}
                  </h3>
                  {shopContent.icon}
                </div>
                <p className="text-white text-lg lg:text-2xl font-bold mb-1">
                  {shopContent.subtitle}
                </p>
                <p className="text-white/90 text-sm lg:text-base mb-6">
                  {shopContent.description}
                </p>
                <Button
                  onClick={() => setShowSpinner(true)}
                  className={`bg-white rounded-full px-8 lg:px-16 py-4 lg:py-6 font-bold text-lg lg:text-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 border-2 ${shopContent.textColor} ${shopContent.hoverColor}`}
                >
                  🎁 SPIN NOW!
                </Button>
                <p className="text-white/80 text-xs lg:text-sm mt-3">
                  {shopContent.discount}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSpinner && (
        <div className="px-4 lg:px-6 mt-6">
          <SpinnerWheel onClose={() => setShowSpinner(false)} />
        </div>
      )}
    </div>
  )
}

export default NewUserSpinnerSection
