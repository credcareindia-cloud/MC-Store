"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ReturnStatusBadge } from "./return-status-badge"
import { Package, Calendar, Loader2, AlertCircle, Ban, ImageIcon } from "lucide-react"
import Image from "next/image"
import toast from "react-hot-toast"

interface ReturnItem {
  id: number
  order_item_id?: number
  product_name: string
  variant_name?: string
  product_image_url?: string
  quantity: number
  unit_price: number | string
  reason: string
  notes?: string
}

export interface ReturnRequestDetails {
  id: number
  ecommerce_return_request_id: string
  order_id: number
  order_number: string
  status: string
  reason: string
  notes?: string
  created_at: string
  items: ReturnItem[]
  images?: string[]
}

interface ViewReturnModalProps {
  isOpen: boolean
  onClose: () => void
  returnRequest: ReturnRequestDetails | null
  onStatusChange?: () => void
}

export function ViewReturnModal({
  isOpen,
  onClose,
  returnRequest,
  onStatusChange
}: ViewReturnModalProps) {
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  if (!returnRequest) return null

  const handleCancelReturn = async () => {
    if (!window.confirm("Are you sure you want to cancel this return request?")) {
      return
    }

    setIsCancelling(true)
    setCancelError(null)

    try {
      const res = await fetch(`/api/returns/${returnRequest.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })

      const data = await res.json()

      if (!res.ok) {
        setCancelError(data.error || "Failed to cancel return request.")
        return
      }

      toast.success("Return request has been cancelled.")
      if (onStatusChange) onStatusChange()
      onClose()
    } catch (err) {
      console.error("Error cancelling return:", err)
      setCancelError("A network error occurred while cancelling.")
    } finally {
      setIsCancelling(false)
    }
  }

  const isPending = returnRequest.status?.toLowerCase() === "pending"

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto sm:rounded-2xl p-4 sm:p-6 bg-white">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-6">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-zinc-900">
              Return Request
            </DialogTitle>
            <ReturnStatusBadge status={returnRequest.status} />
          </div>
          <DialogDescription className="text-xs sm:text-sm text-zinc-500 mt-1">
            Ref ID: <span className="font-mono text-zinc-700 font-medium">{returnRequest.ecommerce_return_request_id}</span> • Order #{returnRequest.order_number}
          </DialogDescription>
        </DialogHeader>

        {cancelError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs sm:text-sm text-red-800 my-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>{cancelError}</div>
          </div>
        )}

        <div className="space-y-4 my-2 text-sm">
          {/* Metadata banner */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 flex flex-wrap justify-between gap-3 text-xs">
            <div>
              <span className="text-zinc-500 block">Requested Date:</span>
              <span className="font-semibold text-zinc-900">
                {new Date(returnRequest.created_at).toLocaleDateString()} at{" "}
                {new Date(returnRequest.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">Primary Reason:</span>
              <span className="font-semibold text-zinc-900">{returnRequest.reason || "Damaged product"}</span>
            </div>
          </div>

          {/* Items returned */}
          <div>
            <h4 className="font-semibold text-zinc-900 mb-2">Requested Item(s)</h4>
            <div className="space-y-2.5">
              {returnRequest.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-xl shadow-xs"
                >
                  <div className="w-12 h-12 rounded-lg bg-zinc-100 border flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.product_image_url ? (
                      <Image
                        src={item.product_image_url}
                        alt={item.product_name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-5 h-5 text-zinc-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-zinc-900 text-sm leading-tight truncate">
                      {item.product_name}
                    </h5>
                    {item.variant_name && item.variant_name !== "Default" && (
                      <p className="text-xs text-zinc-500 mt-0.5">Variant: {item.variant_name}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-zinc-100 text-zinc-800 text-xs font-semibold px-2 py-0.5 rounded">
                        Qty: {item.quantity}
                      </span>
                      {item.reason && (
                        <span className="text-xs text-zinc-600 truncate">• {item.reason}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Return Notes */}
          {returnRequest.notes && (
            <div>
              <h4 className="font-semibold text-zinc-900 mb-1">Additional Notes</h4>
              <p className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-700 whitespace-pre-line">
                {returnRequest.notes}
              </p>
            </div>
          )}

          {/* Return Images */}
          {Array.isArray(returnRequest.images) && returnRequest.images.length > 0 && (
            <div>
              <h4 className="font-semibold text-zinc-900 mb-1.5 flex items-center gap-1.5 text-xs">
                <ImageIcon className="w-3.5 h-3.5 text-zinc-600" /> Attached Proof Images
              </h4>
              <div className="flex flex-wrap gap-2">
                {returnRequest.images.map((imgUrl, idx) => (
                  <a
                    key={idx}
                    href={imgUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative w-16 h-16 rounded-lg border overflow-hidden hover:opacity-90 transition-opacity"
                  >
                    <Image src={imgUrl} alt={`Proof image ${idx + 1}`} fill className="object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-zinc-100 flex-col sm:flex-row gap-2 sm:gap-0">
          {isPending && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancelReturn}
              disabled={isCancelling}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-medium gap-1.5"
            >
              {isCancelling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Ban className="w-4 h-4" />
              )}
              Cancel Return Request
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
