import type { ReactNode } from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"

import { StoreProvider } from "@/lib/store/provider"
import { SettingsProvider } from "@/lib/contexts/settings-context"
import { AuthProvider } from "@/lib/contexts/auth-context"
import { ShopProvider } from "@/lib/contexts/shop-context"
import UserNavVisibility from "@/components/ui/user-nav-visibility"
import { CurrencyProvider } from '@/lib/contexts/currency-context'
import WishlistSync from '@/components/wishlist-sync'
import CartSync from '@/components/cart-sync'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#09090b",
}

export const metadata: Metadata = {
  title: {
    default: "MotoCart — Genuine Automobile Spare Parts & Accessories",
    template: "%s | MotoCart",
  },
  description: "Shop high-quality automobile spare parts, car accessories, bike gear, and riding equipment online with fast nationwide delivery.",
  keywords: ["automobile spare parts", "car accessories", "bike accessories", "motocart", "car parts online", "auto spares India"],
  authors: [{ name: "MotoCart Team" }],
  creator: "MotoCart",
  publisher: "MotoCart E-Commerce",
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://motocart.com",
    siteName: "MotoCart",
    title: "MotoCart — Genuine Automobile Spare Parts & Accessories",
    description: "Shop high-quality automobile spare parts, car accessories, bike gear, and riding equipment online with fast nationwide delivery.",
    images: [
      {
        url: "/motocart-logo.svg",
        width: 1200,
        height: 630,
        alt: "MotoCart Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MotoCart — Genuine Automobile Spare Parts & Accessories",
    description: "Shop high-quality automobile spare parts, car accessories, bike gear, and riding equipment online.",
    images: ["/motocart-logo.svg"],
  },
  icons: {
    icon: [
      { url: "/motocart-icon.svg", type: "image/svg+xml" },
      { url: "/motocart-logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/motocart-icon.svg",
    apple: "/motocart-icon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <AuthProvider>
          <SettingsProvider>
            <StoreProvider>
              <ShopProvider>
                <CurrencyProvider>
                  <WishlistSync />
                  <CartSync />
                  <UserNavVisibility />
                  <Toaster 
                    position="top-center"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#363636',
                        color: '#fff',
                      },
                    }}
                  />
                  <div className="pb-16 lg:pb-0">{children}</div>
                </CurrencyProvider>
              </ShopProvider>
            </StoreProvider>
          </SettingsProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
