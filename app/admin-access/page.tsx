"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Lock, Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"

export default function AdminAccess() {
  const [secretKey, setSecretKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/verify-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey })
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Access granted! Redirecting to admin panel...", { position: 'top-center' })
        // Store access token in session
        sessionStorage.setItem("admin_access_granted", "true")
        setTimeout(() => {
          router.push("/admin/login")
        }, 1000)
      } else {
        toast.error("Invalid access key. Access denied.", { position: 'top-center' })
        setSecretKey("")
      }
    } catch (error) {
      toast.error("Failed to verify access. Please try again.", { position: 'top-center' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Secure Admin Access</h1>
          <p className="text-gray-400">Enter the secret access key to continue</p>
        </div>

        {/* Access Form */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-center flex items-center justify-center">
              <Lock className="w-5 h-5 mr-2 text-red-500" />
              Restricted Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="secretKey" className="text-gray-300">
                  Secret Access Key
                </Label>
                <div className="relative">
                  <Input
                    id="secretKey"
                    type={showKey ? "text" : "password"}
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder="Enter secret access key"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !secretKey.trim()}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Verify Access
                  </>
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-yellow-400 font-medium text-sm">Security Notice</h4>
                  <p className="text-yellow-300 text-xs mt-1">
                    This is a restricted area. Only authorized personnel with valid access keys can proceed.
                    All access attempts are logged and monitored.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2025 Sabs Online. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
