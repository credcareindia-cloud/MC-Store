
"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Gift, X, Loader2 } from "lucide-react"
import LoginModal from "@/components/auth/login-modal"

interface OfferDiscount {
  value: string
  type: string // 'percentage' or 'cash'
}

interface DbOffer {
  id: number
  title: string
  start_date: string
  end_date: string
  offers: OfferDiscount[]
  offer_type?: string // 'percentage', 'cash', or 'mixed'
}

interface WheelOffer {
  id: number
  title: string
  discount: string
  type: string
  color: string
}

interface SpinWheelProps {
  onClose: () => void
}

const SpinWheel = ({ onClose }: SpinWheelProps) => {
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<WheelOffer | null>(null)
  const [offerCode, setOfferCode] = useState<string>("")
  const [wheelOffers, setWheelOffers] = useState<WheelOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [currentDbOffer, setCurrentDbOffer] = useState<DbOffer | null>(null)
  const [canStop, setCanStop] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [hasSpun, setHasSpun] = useState(false)
  const [hasRedeemed, setHasRedeemed] = useState(false)
  const wheelRef = useRef<HTMLDivElement>(null)
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Helper function to format offer display text
  const formatOfferTitle = (value: string, type: string): string => {
    if (value === "0") return "Again"

    if (type === "cash") {
      return `${value} AED`
    } else {
      return `${value}%`
    }
  }

  // Helper function to format offer for result display
  const formatOfferResult = (value: string, type: string): string => {
    if (value === "0") return "Try Again"

    if (type === "cash") {
      return `${value} AED OFF`
    } else {
      return `${value}% OFF`
    }
  }

  // Check user spin status on component mount
  useEffect(() => {
    const checkUserSpinStatus = () => {
      // Check if user has already spun for the current offer
      if (currentDbOffer) {
        const userSpinData = localStorage.getItem(`userSpinData_${currentDbOffer.id}`)
        if (userSpinData) {
          const spinData = JSON.parse(userSpinData)
          setHasSpun(spinData.hasSpun || false)
          setHasRedeemed(spinData.hasRedeemed || false)
          
          // If user has a saved result, restore it
          if (spinData.savedResult) {
            setResult(spinData.savedResult)
            setOfferCode(spinData.savedOfferCode || "")
          }
        }
      }
    }
    
    checkUserSpinStatus()
  }, [currentDbOffer])

  // Fetch active offers from database
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/offers/active")
        if (!response.ok) {
          throw new Error("Failed to fetch offers")
        }

        const dbOffers: DbOffer[] = await response.json()

        // Get the highest priority active offer (same ordering as coupon validation)
        const activeOffer = dbOffers[0]
        if (activeOffer) {
          let offerDiscounts: OfferDiscount[]

          // Handle both old format (percentage only) and new format (with type)
          if (typeof activeOffer.offers === "string") {
            const parsedOffers = JSON.parse(activeOffer.offers)
            // Convert old format to new format if needed
            offerDiscounts = parsedOffers.map((offer: any) => ({
              value: offer.percentage || offer.value,
              type: offer.type || "percentage",
            }))
          } else {
            // Handle direct array format
            offerDiscounts = activeOffer.offers.map((offer: any) => ({
              value: offer.percentage || offer.value,
              type: offer.type || "percentage",
            }))
          }

          // Convert to wheel format with dynamic colors
          const colors = ["#FF6B35", "#FFE4B5", "#F5E6D3", "#FFD700", "#FF4500", "#98FB98"]
          const wheelOffers: WheelOffer[] = offerDiscounts.map((discount, index) => ({
            id: index + 1,
            title: formatOfferTitle(discount.value, discount.type),
            discount: discount.value,
            type: discount.type,
            color: colors[index % colors.length],
          }))

          setWheelOffers(wheelOffers)
          setCurrentDbOffer(activeOffer)
        } else {
          setError("No active offers available at the moment")
        }
      } catch (err) {
        console.error("Error fetching offers:", err)
        setError("Failed to load offers. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchOffers()
  }, [])

  const generateOfferCode = (offer: WheelOffer): string => {
    const prefix = offer.type === "cash" ? "CASH" : "SPIN"
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix}${offer.discount}${randomSuffix}`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert("Offer code copied to clipboard!")
    } catch (err) {
      alert("Failed to copy code")
    }
  }

  // Helper function to calculate winning segment based on needle position
  const calculateWinningSegment = (rotation: number): { segment: number, offer: WheelOffer } => {
    const segmentAngle = 360 / wheelOffers.length
    const finalRotation = rotation % 360
    
    // Needle is at top (0 degrees), pointing down into the wheel
    // When wheel rotates clockwise, we need to find which segment is under the needle
    const needlePosition = (360 - finalRotation) % 360
    
    // Find which segment the needle points to
    const winningSegment = Math.floor(needlePosition / segmentAngle) % wheelOffers.length
    const winningOffer = wheelOffers[winningSegment]
    
    return { segment: winningSegment, offer: winningOffer }
  }

  const spinWheel = () => {
    if (isSpinning || wheelOffers.length === 0 || hasSpun || hasRedeemed) return

    setIsSpinning(true)
    setResult(null)
    setOfferCode("")
    setCanStop(false)

    const minRotation = 1440 // 4 full rotations minimum
    const maxRotation = 2880 // 8 full rotations maximum
    const rotation = Math.floor(Math.random() * (maxRotation - minRotation + 1)) + minRotation
    
    // Calculate winning segment using helper function
    const { segment: winningSegment, offer: winningOffer } = calculateWinningSegment(rotation)

    if (wheelRef.current) {
      wheelRef.current.style.transform = `rotate(${rotation}deg)`
    }

    setTimeout(() => {
      setCanStop(true)
    }, 1000)

    spinTimeoutRef.current = setTimeout(() => {
      setResult(winningOffer)
      setHasSpun(true)
      
      let code = ""
      if (winningOffer.discount !== "0") {
        code = generateOfferCode(winningOffer)
        setOfferCode(code)
      }
      
      // Save user spin data to localStorage per offer
      const userSpinData = {
        hasSpun: true,
        hasRedeemed: false,
        savedResult: winningOffer,
        savedOfferCode: code,
        spinTimestamp: Date.now(),
        offerId: currentDbOffer?.id
      }
      if (currentDbOffer) {
        localStorage.setItem(`userSpinData_${currentDbOffer.id}`, JSON.stringify(userSpinData))
      }
      
      setIsSpinning(false)
      setCanStop(false)
    }, 4000)
  }

  const stopWheel = () => {
    if (!canStop || !isSpinning) return

    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current)
    }

    // Get current rotation from the wheel element
    const currentTransform = wheelRef.current?.style.transform || 'rotate(0deg)'
    const currentRotationMatch = currentTransform.match(/rotate\(([^)]+)deg\)/)
    const currentRotation = currentRotationMatch ? parseFloat(currentRotationMatch[1]) : 0
    
    // Calculate winning segment using helper function
    const { segment: winningSegment, offer: winningOffer } = calculateWinningSegment(currentRotation)

    setResult(winningOffer)
    setHasSpun(true)
    
    let code = ""
    if (winningOffer.discount !== "0") {
      code = generateOfferCode(winningOffer)
      setOfferCode(code)
    }
    
    // Save user spin data to localStorage
    const userSpinData = {
      hasSpun: true,
      hasRedeemed: false,
      savedResult: winningOffer,
      savedOfferCode: code,
      spinTimestamp: Date.now()
    }
    localStorage.setItem('userSpinData', JSON.stringify(userSpinData))
    
    setIsSpinning(false)
    setCanStop(false)
  }

  const handleRedeem = () => {
    if (offerCode && result && currentDbOffer) {
      const offerData = {
        code: offerCode,
        discount: result.discount,
        type: result.type,
        title: result.title,
        offerTitle: currentDbOffer.title,
        offerId: currentDbOffer.id,
        timestamp: Date.now(),
        expiresAt: currentDbOffer.end_date,
      }
      // Save to localStorage for use in order page
      localStorage.setItem("pendingOffer", JSON.stringify(offerData))
      
      // Update user spin data to mark as redeemed
      if (currentDbOffer) {
        const userSpinData = JSON.parse(localStorage.getItem(`userSpinData_${currentDbOffer.id}`) || '{}')
        userSpinData.hasRedeemed = true
        userSpinData.redemptionTimestamp = Date.now()
        localStorage.setItem(`userSpinData_${currentDbOffer.id}`, JSON.stringify(userSpinData))
      }
      
      setHasRedeemed(true)
      
      // Show success message
      alert(`Coupon code ${offerCode} saved! You can use it during checkout.`)
    }

    setIsLoginModalOpen(true)
  }

  const generateWheelBackground = () => {
    if (wheelOffers.length === 0) return ""

    const segmentSize = 360 / wheelOffers.length
    const gradientStops = wheelOffers
      .map((offer, index) => {
        const startAngle = index * segmentSize
        const endAngle = (index + 1) * segmentSize
        return `${offer.color} ${startAngle}deg ${endAngle}deg`
      })
      .join(", ")

    return `conic-gradient(from 0deg, ${gradientStops})`
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10002] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading offers...</p>
        </div>
      </div>
    )
  }

  if (error || wheelOffers.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10002] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
          <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Active Offers</h2>
          <p className="text-gray-600 mb-6">{error || "Check back later for amazing deals!"}</p>
          <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-full">
            Close
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10002] flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg text-center relative shadow-2xl max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100 touch-manipulation"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">New user gift</h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 leading-tight">{currentDbOffer?.title || "Spin to Win"}</h2>
          <p className="text-xs sm:text-sm text-gray-600">
            {currentDbOffer?.offer_type === "mixed"
              ? "Mixed Discounts"
              : currentDbOffer?.offer_type === "cash"
                ? "Cash Discounts (AED)"
                : "Percentage Discounts"}
          </p>
          
          {/* Status Messages */}
          {hasRedeemed && (
            <div className="mt-3 sm:mt-4 relative overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg border border-green-300">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-green-500 text-sm sm:text-lg">✅</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-xs sm:text-sm mb-0.5 sm:mb-1">Reward Claimed!</h4>
                    <p className="text-green-100 text-xs leading-relaxed">You have successfully claimed your reward. Check your account for the coupon code.</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full -mr-6 sm:-mr-8 -mt-6 sm:-mt-8"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 sm:w-12 sm:h-12 bg-white/10 rounded-full -ml-4 sm:-ml-6 -mb-4 sm:-mb-6"></div>
              </div>
            </div>
          )}
          {hasSpun && !hasRedeemed && (
            <div className="mt-3 sm:mt-4 relative overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg border border-blue-300">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-blue-500 text-sm sm:text-lg">🎯</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-xs sm:text-sm mb-0.5 sm:mb-1">Ready to Claim!</h4>
                    <p className="text-blue-100 text-xs leading-relaxed">You've already spun the wheel. Your reward is waiting below - claim it now!</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full -mr-6 sm:-mr-8 -mt-6 sm:-mt-8"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 sm:w-12 sm:h-12 bg-white/10 rounded-full -ml-4 sm:-ml-6 -mb-4 sm:-mb-6"></div>
              </div>
            </div>
          )}
          {!hasSpun && !hasRedeemed && (
            <div className="mt-3 sm:mt-4 relative overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg border border-orange-300">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-sm animate-pulse flex-shrink-0">
                    <span className="text-orange-500 text-sm sm:text-lg">🎁</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-xs sm:text-sm mb-0.5 sm:mb-1">Your Lucky Spin!</h4>
                    <p className="text-orange-100 text-xs leading-relaxed">One spin per user - Make it count! Spin the wheel to win amazing discounts.</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full -mr-6 sm:-mr-8 -mt-6 sm:-mt-8"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 sm:w-12 sm:h-12 bg-white/10 rounded-full -ml-4 sm:-ml-6 -mb-4 sm:-mb-6"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
              </div>
            </div>
          )}
        </div>

        <div className="relative mb-4 sm:mb-6 flex justify-center">
          <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 z-20">
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[16px] sm:border-l-[10px] sm:border-r-[10px] sm:border-b-[20px] border-l-transparent border-r-transparent border-b-orange-400 drop-shadow-lg"></div>
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-orange-400 rounded-full -mt-1.5 sm:-mt-2 mx-auto border-2 border-white shadow-lg"></div>
          </div>

          <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-full border-2 sm:border-4 border-orange-400 shadow-2xl overflow-hidden bg-white">
            <div
              ref={wheelRef}
              className="w-full h-full rounded-full transition-transform ease-out duration-4000"
              style={{
                background: generateWheelBackground(),
                transitionDuration: isSpinning ? "4000ms" : "0ms",
              }}
            >
              {wheelOffers.map((offer, index) => {
                const segmentAngle = 360 / wheelOffers.length
                const angle = segmentAngle * index + segmentAngle / 2
                const isLightColor = offer.color === "#F5E6D3" || offer.color === "#FFE4B5" || offer.color === "#98FB98"

                return (
                  <div
                    key={offer.id}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      transform: `rotate(${angle}deg)`,
                      transformOrigin: "center",
                    }}
                  >
                    <div
                      className={`absolute font-bold text-xs sm:text-sm md:text-base transform -translate-y-20 ${
                        isLightColor ? "text-gray-800" : "text-white"
                      }`}
                      style={{
                        textShadow: isLightColor ? "none" : "1px 1px 2px rgba(0,0,0,0.7)",
                        transform: `translateY(-50px) sm:translateY(-65px) md:translateY(-75px) lg:translateY(-85px) rotate(${angle}deg)`,
                      }}
                    >
                      {offer.title}
                    </div>
                  </div>
                )
              })}
            </div>

            <Button
              onClick={spinWheel}
              disabled={isSpinning || hasSpun || hasRedeemed}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-full bg-gray-900 hover:bg-gray-800 active:bg-gray-700 text-white font-bold text-sm sm:text-base md:text-lg shadow-lg border-2 sm:border-4 border-white disabled:opacity-70 touch-manipulation transition-all duration-200"
            >
              {isSpinning ? (
                <div className="animate-spin rounded-full h-3 w-3 sm:h-5 sm:w-5 border-b-2 border-white"></div>
              ) : hasSpun || hasRedeemed ? (
                <span className="text-xs sm:text-sm">Used</span>
              ) : (
                <span className="text-sm sm:text-base font-bold">Spin</span>
              )}
            </Button>
          </div>
        </div>

        {isSpinning && (
          <Button
            onClick={stopWheel}
            disabled={!canStop}
            className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-2.5 sm:py-3 text-sm sm:text-base rounded-full mb-3 sm:mb-4 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation transition-all duration-200"
          >
            Stop
          </Button>
        )}

        {result && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg sm:rounded-xl">
            <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
              <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              <h3 className="text-base sm:text-lg font-bold text-orange-600">Congratulations!</h3>
            </div>
            <div className="mb-2 sm:mb-3">
              <div className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 leading-tight">
                You won {formatOfferResult(result.discount, result.type)}!
              </div>
              
            </div>

            {result.discount !== "0" && offerCode && (
              <div className="bg-white p-2.5 sm:p-3 rounded-lg mb-3 sm:mb-4 border border-orange-200">
                <p className="text-xs text-gray-500 mb-1">
                  Your {result.type === "cash" ? "cash discount" : "discount"} code:
                </p>
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border">
                  <code
                    className={`flex-1 font-mono font-bold text-xs sm:text-sm ${
                      result.type === "cash" ? "text-green-600" : "text-orange-600"
                    } break-all`}
                  >
                    {offerCode}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(offerCode)}
                    className={`h-7 w-7 sm:h-6 sm:w-6 p-0 touch-manipulation ${
                      result.type === "cash"
                        ? "border-green-300 text-green-600 hover:bg-green-50 active:bg-green-100"
                        : "border-orange-300 text-orange-600 hover:bg-orange-50 active:bg-orange-100"
                    }`}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                {currentDbOffer && (
                  <p className="text-red-500 text-xs mt-2">
                    Expires: {new Date(currentDbOffer.end_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={handleRedeem}
              disabled={hasRedeemed}
              className={`w-full font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded-full touch-manipulation transition-all duration-200 ${
                hasRedeemed 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : result.type === "cash" 
                    ? "bg-green-500 hover:bg-green-600 active:bg-green-700" 
                    : "bg-orange-500 hover:bg-orange-600 active:bg-orange-700"
              } text-white`}
            >
              <Gift className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              {hasRedeemed ? "Already Claimed" : "Login to Claim Reward"}
            </Button>
          </div>
        )}

      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  )
}

export default SpinWheel