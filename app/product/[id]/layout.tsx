import { Metadata } from 'next'
import { ReactNode } from 'react'

interface ProductLayoutProps {
  children: ReactNode
  params: { id: string }
}

// Generate metadata for social media sharing
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    // Await params as required by Next.js 15
    const { id } = await params
    
    // Fetch product data for metadata
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://motoclub.in'
    const response = await fetch(`${baseUrl}/api/admin/products/${id}`, {
      cache: 'no-store' // Ensure fresh data for metadata
    })
    
    if (!response.ok) {
      return {
        title: 'Product Not Found - Motoclub',
        description: 'The requested product could not be found.',
      }
    }

    const product = await response.json()
    
    // Get the first image or fallback
    const productImage = product.image_urls?.[0] || '/logo.png'
    const productName = product.name || 'Product'
    const productDescription = product.description || 'Automobile parts and accessories from Motoclub'
    
    // Format price for display
    const formatPrice = (price: number, currency: string) => {
      if (currency === 'AED') {
        return `AED ${price.toFixed(2)}`
      } else {
        return `₹${price.toFixed(2)}`
      }
    }
    
    // Clean title without price for consistent social sharing
    const title = `${productName} | Motoclub`
    const description = `${productDescription} | Buy at Motoclub — spare parts & accessories with delivery across India.`
    const productUrl = `${baseUrl}/product/${id}`
    const imageUrl = productImage.startsWith('http') ? productImage : `${baseUrl}${productImage}`
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url: productUrl,
        siteName: 'Motoclub',
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 600,
            alt: productName,
          }
        ],
        locale: 'en_IN',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
        creator: '@motoclub',
        site: '@motoclub',
      },
      other: {
        // WhatsApp and social media specific meta tags
        'og:image:width': '800',
        'og:image:height': '600',
        'og:image:type': 'image/jpeg',
        'product:price:amount': product.variants?.[0]?.price_aed || product.variants?.[0]?.price_inr || '',
        'product:price:currency': product.variants?.[0]?.price_aed ? 'AED' : 'INR',
        'product:availability': product.is_available ? 'in stock' : 'out of stock',
        'product:brand': 'Motoclub',
        'product:category': product.category_name || 'Products',
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Motoclub',
      description: 'Automobile spare parts and accessories, delivered across India.',
    }
  }
}

export default function ProductLayout({ children }: ProductLayoutProps) {
  return <>{children}</>
}
