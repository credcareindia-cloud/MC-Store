import { useState, useEffect, useCallback } from 'react'
import { useShop } from '@/lib/contexts/shop-context'

interface UseShopSwitchPopupOptions {
  intervalMinutes?: number // How often to show popup (in minutes)
  initialDelayMinutes?: number // Initial delay before first popup (in minutes)
  maxShowsPerSession?: number // Maximum times to show per session
}

interface ShopFeaturesSettings {
  popup_enabled: string
  popup_initial_delay: string
  popup_interval: string
  popup_max_shows: string
}

export function useShopSwitchPopup({
  intervalMinutes = 15, // Show every 15 minutes
  initialDelayMinutes = 10, // Wait 10 minutes before first show
  maxShowsPerSession = 2 // Max 2 times per session
}: UseShopSwitchPopupOptions = {}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [showCount, setShowCount] = useState(0)
  const [lastShownTime, setLastShownTime] = useState<number | null>(null)
  const [settings, setSettings] = useState<ShopFeaturesSettings | null>(null)
  const { shop, setShop } = useShop()

  // Fetch settings from admin panel
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/shop-features', {
          cache: 'no-store' // Ensure fresh data
        })
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      } catch (error) {
        console.error('Failed to fetch shop features settings:', error)
      }
    }
    
    fetchSettings()
    
    // Refresh settings every 30 seconds to catch admin changes
    const interval = setInterval(fetchSettings, 30000)
    return () => clearInterval(interval)
  }, [])

  // Use admin settings or fallback to defaults
  const actualIntervalMinutes = settings ? parseInt(settings.popup_interval) : intervalMinutes
  const actualInitialDelayMinutes = settings ? parseInt(settings.popup_initial_delay) : initialDelayMinutes
  const actualMaxShowsPerSession = settings ? parseInt(settings.popup_max_shows) : maxShowsPerSession
  const isEnabled = settings ? settings.popup_enabled === 'true' : false

  // Clear session storage and close popup when disabled
  useEffect(() => {
    if (settings && !isEnabled) {
      setIsPopupOpen(false)
      setShowCount(0)
      setLastShownTime(null)
      sessionStorage.removeItem('shopSwitchSessionStart')
      sessionStorage.removeItem('shopSwitchShowCount')
      sessionStorage.removeItem('shopSwitchLastShown')
    }
  }, [isEnabled, settings])

  // Check if we should show the popup
  const shouldShowPopup = useCallback(() => {
    const now = Date.now()
    
    // Don't show if disabled in admin settings
    if (!isEnabled) {
      return false
    }
    
    // Don't show if we've reached max shows
    if (showCount >= actualMaxShowsPerSession) {
      return false
    }

    // Don't show if popup is already open
    if (isPopupOpen) {
      return false
    }

    // Check if enough time has passed since last show
    if (lastShownTime) {
      const timeSinceLastShow = now - lastShownTime
      const intervalMs = actualIntervalMinutes * 60 * 1000
      return timeSinceLastShow >= intervalMs
    }

    // For first show, check initial delay
    const sessionStartTime = sessionStorage.getItem('shopSwitchSessionStart')
    if (sessionStartTime) {
      const timeSinceStart = now - parseInt(sessionStartTime)
      const initialDelayMs = actualInitialDelayMinutes * 60 * 1000
      return timeSinceStart >= initialDelayMs
    }

    return false
  }, [showCount, actualMaxShowsPerSession, isPopupOpen, lastShownTime, actualIntervalMinutes, actualInitialDelayMinutes, isEnabled])

  // Initialize session tracking
  useEffect(() => {
    const sessionStart = sessionStorage.getItem('shopSwitchSessionStart')
    if (!sessionStart) {
      sessionStorage.setItem('shopSwitchSessionStart', Date.now().toString())
    }

    // Load previous session data
    const savedShowCount = sessionStorage.getItem('shopSwitchShowCount')
    const savedLastShown = sessionStorage.getItem('shopSwitchLastShown')
    
    if (savedShowCount) {
      setShowCount(parseInt(savedShowCount))
    }
    if (savedLastShown) {
      setLastShownTime(parseInt(savedLastShown))
    }
  }, [])

  // Set up interval to check if popup should be shown
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (shouldShowPopup()) {
        setIsPopupOpen(true)
        const now = Date.now()
        setLastShownTime(now)
        setShowCount(prev => {
          const newCount = prev + 1
          sessionStorage.setItem('shopSwitchShowCount', newCount.toString())
          return newCount
        })
        sessionStorage.setItem('shopSwitchLastShown', now.toString())
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(checkInterval)
  }, [shouldShowPopup])

  const closePopup = useCallback(() => {
    setIsPopupOpen(false)
  }, [])

  const switchShop = useCallback(() => {
    const newShop = shop === "A" ? "B" : "A"
    setShop(newShop)
    setIsPopupOpen(false)
    
    // Reset counters when user switches (reward engagement)
    setShowCount(0)
    sessionStorage.setItem('shopSwitchShowCount', '0')
  }, [shop, setShop])

  // Reset session data (useful for testing or manual reset)
  const resetSession = useCallback(() => {
    setShowCount(0)
    setLastShownTime(null)
    setIsPopupOpen(false)
    sessionStorage.removeItem('shopSwitchSessionStart')
    sessionStorage.removeItem('shopSwitchShowCount')
    sessionStorage.removeItem('shopSwitchLastShown')
    sessionStorage.setItem('shopSwitchSessionStart', Date.now().toString())
  }, [])

  return {
    isPopupOpen,
    closePopup,
    switchShop,
    resetSession,
    showCount,
    canShowMore: showCount < maxShowsPerSession
  }
}
