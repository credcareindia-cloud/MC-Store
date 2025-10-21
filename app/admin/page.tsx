"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag, TrendingUp, Clock, CheckCircle, AlertCircle, Calendar, Users, ArrowRight } from "lucide-react"

interface DashboardStats {
  totalRevenueAED: number
  totalRevenueINR: number
  totalOrders: number
  pendingOrders: number
  todayReservations: number
  recentOrders: Array<{
    id: number
    order_number: string
    customer_name: string
    total_amount: number
    currency: string
    status: string
    created_at: string
    order_type: string
  }>
  recentUsers: Array<{
    id: number
    name: string
    email: string
    phone: string
    total_orders: number
    total_spent: number
    created_at: string
  }>
  upcomingReservations: Array<{
    id: number
    customer_name: string
    party_size: number
    reservation_date: string
    reservation_time: string
    status: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-400"
      case "confirmed":
        return "text-blue-400"
      case "preparing":
        return "text-orange-400"
      case "ready":
        return "text-green-400"
      case "completed":
        return "text-green-500"
      case "cancelled":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />
      case "preparing":
        return <AlertCircle className="w-4 h-4" />
      case "ready":
        return <CheckCircle className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "cancelled":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gray-800/50 border-gray-700 animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-8 bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <div className="text-center text-gray-400">Failed to load dashboard data</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">AED Revenue</CardTitle>
            <div className="text-cyan-400 font-bold text-sm">AED</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">AED {stats.totalRevenueAED?.toLocaleString() || "0"}</div>
            <p className="text-xs text-cyan-400 mt-1">UAE Dirham</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">INR Revenue</CardTitle>
            <div className="text-orange-400 font-bold text-sm">₹</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₹ {stats.totalRevenueINR?.toLocaleString() || "0"}</div>
            <p className="text-xs text-orange-400 mt-1">Indian Rupee</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalOrders || 0}</div>
            <p className="text-xs text-blue-400 mt-1">+8.2% from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Pending Orders</CardTitle>
            <AlertCircle className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.pendingOrders || 0}</div>
            <p className="text-xs text-purple-400 mt-1">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-cyan-400" />
              Recent Orders
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/orders')}
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders?.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center space-x-2 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="font-medium capitalize">{order.status}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">Order {order.order_number}</p>
                      <p className="text-gray-400 text-sm">{order.customer_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">
                      {order.currency === 'AED' ? 'AED' : '₹'} {order.total_amount}
                    </p>
                    <p className="text-gray-400 text-sm">{order.order_type}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-400" />
              Recent Users
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/customers')}
              className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentUsers && stats.recentUsers.length > 0 ? (
                stats.recentUsers.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-green-500/30 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name || 'Anonymous User'}</p>
                        <p className="text-gray-400 text-sm">{user.email || 'No email'}</p>
                        <p className="text-gray-500 text-xs">{user.phone || 'No phone'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{user.total_orders || 0} orders</p>
                      {/* <p className="text-gray-400 text-sm">₹{user.total_spent || 0}</p> */}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400">No recent users found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
