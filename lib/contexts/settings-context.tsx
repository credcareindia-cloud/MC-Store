"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface Settings {
  restaurant_name: string
  restaurant_logo: string
  currency_code: string
  currency_symbol: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
  email: string
  website: string
  opening_hours: string
  social_facebook: string
  social_instagram: string
  social_twitter: string
}

interface SettingsContextType {
  settings: Settings
  loading: boolean
  formatPrice: (price: number | string) => string
  getFullAddress: () => string
  getOpeningHours: () => Record<string, string>
}

const defaultSettings: Settings = {
  restaurant_name: "Motoclub",
  restaurant_logo: "",
  currency_code: "INR",
  currency_symbol: "₹",
  address_line1: "Moto club Kottakkal, Thoppil tower, Parakkori, Puthoor",
  address_line2: "Kottakkal, Malappuram dist., Kerala",
  city: "",
  state: "",
  postal_code: "676503",
  country: "India",
  phone: "99954 42239",
  email: "motoclubkottakkal@gmail.com",
  website: "https://motoclub.in",
  opening_hours:
    '{"monday": "5:00 PM - 10:00 PM", "tuesday": "5:00 PM - 10:00 PM", "wednesday": "5:00 PM - 10:00 PM", "thursday": "5:00 PM - 10:00 PM", "friday": "5:00 PM - 11:00 PM", "saturday": "5:00 PM - 11:00 PM", "sunday": "4:00 PM - 9:00 PM"}',
  social_facebook: "",
  social_instagram: "",
  social_twitter: "",
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  formatPrice: (price: number | string) =>
    `$${(typeof price === "number" ? price : Number.parseFloat(price)).toFixed(2)}`,
  getFullAddress: () => "",
  getOpeningHours: () => ({}),
})

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings({ ...defaultSettings, ...data })
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number | string): string => {
    const numeric = typeof price === "number" ? price : Number.parseFloat(price)
    if (Number.isNaN(numeric)) return `${settings.currency_symbol}0.00`
    return `${settings.currency_symbol}${numeric.toFixed(2)}`
  }

  const getFullAddress = (): string => {
    const parts = [
      settings.address_line1,
      settings.address_line2,
      settings.city,
      settings.state,
      settings.postal_code,
      settings.country,
    ].filter(Boolean)
    return parts.join(", ")
  }

  const getOpeningHours = (): Record<string, string> => {
    try {
      return JSON.parse(settings.opening_hours)
    } catch {
      return {}
    }
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        formatPrice,
        getFullAddress,
        getOpeningHours,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}

