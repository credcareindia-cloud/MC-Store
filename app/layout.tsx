import type { ReactNode } from "react"
import type { Metadata } from "next"
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
import ConditionalCountrySelection from '@/components/ui/conditional-country-selection'

import {
  ClerkProvider,
} from "@clerk/nextjs"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export const metadata: Metadata = {
  title: "SABS - ONLINE STORE",
  description: "Your trusted source for GADGETS AND COSMETICS.",
  generator: "Shah",
  icons: {
    icon: [
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
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
                    <ConditionalCountrySelection />
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
        </body>
      </html>
    </ClerkProvider>
  )
}
