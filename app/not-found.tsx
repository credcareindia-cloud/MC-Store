"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  // Auto-redirect to home after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  const handleGoHome = () => {
    router.push('/')
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 404 Animation */}
        <div className="relative">
          <div className="text-8xl font-bold text-orange-200 animate-pulse">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="h-16 w-16 text-orange-400 animate-bounce" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Oops! Page Not Found
          </h1>
          <p className="text-gray-600 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. 
            Don't worry, we'll redirect you to our homepage automatically.
          </p>
        </div>

        {/* Redirect Timer */}
        <div className="bg-white rounded-lg p-4 shadow-lg border border-orange-100">
          <div className="flex items-center justify-center space-x-2 text-orange-600">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-600 border-t-transparent"></div>
            <span className="text-sm font-medium">
              Redirecting to homepage in 5 seconds...
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={handleGoHome}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Homepage
          </Button>
          
          <Button 
            onClick={handleGoBack}
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50 px-6 py-2 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="pt-6 border-t border-orange-100">
          <p className="text-sm text-gray-500 mb-3">Looking for something specific?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button 
              onClick={() => router.push('/products')}
              variant="ghost"
              size="sm"
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-colors"
            >
              Browse Products
            </Button>
            <Button 
              onClick={() => router.push('/contact')}
              variant="ghost"
              size="sm"
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-colors"
            >
              Contact Us
            </Button>
            <Button 
              onClick={() => router.push('/orders')}
              variant="ghost"
              size="sm"
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-colors"
            >
              My Orders
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
