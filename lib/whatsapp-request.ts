import React from "react"

/**
 * System WhatsApp number for out-of-stock product inquiries
 * Number: 8075191055 -> International Format for wa.me: 918075191055
 */
export const SYSTEM_WHATSAPP_NUMBER = "918075191055"
export const SYSTEM_WHATSAPP_DISPLAY = "+91 80751 91055"
export const STORE_BASE_URL = "https://www.motoclub.in"

export interface WhatsAppProductRequestOptions {
  productName: string
  productId?: number | string
  sku?: string
  brand?: string
  priceText?: string
  productUrl?: string
}

/**
 * Generates wa.me WhatsApp URL pre-filled with product details and inquiry message.
 * Formats link domain to production URL (https://www.motoclub.in) instead of localhost.
 */
export function createWhatsAppRequestUrl(options: WhatsAppProductRequestOptions): string {
  const { productName, productId, sku, brand, priceText, productUrl } = options

  let formattedUrl = ""
  if (productId) {
    formattedUrl = `${STORE_BASE_URL}/product/${productId}`
  } else if (productUrl) {
    formattedUrl = productUrl.replace(/^https?:\/\/[^\/]+/, STORE_BASE_URL)
  } else {
    formattedUrl = STORE_BASE_URL
  }

  const lines = [
    `*PRODUCT AVAILABILITY REQUEST*`,
    `----------------------------------------`,
    `📦 *Product:* ${productName}`,
  ]

  if (sku || productId) {
    lines.push(`🔢 *Code/SKU:* #${sku || productId}`)
  }
  if (brand) {
    lines.push(`🏷️ *Brand:* ${brand}`)
  }
  if (priceText) {
    lines.push(`💰 *Price:* ${priceText}`)
  }
  if (formattedUrl) {
    lines.push(`🔗 *Link:* ${formattedUrl}`)
  }

  lines.push(`----------------------------------------`)
  lines.push(`💬 *Inquiry:* Is it possible to get this product? Please let me know when it will be available or if it can be ordered for me.`)

  const text = lines.join("\n")
  return `https://wa.me/${SYSTEM_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}

/**
 * Utility handler to trigger WhatsApp request in a new browser tab
 */
export function handleWhatsAppProductRequest(
  e: React.MouseEvent,
  options: WhatsAppProductRequestOptions
) {
  e.stopPropagation()
  const url = createWhatsAppRequestUrl(options)
  window.open(url, "_blank", "noopener,noreferrer")
}
