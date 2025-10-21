"use client"
import { usePathname } from "next/navigation"
import ShopToggle from "@/components/ui/shop-toggle"
import BottomTabs from "@/components/ui/bottom-tabs"

export default function UserNavVisibility() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")
  if (isAdmin) return null
  return (
    <>
      <BottomTabs />
    </>
  )
} 