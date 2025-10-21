"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  className?: string
}

export default function ImageUploadSingle({ value, onChange, label = "Image", className = "" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB")
      return
    }

    setUploading(true)
    setError(null)

    try {
      const filename = `${Date.now()}-${file.name}`
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
        method: "POST",
        body: file,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const { url } = await response.json()
      onChange(url)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={className}>
      <Label>{label}</Label>

      {value ? (
        <div className="mt-2 relative">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-600">
            <Image src={value || "/placeholder.svg"} alt="Uploaded image" fill className="object-cover" />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="mt-2">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-32 h-32 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition-colors"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            ) : (
              <>
                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-400">Click to upload</span>
              </>
            )}
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

          <div className="flex items-center space-x-2 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="border-gray-600 bg-transparent text-gray-300"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Uploading..." : "Choose File"}
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

      <p className="text-gray-500 text-xs mt-1">Supports: JPG, PNG, GIF (max 5MB)</p>
    </div>
  )
}