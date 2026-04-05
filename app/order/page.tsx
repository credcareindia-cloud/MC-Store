"use client"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import {
  removeFromCart,
  updateQuantity,
  setOrderType,
  setCustomerInfo,
  submitOrder,
  clearCart,
  recalculateTotal,
  removeInvalidCurrencyItems,
  saveCartToAPI
} from "@/lib/store/slices/orderSlice"
import { useAuth } from "@/lib/contexts/auth-context"
import { useCurrency } from "@/lib/contexts/currency-context"
import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"
import { useLoginModal } from '@/lib/stores/useLoginModal'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Minus, Plus, Trash2, ShoppingCart, MessageSquare, CheckCircle, XCircle, AlertTriangle, Tag, MapPin, BookmarkPlus, ChevronDown } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import toast from 'react-hot-toast'
import { SITE_PHONE_PAYMENT_DISPLAY, SITE_WHATSAPP_E164_DIGITS } from "@/lib/site-contact"

const WHATSAPP_ORDER_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_ORDER_NUMBER

// Declare Razorpay global
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface OfferCouponData {
  code: string
  discount: string
  type: string
  title: string
  offerTitle: string
  offerId: number
  timestamp: number
  expiresAt: string
  // New fields for database structure
  minimumOrderValue?: number
  maximumOrderValue?: number
  minimumOrderValueAED?: number
  minimumOrderValueINR?: number
  maximumOrderValueAED?: number
  maximumOrderValueINR?: number
  usageLimitPerUser?: number
  totalUsageLimit?: number
  allowedCategories?: string[]
  excludedCategories?: string[]
  shopRestriction?: string
  userTypeRestriction?: string
}

interface WelcomeCouponData {
  id: number
  code: string
  title: string
  description: string
  discountType: "flat" | "percent"
  discountValue: number
  discountAmount: number
  minPurchase: number
  maxDiscount: number | null
  validFrom: string | null
  validTo: string | null
  userTypeRestriction: string
  message: string
  // New fields for database structure
  minimumPurchaseINR?: number
  minimumPurchaseAED?: number
  maxPurchaseINR?: number | null
  maxPurchaseAED?: number | null
}

type AppliedCouponType = 'offer' | 'welcome'

interface AppliedCoupon {
  type: AppliedCouponType
  data: OfferCouponData | WelcomeCouponData
}

export default function OrderPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { cart, total, customerInfo, loading } = useSelector((state: RootState) => state.order)
  const orderType = "delivery" // Make delivery default and required
  const { isAuthenticated, user } = useAuth()
  const { selectedCurrency, formatPriceWithSmallDecimals } = useCurrency()
  const { openModal } = useLoginModal()
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [detailedAddress, setDetailedAddress] = useState({
    street: "",
    landmark: "",
    area: "",
    city: "",
    pincode: "",
    state: "",
    country: 'India'
  })

  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [saveAddress, setSaveAddress] = useState(false)
  const [addressLabel, setAddressLabel] = useState("Home")
  const [loadingAddresses, setLoadingAddresses] = useState(false)

  const INDIAN_STATES = [
    "Kerala", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
    "Jharkhand", "Karnataka", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
    "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh",
    "Chandigarh", "Puducherry", "Lakshadweep",
    "Dadra and Nagar Haveli and Daman and Diu", "Andaman and Nicobar Islands"
  ]

  const [couponCode, setCouponCode] = useState("")
  const [isCouponFieldOpen, setIsCouponFieldOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("upi")
  const [userAvailableCoupons, setUserAvailableCoupons] = useState<string[]>([])

  useEffect(() => {
    setPaymentMethod('upi')
    setDetailedAddress(prev => ({ ...prev, country: 'India' }))
  }, [selectedCurrency])

  // Load saved addresses on mount
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const fetchAddresses = async () => {
        setLoadingAddresses(true)
        try {
          const res = await fetch("/api/user/addresses", { credentials: "include" })
          if (res.ok) {
            const data = await res.json()
            setSavedAddresses(data)
            const defaultAddr = data.find((a: any) => a.is_default)
            if (defaultAddr && !detailedAddress.street) {
              selectSavedAddress(defaultAddr)
            }
          }
        } catch (error) {
          console.error("Error fetching addresses:", error)
        } finally {
          setLoadingAddresses(false)
        }
      }
      fetchAddresses()
    }
  }, [isAuthenticated, user?.id])

  const selectSavedAddress = (addr: any) => {
    setSelectedAddressId(addr.id)
    const newAddress = {
      street: addr.street,
      landmark: addr.landmark || "",
      area: addr.area,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country || "India"
    }
    setDetailedAddress(newAddress)
    const fullAddress = `${addr.street}, ${addr.area}, ${addr.city}, ${addr.state}, ${addr.country || 'India'} - ${addr.pincode}`
    dispatch(setCustomerInfo({ info: { deliveryAddress: fullAddress.trim() }, userId: user?.id }))
  }

  const isAddressComplete = () => {
    return !!(detailedAddress.street && detailedAddress.area && detailedAddress.city && detailedAddress.state && detailedAddress.pincode)
  }

  const handleSaveAddress = async () => {
    if (!isAddressComplete()) {
      toast.error("Please fill all address fields before saving", { position: "top-center" })
      return
    }
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          label: addressLabel,
          street: detailedAddress.street,
          landmark: detailedAddress.landmark,
          area: detailedAddress.area,
          city: detailedAddress.city,
          state: detailedAddress.state,
          pincode: detailedAddress.pincode,
          country: detailedAddress.country,
          is_default: savedAddresses.length === 0
        })
      })
      if (res.ok) {
        const saved = await res.json()
        setSavedAddresses(prev => [...prev, saved])
        setSelectedAddressId(saved.id)
        setSaveAddress(false)
        toast.success("Address saved!", { position: "top-center" })
      }
    } catch (error) {
      console.error("Error saving address:", error)
      toast.error("Failed to save address", { position: "top-center" })
    }
  }

  const handleDeleteAddress = async (id: number) => {
    try {
      const res = await fetch(`/api/user/addresses?id=${id}`, {
        method: "DELETE",
        credentials: "include"
      })
      if (res.ok) {
        setSavedAddresses(prev => prev.filter(a => a.id !== id))
        if (selectedAddressId === id) {
          setSelectedAddressId(null)
        }
        toast.success("Address removed", { position: "top-center" })
      }
    } catch (error) {
      toast.error("Failed to delete address", { position: "top-center" })
    }
  }

  // Load user's available coupons on component mount
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const fetchUserCoupons = async () => {
        try {
          const res = await fetch("/api/user/coupons", {
            method: "GET",
            credentials: "include",
          })

          if (res.ok) {
            const data = await res.json()
            console.log(data)
            // Get only non-redeemed coupon codes
            const availableCouponCodes = data
              .filter((coupon: any) => !coupon.is_redeemed)
              .map((coupon: any) => coupon.code.toUpperCase())

            setUserAvailableCoupons(availableCouponCodes)
            console.log('User available coupons loaded:', availableCouponCodes)
          }
        } catch (error) {
          console.error("Error fetching user coupons:", error)
        }
      }

      fetchUserCoupons()
    }
  }, [isAuthenticated, user?.id])

  // Update full address when country or any address field changes
  useEffect(() => {
    if (detailedAddress.street || detailedAddress.area || detailedAddress.city || detailedAddress.state || detailedAddress.pincode) {
      const fullAddress = `${detailedAddress.street}, ${detailedAddress.area}, ${detailedAddress.city}, ${detailedAddress.state}, ${detailedAddress.country} - ${detailedAddress.pincode}`
      dispatch(setCustomerInfo({ info: { deliveryAddress: fullAddress.trim() }, userId: user?.id }))
    }
  }, [detailedAddress.country, detailedAddress.street, detailedAddress.area, detailedAddress.city, detailedAddress.state, detailedAddress.pincode, dispatch, user?.id])

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
  const [couponError, setCouponError] = useState("")
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(true)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const hasSelectedCurrencyPrice = (item: any, variant?: any) => {
    // If variant is provided directly, check variant prices first
    if (variant) {
      return selectedCurrency === 'AED' ? (variant.available_aed && variant.price_aed > 0) : (variant.available_inr && variant.price_inr > 0)
    }

    // Check if product has variants with pricing for selected currency
    if (item.variants && Array.isArray(item.variants) && item.variants.length > 0) {
      if (selectedCurrency === 'AED') {
        return item.variants.some((v: any) => v.available_aed && v.price_aed && v.price_aed > 0)
      } else if (selectedCurrency === 'INR') {
        return item.variants.some((v: any) => v.available_inr && v.price_inr && v.price_inr > 0)
      }
    }

    // No fallback - if variants exist but none are available, return false
    return false
  }

  const getCurrencySpecificPrice = (item: any, variant?: any) => {
    // If product has variants, use first available variant or specified variant
    if (item.variants && Array.isArray(item.variants) && item.variants.length > 0) {
      const targetVariant = variant || item.variants.find((v: any) =>
        selectedCurrency === 'AED' ? (v.available_aed && v.price_aed > 0) : (v.available_inr && v.price_inr > 0)
      ) || item.variants[0]

      if (selectedCurrency === 'AED' && targetVariant.available_aed && targetVariant.price_aed > 0) {
        // If discount price exists, use it as the selling price, otherwise use regular price
        return targetVariant.discount_aed && targetVariant.discount_aed > 0 ? targetVariant.discount_aed : targetVariant.price_aed
      } else if (selectedCurrency === 'INR' && targetVariant.available_inr && targetVariant.price_inr > 0) {
        // If discount price exists, use it as the selling price, otherwise use regular price
        return targetVariant.discount_inr && targetVariant.discount_inr > 0 ? targetVariant.discount_inr : targetVariant.price_inr
      }
    }

    // If variant is provided directly, use variant prices
    if (variant) {
      if (selectedCurrency === 'AED' && variant.available_aed) {
        // If discount price exists, use it as the selling price, otherwise use regular price
        return variant.discount_aed && variant.discount_aed > 0 ? variant.discount_aed : (variant.price_aed || 0)
      } else if (selectedCurrency === 'INR' && variant.available_inr) {
        // If discount price exists, use it as the selling price, otherwise use regular price
        return variant.discount_inr && variant.discount_inr > 0 ? variant.discount_inr : (variant.price_inr || 0)
      }
    }

    // Fallback to product-level prices
    if (selectedCurrency === 'AED' && item.available_aed) {
      // If discount price exists, use it as the selling price, otherwise use regular price
      return item.discount_aed && item.discount_aed > 0 ? item.discount_aed : (item.price_aed || 0)
    } else if (selectedCurrency === 'INR' && item.available_inr) {
      // If discount price exists, use it as the selling price, otherwise use regular price
      return item.discount_inr && item.discount_inr > 0 ? item.discount_inr : (item.price_inr || 0)
    }
    return 0
  }

  const validCartItems = cart.filter(item => {
    const isAvailable = hasSelectedCurrencyPrice(item.menuItem, item.selected_variant)
    const price = getCurrencySpecificPrice(item.menuItem, item.selected_variant)
    return isAvailable && price > 0
  })

  const invalidCartItems = cart.filter(item => {
    const isAvailable = hasSelectedCurrencyPrice(item.menuItem, item.selected_variant)
    const price = getCurrencySpecificPrice(item.menuItem, item.selected_variant)
    return !isAvailable || price <= 0
  })

  const calculateCartTotal = () => {
    return validCartItems.reduce((sum, item) => {
      const price = getCurrencySpecificPrice(item.menuItem, item.selected_variant)
      return sum + price * item.quantity
    }, 0)
  }

  useEffect(() => {
    if (cart.length > 0) {
      dispatch(recalculateTotal(selectedCurrency))

      // Mark that user has interacted with cart (after initial load)
      if (!isLoadingFromStorage) {
        setHasUserInteracted(true)
      }

      // Immediately recalculate discount to prevent negative totals
      if (appliedCoupon) {
        const cartTotal = calculateCartTotal()
        let newDiscount = 0

        if (appliedCoupon.type === 'offer') {
          const offerData = appliedCoupon.data as OfferCouponData
          if (offerData.type === "cash") {
            newDiscount = Math.min(parseFloat(offerData.discount), cartTotal)
          } else if (offerData.type === "percentage") {
            newDiscount = (cartTotal * parseFloat(offerData.discount)) / 100
          }
        } else if (appliedCoupon.type === 'welcome') {
          const welcomeData = appliedCoupon.data as WelcomeCouponData
          if (welcomeData.discountType === "flat") {
            newDiscount = Math.min(welcomeData.discountValue, cartTotal)
          } else if (welcomeData.discountType === "percent") {
            newDiscount = (cartTotal * welcomeData.discountValue) / 100
            // Apply maximum discount cap if set
            if (welcomeData.maxDiscount && welcomeData.maxDiscount > 0) {
              newDiscount = Math.min(newDiscount, welcomeData.maxDiscount)
            }
          }
        }

        // Cap discount at cart total to prevent negative values
        newDiscount = Math.min(newDiscount, cartTotal)
        setDiscountAmount(newDiscount)
      }
    }
  }, [selectedCurrency, cart, dispatch, appliedCoupon, isLoadingFromStorage])

  useEffect(() => {
    if (invalidCartItems.length > 0) {
      toast.error(`${invalidCartItems.length} item(s) are not available for delivery in India`, {
        position: 'top-center'
      })
    }
  }, [selectedCurrency, invalidCartItems.length])

  // Load saved coupon from localStorage
  useEffect(() => {
    const savedCoupon = localStorage.getItem("appliedCoupon")
    if (savedCoupon) {
      try {
        const couponData = JSON.parse(savedCoupon)

        // Check if it's an offer coupon (old format) or welcome coupon
        if (couponData.type) {
          // New format with type
          if (couponData.type === 'offer') {
            const offerData = couponData.data as OfferCouponData
            if (new Date(offerData.expiresAt) > new Date()) {
              setAppliedCoupon(couponData)
              setCouponCode(offerData.code)
              calculateDiscount(offerData, calculateCartTotal(), 'offer')
            } else {
              localStorage.removeItem("appliedCoupon")
              toast.error('Coupon has expired', { position: 'top-center' })
            }
          } else if (couponData.type === 'welcome') {
            const welcomeData = couponData.data as WelcomeCouponData
            setAppliedCoupon(couponData)
            setCouponCode(welcomeData.code)
            calculateDiscount(welcomeData, calculateCartTotal(), 'welcome')
          }
        } else {
          // Old format (offer coupon only)
          const offerData = couponData as OfferCouponData
          if (new Date(offerData.expiresAt) > new Date()) {
            setAppliedCoupon({ type: 'offer', data: offerData })
            setCouponCode(offerData.code)
            calculateDiscount(offerData, calculateCartTotal(), 'offer')
          } else {
            localStorage.removeItem("appliedCoupon")
            toast.error('Coupon has expired', { position: 'top-center' })
          }
        }
      } catch (error) {
        console.error("Error loading saved coupon:", error)
        localStorage.removeItem("appliedCoupon")
        toast.error('Failed to load saved coupon', { position: 'top-center' })
      }
    }

    // Set loading from storage to false after initial load
    setTimeout(() => {
      setIsLoadingFromStorage(false)
    }, 2000)
  }, [])

  // Auto re-validate coupon when cart changes
  useEffect(() => {
    if (appliedCoupon && !isLoadingFromStorage) {
      const timeoutId = setTimeout(async () => {
        try {
          const orderTotal = calculateCartTotal()

          // Create a local reference to avoid stale closure
          const currentAppliedCoupon = appliedCoupon

          if (currentAppliedCoupon.type === 'offer') {
            // Re-validate offer coupon
            const offerData = currentAppliedCoupon.data as OfferCouponData

            const response = await fetch('/api/offers/validate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                offerCode: offerData.code,
                orderTotal,
                currency: selectedCurrency,
                shopId: 'A',
                userType: user?.id ? "returning" : "new",
                userId: user?.id || "guest",
                cartItems: validCartItems.map((item: any) => ({
                  id: item.menuItem?.id || item.id,
                  categoryId: item.menuItem?.category_id || item.category_id || item.categoryId,
                  category_id: item.menuItem?.category_id || item.category_id || item.categoryId,
                  quantity: item.quantity,
                  price: getCurrencySpecificPrice(item.menuItem, item.selected_variant)
                }))
              })
            })

            if (!response.ok) {
              const result = await response.json()

              setAppliedCoupon(null)
              setCouponCode("")
              setDiscountAmount(0)
              setCouponError("")
              localStorage.removeItem("appliedCoupon")

              if (isLoadingFromStorage || !hasUserInteracted) {
                toast.error("Coupon removed", { position: 'top-center', duration: 3000 })
              } else {
                const currencySymbol = selectedCurrency === 'AED' ? 'AED' : '₹'
                let toastMessage = "Coupon removed: "

                if (result.error && typeof result.error === 'string') {
                  if (result.error.includes("Maximum order value")) {
                    toastMessage += `Order total exceeds the maximum allowed (${result.maxAmount} ${currencySymbol}).`
                  } else if (result.error.includes("Minimum order value")) {
                    toastMessage += `Order total is below the minimum required (${result.requiredAmount} ${currencySymbol}).`
                  } else if (result.error.includes("not valid for the products")) {
                    toastMessage += "Some items in your cart are not eligible for this offer."
                  } else if (result.error.includes("cannot be applied to some products")) {
                    toastMessage += "Some products are excluded from this offer."
                  } else if (result.error.includes("only valid for")) {
                    toastMessage += "Some products are not available in the required shop."
                  } else if (result.error.includes("already used this offer")) {
                    toastMessage += "You have already used this offer the maximum number of times."
                  } else if (result.error.includes("reached its usage limit")) {
                    toastMessage += "This offer has reached its usage limit."
                  } else {
                    toastMessage += result.error || "Cart changes made the coupon invalid."
                  }
                } else {
                  toastMessage += "Cart changes made the coupon invalid."
                }

                toast.error(toastMessage, { position: 'top-center', duration: 4000 })
              }
            } else {
              calculateDiscount(offerData, orderTotal, 'offer')
            }
          } else if (currentAppliedCoupon.type === 'welcome') {
            // Re-validate welcome coupon
            const welcomeData = currentAppliedCoupon.data as WelcomeCouponData

            if (!isAuthenticated || !user?.id) {
              // User logged out or session expired
              setAppliedCoupon(null)
              setCouponCode("")
              setDiscountAmount(0)
              setCouponError("")
              localStorage.removeItem("appliedCoupon")
              toast.error("Welcome coupons require login. Please login again.", {
                position: 'top-center',
                duration: 3000
              })
              return
            }

            console.log('Re-validating welcome coupon:', welcomeData.code)

            const response = await fetch('/api/offers/welcome-coupons-validate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                userEmail: user.email,
                couponCode: welcomeData.code,
                orderTotal,
                currency: selectedCurrency
              })
            })

            if (!response.ok) {
              const result = await response.json()

              setAppliedCoupon(null)
              setCouponCode("")
              setDiscountAmount(0)
              setCouponError("")
              localStorage.removeItem("appliedCoupon")

              if (isLoadingFromStorage || !hasUserInteracted) {
                toast.error("Coupon removed", { position: 'top-center', duration: 3000 })
              } else {
                let toastMessage = "Coupon removed: "

                if (result.error && typeof result.error === 'string') {
                  if (result.error.includes("minimum purchase")) {
                    const currencySymbol = selectedCurrency === 'AED' ? 'AED' : '₹'
                    toastMessage += `Order total is below the minimum required (${result.minAmount} ${currencySymbol}).`
                  } else if (result.error.includes("maximum purchase")) {
                    const currencySymbol = selectedCurrency === 'AED' ? 'AED' : '₹'
                    toastMessage += `Order total exceeds the maximum allowed (${result.maxAmount} ${currencySymbol}).`
                  } else if (result.error.includes("already redeemed")) {
                    toastMessage += "This  coupon has already been used."
                  } else {
                    toastMessage += result.error || "Cart changes made the coupon invalid."
                  }
                } else {
                  toastMessage += "Cart changes made the coupon invalid."
                }

                toast.error(toastMessage, { position: 'top-center', duration: 4000 })
              }
            } else {
              calculateDiscount(welcomeData, orderTotal, 'welcome')
            }
          }
        } catch (error) {
          console.error('Error re-validating coupon:', error)
          // Don't remove coupon on network errors, just recalculate discount
          if (appliedCoupon) {
            calculateDiscount(appliedCoupon.data, calculateCartTotal(), appliedCoupon.type)
          }
        }
      }, 200)

      return () => clearTimeout(timeoutId)
    }
  }, [cart.length, total, appliedCoupon, selectedCurrency, user?.id, isLoadingFromStorage, hasUserInteracted, validCartItems])

  const calculateDiscount = (couponData: OfferCouponData | WelcomeCouponData, subtotal: number, type: AppliedCouponType) => {
    let discount = 0

    if (type === 'offer') {
      const offerData = couponData as OfferCouponData
      if (offerData.type === "cash") {
        discount = Math.min(parseFloat(offerData.discount), subtotal)
      } else if (offerData.type === "percentage") {
        discount = (subtotal * parseFloat(offerData.discount)) / 100
      }
    } else if (type === 'welcome') {
      const welcomeData = couponData as WelcomeCouponData
      if (welcomeData.discountType === "flat") {
        discount = Math.min(welcomeData.discountValue, subtotal)
      } else if (welcomeData.discountType === "percent") {
        discount = (subtotal * welcomeData.discountValue) / 100
        // Apply maximum discount cap if set
        if (welcomeData.maxDiscount && welcomeData.maxDiscount > 0) {
          discount = Math.min(discount, welcomeData.maxDiscount)
        }
      }
    }

    setDiscountAmount(discount)
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code")
      toast.error('Please enter a coupon code', { position: 'top-center' })
      return
    }

    setIsApplyingCoupon(true)
    setCouponError("")

    try {
      const orderTotal = calculateCartTotal()
      const upperCaseCouponCode = couponCode.toUpperCase().trim()

      console.log('Trying to apply coupon:', upperCaseCouponCode)

      // Check if this looks like a welcome coupon (based on user's available coupons or common patterns)
      const isWelcomeCoupon = isAuthenticated && userAvailableCoupons.includes(upperCaseCouponCode)

      // Determine which endpoint to use based on coupon characteristics
      if (isAuthenticated && user?.id && isWelcomeCoupon) {
        // This looks like a welcome coupon, validate with welcome endpoint
        console.log('Validating as welcome coupon:', upperCaseCouponCode)

        try {
          const welcomeResponse = await fetch('/api/offers/welcome-coupons-validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              userEmail: user.email,
              couponCode: upperCaseCouponCode,
              orderTotal,
              currency: selectedCurrency
            })
          })

          if (welcomeResponse.ok) {
            const result = await welcomeResponse.json()

            if (result.valid && result.coupon) {
              console.log('Welcome coupon validation successful:', result.coupon.code)

              const welcomeCoupon: WelcomeCouponData = {
                id: result.coupon.id,
                code: result.coupon.code,
                title: result.coupon.title,
                description: result.coupon.description,
                discountType: result.coupon.discountType,
                discountValue: result.coupon.discountValue,
                discountAmount: result.coupon.discountAmount,
                minPurchase: result.coupon.minPurchase,
                maxDiscount: result.coupon.maxCap,
                validFrom: result.coupon.validFrom,
                validTo: result.coupon.validTo,
                userTypeRestriction: result.coupon.userTypeRestriction,
                message: result.message,
                minimumPurchaseINR: result.coupon.minimumPurchaseINR,
                minimumPurchaseAED: result.coupon.minimumPurchaseAED,
                maxPurchaseINR: result.coupon.maxPurchaseINR,
                maxPurchaseAED: result.coupon.maxPurchaseAED
              }

              setAppliedCoupon({ type: 'welcome', data: welcomeCoupon })
              setDiscountAmount(result.coupon.discountAmount)
              localStorage.setItem("appliedCoupon", JSON.stringify({
                type: 'welcome',
                data: welcomeCoupon
              }))

              toast.success(`coupon ${welcomeCoupon.code} applied! ${result.message}`, {
                position: 'top-center'
              })
              setCouponError("")
              setIsApplyingCoupon(false)
              return
            } else {
              setCouponError(result.error || "Invalid  coupon")
              toast.error(result.error || 'Invalid  coupon', { position: 'top-center', duration: 4000 })
              setIsApplyingCoupon(false)
              return
            }
          } else {
            // Welcome coupon validation failed, try regular offer validation as fallback
            console.log(' coupon validation failed, trying regular offer as fallback')
            // Continue to regular offer validation below
          }
        } catch (welcomeError) {
          console.error("Error in  coupon validation:", welcomeError)
          console.log('Welcome coupon endpoint error, trying regular offer validation')
          // Continue to regular offer validation below
        }
      }

      // For all other cases (non-authenticated, non-welcome coupons, or welcome validation failed)
      // Use regular offer validation endpoint
      console.log('Validating as regular offer coupon:', upperCaseCouponCode)

      const response = await fetch('/api/offers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerCode: upperCaseCouponCode,
          orderTotal,
          shopId: 'A',
          userType: user?.id ? "returning" : "new",
          userId: user?.id || "guest",
          currency: selectedCurrency,
          cartItems: validCartItems.map((item: any) => ({
            id: item.menuItem?.id || item.id,
            categoryId: item.menuItem?.category_id || item.category_id || item.categoryId,
            category_id: item.menuItem?.category_id || item.category_id || item.categoryId,
            quantity: item.quantity,
            price: getCurrencySpecificPrice(item.menuItem, item.selected_variant)
          }))
        })
      })

      if (!response.ok) {
        const result = await response.json()
        let errorMessage = result.error || "Invalid coupon code"

        // FALLBACK: If regular validation failed with "Invalid offer code" (or generic 400),
        // and we haven't tried welcome validation yet, try it now/
        // This handles cases where userAvailableCoupons list might be stale or incomplete.
        if (!isWelcomeCoupon && isAuthenticated && user?.id &&
          (errorMessage === "Invalid offer code" || errorMessage === "Offer code is required")) {
          console.log('Regular validation failed, attempting welcome coupon fallback for:', upperCaseCouponCode)

          try {
            const welcomeResponse = await fetch('/api/offers/welcome-coupons-validate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                userEmail: user.email,
                couponCode: upperCaseCouponCode,
                orderTotal,
                currency: selectedCurrency
              })
            })

            if (welcomeResponse.ok) {
              const welcomeResult = await welcomeResponse.json()
              if (welcomeResult.valid && welcomeResult.coupon) {
                console.log('Fallback welcome validation successful')

                const welcomeCoupon: WelcomeCouponData = {
                  id: welcomeResult.coupon.id,
                  code: welcomeResult.coupon.code,
                  title: welcomeResult.coupon.title,
                  description: welcomeResult.coupon.description,
                  discountType: welcomeResult.coupon.discountType,
                  discountValue: welcomeResult.coupon.discountValue,
                  discountAmount: welcomeResult.coupon.discountAmount,
                  minPurchase: welcomeResult.coupon.minPurchase,
                  maxDiscount: welcomeResult.coupon.maxCap,
                  validFrom: welcomeResult.coupon.validFrom,
                  validTo: welcomeResult.coupon.validTo,
                  userTypeRestriction: welcomeResult.coupon.userTypeRestriction,
                  message: welcomeResult.message,
                  minimumPurchaseINR: welcomeResult.coupon.minimumPurchaseINR,
                  minimumPurchaseAED: welcomeResult.coupon.minimumPurchaseAED,
                  maxPurchaseINR: welcomeResult.coupon.maxPurchaseINR,
                  maxPurchaseAED: welcomeResult.coupon.maxPurchaseAED
                }

                setAppliedCoupon({ type: 'welcome', data: welcomeCoupon })
                setDiscountAmount(welcomeResult.coupon.discountAmount)
                localStorage.setItem("appliedCoupon", JSON.stringify({
                  type: 'welcome',
                  data: welcomeCoupon
                }))

                toast.success(`Coupon ${welcomeCoupon.code} applied! ${welcomeResult.message}`, {
                  position: 'top-center'
                })
                setCouponError("")
                setIsApplyingCoupon(false)
                return
              }
            }
          } catch (fallbackError) {
            console.error("Fallback welcome validation error:", fallbackError)
          }
        }

        if (result.error) {
          if (result.error.includes("only valid for shop")) {
            errorMessage = "This offer does not apply to the items in your cart."
          } else if (result.error.includes("only valid for Style Shop")) {
            errorMessage = "This offer is only valid for Style Shop. Switch to Style Shop to use this offer."
          } else if (result.error.includes("new customers")) {
            errorMessage = "This offer is exclusively for new customers."
          } else if (result.error.includes("already used this offer")) {
            errorMessage = `${result.error}. Each customer can only use this offer ${result.usageLimit} time(s).`
          } else if (result.error.includes("Minimum order value")) {
            const currencySymbol = selectedCurrency === 'AED' ? 'AED' : '₹'
            const amountNeeded = (result.requiredAmount - orderTotal).toFixed(2)
            errorMessage = `${result.error}. Add ${amountNeeded} ${currencySymbol} more to your cart.`
          } else if (result.error.includes("reached its usage limit")) {
            errorMessage = "This offer has reached its usage limit."
          } else if (result.error.includes("not valid for the products")) {
            errorMessage = "Some items in your cart are not eligible for this offer."
          } else if (result.error.includes("cannot be applied to some products")) {
            errorMessage = "Some products are excluded from this offer."
          }
        }

        setCouponError(errorMessage)
        toast.error(errorMessage, { position: 'top-center', duration: 4000 })
        setIsApplyingCoupon(false)
        return
      }

      const result = await response.json()
      if (result.valid && result.offer) {
        const validCoupon: OfferCouponData = {
          code: result.offer.code,
          discount: result.offer.value,
          type: result.offer.type,
          title: result.offer.title,
          offerTitle: result.offer.title,
          offerId: result.offer.id,
          timestamp: Date.now(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          minimumOrderValue: result.offer.restrictions?.minimumOrderValue,
          maximumOrderValue: result.offer.restrictions?.maximumOrderValue,
          minimumOrderValueAED: result.offer.restrictions?.minimumOrderValueAED,
          minimumOrderValueINR: result.offer.restrictions?.minimumOrderValueINR,
          maximumOrderValueAED: result.offer.restrictions?.maximumOrderValueAED,
          maximumOrderValueINR: result.offer.restrictions?.maximumOrderValueINR,
          usageLimitPerUser: result.offer.restrictions?.usageLimitPerUser,
          totalUsageLimit: result.offer.restrictions?.totalUsageLimit,
          allowedCategories: result.offer.restrictions?.allowedCategories,
          excludedCategories: result.offer.restrictions?.excludedCategories,
          shopRestriction: result.offer.restrictions?.shopRestriction,
          userTypeRestriction: result.offer.restrictions?.userTypeRestriction
        }

        setAppliedCoupon({ type: 'offer', data: validCoupon })
        setDiscountAmount(result.offer.discountAmount)
        localStorage.setItem("appliedCoupon", JSON.stringify({
          type: 'offer',
          data: validCoupon
        }))

        toast.success(`Offer ${validCoupon.code} applied! Saved ${result.offer.discountAmount.toFixed(2)} ${selectedCurrency}`, {
          position: 'top-center'
        })
        setCouponError("")
      }
    } catch (error) {
      console.error("Error applying coupon:", error)
      setCouponError("Failed to apply coupon. Please try again.")
      toast.error('Failed to apply coupon', { position: 'top-center' })
    } finally {
      setIsApplyingCoupon(false)
    }
  }


  const handleRemoveCoupon = () => {
    if (appliedCoupon) {
      const removedCouponType = appliedCoupon.type
      const removedCouponCode = appliedCoupon.type === 'offer'
        ? (appliedCoupon.data as OfferCouponData).code
        : (appliedCoupon.data as WelcomeCouponData).code

      setAppliedCoupon(null)
      setDiscountAmount(0)
      setCouponCode("")
      setCouponError("")
      localStorage.removeItem("appliedCoupon")

      toast.success(`${removedCouponType === 'welcome' ? 'coupon' : 'Offer'} ${removedCouponCode} removed`, {
        position: 'top-center'
      })
    }
  }

  const handleQuantityChange = async (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart({ id, userId: user?.id }))
      toast.success('Item removed from cart', { position: 'top-center' })
    } else {
      dispatch(updateQuantity({ id, quantity: newQuantity, userId: user?.id }))
      toast.success('Quantity updated', { position: 'top-center' })
    }
    if (isAuthenticated && user?.id) {
      setTimeout(() => {
        dispatch(saveCartToAPI({
          userId: user.id.toString(),
          cart: validCartItems,
          selectedCurrency
        }))
      }, 500)
    }
  }

  const handleRemoveInvalidItems = async () => {
    dispatch(removeInvalidCurrencyItems({ selectedCurrency, userId: user?.id }))
    toast.success(`Removed ${invalidCartItems.length} unavailable item(s)`, { position: 'top-center' })
    if (isAuthenticated && user?.id) {
      setTimeout(() => {
        dispatch(saveCartToAPI({
          userId: user.id.toString(),
          cart: validCartItems,
          selectedCurrency
        }))
      }, 500)
    }
  }

  const clearCartAfterOrder = async () => {
    try {
      dispatch(clearCart({ userId: user?.id }))
      if (isAuthenticated && user?.id) {
        await dispatch(saveCartToAPI({
          userId: user.id.toString(),
          cart: [],
          selectedCurrency
        })).unwrap()
      }
      if (appliedCoupon) {
        const usedCoupons = JSON.parse(localStorage.getItem("usedCoupons") || "[]")
        usedCoupons.push(appliedCoupon.type === 'offer' ? (appliedCoupon.data as OfferCouponData).code : (appliedCoupon.data as WelcomeCouponData).code)
        localStorage.setItem("usedCoupons", JSON.stringify(usedCoupons))
        localStorage.removeItem("pendingOffer")
        localStorage.removeItem("appliedCoupon")
      }
      toast.success('Cart cleared successfully', { position: 'top-center' })
    } catch (error) {
      console.error("Error clearing cart:", error)
      toast.error('Failed to clear cart', { position: 'top-center' })
    }
  }

  const submitOrderAfterPayment = async (paymentId?: string, razorpayDetails?: any) => {
    const cartTotal = calculateCartTotal()
    const finalTotal = cartTotal + deliveryFee - discountAmount
    const orderData = {
      customerName: user?.name || customerInfo.name,
      customerEmail: user?.email || customerInfo.email,
      customerPhone: customerInfo.phone,
      orderType,
      paymentMethod,
      paymentId: paymentId,
      razorpayOrderId: razorpayDetails?.razorpay_order_id,
      razorpayPaymentId: razorpayDetails?.razorpay_payment_id,
      razorpaySignature: razorpayDetails?.razorpay_signature,
      paymentStatus: razorpayDetails ? 'completed' : (paymentMethod === 'cod' ? 'pending' : 'failed'),
      tableNumber: customerInfo.tableNumber,
      deliveryAddress: customerInfo.deliveryAddress,
      deliveryState: detailedAddress.state,
      totalAmount: finalTotal,
      originalAmount: cartTotal + deliveryFee,
      discountAmount: discountAmount,
      couponCode: appliedCoupon ? (appliedCoupon.type === 'offer' ? (appliedCoupon.data as OfferCouponData).code : (appliedCoupon.data as WelcomeCouponData).code) : undefined,
      couponType: appliedCoupon?.type,
      specialInstructions,
      userId: user?.id,
      currency: selectedCurrency,
      items: validCartItems.map((item) => ({
        menuItemId: item.menuItem.id,
        menuItemName: item.menuItem.name,
        variantId: item.variant_id,
        variantName: item.selected_variant?.name || 'Default',
        quantity: item.quantity,
        unitPrice: getCurrencySpecificPrice(item.menuItem, item.selected_variant).toString(),
        specialRequests: item.specialRequests,
        productImageUrl: item.menuItem.image_url || item.menuItem.image_urls?.[0] || null,
      })),
    }

    try {
      const result = await dispatch(submitOrder(orderData)).unwrap()

      // Track coupon usage ONLY after successful order placement
      if (appliedCoupon && user?.id) {
        try {
          if (appliedCoupon.type === 'offer') {
            const offerData = appliedCoupon.data as OfferCouponData
            console.log('Tracking offer usage after successful order:', offerData.code)
            await fetch('/api/offers/track-usage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                offerId: offerData.offerId,
                userId: user.id,
                userEmail: user.email,
                orderTotal: cartTotal,
                discountAmount: discountAmount,
                currency: selectedCurrency
              })
            })
          } else if (appliedCoupon.type === 'welcome') {
            const welcomeData = appliedCoupon.data as WelcomeCouponData
            console.log('Tracking  coupon usage after successful order:', welcomeData.code)
            await fetch('/api/offers/welcome-coupon-used', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                userEmail: user.email,
                couponCode: welcomeData.code,
                orderTotal: cartTotal,
                discountAmount: discountAmount,
                currency: selectedCurrency
              })
            })
          }
          console.log('Coupon usage tracked successfully')
        } catch (trackError) {
          console.error("Error tracking coupon usage after order:", trackError)
        }
      }

      // Clear coupon state immediately to prevent revalidation on empty cart
      if (appliedCoupon) {
        const removedCouponType = appliedCoupon.type
        const removedCouponCode = appliedCoupon.type === 'offer'
          ? (appliedCoupon.data as OfferCouponData).code
          : (appliedCoupon.data as WelcomeCouponData).code

        setAppliedCoupon(null)
        setCouponCode("")
        setDiscountAmount(0)
        setCouponError("")
        localStorage.removeItem("appliedCoupon")

        console.log(`Cleared ${removedCouponType} coupon: ${removedCouponCode} after successful order`)
      }

      // Auto-save address if checkbox was checked and it's a new address
      if (saveAddress && !selectedAddressId && isAddressComplete()) {
        try {
          await fetch("/api/user/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              label: addressLabel,
              street: detailedAddress.street,
              landmark: detailedAddress.landmark,
              area: detailedAddress.area,
              city: detailedAddress.city,
              state: detailedAddress.state,
              pincode: detailedAddress.pincode,
              country: detailedAddress.country,
              is_default: savedAddresses.length === 0
            })
          })
        } catch (e) {
          console.error("Failed to auto-save address:", e)
        }
      }

      await clearCartAfterOrder()
      toast.success(`Order placed successfully! Order Number: ${result.orderNumber || result.orderId}`, { position: 'top-center' })
      router.push("/orders")
    } catch (error) {
      console.error("Failed to submit order:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to place order. Please try again."
      toast.error(errorMessage, { position: 'top-center' })
      throw error
    }
  }

  const handleSubmitOrder = async () => {
    // Validation alerts without disabling button
    if (!isAuthenticated) {
      openModal()
      toast.error('Please login to place an order', { position: 'top-center' })
      return
    }
    if (validCartItems.length === 0) {
      toast.error(`No items available for ${selectedCurrency}. Please add items or switch currency.`, { position: 'top-center' })
      return
    }

    const cartTotal = calculateCartTotal()
    const minOrderAmount = selectedCurrency === 'AED' ? 20 : 100
    if (cartTotal < minOrderAmount) {
      toast.error(`Minimum order amount is ${selectedCurrency === 'AED' ? 'AED 20' : '₹100'}`, { position: 'top-center' })
      return
    }

    if (!customerInfo.phone) {
      toast.error('Phone number is required to place an order', { position: 'top-center' })
      return
    }
    if (orderType === "delivery" && !customerInfo.deliveryAddress) {
      toast.error('Delivery address is required for delivery orders', { position: 'top-center' })
      return
    }
    if (orderType === "delivery") {
      const requiredFields = [detailedAddress.street, detailedAddress.area, detailedAddress.city, detailedAddress.state]
      if (selectedCurrency === 'INR') {
        requiredFields.push(detailedAddress.pincode)
      }

      if (requiredFields.some(field => !field)) {
        const missingField = 'Please complete all required address fields including PIN code'
        toast.error(missingField, { position: 'top-center' })
        return
      }
    }
    if (paymentMethod === "upi" && selectedCurrency === 'INR') {
      try {
        setIsProcessingPayment(true)
        const razorpayResponse = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: (calculateCartTotal() + deliveryFee - discountAmount), // Convert to paise for INR
            currency: selectedCurrency,
            receipt: `order_${Date.now()}`
          }),
        })
        if (!razorpayResponse.ok) {
          throw new Error('Failed to create payment order')
        }
        const razorpayOrderResult = await razorpayResponse.json()
        const options = {
          key: razorpayOrderResult.key,
          amount: razorpayOrderResult.amount,
          currency: razorpayOrderResult.currency,
          name: "Motoclub",
          description: "Order Payment",
          order_id: razorpayOrderResult.orderId,
          handler: async (response: any) => {
            try {
              const verificationResponse = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              })
              if (!verificationResponse.ok) {
                throw new Error('Payment verification failed')
              }
              const verificationResult = await verificationResponse.json()
              if (verificationResult.success) {
                await submitOrderAfterPayment(verificationResult.paymentId, response)
              }
            } catch (error) {
              console.error("Payment verification failed:", error)
              toast.error('Payment verification failed. Please try again.', { position: 'top-center' })
            } finally {
              setIsProcessingPayment(false)
            }
          },
          prefill: {
            name: user?.name || customerInfo.name,
            email: user?.email || customerInfo.email,
            contact: customerInfo.phone,
          },
          theme: {
            color: "#18181b",
          },
          modal: {
            ondismiss: () => {
              console.log("Payment cancelled by user")
              setIsProcessingPayment(false)
              toast.error('Payment cancelled', { position: 'top-center' })
            }
          }
        }
        const razorpay = new window.Razorpay(options)
        razorpay.open()
      } catch (error) {
        console.error("Failed to create payment order:", error)
        toast.error('Failed to initiate payment. Please try again.', { position: 'top-center' })
        setIsProcessingPayment(false)
      }
    } else {
      await submitOrderAfterPayment()
    }
  }

  const handleWhatsAppOrder = () => {
    if (validCartItems.length === 0) {
      toast.error(`No items available for ${selectedCurrency}. Please add items or switch currency.`, { position: 'top-center' })
      return
    }

    const cartTotal = calculateCartTotal()
    const minOrderAmount = selectedCurrency === 'AED' ? 20 : 100
    if (cartTotal < minOrderAmount) {
      toast.error(`Minimum order amount is ${selectedCurrency === 'AED' ? 'AED 20' : '₹100'}`, { position: 'top-center' })
      return
    }

    // Validate customer information for WhatsApp orders
    const customerName = user?.name || customerInfo.name || ""
    const customerPhone = customerInfo.phone || ""
    const customerEmail = user?.email || customerInfo.email || ""

    if (!customerName || customerName.trim() === "") {
      toast.error('Please enter your name', { position: 'top-center' })
      return
    }

    if (!customerPhone || customerPhone.trim() === "") {
      toast.error('Please enter your phone number', { position: 'top-center' })
      return
    }

    const phoneRegex = /^[0-9]{10,15}$/
    if (!phoneRegex.test(customerPhone.replace(/[\s\-\(\)]/g, ''))) {
      toast.error('Please enter a valid phone number', { position: 'top-center' })
      return
    }

    if (orderType === 'delivery') {
      if (!detailedAddress.street || detailedAddress.street.trim() === "") {
        toast.error('Please enter your street address', { position: 'top-center' })
        return
      }

      if (!detailedAddress.area || detailedAddress.area.trim() === "") {
        toast.error('Please enter your area/locality', { position: 'top-center' })
        return
      }

      if (!detailedAddress.city || detailedAddress.city.trim() === "") {
        toast.error('Please enter your city', { position: 'top-center' })
        return
      }

      if (!detailedAddress.state || detailedAddress.state.trim() === "") {
        const stateLabel = 'State'
        toast.error(`Please enter your ${stateLabel}`, { position: 'top-center' })
        return
      }

      if (selectedCurrency === 'INR') {
        if (!detailedAddress.pincode || detailedAddress.pincode.trim() === "") {
          toast.error('Please enter your PIN code', { position: 'top-center' })
          return
        }
        const pinRegex = /^[0-9]{6}$/
        if (!pinRegex.test(detailedAddress.pincode)) {
          toast.error('Please enter a valid 6-digit PIN code', { position: 'top-center' })
          return
        }
      } else if (selectedCurrency === 'AED') {
        if (detailedAddress.pincode && detailedAddress.pincode.trim() !== "") {
          const postalRegex = /^[0-9]{5}$/
          if (!postalRegex.test(detailedAddress.pincode)) {
            toast.error('Please enter a valid 5-digit postal code', { position: 'top-center' })
            return
          }
        }
      }

      if (!customerInfo.deliveryAddress || customerInfo.deliveryAddress.trim() === "") {
        toast.error('Please complete your delivery address', { position: 'top-center' })
        return
      }
    }

    // WhatsApp ordering
    const finalTotal = cartTotal + deliveryFee - discountAmount
    const totalText = selectedCurrency === 'AED' ? `AED ${finalTotal.toFixed(2)}` : `₹${finalTotal.toFixed(2)}`
    const orderNumber = `#${Date.now().toString().slice(-6)}`

    let message = `*MOTOCLUB ORDER* ${orderNumber}\n`
    message += `═════════════════\n\n`

    message += `*CUSTOMER INFO*\n`
    message += `Name: ${customerName === "Customer" ? "_Please provide your name_" : customerName}\n`
    if (customerPhone) message += `Phone: ${customerPhone}\n`
    else message += `Phone: _Phone number not provided_\n`
    if (customerEmail) message += `Email: ${customerEmail}\n`
    message += `\n`

    message += `*ORDER DETAILS*\n`
    message += `Type: ${orderType === 'delivery' ? 'Delivery' : 'Pickup'}\n`
    message += `Payment: ${paymentMethod === 'upi' ? 'UPI' : 'COD'}\n`
    if (orderType === "delivery") {
      if (customerInfo.deliveryAddress) {
        message += `Address: ${customerInfo.deliveryAddress}\n`
      } else {
        message += `Address: _Delivery address not provided_\n`
      }
    }
    message += `\n`

    message += `═════════════════\n`
    message += `*ITEMS ORDERED*\n`
    validCartItems.forEach((item, index) => {
      const itemPrice = getCurrencySpecificPrice(item.menuItem, item.selected_variant)
      const variantName = item.selected_variant?.name || ''
      const itemName = item.menuItem.name
      const priceText = selectedCurrency === 'AED' ? `AED ${itemPrice.toFixed(2)}` : `Rs ${itemPrice.toFixed(2)}`

      const stockWarning = item.selected_variant && item.selected_variant.stock_quantity <= 5 ?
        (item.selected_variant.stock_quantity === 0 ? ' OUT OF STOCK' : ` ${item.selected_variant.stock_quantity} left`) : ''

      const formattedVariant = variantName && variantName !== 'Default' ? ` (${variantName})` : ''
      message += `${index + 1}. *${itemName}${formattedVariant}*\n`
      message += `    Qty: ${item.quantity} x ${priceText}${stockWarning}\n`
    })

    message += `═════════════════\n`
    message += `*BILL SUMMARY*\n`
    const subtotalText = selectedCurrency === 'AED' ? `AED ${cartTotal.toFixed(2)}` : `Rs ${cartTotal.toFixed(2)}`
    message += `Items Total: ${subtotalText}\n`

    if (deliveryFee > 0) {
      const deliveryText = selectedCurrency === 'AED' ? `AED ${deliveryFee.toFixed(2)}` : `Rs ${deliveryFee.toFixed(2)}`
      message += `Delivery: ${deliveryText}\n`
    } else if (orderType === "delivery") {
      message += `Delivery: FREE!\n`
    }

    if (discountAmount > 0 && appliedCoupon) {
      const discountText = selectedCurrency === 'AED' ? `AED ${discountAmount.toFixed(2)}` : `Rs ${discountAmount.toFixed(2)}`
      const couponCode = appliedCoupon.type === 'offer'
        ? (appliedCoupon.data as OfferCouponData).code
        : (appliedCoupon.data as WelcomeCouponData).code
      message += `Discount (${couponCode}): -${discountText}\n`
    }

    message += `═════════════════\n`
    message += `*TOTAL: ${totalText}*\n`
    message += `═════════════════\n\n`

    if (specialInstructions) {
      message += `*SPECIAL NOTES*\n${specialInstructions}\n\n`
    }

    if (paymentMethod === 'upi') {
      message += `*PAYMENT DETAILS*\n`
      message += `UPI ID: murshidkallen-2@okaxis\n`
      message += `GPay: ${SITE_PHONE_PAYMENT_DISPLAY}\n`
      message += `\n`
      message += `Please send payment screenshot after completing payment\n\n`
    }

    message += `Please *CONFIRM* this order\n`
    message += `When will this be dispatched?\n\n`
    message += `Thank you!`
    const phoneNumber = WHATSAPP_ORDER_NUMBER || SITE_WHATSAPP_E164_DIGITS

    if (!phoneNumber) {
      toast.error('WhatsApp number not configured. Please contact support.', { position: 'top-center' })
      return
    }

    const cleanPhoneNumber = phoneNumber.replace(/\D/g, "")
    const whatsappUrl = `https://wa.me/${cleanPhoneNumber}`

    const url = new URL(whatsappUrl)
    url.searchParams.set('text', message)

    try {
      window.open(url.toString(), "_blank")
      toast.success('Order sent via WhatsApp! Check your WhatsApp app.', { position: 'top-center' })
    } catch (error) {
      console.error('Failed to open WhatsApp:', error)
      try {
        const fallbackUrl = `https://wa.me/${cleanPhoneNumber}`
        window.open(fallbackUrl, "_blank")
        toast.success('WhatsApp opened! Please copy and paste your order details.', { position: 'top-center' })
      } catch (fallbackError) {
        toast.error('Failed to open WhatsApp. Please try again.', { position: 'top-center' })
      }
    }
  }

  const isKerala = detailedAddress.state.toLowerCase() === 'kerala'

  const calculateDeliveryFee = () => {
    if (orderType !== "delivery") return 0

    const cartTotal = calculateCartTotal()
    if (selectedCurrency === 'AED') {
      if (cartTotal >= 200) {
        return 0
      } else if (cartTotal >= 50) {
        return 10
      } else {
        return 20
      }
    } else {
      if (cartTotal >= 10000) return 0
      return isKerala ? 70 : 140
    }
  }

  const getDeliveryFeeMessage = () => {
    if (orderType !== "delivery") return null

    const cartTotal = calculateCartTotal()
    const currentDeliveryFee = calculateDeliveryFee()

    if (currentDeliveryFee === 0) return null

    if (selectedCurrency === 'AED') {
      if (cartTotal >= 50) {
        const amountNeeded = 200 - cartTotal
        return {
          type: 'info',
          message: `Shop for AED ${amountNeeded.toFixed(2)} more to get FREE delivery!`,
          icon: '🚚'
        }
      } else {
        const amountForReducedFee = 50 - cartTotal
        const amountForFree = 200 - cartTotal
        return {
          type: 'warning',
          message: `Shop for AED ${amountForReducedFee.toFixed(2)} more to get AED 10 off delivery or spend AED ${amountForFree.toFixed(2)} for FREE delivery!`,
          icon: '💰'
        }
      }
    } else {
      const amountNeeded = 10000 - cartTotal
      return {
        type: 'info',
        message: `Shop for ₹${amountNeeded.toFixed(0)} more to get FREE delivery! ${!isKerala ? '(Outside Kerala: ₹140)' : '(Kerala: ₹70)'}`,
        icon: '🚚'
      }
    }
  }

  const deliveryFee = calculateDeliveryFee()
  const deliveryMessage = getDeliveryFeeMessage()
  const cartTotal = calculateCartTotal()
  const subtotalWithDelivery = cartTotal + deliveryFee
  const finalTotal = subtotalWithDelivery - discountAmount

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 sm:w-24 sm:h-24 text-gray-300 mx-auto mb-4 sm:mb-6" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">Add some items from our products to get started!</p>
            <Button
              onClick={() => router.push("/products")}
              className="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-3 text-sm sm:text-base rounded-lg shadow-sm transition-colors"
              aria-label="Browse products"
            >
              Browse Products
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Your Order</h1>
          <div className="text-sm text-gray-600">
            Region: <span className="font-semibold text-gray-900">India</span>
          </div>
        </div>

        {invalidCartItems.length > 0 && (
          <Card className="mb-6 border-zinc-200 bg-zinc-50 rounded-xl shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-zinc-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-zinc-900 text-base sm:text-lg mb-2">
                    Currency Availability Notice
                  </h3>
                  <p className="text-sm sm:text-base text-zinc-700 mb-3">
                    {invalidCartItems.length} item(s) in your cart are not available for delivery in India.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {invalidCartItems.map((item) => (
                      <span key={item.menuItem.id} className="bg-zinc-100 text-zinc-900 px-2 py-1 rounded text-xs sm:text-sm">
                        {item.menuItem.name.includes(' - ') ? item.menuItem.name.split(' - ')[0] : item.menuItem.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handleRemoveInvalidItems}
                      variant="outline"
                      size="sm"
                      className="border-zinc-300 text-zinc-700 hover:bg-zinc-50 rounded-lg"
                      aria-label="Remove unavailable items"
                    >
                      Remove These Items
                    </Button>
                    <Button
                      onClick={() => router.push("/products")}
                      variant="outline"
                      size="sm"
                      className="border-zinc-300 text-zinc-700 hover:bg-zinc-50 rounded-lg"
                      aria-label="Browse more products"
                    >
                      Browse More Products
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="flex-1 space-y-6">
            {validCartItems.length > 0 && (
              <Card className="border-0 shadow-lg rounded-2xl bg-white">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    Available Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {validCartItems.map((item) => {
                    const itemPrice = getCurrencySpecificPrice(item.menuItem, item.selected_variant)
                    const variantName = item.selected_variant?.name || ''
                    const itemName = item.menuItem.name
                    const isAvailable = hasSelectedCurrencyPrice(item.menuItem, item.selected_variant)

                    if (!isAvailable || itemPrice <= 0) {
                      console.warn(`Item ${itemName} is in validCartItems but has no valid price (${itemPrice}) or availability (${isAvailable})`)
                    }

                    return (
                      <div key={item.menuItem.id} className="border rounded-xl bg-gradient-to-r from-white to-gray-50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        <div className="block sm:hidden p-4 space-y-3">
                          <div className="flex gap-3">
                            <Image
                              src={
                                item.menuItem.image_url ||
                                item.menuItem.image_urls?.[0] ||
                                `/placeholder.svg?height=80&width=80&query=${encodeURIComponent(itemName)}`
                              }
                              alt={itemName}
                              width={80}
                              height={80}
                              className="rounded-lg object-cover w-20 h-20 flex-shrink-0 shadow-sm"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-base text-gray-900 leading-tight truncate">{itemName}</h3>
                              {variantName && variantName !== 'Default' && (
                                <span className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium mt-1">
                                  {variantName}
                                </span>
                              )}
                              <div className="mt-2">
                                {isAvailable && itemPrice > 0 ? (
                                  <p className="font-bold text-lg text-gray-900">
                                    {formatPriceWithSmallDecimals(itemPrice, itemPrice, selectedCurrency, true, '#000')}
                                    <span className="text-sm text-gray-500 font-normal ml-1">per item</span>
                                  </p>
                                ) : (
                                  <p className="font-bold text-base text-red-600">
                                    Unavailable in India
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 font-medium">Qty:</span>
                              <div className="flex items-center bg-white rounded-lg border shadow-sm">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.menuItem.id, item.quantity - 1)}
                                  className="p-1.5 hover:bg-gray-100 rounded-l-lg"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center font-semibold text-sm bg-gray-50 py-1.5">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.menuItem.id, item.quantity + 1)}
                                  className="p-1.5 hover:bg-gray-100 rounded-r-lg"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-bold text-lg text-zinc-700">
                                  {formatPriceWithSmallDecimals(itemPrice * item.quantity, itemPrice * item.quantity, selectedCurrency, true, '#000')}
                                </p>
                                <p className="text-xs text-gray-500">total</p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.menuItem.id, 0)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200 p-1.5 rounded-lg"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {item.selected_variant && item.selected_variant.stock_quantity <= 5 && (
                            <div className="flex items-center gap-2 bg-zinc-50 p-2 rounded-lg mt-2">
                              <AlertTriangle className="w-4 h-4 text-zinc-600" />
                              <p className="text-sm text-zinc-700 font-medium">
                                {item.selected_variant.stock_quantity === 0 ? 'Out of Stock' : `Only ${item.selected_variant.stock_quantity} left in stock`}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="hidden sm:flex sm:items-center gap-4 p-6">
                          <Image
                            src={
                              item.menuItem.image_url ||
                              item.menuItem.image_urls?.[0] ||
                              `/placeholder.svg?height=80&width=80&query=${encodeURIComponent(itemName)}`
                            }
                            alt={itemName}
                            width={90}
                            height={90}
                            className="rounded-xl object-cover w-24 h-24 shadow-sm flex-shrink-0"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-bold text-lg text-gray-900 leading-tight">{itemName}</h3>
                                {variantName && variantName !== 'Default' && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                      {variantName}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                {isAvailable && itemPrice > 0 ? (
                                  <>
                                    <p className="font-bold text-lg text-gray-900">
                                      {formatPriceWithSmallDecimals(itemPrice, itemPrice, selectedCurrency, true, '#000')}
                                    </p>
                                    <p className="text-sm text-gray-500">per item</p>
                                  </>
                                ) : (
                                  <>
                                    <p className="font-bold text-lg text-red-600">
                                      Unavailable
                                    </p>
                                    <p className="text-sm text-red-500">in India</p>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600 font-medium">Quantity:</span>
                                <div className="flex items-center gap-2 bg-white rounded-lg border shadow-sm">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleQuantityChange(item.menuItem.id, item.quantity - 1)}
                                    className="p-2 hover:bg-gray-100 rounded-l-lg"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <span className="w-12 text-center font-semibold text-lg bg-gray-50 py-1">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleQuantityChange(item.menuItem.id, item.quantity + 1)}
                                    className="p-2 hover:bg-gray-100 rounded-r-lg"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="font-bold text-xl text-zinc-700">
                                    {formatPriceWithSmallDecimals(itemPrice * item.quantity, itemPrice * item.quantity, selectedCurrency, true, '#000')}
                                  </p>
                                  <p className="text-sm text-gray-500">total</p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.menuItem.id, 0)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200 p-2 rounded-lg"
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {item.selected_variant && item.selected_variant.stock_quantity <= 5 && (
                              <div className="flex items-center gap-2 bg-zinc-50 p-2 rounded-lg">
                                <AlertTriangle className="w-4 h-4 text-zinc-600" />
                                <p className="text-sm text-zinc-700 font-medium">
                                  {item.selected_variant.stock_quantity === 0 ? 'Out of Stock' : `Only ${item.selected_variant.stock_quantity} left in stock`}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            {invalidCartItems.length > 0 && (
              <Card className="opacity-60 border-0 shadow-lg rounded-2xl bg-white">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-500">
                    Unavailable in {selectedCurrency}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {invalidCartItems.map((item) => {
                    const itemName = item.menuItem.name
                    const variantName = item.selected_variant?.name || ''
                    return (
                      <div key={item.menuItem.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 border-2 border-red-200 rounded-xl bg-gradient-to-r from-zinc-50 to-zinc-100">
                        <Image
                          src={
                            item.menuItem.image_url ||
                            item.menuItem.image_urls?.[0] ||
                            `/placeholder.svg?height=80&width=80&query=${encodeURIComponent(itemName)}`
                          }
                          alt={itemName}
                          width={90}
                          height={90}
                          className="rounded-xl object-cover w-20 h-20 sm:w-24 sm:h-24 grayscale opacity-70"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-base sm:text-lg text-gray-700">{itemName}</h3>
                          {variantName && variantName !== 'Default' && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-medium">
                                {variantName}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-red-600 bg-red-100 px-3 py-1 rounded-full">
                              <XCircle className="w-4 h-4" />
                              Unavailable in India
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            This variant is not available in your selected region
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-sm font-medium">Qty: {item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(item.menuItem.id, 0)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-lg"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            <Card className="border-0 shadow-lg rounded-2xl bg-white">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="grid grid-cols-1 gap-4"
                >
                  {selectedCurrency === 'INR' && (
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="text-sm sm:text-base cursor-pointer">
                        UPI Payment
                      </Label>
                    </div>
                  )}
                </RadioGroup>
                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    UPI payment (Razorpay) for orders in India
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg rounded-2xl bg-white">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isAuthenticated && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-700">
                      Logged in as: <strong>{user?.name || user?.email}</strong>
                    </p>
                    {userAvailableCoupons.length > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        You have {userAvailableCoupons.length} active coupon{userAvailableCoupons.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm sm:text-base">Full Name *</Label>
                    <Input
                      id="name"
                      value={user?.name || customerInfo.name}
                      onChange={(e) => dispatch(setCustomerInfo({ info: { name: e.target.value }, userId: user?.id }))}
                      disabled={!!user?.name}
                      required
                      className="text-sm sm:text-base rounded-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm sm:text-base">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => dispatch(setCustomerInfo({ info: { phone: e.target.value }, userId: user?.id }))}
                      required
                      className="text-sm sm:text-base rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm sm:text-base">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || customerInfo.email}
                    onChange={(e) => dispatch(setCustomerInfo({ info: { email: e.target.value }, userId: user?.id }))}
                    disabled={!!user?.email}
                    className="text-sm sm:text-base rounded-lg"
                  />
                </div>
                {orderType === "delivery" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Delivery Address *
                      </h3>
                    </div>

                    {/* Saved Addresses */}
                    {isAuthenticated && savedAddresses.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Saved Addresses</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {savedAddresses.map((addr) => (
                            <div
                              key={addr.id}
                              onClick={() => selectSavedAddress(addr)}
                              className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedAddressId === addr.id
                                  ? "border-zinc-900 bg-zinc-50"
                                  : "border-gray-200 hover:border-gray-300 bg-white"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
                                      {addr.label}
                                    </span>
                                    {addr.is_default && (
                                      <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded">Default</span>
                                    )}
                                    {addr.state?.toLowerCase() === 'kerala' && (
                                      <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Kerala - ₹70</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-800 truncate">
                                    {addr.street}, {addr.area}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {addr.city}, {addr.state} - {addr.pincode}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.id) }}
                                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              setSelectedAddressId(null)
                              setDetailedAddress({ street: "", landmark: "", area: "", city: "", pincode: "", state: "", country: "India" })
                              dispatch(setCustomerInfo({ info: { deliveryAddress: "" }, userId: user?.id }))
                            }}
                            className="text-sm text-zinc-600 hover:text-zinc-900 font-medium py-2 flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" /> Use a new address
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Address Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="street" className="text-sm font-medium text-gray-700">
                          Street Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="street"
                          value={detailedAddress.street}
                          onChange={(e) => {
                            setSelectedAddressId(null)
                            setDetailedAddress(prev => ({ ...prev, street: e.target.value }))
                            const fullAddress = `${e.target.value}, ${detailedAddress.area}, ${detailedAddress.city}, ${detailedAddress.state}, ${detailedAddress.country} - ${detailedAddress.pincode}`
                            dispatch(setCustomerInfo({ info: { deliveryAddress: fullAddress.trim() }, userId: user?.id }))
                          }}
                          required
                          className={`text-sm rounded-lg placeholder:text-gray-300 placeholder:italic ${detailedAddress.street ? 'border-green-300 bg-green-50/30' : 'border-gray-200'}`}
                          placeholder="e.g. 12/A, Rose Apartments, MG Road"
                        />
                      </div>
                      <div>
                        <Label htmlFor="landmark" className="text-sm font-medium text-gray-400">
                          Landmark <span className="text-xs font-normal">(optional)</span>
                        </Label>
                        <Input
                          id="landmark"
                          value={detailedAddress.landmark}
                          onChange={(e) => setDetailedAddress(prev => ({ ...prev, landmark: e.target.value }))}
                          className={`text-sm rounded-lg placeholder:text-gray-300 placeholder:italic ${detailedAddress.landmark ? 'border-green-300 bg-green-50/30' : 'border-gray-200'}`}
                          placeholder="e.g. Near City Mall"
                        />
                      </div>
                      <div>
                        <Label htmlFor="area" className="text-sm font-medium text-gray-700">
                          Area / Locality <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="area"
                          value={detailedAddress.area}
                          onChange={(e) => {
                            setSelectedAddressId(null)
                            setDetailedAddress(prev => ({ ...prev, area: e.target.value }))
                            const fullAddress = `${detailedAddress.street}, ${e.target.value}, ${detailedAddress.city}, ${detailedAddress.state}, ${detailedAddress.country} - ${detailedAddress.pincode}`
                            dispatch(setCustomerInfo({ info: { deliveryAddress: fullAddress.trim() }, userId: user?.id }))
                          }}
                          required
                          className={`text-sm rounded-lg placeholder:text-gray-300 placeholder:italic ${detailedAddress.area ? 'border-green-300 bg-green-50/30' : 'border-gray-200'}`}
                          placeholder="e.g. Edappally, Andheri West"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                          City <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="city"
                          value={detailedAddress.city}
                          onChange={(e) => {
                            setSelectedAddressId(null)
                            setDetailedAddress(prev => ({ ...prev, city: e.target.value }))
                            const fullAddress = `${detailedAddress.street}, ${detailedAddress.area}, ${e.target.value}, ${detailedAddress.state}, ${detailedAddress.country} - ${detailedAddress.pincode}`
                            dispatch(setCustomerInfo({ info: { deliveryAddress: fullAddress.trim() }, userId: user?.id }))
                          }}
                          required
                          className={`text-sm rounded-lg placeholder:text-gray-300 placeholder:italic ${detailedAddress.city ? 'border-green-300 bg-green-50/30' : 'border-gray-200'}`}
                          placeholder="e.g. Kochi"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                          State <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <select
                            id="state"
                            value={detailedAddress.state}
                            onChange={(e) => {
                              setSelectedAddressId(null)
                              setDetailedAddress(prev => ({ ...prev, state: e.target.value }))
                              const fullAddress = `${detailedAddress.street}, ${detailedAddress.area}, ${detailedAddress.city}, ${e.target.value}, ${detailedAddress.country} - ${detailedAddress.pincode}`
                              dispatch(setCustomerInfo({ info: { deliveryAddress: fullAddress.trim() }, userId: user?.id }))
                            }}
                            required
                            className={`w-full h-10 px-3 text-sm rounded-lg border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                              detailedAddress.state
                                ? 'border-green-300 bg-green-50/30 text-gray-900'
                                : 'border-gray-200 bg-background text-gray-400 italic'
                            }`}
                          >
                            <option value="" className="text-gray-400 italic">Select your state</option>
                            {INDIAN_STATES.map((s) => (
                              <option key={s} value={s} className="text-gray-900 not-italic">{s}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        {detailedAddress.state && (
                          <p className={`text-xs mt-1 ${detailedAddress.state.toLowerCase() === 'kerala' ? 'text-green-600' : 'text-amber-600'}`}>
                            {detailedAddress.state.toLowerCase() === 'kerala'
                              ? 'Delivery: ₹70 (Kerala) — Free above ₹10,000'
                              : 'Delivery: ₹140 (Outside Kerala) — Free above ₹10,000'}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="pincode" className="text-sm font-medium text-gray-700">
                          PIN Code <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="pincode"
                          value={detailedAddress.pincode}
                          onChange={(e) => {
                            setSelectedAddressId(null)
                            setDetailedAddress(prev => ({ ...prev, pincode: e.target.value }))
                            const fullAddress = `${detailedAddress.street}, ${detailedAddress.area}, ${detailedAddress.city}, ${detailedAddress.state}, ${detailedAddress.country} - ${e.target.value}`
                            dispatch(setCustomerInfo({ info: { deliveryAddress: fullAddress.trim() }, userId: user?.id }))
                          }}
                          required
                          className={`text-sm rounded-lg placeholder:text-gray-300 placeholder:italic ${detailedAddress.pincode ? 'border-green-300 bg-green-50/30' : 'border-gray-200'}`}
                          placeholder="e.g. 682024"
                          pattern="[0-9]{6}"
                          maxLength={6}
                        />
                      </div>
                    </div>

                    {/* Address Preview */}
                    {isAddressComplete() && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <Label className="text-sm font-medium text-green-800">Delivery Address</Label>
                        </div>
                        <p className="text-sm text-green-700">{customerInfo.deliveryAddress}</p>
                      </div>
                    )}

                    {/* Save Address Option */}
                    {isAuthenticated && !selectedAddressId && detailedAddress.street && detailedAddress.state && (
                      <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={saveAddress}
                            onChange={(e) => setSaveAddress(e.target.checked)}
                            className="rounded border-gray-300 text-zinc-900 focus:ring-zinc-500"
                          />
                          <BookmarkPlus className="w-4 h-4 text-zinc-600" />
                          Save this address for next time
                        </label>
                        {saveAddress && (
                          <div className="flex items-center gap-2">
                            <select
                              value={addressLabel}
                              onChange={(e) => setAddressLabel(e.target.value)}
                              className="text-xs px-2 py-1 rounded border border-zinc-300 bg-white"
                            >
                              <option value="Home">Home</option>
                              <option value="Work">Work</option>
                              <option value="Other">Other</option>
                            </select>
                            <Button
                              type="button"
                              onClick={handleSaveAddress}
                              size="sm"
                              className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs px-3 py-1 h-7"
                            >
                              Save
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="w-full lg:w-80 xl:w-96">
            <Card className="sticky top-4 sm:top-6 border-0 shadow-lg rounded-2xl bg-white">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Order Summary ({selectedCurrency})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {validCartItems.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {validCartItems.map((item) => {
                        const itemPrice = getCurrencySpecificPrice(item.menuItem, item.selected_variant)
                        const variantName = item.selected_variant?.name || ''
                        const itemName = item.menuItem.name
                        return (
                          <div key={item.menuItem.id} className="flex justify-between items-start gap-2 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="bg-zinc-100 text-zinc-900 text-xs font-bold px-2 py-1 rounded-full">
                                  {item.quantity}x
                                </span>
                                <span className="font-semibold text-gray-900 text-sm leading-tight">
                                  {itemName}
                                </span>
                              </div>
                              {variantName && variantName !== 'Default' && (
                                <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded ml-8 w-fit">
                                  {variantName}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm text-gray-900">
                                {formatPriceWithSmallDecimals(itemPrice * item.quantity, itemPrice * item.quantity, selectedCurrency, true, '#000')}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatPriceWithSmallDecimals(itemPrice, itemPrice, selectedCurrency, true, '#000')} each
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="border-t pt-4 space-y-2">
                      {(selectedCurrency === 'AED' && cartTotal < 20) || (selectedCurrency === 'INR' && cartTotal < 100) ? (
                        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-zinc-600" />
                            <p className="text-sm text-zinc-700">
                              Minimum order: {selectedCurrency === 'AED' ? 'AED 20' : '₹100'}
                            </p>
                          </div>
                        </div>
                      ) : orderType === "delivery" && deliveryFee === 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <p className="text-sm text-green-700">
                              🎉 You qualify for free delivery!
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between text-sm sm:text-base">
                        <span>Subtotal</span>
                        <span>{formatPriceWithSmallDecimals(cartTotal, cartTotal, selectedCurrency, true, '#000')}</span>
                      </div>
                      {orderType === "delivery" && (
                        <div className="flex justify-between text-sm sm:text-base">
                          <span className="flex items-center gap-2">
                            Delivery Fee
                            {deliveryFee === 0 && (
                              <span className="text-green-600 font-medium text-xs bg-green-100 px-2 py-1 rounded-full">
                                FREE! 🎉
                              </span>
                            )}
                          </span>
                          <span className={deliveryFee === 0 ? "text-green-600 font-bold" : ""}>
                            {deliveryFee === 0 ? "FREE" : formatPriceWithSmallDecimals(deliveryFee, deliveryFee, selectedCurrency, true, '#000')}
                          </span>
                        </div>
                      )}
                      {deliveryMessage && (
                        <div className={`p-3 rounded-lg text-sm ${deliveryMessage.type === 'success'
                          ? 'bg-green-50 border border-green-200 text-green-800'
                          : deliveryMessage.type === 'info'
                            ? 'bg-blue-50 border border-blue-200 text-blue-800'
                            : 'bg-zinc-50 border border-zinc-200 text-zinc-900'
                          }`}>
                          <div className="flex items-start gap-2">
                            <span className="text-lg">{deliveryMessage.icon}</span>
                            <span className="flex-1">{deliveryMessage.message}</span>
                          </div>
                        </div>
                      )}
                      {appliedCoupon && discountAmount > 0 && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <Tag className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <span className="font-bold text-green-800 text-sm">
                                  {appliedCoupon.type === 'welcome' ? 'Coupon' : 'Offer'} Applied
                                </span>
                                <div className="text-xs text-green-600 font-mono">
                                  {appliedCoupon.type === 'offer'
                                    ? (appliedCoupon.data as OfferCouponData).code
                                    : (appliedCoupon.data as WelcomeCouponData).code}
                                </div>
                              </div>
                            </div>
                            <Button
                              onClick={handleRemoveCoupon}
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-red-600 hover:bg-red-50 rounded-full p-1.5 h-auto transition-colors"
                              aria-label="Remove coupon"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="bg-white/60 rounded-lg p-3 mb-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-green-700 font-medium">
                                {appliedCoupon.type === 'offer'
                                  ? (appliedCoupon.data as OfferCouponData).title
                                  : (appliedCoupon.data as WelcomeCouponData).title}
                              </span>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                                APPLIED
                              </span>
                            </div>
                            {appliedCoupon.type === 'welcome' && (
                              <div className="text-xs text-green-600 mt-1">
                                {(appliedCoupon.data as WelcomeCouponData).discountType === 'flat'
                                  ? `${selectedCurrency} ${(appliedCoupon.data as WelcomeCouponData).discountValue} off`
                                  : `${(appliedCoupon.data as WelcomeCouponData).discountValue}% off`
                                }
                              </div>
                            )}
                          </div>

                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Original Amount</span>
                              <span className="font-medium text-gray-900">
                                {formatPriceWithSmallDecimals(subtotalWithDelivery, subtotalWithDelivery, selectedCurrency, true, '#111827')}
                              </span>
                            </div>

                            <div className="flex justify-between items-center border-t border-green-100 pt-2">
                              <span className="text-green-700">Discount Applied</span>
                              <span className="font-bold text-green-600">
                                -{formatPriceWithSmallDecimals(discountAmount, discountAmount, selectedCurrency, true, '#059669')}
                              </span>
                            </div>

                            <div className="flex justify-between items-center border-t-2 border-green-200 pt-2 bg-green-100/50 rounded-lg px-3 py-2 -mx-1">
                              <span className="font-bold text-green-800">You Pay</span>
                              <span className="font-bold text-lg text-green-800">
                                {formatPriceWithSmallDecimals(finalTotal, finalTotal, selectedCurrency, true, '#166534')}
                              </span>
                            </div>

                            <div className="text-center pt-2 border-t border-green-200">
                              <div className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                                <span>🎉</span>
                                <span>You saved {formatPriceWithSmallDecimals(discountAmount, discountAmount, selectedCurrency, true, '#ffffff')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-base sm:text-lg border-t pt-2">
                        <span>Final Total</span>
                        <div className="text-right">
                          <div className={`${appliedCoupon && discountAmount > 0 ? 'text-green-600' : 'text-gray-900'} font-bold`}>
                            {formatPriceWithSmallDecimals(finalTotal, finalTotal, selectedCurrency, true, appliedCoupon && discountAmount > 0 ? '#059669' : '#000')}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {!appliedCoupon ? (
                          <>
                            <Button
                              onClick={() => setIsCouponFieldOpen(!isCouponFieldOpen)}
                              variant="outline"
                              className="w-full text-zinc-600 border-zinc-400 hover:bg-zinc-50 rounded-lg text-sm sm:text-base"
                              aria-label={isCouponFieldOpen ? "Hide coupon field" : "Show coupon field"}
                            >
                              {isCouponFieldOpen ? "Hide Coupon Field" : "Redeem Offer"}
                            </Button>
                            {isCouponFieldOpen && (
                              <div className="space-y-2">
                                <Label htmlFor="coupon" className="text-sm sm:text-base">Enter Coupon Code</Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    id="coupon"
                                    value={couponCode}
                                    onChange={(e) => {
                                      setCouponCode(e.target.value)
                                      setCouponError("")
                                    }}
                                    placeholder="Enter coupon code"
                                    className={`text-sm sm:text-base rounded-lg ${couponError ? "border-red-500" : ""}`}
                                  />
                                  <Button
                                    onClick={handleApplyCoupon}
                                    disabled={!couponCode.trim() || isApplyingCoupon}
                                    className="bg-zinc-900 hover:bg-zinc-800 text-white text-sm sm:text-base px-3 sm:px-4 rounded-lg"
                                    aria-label="Apply coupon"
                                  >
                                    {isApplyingCoupon ? "Applying..." : "Apply"}
                                  </Button>
                                </div>
                                {couponError && (
                                  <div className="flex items-center gap-1 text-red-500 text-xs sm:text-sm">
                                    <XCircle className="w-4 h-4" />
                                    <span>{couponError}</span>
                                  </div>
                                )}
                                {!isAuthenticated && (
                                  <div className="text-xs text-zinc-600 bg-zinc-50 p-2 rounded-lg">
                                    💡 Login to use your exclusive coupons and welcome offers!
                                  </div>
                                )}
                                {/* {isAuthenticated && userAvailableCoupons.length > 0 && (
                                  <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg">
                                    💎 You have {userAvailableCoupons.length} active coupon{userAvailableCoupons.length !== 1 ? 's' : ''} available
                                  </div>
                                )} */}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <div>
                                  <div className="font-medium text-green-800 text-sm sm:text-base">
                                    {appliedCoupon.type === 'welcome' ? 'Coupon' : 'Offer'} Applied!
                                  </div>
                                  <div className="text-xs sm:text-sm text-green-600">
                                    {appliedCoupon.type === 'offer'
                                      ? (appliedCoupon.data as OfferCouponData).code
                                      : (appliedCoupon.data as WelcomeCouponData).code} -
                                    {appliedCoupon.type === 'offer'
                                      ? (appliedCoupon.data as OfferCouponData).title
                                      : (appliedCoupon.data as WelcomeCouponData).title}
                                  </div>
                                  {appliedCoupon.type === 'welcome' && (
                                    <div className="text-xs text-green-500 mt-1">
                                      {(appliedCoupon.data as WelcomeCouponData).discountType === 'flat'
                                        ? `Flat ${selectedCurrency} ${(appliedCoupon.data as WelcomeCouponData).discountValue} off`
                                        : `${(appliedCoupon.data as WelcomeCouponData).discountValue}% off`
                                      }
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button
                                onClick={handleRemoveCoupon}
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                                aria-label="Remove coupon"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {paymentMethod === "cod" ? (
                        <Button
                          onClick={handleSubmitOrder}
                          disabled={loading || isProcessingPayment}
                          className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-sm sm:text-base py-3 rounded-lg shadow-sm transition-colors"
                          aria-label="Place order"
                        >
                          {loading ? "Processing..." : isAuthenticated ? "Place Order" : "Login to Place Order"}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSubmitOrder}
                          disabled={loading || isProcessingPayment}
                          className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-sm sm:text-base py-3 rounded-lg shadow-sm transition-colors"
                          aria-label="Pay now"
                        >
                          {isProcessingPayment ? "Processing Payment..." :
                            loading ? "Processing..." :
                              isAuthenticated ? (
                                <>
                                  Pay {formatPriceWithSmallDecimals(finalTotal, finalTotal, selectedCurrency, true, '#fff')}
                                </>
                              ) : "Login to Pay"}
                        </Button>
                      )}

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-gray-500">Or</span>
                        </div>
                      </div>

                      <Button
                        onClick={handleWhatsAppOrder}
                        variant="outline"
                        className="w-full border-green-500 text-green-600 hover:bg-green-50 bg-transparent text-sm sm:text-base py-3 rounded-lg"
                        disabled={validCartItems.length === 0}
                        aria-label="Order via WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Order via WhatsApp
                      </Button>

                      {orderType === "delivery" && (
                        <div className="text-xs text-gray-500 text-center mt-2">
                          💡 For WhatsApp orders, you can provide address details in the chat
                        </div>
                      )}

                      <Button
                        onClick={() => {
                          dispatch(clearCart({ userId: user?.id }))
                          toast.success('Cart cleared', { position: 'top-center' })
                        }}
                        variant="outline"
                        className="w-full text-sm sm:text-base py-3 rounded-lg border-gray-300 hover:bg-gray-100"
                        aria-label="Clear cart"
                      >
                        Clear Cart
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4 text-sm sm:text-base">No items available in {selectedCurrency}</p>
                    <Button
                      onClick={() => router.push("/products")}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white text-sm sm:text-base rounded-xl"
                      aria-label="Browse products"
                    >
                      Browse Products
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

