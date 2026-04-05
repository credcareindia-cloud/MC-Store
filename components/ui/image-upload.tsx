"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { upload } from "@vercel/blob/client"
import { compressImage } from "@/lib/compress-image"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon, Loader2, GripVertical, Plus } from "lucide-react"
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
  maxImages = 4,
  className = "" 
}: MultipleImageUploadProps) {
  const [uploadingSlots, setUploadingSlots] = useState<Set<number>>(new Set())
  const [errors, setErrors] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)
  const batchInputRef = useRef<HTMLInputElement | null>(null)
  const slotInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const slotsAvailable = maxImages - value.length
  const isUploading = uploadingSlots.size > 0

  const uploadSingleFile = async (file: File, targetIndex: number): Promise<{ url: string; index: number } | null> => {
    if (!file.type.startsWith("image/")) return null
    if (file.size > 50 * 1024 * 1024) return null

    try {
      const { file: optimized, saved, originalSizeKB, compressedSizeKB } = await compressImage(file)
      if (saved) {
        console.log(`Image: ${originalSizeKB} KB → ${compressedSizeKB} KB`)
      }

      const safeName = optimized.name.replace(/[^\w.-]/g, "_").slice(0, 180) || "image.webp"
      const pathname = `products/${Date.now()}-${targetIndex}-${safeName}`

      const blob = await upload(pathname, optimized, {
        access: "public",
        handleUploadUrl: "/api/blob/client-upload",
        multipart: optimized.size > 4 * 1024 * 1024,
      })

      return { url: blob.url, index: targetIndex }
    } catch (error) {
      console.error(`Upload failed for file ${file.name}:`, error)
      return null
    }
  }

  const handleBatchUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith("image/"))
    if (fileArray.length === 0) return

    const available = maxImages - value.length
    const filesToUpload = fileArray.slice(0, available)

    if (fileArray.length > available) {
      setErrors([`Only ${available} slot(s) available. ${fileArray.length - available} file(s) skipped.`])
    } else {
      setErrors([])
    }

    const startIndex = value.length
    const indices = filesToUpload.map((_, i) => startIndex + i)

    setUploadingSlots(prev => {
      const next = new Set(prev)
      indices.forEach(i => next.add(i))
      return next
    })

    const results = await Promise.allSettled(
      filesToUpload.map((file, i) => uploadSingleFile(file, indices[i]))
    )

    const newImages = [...value]
    const failedFiles: string[] = []

    results.forEach((result, i) => {
      if (result.status === "fulfilled" && result.value) {
        newImages.push(result.value.url)
      } else {
        failedFiles.push(filesToUpload[i].name)
      }
    })

    if (failedFiles.length > 0) {
      setErrors(prev => [...prev, `Failed: ${failedFiles.join(", ")}`])
    }

    onChange(newImages)
    setUploadingSlots(new Set())

    if (batchInputRef.current) batchInputRef.current.value = ""
  }, [value, maxImages, onChange])

  const handleSlotReplace = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith("image/")) return

    setUploadingSlots(prev => new Set(prev).add(index))

    const result = await uploadSingleFile(file, index)
    if (result) {
      const newImages = [...value]
      newImages[index] = result.url
      onChange(newImages)
    }

    setUploadingSlots(prev => {
      const next = new Set(prev)
      next.delete(index)
      return next
    })
  }

  const handleRemove = async (index: number) => {
    const imageUrl = value[index]
    if (imageUrl) {
      try {
        await fetch(`/api/upload?url=${encodeURIComponent(imageUrl)}`, { method: "DELETE" })
      } catch (error) {
        console.error("Failed to delete image blob:", error)
      }
    }
    const newImages = value.filter((_, i) => i !== index)
    onChange(newImages)
    setErrors([])
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      handleBatchUpload(e.dataTransfer.files)
    }
  }, [handleBatchUpload])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  return (
    <div className={className}>
      <Label className="text-white font-medium">{label} ({value.length}/{maxImages})</Label>

      {/* Uploaded images grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          {value.map((url, index) => (
            <div key={`${url}-${index}`} className="relative group">
              <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-600 bg-gray-800">
                {uploadingSlots.has(index) ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800">
                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mb-1" />
                    <span className="text-xs text-gray-400">Replacing...</span>
                  </div>
                ) : (
                  <Image
                    src={url}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover cursor-pointer"
                    onClick={() => slotInputRefs.current[index]?.click()}
                  />
                )}
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 bg-cyan-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    MAIN
                  </span>
                )}
              </div>
              <Button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 w-6 h-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                size="sm"
              >
                <X className="w-3 h-3" />
              </Button>
              <input
                ref={el => { slotInputRefs.current[index] = el }}
                type="file"
                accept="image/*"
                onChange={(e) => handleSlotReplace(e, index)}
                className="hidden"
              />
            </div>
          ))}
        </div>
      )}

      {/* Batch upload zone */}
      {slotsAvailable > 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragOver(false)}
          onClick={() => !isUploading && batchInputRef.current?.click()}
          className={`mt-3 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all py-6 ${
            dragOver
              ? "border-cyan-400 bg-cyan-400/10"
              : isUploading
                ? "border-gray-600 bg-gray-800/30 cursor-wait"
                : "border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800/70"
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
              <span className="text-sm text-gray-300">
                Uploading {uploadingSlots.size} image{uploadingSlots.size > 1 ? 's' : ''}...
              </span>
              <span className="text-xs text-gray-500 mt-1">Compressing & uploading in parallel</span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Plus className="w-5 h-5 text-gray-400" />
                <ImageIcon className="w-5 h-5 text-gray-400" />
              </div>
              <span className="text-sm text-gray-300">
                {value.length === 0
                  ? `Drop images here or click to select (up to ${maxImages})`
                  : `Add ${slotsAvailable} more image${slotsAvailable > 1 ? 's' : ''}`
                }
              </span>
              <span className="text-xs text-gray-500 mt-1">
                Select multiple files at once — they upload in parallel
              </span>
            </>
          )}
        </div>
      )}

      <input
        ref={batchInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => e.target.files && handleBatchUpload(e.target.files)}
        className="hidden"
      />

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-2 space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-red-400 text-xs">{err}</p>
          ))}
        </div>
      )}

      <div className="mt-2 space-y-0.5">
        <p className="text-gray-500 text-xs">
          Auto-compressed to WebP (≤ 1 MB). First image is the main listing image.
        </p>
        <p className="text-gray-500 text-xs">
          Click any uploaded image to replace it.
        </p>
      </div>
    </div>
  )
}
