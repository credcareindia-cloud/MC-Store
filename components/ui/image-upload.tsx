"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import Image from "next/image"

interface MultipleImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  label?: string
  maxImages?: number
  className?: string
}

export default function MultipleImageUpload({ 
  value = [], 
  onChange, 
  label = "Product Images", 
  maxImages = 2,
  className = "" 
}: MultipleImageUploadProps) {
  const [uploading, setUploading] = useState<number[]>([]) // Track which slots are uploading
  const [errors, setErrors] = useState<{ [key: number]: string }>({})
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors(prev => ({ ...prev, [index]: "Please select an image file" }))
      return
    }

    // File size validation (10MB limit since compression happens on server)
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [index]: "File size must be less than 10MB" }))
      return
    }

    setUploading(prev => [...prev, index])
    setErrors(prev => ({ ...prev, [index]: "" }))

    try {
      const filename = `product-${Date.now()}-${index}-${file.name}`
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
        method: "POST",
        body: file,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const { url } = await response.json()
      
      // Update the images array
      const newImages = [...value]
      newImages[index] = url
      onChange(newImages)

    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        [index]: error instanceof Error ? error.message : "Upload failed" 
      }))
    } finally {
      setUploading(prev => prev.filter(i => i !== index))
    }
  }

  const handleRemove = async (index: number) => {
    const imageUrl = value[index]
    
    // Delete from Vercel Blob if URL exists
    if (imageUrl) {
      try {
        const response = await fetch(`/api/upload?url=${encodeURIComponent(imageUrl)}`, {
          method: "DELETE",
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error("Delete failed:", errorData)
        }
      } catch (error) {
        console.error("Failed to delete image blob:", error)
      }
    }

    // Remove from array by filtering out the index
    const newImages = value.filter((_, i) => i !== index)
    onChange(newImages)
    
    // Clear the file input
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]!.value = ""
    }
    
    // Clear any errors for this slot
    setErrors(prev => ({ ...prev, [index]: "" }))
  }

  return (
    <div className={className}>
      <Label className="text-white font-medium">{label} (Max {maxImages})</Label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        {Array.from({ length: maxImages }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Label className="text-sm text-gray-400">Image {index + 1}</Label>
            
            {value[index] ? (
              // Show uploaded image
              <div className="relative">
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-600 bg-gray-800">
                  <Image
                    src={value[index]}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 w-7 h-7 p-0 rounded-full"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              // Show upload area
              <div className="space-y-2">
                <div
                  onClick={() => fileInputRefs.current[index]?.click()}
                  className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition-colors bg-gray-800/50"
                >
                  {uploading.includes(index) ? (
                    <>
                      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
                      <span className="text-sm text-gray-400">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-400">Click to upload</span>
                      <span className="text-xs text-gray-500">JPG, PNG, WebP (Max 10MB)</span>
                    </>
                  )}
                </div>

                <input
                  ref={el => fileInputRefs.current[index] = el}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, index)}
                  className="hidden"
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRefs.current[index]?.click()}
                  disabled={uploading.includes(index)}
                  className="w-full border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading.includes(index) ? "Uploading..." : "Choose File"}
                </Button>
              </div>
            )}

            {/* Error message for this slot */}
            {errors[index] && (
              <p className="text-red-400 text-sm">{errors[index]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-1">
        <p className="text-gray-500 text-xs">
          Upload up to {maxImages} images for this product. Images will be automatically compressed.
        </p>
        <p className="text-gray-500 text-xs">
          The first image will be used as the main product image in listings.
        </p>
      </div>
    </div>
  )
}