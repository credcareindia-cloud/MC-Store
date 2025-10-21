"use client"

import type React from "react"
import ImageUpload from "@/components/ui/image-upload" // Import ImageUpload component

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, AlertCircle, Eye, Calendar } from "lucide-react"

interface Banner {
  id: number
  title: string
  message: string
  banner_type: string
  background_color: string
  text_color: string
  button_text: string
  button_link: string
  button_color: string
  background_image_url: string
  auto_disappear_seconds: number
  display_pages: string[]
  is_active: boolean
  start_date: string | null
  end_date: string | null
  priority: number
  is_dismissible: boolean
  created_at: string
}

const bannerTypes = [
  { value: "promotion", label: "Promotion", color: "#f59e0b" },
  { value: "announcement", label: "Announcement", color: "#3b82f6" },
  { value: "warning", label: "Warning", color: "#ef4444" },
  { value: "info", label: "Information", color: "#10b981" },
]

const pageOptions = [
  { value: "all", label: "All Pages" },
  { value: "home", label: "Home" },
  { value: "menu", label: "Menu" },
  { value: "about", label: "About" },
  { value: "contact", label: "Contact" },
  { value: "reservations", label: "Reservations" },
]

export default function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    banner_type: "promotion",
    background_color: "#f59e0b",
    text_color: "#ffffff",
    button_text: "",
    button_link: "",
    button_color: "#ffffff",
    background_image_url: "",
    auto_disappear_seconds: 0,
    display_pages: ["all"],
    is_active: true,
    start_date: "",
    end_date: "",
    priority: 0,
    is_dismissible: true,
  })

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/banners")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data: Banner[] = await response.json()
      setBanners(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred"
      setError(`Failed to fetch banners: ${message}`)
      console.error("Failed to fetch banners:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingBanner ? `/api/admin/banners/${editingBanner.id}` : "/api/admin/banners"
      const method = editingBanner ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Request failed")
      }

      await fetchBanners()
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred"
      alert(`Failed to save banner: ${message}`)
      console.error("Failed to save banner:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this banner?")) return

    try {
      const response = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Delete failed")
      }

      await fetchBanners()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred"
      alert(`Failed to delete banner: ${message}`)
      console.error("Failed to delete banner:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      banner_type: "promotion",
      background_color: "#f59e0b",
      text_color: "#ffffff",
      button_text: "",
      button_link: "",
      button_color: "#ffffff",
      background_image_url: "",
      auto_disappear_seconds: 0,
      display_pages: ["all"],
      is_active: true,
      start_date: "",
      end_date: "",
      priority: 0,
      is_dismissible: true,
    })
    setEditingBanner(null)
  }

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      message: banner.message,
      banner_type: banner.banner_type,
      background_color: banner.background_color,
      text_color: banner.text_color,
      button_text: banner.button_text || "",
      button_link: banner.button_link || "",
      button_color: banner.button_color,
      background_image_url: banner.background_image_url || "",
      auto_disappear_seconds: banner.auto_disappear_seconds || 0,
      display_pages: banner.display_pages,
      is_active: banner.is_active,
      start_date: banner.start_date ? banner.start_date.split("T")[0] : "",
      end_date: banner.end_date ? banner.end_date.split("T")[0] : "",
      priority: banner.priority,
      is_dismissible: banner.is_dismissible,
    })
    setIsDialogOpen(true)
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handlePageToggle = (page: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, display_pages: [...formData.display_pages, page] })
    } else {
      setFormData({ ...formData, display_pages: formData.display_pages.filter((p) => p !== page) })
    }
  }

  const getBannerTypeColor = (type: string) => {
    return bannerTypes.find((t) => t.value === type)?.color || "#f59e0b"
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No limit"
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Banner Management</h1>
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
          <h1 className="text-3xl font-bold text-white">Banner Management</h1>
        </div>
        <Card className="bg-red-900/20 border-red-500/50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-red-400 font-semibold">Error Loading Banners</h3>
                <p className="text-red-300 text-sm mt-1">{error}</p>
                <Button onClick={fetchBanners} className="mt-3 bg-red-600 hover:bg-red-700" size="sm">
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
        <h1 className="text-3xl font-bold text-white">Banner Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openAddDialog}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBanner ? "Edit Banner" : "Add New Banner"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Banner Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="banner_type">Banner Type</Label>
                  <Select
                    value={formData.banner_type}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        banner_type: value,
                        background_color: getBannerTypeColor(value),
                      })
                    }
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {bannerTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-white">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="background_color">Background Color</Label>
                  <Input
                    id="background_color"
                    type="color"
                    value={formData.background_color}
                    onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                    className="bg-gray-700 border-gray-600 h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="text_color">Text Color</Label>
                  <Input
                    id="text_color"
                    type="color"
                    value={formData.text_color}
                    onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                    className="bg-gray-700 border-gray-600 h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="button_color">Button Color</Label>
                  <Input
                    id="button_color"
                    type="color"
                    value={formData.button_color}
                    onChange={(e) => setFormData({ ...formData, button_color: e.target.value })}
                    className="bg-gray-700 border-gray-600 h-10"
                  />
                </div>
              </div>

              <ImageUpload
                value={formData.background_image_url}
                onChange={(url) => setFormData({ ...formData, background_image_url: url })}
                label="Background Image (Optional)"
              />

              <div>
                <Label htmlFor="auto_disappear_seconds">Auto Disappear (seconds)</Label>
                <Input
                  id="auto_disappear_seconds"
                  type="number"
                  min="0"
                  value={formData.auto_disappear_seconds}
                  onChange={(e) => setFormData({ ...formData, auto_disappear_seconds: Number(e.target.value) })}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="0 = Never auto-disappear"
                />
                <p className="text-gray-400 text-sm mt-1">Set to 0 to disable auto-disappear</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="button_text">Button Text</Label>
                  <Input
                    id="button_text"
                    value={formData.button_text}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Learn More"
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

              <div>
                <Label>Display on Pages</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {pageOptions.map((page) => (
                    <div key={page.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={page.value}
                        checked={formData.display_pages.includes(page.value)}
                        onCheckedChange={(checked) => handlePageToggle(page.value, checked as boolean)}
                      />
                      <Label htmlFor={page.value} className="text-sm">
                        {page.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date (Optional)</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date (Optional)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
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
                    id="is_dismissible"
                    checked={formData.is_dismissible}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_dismissible: checked })}
                  />
                  <Label htmlFor="is_dismissible">Dismissible</Label>
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
                  {editingBanner ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Banners Table */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Banners ({banners.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Title</TableHead>
                  <TableHead className="text-gray-300">Type</TableHead>
                  <TableHead className="text-gray-300">Pages</TableHead>
                  <TableHead className="text-gray-300">Schedule</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id} className="border-gray-700">
                    <TableCell>
                      <div>
                        <span className="text-white font-medium">{banner.title}</span>
                        <p className="text-gray-400 text-sm line-clamp-1">{banner.message}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: banner.background_color,
                          color: banner.text_color,
                        }}
                      >
                        {banner.banner_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {banner.display_pages.slice(0, 2).map((page) => (
                          <Badge key={page} variant="outline" className="text-xs">
                            {page}
                          </Badge>
                        ))}
                        {banner.display_pages.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{banner.display_pages.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-300">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(banner.start_date)}
                        </div>
                        <div className="text-gray-500">to {formatDate(banner.end_date)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={banner.is_active ? "default" : "secondary"}>
                          {banner.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {banner.is_dismissible && (
                          <Badge variant="outline" className="text-xs">
                            Dismissible
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewBanner(banner)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(banner)}
                          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(banner.id)}
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

      {/* Preview Dialog */}
      {previewBanner && (
        <Dialog open={!!previewBanner} onOpenChange={() => setPreviewBanner(null)}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl">
            <DialogHeader>
              <DialogTitle>Banner Preview</DialogTitle>
            </DialogHeader>
            <div
              className="p-4 rounded-lg text-center relative overflow-hidden"
              style={{
                backgroundColor: previewBanner.background_color,
                color: previewBanner.text_color,
                backgroundImage: previewBanner.background_image_url
                  ? `url(${previewBanner.background_image_url})`
                  : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {previewBanner.background_image_url && <div className="absolute inset-0 bg-black/30"></div>}
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-2">{previewBanner.title}</h3>
                <p className="mb-4">{previewBanner.message}</p>
                {previewBanner.button_text && (
                  <Button
                    style={{
                      backgroundColor: previewBanner.button_color,
                      color: previewBanner.background_color,
                    }}
                    className="hover:opacity-80"
                  >
                    {previewBanner.button_text}
                  </Button>
                )}
                {previewBanner.auto_disappear_seconds > 0 && (
                  <p className="text-xs mt-2 opacity-75">
                    Auto-disappears in {previewBanner.auto_disappear_seconds} seconds
                  </p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
