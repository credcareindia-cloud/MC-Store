"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Gift, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import SpinnerWheel from "@/components/ui/offer-spinner"
const NewUserSpinnerSection: React.FC = () => {
  const [showSpinner, setShowSpinner] = useState(false)
  const [hasActiveOffer, setHasActiveOffer] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/offers/active")
        if (!res.ok) {
          if (!cancelled) setHasActiveOffer(false)
          return
        }
        const data = await res.json()
        const list = Array.isArray(data) ? data : []
        if (!cancelled) setHasActiveOffer(list.length > 0)
      } catch {
        if (!cancelled) setHasActiveOffer(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const shopContent = {
    title: "Exclusive offers for new users — claim now!",
    subtitle: "Spin for Motoclub discounts",
    description: "Coupon bundle waiting on parts & accessories.",
    discount: "Save on spare parts and riding gear!",
    icon: <Zap className="w-6 h-6 lg:w-8 lg:h-8 text-white" />,
    gradient: "bg-zinc-900 border border-zinc-800",
    textColor: "text-zinc-900",
    hoverColor: "hover:bg-zinc-100 border-zinc-300",
  }

  if (hasActiveOffer !== true) {
    return null
  }

  return (
    <div>
      {!showSpinner && (
        <div className="px-4 lg:px-6 mt-4 lg:mt-6">
          <div className="max-w-7xl mx-auto">
            <div
              className={`rounded-lg p-6 lg:p-8 text-center relative overflow-hidden shadow-sm transition-all duration-300 ${shopContent.gradient}`}
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
                  className={`bg-white rounded-md px-8 lg:px-12 py-3 lg:py-4 font-semibold text-base lg:text-lg shadow-sm transition-colors border ${shopContent.textColor} ${shopContent.hoverColor}`}
                >
                  Spin for offer
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
