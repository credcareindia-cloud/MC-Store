"use client"
import { useSettings } from "@/lib/contexts/settings-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { Mail, Phone, MapPin, Send, Facebook, Instagram, Twitter, Clock } from "lucide-react"
import Footer from "@/components/ui/footer"
import Link from "next/link"
import Image from "next/image"
import {
  SITE_ADDRESS_LINES,
  SITE_CONTACT_EMAIL,
  SITE_PHONE_DISPLAY,
  SITE_PHONE_E164,
  SITE_POSTAL_CODE,
} from "@/lib/site-contact"

export default function ContactPage() {
  const { settings } = useSettings()
  const theme = {
    accent: "bg-zinc-900 text-white border-zinc-800",
    shadow: "shadow-sm",
    heading: "text-zinc-900",
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center py-12 px-2">
      <div className="max-w-5xl w-full mx-auto">
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm p-0 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
            {/* Left: Brand & Social */}
            <div className="flex flex-col items-center justify-center p-10 gap-6 border-b md:border-b-0 md:border-r border-zinc-200">
              <div className="flex flex-col items-center gap-3">
                {settings.restaurant_logo ? (
                  <div className="relative w-20 h-20 mb-2">
                    <Image src={settings.restaurant_logo || "/logo.png"} alt={settings.restaurant_name} fill className="object-contain rounded-lg border border-zinc-200 bg-white p-1" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-zinc-900 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-black font-bold text-3xl">{settings.restaurant_name.charAt(0)}</span>
                  </div>
                )}
                <h1 className="font-playfair text-4xl md:text-5xl font-semibold text-zinc-900 text-center tracking-tight">{settings.restaurant_name}</h1>
                <p className="text-gray-600 text-lg text-center max-w-xs">Questions about parts, fitment, or your order? Reach out — we ship across India.</p>
              </div>
              {/* Dynamic Social Media Icons */}
              <div className="flex space-x-6 mt-4">
                {settings.social_facebook && (
                  <a 
                    href={settings.social_facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-zinc-900 transition-colors text-3xl"
                  >
                    <Facebook />
                  </a>
                )}
                {settings.social_instagram && (
                  <a 
                    href={settings.social_instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-zinc-900 transition-colors text-3xl"
                  >
                    <Instagram />
                  </a>
                )}
                {settings.social_twitter && (
                  <a 
                    href={settings.social_twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-zinc-900 transition-colors text-3xl"
                  >
                    <Twitter />
                  </a>
                )}
              </div>
              {(settings.social_facebook || settings.social_instagram || settings.social_twitter) && (
                <div className="mt-2 text-sm text-gray-400">Follow us on social media for updates & offers!</div>
              )}
            </div>
            {/* Right: Info & Links */}
            <div className="flex flex-col justify-center p-10 gap-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Contact Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg text-zinc-900">Contact Info</h4>
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-zinc-600 mt-1 flex-shrink-0" />
                    <div>
                      {SITE_ADDRESS_LINES.map((line) => (
                        <p key={line} className="text-gray-700">
                          {line}
                        </p>
                      ))}
                      <p className="text-gray-700">Pin: {SITE_POSTAL_CODE}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-zinc-600 flex-shrink-0" />
                    <a href={SITE_PHONE_E164} className="text-gray-700 hover:text-zinc-900">
                      {SITE_PHONE_DISPLAY}
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-zinc-600 flex-shrink-0" />
                    <a href={`mailto:${SITE_CONTACT_EMAIL}`} className="text-gray-700 hover:text-zinc-900 break-all">
                      {SITE_CONTACT_EMAIL}
                    </a>
                  </div>
                </div>
                {/* Opening Hours */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg text-zinc-900">Opening Hours</h4>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-zinc-600 flex-shrink-0" />
                    <div className="text-gray-700">
                      <p className="font-medium">Monday - Thursday</p>
                      <p className="text-sm">5:00 PM - 10:00 PM</p>
                    </div>
                  </div>
                  <div className="ml-8 text-gray-700">
                    <p className="font-medium">Friday - Saturday</p>
                    <p className="text-sm">5:00 PM - 11:00 PM</p>
                  </div>
                  <div className="ml-8 text-gray-700">
                    <p className="font-medium">Sunday</p>
                    <p className="text-sm">4:00 PM - 9:00 PM</p>
                  </div>
                </div>
              </div>
              {/* Quick Links */}
              <div className="flex flex-wrap gap-4 mt-4">
                {/* <Link href="/" className="text-gray-700 hover:text-zinc-900 font-medium transition-colors">Home</Link>
                <Link href="/menu" className="text-gray-700 hover:text-zinc-900 font-medium transition-colors">Products</Link> */}
                {/* <Link href="/reservations" className="text-gray-700 hover:text-zinc-900 font-medium transition-colors">Reservations</Link>
                <Link href="/orders" className="text-gray-700 hover:text-zinc-900 font-medium transition-colors">Orders</Link>
                <Link href="/#about" className="text-gray-700 hover:text-zinc-900 font-medium transition-colors">About</Link> */}
                <Link href="/privacy-policy" className="text-gray-700 hover:text-zinc-900 font-medium transition-colors">Privacy Policy</Link>
                <Link href="/terms-of-service" className="text-gray-700 hover:text-zinc-900 font-medium transition-colors">Terms of Service</Link>
              </div>
              <div className="mt-8 text-center text-gray-400 text-xs">© {new Date().getFullYear()} {settings.restaurant_name}. All rights reserved.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
