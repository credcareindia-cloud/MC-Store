import JsonLd from "@/components/seo/json-ld"
import type { ErpProduct } from "@/lib/services/product-service"
import { absoluteUrl, SITE_NAME } from "@/lib/seo"

function productImageUrl(product: ErpProduct): string {
  const image = product.image_urls?.[0] || product.image_url
  if (!image) return absoluteUrl("/motocart-logo.png")
  return image.startsWith("http") ? image : absoluteUrl(image)
}

export default function ProductJsonLd({ product }: { product: ErpProduct }) {
  const price = product.variants?.[0]?.price ?? product.price
  const inStock = (product.total_stock ?? 0) > 0

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} — automobile spare parts from ${SITE_NAME}.`,
    image: productImageUrl(product),
    sku: product.variants?.[0]?.sku || product.barcode || String(product.id),
    brand: {
      "@type": "Brand",
      name: product.company_name || SITE_NAME,
    },
    category: product.category_name || "Automobile Parts",
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product.id}`),
      priceCurrency: "INR",
      price: price.toFixed(2),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  }

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: absoluteUrl("/products"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: absoluteUrl(`/product/${product.id}`),
      },
    ],
  }

  return <JsonLd data={[data, breadcrumb]} />
}
