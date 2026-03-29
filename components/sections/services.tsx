"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import { MapPin, ShieldCheck, Store, Truck } from "lucide-react"

const LOGO_CLASS =
  "h-7 w-auto max-w-[100px] object-contain object-left opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0 sm:h-8 sm:max-w-[120px]"

type TrustLogo = { src: string; alt: string; className?: string }

const marketplaceLogos: TrustLogo[] = [
  { src: "/trust/amazon.svg", alt: "Amazon" },
  { src: "/trust/flipkart.svg", alt: "Flipkart" },
]

const paymentLogos: TrustLogo[] = [
  { src: "/trust/googlepay.svg", alt: "Google Pay" },
  { src: "/trust/phonepe.svg", alt: "PhonePe" },
  { src: "/trust/paytm.svg", alt: "Paytm" },
  { src: "/trust/razorpay.svg", alt: "Razorpay" },
]

const shippingLogos: TrustLogo[] = [
  { src: "/trust/dhl.svg", alt: "DHL" },
]

function LogoStrip({
  label,
  logos,
  extra,
}: {
  label: string
  logos: TrustLogo[]
  extra?: ReactNode
}) {
  return (
    <div className="rounded-xl border border-zinc-200/80 bg-white/80 px-4 py-4 shadow-sm backdrop-blur-sm sm:px-5 sm:py-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 sm:text-xs">
        {label}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-4 sm:gap-x-10">
        {logos.map((logo) => (
          <Image
            key={logo.src}
            src={logo.src}
            alt={logo.alt}
            width={120}
            height={32}
            className={logo.className ?? LOGO_CLASS}
            unoptimized
          />
        ))}
        {extra}
      </div>
    </div>
  )
}

const Services = () => {
  const pillars = [
    {
      icon: Truck,
      title: "Free delivery, all India",
      body: "Orders ship nationwide with tracked logistics and careful packaging for parts & gear.",
    },
    {
      icon: Store,
      title: "Also on Amazon & Flipkart",
      body: "Shop where you already trust—same quality inventory available on major marketplaces.",
    },
    {
      icon: ShieldCheck,
      title: "Secure payments",
      body: "Checkout protected with Razorpay. Pay with UPI apps like Google Pay, PhonePe, Paytm, cards & more.",
    },
    {
      icon: MapPin,
      title: "Trusted carriers",
      body: "Fulfilled via DHL, India Post Speed Post & leading courier partners for reliable last-mile delivery.",
    },
  ]

  return (
    <section
      className="relative overflow-hidden px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 lg:mt-10 pb-10 sm:pb-14 lg:pb-16"
      aria-labelledby="trust-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(24,24,27,0.06),transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-8 text-center sm:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
            Why riders choose us
          </p>
          <h2
            id="trust-heading"
            className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl"
          >
            Professional shopping, nationwide
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base">
            Genuine parts, marketplace presence you recognize, and payments & shipping partners built for scale.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {pillars.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex flex-col rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition hover:border-zinc-300 hover:shadow-md"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white">
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-zinc-600">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-4 sm:mt-10">
          <LogoStrip label="Find us on" logos={marketplaceLogos} />
          <LogoStrip label="Payments & checkout" logos={paymentLogos} />
          <LogoStrip
            label="Shipping partners"
            logos={shippingLogos}
            extra={
              <div className="flex items-center gap-2 border-l border-zinc-200 pl-6 sm:pl-8">
                <span
                  className="inline-flex h-9 items-center rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-900 sm:text-sm"
                  title="India Post Speed Post"
                >
                  India Post
                </span>
                <span className="max-w-[140px] text-[11px] leading-snug text-zinc-500 sm:max-w-none sm:text-xs">
                  Speed Post &amp; express courier network
                </span>
              </div>
            }
          />
        </div>
      </div>
    </section>
  )
}

export default Services
