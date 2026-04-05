"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  Wrench,
  ChevronRight,
  Clock,
} from "lucide-react"
import { useSettings } from "@/lib/contexts/settings-context"
import {
  SITE_ADDRESS_LINES,
  SITE_CONTACT_EMAIL,
  SITE_PHONE_DISPLAY,
  SITE_PHONE_E164,
  SITE_POSTAL_CODE,
} from "@/lib/site-contact"

const shopLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/orders", label: "Your orders" },
  { href: "/wishlist", label: "Wishlist" },
]

const legalLinks = [
  { href: "/shipping-policy", label: "Shipping" },
  { href: "/return-refund-policy", label: "Returns & refunds" },
  { href: "/cancellation-policy", label: "Cancellation" },
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms-of-service", label: "Terms of service" },
]

const hours = [
  { days: "Mon – Thu", time: "10:00 AM – 6:00 PM" },
  { days: "Fri – Sat", time: "10:00 AM – 1:00 PM" },
  { days: "Sunday", time: "10:00 AM – 12:00 PM" },
]

export default function Footer() {
  const { settings } = useSettings()
  const [currentYear] = useState(() => new Date().getFullYear())
  const displayEmail = settings.email || SITE_CONTACT_EMAIL
  const phoneDigits = settings.phone?.replace(/\D/g, "") ?? ""
  const phoneDisplay = phoneDigits ? `+91 ${settings.phone}`.trim() : SITE_PHONE_DISPLAY
  const telHref = phoneDigits
    ? `tel:+${phoneDigits.startsWith("91") ? phoneDigits : `91${phoneDigits}`}`
    : SITE_PHONE_E164

  return (
    <footer id="contact" className="relative bg-zinc-900 text-zinc-100">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-600 to-transparent opacity-60" aria-hidden />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-10 sm:gap-y-12 xl:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 xl:col-span-5 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 group">
              {settings.restaurant_logo ? (
                <div className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-lg bg-white/5 ring-1 ring-white/10 p-1">
                  <Image
                    src={settings.restaurant_logo || "/placeholder.svg"}
                    alt=""
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-lg bg-zinc-800 ring-1 ring-zinc-700 flex items-center justify-center shrink-0 group-hover:bg-zinc-700 transition-colors">
                  <Wrench className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-300" />
                </div>
              )}
              <div className="min-w-0 text-left">
                <span className="block text-lg sm:text-xl font-semibold tracking-tight text-white truncate">
                  {settings.restaurant_name}
                </span>
                <span className="block text-xs sm:text-sm text-zinc-500 font-medium uppercase tracking-wider">
                  Spare parts & accessories
                </span>
              </div>
            </Link>

            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-md">
              Automobile spare parts and accessories, reliable quality and service, shipping across India.
            </p>

            <div className="flex flex-wrap gap-2">
              {[
                { Icon: Facebook, href: "#", label: "Facebook" },
                { Icon: Instagram, href: "#", label: "Instagram" },
                { Icon: Twitter, href: "#", label: "Twitter" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-800 transition-colors"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div className="xl:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
              Shop
            </h2>
            <ul className="space-y-0.5">
              {shopLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group inline-flex items-center gap-1.5 py-2 text-sm text-zinc-300 hover:text-white transition-colors"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="xl:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
              Legal
            </h2>
            <ul className="space-y-0.5">
              {legalLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group inline-flex items-center gap-1.5 py-2 text-sm text-zinc-300 hover:text-white transition-colors"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="sm:col-span-2 xl:col-span-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
              Contact
            </h2>
            <ul className="space-y-4 text-sm text-zinc-300">
              <li className="flex gap-3">
                <MapPin className="h-5 w-5 text-zinc-500 shrink-0 mt-0.5" />
                <address className="not-italic text-zinc-400 leading-relaxed">
                  {SITE_ADDRESS_LINES.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                  <span className="block">Pin: {SITE_POSTAL_CODE}</span>
                </address>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-zinc-500 shrink-0" />
                <a href={telHref} className="hover:text-white transition-colors">
                  {phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-zinc-500 shrink-0" />
                <a href={`mailto:${displayEmail}`} className="hover:text-white transition-colors break-all">
                  {displayEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Hours */}
        <div className="mt-12 pt-10 border-t border-zinc-800">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="h-4 w-4 text-zinc-500" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Support hours
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {hours.map(({ days, time }) => (
              <div
                key={days}
                className="rounded-lg border border-zinc-800 bg-zinc-800/30 px-4 py-3 text-center sm:text-left"
              >
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{days}</p>
                <p className="text-sm text-zinc-200 mt-1 font-medium">{time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-800 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs sm:text-sm text-zinc-500 text-center sm:text-left">
              © {currentYear}{" "}
              <span className="text-zinc-400">{settings.restaurant_name}</span>
              . All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-6 gap-y-2 text-xs sm:text-sm">
              <Link href="/privacy-policy" className="text-zinc-500 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms-of-service" className="text-zinc-500 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="text-zinc-500 hover:text-white transition-colors">
                Help
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
