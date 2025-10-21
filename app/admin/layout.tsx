"use client"

import type React from "react"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { usePathname } from "next/navigation"
import type { AppDispatch } from "@/lib/store"
import { fetchAdminData } from "@/lib/store/slices/adminSlice"
import { AdminAuthProvider } from "@/lib/contexts/admin-auth-context"
import AdminAuthWrapper from "@/components/admin/AdminAuthWrapper"
import AdminSidebar from "@/components/admin/sidebar"
import AdminHeader from "@/components/admin/header"
import AdminBottomTabs from "@/components/admin/admin-bottom-tabs"

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>()
  const pathname = usePathname()

  // Public admin routes that don't need the full admin layout
  // Note: /admin/register is removed from public access - only super admin can add users
  const authRoutes = [
    '/admin/login',
    '/admin/forgot-password',
    '/admin/reset-password'
  ]

  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  useEffect(() => {
    if (!isAuthRoute) {
      dispatch(fetchAdminData())
    }
  }, [dispatch, isAuthRoute])

  // For auth pages, just render the children without admin layout
  if (isAuthRoute) {
    return <>{children}</>
  }

  // For protected admin pages, render with full admin layout
  return (
    <div className="min-h-screen admin-gradient">
      <div className="flex">
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 p-4 pb-24 sm:pb-24 md:pb-24 lg:pb-6">{children}</main>
        </div>
      </div>
      <AdminBottomTabs />
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <AdminAuthWrapper>
        <AdminLayoutContent>
          {children}
        </AdminLayoutContent>
      </AdminAuthWrapper>
    </AdminAuthProvider>
  )
}
