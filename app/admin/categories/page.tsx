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
import { Plus, Edit, Trash2, ImageIcon, AlertCircle, Lock, Search } from "lucide-react"
import Image from "next/image"
import ImageUpload from "@/components/ui/image-upload"

interface Category {
  id: number
  name: string
  description: string
  image_url: string
  is_active: boolean
  is_special: boolean
  sort_order: number
  created_at: string
}

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    is_active: true,
    is_special: false,
    sort_order: undefined as number | undefined,
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/categories")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data: Category[] = await response.json()
      setCategories(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred"
      setError(`Failed to fetch categories: ${message}`)
      console.error("Failed to fetch categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : "/api/admin/categories"
      const method = editingCategory ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Request failed")
      }

      await fetchCategories()
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred"
      setErrorMessage(message)
      console.error("Failed to save category:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      const response = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Delete failed")
      }

      await fetchCategories()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred"
      alert(`Failed to delete category: ${message}`)
      console.error("Failed to delete category:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image_url: "",
      is_active: true,
      is_special: false,
      sort_order: undefined,
    })
    setEditingCategory(null)
    setErrorMessage(null)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
      image_url: category.image_url || "",
      is_active: category.is_active,
      is_special: category.is_special,
      sort_order: category.sort_order || 0,
    })
    setIsDialogOpen(true)
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Categories Management</h1>
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
          <h1 className="text-3xl font-bold text-white">Categories Management</h1>
        </div>
        <Card className="bg-red-900/20 border-red-500/50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-red-400 font-semibold">Error Loading Categories</h3>
                <p className="text-red-300 text-sm mt-1">{error}</p>
                <Button onClick={fetchCategories} className="mt-3 bg-red-600 hover:bg-red-700" size="sm">
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
        <h1 className="text-3xl font-bold text-white">Categories Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setErrorMessage(null) // Clear error when dialog closes
          }
        }}>
          <DialogTrigger asChild>
            <Button
              onClick={openAddDialog}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={3}
                />
              </div>

              {/* <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                label="Category Image"
              /> */}

              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order || ""}
                  onChange={(e) => {
                    const value = e.target.value === "" ? undefined : Number(e.target.value)
                    setFormData({ ...formData, sort_order: value })
                    setErrorMessage(null) // Clear error when user starts typing
                  }}
                  className={`bg-gray-700 border-gray-600 text-white ${
                    errorMessage && errorMessage.toLowerCase().includes('sort order') 
                      ? 'border-red-500 focus:border-red-500' 
                      : ''
                  }`}
                  placeholder="Leave empty for auto-assignment"
                />
                <p className="text-xs text-gray-400 mt-1">
                  💡 Leave empty to automatically assign the next available sort order
                </p>
                {errorMessage && errorMessage.toLowerCase().includes('sort order') && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errorMessage}
                  </p>
                )}
              </div>

              {/* Enhanced Switch Components with Better Visibility */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50 border border-gray-600">
                  <div className="flex items-center space-x-3">
                    <Label htmlFor="is_active" className="text-white font-medium cursor-pointer">
                      Active Status
                    </Label>
                    <span className="text-sm text-gray-400">
                      {formData.is_active ? "Category is active" : "Category is inactive"}
                    </span>
                  </div>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-600"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50 border border-gray-600">
                  <div className="flex items-center space-x-3">
                    <Label htmlFor="is_special" className="text-white font-medium cursor-pointer">
                      Special Category
                    </Label>
                    <span className="text-sm text-gray-400">
                      {formData.is_special ? "Mark as special" : "Regular category"}
                    </span>
                  </div>
                  <Switch
                    id="is_special"
                    checked={formData.is_special}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_special: checked })}
                    className="data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-gray-600"
                  />
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
                  {editingCategory ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>
        {searchTerm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchTerm("")}
            className="border-gray-600 text-gray-400 hover:text-white"
          >
            Clear
          </Button>
        )}
      </div>

      <Card className="bg-gray-800/50 border-gray-700">
        {/* <CardHeader>
          <CardTitle className="text-white">
            Categories ({filteredCategories.length}{searchTerm ? ` of ${categories.length}` : ''})
          </CardTitle>
          {searchTerm && (
            <p className="text-gray-400 text-sm">
              Showing results for "{searchTerm}"
            </p>
          )}
        </CardHeader> */}
        <CardContent>
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {searchTerm ? 'No categories found matching your search.' : 'No categories found.'}
              {searchTerm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="ml-2 border-gray-600 text-gray-400 hover:text-white"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Image</TableHead>
                    <TableHead className="text-gray-300">Name</TableHead>
                    <TableHead className="text-gray-300">Description</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Order</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                  <TableRow key={category.id} className="border-gray-700">
                    <TableCell>
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                       {category.image_url ? (
  <Image
    src={category.image_url || "/placeholder.svg"}
    alt={category.name}
    fill
    className="object-cover"
  />
) : (
  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
    <Lock className="w-6 h-6 text-gray-400" />
  </div>
)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{category.name}</span>
                        {category.is_special && <Badge className="bg-amber-500 text-black">Special</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-300 text-sm">
                        {category.description
  ? category.description.length > 50
    ? category.description.substring(0, 50) + "..."
    : category.description
  : "No description"}

                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className="text-white" variant={category.is_active ? "default" : "secondary"}>
                        {category.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-300">{category.sort_order}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(category)}
                          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
