"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ImageIcon, AlertCircle, Search, Star, Store, DollarSign, ChevronDown, ChevronRight, Download, FileSpreadsheet } from "lucide-react"
import Image from "next/image"
import MultipleImageUpload from "@/components/ui/image-upload"

interface ProductVariant {
  id: number
  name: string
  price_aed: number
  price_inr: number
  discount_aed?: number
  discount_inr?: number
  available_aed: boolean
  available_inr: boolean
  stock_quantity: number
}
interface Product {
  id: number
  name: string
  description: string
  variants: ProductVariant[]
  image_urls: string[] // Changed from image_url to image_urls array
  category_id: number
  category_name: string
  is_available: boolean
  is_featured: boolean
  is_new: boolean
  new_until_date: string
  features: string[]
  specifications_text: string
  warranty_months: number
  brand: string
  model: string
  condition_type: string
  warranty_period: number
  storage_capacity: string
  color: string
  stock_quantity: number
  sku: string
  shop_category: "A" | "B" | "Both"
  store_name: string
  created_at: string
}

interface Category {
  id: number
  name: string
}

interface Shop {
  id: string
  name: string
  label: string
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedShop, setSelectedShop] = useState<string>("all")
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set())
  const [categorySearchTerm, setCategorySearchTerm] = useState("")

  // Available shops
const shops: Shop[] = [
  { id: "A", name: "Shop A", label: "Shop A" },
  { id: "B", name: "Shop B", label: "Shop B" },
  { id: "Both", name: "Both Shops", label: "Both Shops" }
];


const [formData, setFormData] = useState({
  name: "",
  description: "",
  image_urls: [] as string[], // Changed from image_url to image_urls array
  category_id: 0,
  shop_category: "Both" as "A" | "B" | "Both",
  store_name: "",
  is_available: true,
  is_featured: false,
  is_new: false,
  new_until_date: "",
  features: "",
  specifications_text: "",
  warranty_months: 0,
  brand: "",
  model: "",
  variants: [
    {
      id: Date.now(),
      name: "",
      price_aed: 0,
      price_inr: 0,
      discount_aed: 0,
      discount_inr: 0,
      available_aed: true,
      available_inr: true,
      stock_quantity: 0,
    }
  ],
  condition_type: "none",
  warranty_period: 0,
  storage_capacity: "",
  color: "",
  stock_quantity: 0,
  sku: "",
})

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])



  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/products")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data: Product[] = await response.json()
      setProducts(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred"
      setError(`Failed to fetch products: ${message}`)
      console.error("Failed to fetch products:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories")
      if (response.ok) {
        const data: Category[] = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

// Updated handleSubmit function with better validation
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  // Validate required fields
  if (!formData.name.trim()) {
    alert("Product name is required")
    return
  }

  if (!formData.category_id || formData.category_id === 0) {
    alert("Category is required")
    return
  }

  if (!formData.shop_category) {
    alert("Shop selection is required")
    return
  }

  // Validate variants
  if (!formData.variants || formData.variants.length === 0) {
    alert("At least one variant is required")
    return
  }

  // Validate that each variant has a name
  const hasInvalidVariant = formData.variants.some(variant => !variant.name.trim())
  if (hasInvalidVariant) {
    alert("All variants must have a name")
    return
  }

  try {
    const url = editingItem ? `/api/admin/products/${editingItem.id}` : "/api/admin/products"
    const method = editingItem ? "PUT" : "POST"

    // Generate SKU if not provided
    const sku = formData.sku || `${formData.shop_category}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`

    const payload = {
      ...formData,
      sku,
      features: formData.features
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    }

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Request failed")
    }

    await fetchProducts()
    setIsDialogOpen(false)
    resetForm()
    alert(editingItem ? "Product updated successfully!" : "Product added successfully!")
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred"
    alert(`Failed to save product: ${message}`)
    console.error("Failed to save product:", error)
  }
}

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Delete failed")
      }

      await fetchProducts()
      alert("Product deleted successfully!")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred"
      alert(`Failed to delete product: ${message}`)
      console.error("Failed to delete product:", error)
    }
  }

const resetForm = () => {
  setFormData({
    name: "",
    description: "",
    image_urls: [], // Changed from image_url to empty array
    category_id: categories.length > 0 ? categories[0].id : 0,
    shop_category: "Both" as "A" | "B" | "Both",
    store_name: "",
    is_available: true,
    is_featured: false,
    is_new: false,
    new_until_date: "",
    features: "",
    specifications_text: "",
    warranty_months: 0,
    brand: "",
    model: "",
    condition_type: "none",
    warranty_period: 0,
    storage_capacity: "",
    color: "",
    stock_quantity: 0,
    sku: "",
    variants: [
      {
        id: Date.now(),
        name: "",
        price_aed: 0,
        price_inr: 0,
        discount_aed: 0,
        discount_inr: 0,
        available_aed: true,
        available_inr: true,
        stock_quantity: 0,
      }
    ]
  })
  setEditingItem(null)
}

const openEditDialog = (item: Product) => {
  setEditingItem(item)
  setFormData({
    name: item.name,
    description: item.description || "",
    image_urls: Array.isArray(item.image_urls) ? item.image_urls :
                (item.image_urls ? [item.image_urls as any] : []), // Handle backward compatibility
    category_id: item.category_id,
    shop_category: (item.shop_category as "A" | "B" | "Both") || "Both",
    store_name: item.store_name || "",
    is_available: item.is_available,
    is_featured: item.is_featured,
    features: item.features?.join(", ") || "",
    specifications_text: item.specifications_text || "",
    warranty_months: item.warranty_months || 0,
    brand: item.brand || "",
    model: item.model || "",
    condition_type: item.condition_type || "none",
    warranty_period: item.warranty_period || 0,
    storage_capacity: item.storage_capacity || "",
    color: item.color || "",
    stock_quantity: item.stock_quantity || 0,
    sku: item.sku || "",
    is_new: item.is_new || false,
    new_until_date: item.new_until_date || "",
    variants: Array.isArray(item.variants) && item.variants.length > 0
    ? item.variants.map(variant => ({
        ...variant,
        discount_aed: variant.discount_aed || 0,
        discount_inr: variant.discount_inr || 0,
      }))
    : [{
        id: Date.now(),
        name: "",
        price_aed: 0,
        price_inr: 0,
        discount_aed: 0,
        discount_inr: 0,
        available_aed: true,
        available_inr: true,
        stock_quantity: 0,
      }]
  })
  setIsDialogOpen(true)
}

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  // Export functions
  const exportToCSV = () => {
    const dataToExport = filteredItems
    const csvHeaders = [
      'ID', 'Name', 'Description', 'Category', 'Shop', 'Brand', 'Model', 
      'SKU', 'Store Name', 'Is Available', 'Is Featured', 'Is New',
      'Variant Name', 'AED Price', 'AED Discount', 'INR Price', 'INR Discount',
      'Stock Quantity', 'Available AED', 'Available INR', 'Created Date'
    ]
    
    const csvRows = []
    csvRows.push(csvHeaders.join(','))
    
    dataToExport.forEach(product => {
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach(variant => {
          const row = [
            product.id,
            `"${product.name.replace(/"/g, '""')}"`,
            `"${product.description.replace(/"/g, '""')}"`,
            `"${product.category_name}"`,
            product.shop_category,
            `"${product.brand || ''}"`,
            `"${product.model || ''}"`,
            `"${product.sku || ''}"`,
            `"${product.store_name || ''}"`,
            product.is_available ? 'Yes' : 'No',
            product.is_featured ? 'Yes' : 'No',
            product.is_new ? 'Yes' : 'No',
            `"${variant.name}"`,
            variant.price_aed || 0,
            variant.discount_aed || 0,
            variant.price_inr || 0,
            variant.discount_inr || 0,
            variant.stock_quantity || 0,
            variant.available_aed ? 'Yes' : 'No',
            variant.available_inr ? 'Yes' : 'No',
            product.created_at ? new Date(product.created_at).toLocaleDateString() : ''
          ]
          csvRows.push(row.join(','))
        })
      } else {
        const row = [
          product.id,
          `"${product.name.replace(/"/g, '""')}"`,
          `"${product.description.replace(/"/g, '""')}"`,
          `"${product.category_name}"`,
          product.shop_category,
          `"${product.brand || ''}"`,
          `"${product.model || ''}"`,
          `"${product.sku || ''}"`,
          `"${product.store_name || ''}"`,
          product.is_available ? 'Yes' : 'No',
          product.is_featured ? 'Yes' : 'No',
          product.is_new ? 'Yes' : 'No',
          'No variants',
          '', '', '', '', '', '', '',
          product.created_at ? new Date(product.created_at).toLocaleDateString() : ''
        ]
        csvRows.push(row.join(','))
      }
    })
    
    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    
    const filterInfo = []
    if (selectedCategory !== 'all') {
      const categoryName = categories.find(c => c.id.toString() === selectedCategory)?.name || selectedCategory
      filterInfo.push(`category-${categoryName}`)
    }
    if (selectedShop !== 'all') {
      filterInfo.push(`shop-${selectedShop}`)
    }
    const filterSuffix = filterInfo.length > 0 ? `_${filterInfo.join('_')}` : ''
    
    link.setAttribute('download', `products_export${filterSuffix}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToExcel = () => {
    const dataToExport = filteredItems
    const csvHeaders = [
      'ID', 'Name', 'Description', 'Category', 'Shop', 'Brand', 'Model', 
      'SKU', 'Store Name', 'Is Available', 'Is Featured', 'Is New',
      'Variant Name', 'AED Price', 'AED Discount', 'INR Price', 'INR Discount',
      'Stock Quantity', 'Available AED', 'Available INR', 'Created Date'
    ]
    
    const csvRows = []
    csvRows.push(csvHeaders.join(','))
    
    dataToExport.forEach(product => {
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach(variant => {
          const row = [
            product.id,
            `"${product.name.replace(/"/g, '""')}"`,
            `"${product.description.replace(/"/g, '""')}"`,
            `"${product.category_name}"`,
            product.shop_category,
            `"${product.brand || ''}"`,
            `"${product.model || ''}"`,
            `"${product.sku || ''}"`,
            `"${product.store_name || ''}"`,
            product.is_available ? 'Yes' : 'No',
            product.is_featured ? 'Yes' : 'No',
            product.is_new ? 'Yes' : 'No',
            `"${variant.name}"`,
            variant.price_aed || 0,
            variant.discount_aed || 0,
            variant.price_inr || 0,
            variant.discount_inr || 0,
            variant.stock_quantity || 0,
            variant.available_aed ? 'Yes' : 'No',
            variant.available_inr ? 'Yes' : 'No',
            product.created_at ? new Date(product.created_at).toLocaleDateString() : ''
          ]
          csvRows.push(row.join(','))
        })
      } else {
        const row = [
          product.id,
          `"${product.name.replace(/"/g, '""')}"`,
          `"${product.description.replace(/"/g, '""')}"`,
          `"${product.category_name}"`,
          product.shop_category,
          `"${product.brand || ''}"`,
          `"${product.model || ''}"`,
          `"${product.sku || ''}"`,
          `"${product.store_name || ''}"`,
          product.is_available ? 'Yes' : 'No',
          product.is_featured ? 'Yes' : 'No',
          product.is_new ? 'Yes' : 'No',
          'No variants',
          '', '', '', '', '', '', '',
          product.created_at ? new Date(product.created_at).toLocaleDateString() : ''
        ]
        csvRows.push(row.join(','))
      }
    })
    
    // Add BOM for proper Excel UTF-8 support
    const csvContent = '\uFEFF' + csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    
    const filterInfo = []
    if (selectedCategory !== 'all') {
      const categoryName = categories.find(c => c.id.toString() === selectedCategory)?.name || selectedCategory
      filterInfo.push(`category-${categoryName}`)
    }
    if (selectedShop !== 'all') {
      filterInfo.push(`shop-${selectedShop}`)
    }
    const filterSuffix = filterInfo.length > 0 ? `_${filterInfo.join('_')}` : ''
    
    link.setAttribute('download', `products_export_excel${filterSuffix}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Format price display based on currency
// Fixed formatPrice function
const formatPrice = (product: Product) => {
  // Get the first variant or fallback
  const defaultVariant = Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants[0] // Get first variant instead of returning the array
    : null;

  if (defaultVariant) {
    const { price_aed, price_inr } = defaultVariant;
    // Use product.default_currency if available, fallback to "AED"
    const defaultCurrency = (product as any).default_currency || "INR";

    if (price_aed && price_inr) {
      return (
        <div className="flex flex-col">
          <span className={`font-semibold ${defaultCurrency === 'INR' ? 'text-cyan-400' : ''}`}>
            ₹ {price_inr}
            {defaultCurrency === 'INR' && (
              <Badge variant="outline" className="ml-1 text-xs">
                Default
              </Badge>
            )}
          </span>
          <span className={`text-sm text-gray-400 ${defaultCurrency === 'INR' ? 'text-cyan-400' : ''}`}>
            ₹ {price_inr}
            {defaultCurrency === 'INR' && (
              <Badge variant="outline" className="ml-1 text-xs">
                Default
              </Badge>
            )}
          </span>
        </div>
      );
    } else if (price_aed) {
      return <span className="font-semibold">AED {price_aed}</span>;
    } else if (price_inr) {
      return <span className="font-semibold">₹ {price_inr}</span>;
    }
  }
  
  // Fallback for legacy products or those without variants
  return <span className="font-semibold text-gray-400">No price set</span>;
};


  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  )

  const filteredItems = products.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || item.category_id?.toString() === selectedCategory
    const matchesShop = selectedShop === "all" || item.shop_category === selectedShop
    return matchesSearch && matchesCategory && matchesShop
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Products Management</h1>
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
          <h1 className="text-3xl font-bold text-white">Products Management</h1>
        </div>
        <Card className="bg-red-900/20 border-red-500/50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-red-400 font-semibold">Error Loading Products</h3>
                <p className="text-red-300 text-sm mt-1">{error}</p>
                <Button onClick={fetchProducts} className="mt-3 bg-red-600 hover:bg-red-700" size="sm">
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Products Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openAddDialog}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="store_name">Store Name</Label>
                  <Input
                    id="store_name"
                    value={formData.store_name}
                    onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="e.g. Nike New York"
                  />
                </div>
              </div>

              {/* Shop and Category Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shop_category">Shop *</Label>
                  <Select
                    value={formData.shop_category}
                    onValueChange={(value: "A" | "B" | "Both") => {
                      setFormData(prev => ({ ...prev, shop_category: value }));
                    }}
                    required
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select a shop (required)" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600" style={{ zIndex: 99999 }} position="popper">
                      {shops.map((shop) => (
                        <SelectItem key={shop.id} value={shop.id} className="text-white hover:bg-gray-600">
                          <div className="flex items-center space-x-2">
                            <Store className="w-4 h-4" />
                            <span>{shop.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category_id > 0 ? formData.category_id.toString() : ""}
                    onValueChange={(value: string) => {
                      setFormData(prev => ({ ...prev, category_id: Number(value) }));
                    }}
                    required
                    disabled={categories.length === 0}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder={categories.length === 0 ? "Loading categories..." : "Select a category (required)"} />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600" style={{ zIndex: 99999 }} position="popper">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()} className="text-white hover:bg-gray-600">
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
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
              {/*  */}

<MultipleImageUpload
  value={formData.image_urls}
  onChange={(urls) => setFormData({ ...formData, image_urls: urls })}
  label="Product Images"
  maxImages={2}
/>

{/* Updated table cell for images - replace the existing image cell */}

              {/* Brand and Model */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Sabs, Faiza, Goree"
                  />
                </div>

                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Model name"
                  />
                </div>
              </div>

              {/* Condition and Color */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="condition_type">Condition</Label>
                  <Select
                    value={formData.condition_type}
                    onValueChange={(value: string) => {
                      setFormData(prev => ({ ...prev, condition_type: value }));
                    }}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600" style={{ zIndex: 99999 }} position="popper">
                      <SelectItem value="none" className="text-white hover:bg-gray-600">None</SelectItem>
                      <SelectItem value="master" className="text-white hover:bg-gray-600">Master</SelectItem>
                      <SelectItem value="first-copy" className="text-white hover:bg-gray-600">1st Copy</SelectItem>
                      <SelectItem value="second-copy" className="text-white hover:bg-gray-600">2nd Copy</SelectItem>
                      <SelectItem value="hot" className="text-white hover:bg-gray-600">Hot</SelectItem>
                      <SelectItem value="sale" className="text-white hover:bg-gray-600">Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Black, White, Blue"
                  />
                </div>
              </div>

              {/* Warranty and Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="warranty_months">Expiry (months)</Label>
                  <Input
                    id="warranty_months"
                    type="number"
                    min="0"
                    value={formData.warranty_months}
                    onChange={(e) => setFormData({ ...formData, warranty_months: Number(e.target.value) })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              {/* SKU */}
              {/* <div>
                <Label htmlFor="sku">SKU (Leave empty to auto-generate)</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Auto-generated if empty"
                />
              </div> */}

              {/* Features */}
              <div>
                <Label htmlFor="features">Features (comma separated)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Feature 1, Feature 2, Feature 3"
                  rows={2}
                />
              </div>

              {/* Specifications */}
              <div>
                <Label htmlFor="specifications_text">Hashtags</Label>
                <Textarea
                  id="specifications_text"
                  value={formData.specifications_text}
                  onChange={(e) => setFormData({ ...formData, specifications_text: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Put hash tags coma separated. "
                  rows={3}
                />
              </div>

              {/* Enhanced Product Settings Toggles */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  Product Settings
                  <div className="flex-1 border-t border-gray-600 ml-4"></div>
                </h4>
                
                {/* Available Toggle */}
                <div className="p-4 bg-gray-900/50 rounded-xl border-2 border-gray-700 hover:border-gray-600 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Label htmlFor="is_available" className="text-white font-semibold text-base cursor-pointer">
                        Available
                      </Label>
                      <Badge 
                        className={`text-xs font-bold px-3 py-1 ${
                          formData.is_available 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-600 text-gray-300'
                        }`}
                      >
                        {formData.is_available ? 'ON' : 'OFF'}
                      </Badge>
                    </div>
                    <Switch
                      id="is_available"
                      checked={formData.is_available}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                      className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-600 scale-125"
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-2 ml-0">
                    {formData.is_available ? "Product is available for purchase" : "Product is not available"}
                  </p>
                </div>

                {/* Featured Toggle */}
                <div className="p-4 bg-gray-900/50 rounded-xl border-2 border-gray-700 hover:border-gray-600 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Label htmlFor="is_featured" className="text-white font-semibold text-base cursor-pointer">
                        Featured
                      </Label>
                      <Badge 
                        className={`text-xs font-bold px-3 py-1 ${
                          formData.is_featured 
                            ? 'bg-amber-500 text-black' 
                            : 'bg-gray-600 text-gray-300'
                        }`}
                      >
                        {formData.is_featured ? 'ON' : 'OFF'}
                      </Badge>
                    </div>
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                      className="data-[state=checked]:bg-amber-500 data-[state=unchecked]:bg-gray-600 scale-125"
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-2 ml-0">
                    {formData.is_featured ? "Product will be highlighted as featured" : "Regular product"}
                  </p>
                </div>

                {/* New Product Toggle */}
                <div className="p-4 bg-gray-900/50 rounded-xl border-2 border-gray-700 hover:border-gray-600 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Label htmlFor="is_new" className="text-white font-semibold text-base cursor-pointer">
                        New Product
                      </Label>
                      <Badge 
                        className={`text-xs font-bold px-3 py-1 ${
                          formData.is_new 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-600 text-gray-300'
                        }`}
                      >
                        {formData.is_new ? 'ON' : 'OFF'}
                      </Badge>
                    </div>
                    <Switch
                      id="is_new"
                      checked={formData.is_new}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_new: checked })}
                      className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-600 scale-125"
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-2 ml-0">
                    {formData.is_new ? "Product will be marked as new arrival" : "Not a new product"}
                  </p>
                </div>
              </div>

              {/* New Until Date */}
              {formData.is_new && (
                <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                  <Label htmlFor="new_until_date" className="text-blue-300 font-medium">New Until Date</Label>
                  <Input
                    id="new_until_date"
                    type="date"
                    value={formData.new_until_date}
                    onChange={(e) => setFormData({ ...formData, new_until_date: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                  />
                  <p className="text-xs text-blue-400 mt-1">Set when this product should no longer be marked as "new"</p>
                </div>
              )}

              {/* Product Variants Section */}
           <div className="space-y-6">
  <h4 className="text-xl font-bold text-white">Product Variants</h4>

  {formData.variants.map((variant, idx) => (
    <div
      key={idx}
      className="border border-gray-700 p-5 rounded-xl bg-gray-900/40 shadow-md space-y-6"
    >
      {/* Variant Header */}
      <div className="flex items-center justify-between">
        <h5 className="text-lg font-semibold text-white">
          Variant {idx + 1}
        </h5>
        <Button
          type="button"
          onClick={() => {
            const variants = formData.variants.filter((_, vIdx) => vIdx !== idx)
            setFormData({ ...formData, variants })
          }}
          className="bg-red-500 hover:bg-red-600"
        >
          Remove
        </Button>
      </div>

      {/* Variant Name */}
      <div>
        <Label>Variant Name *</Label>
        <Input
          value={variant.name}
          onChange={(e) => {
            const variants = [...formData.variants]
            variants[idx].name = e.target.value
            setFormData({ ...formData, variants })
          }}
          placeholder="e.g. 60g, 90g"
          required
        />
      </div>

      {/* Price Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* AED Price */}
        <div>
          <Label>AED Price</Label>
          <Input
            type="number"
            value={variant.price_aed}
            onChange={(e) => {
              const variants = [...formData.variants]
              variants[idx].price_aed = Number(e.target.value)
              setFormData({ ...formData, variants })
            }}
          />
        </div>

        {/* AED Discount */}
        <div>
          <Label>AED Discount</Label>
          <Input
            type="number"
            value={variant.discount_aed}
            onChange={(e) => {
              const variants = [...formData.variants]
              variants[idx].discount_aed = Number(e.target.value)
              setFormData({ ...formData, variants })
            }}
          />
        </div>

        {/* AED Available */}
        <div className="flex items-center gap-3">
          <Label>Available in AED</Label>
          <Switch
            checked={variant.available_aed}
            onCheckedChange={(checked) => {
              const variants = [...formData.variants]
              variants[idx].available_aed = checked
              setFormData({ ...formData, variants })
            }}
          />
        </div>
      </div>

      {/* INR Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* INR Price */}
        <div>
          <Label>INR Price</Label>
          <Input
            type="number"
            value={variant.price_inr}
            onChange={(e) => {
              const variants = [...formData.variants]
              variants[idx].price_inr = Number(e.target.value)
              setFormData({ ...formData, variants })
            }}
          />
        </div>

        {/* INR Discount */}
        <div>
          <Label>INR Discount</Label>
          <Input
            type="number"
            value={variant.discount_inr}
            onChange={(e) => {
              const variants = [...formData.variants]
              variants[idx].discount_inr = Number(e.target.value)
              setFormData({ ...formData, variants })
            }}
          />
        </div>

        {/* INR Available */}
        <div className="flex items-center gap-3">
          <Label>Available in INR</Label>
          <Switch
            checked={variant.available_inr}
            onCheckedChange={(checked) => {
              const variants = [...formData.variants]
              variants[idx].available_inr = checked
              setFormData({ ...formData, variants })
            }}
          />
        </div>
      </div>

      {/* Stock Section */}
      <div className="grid grid-cols-1 gap-5">
        <div>
          <Label>Stock Quantity</Label>
          <Input
            type="number"
            min="0"
            value={variant.stock_quantity}
            onChange={(e) => {
              const variants = [...formData.variants]
              variants[idx].stock_quantity = Number(e.target.value)
              setFormData({ ...formData, variants })
            }}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="Enter stock quantity for this variant"
          />
        </div>
      </div>
    </div>
  ))}

  {/* Add Variant Button */}
  <Button
    type="button"
    onClick={() =>
      setFormData({
        ...formData,
        variants: [
          ...formData.variants,
          {
            id: Date.now(),
            name: "",
            price_aed: 0,
            price_inr: 0,
            discount_aed: 0,
            discount_inr: 0,
            available_aed: true,
            available_inr: true,
            stock_quantity: 0,
          },
        ],
      })
    }
    className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg"
  >
    ➕ Add Variant
  </Button>
</div>

              {/* Form Actions */}
              <div className="flex space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 border-gray-600 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                >
                  {editingItem ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            
            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600 hover:border-gray-500"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-gray-800 border-gray-700">
                <DropdownMenuItem
                  onClick={exportToCSV}
                  className="cursor-pointer text-white hover:bg-gray-700 focus:bg-gray-700"
                >
                  <Download className="w-4 h-4 mr-3 text-green-400" />
                  <div className="flex flex-col">
                    <span className="font-medium">Export as CSV</span>
                    <span className="text-xs text-gray-400">Standard CSV format</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={exportToExcel}
                  className="cursor-pointer text-white hover:bg-gray-700 focus:bg-gray-700"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-3 text-blue-400" />
                  <div className="flex flex-col">
                    <span className="font-medium">Export for Excel</span>
                    <span className="text-xs text-gray-400">Excel-optimized CSV</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="w-full sm:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <div className="p-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                      <Input
                        placeholder="Search categories..."
                        value={categorySearchTerm}
                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                        className="pl-7 h-8 bg-gray-600 border-gray-500 text-white text-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <SelectItem value="all" className="text-white">
                    All Categories
                  </SelectItem>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()} className="text-white">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedShop} onValueChange={setSelectedShop}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all" className="text-white">
                    All Shops
                  </SelectItem>
                  {shops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id} className="text-white">
                      {shop.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

{/* Enhanced Products Table */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Products Items ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Images</TableHead>
                  <TableHead className="text-gray-300">Name</TableHead>
                  <TableHead className="text-gray-300">Store Name</TableHead>
                  <TableHead className="text-gray-300">Category</TableHead>
                  <TableHead className="text-gray-300">Shop</TableHead>
                  <TableHead className="text-gray-300">Variants</TableHead>
                  <TableHead className="text-gray-300">Tags</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id} className="border-gray-700">
                    {/* Images Column */}
                    <TableCell>
                      <div className="flex flex-col space-y-2">
                        {item.image_urls && Array.isArray(item.image_urls) && item.image_urls.length > 0 ? (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                            <Image
                              src={item.image_urls[0]}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Product Details Column */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-semibold text-sm">{item.name}</span>
                          {item.is_featured && <Star className="w-4 h-4 text-amber-400" />}
                        </div>

                      </div>
                    </TableCell>

                    {/* Store Name Column */}
                    <TableCell>
                      <div className="text-sm text-gray-300">
                        {item.store_name || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline" className="border-cyan-500 text-cyan-400">
                          <Store className="w-3 h-3 mr-1" />
                          Shop {item.shop_category}
                        </Badge>
                        
                      </div>
                    </TableCell>

                    {/* Shop & Category Column */}
                    <TableCell>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-300">{item.category_name}</div>
                      </div>
                    </TableCell>

                    {/* Variants & Pricing Column */}
                    <TableCell>
                      <div className="space-y-2 max-w-80">
                        {item.variants && Array.isArray(item.variants) && item.variants.length > 0 ? (
                          <Collapsible>
                            <CollapsibleTrigger 
                              className="flex items-center space-x-2 w-full p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
                              onClick={() => {
                                const newExpanded = new Set(expandedProducts)
                                if (expandedProducts.has(item.id)) {
                                  newExpanded.delete(item.id)
                                } else {
                                  newExpanded.add(item.id)
                                }
                                setExpandedProducts(newExpanded)
                              }}
                            >
                              {expandedProducts.has(item.id) ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="text-sm text-white font-medium">
                                {item.variants.length} Variant{item.variants.length !== 1 ? 's' : ''}
                              </span>
                            </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-3 mt-3">
  {item.variants.map((variant, index) => (
    <div
      key={variant.id || index}
      className="bg-gray-900/60 rounded-lg p-3 border border-gray-700 text-xs space-y-2"
    >
      {/* Variant Name */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-white">{variant.name}</span>
      </div>

      {/* AED Pricing */}
      {variant.available_aed && variant.price_aed > 0 && (
        <div className="flex justify-between">
          <Badge className="bg-cyan-500/20 text-cyan-300 px-1 py-0">
              AED
            </Badge>
          <span className="text-cyan-400 line-through font-medium">
            {variant.price_aed}
          </span>
          {variant.discount_aed && variant.discount_aed > 0 && (
            <span className="text-green-400 ml-2">
              {variant.discount_aed}
            </span>
          )}
        </div>
      )}

      {/* INR Pricing */}
      {variant.available_inr && variant.price_inr > 0 && (
        <div className="flex justify-between">
          <Badge className="bg-orange-500/20 text-orange-300 px-1 py-0">
              INR
            </Badge>  
          <span className="text-orange-400 line-through font-medium">
            ₹{variant.price_inr}
          </span>
          {variant.discount_inr && variant.discount_inr > 0 && (
            <span className="text-green-400 ml-2">
              ₹{variant.discount_inr}
            </span>
          )}
        </div>
      )}

      {/* Stock Info */}
      <div className="flex justify-between text-gray-300">
        <span>
          Stock:{" "}
          <span className="text-white font-medium">
            {variant.stock_quantity || 0}
          </span>
        </span>
        <span className="italic text-gray-400">
          {variant.stock_quantity > 0 ? "" : "Out of Stock"}
        </span>
      </div>
    </div>
  ))}
</CollapsibleContent>

                          </Collapsible>
                        ) : (
                          <div className="text-gray-400 text-xs">No variants</div>
                        )}
                      </div>
                    </TableCell>

      

                    {/* Status & Features Column */}
                    <TableCell>
                      <div className="space-y-2">
                        {/* Status Badges */}
                        <div className="flex flex-col gap-1">
                          <Badge variant={item.is_available ? "default" : "secondary"}>
                            {item.is_available ? "Available" : "Unavailable"}
                          </Badge>
                          {item.is_featured && (
                            <Badge className="bg-amber-500 text-black">Featured</Badge>
                          )}
                          {item.is_new && (
                            <Badge className="bg-green-500 text-white">New</Badge>
                          )}
                        </div>



                        {/* Created Date */}
                        {item.created_at && (
                          <div className="text-xs text-white">
                            {new Date(item.created_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell>
                      <div className="flex flex-col space-y-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(item)}
                          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 w-full justify-start"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full justify-start"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredItems.length === 0 && (
              <div className="text-center py-8">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                    <Store className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-lg font-medium">No products found</p>
                    <p className="text-gray-500 text-sm">Try adjusting your search or filter criteria</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}