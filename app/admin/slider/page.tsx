"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, AlertCircle, MoveUp, MoveDown, Eye } from "lucide-react"
import Image from "next/image"
import ImageUpload from "@/components/ui/image-upload"

interface Slide {
  id: number
  title: string
  subtitle: string
  image_url: string
  button_text: string
  button_link: string
  is_active: boolean
  sort_order: number
  created_at: string
  shop: string // Add shop field
}

export default function SliderManagement() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null)
  const [previewSlide, setPreviewSlide] = useState<Slide | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    button_text: "",
    button_link: "",
    is_active: true,
    sort_order: 0,
    shop: "A", // Add shop to form state
  })

  useEffect(() => {
    fetchSlides()
  }, [])

  const fetchSlides = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/slider")
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data: Slide[] = await response.json()
      setSlides(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred"
      setError(`Failed to fetch slides: ${message}`)
      console.error("Failed to fetch slides:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingSlide ? `/api/admin/slider/${editingSlide.id}` : "/api/admin/slider"
      const method = editingSlide ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Request failed")
      }

      await fetchSlides()
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred"
      alert(`Failed to save slide: ${message}`)
      console.error("Failed to save slide:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this slide?")) return

    try {
      const response = await fetch(`/api/admin/slider/${id}`, { method: "DELETE" })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Delete failed")
      }

      await fetchSlides()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred"
      alert(`Failed to delete slide: ${message}`)
      console.error("Failed to delete slide:", error)
    }
  }

  const handleReorder = async (id: number, direction: "up" | "down") => {
    const currentSlide = slides.find((s) => s.id === id)
    if (!currentSlide) return

    const newSortOrder = direction === "up" ? currentSlide.sort_order - 1 : currentSlide.sort_order + 1

    try {
      const response = await fetch(`/api/admin/slider/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...currentSlide, sort_order: newSortOrder }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Reorder failed")
      }

      await fetchSlides()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred"
      alert(`Failed to reorder slide: ${message}`)
      console.error("Failed to reorder slide:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      image_url: "",
      button_text: "",
      button_link: "",
      is_active: true,
      sort_order: slides.length + 1,
      shop: "A", // Reset to default
    })
    setEditingSlide(null)
  }

  const openEditDialog = (slide: Slide) => {
    setEditingSlide(slide)
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || "",
      image_url: slide.image_url || "",
      button_text: slide.button_text || "",
      button_link: slide.button_link || "",
      is_active: slide.is_active,
      sort_order: slide.sort_order || 0,
      shop: slide.shop || "A", // Pre-fill shop
    })
    setIsDialogOpen(true)
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Slider Management</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-800 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Slider Management</h1>
        </div>
        <Card className="bg-red-900/20 border-red-500/50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-red-400 font-semibold">Error Loading Slides</h3>
                <p className="text-red-300 text-sm mt-1">{error}</p>
                <Button onClick={fetchSlides} className="mt-3 bg-red-600 hover:bg-red-700" size="sm">
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
        <h1 className="text-3xl font-bold text-white">Slider Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openAddDialog}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Slide
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSlide ? "Edit Slide" : "Add New Slide"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Slide Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={2}
                />
              </div>

              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                label="Slide Image *"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="button_text">Button Text</Label>
                  <Input
                    id="button_text"
                    value={formData.button_text}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Explore Menu"
                  />
                </div>
                <div>
                  <Label htmlFor="button_link">Button Link</Label>
                  <Input
                    id="button_link"
                    value={formData.button_link}
                    onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="/menu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="shop">Shop</Label>
                <div className="flex gap-4 mt-1">
                  <Button
                    type="button"
                    variant={formData.shop === "A" ? "default" : "outline"}
                    className={formData.shop === "A" ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black border-yellow-400" : ""}
                    onClick={() => setFormData((f) => ({ ...f, shop: "A" }))}
                  >
                    Shop A
                  </Button>
                  <Button
                    type="button"
                    variant={formData.shop === "B" ? "default" : "outline"}
                    className={formData.shop === "B" ? "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 text-black border-gray-400" : ""}
                    onClick={() => setFormData((f) => ({ ...f, shop: "B" }))}
                  >
                    Shop B
                  </Button>
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
                  {editingSlide ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Slides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slides.map((slide) => (
          <Card key={slide.id} className="bg-gray-800/50 border-gray-700 overflow-hidden">
            <div className="relative h-48">
              <Image src={slide.image_url || "/placeholder.svg"} alt={slide.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPreviewSlide(slide)}
                    className="bg-white/20 hover:bg-white/30"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEditDialog(slide)}
                    className="bg-cyan-500/80 hover:bg-cyan-500"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDelete(slide.id)}
                    className="bg-red-500/80 hover:bg-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="absolute top-2 right-2 flex space-x-1">
                <Badge variant={slide.is_active ? "default" : "secondary"}>
                  {slide.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-2 line-clamp-1">{slide.title}</h3>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{slide.subtitle}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReorder(slide.id, "up")}
                    className="text-gray-400 hover:text-white"
                  >
                    <MoveUp className="w-4 h-4" />
                  </Button>
                  <span className="text-gray-400 text-sm">#{slide.sort_order}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReorder(slide.id, "down")}
                    className="text-gray-400 hover:text-white"
                  >
                    <MoveDown className="w-4 h-4" />
                  </Button>
                </div>
                {slide.button_text && (
                  <Badge variant="outline" className="text-xs">
                    {slide.button_text}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      {previewSlide && (
        <Dialog open={!!previewSlide} onOpenChange={() => setPreviewSlide(null)}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl">
            <DialogHeader>
              <DialogTitle>Slide Preview</DialogTitle>
            </DialogHeader>
            <div className="relative h-96 rounded-lg overflow-hidden">
              <Image
                src={previewSlide.image_url || "/placeholder.svg"}
                alt={previewSlide.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center max-w-2xl px-4">
                  <h1 className="font-playfair text-4xl font-bold text-white mb-4">{previewSlide.title}</h1>
                  {previewSlide.subtitle && <p className="text-xl text-gray-200 mb-6">{previewSlide.subtitle}</p>}
                  {previewSlide.button_text && (
                    <Button className="bg-amber-500 hover:bg-amber-600 text-black">{previewSlide.button_text}</Button>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
