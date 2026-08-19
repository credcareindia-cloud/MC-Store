import React from "react"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, XCircle, Ban, CheckCheck } from "lucide-react"

interface ReturnStatusBadgeProps {
  status: string
  className?: string
}

export function ReturnStatusBadge({ status, className = "" }: ReturnStatusBadgeProps) {
  const s = (status || "pending").toLowerCase()

  switch (s) {
    case "pending":
    case "pending review":
      return (
        <Badge variant="outline" className={`bg-amber-50 text-amber-800 border-amber-300 font-medium gap-1 px-2.5 py-1 ${className}`}>
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span>Pending Review</span>
        </Badge>
      )

    case "approved":
      return (
        <Badge variant="outline" className={`bg-emerald-50 text-emerald-800 border-emerald-300 font-medium gap-1 px-2.5 py-1 ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Approved</span>
        </Badge>
      )

    case "rejected":
      return (
        <Badge variant="outline" className={`bg-red-50 text-red-800 border-red-300 font-medium gap-1 px-2.5 py-1 ${className}`}>
          <XCircle className="w-3.5 h-3.5 text-red-600" />
          <span>Rejected</span>
        </Badge>
      )

    case "cancelled":
    case "canceled":
      return (
        <Badge variant="outline" className={`bg-zinc-100 text-zinc-700 border-zinc-300 font-medium gap-1 px-2.5 py-1 ${className}`}>
          <Ban className="w-3.5 h-3.5 text-zinc-500" />
          <span>Cancelled</span>
        </Badge>
      )

    case "completed":
      return (
        <Badge variant="outline" className={`bg-blue-50 text-blue-800 border-blue-300 font-medium gap-1 px-2.5 py-1 ${className}`}>
          <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Completed</span>
        </Badge>
      )

    default:
      return (
        <Badge variant="outline" className={`bg-gray-100 text-gray-800 border-gray-300 font-medium px-2.5 py-1 ${className}`}>
          {status}
        </Badge>
      )
  }
}
