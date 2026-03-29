import { Metadata } from 'next'
import AboutPageClient from './about-client'

export const metadata: Metadata = {
  title: 'About Us - Motoclub | Motorcycle parts & accessories',
  description:
    'Motoclub supplies motorcycle spare parts and riding accessories with reliable quality and nationwide delivery across India.',
  keywords: [
    'motoclub',
    'motorcycle parts India',
    'bike spare parts',
    'riding accessories',
    'motorcycle accessories online',
  ].join(', '),
  authors: [{ name: 'Motoclub Team' }],
  creator: 'Motoclub',
  publisher: 'Motoclub',
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
    title: 'About Motoclub',
    description:
      'Motorcycle spare parts and accessories, delivered across India.',
    type: 'website',
    url: 'https://motoclub.in/about',
    siteName: 'Motoclub',
    images: [
      {
        url: '/og-about.jpg',
        width: 1200,
        height: 630,
        alt: 'About Motoclub',
      },
    ],
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Motoclub',
    description: 'Motorcycle spare parts and accessories, delivered across India.',
    images: ['/og-about.jpg'],
    creator: '@motoclub',
  },
  alternates: {
    canonical: 'https://motoclub.in/about',
  },
  other: {
    'business:contact_data:street_address':
      'Moto club Kottakkal, Thoppil tower, Parakkori, Puthoor, Kottakkal, Malappuram dist., Kerala',
    'business:contact_data:locality': 'Kottakkal',
    'business:contact_data:region': 'Kerala',
    'business:contact_data:postal_code': '676503',
    'business:contact_data:country_name': 'India',
  },
}

export default function AboutPage() {
  return <AboutPageClient />
}
