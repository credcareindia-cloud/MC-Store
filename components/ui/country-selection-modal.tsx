"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Globe, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCurrency } from "@/lib/contexts/currency-context"
import Image from "next/image"

interface Country {
  code: string
  name: string
  currency: string
  flag: string
  flagSvg: string
}

const countries: Country[] = [
  {
    code: "IN",
    name: "INDIA",
    currency: "INR",
    flag: "🇮🇳",
    flagSvg: "/Flag_of_India.svg"
  },
  {
    code: "AE",
    name: "UAE",
    currency: "AED",
    flag: "🇦🇪",
    flagSvg: "/Flag_of_the_United_Arab_Emirates.svg"
  }
]

interface CountrySelectionModalProps {
  isOpen: boolean
//   onClose: () => void
  onCountrySelect: (country: Country) => void
}

export default function CountrySelectionModal({ 
  isOpen, 
//   onClose, 
  onCountrySelect 
}: CountrySelectionModalProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>(['AED', 'INR'])
  const { setSelectedCurrency } = useCurrency()

  // Fetch available currencies from admin settings
  useEffect(() => {
    const fetchAvailableCurrencies = async () => {
      try {
        const response = await fetch('/api/admin/shop-features')
        if (response.ok) {
          const data = await response.json()
          const currencies = (data.available_currencies || 'AED,INR').split(',').map((c: string) => c.trim())
          setAvailableCurrencies(currencies)
        }
      } catch (error) {
        console.error('Failed to fetch available currencies:', error)
      }
    }

    if (isOpen) {
      fetchAvailableCurrencies()
    }
  }, [isOpen])

  // Filter countries based on available currencies
  const availableCountries = countries.filter(country => 
    availableCurrencies.includes(country.currency)
  )

  const handleCountrySelect = async (country: Country) => {
    setSelectedCountry(country)
    setIsSelecting(true)

    // Simulate loading time for better UX
    await new Promise(resolve => setTimeout(resolve, 800))

    // Set currency based on country selection
    if (country.currency === 'INR') {
      setSelectedCurrency('INR')
    } else if (country.currency === 'AED') {
      setSelectedCurrency('AED')
    }

    // Save selection to localStorage
    localStorage.setItem('country-selected', 'true')
    localStorage.setItem('selected-country', JSON.stringify(country))
    
    // Call parent callback
    onCountrySelect(country)
    
    setIsSelecting(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10003] flex items-center justify-center p-4 sm:p-6"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-6 text-center">
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
              {/* <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-white/20 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button> */}
            </div>
            
            <div className="mb-2 sm:mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                SELECT YOUR COUNTRY
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm px-2">
                Choose your location to see products and prices in your local currency
              </p>
            </div>
          </div>

          {/* Country List */}
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {availableCountries.map((country, index) => (
              <motion.div
                key={country.code}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
                onClick={() => handleCountrySelect(country)}
                className={`relative p-4 sm:p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  selectedCountry?.code === country.code
                    ? 'border-blue-500 bg-blue-50 shadow-md transform scale-[0.98]'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm active:scale-[0.98]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 relative flex-shrink-0">
                      <Image
                        src={country.flagSvg}
                        alt={`${country.name} flag`}
                        fill
                        className={`rounded-full border-2 border-gray-200 shadow-sm ${
                          country.code === 'AE' 
                            ? 'object-cover object-[20%]' 
                            : 'object-cover object-center'
                        }`}
                        sizes="(max-width: 640px) 40px, 48px"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg sm:text-xl">
                        {country.name}
                      </h3>

                    </div>
                  </div>
                  
                  {selectedCountry?.code === country.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0"
                    >
                      {isSelecting ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Selection overlay */}
                {selectedCountry?.code === country.code && isSelecting && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-blue-500/10 rounded-xl flex items-center justify-center"
                  >
                    <div className="text-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 sm:border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-xs sm:text-sm font-medium text-blue-700 px-2">
                        Setting up your experience...
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              You can change your country and currency anytime from the top navigation
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Hook to manage country selection modal
export function useCountrySelection() {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Check if user has already selected a country
    const hasSelectedCountry = localStorage.getItem('country-selected')
    
    if (!hasSelectedCountry) {
      // Show modal after a short delay for better UX
      const timer = setTimeout(() => {
        setShowModal(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleCountrySelect = (country: Country) => {
    setShowModal(false)
    
    // You can add additional logic here like:
    // - Analytics tracking
    // - API calls to set user preferences
    // - Redirect to localized content
    
    console.log('Country selected:', country)
  }

//   const closeModal = () => {
//     setShowModal(false)
//     // Mark as selected even if closed without selection
//     localStorage.setItem('country-selected', 'true')
//   }

  return {
    showModal,
    handleCountrySelect,
    // closeModal
  }
}
