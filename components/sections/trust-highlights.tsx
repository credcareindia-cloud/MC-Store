"use client"

import { Truck, ShieldCheck, RefreshCw, Headset } from "lucide-react"

const HIGHLIGHTS = [
  {
    icon: Truck,
    title: "Worldwide Shipping",
    description: "Fast delivery to US, UK & UAE",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "100% safe & secure checkout",
  },
  {
    icon: RefreshCw,
    title: "30-Day Returns",
    description: "Hassle-free returns guaranteed",
  },
  {
    icon: Headset,
    title: "Premium Support",
    description: "24/7 customer support",
  },
]

export default function TrustHighlights() {
  return (
    <section className="border-t border-zinc-100 bg-zinc-50 py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index} className="text-center sm:text-left">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 sm:mx-0">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-900">{item.title}</h4>
                <p className="mt-1 text-sm text-zinc-500">{item.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
