"use client"
import { usePathname } from "next/navigation"
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