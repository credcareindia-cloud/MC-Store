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

/** Official Instagram profile */
export const SITE_INSTAGRAM_URL = "https://www.instagram.com/moto_cartt"

/** UPI / GPay payment number */
export const SITE_PHONE_PAYMENT_DISPLAY = "85473 15581"

export const SITE_ADDRESS_LINES = [
  "Moto club Kottakkal",
  "Thoppil tower, Parakkori, Puthoor",
  "Kottakkal, Malappuram dist., Kerala",
] as const

export const SITE_POSTAL_CODE = "676503"

/** Single line for JSON-LD / meta */
export const SITE_ADDRESS_SINGLE_LINE = `${SITE_ADDRESS_LINES.join(", ")}, Pin ${SITE_POSTAL_CODE}, India`

const SITE_MAPS_QUERY = encodeURIComponent(
  "Moto club Kottakkal, Thoppil tower, Parakkori, Puthoor, Kottakkal, Malappuram, Kerala 676503"
)

/** Google Maps embed (no API key required) */
export const SITE_GOOGLE_MAPS_EMBED_URL = `https://maps.google.com/maps?q=${SITE_MAPS_QUERY}&t=&z=16&ie=UTF8&iwloc=&output=embed`

/** Opens Google Maps directions in a new tab */
export const SITE_GOOGLE_MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${SITE_MAPS_QUERY}`
