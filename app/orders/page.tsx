"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/ui/navbar"
import { useLoginModal } from '@/lib/stores/useLoginModal'
import Footer from "@/components/ui/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Clock, CheckCircle, XCircle, Truck, ChefHat, Package, Send, Box, ChevronDown, ChevronUp, ExternalLink, PackageCheck, Zap, MapPin, Home } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/lib/contexts/auth-context"
import { format } from "path"

function formatCurrency(value: unknown, currency: string = 'AED') {
  const num = typeof value === "number" ? value : Number.parseFloat(String(value ?? 0))
  const formattedNum = num.toFixed(2)

  if (currency === 'AED') {
    return `AED ${formattedNum}`
  } else if (currency === 'INR') {
    return `₹${formattedNum}`
  }
  return `${formattedNum} ${currency}`
}

function formatMoney(value: unknown) {
  const num = typeof value === "number" ? value : Number.parseFloat(String(value ?? 0))
  return num.toFixed(2)
}

// Timeline component for order status
const OrderTimeline = ({ currentStatus }: { currentStatus: string }) => {
  const timelineSteps = [
    { 
      status: 'pending', 
      label: 'Order Placed',
      description: 'Order received',
      icon: Clock,
      color: 'text-gray-500'
    },
    { 
      status: 'confirmed', 
      label: 'Confirmed',
      description: 'Order confirmed',
      icon: CheckCircle,
      color: 'text-blue-500'
    },
    { 
      status: 'packed', 
      label: 'Packed',
      description: 'Items packed',
      icon: Package,
      color: 'text-purple-500'
    },
    { 
      status: 'dispatched', 
      label: 'Shipped',
      description: 'Package shipped',
      icon: Send,
      color: 'text-orange-500'
    },
    { 
      status: 'out for delivery', 
      label: 'Out for Delivery',
      description: 'On the way to you',
      icon: Truck,
      color: 'text-indigo-500'
    },
    { 
      status: 'delivered', 
      label: 'Delivered',
      description: 'Order delivered',
      icon: CheckCircle,
      color: 'text-green-500'
    }
  ]

  // Handle cancelled status separately
  if (currentStatus.toLowerCase() === 'cancel' || currentStatus.toLowerCase() === 'cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
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

  const getCurrentStepIndex = () => {
    const index = timelineSteps.findIndex(step => 
      step.status.toLowerCase() === currentStatus.toLowerCase()
    )
    return index >= 0 ? index : 0
  }

  const currentStepIndex = getCurrentStepIndex()

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
      <h4 className="font-semibold text-gray-800 mb-3 text-sm">Order Progress</h4>
      
      {/* Mobile Timeline - Vertical */}
      <div className="md:hidden">
        <div className="space-y-3">
          {timelineSteps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = index <= currentStepIndex
            const isCurrent = index === currentStepIndex
            
            return (
              <div key={step.status} className="flex items-center gap-3">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2
                  ${isCompleted 
                    ? 'bg-green-100 border-green-300 text-green-600' 
                    : isCurrent 
                    ? 'bg-blue-100 border-blue-300 text-blue-600 animate-pulse'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                  }
                `}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    isCompleted ? 'text-green-800' :
                    isCurrent ? 'text-blue-800' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                  <p className={`text-xs ${
                    isCompleted ? 'text-green-600' :
                    isCurrent ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
                {isCompleted && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Desktop Timeline - Horizontal */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {/* Progress Bar */}
          <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${(currentStepIndex / (timelineSteps.length - 1)) * 100}%` }}
            />
          </div>

          {timelineSteps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = index <= currentStepIndex
            const isCurrent = index === currentStepIndex
            
            return (
              <div key={step.status} className="flex flex-col items-center relative z-10">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-3 bg-white
                  ${isCompleted 
                    ? 'border-green-400 text-green-600 shadow-lg' 
                    : isCurrent 
                    ? 'border-blue-400 text-blue-600 shadow-lg animate-pulse'
                    : 'border-gray-300 text-gray-400'
                  }
                `}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-center mt-2">
                  <p className={`text-xs font-medium ${
                    isCompleted ? 'text-green-800' :
                    isCurrent ? 'text-blue-800' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                  <p className={`text-xs ${
                    isCompleted ? 'text-green-600' :
                    isCurrent ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Current Status Description */}
      <div className="mt-3 pt-3 border-t border-blue-200">
        <p className="text-sm text-center text-blue-700">
          <span className="font-medium">Current Status:</span> {
            timelineSteps[currentStepIndex]?.description || 'Processing your order'
          }
        </p>
      </div>
    </div>
  )
}

interface OrderItem {
  id: number
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

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserOrders()
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
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 hover:from-emerald-200 hover:to-green-200 transition-all duration-300 shadow-lg hover:shadow-xl border border-emerald-200"
      case "confirmed":
        return "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 hover:from-blue-200 hover:to-cyan-200 transition-all duration-300 shadow-md hover:shadow-lg border border-blue-200"
      case "packed":
        return "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 hover:from-purple-200 hover:to-indigo-200 transition-all duration-300 shadow-md hover:shadow-lg border border-purple-200"
      case "dispatched":
        return "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 hover:from-amber-200 hover:to-yellow-200 transition-all duration-300 shadow-md hover:shadow-lg border border-amber-200"
      case "out for delivery":
        return "bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 hover:from-orange-200 hover:to-red-200 transition-all duration-300 shadow-md hover:shadow-lg border border-orange-200"
      case "delivered":
      case "completed":
        return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 hover:from-green-200 hover:to-emerald-200 transition-all duration-300 shadow-md hover:shadow-lg border border-green-200"
      case "cancelled":
      case "cancel":
        return "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 hover:from-red-200 hover:to-pink-200 transition-all duration-300 shadow-md hover:shadow-lg border border-red-200"
      // case "preparing":
      //   return "bg-gradient-to-r from-sky-100 to-blue-100 text-sky-800 hover:from-sky-200 hover:to-blue-200 transition-all duration-300 shadow-md hover:shadow-lg border border-sky-200"
      // case "ready":
      //   return "bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 hover:from-teal-200 hover:to-cyan-200 transition-all duration-300 shadow-md hover:shadow-lg border border-teal-200"
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 hover:from-gray-200 hover:to-slate-200 transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <CheckCircle className="w-4 h-4 text-emerald-600 drop-shadow-sm" />
      case "confirmed":
        return <Zap className="w-4 h-4 text-blue-600 drop-shadow-sm" />
      case "packed":
        return <PackageCheck className="w-4 h-4 text-purple-600 drop-shadow-sm" />
      case "dispatched":
        return <Send className="w-4 h-4 text-amber-600 drop-shadow-sm" />
      case "out for delivery":
        return <Truck className="w-4 h-4 text-orange-600 drop-shadow-sm" />
      case "delivered":
      case "completed":
        return <Home className="w-4 h-4 text-green-600 drop-shadow-sm" />
      case "cancelled":
      case "cancel":
        return <XCircle className="w-4 h-4 text-red-600 drop-shadow-sm" />
      // case "preparing":
      //   return <ChefHat className="w-4 h-4 text-sky-600 drop-shadow-sm" />
      // case "ready":
      //   return <Clock className="w-4 h-4 text-teal-600 drop-shadow-sm" />
      default:
        return <Clock className="w-4 h-4 text-gray-600 drop-shadow-sm" />
    }
  }

  const getStatusDescription = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "✅ We've received your order and it's being processed"
      case "confirmed":
        return "⚡ Your order has been confirmed and is moving forward"
      case "packed":
        return "📦 Your order has been carefully packed and sealed"
      case "dispatched":
        return "🚀 Your order has been dispatched from our facility"
      case "out for delivery":
        return "🚛 Your order is on its way to you"
      case "delivered":
      case "completed":
        return "🏠 Your order has been delivered. Enjoy!"
      case "cancelled":
      case "cancel":
        return "❌ This order has been cancelled"
      // case "preparing":
      //   return "👨‍🍳 Our team is preparing your order with care"
      // case "ready":
      //   return "⏰ Your order is ready for pickup/delivery"
      default:
        return "📋 Order status update"
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
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
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
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
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
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start sm:items-center gap-3">
                          <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 sm:mt-0 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-blue-800 text-sm sm:text-base">Track Your Order</h4>
                            <p className="text-xs sm:text-sm text-blue-600">Follow your order's journey in real-time</p>
                          </div>
                        </div>

                        {/* Tracking Details */}
                        <div className="space-y-2 pl-7 sm:pl-8">
                          {order.tracking_id && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                              <span className="text-xs sm:text-sm font-medium text-blue-700">Tracking ID:</span>
                              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-xs sm:text-sm font-semibold">
                                {order.tracking_id}
                              </div>
                            </div>
                          )}

                          {order.tracking_url && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <span className="text-xs sm:text-sm font-medium text-blue-700">Track Online:</span>
                              <a
                                href={order.tracking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium text-xs sm:text-sm w-fit"
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
                      {order.items?.map((item) => (
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
                              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                                <Box className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" />
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
                                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                    Qty: {item.quantity}
                                  </span>
                                  <span className="text-xs sm:text-sm text-gray-600">
                                    {formatCurrency(item.unit_price, order.currency)} each
                                  </span>
                                </div>
                              </div>
                              <div className="text-left sm:text-right sm:ml-4 mt-2 sm:mt-0 flex-shrink-0">
                                <p className="font-bold text-base sm:text-lg lg:text-xl text-orange-600">
                                  {formatCurrency(item.total_price, order.currency)}
                                </p>
                                <p className="text-xs text-gray-500">total</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-3 sm:pt-4">
                    <div className="bg-gradient-to-r from-gray-50 to-orange-50 rounded-lg p-3 sm:p-4">
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
                          <div className="flex justify-between text-green-600">
                            <span>Delivery Fee</span>
                            <span className="font-medium">FREE! 🎉</span>
                          </div>
                        )}
                        {(order as any).discount_amount && Number((order as any).discount_amount) > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>🎉 Coupon Discount {(order as any).coupon_code ? `(${(order as any).coupon_code})` : ''}</span>
                            <span className="font-bold">-{formatCurrency((order as any).discount_amount, order.currency)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-sm sm:text-base border-t pt-2 text-orange-600">
                          <span>Total Amount</span>
                          <span>{formatCurrency(order.final_total || order.total_amount, order.currency)}</span>
                        </div>
                      </div>
                    </div>
                  </div>



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

      <Footer />
    </div>
  )
}