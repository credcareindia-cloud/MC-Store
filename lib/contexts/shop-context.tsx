"use client"
import React, { createContext, useContext, useState, useEffect } from "react"

type Shop = "A" | "B"

interface ShopContextType {
  shop: Shop
  setShop: (shop: Shop) => void
  isLoading: boolean
  isShopSwitchEnabled: boolean
}

const ShopContext = createContext<ShopContextType | undefined>(undefined)

export const ShopProvider = ({ children }: { children: React.ReactNode }) => {
  const [shop, setShopState] = useState<Shop>("A")
  const [isLoading, setIsLoading] = useState(true)
  const [isShopSwitchEnabled, setIsShopSwitchEnabled] = useState(true)

  useEffect(() => {
    const initializeShop = async () => {
      try {
        // Check if user has a stored preference first
        const stored = typeof window !== "undefined" ? localStorage.getItem("selectedShop") : null
        
        // Fetch admin settings for default shop and shop switching control
        const response = await fetch('/api/admin/shop-features')
        let defaultShop: Shop = "A"
        let switchEnabled = true
        
        if (response.ok) {
          const settings = await response.json()
          defaultShop = (settings.default_shop || "A") as Shop
          switchEnabled = settings.shop_switch_enabled === "true"
          setIsShopSwitchEnabled(switchEnabled)
        }

        // If shop switching is disabled, always use default shop
        if (!switchEnabled) {
          setShopState(defaultShop)
          // Clear any stored preference if switching is disabled
          if (typeof window !== "undefined") {
            localStorage.removeItem("selectedShop")
          }
        } else if (stored === "A" || stored === "B") {
          // Use stored preference if switching is enabled
          setShopState(stored)
        } else {
          // Use admin default if no stored preference
          setShopState(defaultShop)
        }
      } catch (error) {
        console.error('Failed to fetch shop settings:', error)
        // Fallback to Shop A if there's an error
        setShopState("A")
        setIsShopSwitchEnabled(true)
      } finally {
        setIsLoading(false)
      }
    }

    initializeShop()
  }, [])

  const setShop = (newShop: Shop) => {
    // Only allow shop switching if it's enabled
    if (!isShopSwitchEnabled) {
      console.warn("Shop switching is disabled by admin settings")
      return
    }
    
    setShopState(newShop)
    if (typeof window !== "undefined") localStorage.setItem("selectedShop", newShop)
  }

  return (
    <ShopContext.Provider value={{ shop, setShop, isLoading, isShopSwitchEnabled }}>
      {children}
    </ShopContext.Provider>
  )
}

export const useShop = () => {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error("useShop must be used within a ShopProvider")
  return ctx
} 

