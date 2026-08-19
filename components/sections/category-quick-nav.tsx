"use client"

import Link from "next/link"
import { Headphones, Smartphone, Watch, ShieldAlert, Tag, ArrowRight } from "lucide-react"

interface QuickCategory {
  id: string
  name: string
  subtitle: string
  href: string
  icon: any
  gradient: string
}

const QUICK_CATEGORIES: QuickCategory[] = [
  {
    id: "audio",
    name: "Audio",
    subtitle: "Premium Sound",
    href: "/products?category=Audio",
    icon: Headphones,
    gradient: "from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900",
  },
  {
    id: "smart-devices",
    name: "Smart Devices",
    subtitle: "Smarter Living",
    href: "/products?category=Smart%20Home",
    icon: Smartphone,
    gradient: "from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900",
  },
  {
    id: "wearables",
    name: "Wearables",
    subtitle: "Track. Achieve.",
    href: "/products?category=Wearables",
    icon: Watch,
    gradient: "from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900",
  },
  {
    id: "accessories",
    name: "Accessories",
    subtitle: "Designed for You",
    href: "/products?category=Accessories",
    icon: ShieldAlert,
    gradient: "from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900",
  },
  {
    id: "deals",
    name: "Deals",
    subtitle: "Top Deals Today",
    href: "/products?sale=true",
    icon: Tag,
    gradient: "from-red-50 to-red-100 dark:from-red-950/30 dark:to-slate-900",
  },
]

export default function CategoryQuickNav() {
  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        {QUICK_CATEGORIES.map((cat) => {
          const IconComponent = cat.icon
          return (
            <Link
              key={cat.id}
              href={cat.href}
              className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${cat.gradient} text-slate-800 dark:text-slate-100 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {cat.subtitle}
                  </p>
                </div>
              </div>

              {/* Red Circle Arrow Button */}
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-600 dark:bg-red-500 text-white flex items-center justify-center shadow-sm group-hover:bg-red-700 transition-colors flex-shrink-0">
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
