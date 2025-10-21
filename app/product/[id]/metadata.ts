import { Metadata } from 'next'

interface ProductMetadataProps {
  params: { id: string }
}

export async function generateMetadata({ params }: ProductMetadataProps): Promise<Metadata> {
  try {
    // Fetch product data for metadata
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://sabsonlinestore.com'}/api/admin/products/${params.id}`, {
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
    // // Get price info
    // let priceText = ''
    // if (product.variants && product.variants.length > 0) {
    //   const variant = product.variants[0]
    //   if (variant.price_aed && variant.price_aed > 0) {
    //     priceText = ` - Starting from ${formatPrice(variant.price_aed, 'AED')}`
    //   } else if (variant.price_inr && variant.price_inr > 0) {
    //     priceText = ` - Starting from ${formatPrice(variant.price_inr, 'INR')}`
    //   }
    // }

    const title = `${productName} | Sabs Online ${shopName}`
    const description = `${productDescription} | Available at Sabs Online ${shopName} store. Quality products with fast delivery.`
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://sabsonlinestore.com'}/product/${params.id}`,
        siteName: 'Sabs Online',
        images: [
          {
            url: productImage.startsWith('http') ? productImage : `${process.env.NEXT_PUBLIC_BASE_URL || 'https://sabsonlinestore.com'}${productImage}`,
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
        images: [productImage.startsWith('http') ? productImage : `${process.env.NEXT_PUBLIC_BASE_URL || 'https://sabsonlinestore.com'}${productImage}`],
        creator: '@sabsonline',
        site: '@sabsonline',
      },
      other: {
        // WhatsApp specific meta tags
        'og:image:width': '800',
        'og:image:height': '600',
            'og:image:type': 'image/jpeg',
    // Additional meta tags for better sharing
        // 'product:price:amount': product.variants?.[0]?.price_aed || product.variants?.[0]?.price_inr || '',
        // 'product:price:currency': product.variants?.[0]?.price_aed ? 'AED' : 'INR',
        // Product metadata without specific pricing
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
