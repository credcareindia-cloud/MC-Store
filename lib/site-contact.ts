/**
 * Canonical storefront contact details for Moto club Kottakkal.
 * Import from here (or from /api settings when DB-backed) to keep copy in sync.
 */
export const SITE_CONTACT_EMAIL = "motoclubkottakkal@gmail.com"

/** Human-readable */
export const SITE_PHONE_DISPLAY = "+91 99954 42239"

/** E.164 for tel: and machine use */
export const SITE_PHONE_E164 = "+919995442239"

/** Digits only for wa.me (no +) */
export const SITE_WHATSAPP_E164_DIGITS = "919995442239"

/** UPI / GPay style display */
export const SITE_PHONE_PAYMENT_DISPLAY = "99954 42239"

export const SITE_ADDRESS_LINES = [
  "Moto club Kottakkal",
  "Thoppil tower, Parakkori, Puthoor",
  "Kottakkal, Malappuram dist., Kerala",
] as const

export const SITE_POSTAL_CODE = "676503"

/** Single line for JSON-LD / meta */
export const SITE_ADDRESS_SINGLE_LINE = `${SITE_ADDRESS_LINES.join(", ")}, Pin ${SITE_POSTAL_CODE}, India`
