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
    <section className="w-full bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-200/80 dark:border-slate-800 py-8 my-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {HIGHLIGHTS.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index} className="flex items-center gap-4 p-3 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
                <div className="p-3 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex-shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
