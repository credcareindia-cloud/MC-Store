"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { RETURN_REASONS, isItemEligibleForReturn, ActiveReturnItem } from "@/lib/utils/return-eligibility"
import { Package, AlertCircle, Upload, X, Loader2, CheckCircle2, RotateCcw } from "lucide-react"
import Image from "next/image"
import toast from "react-hot-toast"

interface OrderItem {
  id: number
  menu_item_name: string
  quantity: number
  unit_price: number | string
  total_price: number | string
  product_image_url?: string
  variant_name?: string
}

interface Order {
  id: number
  order_number: string
  created_at: string
  updated_at?: string
  delivered_at?: string
  status: string
  currency: string
  items: OrderItem[]
}

interface ReturnRequestModalProps {
  isOpen: boolean
  onClose: () => void
  order: Order | null
  existingReturnItems?: ActiveReturnItem[]
  onSuccess: () => void
}

export function ReturnRequestModal({
  isOpen,
  onClose,
  order,
  existingReturnItems = [],
  onSuccess
}: ReturnRequestModalProps) {
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([])
  const [itemQuantities, setItemQuantities] = useState<Record<number, number>>({})
  const [reason, setReason] = useState<string>("Damaged product")
  const [notes, setNotes] = useState<string>("")
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Initialize selected item state when modal opens or order changes
  useEffect(() => {
    if (order && order.items) {
      // Pre-select first eligible item if available
      const initialSelected: number[] = []
      const initialQtys: Record<number, number> = {}

      order.items.forEach((item) => {
        const { canReturn, remainingReturnableQty } = isItemEligibleForReturn(item, existingReturnItems)
        initialQtys[item.id] = remainingReturnableQty > 0 ? 1 : 0
        if (canReturn && remainingReturnableQty > 0 && initialSelected.length === 0) {
          initialSelected.push(item.id)
        }
      })

      setSelectedItemIds(initialSelected)
      setItemQuantities(initialQtys)
      setReason("Damaged product")
      setNotes("")
      setImageUrls([])
      setFormError(null)
    }
  }, [order, existingReturnItems, isOpen])

  if (!order) return null

  const handleToggleItem = (itemId: number, canReturn: boolean, maxQty: number) => {
    if (!canReturn || maxQty <= 0) return

    setSelectedItemIds((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId)
      } else {
        return [...prev, itemId]
      }
    })
  }

  const handleQuantityChange = (itemId: number, delta: number, maxQty: number) => {
    setItemQuantities((prev) => {
      const current = prev[itemId] || 1
      const updated = Math.min(maxQty, Math.max(1, current + delta))
      return { ...prev, [itemId]: updated }
    })
  }

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        if (file.size > 300 * 1024) {
          const img = document.createElement("img")
          img.src = result
          img.onload = () => {
            const canvas = document.createElement("canvas")
            const maxDim = 1000
            let width = img.width
            let height = img.height

            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width)
                width = maxDim
              } else {
                width = Math.round((width * maxDim) / height)
                height = maxDim
              }
            }

            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext("2d")
            ctx?.drawImage(img, 0, 0, width, height)
            resolve(canvas.toDataURL("image/jpeg", 0.75))
          }
          img.onerror = () => resolve(result)
        } else {
          resolve(result)
        }
      }
      reader.onerror = (err) => reject(err)
      reader.readAsDataURL(file)
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (imageUrls.length >= 4) {
      toast.error("You can upload up to 4 images per return request.")
      e.target.value = ""
      return
    }

    const file = files[0]
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Image file must be under 15MB.")
      e.target.value = ""
      return
    }

    setUploadingImage(true)
    try {
      // 1. Try server upload first
      let uploadedUrl: string | null = null
      try {
        const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
          method: "POST",
          body: file
        })

        if (response.ok) {
          const data = await response.json()
          if (data.url) {
            uploadedUrl = data.url
          }
        }
      } catch (srvErr) {
        console.log("Server blob upload failed/unavailable, using local compressed Data URL fallback.")
      }

      // 2. If server upload was not available or failed, fallback to local Data URL
      if (!uploadedUrl) {
        uploadedUrl = await readFileAsDataUrl(file)
      }

      setImageUrls((prev) => [...prev, uploadedUrl!])
      toast.success("Image attached successfully.")
    } catch (err) {
      console.error("Image processing error:", err)
      toast.error("Failed to attach image.")
    } finally {
      setUploadingImage(false)
      e.target.value = ""
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (selectedItemIds.length === 0) {
      setFormError("Please select at least one item to return.")
      return
    }

    const itemsToSubmit = selectedItemIds.map((itemId) => ({
      order_item_id: itemId,
      quantity: itemQuantities[itemId] || 1,
      reason,
      notes
    }))

    setIsSubmitting(true)

    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          order_id: order.id,
          items: itemsToSubmit,
          reason,
          notes,
          image_urls: imageUrls
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setFormError(data.error || "Failed to submit return request.")
        return
      }

      toast.success("Return request submitted successfully!")
      onSuccess()
      onClose()
    } catch (err) {
      console.error("Error submitting return request:", err)
      setFormError("A network error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const deliveredDate = order.delivered_at
    ? new Date(order.delivered_at).toLocaleDateString()
    : order.updated_at
    ? new Date(order.updated_at).toLocaleDateString()
    : new Date(order.created_at).toLocaleDateString()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:rounded-2xl p-4 sm:p-6 bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-zinc-900">
            <RotateCcw className="w-6 h-6 text-zinc-800" />
            Request Return
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-zinc-600">
            Order #{order.order_number} • Delivered on {deliveredDate}
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs sm:text-sm text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>{formError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Select Products to Return */}
          <div>
            <Label className="text-sm font-semibold text-zinc-900 mb-2 block">
              Select Product(s) to Return
            </Label>
            <p className="text-xs text-zinc-500 mb-3">
              Choose which item(s) you wish to return and adjust the requested quantity.
            </p>

            <div className="space-y-3">
              {order.items?.map((item) => {
                const { canReturn, reason: ineligibleReason, remainingReturnableQty } = isItemEligibleForReturn(
                  item,
                  existingReturnItems
                )
                const isSelected = selectedItemIds.includes(item.id)
                const currentQty = itemQuantities[item.id] || 1

                return (
                  <div
                    key={item.id}
                    className={`border rounded-xl p-3.5 transition-all ${
                      isSelected
                        ? "border-zinc-900 bg-zinc-50/60 shadow-sm"
                        : canReturn
                        ? "border-zinc-200 bg-white hover:border-zinc-300"
                        : "border-zinc-200 bg-zinc-50/80 opacity-70"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-1">
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={isSelected}
                          disabled={!canReturn || remainingReturnableQty <= 0}
                          onCheckedChange={() => handleToggleItem(item.id, canReturn, remainingReturnableQty)}
                        />
                      </div>

                      {/* Product Thumbnail */}
                      <div className="w-12 h-12 rounded-lg bg-zinc-100 border flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.product_image_url ? (
                          <Image
                            src={item.product_image_url}
                            alt={item.menu_item_name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-zinc-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={`item-${item.id}`}
                          className="font-semibold text-sm text-zinc-900 cursor-pointer hover:underline block leading-snug"
                        >
                          {item.menu_item_name}
                        </label>
                        {item.variant_name && item.variant_name !== "Default" && (
                          <p className="text-xs text-zinc-500 mt-0.5">Variant: {item.variant_name}</p>
                        )}
                        <p className="text-xs text-zinc-600 mt-1">
                          Purchased Qty: <span className="font-semibold text-zinc-900">{item.quantity}</span>
                        </p>

                        {!canReturn && ineligibleReason && (
                          <div className="mt-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-2.5 py-1 inline-flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            {ineligibleReason}
                          </div>
                        )}
                      </div>

                      {/* Quantity Selector */}
                      {isSelected && canReturn && remainingReturnableQty > 0 && (
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-[11px] font-medium text-zinc-500">Return Qty</span>
                          <div className="flex items-center border border-zinc-300 rounded-lg overflow-hidden bg-white">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, -1, remainingReturnableQty)}
                              disabled={currentQty <= 1}
                              className="px-2.5 py-1 text-xs font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-bold text-zinc-900">{currentQty}</span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, 1, remainingReturnableQty)}
                              disabled={currentQty >= remainingReturnableQty}
                              className="px-2.5 py-1 text-xs font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-[10px] text-zinc-400">Max: {remainingReturnableQty}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Return Reason Select */}
          <div>
            <Label htmlFor="return-reason" className="text-sm font-semibold text-zinc-900 mb-1.5 block">
              Reason for Return <span className="text-red-500">*</span>
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="return-reason" className="w-full bg-white border-zinc-300">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent className="bg-white border-zinc-200 z-[10005]">
                {RETURN_REASONS.map((r) => (
                  <SelectItem key={r} value={r} className="cursor-pointer">
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Notes Textarea */}
          <div>
            <Label htmlFor="return-notes" className="text-sm font-semibold text-zinc-900 mb-1.5 block">
              Additional Details / Description
            </Label>
            <Textarea
              id="return-notes"
              placeholder="Please describe the issue in detail (e.g. specific damage, defect, missing components)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-white border-zinc-300 text-sm"
            />
          </div>

          {/* Image Upload Attachments */}
          <div>
            <Label className="text-sm font-semibold text-zinc-900 mb-1.5 block">
              Proof Images (Optional)
            </Label>
            <p className="text-xs text-zinc-500 mb-2">
              Upload up to 4 images showing damaged packaging, defect, or wrong item received.
            </p>

            <div className="flex flex-wrap gap-2.5 items-center">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-lg border overflow-hidden group">
                  <Image src={url} alt={`Proof ${idx + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {imageUrls.length < 4 && (
                <label className="w-16 h-16 rounded-lg border-2 border-dashed border-zinc-300 hover:border-zinc-500 flex flex-col items-center justify-center cursor-pointer bg-zinc-50 hover:bg-zinc-100 transition-colors">
                  {uploadingImage ? (
                    <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-zinc-500 mb-1" />
                      <span className="text-[10px] text-zinc-600 font-medium">Add</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-zinc-100 flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || selectedItemIds.length === 0}
              className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                "Submit Return Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
