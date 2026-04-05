"use client"

import imageCompression from "browser-image-compression"

export interface CompressionResult {
  file: File
  originalSizeKB: number
  compressedSizeKB: number
  saved: boolean
}

const KB = 1024
const MB = 1024 * KB

/**
 * Compress an image client-side before upload.
 *
 * Targets:
 *  - Max 1 MB output (most e-commerce product images land around 200-800 KB)
 *  - Max 1920px on the longest side
 *  - WebP output when the browser supports it
 *  - Preserves EXIF orientation then strips metadata
 */
export async function compressImage(file: File): Promise<CompressionResult> {
  const originalSizeKB = Math.round(file.size / KB)

  // Already tiny — skip compression to avoid quality loss
  if (file.size <= 200 * KB) {
    return { file, originalSizeKB, compressedSizeKB: originalSizeKB, saved: false }
  }

  const options: Parameters<typeof imageCompression>[1] = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.82,
    preserveExif: false,
  }

  try {
    const compressed = await imageCompression(file, options)

    // Only use compressed version if it's actually smaller
    if (compressed.size >= file.size) {
      return { file, originalSizeKB, compressedSizeKB: originalSizeKB, saved: false }
    }

    const compressedSizeKB = Math.round(compressed.size / KB)

    // Rename to .webp extension
    const webpName = file.name.replace(/\.(jpe?g|png|gif|bmp|tiff?)$/i, ".webp")
    const finalFile = new File([compressed], webpName, { type: "image/webp" })

    return { file: finalFile, originalSizeKB, compressedSizeKB, saved: true }
  } catch (err) {
    console.warn("Client-side compression failed, uploading original:", err)
    return { file, originalSizeKB, compressedSizeKB: originalSizeKB, saved: false }
  }
}
