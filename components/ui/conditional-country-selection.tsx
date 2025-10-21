'use client'

import { usePathname } from 'next/navigation'
import CountrySelectionWrapper from './country-selection-wrapper'

export default function ConditionalCountrySelection() {
  const pathname = usePathname()
  
  // Don't show country selection on admin pages
  if (pathname?.startsWith('/admin')) {
    return null
  }
  
  return <CountrySelectionWrapper />
}
