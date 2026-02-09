import { Metadata } from 'next'
import { Award, Heart, Shield, Users, Star, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import AboutPageClient from './about-client'

export const metadata: Metadata = {
  title: 'About Us - Motoclub kottackal | Spare Parts & Accessories',
  description: 'Discover Motoclub Kottakkal\'s story, mission, and commitment to quality. Your trusted partner for genuine spare parts and reliable accessories.',
  keywords: [
    'about motoclub kottackal',
    'spare parts and accessories store',
    'motoclub kottackal',
    'spare parts and accessories',
    'motoclub kottackal',
  ],
  authors: [{ name: 'Motoclub kottackal Team' }],
  creator: 'Motoclub kottackal',
  publisher: 'Motoclub kottackal',
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
    title: 'About Us - Motoclub kottackal | Spare Parts & Accessories',
    description: 'Learn about our story, mission, and commitment to bringing you genuine spare parts and reliable accessories.',
    type: 'website',
    url: 'https://motoclub.in/about',
    siteName: 'Motoclub kottackal',
    images: [
      {
        url: '/og-about.jpg',
        width: 1200,
        height: 630,
        alt: 'About Motoclub kottackal - Spare Parts & Accessories Store',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us - Motoclub kottackal | Spare Parts & Accessories',
    description: 'Discover our story, mission, and commitment to genuine spare parts and reliable accessories.',
    images: ['/og-about.jpg'],
    creator: '@motoclubkottackal',
  },
  alternates: {
    canonical: 'https://motoclub.in/about',
  },
  other: {
    'business:contact_data:street_address': 'Moto club Kottakkal, Thoppil tower, Parakkori,  Puthoor, Kottakkal, Malappuram dist.Kerala.',
    'business:contact_data:locality': 'Kottakkal',
    'business:contact_data:region': 'Malappuram',
    'business:contact_data:postal_code': '676501',
    'business:contact_data:country_name': 'India',
  },
}


export default function AboutPage() {
  return <AboutPageClient />
}
