"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/ui/navbar"
import { useLoginModal } from '@/lib/stores/useLoginModal'
import Footer from "@/components/ui/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Clock, CheckCircle, XCircle, Truck, ChefHat, Package, Send, Box, ChevronDown, ChevronUp, ExternalLink, PackageCheck, Zap, MapPin, Home, RotateCcw, Star } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/lib/contexts/auth-context"
import { format } from "path"
import { Button } from "@/components/ui/button"
import { isOrderEligibleForReturn, isItemEligibleForReturn } from "@/lib/utils/return-eligibility"
import { ReturnStatusBadge } from "@/components/returns/return-status-badge"
import { ReturnRequestModal } from "@/components/returns/return-request-modal"
import { ViewReturnModal, ReturnRequestDetails } from "@/components/returns/view-return-modal"

function formatCurrency(value: unknown, _currency?: string) {
  const num = typeof value === "number" ? value : Number.parseFloat(String(value ?? 0))
  return `₹${num.toFixed(2)}`
}

function formatMoney(value: unknown) {
  const num = typeof value === "number" ? value : Number.parseFloat(String(value ?? 0))
  return num.toFixed(2)
}

// Timeline component for order status matching Accounting ERP delivery statuses
const OrderTimeline = ({ currentStatus }: { currentStatus: string }) => {
  const timelineSteps = [
    { 
      status: 'paid', 
      label: 'Order Placed',
      description: 'Order received',
      icon: CheckCircle,
    },
    { 
      status: 'packed', 
      label: 'Packed',
      description: 'Items packed',
      icon: Package,
    },
    { 
      status: 'sent', 
      label: 'Sent',
      description: 'Package shipped',
      icon: Send,
    },
    { 
      status: 'shipping', 
      label: 'Out for Delivery',
      description: 'On the way to you',
      icon: Truck,
    },
    { 
      status: 'delivered', 
      label: 'Delivered',
      description: 'Order delivered',
      icon: Home,
    }
  ]

  const s = (currentStatus || '').toLowerCase()

  // Handle cancelled / failed / returned status
  if (s === 'cancel' || s === 'cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3">
          <XCircle className="w-6 h-6 text-red-500" />
          <div>
            <p className="font-semibold text-red-800">Order Cancelled</p>
            <p className="text-sm text-red-600">This order has been cancelled</p>
          </div>
        </div>
      </div>
    )
  }

  if (s === 'returned') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-amber-600" />
          <div>
            <p className="font-semibold text-amber-900">Order Returned</p>
            <p className="text-sm text-amber-700">This package has been marked as returned</p>
          </div>
        </div>
      </div>
    )
  }

  if (s === 'failed') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3">
          <XCircle className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-semibold text-red-900">Delivery Failed</p>
            <p className="text-sm text-red-700">Delivery attempt failed. Please contact customer support.</p>
          </div>
        </div>
      </div>
    )
  }

  const getCurrentStepIndex = () => {
    if (s === 'paid' || s === 'pending' || s === 'order placed' || s === 'order received' || s === 'confirmed') return 0
    if (s === 'packed') return 1
    if (s === 'sent' || s === 'dispatched' || s === 'shipped') return 2
    if (s === 'shipping' || s === 'out for delivery') return 3
    if (s === 'delivered' || s === 'completed') return 4
    return 0
  }

  const currentStepIndex = getCurrentStepIndex()
  const progressPercent = (currentStepIndex / (timelineSteps.length - 1)) * 100

  return (
    <div className="bg-gradient-to-b from-emerald-50/40 to-zinc-50/80 border border-emerald-100 rounded-xl p-4 sm:p-5 mb-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-zinc-900 text-sm sm:text-base flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          Order progress
        </h4>
        <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200">
          {timelineSteps[currentStepIndex]?.label || 'Order Placed'}
        </span>
      </div>
      
      {/* Mobile Timeline - Vertical */}
      <div className="md:hidden">
        <div className="space-y-4">
          {timelineSteps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = index <= currentStepIndex
            
            return (
              <div key={step.status} className="flex items-center gap-3.5">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                  ${isCompleted 
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                    : 'bg-white border-gray-200 text-gray-400'
                  }
                `}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${
                    isCompleted ? 'text-emerald-900' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                  <p className={`text-xs ${
                    isCompleted ? 'text-emerald-700 font-medium' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
                {isCompleted && (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Desktop Timeline - Horizontal */}
      <div className="hidden md:block px-4 py-2">
        <div className="flex items-center justify-between relative">
          {/* Progress Bar Track & Fill */}
          <div className="absolute top-4 left-6 right-6 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-600 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {timelineSteps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = index <= currentStepIndex
            
            return (
              <div key={step.status} className="flex flex-col items-center relative z-10">
                <div className={`
                  w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isCompleted 
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200/50' 
                    : 'bg-white border-gray-300 text-gray-400'
                  }
                `}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="text-center mt-2.5">
                  <p className={`text-xs font-semibold ${
                    isCompleted ? 'text-emerald-950 font-bold' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                  <p className={`text-[11px] mt-0.5 ${
                    isCompleted ? 'text-emerald-700 font-medium' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Current Status Description Footer */}
      <div className="mt-4 pt-3 border-t border-emerald-100/80">
        <p className="text-xs sm:text-sm text-center text-zinc-700">
          <span className="font-medium text-zinc-500">Current Status:</span>{' '}
          <span className="font-bold text-emerald-800">
            {timelineSteps[currentStepIndex]?.description || 'Order received'}
          </span>
        </p>
      </div>
    </div>
  )
}

interface OrderItem {
  id: number
  menu_item_id: number
  menu_item_name: string
  quantity: number
  unit_price: number | string
  total_price: number | string
  product_image_url?: string
  variant_name?: string
}

interface Order {
  id: number
  order_number: string
  status: string
  order_type: string
  customer_name: string
  payment_method: string
  total_amount: number | string
  delivery_fee: number | string
  final_total: number | string
  special_instructions: string
  currency: string
  tracking_url?: string
  tracking_id?: string
  created_at: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [returnRequests, setReturnRequests] = useState<ReturnRequestDetails[]>([])
  const [activeReturnModalOrder, setActiveReturnModalOrder] = useState<Order | null>(null)
  const [activeViewReturn, setActiveViewReturn] = useState<ReturnRequestDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set())
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const { openModal } = useLoginModal()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      openModal()
    }
  }, [isAuthenticated, authLoading, router])

  const [activeReviewItem, setActiveReviewItem] = useState<{
    product_id: number
    order_id: number
    product_name: string
    product_image_url?: string
  } | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState("")
  const [reviewHoverRating, setReviewHoverRating] = useState(0)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [pendingReviews, setPendingReviews] = useState<any[]>([])

  const fetchPendingReviews = async () => {
    try {
      const res = await fetch("/api/reviews/pending")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setPendingReviews(data)
        }
      }
    } catch (err) {
      console.error("Failed to fetch pending reviews:", err)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserOrders()
      fetchPendingReviews()
    }
  }, [isAuthenticated, user])

  const toggleOrderExpansion = (orderId: number) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  const isOrderCollapsible = (status: string) => {
    const collapsibleStatuses = ['delivered', 'cancelled', 'cancel', 'completed']
    return collapsibleStatuses.includes(status.toLowerCase())
  }

  const isOrderExpanded = (orderId: number) => {
    return expandedOrders.has(orderId)
  }

  const fetchUserOrders = async () => {
    try {
      setError(null)
      const response = await fetch("/api/orders")
      
      if (response.status === 401) {
        router.push("/products")
        return
      }
      
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch orders")
        setOrders([])
      }

      // Fetch customer return requests
      try {
        const returnsRes = await fetch("/api/returns")
        if (returnsRes.ok) {
          const returnsData = await returnsRes.json()
          setReturnRequests(returnsData)
        }
      } catch (rErr) {
        console.error("Error fetching returns:", rErr)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      setError("Network error while fetching orders")
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  
  const getDisplayStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Order Received"
      case "confirmed":
        return "Confirmed"
      case "packed":
        return "Packed"
      case "dispatched":
        return "Dispatched"
      case "out for delivery":
        return "Out for Delivery"
      case "delivered":
      case "completed":
        return "Delivered"
      case "cancelled":
      case "cancel":
        return "Cancelled"
      // case "preparing":
      //   return "Preparing"
      // case "ready":
      //   return "Ready"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase()
    if (s === "cancelled" || s === "cancel") {
      return "bg-zinc-200 text-zinc-800 border border-zinc-300"
    }
    return "bg-zinc-100 text-zinc-800 border border-zinc-200"
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <CheckCircle className="w-4 h-4 text-zinc-600" />
      case "confirmed":
        return <Zap className="w-4 h-4 text-zinc-600" />
      case "packed":
        return <PackageCheck className="w-4 h-4 text-zinc-600" />
      case "dispatched":
        return <Send className="w-4 h-4 text-zinc-600" />
      case "out for delivery":
        return <Truck className="w-4 h-4 text-zinc-600" />
      case "delivered":
      case "completed":
        return <Home className="w-4 h-4 text-zinc-700" />
      case "cancelled":
      case "cancel":
        return <XCircle className="w-4 h-4 text-zinc-600" />
      default:
        return <Clock className="w-4 h-4 text-zinc-500" />
    }
  }

  const getStatusDescription = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "We have received your order and it is being processed."
      case "confirmed":
        return "Your order has been confirmed and is moving forward."
      case "packed":
        return "Your order has been packed and sealed."
      case "dispatched":
        return "Your order has left our facility."
      case "out for delivery":
        return "Your order is on the way to you."
      case "delivered":
      case "completed":
        return "Your order has been delivered."
      case "cancelled":
      case "cancel":
        return "This order has been cancelled."
      default:
        return "Order status update."
    }
  }

  // Show loading while checking authentication
  if (authLoading || (!isAuthenticated && loading)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      {/* <section className="relative h-64 bg-black flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="/placeholder.svg?height=400&width=1200"
            alt="Orders Background"
            fill
            className="object-cover opacity-50"
          />
        </div>
        <div className="relative z-10 text-center">
          <h1 className="font-playfair text-5xl font-bold text-white mb-4">My Orders</h1>
          <p className="text-xl text-gray-200">Track your order history and current status</p>
        </div>
      </section> */}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            {user?.name ? `${user.name}'s Orders` : 'Your Orders'}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">Real-time updates on your orders</p>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm sm:text-base text-red-800">{error}</p>
            <button
              onClick={fetchUserOrders}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {orders.length === 0 && !error ? (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
              <button
                onClick={() => router.push("/products")}
                className="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Start Shopping
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {orders.map((order) => {
              const isCollapsible = isOrderCollapsible(order.status)
              const isExpanded = isOrderExpanded(order.id)
              const shouldShowContent = !isCollapsible || isExpanded

              const activeReturnItemsForOrder = returnRequests
                .filter((r) => Number(r.order_id) === Number(order.id) && r.status.toLowerCase() !== 'cancelled')
                .flatMap((r) => {
                  const rawItems = Array.isArray(r.items) ? r.items : typeof r.items === 'string' ? JSON.parse(r.items || '[]') : []
                  return rawItems.map((i: any) => ({
                    order_item_id: i.order_item_id || i.id,
                    quantity: i.quantity,
                    status: r.status
                  }))
                })

              const isDeliveredOrder = ['delivered', 'completed'].includes((order.status || '').toLowerCase())
              const allItemsRequested = order.items && order.items.length > 0 && order.items.every(
                (item) => !isItemEligibleForReturn(item, activeReturnItemsForOrder).canReturn
              )
              const activeOrderReturn = returnRequests.find((r) => Number(r.order_id) === Number(order.id) && r.status.toLowerCase() !== 'cancelled')
              const hasActiveOrderReturn = !!activeOrderReturn

              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  <CardHeader
                    className={`p-4 sm:p-6 ${isCollapsible ? "cursor-pointer hover:bg-gray-50" : ""}`}
                    onClick={isCollapsible ? () => toggleOrderExpansion(order.id) : undefined}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg lg:text-xl">Order {order.order_number}</CardTitle>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                            Customer: <span className="font-medium">{order.customer_name}</span>
                          </p>
                        </div>
                        {isCollapsible && (
                          <div className="ml-2">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-wrap">
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-base sm:text-lg lg:text-xl">
                            {formatCurrency(order.final_total || order.total_amount, order.currency)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(order.status)} text-xs sm:text-sm px-2 py-1 cursor-pointer`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{getDisplayStatus(order.status)}</span>
                        </Badge>
                        {isDeliveredOrder && (() => {
                          if (hasActiveOrderReturn || allItemsRequested) {
                            const statusLower = (activeOrderReturn?.status || 'pending').toLowerCase()

                            if (statusLower === 'approved' || statusLower === 'completed') {
                              return (
                                <Button
                                  disabled
                                  className="bg-emerald-50 border border-emerald-300 text-emerald-800 font-semibold text-xs px-3 py-1.5 h-auto cursor-not-allowed gap-1.5 shadow-none opacity-95"
                                >
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  Returned
                                </Button>
                              )
                            }

                            if (statusLower === 'rejected') {
                              return (
                                <Button
                                  disabled
                                  className="bg-rose-50 border border-rose-300 text-rose-800 font-semibold text-xs px-3 py-1.5 h-auto cursor-not-allowed gap-1.5 shadow-none opacity-95"
                                >
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                  Return Rejected
                                </Button>
                              )
                            }

                            return (
                              <Button
                                disabled
                                className="bg-amber-50 border border-amber-300 text-amber-800 font-semibold text-xs px-3 py-1.5 h-auto cursor-not-allowed gap-1.5 shadow-none opacity-95"
                              >
                                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                Return Requested
                              </Button>
                            )
                          }

                          if (isOrderEligibleForReturn(order).canReturn) {
                            return (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setActiveReturnModalOrder(order)
                                }}
                                className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs px-3 py-1.5 h-auto transition-colors gap-1.5 shadow-sm"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Request Return
                              </Button>
                            )
                          }

                          return null
                        })()}
                      </div>
                    </div>
                    {isCollapsible && !isExpanded && (
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <p className="text-xs sm:text-sm text-gray-600">Click to expand details • {order.items?.length || 0} item(s)</p>
                      </div>
                    )}
                    {shouldShowContent && (
                      <div className="text-xs sm:text-sm text-gray-600 mt-3 pt-2 border-t border-gray-100">
                        <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="font-medium">{order.payment_method}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>Placed on {new Date(order.created_at).toLocaleDateString()}</span>
                          <span className="hidden sm:inline">at</span>
                          <span className="text-gray-500">
                            {new Date(order.created_at).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </p>
                      </div>
                    )}
                  </CardHeader>
                  {shouldShowContent && (
                    <CardContent className="p-4 sm:p-6 pt-0">
                  {/* Order Timeline */}
                  <OrderTimeline currentStatus={order.status} />

                  {/* Tracking Information */}
                  {(order.tracking_url || order.tracking_id) && order.status !== 'cancel' && (
                    <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 sm:p-4 mb-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start sm:items-center gap-3">
                          <Package className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-600 mt-0.5 sm:mt-0 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-zinc-900 text-sm sm:text-base">Track shipment</h4>
                            <p className="text-xs sm:text-sm text-zinc-600">Use your carrier link or tracking ID below</p>
                          </div>
                        </div>

                        {/* Tracking Details */}
                        <div className="space-y-2 pl-7 sm:pl-8">
                          {order.tracking_id && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                              <span className="text-xs sm:text-sm font-medium text-zinc-700">Tracking ID</span>
                              <div className="bg-white text-zinc-900 border border-zinc-200 px-2 py-1 rounded font-mono text-xs sm:text-sm font-semibold">
                                {order.tracking_id}
                              </div>
                            </div>
                          )}

                          {order.tracking_url && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <span className="text-xs sm:text-sm font-medium text-zinc-700">Carrier link</span>
                              <a
                                href={order.tracking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-lg transition-colors font-medium text-xs sm:text-sm w-fit"
                              >
                                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="whitespace-nowrap">Track Package</span>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <h4 className="font-semibold text-gray-800 text-base sm:text-lg">Order Items</h4>
                    <div className="grid gap-2 sm:gap-3">
                      {order.items?.map((item) => {
                        const itemElig = isItemEligibleForReturn(item, activeReturnItemsForOrder)
                        const itemActiveReturn = returnRequests.find(
                          (r) =>
                            Number(r.order_id) === Number(order.id) &&
                            r.status.toLowerCase() !== 'cancelled' &&
                            (Array.isArray(r.items) ? r.items : typeof r.items === 'string' ? JSON.parse(r.items || '[]') : []).some(
                              (ri: any) => Number(ri.order_item_id || ri.id) === Number(item.id)
                            )
                        )

                        return (
                          <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                            {/* Product Image */}
                            <div className="flex-shrink-0 self-start sm:self-center">
                              {item.product_image_url ? (
                                <Image
                                  src={item.product_image_url}
                                  alt={item.menu_item_name}
                                  width={80}
                                  height={80}
                                  className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 object-cover rounded-lg shadow-sm"
                                />
                              ) : (
                                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-zinc-100 border border-zinc-200 rounded-lg flex items-center justify-center">
                                  <Box className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-zinc-500" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0 w-full">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg leading-tight">
                                    {item.menu_item_name}
                                  </h5>
                                  {item.variant_name && item.variant_name !== 'Default' && (
                                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                      Variant: {item.variant_name}
                                    </p>
                                  )}
                                  <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className="bg-zinc-100 text-zinc-800 border border-zinc-200 text-xs font-medium px-2 py-1 rounded-full">
                                      Qty: {item.quantity}
                                    </span>
                                    <span className="text-xs sm:text-sm text-gray-600">
                                      {formatCurrency(item.unit_price, order.currency)} each
                                    </span>
                                  </div>
                                </div>
                                <div className="text-left sm:text-right sm:ml-4 mt-2 sm:mt-0 flex-shrink-0">
                                  <p className="font-semibold text-base sm:text-lg lg:text-xl text-zinc-900">
                                    {formatCurrency(item.total_price, order.currency)}
                                  </p>
                                  <p className="text-xs text-gray-500">total</p>
                                  {isDeliveredOrder && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {(() => {
                                        if (!itemElig.canReturn || itemActiveReturn) {
                                          const statusLower = (itemActiveReturn?.status || 'pending').toLowerCase()

                                          if (statusLower === 'approved' || statusLower === 'completed') {
                                            return (
                                              <Button
                                                disabled
                                                variant="outline"
                                                size="sm"
                                                className="bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold text-xs py-1 px-2.5 h-auto cursor-not-allowed opacity-95"
                                              >
                                                <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" />
                                                Returned
                                              </Button>
                                            )
                                          }

                                          if (statusLower === 'rejected') {
                                            return (
                                              <Button
                                                disabled
                                                variant="outline"
                                                size="sm"
                                                className="mt-2 bg-rose-50 border-rose-300 text-rose-800 font-semibold text-xs py-1 px-2.5 h-auto cursor-not-allowed opacity-95"
                                              >
                                                <XCircle className="w-3 h-3 mr-1 text-rose-600" />
                                                Return Rejected
                                              </Button>
                                            )
                                          }

                                          return (
                                            <Button
                                              disabled
                                              variant="outline"
                                              size="sm"
                                              className="bg-amber-50 border-amber-300 text-amber-800 font-semibold text-xs py-1 px-2.5 h-auto cursor-not-allowed opacity-95"
                                            >
                                              <Clock className="w-3 h-3 mr-1 text-amber-600 animate-pulse" />
                                              Return Requested
                                            </Button>
                                          )
                                        }

                                        return (
                                          <Button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setActiveReturnModalOrder(order)
                                            }}
                                            variant="outline"
                                            size="sm"
                                            className="border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white font-semibold text-xs py-1 px-2.5 h-auto transition-colors"
                                          >
                                            <RotateCcw className="w-3 h-3 mr-1" />
                                            Request Return
                                          </Button>
                                        )
                                      })()}

                                      {(() => {
                                        const isPendingReview = pendingReviews.some(
                                          (pr) => pr.product_id === item.menu_item_id && pr.order_id === order.id
                                        )
                                        if (isPendingReview) {
                                          return (
                                            <Button
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                setReviewRating(5)
                                                setReviewText("")
                                                setActiveReviewItem({
                                                  product_id: item.menu_item_id,
                                                  order_id: order.id,
                                                  product_name: item.menu_item_name,
                                                  product_image_url: item.product_image_url
                                                })
                                              }}
                                              variant="outline"
                                              size="sm"
                                              className="border-red-600 text-red-600 hover:bg-red-50 font-semibold text-xs py-1 px-2.5 h-auto transition-colors"
                                            >
                                              <Star className="w-3 h-3 mr-1 fill-red-600 text-red-600" />
                                              Write a Review
                                            </Button>
                                          )
                                        }
                                        return (
                                          <Button
                                            disabled
                                            variant="outline"
                                            size="sm"
                                            className="bg-gray-50 border-gray-200 text-gray-400 font-semibold text-xs py-1 px-2.5 h-auto cursor-not-allowed opacity-75"
                                          >
                                            <Star className="w-3 h-3 mr-1 fill-gray-300 text-gray-300" />
                                            Reviewed
                                          </Button>
                                        )
                                      })()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-3 sm:pt-4">
                    <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 sm:p-4">
                      <h5 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Order Summary</h5>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>{formatCurrency(order.items.reduce((sum, item) => sum + Number(item.total_price), 0), order.currency)}</span>
                        </div>
                        {Number(order.delivery_fee) > 0 ? (
                          <div className="flex justify-between">
                            <span>Delivery Fee</span>
                            <span>{formatCurrency(order.delivery_fee, order.currency)}</span>
                          </div>
                        ) : order.order_type === 'delivery' && (
                          <div className="flex justify-between text-zinc-700">
                            <span>Delivery Fee</span>
                            <span className="font-medium">Free</span>
                          </div>
                        )}
                        {(order as any).discount_amount && Number((order as any).discount_amount) > 0 && (
                          <div className="flex justify-between text-zinc-700">
                            <span>Coupon discount {(order as any).coupon_code ? `(${(order as any).coupon_code})` : ""}</span>
                            <span className="font-semibold">-{formatCurrency((order as any).discount_amount, order.currency)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold text-sm sm:text-base border-t border-zinc-200 pt-2 text-zinc-900">
                          <span>Total Amount</span>
                          <span>{formatCurrency(order.final_total || order.total_amount, order.currency)}</span>
                        </div>
                      </div>
                    </div>
                  </div>



                  {/* Existing Return Requests & Request Return Action */}
                  {(() => {
                    const orderReturns = returnRequests.filter((r) => Number(r.order_id) === Number(order.id))
                    const eligibility = isOrderEligibleForReturn(order, user?.id, user?.email)

                    return (
                      <div className="space-y-3 mb-4">
                        {/* Display existing return requests for this order */}
                        {orderReturns.map((ret) => (
                          <div
                            key={ret.id}
                            className="bg-amber-50/60 border border-amber-200/90 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0 text-amber-800">
                                <RotateCcw className="w-4.5 h-4.5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-zinc-900 text-sm">Return Request</span>
                                  <ReturnStatusBadge status={ret.status} />
                                </div>
                                <p className="text-xs text-zinc-600 mt-0.5">
                                  Ref: <span className="font-mono text-zinc-800 font-medium">{ret.ecommerce_return_request_id}</span> • Requested {new Date(ret.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveViewReturn(ret)}
                              className="text-xs bg-white hover:bg-amber-100 border-amber-300 font-medium w-full sm:w-auto"
                            >
                              View Return Request
                            </Button>
                          </div>
                        ))}

                        {/* Request Return Button for Eligible Orders */}
                        {eligibility.canReturn && (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                            <div className="text-xs text-zinc-600">
                              <span className="font-semibold text-zinc-900">Eligible for Return</span>
                              {eligibility.remainingWindowDays !== undefined && (
                                <span className="ml-1 text-zinc-500">
                                  ({eligibility.remainingWindowDays} day{eligibility.remainingWindowDays !== 1 ? 's' : ''} left in return window)
                                </span>
                              )}
                            </div>
                            <Button
                              onClick={() => setActiveReturnModalOrder(order)}
                              variant="outline"
                              className="border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white font-semibold text-xs py-1.5 px-3.5 h-auto transition-colors w-full sm:w-auto"
                            >
                              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                              Request Return
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {order.special_instructions && (
                    <div className="mt-3 sm:mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs sm:text-sm">
                        <strong>Special Instructions:</strong> {order.special_instructions}
                      </p>
                    </div>
                  )}
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Return Request Submission Modal */}
      <ReturnRequestModal
        isOpen={!!activeReturnModalOrder}
        onClose={() => setActiveReturnModalOrder(null)}
        order={activeReturnModalOrder}
        existingReturnItems={
          activeReturnModalOrder
            ? returnRequests
                .filter((r) => Number(r.order_id) === Number(activeReturnModalOrder.id))
                .flatMap((r) =>
                  r.items.map((i: any) => ({
                    order_item_id: i.order_item_id || i.id,
                    quantity: i.quantity,
                    status: r.status
                  }))
                )
            : []
        }
        onSuccess={fetchUserOrders}
      />

      {/* View Return Request Details Modal */}
      <ViewReturnModal
        isOpen={!!activeViewReturn}
        onClose={() => setActiveViewReturn(null)}
        returnRequest={activeViewReturn}
        onStatusChange={fetchUserOrders}
      />

      {/* Review & Rating Modal */}
      {activeReviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Share Your Feedback</h3>
              <button 
                type="button"
                onClick={() => setActiveReviewItem(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-50"
                aria-label="Close modal"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <form 
              onSubmit={async (e) => {
                e.preventDefault()
                setSubmittingReview(true)
                try {
                  const res = await fetch("/api/reviews", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      productId: activeReviewItem.product_id,
                      orderId: activeReviewItem.order_id,
                      rating: reviewRating,
                      review: reviewText,
                    }),
                  })
                  if (res.ok) {
                    setActiveReviewItem(null)
                    setReviewText("")
                    setReviewRating(5)
                    fetchPendingReviews()
                  } else {
                    const err = await res.json()
                    alert(err.error || "Failed to submit review")
                  }
                } catch (err) {
                  console.error(err)
                  alert("Something went wrong.")
                } finally {
                  setSubmittingReview(false)
                }
              }} 
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
              <div className="text-center text-sm text-gray-500 text-gray-500">
                You recently received this item. How was your experience?
              </div>

              {/* Product details */}
              <div className="flex items-center gap-4 bg-stone-50 p-3 rounded-xl border border-gray-200">
                <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0 border border-gray-200">
                  <Image
                    src={activeReviewItem.product_image_url || "/placeholder.svg"}
                    alt={activeReviewItem.product_name}
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-gray-900 truncate uppercase text-gray-900">
                    {activeReviewItem.product_name}
                  </h4>
                  <p className="text-xs text-gray-400">Order Ref: #{activeReviewItem.order_id}</p>
                </div>
              </div>

              {/* Star selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 text-center text-gray-700">
                  Your Rating
                </label>
                <div className="flex justify-center items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isSelected = star <= (reviewHoverRating || reviewRating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setReviewHoverRating(star)}
                        onMouseLeave={() => setReviewHoverRating(0)}
                        className="p-1 transition-transform active:scale-95 text-gray-300"
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star 
                          className={`w-10 h-10 transition-colors ${
                            isSelected 
                              ? "fill-red-600 text-red-600" 
                              : "text-gray-300"
                          }`} 
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Review text field */}
              <div className="space-y-2">
                <label htmlFor="review-text" className="block text-xs font-bold uppercase tracking-wider text-gray-700 text-gray-700">
                  Write a Review
                </label>
                <textarea
                  id="review-text"
                  required
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tell us about the quality, shipping, or overall experience..."
                  className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 placeholder-gray-400 bg-white text-gray-900"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveReviewItem(null)}
                  disabled={submittingReview}
                  className="flex-1 py-3 text-sm font-semibold rounded-xl text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-3 text-sm font-bold uppercase tracking-wider bg-red-600 text-white rounded-xl hover:bg-red-700"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}