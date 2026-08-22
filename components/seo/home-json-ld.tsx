import JsonLd from "@/components/seo/json-ld"
import { localBusinessJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo"

export default function HomeJsonLd() {
  return <JsonLd data={[organizationJsonLd, localBusinessJsonLd, websiteJsonLd()]} />
}
