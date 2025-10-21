"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/auth-context"
import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"
import LoginModal from "@/components/auth/login-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, MapPin, Phone, Mail, MessageSquare, Calendar, Users } from "lucide-react"
import Image from "next/image"

interface Reservation {
  id: number
  customer_name: string
  customer_email: string
  customer_phone: string
  party_size: number
  reservation_date: string
  reservation_time: string
  status: string
  special_requests: string
  table_preference: string
  occasion: string
  dietary_restrictions: string
  created_at: string
}

export default function ReservationsPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loadingReservations, setLoadingReservations] = useState(true)
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    partySize: "2",
    reservationDate: "",
    reservationTime: "",
    specialRequests: "",
    tablePreference: "none",
    occasion: "none",
    dietaryRestrictions: "",
  })

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      const response = await fetch("/api/reservations")
      if (response.ok) {
        const data = await response.json()
        setReservations(data)
      }
    } catch (error) {
      console.error("Error fetching reservations:", error)
    } finally {
      setLoadingReservations(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    setLoading(true)

    try {
      const reservationData = {
        ...formData,
        customerName: user?.name || formData.customerName,
        customerEmail: user?.email || formData.customerEmail,
        userId: user?.id,
      }

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationData),
      })

      const result = await response.json()

      if (response.ok) {
        alert(`Reservation request submitted successfully! Confirmation code: ${result.confirmationCode}`)
        // Reset form
        setFormData({
          customerName: user?.name || "",
          customerEmail: user?.email || "",
          customerPhone: "",
          partySize: "2",
          reservationDate: "",
          reservationTime: "",
          specialRequests: "",
          tablePreference: "none",
          occasion: "none",
          dietaryRestrictions: "",
        })
        // Refresh reservations list
        fetchReservations()
      } else {
        alert(result.error || "Failed to submit reservation")
      }
    } catch (error) {
      console.error("Failed to submit reservation:", error)
      alert("Failed to submit reservation. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsAppReservation = () => {
    const customerName = user?.name || formData.customerName || "Customer"
    const customerPhone = formData.customerPhone || "Not provided"
    const customerEmail = user?.email || formData.customerEmail || "Not provided"

    let message = `🍽️ *New Reservation Request*\n\n`
    message += `👤 *Customer Details:*\n`
    message += `Name: ${customerName}\n`
    message += `Phone: ${customerPhone}\n`
    message += `Email: ${customerEmail}\n\n`

    message += `📅 *Reservation Details:*\n`
    message += `Date: ${formData.reservationDate ? new Date(formData.reservationDate).toLocaleDateString() : "Not selected"}\n`
    message += `Time: ${formData.reservationTime ? new Date(`2000-01-01T${formData.reservationTime}`).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "Not selected"}\n`
    message += `Party Size: ${formData.partySize} ${Number.parseInt(formData.partySize) === 1 ? "guest" : "guests"}\n`

    if (formData.occasion && formData.occasion !== "none") {
      message += `Occasion: ${formData.occasion.charAt(0).toUpperCase() + formData.occasion.slice(1)}\n`
    }

    if (formData.tablePreference && formData.tablePreference !== "none") {
      message += `Table Preference: ${formData.tablePreference.charAt(0).toUpperCase() + formData.tablePreference.slice(1)}\n`
    }

    if (formData.dietaryRestrictions) {
      message += `Dietary Restrictions: ${formData.dietaryRestrictions}\n`
    }

    if (formData.specialRequests) {
      message += `\n📝 *Special Requests:*\n${formData.specialRequests}\n`
    }

    message += `\nPlease confirm this reservation and let me know the availability. Thank you! 🙏`

    const phoneNumber = "+1234567890" // Replace with actual restaurant WhatsApp number
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`

    window.open(whatsappUrl, "_blank")
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Generate time slots
  const timeSlots = []
  for (let hour = 17; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
      timeSlots.push({ value: time, label: displayTime })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-64 bg-black flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="/placeholder.svg?height=400&width=1200"
            alt="Reservations Background"
            fill
            className="object-cover opacity-50"
          />
        </div>
        <div className="relative z-10 text-center">
          <h1 className="font-playfair text-5xl font-bold text-white mb-4">Make a Reservation</h1>
          <p className="text-xl text-gray-200">Reserve your table for an unforgettable dining experience</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Reservation Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Reservation Details</CardTitle>
            </CardHeader>
            <CardContent>
              {isAuthenticated && (
                <div className="bg-green-50 p-3 rounded-lg mb-6">
                  <p className="text-sm text-green-700">
                    Logged in as: <strong>{user?.name || user?.email}</strong>
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      value={user?.name || formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      disabled={!!user?.name}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Phone Number *</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="customerEmail">Email Address</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={user?.email || formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    disabled={!!user?.email}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="partySize">Party Size *</Label>
                    <Select
                      value={formData.partySize}
                      onValueChange={(value) => setFormData({ ...formData, partySize: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                          <SelectItem key={size} value={size.toString()}>
                            {size} {size === 1 ? "Guest" : "Guests"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reservationDate">Date *</Label>
                    <Input
                      id="reservationDate"
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={formData.reservationDate}
                      onChange={(e) => setFormData({ ...formData, reservationDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="reservationTime">Time *</Label>
                    <Select
                      value={formData.reservationTime}
                      onValueChange={(value) => setFormData({ ...formData, reservationTime: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot.value} value={slot.value}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="occasion">Occasion</Label>
                    <Select
                      value={formData.occasion}
                      onValueChange={(value) => setFormData({ ...formData, occasion: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select occasion" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No special occasion</SelectItem>
                        <SelectItem value="birthday">Birthday</SelectItem>
                        <SelectItem value="anniversary">Anniversary</SelectItem>
                        <SelectItem value="date">Date Night</SelectItem>
                        <SelectItem value="business">Business Dinner</SelectItem>
                        <SelectItem value="celebration">Celebration</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tablePreference">Table Preference</Label>
                    <Select
                      value={formData.tablePreference}
                      onValueChange={(value) => setFormData({ ...formData, tablePreference: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Table preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No preference</SelectItem>
                        <SelectItem value="window">Window seat</SelectItem>
                        <SelectItem value="private">Private area</SelectItem>
                        <SelectItem value="quiet">Quiet area</SelectItem>
                        <SelectItem value="bar">Near bar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                  <Input
                    id="dietaryRestrictions"
                    value={formData.dietaryRestrictions}
                    onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                    placeholder="Vegetarian, gluten-free, allergies, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <Textarea
                    id="specialRequests"
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    placeholder="Any special requests or notes..."
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-3"
                >
                  {loading ? "Submitting..." : isAuthenticated ? "Request Reservation" : "Login to Reserve"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleWhatsAppReservation}
                  variant="outline"
                  className="w-full border-green-500 text-green-600 hover:bg-green-50 bg-transparent"
                  disabled={
                    !formData.customerName ||
                    !formData.customerPhone ||
                    !formData.reservationDate ||
                    !formData.reservationTime
                  }
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Reserve via WhatsApp
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Restaurant Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Restaurant Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-amber-500 mt-1" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-gray-600">
                      123 Gourmet Street
                      <br />
                      Culinary District, NY 10001
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-amber-500 mt-1" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-amber-500 mt-1" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">info@lumiere-restaurant.com</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-amber-500 mt-1" />
                  <div>
                    <p className="font-medium">Hours</p>
                    <div className="text-gray-600 text-sm">
                      <p>Monday - Thursday: 5:00 PM - 10:00 PM</p>
                      <p>Friday - Saturday: 5:00 PM - 11:00 PM</p>
                      <p>Sunday: 4:00 PM - 9:00 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Reservation Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <p>• Reservations are confirmed within 24 hours</p>
                <p>• Please arrive within 15 minutes of your reservation time</p>
                <p>• Cancellations must be made at least 2 hours in advance</p>
                <p>• Large parties (8+) may require a deposit</p>
                <p>• We hold tables for 15 minutes past reservation time</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* All Reservations List */}
        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Calendar className="w-6 h-6 mr-2" />
                All Reservations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingReservations ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : reservations.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No reservations yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reservations.map((reservation) => (
                    <div key={reservation.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{reservation.customer_name}</h3>
                          <p className="text-sm text-gray-600">{reservation.customer_phone}</p>
                        </div>
                        <Badge className={getStatusColor(reservation.status)}>
                          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Date & Time</p>
                          <p className="text-gray-600">{new Date(reservation.reservation_date).toLocaleDateString()}</p>
                          <p className="text-gray-600">
                            {new Date(`2000-01-01T${reservation.reservation_time}`).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Party Size</p>
                          <p className="text-gray-600">{reservation.party_size} guests</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Occasion</p>
                          <p className="text-gray-600">
                            {reservation.occasion === "none" ? "Regular dining" : reservation.occasion}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Table Preference</p>
                          <p className="text-gray-600">
                            {reservation.table_preference === "none" ? "No preference" : reservation.table_preference}
                          </p>
                        </div>
                      </div>
                      {reservation.special_requests && (
                        <div className="mt-3 p-2 bg-gray-50 rounded">
                          <p className="text-sm">
                            <strong>Special Requests:</strong> {reservation.special_requests}
                          </p>
                        </div>
                      )}
                      {reservation.dietary_restrictions && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded">
                          <p className="text-sm">
                            <strong>Dietary Restrictions:</strong> {reservation.dietary_restrictions}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Login to Make Reservation"
        description="Please login to make a reservation and track its status."
      />
    </div>
  )
}
