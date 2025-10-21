import { Metadata } from 'next'
import { Award, Heart, Shield, Users, Star, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import AboutPageClient from './about-client'

export const metadata: Metadata = {
  title: 'About Us - Sabs Online | Premium Beauty Products & Tech Accessories',
  description: 'Discover Sabs Online\'s story, mission, and commitment to quality. Your trusted partner for authentic beauty products, skincare, cosmetics, and cutting-edge tech accessories since our founding.',
  keywords: [
    'about sabs online',
    'beauty products company',
    'tech accessories store',
    'skincare brand',
    'cosmetics retailer',
    'authentic beauty products',
    'premium tech accessories',
    'customer satisfaction',
    'quality guarantee',
    'beauty and technology',
    'online beauty store',
    'trusted retailer'
  ].join(', '),
  authors: [{ name: 'Sabs Online Team' }],
  creator: 'Sabs Online',
  publisher: 'Sabs Online',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'About Us - Sabs Online | Premium Beauty Products & Tech Accessories',
    description: 'Learn about our story, mission, and commitment to bringing you authentic beauty products and cutting-edge tech accessories. Discover why thousands trust Sabs Online.',
    type: 'website',
    url: 'https://sabsonline.com/about',
    siteName: 'Sabs Online',
    images: [
      {
        url: '/og-about.jpg',
        width: 1200,
        height: 630,
        alt: 'About Sabs Online - Premium Beauty & Tech Store',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us - Sabs Online | Premium Beauty Products & Tech Accessories',
    description: 'Discover our story, mission, and commitment to quality beauty products and tech accessories.',
    images: ['/og-about.jpg'],
    creator: '@sabsonline',
  },
  alternates: {
    canonical: 'https://sabsonline.com/about',
  },
  other: {
    'business:contact_data:street_address': '23/384/A62 Prince Tower, Near KNH Hospital',
    'business:contact_data:locality': 'Uppala',
    'business:contact_data:region': 'Kasaragod',
    'business:contact_data:postal_code': '671322',
    'business:contact_data:country_name': 'India',
  },
}

export default function AboutPage() {
  return <AboutPageClient />
}
