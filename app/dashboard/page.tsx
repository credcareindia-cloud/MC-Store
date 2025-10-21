"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { useRouter } from "next/navigation"
import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, ShoppingBag, Clock, CheckCircle, XCircle, User, Mail, Edit3, Settings, ChefHat, Truck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useUser } from "@clerk/nextjs"

interface OrderItem {
  id: number
  menu_item_name: string
  quantity: number
  unit_price: number | string
  total_price: number | string
}

interface Order {
  id: number
  status: string
  order_type: string
  customer_name: string
  total_amount: number | string
  delivery_fee: number | string
  final_total: number | string
  special_instructions: string
  created_at: string
  items: OrderItem[]
}

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const { user: clerkUser } = useUser()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/")
      return
    }

    if (isAuthenticated) {
      fetchUserData()
    }
  }, [isAuthenticated, authLoading, router])

  const fetchUserData = async () => {
    try {
      const ordersRes = await fetch("/api/orders")

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setTotalOrders(ordersData.length) // Set actual total count
        setOrders(ordersData.slice(0, 2)) // Show only recent 2 orders
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "preparing":
        return "bg-blue-100 text-blue-800"
      case "ready":
        return "bg-purple-100 text-purple-800"
      case "out-for-delivery":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "cancelled":
        return <XCircle className="w-4 h-4" />
      case "preparing":
        return <ChefHat className="w-4 h-4" />
      case "out-for-delivery":
        return <Truck className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  // Get member since year from original data
  const getMemberSinceYear = () => {
    if (user?.createdAt) {
      return new Date(user.createdAt).getFullYear()
    }
    if (user?.isClerkUser && clerkUser?.createdAt) {
      return new Date(clerkUser.createdAt).getFullYear()
    }
    return new Date().getFullYear() // Fallback to current year
  }

  // Format money safely
  const formatMoney = (value: unknown) => {
    const num = typeof value === "number" ? value : Number.parseFloat(String(value ?? 0))
    return num.toFixed(2)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  {user?.isClerkUser && clerkUser?.imageUrl ? (
                    <Image
                      src={clerkUser.imageUrl}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      {user?.name || clerkUser?.fullName || "User"}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Mail className="w-4 h-4" />
                      <span>{user?.email || clerkUser?.primaryEmailAddress?.emailAddress}</span>
                    </div>
                    {user?.isClerkUser && (
                      <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                        <span>Google Account</span>
                      </div>
                    )}
                  </div>
                  
                  {/* <div className="flex gap-2 mt-4 md:mt-0">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Edit3 className="w-4 h-4" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Change Password
                    </Button>
                  </div> */}
                </div>

                <p className="text-gray-600">
                  Welcome to your profile dashboard! Here you can view your account details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-800">{totalOrders}</p>
                  <p className="text-xs text-gray-500 mt-1">All time orders</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Member Since</p>
                  <p className="text-3xl font-bold text-gray-800">{getMemberSinceYear()}</p>
                  <p className="text-xs text-gray-500 mt-1">Year joined</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Account Status</p>
                  <p className="text-lg font-bold text-green-600">Active</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {user?.isVerified ? "Verified" : "Pending verification"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <div className="grid grid-cols-1 gap-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold">Recent Orders</CardTitle>
              <Link href="/orders">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  View All Orders
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
                  <Link href="/products">
                    <Button className="bg-amber-500 hover:bg-amber-600 text-black font-medium">
                      Browse Products
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-semibold text-gray-800">Order #{order.id}</span>
                          <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                            {getStatusIcon(order.status)}
                            <span className="capitalize">{order.status}</span>
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-800">
                            ${formatMoney(order.final_total)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      {/* Order Items Summary */}
                      <div className="mb-4">
                        <div className="text-sm text-gray-600">
                          <p className="font-medium mb-2">Items:</p>
                          {order.items?.slice(0, 2).map((item) => (
                            <div key={item.id} className="flex justify-between items-center py-1">
                              <span>{item.menu_item_name} x{item.quantity}</span>
                              <span>${formatMoney(item.total_price)}</span>
                            </div>
                          ))}
                          {order.items?.length > 2 && (
                            <p className="text-gray-500 text-xs mt-1">
                              +{order.items.length - 2} more items
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Type:</span>
                          <span className="text-sm font-medium text-gray-800 capitalize">{order.order_type}</span>
                        </div>
                        <Link href={`/orders`}>
                          <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
                            View Details →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  
                  {totalOrders > 2 && (
                    <div className="text-center pt-4">
                      <Link href="/orders">
                        <Button variant="outline" className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4" />
                          View {totalOrders - 2} More Orders
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
