import { Metadata } from 'next'

interface ProductMetadataProps {
  params: { id: string }
}

export async function generateMetadata({ params }: ProductMetadataProps): Promise<Metadata> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://motoclub.in'
    const response = await fetch(`${baseUrl}/api/admin/products/${params.id}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return {
        title: 'Product Not Found - Motoclub',
        description: 'The requested product could not be found.',
      }
    }

    const product = await response.json()
    
    const productImage = product.image_urls?.[0] || '/logo.png'
    const productName = product.name || 'Product'
    const productDescription = product.description || 'Motorcycle parts and accessories from Motoclub'

    const title = `${productName} | Motoclub`
    const description = `${productDescription} | Buy at Motoclub — spare parts & accessories with delivery across India.`
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url: `${baseUrl}/product/${params.id}`,
        siteName: 'Motoclub',
        images: [
          {
            url: productImage.startsWith('http') ? productImage : `${baseUrl}${productImage}`,
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
        images: [productImage.startsWith('http') ? productImage : `${baseUrl}${productImage}`],
        creator: '@motoclub',
        site: '@motoclub',
      },
      other: {
        'og:image:width': '800',
        'og:image:height': '600',
        'og:image:type': 'image/jpeg',
        'product:availability': product.is_available ? 'in stock' : 'out of stock',
        'product:brand': 'Motoclub',
        'product:category': product.category_name || 'Products',
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Motoclub',
      description: 'Motorcycle spare parts and accessories, delivered across India.',
    }
  }
}
