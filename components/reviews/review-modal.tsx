"use client"

import { useEffect, useState } from "react"
import { Star, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface PendingReview {
  product_id: number
  order_id: number
  product_name: string
  product_image_url?: string
}

export default function ReviewModal({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState("")
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return

    // Don't pop up again if dismissed in current session
    if (sessionStorage.getItem("dismissedReviewModal") === "true") return

    const checkPendingReviews = async () => {
      try {
        const res = await fetch("/api/reviews/pending")
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setPendingReviews(data)
            setCurrentIndex(0) // Open the modal at index 0
          }
        }
      } catch (err) {
        console.error("Failed to fetch pending reviews:", err)
      }
    }

    checkPendingReviews()
  }, [isAuthenticated])

  const handleClose = () => {
    sessionStorage.setItem("dismissedReviewModal", "true")
    setCurrentIndex(-1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentIndex < 0 || currentIndex >= pendingReviews.length) return

    const currentItem = pendingReviews[currentIndex]
    setSubmitting(true)

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: currentItem.product_id,
          orderId: currentItem.order_id,
          rating: rating,
          review: reviewText,
        }),
      })

      if (res.ok) {
        setReviewText("")
        setRating(5)
        
        // Move to the next review or close
        if (currentIndex + 1 < pendingReviews.length) {
          setCurrentIndex(currentIndex + 1)
        } else {
          setCurrentIndex(-1)
          sessionStorage.setItem("dismissedReviewModal", "true")
        }
      } else {
        const errData = await res.json()
        alert(errData.error || "Failed to submit review")
      }
    } catch (err) {
      console.error(err)
      alert("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (currentIndex < 0 || currentIndex >= pendingReviews.length) return null

  const currentItem = pendingReviews[currentIndex]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">Share Your Feedback</h3>
          <button 
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="text-center text-sm text-gray-500">
            You recently received this item. How was your experience?
          </div>

          {/* Product details */}
          <div className="flex items-center gap-4 bg-stone-50 p-3 rounded-xl border border-gray-200">
            <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0 border border-gray-200">
              <Image
                src={currentItem.product_image_url || "/placeholder.svg"}
                alt={currentItem.product_name}
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-gray-900 truncate uppercase">
                {currentItem.product_name}
              </h4>
              <p className="text-xs text-gray-400">Order Ref: #{currentItem.order_id}</p>
            </div>
          </div>

          {/* Star selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 text-center">
              Your Rating
            </label>
            <div className="flex justify-center items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isSelected = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform active:scale-95 text-gray-300"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star 
                      className={`w-10 h-10 transition-colors ${
                        isSelected 
                          ? "fill-red-600 text-red-600" 
                          : "text-gray-300"
                      }`} 
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review text field */}
          <div className="space-y-2">
            <label htmlFor="review-text" className="block text-xs font-bold uppercase tracking-wider text-gray-700">
              Write a Review
            </label>
            <textarea
              id="review-text"
              required
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell us about the quality, shipping, or overall experience..."
              className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 placeholder-gray-400 bg-white text-gray-900"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 py-3 text-sm font-semibold rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 text-sm font-bold uppercase tracking-wider bg-red-600 text-white rounded-xl hover:bg-red-700"
            >
              {submitting ? "Submitting..." : pendingReviews.length > currentIndex + 1 ? "Next Review" : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
