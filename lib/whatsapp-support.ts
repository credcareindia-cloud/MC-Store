import { SITE_WHATSAPP_E164_DIGITS } from "@/lib/site-contact"

export const WHATSAPP_SUPPORT_PROMPTS = [
  {
    label: "Have doubts? Ask our team",
    message: "Hi MotoCart team, I have a question about a product.",
  },
  {
    label: "Need a custom modification?",
    message: "Hi MotoCart team, I need help with a custom modification.",
  },
  {
    label: "Can't find a product? Check with us",
    message: "Hi MotoCart team, I'm looking for a product that isn't listed on the site.",
  },
  {
    label: "Fitment questions? We're here to help",
    message: "Hi MotoCart team, I need help confirming fitment for my vehicle.",
  },
  {
    label: "Bulk order inquiry? Message us",
    message: "Hi MotoCart team, I'd like to inquire about a bulk order.",
  },
] as const

export type WhatsAppSupportPrompt = (typeof WHATSAPP_SUPPORT_PROMPTS)[number]

export const WHATSAPP_PROMPT_ROTATE_MS = 4500

const DEFAULT_MESSAGE = "Hi MotoCart team, I'd like some assistance."

export function getWhatsAppSupportUrl(message = DEFAULT_MESSAGE): string {
  return `https://wa.me/${SITE_WHATSAPP_E164_DIGITS}?text=${encodeURIComponent(message)}`
}

export function openWhatsAppSupport(message = DEFAULT_MESSAGE): void {
  window.open(getWhatsAppSupportUrl(message), "_blank", "noopener,noreferrer")
}
