"use client"

import Image from "next/image"
import { Truck, ShieldCheck, Store, Package } from "lucide-react"

type TrustLogo = { src: string; alt: string }

const logos: TrustLogo[] = [
  { src: "/trust/amazon.svg", alt: "Amazon" },
  { src: "/trust/flipkart.svg", alt: "Flipkart" },
  { src: "/trust/razorpay.svg", alt: "Razorpay" },
  { src: "/trust/googlepay.svg", alt: "Google Pay" },
  { src: "/trust/phonepe.svg", alt: "PhonePe" },
  { src: "/trust/paytm.svg", alt: "Paytm" },
  { src: "/trust/dhl.svg", alt: "DHL" },
]

const pillars = [
  {
    icon: Truck,
    title: "Free Shipping",
    desc: "Pan-India delivery with tracking via DHL, Speed Post & more.",
  },
  {
    icon: Store,
    title: "Marketplace Verified",
    desc: "Same inventory listed on Amazon & Flipkart.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    desc: "Razorpay-protected payments — UPI, cards & wallets.",
  },
  {
    icon: Package,
    title: "Genuine Parts",
    desc: "Authentic products with warranty & careful packaging.",
  },
]

const Services = () => {
  return (
    <section
      className="relative px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14 pb-10 sm:pb-14"
      aria-labelledby="trust-heading"
    >
      <div className="mx-auto max-w-6xl">
        {/* Pillars row */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center rounded-2xl border border-zinc-100 bg-white px-4 py-6 sm:py-7 transition hover:border-zinc-200 hover:shadow-sm"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 text-white">
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 sm:text-[15px]">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500 max-w-[180px]">{desc}</p>
            </div>
          ))}
        </div>

        {/* Trust logos — single compact strip */}
        <div className="mt-6 flex items-center justify-center gap-6 sm:gap-10 flex-wrap opacity-60 grayscale hover:opacity-80 hover:grayscale-0 transition-all duration-300">
          {logos.map((logo) => (
            <Image
              key={logo.src}
              src={logo.src}
              alt={logo.alt}
              width={88}
              height={24}
              className="h-5 w-auto sm:h-6 object-contain"
              unoptimized
            />
          ))}
          <span
            className="inline-flex h-6 items-center rounded border border-red-200 bg-red-50 px-2 text-[10px] font-semibold text-red-800 sm:text-xs"
            title="India Post Speed Post"
          >
            India Post
          </span>
        </div>
      </div>
    </section>
  )
}

export default Services
