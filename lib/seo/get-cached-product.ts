import { cache } from "react"
import { getProductById } from "@/lib/services/product-service"

export const getCachedProduct = cache(async (id: string) => {
  const productId = Number(id)
  if (!Number.isFinite(productId)) return null
  return getProductById(productId)
})
