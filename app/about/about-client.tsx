"use client"
import { useSettings } from "@/lib/contexts/settings-context"
import { useShop } from "@/lib/contexts/shop-context"
import { Award, Heart, Shield, Users, Star, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AboutPageClient() {
  const { settings } = useSettings()
  const { shop } = useShop()
  const theme = shop === "A"
    ? {
        accent: "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black border-yellow-400",
        shadow: "shadow-gold",
        heading: "bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-500 bg-clip-text text-transparent animate-shop-swap",
      }
    : {
        accent: "bg-gradient-to-r from-gray-200 via-gray-300 to-white text-gray-900 border-gray-400",
        shadow: "shadow-platinum",
        heading: "bg-gradient-to-r from-gray-200 via-gray-400 to-gray-100 bg-clip-text text-transparent animate-shop-swap",
      }

  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": settings.restaurant_name || "Sabs Online",
    "description": "Premium beauty products and tech accessories retailer committed to quality and customer satisfaction",
    "url": "https://sabsonline.com",
    "logo": settings.restaurant_logo || "https://sabsonline.com/logo.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "23/384/A62 Prince Tower, Near KNH Hospital, Railway Station Road",
      "addressLocality": "Uppala",
      "addressRegion": "Kasaragod",
      "postalCode": "671322",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-9037888193",
      "contactType": "customer service",
      "email": "sabsonlinestore@gmail.com"
    },
    "sameAs": [
      settings.social_facebook,
      settings.social_instagram,
      settings.social_twitter
    ].filter(Boolean),
    "foundingDate": "2020",
    "numberOfEmployees": "10-50",
    "slogan": "Your trusted partner for beauty and technology",
    "knowsAbout": [
      "Beauty Products",
      "Skincare",
      "Cosmetics",
      "Tech Accessories",
      "Mobile Accessories",
      "Premium Beauty Brands",
      "Authentic Products"
    ]
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-amber-100 flex flex-col items-center justify-center py-12 px-2">
        <div className="max-w-6xl w-full mx-auto">
          <div className="rounded-3xl border-0 bg-white/90 backdrop-blur-xl shadow-2xl p-0 relative overflow-hidden">
            
            {/* Header Section with SEO-optimized content */}
            <header className="text-center p-10 border-b border-amber-100">
              <div className="flex flex-col items-center gap-4">
                {settings.restaurant_logo ? (
                  <div className="relative w-24 h-24 mb-2">
                    <Image 
                      src={settings.restaurant_logo || "/logo.png"} 
                      alt={`${settings.restaurant_name} - Premium Beauty Products and Tech Accessories`}
                      fill 
                      className="object-contain rounded-full border-4 border-amber-400 shadow-lg bg-white"
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-2">
                    <span className="text-black font-bold text-4xl" aria-label={settings.restaurant_name}>
                      {settings.restaurant_name.charAt(0)}
                    </span>
                  </div>
                )}
                <h1 className="font-playfair text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-500 bg-clip-text text-transparent animate-shop-swap">
                  About {settings.restaurant_name}
                </h1>
                <p className="text-gray-600 text-xl max-w-2xl animate-fade-in">
                  Discover our story, mission, and commitment to bringing you the finest authentic beauty products, premium skincare, cosmetics, and cutting-edge tech accessories.
                </p>
              </div>
            </header>

            {/* Main Content with semantic HTML */}
            <main className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              
              {/* Left: Our Story */}
              <section className="p-10 border-r border-amber-100">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Heart className="w-8 h-8 text-amber-500" aria-hidden="true" />
                    <h2 className="text-3xl font-bold text-gray-800">Our Story & Mission</h2>
                  </div>
                  
                  <article className="space-y-4">
                    <p className="text-gray-700 text-lg leading-relaxed">
                      Founded with a passion for quality and customer satisfaction, <strong className="font-semibold text-amber-600">{settings.restaurant_name}</strong> has been your trusted partner in beauty and technology since our inception. We specialize in authentic beauty products, premium skincare solutions, high-quality cosmetics, and cutting-edge tech accessories.
                    </p>
                    
                    <p className="text-gray-700 leading-relaxed">
                      We believe that everyone deserves access to premium beauty products and innovative technology accessories. Our carefully curated selection combines international brands with local favorites, ensuring you always find exactly what you're looking for at competitive prices.
                    </p>

                    <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                      <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" aria-hidden="true" />
                        Our Mission Statement
                      </h3>
                      <p className="text-amber-700">
                        To empower individuals through quality beauty products and innovative tech accessories that enhance their lifestyle, boost confidence, and keep them connected with the latest trends in beauty and technology.
                      </p>
                    </div>
                  </article>
                </div>
              </section>

              {/* Right: Why Choose Us */}
              <section className="p-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Award className="w-8 h-8 text-amber-500" aria-hidden="true" />
                    <h2 className="text-3xl font-bold text-gray-800">Why Choose {settings.restaurant_name}</h2>
                  </div>

                  <div className="space-y-4" role="list">
                    <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200" role="listitem">
                      <Shield className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <h4 className="font-semibold text-yellow-800">Authentic Products Guaranteed</h4>
                        <p className="text-yellow-700 text-sm">All beauty products and tech accessories are carefully selected, quality-tested, and guaranteed authentic before reaching you.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200" role="listitem">
                      <Users className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <h4 className="font-semibold text-amber-800">Customer-First Approach</h4>
                        <p className="text-amber-700 text-sm">Your satisfaction is our priority with dedicated customer support, easy returns, and personalized beauty consultations.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200" role="listitem">
                      <Star className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <h4 className="font-semibold text-orange-800">Trusted Experience</h4>
                        <p className="text-orange-700 text-sm">Years of experience serving customers across multiple regions with premium beauty and tech products.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl border border-amber-200">
                    <h3 className="font-semibold text-amber-800 mb-3">Our Commitment to You</h3>
                    <ul className="space-y-2 text-amber-700 text-sm" role="list">
                      <li role="listitem">• Fast and secure delivery across India and UAE</li>
                      <li role="listitem">• 100% authentic beauty products and tech accessories</li>
                      <li role="listitem">• Competitive pricing with regular offers</li>
                      <li role="listitem">• Excellent customer service and beauty consultation</li>
                      <li role="listitem">• Easy returns and exchanges within 7 days</li>
                      <li role="listitem">• Secure payment options including UPI and COD</li>
                    </ul>
                  </div>
                </div>
              </section>
            </main>

            {/* Call-to-Action Section */}
            <section className="p-10 border-t border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-gray-800">Ready to Experience the {settings.restaurant_name} Difference?</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Join thousands of satisfied customers who trust {settings.restaurant_name} for their beauty and tech needs. Discover premium products at unbeatable prices.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mt-6">
                  <Link 
                    href="/products" 
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                    aria-label="Browse our premium beauty products and tech accessories"
                  >
                    Shop Premium Products
                  </Link>
                  <Link 
                    href="/contact" 
                    className="border-2 border-amber-400 text-amber-600 px-8 py-3 rounded-full font-semibold hover:bg-amber-50 transition-all duration-300"
                    aria-label="Contact us for beauty consultation or product inquiries"
                  >
                    Get Beauty Consultation
                  </Link>
                </div>
              </div>
              
              <footer className="mt-8 text-center text-gray-400 text-xs">
                © {new Date().getFullYear()} {settings.restaurant_name}. All rights reserved. | Premium Beauty Products & Tech Accessories
              </footer>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
