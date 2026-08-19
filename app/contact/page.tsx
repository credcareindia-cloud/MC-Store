"use client"

export const dynamic = "force-dynamic"

import { useSettings } from "@/lib/contexts/settings-context"
import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { Mail, Phone, MapPin, Send, Facebook, Instagram, Twitter, Clock, MessageCircle, CheckCircle2, Headphones, ShieldCheck, Sparkles } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
  SITE_ADDRESS_LINES,
  SITE_CONTACT_EMAIL,
  SITE_PHONE_DISPLAY,
  SITE_PHONE_E164,
  SITE_POSTAL_CODE,
} from "@/lib/site-contact"

export default function ContactPage() {
  const { settings } = useSettings()
  const brandName = settings.restaurant_name || "MotoClub"

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.phone || !formData.message) {
      toast.error("Please fill in your name, phone number, and message.")
      return
    }

    setSubmitting(true)
    try {
      // Simulate form submission delay
      await new Promise((resolve) => setTimeout(resolve, 800))
      toast.success("Thank you! Your message has been sent successfully. Our team will contact you shortly.")
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
    } catch (error) {
      toast.error("Failed to send message. Please try again or message us on WhatsApp.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleWhatsAppContact = () => {
    const message = `Hi ${brandName}, I have a question about vehicle spare parts and fitment.`
    const url = `https://wa.me/919995442239?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans antialiased">
      {/* Navigation Header */}
      <Navbar />

      <main className="flex-1">
        {/* ─── Hero Section with Dark Automotive Gradient ─── */}
        <section className="relative py-20 lg:py-24 bg-gradient-to-b from-black via-zinc-950 to-zinc-900 border-b border-zinc-800/80 overflow-hidden">
          {/* Background Glows */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-red-600/10 border border-red-500/20 text-red-500 text-xs sm:text-sm font-extrabold uppercase tracking-widest mb-6">
              <Headphones className="w-4 h-4" />
              <span>Contact {brandName} Fitment Support</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
              How Can We Help You With Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-rose-300">Vehicle Spare Parts</span>?
            </h1>

            <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
              Have questions about part compatibility, fitment, pricing, or custom orders? Our automotive specialists are ready to assist you.
            </p>
          </div>
        </section>

        {/* ─── Contact Info Cards Grid ─── */}
        <section className="py-12 bg-zinc-900/40 border-b border-zinc-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Call & WhatsApp Card */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-zinc-700 transition-all group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">Call or WhatsApp Us</h3>
                    <p className="text-xs text-zinc-400 mt-1">Instant fitment support & product inquiries</p>
                  </div>
                  <div className="space-y-1 pt-2">
                    <a href={SITE_PHONE_E164} className="block text-xl font-extrabold text-red-400 hover:text-red-300 transition-colors">
                      {SITE_PHONE_DISPLAY}
                    </a>
                    <p className="text-xs text-zinc-500">Mon - Sat: 9:00 AM - 8:00 PM</p>
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    onClick={handleWhatsAppContact}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Chat on WhatsApp</span>
                  </Button>
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-zinc-700 transition-all group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">Our Main Store & Office</h3>
                    <p className="text-xs text-zinc-400 mt-1">Visit our store location in Kerala, India</p>
                  </div>
                  <div className="space-y-1 pt-2 text-sm text-zinc-300 leading-relaxed">
                    {SITE_ADDRESS_LINES.map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                    <p className="text-xs text-zinc-400 pt-1 font-semibold">Pincode: {SITE_POSTAL_CODE}</p>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Nationwide Shipping Across India</span>
                  </div>
                </div>
              </div>

              {/* Email & Inquiries Card */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-zinc-700 transition-all group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">Email Us</h3>
                    <p className="text-xs text-zinc-400 mt-1">Send us bulk orders or technical queries</p>
                  </div>
                  <div className="pt-2">
                    <a href={`mailto:${SITE_CONTACT_EMAIL}`} className="text-sm sm:text-base font-bold text-zinc-200 hover:text-red-400 transition-colors break-all">
                      {SITE_CONTACT_EMAIL}
                    </a>
                    <p className="text-xs text-zinc-500 mt-1">We respond within 24 business hours</p>
                  </div>
                </div>

                {/* Social Media links */}
                <div className="pt-6 border-t border-zinc-800/80">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Connect On Social Media</p>
                  <div className="flex space-x-3">
                    {settings.social_facebook && (
                      <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-red-600 hover:text-white text-zinc-300 flex items-center justify-center transition-all">
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                    {settings.social_instagram && (
                      <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-red-600 hover:text-white text-zinc-300 flex items-center justify-center transition-all">
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {settings.social_twitter && (
                      <a href={settings.social_twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-red-600 hover:text-white text-zinc-300 flex items-center justify-center transition-all">
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─── Contact Form Section ─── */}
        <section className="py-20 lg:py-24 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-md">
              <div className="text-center space-y-3 mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-red-500 text-xs font-extrabold uppercase tracking-widest">
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Us A Message</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Fitment & Order Inquiry Form</h2>
                <p className="text-zinc-400 text-sm max-w-lg mx-auto">Fill out the form below and our team will get back to you with exact product fitment and availability.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Your Full Name *</label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      required
                      className="bg-zinc-950/80 border-zinc-800 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl h-12 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Phone Number *</label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 9876543210"
                      required
                      className="bg-zinc-950/80 border-zinc-800 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl h-12 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Email Address</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. rahul@example.com"
                      className="bg-zinc-950/80 border-zinc-800 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl h-12 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Vehicle Model & Subject</label>
                    <Input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g. Swift 2020 Door Visor Enquiry"
                      className="bg-zinc-950/80 border-zinc-800 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl h-12 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Your Message / Part Details *</label>
                  <Textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe the vehicle part you are looking for or any question regarding your order..."
                    required
                    className="bg-zinc-950/80 border-zinc-800 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm uppercase tracking-wider py-4 rounded-xl shadow-xl shadow-red-600/20 transition-all hover:scale-[1.01]"
                >
                  {submitting ? "Sending Message..." : "Send Inquiry Message"}
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Main Footer */}
      <Footer />
    </div>
  )
}
