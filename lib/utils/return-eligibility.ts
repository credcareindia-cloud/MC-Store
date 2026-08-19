/**
 * lib/utils/return-eligibility.ts
 *
 * Centralized business logic for evaluating return request eligibility.
 * Do not duplicate this logic across React components.
 */

export const DEFAULT_RETURN_WINDOW_DAYS = 7

export interface OrderItemForEligibility {
  id: number
  menu_item_name?: string
  quantity: number
}

export interface OrderForEligibility {
  id: number
  user_id?: string | null
  clerk_user_id?: string | null
  customer_email?: string | null
  status: string
  created_at: string | Date
  updated_at?: string | Date
  delivered_at?: string | Date | null
  items?: OrderItemForEligibility[]
}

export interface ActiveReturnItem {
  order_item_id: number
  quantity: number
  status: string // 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed'
}

export interface ReturnEligibilityResult {
  canReturn: boolean
  reason?: string
  remainingWindowDays?: number
}

/**
 * Validates whether an entire order is eligible for initiating a return request.
 */
export function isOrderEligibleForReturn(
  order: OrderForEligibility,
  userId?: string | number | null,
  userEmail?: string | null,
  returnWindowDays: number = DEFAULT_RETURN_WINDOW_DAYS
): ReturnEligibilityResult {
  if (!order) {
    return { canReturn: false, reason: "Order not found." }
  }

  // 1. Verify customer ownership if user details are provided and present on order
  if ((userId || userEmail) && (order.user_id || order.clerk_user_id || order.customer_email)) {
    const orderUserId = (order.user_id || order.clerk_user_id || "").toString()
    const orderEmail = (order.customer_email || "").toLowerCase()
    const targetUserId = (userId || "").toString()
    const targetEmail = (userEmail || "").toLowerCase()

    const matchesUser = Boolean(targetUserId && orderUserId && targetUserId === orderUserId)
    const matchesEmail = Boolean(targetEmail && orderEmail && targetEmail === orderEmail)

    if (orderUserId && targetUserId && !matchesUser && orderEmail && targetEmail && !matchesEmail) {
      return { canReturn: false, reason: "Order does not belong to this account." }
    }
  }

  // 2. Verify order status is strictly Delivered or Completed
  const s = (order.status || "").toLowerCase()
  const isDeliveredStatus = s === "delivered" || s === "completed"

  if (!isDeliveredStatus) {
    if (s === "cancel" || s === "cancelled") {
      return { canReturn: false, reason: "Order has been cancelled." }
    }
    return {
      canReturn: false,
      reason: `Return is only available for delivered orders. Current status: ${order.status || 'Processing'}.`
    }
  }

  // 3. Verify Return Window (7 days from delivery or creation date)
  const deliveryTime = order.delivered_at
    ? new Date(order.delivered_at).getTime()
    : order.updated_at
    ? new Date(order.updated_at).getTime()
    : new Date(order.created_at).getTime()

  const now = Date.now()
  const daysDiff = (now - deliveryTime) / (1000 * 60 * 60 * 24)

  if (daysDiff > returnWindowDays) {
    return {
      canReturn: false,
      reason: `The ${returnWindowDays}-day return window for this order has expired.`
    }
  }

  const remainingWindowDays = Math.max(0, Math.ceil(returnWindowDays - daysDiff))

  return {
    canReturn: true,
    remainingWindowDays
  }
}

/**
 * Checks whether a specific item inside an order can be returned,
 * accounting for existing active return requests.
 */
export function isItemEligibleForReturn(
  orderItem: OrderItemForEligibility,
  activeReturnItems: ActiveReturnItem[] = []
): { canReturn: boolean; reason?: string; remainingReturnableQty: number } {
  const purchasedQty = Number(orderItem.quantity) || 1

  // Calculate sum of quantities already requested in active requests (pending, approved, completed)
  const activeQty = activeReturnItems
    .filter(
      (ri) =>
        Number(ri.order_item_id) === Number(orderItem.id) &&
        ["pending", "approved", "completed"].includes((ri.status || "").toLowerCase())
    )
    .reduce((sum, ri) => sum + (Number(ri.quantity) || 1), 0)

  const remainingReturnableQty = Math.max(0, purchasedQty - activeQty)

  if (remainingReturnableQty <= 0) {
    return {
      canReturn: false,
      reason: "A return request has already been submitted for this item.",
      remainingReturnableQty: 0
    }
  }

  return {
    canReturn: true,
    remainingReturnableQty
  }
}

/**
 * Available return reason options for UI forms.
 */
export const RETURN_REASONS = [
  "Damaged product",
  "Wrong product received",
  "Product not as described",
  "Defective product",
  "Missing parts",
  "Size/fit issue",
  "Other"
] as const

export type ReturnReason = typeof RETURN_REASONS[number]
