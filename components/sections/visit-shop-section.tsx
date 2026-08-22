"use client"

import Link from "next/link"
import { MapPin, Navigation, Phone, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import WhatsAppIcon from "@/components/ui/whatsapp-icon"
import {
  SITE_ADDRESS_LINES,
  SITE_GOOGLE_MAPS_DIRECTIONS_URL,
  SITE_GOOGLE_MAPS_EMBED_URL,
  SITE_PHONE_DISPLAY,
  SITE_PHONE_E164,
  SITE_POSTAL_CODE,
} from "@/lib/site-contact"
import { openWhatsAppSupport } from "@/lib/whatsapp-support"

export default function VisitShopSection() {
  return (
    <section className="border-t border-zinc-100 bg-zinc-50 py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="mb-6 sm:mb-8">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-red-500 sm:mb-2 sm:text-xs">
            Visit us
          </p>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl lg:text-4xl">
            Visit Our Shop
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base">
            We have even more in store for you — spare parts, accessories, and fitment help you won&apos;t always
            find online. Stop by and explore in person.
          </p>
        </div>

        <div className="grid items-stretch gap-5 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Store className="h-6 w-6" />
              </div>

              <h3 className="text-lg font-bold text-zinc-900 sm:text-xl">{SITE_ADDRESS_LINES[0]}</h3>

              <div className="mt-4 space-y-1 text-sm leading-relaxed text-zinc-600 sm:text-base">
                {SITE_ADDRESS_LINES.slice(1).map((line) => (
                  <p key={line}>{line}</p>
                ))}
                <p className="pt-1 font-medium text-zinc-800">Pin {SITE_POSTAL_CODE}</p>
              </div>

              <ul className="mt-5 space-y-2 text-sm text-zinc-600">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <span>Walk in for fitment checks, bulk orders, and exclusive in-store stock.</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <Button
                asChild
                className="h-11 rounded-full bg-red-600 px-5 text-sm font-semibold hover:bg-red-700"
              >
                <a href={SITE_GOOGLE_MAPS_DIRECTIONS_URL} target="_blank" rel="noopener noreferrer">
                  <Navigation className="mr-2 h-4 w-4" />
                  Get Directions
                </a>
              </Button>

              <Button asChild variant="outline" className="h-11 rounded-full border-zinc-200 px-5 text-sm font-semibold">
                <a href={SITE_PHONE_E164}>
                  <Phone className="mr-2 h-4 w-4" />
                  {SITE_PHONE_DISPLAY}
                </a>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => openWhatsAppSupport("Hi MotoCart team, I'd like to visit your Kottakkal store. Can you share directions or store timings?")}
                className="h-11 rounded-full border-emerald-200 bg-emerald-50 px-5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                <WhatsAppIcon className="mr-2 h-4 w-4" />
                WhatsApp Us
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
            <iframe
              title="Moto club Kottakkal store location"
              src={SITE_GOOGLE_MAPS_EMBED_URL}
              className="h-[280px] w-full sm:h-[320px] lg:h-full lg:min-h-[360px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="border-t border-zinc-100 px-4 py-3 text-center text-xs text-zinc-500 sm:text-sm">
              <Link
                href={SITE_GOOGLE_MAPS_DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-red-600 transition-colors hover:text-red-700"
              >
                Open in Google Maps
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
