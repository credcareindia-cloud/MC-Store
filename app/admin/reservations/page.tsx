"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Eye, Calendar, Users, Trash2 } from "lucide-react"

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
  confirmation_code: string
  created_at: string
}

export default function ReservationsManagement() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      const response = await fetch("/api/admin/reservations")
      if (response.ok) {
        const data = await response.json()
        setReservations(data)
      }
    } catch (error) {
      console.error("Failed to fetch reservations:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateReservationStatus = async (reservationId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await fetchReservations()
      }
    } catch (error) {
      console.error("Failed to update reservation status:", error)
    }
  }

  const deleteReservation = async (reservationId: number) => {
    if (!confirm("Are you sure you want to delete this reservation?")) return

    try {
      const response = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchReservations()
      }
    } catch (error) {
      console.error("Failed to delete reservation:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "confirmed":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      case "completed":
        return "bg-blue-500"
      case "no-show":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const filteredReservations = reservations.filter(
    (reservation) => statusFilter === "all" || reservation.status === statusFilter,
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Reservations Management</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-800 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Reservations Management</h1>
        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="all" className="text-white">
                All Reservations
              </SelectItem>
              <SelectItem value="pending" className="text-white">
                Pending
              </SelectItem>
              <SelectItem value="confirmed" className="text-white">
                Confirmed
              </SelectItem>
              <SelectItem value="completed" className="text-white">
                Completed
              </SelectItem>
              <SelectItem value="cancelled" className="text-white">
                Cancelled
              </SelectItem>
              <SelectItem value="no-show" className="text-white">
                No Show
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reservations Table */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Reservations ({filteredReservations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Confirmation</TableHead>
                  <TableHead className="text-gray-300">Customer</TableHead>
                  <TableHead className="text-gray-300">Date & Time</TableHead>
                  <TableHead className="text-gray-300">Party Size</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.map((reservation) => (
                  <TableRow key={reservation.id} className="border-gray-700">
                    <TableCell>
                      <span className="text-white font-mono">{reservation.confirmation_code}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="text-white font-medium">{reservation.customer_name}</span>
                        <p className="text-gray-400 text-sm">{reservation.customer_phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <div>
                          <p className="text-white">{new Date(reservation.reservation_date).toLocaleDateString()}</p>
                          <p className="text-gray-400 text-sm">{reservation.reservation_time}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-green-400" />
                        <span className="text-white">{reservation.party_size}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(reservation.status)}`}></div>
                        <Badge variant="outline" className="capitalize">
                          {reservation.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedReservation(reservation)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Reservation {reservation.confirmation_code} Details</DialogTitle>
                            </DialogHeader>
                            {selectedReservation && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Customer Information</h4>
                                    <p>
                                      <strong>Name:</strong> {selectedReservation.customer_name}
                                    </p>
                                    <p>
                                      <strong>Phone:</strong> {selectedReservation.customer_phone}
                                    </p>
                                    {selectedReservation.customer_email && (
                                      <p>
                                        <strong>Email:</strong> {selectedReservation.customer_email}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Reservation Details</h4>
                                    <p>
                                      <strong>Date:</strong>{" "}
                                      {new Date(selectedReservation.reservation_date).toLocaleDateString()}
                                    </p>
                                    <p>
                                      <strong>Time:</strong> {selectedReservation.reservation_time}
                                    </p>
                                    <p>
                                      <strong>Party Size:</strong> {selectedReservation.party_size}
                                    </p>
                                    <p>
                                      <strong>Status:</strong> {selectedReservation.status}
                                    </p>
                                  </div>
                                </div>

                                {selectedReservation.occasion && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Occasion</h4>
                                    <p className="text-gray-300">{selectedReservation.occasion}</p>
                                  </div>
                                )}

                                {selectedReservation.table_preference && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Table Preference</h4>
                                    <p className="text-gray-300">{selectedReservation.table_preference}</p>
                                  </div>
                                )}

                                {selectedReservation.dietary_restrictions && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Dietary Restrictions</h4>
                                    <p className="text-gray-300">{selectedReservation.dietary_restrictions}</p>
                                  </div>
                                )}

                                {selectedReservation.special_requests && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Special Requests</h4>
                                    <p className="text-gray-300">{selectedReservation.special_requests}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Select
                          value={reservation.status}
                          onValueChange={(value) => updateReservationStatus(reservation.id, value)}
                        >
                          <SelectTrigger className="w-32 h-8 bg-gray-700 border-gray-600 text-white text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="pending" className="text-white">
                              Pending
                            </SelectItem>
                            <SelectItem value="confirmed" className="text-white">
                              Confirmed
                            </SelectItem>
                            <SelectItem value="completed" className="text-white">
                              Completed
                            </SelectItem>
                            <SelectItem value="cancelled" className="text-white">
                              Cancelled
                            </SelectItem>
                            <SelectItem value="no-show" className="text-white">
                              No Show
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteReservation(reservation.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
