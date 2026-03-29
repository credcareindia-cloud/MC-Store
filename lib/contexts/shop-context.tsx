"use client"
import React, { createContext, useContext } from "react"

/** Legacy type kept for compatibility; storefront is a single catalog. */
type Shop = "A" | "B"

interface ShopContextType {
  shop: Shop
  setShop: (shop: Shop) => void
  isLoading: boolean
  isShopSwitchEnabled: boolean
}

const ShopContext = createContext<ShopContextType | undefined>(undefined)

export const ShopProvider = ({ children }: { children: React.ReactNode }) => {
  const shop: Shop = "A"
  const isShopSwitchEnabled = false
  const setShop = () => {}

  return (
    <ShopContext.Provider value={{ shop, setShop, isLoading: false, isShopSwitchEnabled }}>
      {children}
    </ShopContext.Provider>
  )
}

export const useShop = () => {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error("useShop must be used within a ShopProvider")
  return ctx
}
