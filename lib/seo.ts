import type { Metadata } from "next"
import {
  SITE_ADDRESS_SINGLE_LINE,
  SITE_CONTACT_EMAIL,
  SITE_INSTAGRAM_URL,
  SITE_PHONE_E164,
  SITE_POSTAL_CODE,
} from "@/lib/site-contact"

export const SITE_NAME = "MotoCart"
export const SITE_LEGAL_NAME = "Moto club Kottakkal"
export const SITE_TAGLINE = "Genuine Automobile Spare Parts & Accessories"
export const SITE_DESCRIPTION =
  "Shop genuine automobile spare parts, car accessories, bike gear, and riding equipment online. Visit our Kottakkal store or order with fast delivery across India."
export const SITE_KEYWORDS = [
  "automobile spare parts",
  "car accessories",
  "bike accessories",
  "motocart",
  "motoclub kottakkal",
  "car parts online",
  "auto spares India",
  "Kerala auto parts",
  "LED head lights",
  "car spoilers",
] as const

export const DEFAULT_OG_IMAGE = "/motocart-logo.png"

/** Canonical production site URL (no trailing slash). */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "")
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`
  }
  return "https://www.motoclub.in"
}

export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${getSiteUrl()}${normalized}`
}

export function buildPageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
  keywords,
  noIndex = false,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
}: {
  title: string
  description?: string
  path: string
  keywords?: string[]
  noIndex?: boolean
  ogImage?: string
  ogType?: "website" | "article"
}): Metadata {
  const url = absoluteUrl(path)
  const imageUrl = ogImage.startsWith("http") ? ogImage : absoluteUrl(ogImage)

  return {
    title,
    description,
    keywords: keywords ?? [...SITE_KEYWORDS],
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: ogType,
      locale: "en_IN",
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  }
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  legalName: SITE_LEGAL_NAME,
  url: getSiteUrl(),
  logo: absoluteUrl(DEFAULT_OG_IMAGE),
  email: SITE_CONTACT_EMAIL,
  telephone: SITE_PHONE_E164,
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE_ADDRESS_SINGLE_LINE,
    addressLocality: "Kottakkal",
    addressRegion: "Kerala",
    postalCode: SITE_POSTAL_CODE,
    addressCountry: "IN",
  },
  sameAs: [SITE_INSTAGRAM_URL],
}

export const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoPartsStore",
  name: SITE_LEGAL_NAME,
  image: absoluteUrl(DEFAULT_OG_IMAGE),
  url: getSiteUrl(),
  telephone: SITE_PHONE_E164,
  email: SITE_CONTACT_EMAIL,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Thoppil tower, Parakkori, Puthoor",
    addressLocality: "Kottakkal",
    addressRegion: "Kerala",
    postalCode: SITE_POSTAL_CODE,
    addressCountry: "IN",
  },
  priceRange: "₹₹",
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: getSiteUrl(),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/products")}?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}
