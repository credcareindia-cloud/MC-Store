"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { useAdminAuth } from "@/lib/contexts/admin-auth-context"
import toast from "react-hot-toast"

export default function AdminForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { sendPasswordReset } = useAdminAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await sendPasswordReset(email)
      if (result.success) {
        setEmailSent(true)
        toast.success("Password reset email sent!", { position: 'top-center' })
      } else {
        toast.error(result.message || "Failed to send reset email", { position: 'top-center' })
      }
    } catch (error) {
      toast.error("Failed to send reset email", { position: 'top-center' })
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Sent!</h1>
            <p className="text-gray-600">Check your inbox for reset instructions</p>
          </div>

          {/* Success Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium mb-2">Reset email sent successfully!</p>
                  <p className="text-green-700 text-sm">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <h3 className="font-medium text-blue-900 mb-2">Next steps:</h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Check your email inbox</li>
                    <li>• Look for an email from Sabs Online</li>
                    <li>• Click the reset link (expires in 1 hour)</li>
                    <li>• Create your new password</li>
                  </ul>
                </div>

                <div className="space-y-3 pt-4">
                  <Button
                    onClick={() => {
                      setEmailSent(false)
                      setEmail("")
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Send Another Email
                  </Button>
                  
                  <Link href="/admin/login">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password</h1>
          <p className="text-gray-600">Reset your admin panel password</p>
        </div>

        {/* Forgot Password Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              Reset Password
            </CardTitle>
            <p className="text-center text-gray-600 text-sm">
              Enter your admin email address and we'll send you a reset link
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Admin Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sabsonline.com"
                    className="pl-10 h-12 border-gray-200 focus:border-red-500 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> The reset link will expire in 1 hour for security reasons.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending Reset Link...</span>
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-6 text-center">
              <Link 
                href="/admin/login" 
                className="inline-flex items-center text-sm text-red-600 hover:text-red-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </Link>
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
