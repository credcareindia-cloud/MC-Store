"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import ImageUpload from "@/components/ui/image-upload"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AboutContent {
  id: number
  title: string
  subtitle: string | null
  description: string
  image_url: string | null
  button_text: string
  button_link: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function AboutManagement() {
  const [aboutContent, setAboutContent] = useState<AboutContent[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    image_url: "",
    button_text: "Reserve a Table",
    button_link: "/reservations",
    is_active: true,
  })

  useEffect(() => {
    fetchAboutContent()
  }, [])

  const fetchAboutContent = async () => {
    try {
      const response = await fetch("/api/admin/about")
      if (response.ok) {
        const data = await response.json()
        setAboutContent(data)
      }
    } catch (error) {
      console.error("Failed to fetch about content:", error)
      toast({
        title: "Error",
        description: "Failed to fetch about content",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingId ? `/api/admin/about/${editingId}` : "/api/admin/about"
      const method = editingId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `About content ${editingId ? "updated" : "created"} successfully`,
        })
        fetchAboutContent()
        resetForm()
      } else {
        throw new Error("Failed to save about content")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save about content",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (content: AboutContent) => {
    setFormData({
      title: content.title,
      subtitle: content.subtitle || "",
      description: content.description,
      image_url: content.image_url || "",
      button_text: content.button_text,
      button_link: content.button_link,
      is_active: content.is_active,
    })
    setEditingId(content.id)
    setShowAddForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this about content?")) return

    try {
      const response = await fetch(`/api/admin/about/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "About content deleted successfully",
        })
        fetchAboutContent()
      } else {
        throw new Error("Failed to delete about content")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete about content",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      image_url: "",
      button_text: "Reserve a Table",
      button_link: "/reservations",
      is_active: true,
    })
    setEditingId(null)
    setShowAddForm(false)
  }

  if (loading && aboutContent.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">About</h1>
        </div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-gray-800/50 border-gray-700 animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-20 bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">About</h1>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add About Content
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              {editingId ? "Edit About Content" : "Add New About Content"}
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-gray-300">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-gray-900/50 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle" className="text-gray-300">
                    Subtitle
                  </Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="bg-gray-900/50 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-300">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-gray-900/50 border-gray-600 text-white min-h-[120px]"
                  required
                />
              </div>

              <div>
                <Label className="text-gray-300">Image</Label>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="button_text" className="text-gray-300">
                    Button Text
                  </Label>
                  <Input
                    id="button_text"
                    value={formData.button_text}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    className="bg-gray-900/50 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="button_link" className="text-gray-300">
                    Button Link
                  </Label>
                  <Input
                    id="button_link"
                    value={formData.button_link}
                    onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                    className="bg-gray-900/50 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active" className="text-gray-300">
                  Active
                </Label>
              </div>

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : "Save"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {aboutContent.map((content) => (
          <Card
            key={content.id}
            className="bg-gray-800/50 border-gray-700 hover:border-cyan-500/30 transition-all duration-200"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white">{content.title}</CardTitle>
                  {content.subtitle && <p className="text-gray-400 mt-1">{content.subtitle}</p>}
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(content)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(content.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-300 text-sm mb-2 line-clamp-4">{content.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>Button: {content.button_text}</span>
                    <span>Link: {content.button_link}</span>
                    <span className={content.is_active ? "text-green-400" : "text-red-400"}>
                      {content.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                {content.image_url && (
                  <div className="flex justify-end">
                    <img
                      src={content.image_url || "/placeholder.svg"}
                      alt={content.title}
                      className="w-32 h-20 object-cover rounded-lg border border-gray-600"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
