"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAdminAuth } from "@/lib/contexts/admin-auth-context"

interface AdminAuthWrapperProps {
  children: React.ReactNode
}

export default function AdminAuthWrapper({ children }: AdminAuthWrapperProps) {
  const { user, loading, isAuthenticated } = useAdminAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [accessVerified, setAccessVerified] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)

  // Public admin routes that don't require authentication
  // Note: /admin/register is removed from public access - only super admin can add users
  const publicRoutes = [
    '/admin/login',
    '/admin/forgot-password',
    '/admin/reset-password'
  ]

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Check if user has verified admin access
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Check session storage for temporary access
        const sessionAccess = sessionStorage.getItem("admin_access_granted")
        
        // Check server-side access cookie
        const response = await fetch("/api/admin/check-access", {
          credentials: "include"
        })
        
        if (sessionAccess === "true" || response.ok) {
          setAccessVerified(true)
        } else {
          // Redirect to admin access page if not verified
          router.push('/admin-access')
          return
        }
      } catch (error) {
        // If error checking access, redirect to access page
        router.push('/admin-access')
        return
      } finally {
        setCheckingAccess(false)
      }
    }

    // Only check access for admin routes (not for admin-access page itself)
    if (pathname.startsWith('/admin') && pathname !== '/admin-access') {
      checkAdminAccess()
    } else {
      setCheckingAccess(false)
      setAccessVerified(true) // Allow access to admin-access page
    }
  }, [pathname, router])

  useEffect(() => {
    if (!loading && !checkingAccess && accessVerified) {
      if (!isAuthenticated && !isPublicRoute) {
        // Redirect to login if not authenticated and trying to access protected route
        router.push('/admin/login')
      } else if (isAuthenticated && isPublicRoute) {
        // Redirect to dashboard if authenticated and trying to access auth pages
        router.push('/admin')
      }
    }
  }, [isAuthenticated, loading, isPublicRoute, router, accessVerified, checkingAccess])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // Show children if authenticated or on public route
  if (isAuthenticated || isPublicRoute) {
    return <>{children}</>
  }

  // Show nothing while redirecting
  return null
}
