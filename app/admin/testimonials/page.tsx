"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, AlertCircle, Star, User, MoveUp, MoveDown } from "lucide-react"
import Image from "next/image"
import ImageUpload from "@/components/ui/image-upload"

interface Testimonial {
  id: number
  customer_name: string
  customer_role: string
  customer_avatar: string
  review_text: string
  rating: number
  is_featured: boolean
  is_active: boolean
  sort_order: number
  created_at: string
}

export default function TestimonialsManagement() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_role: "",
    customer_avatar: "",
    review_text: "",
    rating: 5,
    is_featured: false,
    is_active: true,
    sort_order: 0,
  })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/testimonials")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data: Testimonial[] = await response.json()
      setTestimonials(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred"
      setError(`Failed to fetch testimonials: ${message}`)
      console.error("Failed to fetch testimonials:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingTestimonial ? `/api/admin/testimonials/${editingTestimonial.id}` : "/api/admin/testimonials"
      const method = editingTestimonial ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Request failed")
      }

      await fetchTestimonials()
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred"
      alert(`Failed to save testimonial: ${message}`)
      console.error("Failed to save testimonial:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return

    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Delete failed")
      }

      await fetchTestimonials()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred"
      alert(`Failed to delete testimonial: ${message}`)
      console.error("Failed to delete testimonial:", error)
    }
  }

  const handleReorder = async (id: number, direction: "up" | "down") => {
    const currentTestimonial = testimonials.find((t) => t.id === id)
    if (!currentTestimonial) return

    const newSortOrder = direction === "up" ? currentTestimonial.sort_order - 1 : currentTestimonial.sort_order + 1

    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...currentTestimonial, sort_order: newSortOrder }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Reorder failed")
      }

      await fetchTestimonials()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred"
      alert(`Failed to reorder testimonial: ${message}`)
      console.error("Failed to reorder testimonial:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      customer_name: "",
      customer_role: "",
      customer_avatar: "",
      review_text: "",
      rating: 5,
      is_featured: false,
      is_active: true,
      sort_order: testimonials.length + 1,
    })
    setEditingTestimonial(null)
  }

  const openEditDialog = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setFormData({
      customer_name: testimonial.customer_name,
      customer_role: testimonial.customer_role || "",
      customer_avatar: testimonial.customer_avatar || "",
      review_text: testimonial.review_text,
      rating: testimonial.rating,
      is_featured: testimonial.is_featured,
      is_active: testimonial.is_active,
      sort_order: testimonial.sort_order || 0,
    })
    setIsDialogOpen(true)
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
    ))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Testimonials Management</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-800 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Testimonials Management</h1>
        </div>
        <Card className="bg-red-900/20 border-red-500/50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-red-400 font-semibold">Error Loading Testimonials</h3>
                <p className="text-red-300 text-sm mt-1">{error}</p>
                <Button onClick={fetchTestimonials} className="mt-3 bg-red-600 hover:bg-red-700" size="sm">
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Testimonials Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openAddDialog}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name">Customer Name *</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customer_role">Customer Role/Title</Label>
                  <Input
                    id="customer_role"
                    value={formData.customer_role}
                    onChange={(e) => setFormData({ ...formData, customer_role: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Food Critic, Chef, etc."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="review_text">Review Text *</Label>
                <Textarea
                  id="review_text"
                  value={formData.review_text}
                  onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={4}
                  required
                />
              </div>

              <ImageUpload
                value={formData.customer_avatar}
                onChange={(url) => setFormData({ ...formData, customer_avatar: url })}
                label="Customer Avatar"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating">Rating (1-5) *</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                  <div className="flex mt-2">{renderStars(formData.rating)}</div>
                </div>
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Featured</Label>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 border-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                >
                  {editingTestimonial ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Testimonials Table */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Testimonials ({testimonials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Customer</TableHead>
                  <TableHead className="text-gray-300">Review</TableHead>
                  <TableHead className="text-gray-300">Rating</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Order</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testimonials.map((testimonial) => (
                  <TableRow key={testimonial.id} className="border-gray-700">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                          {testimonial.customer_avatar ? (
                            <Image
                              src={testimonial.customer_avatar || "/placeholder.svg"}
                              alt={testimonial.customer_name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-white font-medium">{testimonial.customer_name}</span>
                          {testimonial.customer_role && (
                            <p className="text-gray-400 text-sm">{testimonial.customer_role}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-gray-300 text-sm line-clamp-2 max-w-xs">{testimonial.review_text}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {renderStars(testimonial.rating)}
                        <span className="text-gray-300 text-sm ml-2">({testimonial.rating})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={testimonial.is_active ? "default" : "secondary"}>
                          {testimonial.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {testimonial.is_featured && <Badge className="bg-amber-500 text-black">Featured</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorder(testimonial.id, "up")}
                          className="text-gray-400 hover:text-white"
                        >
                          <MoveUp className="w-4 h-4" />
                        </Button>
                        <span className="text-gray-400 text-sm">#{testimonial.sort_order}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorder(testimonial.id, "down")}
                          className="text-gray-400 hover:text-white"
                        >
                          <MoveDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(testimonial)}
                          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(testimonial.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
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
