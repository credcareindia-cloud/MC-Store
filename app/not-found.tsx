"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Search, ArrowLeft } from "lucide-react"

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/")
    }, 5000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative py-4">
          <p className="text-7xl font-semibold text-zinc-200 tracking-tight">404</p>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Search className="h-12 w-12 text-zinc-400" aria-hidden />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-zinc-900">Page not found</h1>
          <p className="text-zinc-600 text-sm leading-relaxed">
            The page you requested does not exist or has moved. You will be redirected to the homepage shortly.
          </p>
        </div>

        <div className="bg-white rounded-md p-4 border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-center gap-2 text-zinc-600 text-sm">
            <div className="h-4 w-4 rounded-full border-2 border-zinc-300 border-t-zinc-800 animate-spin" />
            <span>Redirecting in 5 seconds…</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button
            onClick={() => router.push("/")}
            className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-md"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="border-zinc-300 text-zinc-800 hover:bg-zinc-50 rounded-md"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="pt-6 border-t border-zinc-200">
          <p className="text-xs text-zinc-500 mb-3">Quick links</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              onClick={() => router.push("/products")}
              variant="ghost"
              size="sm"
              className="text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100"
            >
              Products
            </Button>
            <Button
              onClick={() => router.push("/contact")}
              variant="ghost"
              size="sm"
              className="text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100"
            >
              Contact
            </Button>
            <Button
              onClick={() => router.push("/orders")}
              variant="ghost"
              size="sm"
              className="text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100"
            >
              Orders
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
