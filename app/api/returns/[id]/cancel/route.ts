import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { ensureReturnTablesExist } from "@/lib/db/returns-schema"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
)

async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value
    if (!token) return null

    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      userId: payload.userId as number | string,
      email: (payload.email as string) || "",
    }
  } catch {
    return null
  }
}

/**
 * POST /api/returns/[id]/cancel
 * Customer cancels their own pending return request.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
    }

    await ensureReturnTablesExist()
    const { id } = await params
    const returnRequestId = Number(id)

    if (isNaN(returnRequestId)) {
      return NextResponse.json({ error: "Invalid return request ID" }, { status: 400 })
    }

    // 1. Fetch return request
    const existingRequests = await sql`
      SELECT * FROM return_requests WHERE id = ${returnRequestId} LIMIT 1
    `

    if (existingRequests.length === 0) {
      return NextResponse.json({ error: "Return request not found." }, { status: 404 })
    }

    const returnRequest = existingRequests[0]

    // 2. Validate customer ownership
    const userIdStr = user.userId.toString()
    const userEmailStr = (user.email || "").toLowerCase()
    const isOwner =
      returnRequest.user_id?.toString() === userIdStr ||
      (returnRequest.customer_email || "").toLowerCase() === userEmailStr

    if (!isOwner) {
      return NextResponse.json(
        { error: "Forbidden. You cannot modify another customer's return request." },
        { status: 403 }
      )
    }

    // 3. Enforce status check: CANCEL ONLY allowed when status === 'pending'
    if (returnRequest.status.toLowerCase() !== "pending") {
      return NextResponse.json(
        {
          error: `Cannot cancel return request #${returnRequest.ecommerce_return_request_id}. Current status is '${returnRequest.status}'. Only pending return requests can be cancelled.`
        },
        { status: 400 }
      )
    }

    // 4. Update status to cancelled
    const updatedRecords = await sql`
      UPDATE return_requests
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${returnRequestId}
      RETURNING *
    `

    return NextResponse.json({
      message: "Return request cancelled successfully.",
      return_request: updatedRecords[0]
    })
  } catch (error) {
    console.error("Error cancelling return request:", error)
    return NextResponse.json(
      { error: "Failed to cancel return request", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
