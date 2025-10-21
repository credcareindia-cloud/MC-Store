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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sabsonlinestore.com'
    const response = await fetch(`${baseUrl}/api/admin/products/${id}`, {
      cache: 'no-store' // Ensure fresh data for metadata
    })
    
    if (!response.ok) {
      return {
        title: 'Product Not Found - Sabs Online',
        description: 'The requested product could not be found.',
      }
    }

    const product = await response.json()
    
    // Get the first image or fallback
    const productImage = product.image_urls?.[0] || '/logo.png'
    const productName = product.name || 'Product'
    const productDescription = product.description || 'Quality products from Sabs Online store'
    const shopName = product.shop_category === 'A' ? 'Beauty' : product.shop_category === 'B' ? 'Style' : 'Beauty & Style'
    
    // Format price for display
    const formatPrice = (price: number, currency: string) => {
      if (currency === 'AED') {
        return `AED ${price.toFixed(2)}`
      } else {
        return `₹${price.toFixed(2)}`
      }
    }
    
    // Clean title without price for consistent social sharing
    const title = `${productName} | Sabs Online ${shopName}`
    const description = `${productDescription} | Available at Sabs Online ${shopName} store. Quality products with fast delivery.`
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
        siteName: 'Sabs Online',
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 600,
            alt: productName,
          }
        ],
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
        creator: '@sabsonline',
        site: '@sabsonline',
      },
      other: {
        // WhatsApp and social media specific meta tags
        'og:image:width': '800',
        'og:image:height': '600',
        'og:image:type': 'image/jpeg',
        'product:price:amount': product.variants?.[0]?.price_aed || product.variants?.[0]?.price_inr || '',
        'product:price:currency': product.variants?.[0]?.price_aed ? 'AED' : 'INR',
        'product:availability': product.is_available ? 'in stock' : 'out of stock',
        'product:brand': 'Sabs Online',
        'product:category': product.category_name || 'Products',
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Sabs Online - Quality Products',
      description: 'Discover quality products at Sabs Online store with fast delivery.',
    }
  }
}

export default function ProductLayout({ children }: ProductLayoutProps) {
  return <>{children}</>
}
