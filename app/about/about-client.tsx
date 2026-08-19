"use client"
import { useSettings } from "@/lib/contexts/settings-context"
import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"
import { Button } from "@/components/ui/button"
import { Wrench, ShieldCheck, Car, Zap, CheckCircle2, Award, Users, ArrowRight, Package, Truck, PhoneCall } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AboutPageClient() {
  const { settings } = useSettings()
  const brandName = settings.restaurant_name || "MotoClub"

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brandName,
    description:
      "Vehicle spare parts and automotive accessories retailer supplying quality products across India.",
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
    slogan: "Affordable and quality vehicle spare parts for every drive",
    knowsAbout: [
      "Vehicle spare parts",
      "Car accessories",
      "Automotive body parts",
      "Lights and electronics",
      "Maintenance components",
    ],
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Main Navigation Header */}
      <Navbar />

      <main className="flex-1">
        {/* ─── Hero Section with Dark Automotive Gradient ─── */}
        <section className="relative py-20 lg:py-24 bg-gradient-to-b from-black via-zinc-950 to-zinc-900 border-b border-zinc-800/80 overflow-hidden">
          {/* Background Glows */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-red-600/10 border border-red-500/20 text-red-500 text-xs sm:text-sm font-extrabold uppercase tracking-widest mb-6">
              <Wrench className="w-4 h-4" />
              <span>About {brandName} Spare Parts</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
              Your Trusted Destination For <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-rose-300">Vehicle Spare Parts</span> & Accessories
            </h1>

            <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
              We specialize in bringing you top-grade automotive replacement components, body parts, and accessories at highly affordable prices without compromising quality.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Button
                asChild
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 uppercase text-xs tracking-wider rounded-xl transition-all shadow-xl shadow-red-600/20 hover:scale-[1.02]"
              >
                <Link href="/products" className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  <span>Explore Spare Parts</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 font-bold px-8 py-4 uppercase text-xs tracking-wider rounded-xl transition-all"
              >
                <Link href="/contact" className="flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-red-500" />
                  <span>Contact Our Team</span>
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ─── Highlights Stats Banner ─── */}
        <section className="py-10 bg-zinc-900/60 border-b border-zinc-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
                <p className="text-3xl sm:text-4xl font-extrabold text-red-500">100%</p>
                <p className="text-xs sm:text-sm font-semibold text-zinc-400 mt-1 uppercase tracking-wider">Quality Tested</p>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
                <p className="text-3xl sm:text-4xl font-extrabold text-red-500">1000+</p>
                <p className="text-xs sm:text-sm font-semibold text-zinc-400 mt-1 uppercase tracking-wider">Spare Part SKU&apos;s</p>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
                <p className="text-3xl sm:text-4xl font-extrabold text-red-500">Best</p>
                <p className="text-xs sm:text-sm font-semibold text-zinc-400 mt-1 uppercase tracking-wider">Affordable Pricing</p>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
                <p className="text-3xl sm:text-4xl font-extrabold text-red-500">India</p>
                <p className="text-xs sm:text-sm font-semibold text-zinc-400 mt-1 uppercase tracking-wider">Nationwide Delivery</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Main Content Story & Features ─── */}
        <section className="py-20 lg:py-28 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* Story Content */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-red-500">
                    Our Core Mission
                  </span>
                  <div className="h-0.5 w-12 bg-red-600/60 rounded-full" />
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  High Performance & Durability Guaranteed For Every Road
                </h2>

                <div className="space-y-4 text-zinc-300 text-base sm:text-lg leading-relaxed">
                  <p>
                    At <strong className="text-white font-semibold">{brandName}</strong>, we believe every vehicle owner deserves reliable, premium-quality spare parts without paying exorbitant dealership prices.
                  </p>
                  <p>
                    Whether you are replacing worn-out exterior trim, tail lamps, door visors, side beadings, or critical mechanical fittings, our catalog is meticulously curated to meet stringent fitment and performance standards.
                  </p>
                </div>

                {/* Grid Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-start gap-3 bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl">
                    <Zap className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Direct Factory Sourcing</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">Eliminating unnecessary middleman margins to provide best prices.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl">
                    <ShieldCheck className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Rigorous Quality Checks</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">Tested for long-lasting endurance, weather resistance, and exact fit.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl">
                    <Truck className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Fast Shipping across India</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">Secure packaging and reliable door-step delivery nationwide.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl">
                    <CheckCircle2 className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Customer First Support</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">Dedicated WhatsApp & telephone assistance for fitment verification.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Showcase Image Banner */}
              <div className="relative">
                <div className="relative h-[400px] sm:h-[500px] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl group">
                  <Image
                    src="/vehicle-spare-parts.jpg"
                    alt="Vehicle Spare Parts Sourcing"
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-zinc-900/95 border border-zinc-800 backdrop-blur-md">
                    <span className="text-xs font-extrabold text-red-500 uppercase tracking-widest">Quality Assurance</span>
                    <h3 className="text-lg font-extrabold text-white mt-1">Multi-Brand Fitment & Accessories</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Designed to keep your vehicle in peak condition for every journey.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─── Bottom CTA Banner ─── */}
        <section className="py-16 bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-950 border-t border-zinc-800/80">
          <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready To Upgrade Your Vehicle Spare Parts?
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto">
              Explore our full catalog or reach out to our fitment specialists on WhatsApp for instant assistance.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Button
                asChild
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 uppercase text-xs tracking-wider rounded-xl transition-all shadow-lg shadow-red-600/20"
              >
                <Link href="/products" className="flex items-center gap-2">
                  <span>Browse Products Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold px-8 py-4 uppercase text-xs tracking-wider rounded-xl transition-all"
              >
                <Link href="/contact">
                  <span>Contact Us</span>
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Main Footer */}
      <Footer />
    </div>
  )
}
