"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useClerk } from "@clerk/nextjs"

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk()
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await handleRedirectCallback()
        router.push("/") // Redirect to home or dashboard
      } catch (error) {
        console.error("SSO callback error:", error)
        router.push("/") // Redirect anyway
      }
    }

    handleCallback()
  }, [handleRedirectCallback, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Completing sign in...</p>
      </div>
    </div>
  )
}
