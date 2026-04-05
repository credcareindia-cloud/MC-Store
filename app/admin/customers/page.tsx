"use client"

import { useState, useEffect } from "react"
import { Users, Mail, Phone, Calendar, ShoppingBag, DollarSign, UserCheck, UserX, Loader2, MapPin, ChevronDown, ChevronUp, Home, Briefcase, Tag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SavedAddress {
  id: number
  user_id: string
  label: string
  street: string
  landmark: string
  area: string
  city: string
  state: string
  pincode: string
  country: string
  is_default: boolean
  created_at: string
}

interface Customer {
  id: number | null
  name: string
  email: string
  phone: string
  created_at: string
  customer_type: 'registered' | 'guest'
  total_orders: number
  total_spent_inr: number
  clerk_user_id?: string
  user_id?: string
}

interface CustomerSummary {
  total_customers: number
  registered_users: number
  guest_customers: number
  total_revenue_inr: number
}

const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [summary, setSummary] = useState<CustomerSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [filter, setFilter] = useState<'all' | 'registered' | 'guest'>('all')
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null)
  const [customerAddresses, setCustomerAddresses] = useState<Record<string, SavedAddress[]>>({})
  const [loadingAddresses, setLoadingAddresses] = useState<string | null>(null)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/customers")
      if (!response.ok) {
        throw new Error("Failed to fetch customers")
      }
      const data = await response.json()
      setCustomers(data.customers)
      setSummary(data.summary)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const toggleCustomerAddresses = async (customer: Customer) => {
    const customerId = customer.clerk_user_id || customer.user_id || customer.id?.toString()
    if (!customerId) return

    if (expandedCustomer === customerId) {
      setExpandedCustomer(null)
      return
    }

    setExpandedCustomer(customerId)

    if (customerAddresses[customerId]) return

    setLoadingAddresses(customerId)
    try {
      const res = await fetch(`/api/admin/addresses?userId=${customerId}`)
      if (res.ok) {
        const data = await res.json()
        setCustomerAddresses(prev => ({ ...prev, [customerId]: data }))
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err)
    } finally {
      setLoadingAddresses(null)
    }
  }

  const getLabelIcon = (label: string) => {
    switch (label?.toLowerCase()) {
      case 'home': return <Home className="w-3.5 h-3.5" />
      case 'work': return <Briefcase className="w-3.5 h-3.5" />
      default: return <Tag className="w-3.5 h-3.5" />
    }
  }

  const filteredCustomers = customers.filter(customer => {
    if (filter === 'all') return true
    return customer.customer_type === filter
  })

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`
  }

  const getCustomerTypeIcon = (type: 'registered' | 'guest') => {
    return type === 'registered' 
      ? <UserCheck className="w-5 h-5 text-green-400" />
      : <UserX className="w-5 h-5 text-orange-400" />
  }

  const getCustomerTypeBadge = (type: 'registered' | 'guest') => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        type === 'registered' 
          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
          : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
      }`}>
        {type === 'registered' ? 'Registered' : 'Guest'}
      </span>
    )
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

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Customer Management</h1>
        <div className="text-center text-red-400">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Users className="w-8 h-8 text-cyan-400" />
        <h1 className="text-3xl font-bold text-white">Customer Management</h1>
      </div>
          
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Customers</CardTitle>
              <Users className="w-5 h-5 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{summary.total_customers}</div>
              <p className="text-xs text-purple-400 mt-1">All customers</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20 hover:border-green-500/40 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Registered Users</CardTitle>
              <UserCheck className="w-5 h-5 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{summary.registered_users}</div>
              <p className="text-xs text-green-400 mt-1">With accounts</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Guest Customers</CardTitle>
              <UserX className="w-5 h-5 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{summary.guest_customers}</div>
              <p className="text-xs text-orange-400 mt-1">Without accounts</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20 hover:border-green-500/40 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
              <div className="text-green-400 font-bold text-sm">₹</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">₹{summary.total_revenue_inr?.toLocaleString() || "0"}</div>
              <p className="text-xs text-green-400 mt-1">Indian Rupee</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-cyan-600 text-white border border-cyan-500' 
              : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
          }`}
        >
          All Customers ({customers.length})
        </button>
        <button
          onClick={() => setFilter('registered')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'registered' 
              ? 'bg-green-600 text-white border border-green-500' 
              : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
          }`}
        >
          Registered ({customers.filter(c => c.customer_type === 'registered').length})
        </button>
        <button
          onClick={() => setFilter('guest')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'guest' 
              ? 'bg-orange-600 text-white border border-orange-500' 
              : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
          }`}
        >
          Guests ({customers.filter(c => c.customer_type === 'guest').length})
        </button>
      </div>

      {/* Customer List */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">
            Customer List ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800/30 divide-y divide-gray-700">
                {filteredCustomers.map((customer, index) => {
                  const customerId = customer.clerk_user_id || customer.user_id || customer.id?.toString() || ''
                  const isExpanded = expandedCustomer === customerId
                  const addresses = customerAddresses[customerId] || []
                  const isLoadingAddr = loadingAddresses === customerId

                  return (
                    <>
                      <tr 
                        key={`${customer.email}-${index}`} 
                        className="hover:bg-gray-700/50 cursor-pointer"
                        onClick={() => toggleCustomerAddresses(customer)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getCustomerTypeIcon(customer.customer_type)}
                            <div className="ml-3">
                              <div className="text-sm font-medium text-white">
                                {customer.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">
                            <div className="flex items-center gap-1 mb-1">
                              <Mail size={12} className="text-gray-400" />
                              {customer.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone size={12} className="text-gray-400" />
                              {customer.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getCustomerTypeBadge(customer.customer_type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <ShoppingBag size={14} className="text-gray-400" />
                            <span className="text-sm font-medium text-white">
                              {customer.total_orders}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-400">
                            ₹{customer.total_spent_inr?.toLocaleString() || "0"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} className="text-gray-400" />
                              <span className="text-sm text-gray-300">
                                {new Date(customer.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-400">
                              <MapPin size={14} />
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Address Row */}
                      {isExpanded && (
                        <tr key={`addr-${customer.email}-${index}`}>
                          <td colSpan={6} className="px-6 py-4 bg-gray-900/40">
                            <div className="flex items-center gap-2 mb-3">
                              <MapPin className="w-4 h-4 text-cyan-400" />
                              <span className="text-sm font-semibold text-cyan-400">Saved Addresses</span>
                            </div>
                            {isLoadingAddr ? (
                              <div className="flex items-center gap-2 text-gray-400 py-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Loading addresses...</span>
                              </div>
                            ) : addresses.length === 0 ? (
                              <p className="text-sm text-gray-500 py-2">No saved addresses</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {addresses.map((addr) => (
                                  <div
                                    key={addr.id}
                                    className="bg-gray-800/60 border border-gray-700 rounded-lg p-3"
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="flex items-center gap-1 text-xs font-semibold bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                                        {getLabelIcon(addr.label)}
                                        {addr.label}
                                      </span>
                                      {addr.is_default && (
                                        <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                                          Default
                                        </span>
                                      )}
                                      {addr.state?.toLowerCase() === 'kerala' && (
                                        <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                          Kerala
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-200">{addr.street}</p>
                                    {addr.landmark && (
                                      <p className="text-xs text-gray-400">Near: {addr.landmark}</p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1">
                                      {addr.area}, {addr.city}, {addr.state} - {addr.pincode}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No customers found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CustomersPage
