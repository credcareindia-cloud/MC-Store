import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextRequest, NextResponse } from "next/server"
import { getAdminFromRequest } from "@/lib/admin-auth"

export const runtime = "nodejs"

const MAX_BYTES = 50 * 1024 * 1024

export async function POST(request: NextRequest) {
  const rwToken = process.env.BLOB_READ_WRITE_TOKEN
  if (!rwToken) {
    return NextResponse.json(
      { error: "Image upload unavailable: BLOB_READ_WRITE_TOKEN is not set." },
      { status: 500 },
    )
  }

  let body: HandleUploadBody
  try {
    body = (await request.json()) as HandleUploadBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (body.type === "blob.generate-client-token") {
    const admin = await getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  try {
    const result = await handleUpload({
      request,
      token: rwToken,
      body,
      onBeforeGenerateToken: async (pathname, _clientPayload, _multipart) => {
        if (!pathname || pathname.includes("..") || pathname.startsWith("/")) {
          throw new Error("Invalid pathname")
        }
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
        }
      },
      onUploadCompleted: async () => {},
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Blob client-upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    )
  }
}
