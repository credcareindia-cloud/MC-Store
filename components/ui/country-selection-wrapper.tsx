"use client"

import { useEffect, useState } from "react"
import CountrySelectionModal from "./country-selection-modal"

interface Country {
  code: string
  name: string
  currency: string
  flag: string
}

export default function CountrySelectionWrapper() {
  const [showModal, setShowModal] = useState(false)
  const [adminSettings, setAdminSettings] = useState({
    currency_switch_enabled: 'true',
    available_currencies: 'AED,INR'
  })

  useEffect(() => {
    // Fetch admin currency settings first
    const fetchAdminSettings = async () => {
      try {
        const response = await fetch('/api/admin/shop-features')
        if (response.ok) {
          const data = await response.json()
          setAdminSettings({
            currency_switch_enabled: data.currency_switch_enabled || 'true',
            available_currencies: data.available_currencies || 'AED,INR'
          })

          // Only show modal if currency switching is enabled and multiple currencies are available
          const availableCurrencies = (data.available_currencies || 'AED,INR').split(',')
          const shouldShowModal = data.currency_switch_enabled === 'true' && availableCurrencies.length > 1

          if (shouldShowModal) {
            // Check if user has already selected a country
            const hasSelectedCountry = localStorage.getItem('country-selected')
            
            if (!hasSelectedCountry) {
              // Show modal after a short delay for better UX
              const timer = setTimeout(() => {
                setShowModal(true)
              }, 1500) // Slightly longer delay to ensure page is fully loaded

              return () => clearTimeout(timer)
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch admin settings:', error)
      }
    }

    fetchAdminSettings()
  }, [])

  const handleCountrySelect = (country: Country) => {
    setShowModal(false)
    
    // Optional: Add analytics tracking
    console.log('Country selected:', country)
    
    // Optional: Show success toast
    // toast.success(`Welcome! Shopping in ${country.name} (${country.currency})`)
  }

  const closeModal = () => {
    setShowModal(false)
    // Mark as selected even if closed without selection
    localStorage.setItem('country-selected', 'true')
  }

  return (
    <CountrySelectionModal
      isOpen={showModal}
      // onClose={closeModal}
      onCountrySelect={handleCountrySelect}
    />
  )
}
