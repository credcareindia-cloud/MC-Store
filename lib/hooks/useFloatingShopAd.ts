import { useState, useEffect, useCallback } from 'react'
import { useShop } from '@/lib/contexts/shop-context'

interface UseFloatingShopAdOptions {
  showAfterScrollPixels?: number // Show after scrolling X pixels
  displayDurationMinutes?: number // How long to show the ad (in minutes)
  cooldownMinutes?: number // Cooldown before showing again (in minutes)
  maxShowsPerSession?: number // Maximum times to show per session
}

interface ShopFeaturesSettings {
  floating_ad_enabled: string
  floating_ad_scroll_trigger: string
  floating_ad_duration: string
  floating_ad_cooldown: string
  floating_ad_max_shows: string
}

export function useFloatingShopAd({
  showAfterScrollPixels = 400, // Show after scrolling 400px
  displayDurationMinutes = 2, // Show for 2 minutes
  cooldownMinutes = 4, // 4 minute cooldown
  maxShowsPerSession = 3 // Max 3 times per session
}: UseFloatingShopAdOptions = {}) {
  const [isAdVisible, setIsAdVisible] = useState(false)
  const [showCount, setShowCount] = useState(0)
  const [lastShownTime, setLastShownTime] = useState<number | null>(null)
  const [adStartTime, setAdStartTime] = useState<number | null>(null)
  const [hasScrolledEnough, setHasScrolledEnough] = useState(false)
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
  const actualScrollTrigger = settings ? parseInt(settings.floating_ad_scroll_trigger) : showAfterScrollPixels
  const actualDisplayDuration = settings ? parseInt(settings.floating_ad_duration) : displayDurationMinutes
  const actualCooldownMinutes = settings ? parseInt(settings.floating_ad_cooldown) : cooldownMinutes
  const actualMaxShowsPerSession = settings ? parseInt(settings.floating_ad_max_shows) : maxShowsPerSession
  const isEnabled = settings ? settings.floating_ad_enabled === 'true' : false

  // Clear session storage and close ad when disabled
  useEffect(() => {
    if (settings && !isEnabled) {
      setIsAdVisible(false)
      setAdStartTime(null)
      setShowCount(0)
      setLastShownTime(null)
      setHasScrolledEnough(false)
      sessionStorage.removeItem('floatingAdSessionStart')
      sessionStorage.removeItem('floatingAdShowCount')
      sessionStorage.removeItem('floatingAdLastShown')
    }
  }, [isEnabled, settings])

  // Check if we should show the ad
  const shouldShowAd = useCallback(() => {
    const now = Date.now()
    
    // Don't show if disabled in admin settings
    if (!isEnabled) {
      return false
    }
    
    // Don't show if we've reached max shows
    if (showCount >= actualMaxShowsPerSession) {
      return false
    }

    // Don't show if ad is already visible
    if (isAdVisible) {
      return false
    }

    // Must have scrolled enough
    if (!hasScrolledEnough) {
      return false
    }

    // Check cooldown period
    if (lastShownTime) {
      const timeSinceLastShow = now - lastShownTime
      const cooldownMs = actualCooldownMinutes * 60 * 1000
      return timeSinceLastShow >= cooldownMs
    }

    return true
  }, [showCount, actualMaxShowsPerSession, isAdVisible, hasScrolledEnough, lastShownTime, actualCooldownMinutes, isEnabled])

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= actualScrollTrigger) {
        setHasScrolledEnough(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [actualScrollTrigger, hasScrolledEnough])

  // Initialize session tracking
  useEffect(() => {
    const sessionStart = sessionStorage.getItem('floatingAdSessionStart')
    if (!sessionStart) {
      sessionStorage.setItem('floatingAdSessionStart', Date.now().toString())
    }

    // Load previous session data
    const savedShowCount = sessionStorage.getItem('floatingAdShowCount')
    const savedLastShown = sessionStorage.getItem('floatingAdLastShown')
    
    if (savedShowCount) {
      setShowCount(parseInt(savedShowCount))
    }
    if (savedLastShown) {
      setLastShownTime(parseInt(savedLastShown))
    }
  }, [])

  // Check if ad should be shown
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (shouldShowAd()) {
        const now = Date.now()
        setIsAdVisible(true)
        setAdStartTime(now)
        setLastShownTime(now)
        setShowCount(prev => {
          const newCount = prev + 1
          sessionStorage.setItem('floatingAdShowCount', newCount.toString())
          return newCount
        })
        sessionStorage.setItem('floatingAdLastShown', now.toString())
      }
    }, 2000) // Check every 2 seconds

    return () => clearInterval(checkInterval)
  }, [shouldShowAd])

  // Auto-hide ad after display duration
  useEffect(() => {
    if (isAdVisible && adStartTime) {
      const hideTimer = setTimeout(() => {
        setIsAdVisible(false)
        setAdStartTime(null)
      }, actualDisplayDuration * 60 * 1000)

      return () => clearTimeout(hideTimer)
    }
  }, [isAdVisible, adStartTime, actualDisplayDuration])

  const closeAd = useCallback(() => {
    setIsAdVisible(false)
    setAdStartTime(null)
  }, [])

  const switchShop = useCallback(() => {
    const newShop = shop === "A" ? "B" : "A"
    setShop(newShop)
    setIsAdVisible(false)
    setAdStartTime(null)
    
    // Reset counters when user switches (reward engagement)
    setShowCount(0)
    sessionStorage.setItem('floatingAdShowCount', '0')
  }, [shop, setShop])

  // Reset session data (useful for testing)
  const resetSession = useCallback(() => {
    setShowCount(0)
    setLastShownTime(null)
    setIsAdVisible(false)
    setAdStartTime(null)
    setHasScrolledEnough(false)
    sessionStorage.removeItem('floatingAdSessionStart')
    sessionStorage.removeItem('floatingAdShowCount')
    sessionStorage.removeItem('floatingAdLastShown')
    sessionStorage.setItem('floatingAdSessionStart', Date.now().toString())
  }, [])

  return {
    isAdVisible,
    closeAd,
    switchShop,
    resetSession,
    showCount,
    canShowMore: showCount < maxShowsPerSession,
    hasScrolledEnough
  }
}
