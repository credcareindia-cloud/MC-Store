"use client"
import { useSettings } from "@/lib/contexts/settings-context"
import { Award, Shield, Users, Star, Wrench } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AboutPageClient() {
  const { settings } = useSettings()

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.restaurant_name || "Motoclub",
    description:
      "Automobile spare parts and riding accessories retailer serving customers across India.",
    url: "https://motoclub.in",
    logo: settings.restaurant_logo || "https://motoclub.in/logo.png",
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "Moto club Kottakkal, Thoppil tower, Parakkori, Puthoor, Kottakkal, Malappuram dist., Kerala",
      addressLocality: "Kottakkal",
      addressRegion: "Kerala",
      postalCode: "676503",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-99954-42239",
      contactType: "customer service",
      email: settings.email || "motoclubkottakkal@gmail.com",
    },
    sameAs: [settings.social_facebook, settings.social_instagram, settings.social_twitter].filter(Boolean),
    slogan: "Parts and accessories for riders across India",
    knowsAbout: [
      "Automobile spare parts",
      "Bike accessories",
      "Helmets and riding gear",
      "Two-wheeler maintenance",
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-zinc-50 flex flex-col items-center py-12 px-2">
        <div className="max-w-6xl w-full mx-auto">
          <div className="rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <header className="text-center p-10 border-b border-zinc-200">
              <div className="flex flex-col items-center gap-4">
                {settings.restaurant_logo ? (
                  <div className="relative w-24 h-24 mb-2">
                    <Image
                      src={settings.restaurant_logo || "/logo.png"}
                      alt=""
                      fill
                      className="object-contain rounded-lg border border-zinc-200 bg-white p-1"
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-zinc-900 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-white font-bold text-4xl" aria-label={settings.restaurant_name}>
                      {settings.restaurant_name.charAt(0)}
                    </span>
                  </div>
                )}
                <h1 className="font-playfair text-4xl md:text-5xl font-semibold text-zinc-900 tracking-tight">
                  About {settings.restaurant_name}
                </h1>
                <p className="text-zinc-600 text-lg max-w-2xl">
                  Automobile spare parts and accessories — quality listings and delivery across India.
                </p>
              </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <section className="p-10 border-b lg:border-b-0 lg:border-r border-zinc-200">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Wrench className="w-8 h-8 text-zinc-700" aria-hidden="true" />
                    <h2 className="text-2xl font-semibold text-zinc-900">Our story</h2>
                  </div>
                  <article className="space-y-4">
                    <p className="text-zinc-700 text-lg leading-relaxed">
                      <strong className="font-semibold text-zinc-900">{settings.restaurant_name}</strong> is built for
                      riders and workshops who need dependable parts and accessories.
                    </p>
                    <p className="text-zinc-600 leading-relaxed">
                      We curate products suited to Indian roads and service conditions.
                    </p>
                    <div className="bg-zinc-50 p-6 rounded-lg border border-zinc-200">
                      <h3 className="font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                        <Star className="w-5 h-5" aria-hidden="true" />
                        Mission
                      </h3>
                      <p className="text-zinc-600">
                        Make it straightforward to find the right part, pay in INR, and receive orders reliably within
                        India.
                      </p>
                    </div>
                  </article>
                </div>
              </section>

              <section className="p-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Award className="w-8 h-8 text-zinc-700" aria-hidden="true" />
                    <h2 className="text-2xl font-semibold text-zinc-900">Why Motoclub</h2>
                  </div>
                  <div className="space-y-4" role="list">
                    <div className="flex items-start gap-4 p-4 bg-zinc-50 rounded-lg border border-zinc-200" role="listitem">
                      <Shield className="w-6 h-6 text-zinc-700 mt-1 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <h4 className="font-semibold text-zinc-900">Quality-first sourcing</h4>
                        <p className="text-zinc-600 text-sm">Trusted suppliers and clear product information.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-zinc-50 rounded-lg border border-zinc-200" role="listitem">
                      <Users className="w-6 h-6 text-zinc-700 mt-1 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <h4 className="font-semibold text-zinc-900">Support</h4>
                        <p className="text-zinc-600 text-sm">Help with fitment, orders, and delivery.</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 p-6 bg-zinc-50 rounded-lg border border-zinc-200">
                    <h3 className="font-semibold text-zinc-900 mb-3">India operations</h3>
                    <ul className="space-y-2 text-zinc-600 text-sm" role="list">
                      <li role="listitem">Nationwide delivery within India</li>
                      <li role="listitem">Pricing in Indian Rupees (INR)</li>
                      <li role="listitem">UPI payments via Razorpay where enabled</li>
                    </ul>
                  </div>
                </div>
              </section>
            </main>

            <section className="p-10 border-t border-zinc-200 bg-zinc-50">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold text-zinc-900">Browse the catalog</h3>
                <p className="text-zinc-600 max-w-2xl mx-auto">One storefront, one checkout.</p>
                <div className="flex flex-wrap justify-center gap-3 mt-6">
                  <Link
                    href="/products"
                    className="bg-zinc-900 text-white px-8 py-3 rounded-md font-medium hover:bg-zinc-800 transition-colors"
                  >
                    Shop products
                  </Link>
                  <Link
                    href="/contact"
                    className="border border-zinc-300 bg-white text-zinc-900 px-8 py-3 rounded-md font-medium hover:bg-zinc-50 transition-colors"
                  >
                    Contact us
                  </Link>
                </div>
              </div>
              <footer className="mt-8 text-center text-zinc-500 text-xs">
                © {new Date().getFullYear()} {settings.restaurant_name}. All rights reserved. Automobile parts and
                accessories.
              </footer>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
