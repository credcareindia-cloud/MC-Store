import { Metadata } from "next"
import { ReactNode } from "react"
import ProductJsonLd from "@/components/seo/product-json-ld"
import { getCachedProduct } from "@/lib/seo/get-cached-product"
import {
  absoluteUrl,
  buildPageMetadata,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
} from "@/lib/seo"

interface ProductLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProductLayoutProps): Promise<Metadata> {
  try {
    const { id } = await params
    const product = await getCachedProduct(id)

    if (!product) {
      return buildPageMetadata({
        title: "Product Not Found",
        description: "The requested product could not be found.",
        path: `/product/${id}`,
        noIndex: true,
      })
    }

    const title = product.name
    const description =
      product.description?.slice(0, 155) ||
      `Buy ${product.name} online at ${SITE_NAME}. Genuine automobile spare parts with delivery across India.`
    const productUrl = absoluteUrl(`/product/${id}`)
    const image = product.image_urls?.[0] || product.image_url || DEFAULT_OG_IMAGE
    const imageUrl = image.startsWith("http") ? image : absoluteUrl(image)
    const price = product.variants?.[0]?.price ?? product.price
    const inStock = (product.total_stock ?? 0) > 0

    return {
      ...buildPageMetadata({
        title,
        description,
        path: `/product/${id}`,
        ogImage: imageUrl,
      }),
      openGraph: {
        type: "website",
        locale: "en_IN",
        url: productUrl,
        siteName: SITE_NAME,
        title,
        description,
        images: [{ url: imageUrl, width: 1200, height: 630, alt: product.name }],
      },
      other: {
        "product:price:amount": price.toFixed(2),
        "product:price:currency": "INR",
        "product:availability": inStock ? "in stock" : "out of stock",
        "product:brand": product.company_name || SITE_NAME,
        "product:category": product.category_name || "Automobile Parts",
      },
    }
  } catch (error) {
    console.error("Error generating product metadata:", error)
    return buildPageMetadata({
      title: "Product",
      description: "Automobile spare parts and accessories from MotoCart.",
      path: "/products",
    })
  }
}

export default async function ProductLayout({ children, params }: ProductLayoutProps) {
  const { id } = await params
  const product = await getCachedProduct(id)

  return (
    <>
      {product ? <ProductJsonLd product={product} /> : null}
      {children}
    </>
  )
}
