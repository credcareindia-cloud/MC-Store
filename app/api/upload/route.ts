import { put, del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

// Image compression function
async function compressImage(buffer: ArrayBuffer, filename: string): Promise<ArrayBuffer> {
  // Dynamic import of sharp for server-side image processing
  const sharp = (await import('sharp')).default
  
  let sharpInstance = sharp(buffer)
  
  // Get image metadata
  const metadata = await sharpInstance.metadata()
  const originalSize = buffer.byteLength
  
  console.log(`Original image: ${filename}, Size: ${(originalSize / 1024 / 1024).toFixed(2)}MB, Dimensions: ${metadata.width}x${metadata.height}`)
  
  // If already under 1MB, return as-is
  if (originalSize <= 1024 * 1024) {
    console.log("Image already under 1MB, no compression needed")
    return buffer
  }
  
  // Determine output format - prefer WebP for better compression, fallback to JPEG
  const isWebPSupported = true // WebP is widely supported now
  const outputFormat = isWebPSupported ? 'webp' : 'jpeg'
  
  // Start with reasonable quality
  let quality = 80
  let compressed: Buffer
  
  // Progressive compression until we get under 1MB
  do {
    sharpInstance = sharp(buffer)
    
    // Resize if image is very large
    if (metadata.width && metadata.width > 1920) {
      sharpInstance = sharpInstance.resize(1920, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
    }
    
    // Apply format-specific compression
    if (outputFormat === 'webp') {
      compressed = await sharpInstance
        .webp({ quality, effort: 6 })
        .toBuffer()
    } else {
      compressed = await sharpInstance
        .jpeg({ quality, progressive: true })
        .toBuffer()
    }
    
    console.log(`Compressed with quality ${quality}: ${(compressed.length / 1024 / 1024).toFixed(2)}MB`)
    
    // Reduce quality for next iteration if still too large
    quality -= 10
    
    // Prevent infinite loop - if quality gets too low, break
    if (quality < 20) {
      console.log("Reached minimum quality, using current compression")
      break
    }
    
  } while (compressed.length > 1024 * 1024 && quality >= 20)
  
  // If still over 1MB, try more aggressive resizing
  if (compressed.length > 1024 * 1024) {
    console.log("Still over 1MB, applying aggressive resizing...")
    sharpInstance = sharp(buffer)
      .resize(1280, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
    
    if (outputFormat === 'webp') {
      compressed = await sharpInstance.webp({ quality: 70, effort: 6 }).toBuffer()
    } else {
      compressed = await sharpInstance.jpeg({ quality: 70, progressive: true }).toBuffer()
    }
  }
  
  console.log(`Final compressed size: ${(compressed.length / 1024 / 1024).toFixed(2)}MB`)
  
  return compressed.buffer
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get("filename")

    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 })
    }

    // Read token from env - required by the Blob SDK
    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) {
      return NextResponse.json(
        {
          error:
            "Image upload unavailable: BLOB_READ_WRITE_TOKEN is not set. " +
            "Add a Vercel Blob store to your project or define the env var.",
        },
        { status: 500 },
      )
    }

    if (!request.body) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert ReadableStream to ArrayBuffer
    const reader = request.body.getReader()
    const chunks: Uint8Array[] = []
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
    
    // Combine chunks into a single ArrayBuffer
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    const buffer = new ArrayBuffer(totalLength)
    const uint8Array = new Uint8Array(buffer)
    let offset = 0
    
    for (const chunk of chunks) {
      uint8Array.set(chunk, offset)
      offset += chunk.length
    }

    // Check if it's an image file
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filename)
    
    let finalBuffer: ArrayBuffer = buffer
    let finalFilename = filename
    
    if (isImage) {
      try {
        // Compress the image
        finalBuffer = await compressImage(buffer, filename)
        
        // Update filename extension if we converted to WebP
        if (filename.match(/\.(jpg|jpeg|png)$/i) && finalBuffer.byteLength < buffer.byteLength) {
          finalFilename = filename.replace(/\.(jpg|jpeg|png)$/i, '.webp')
        }
        
      } catch (compressionError) {
        console.error("Image compression failed, uploading original:", compressionError)
        // If compression fails, upload original file
        finalBuffer = buffer
        finalFilename = filename
      }
    }

    const blob = await put(finalFilename, finalBuffer, {
      access: "public",
      token,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const urlToDelete = searchParams.get("url")
    
    if (!urlToDelete) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) {
      return NextResponse.json(
        { error: "Image deletion unavailable: BLOB_READ_WRITE_TOKEN is not set." },
        { status: 500 }
      )
    }

    // Delete using the full URL
    await del(urlToDelete, { token })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting file:", error)
    return NextResponse.json(
      { error: "Failed to delete file", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}