"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, MessageSquare, Shield, CheckCircle, Eye, EyeOff, Lock, User, Phone } from "lucide-react"
import { SITE_WHATSAPP_E164_DIGITS } from "@/lib/site-contact"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onWhatsAppRedirect?: () => void
  title?: string
  description?: string
}

export default function LoginModal({
  isOpen,
  onClose,
  onWhatsAppRedirect,
  title = "Welcome Back",
  description = "Log in or register with your email or phone number to continue",
}: LoginModalProps) {
  const { loginWithPassword, registerWithPassword } = useAuth()
  const [mode, setMode] = useState<"login" | "register" | "forgot-password">("login")
  const [identifier, setIdentifier] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  const resetForm = () => {
    setIdentifier("")
    setName("")
    setPassword("")
    setConfirmPassword("")
    setError("")
    setShowPassword(false)
    setShowConfirmPassword(false)
    setResetEmailSent(false)
  }

  const handleModeChange = (newMode: "login" | "register" | "forgot-password") => {
    setMode(newMode)
    resetForm()
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await loginWithPassword(identifier, password)
      onClose()
      resetForm()
    } catch (err: any) {
      setError(err.message || "Failed to login")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    try {
      await registerWithPassword(name, identifier, password)
      onClose()
      resetForm()
    } catch (err: any) {
      setError(err.message || "Failed to register")
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email')
      }

      setResetEmailSent(true)
    } catch (err: any) {
      setError(err.message || "Failed to send reset email")
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Hi! I'd like to place an order. Can you help me?")
    const whatsappUrl = `https://wa.me/${SITE_WHATSAPP_E164_DIGITS}?text=${message}`
    window.open(whatsappUrl, "_blank")
    onWhatsAppRedirect?.()
    onClose()
  }

  const dialogTitle = mode === "register" ? "Create an Account" : mode === "forgot-password" ? "Reset Password" : title

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] max-h-[90vh] border-0 p-0 bg-transparent shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 text-white flex-shrink-0">
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <DialogTitle className="text-xl font-bold text-white">{dialogTitle}</DialogTitle>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{description}</p>
            </DialogHeader>
          </div>

          {/* Form Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {mode === "forgot-password" ? (
              <div className="space-y-5">
                {!resetEmailSent ? (
                  <>
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-semibold text-slate-900">Reset your password</h3>
                      <p className="text-sm text-slate-600">
                        Enter your email address and we'll send you a link to reset your password.
                      </p>
                    </div>

                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="reset-email" className="text-sm font-medium text-slate-700">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Input
                            id="reset-email"
                            type="email"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="your@email.com"
                            required
                            className="h-10 pl-4 pr-10 border-slate-300 focus:border-amber-500 focus:ring-amber-500 rounded-lg text-slate-900 placeholder:text-slate-400 bg-white shadow-sm"
                          />
                          <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
                          <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                      >
                        {loading ? "Sending reset link..." : "Send Reset Link"}
                      </Button>
                    </form>

                    <div className="text-center">
                      <button
                        onClick={() => handleModeChange("login")}
                        className="text-sm text-slate-600 hover:text-slate-900 underline"
                      >
                        Back to login
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Reset link sent!</h3>
                    <p className="text-sm text-slate-600">
                      We've sent a password reset link to
                      <br />
                      <span className="font-medium text-slate-900">{identifier}</span>
                    </p>
                    <Button
                      onClick={() => handleModeChange("login")}
                      variant="outline"
                      className="w-full h-10 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium"
                    >
                      Back to login
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                {/* Tabs */}
                <Tabs value={mode} onValueChange={(value) => handleModeChange(value as "login" | "register")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="login" className="rounded-lg py-2 font-semibold">Login</TabsTrigger>
                    <TabsTrigger value="register" className="rounded-lg py-2 font-semibold">Register</TabsTrigger>
                  </TabsList>

                  {/* LOGIN FORM */}
                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={handlePasswordLogin} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="login-identifier" className="text-sm font-medium text-slate-700">
                          Email or Phone Number
                        </Label>
                        <div className="relative">
                          <Input
                            id="login-identifier"
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="your@email.com or +91 9876543210"
                            required
                            className="h-11 pl-10 pr-4 border-slate-300 focus:border-amber-500 focus:ring-amber-500 rounded-lg text-slate-900 placeholder:text-slate-400 bg-white shadow-sm"
                          />
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="login-password" className="text-sm font-medium text-slate-700">
                          Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            className="h-11 pl-10 pr-10 border-slate-300 focus:border-amber-500 focus:ring-amber-500 rounded-lg text-slate-900 placeholder:text-slate-400 bg-white shadow-sm"
                          />
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
                          <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                      >
                        {loading ? "Logging in..." : "Log In"}
                      </Button>
                    </form>

                    <div className="text-center pt-2">
                      <button
                        onClick={() => handleModeChange("forgot-password")}
                        className="text-xs text-slate-600 hover:text-slate-900 underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </TabsContent>

                  {/* REGISTER FORM */}
                  <TabsContent value="register" className="space-y-4">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="register-name" className="text-sm font-medium text-slate-700">
                          Full Name
                        </Label>
                        <div className="relative">
                          <Input
                            id="register-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            required
                            className="h-10 pl-10 pr-4 border-slate-300 focus:border-amber-500 focus:ring-amber-500 rounded-lg text-slate-900 placeholder:text-slate-400 bg-white shadow-sm"
                          />
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="register-identifier" className="text-sm font-medium text-slate-700">
                          Email or Phone Number
                        </Label>
                        <div className="relative">
                          <Input
                            id="register-identifier"
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="your@email.com or +91 9876543210"
                            required
                            className="h-10 pl-10 pr-4 border-slate-300 focus:border-amber-500 focus:ring-amber-500 rounded-lg text-slate-900 placeholder:text-slate-400 bg-white shadow-sm"
                          />
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="register-password" className="text-sm font-medium text-slate-700">
                          Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            required
                            minLength={6}
                            className="h-10 pl-10 pr-10 border-slate-300 focus:border-amber-500 focus:ring-amber-500 rounded-lg text-slate-900 placeholder:text-slate-400 bg-white shadow-sm"
                          />
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="confirm-password" className="text-sm font-medium text-slate-700">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                            required
                            minLength={6}
                            className="h-10 pl-10 pr-10 border-slate-300 focus:border-amber-500 focus:ring-amber-500 rounded-lg text-slate-900 placeholder:text-slate-400 bg-white shadow-sm"
                          />
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
                          <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                      >
                        {loading ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* WhatsApp Option */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-500 font-medium">Need help?</span>
              </div>
            </div>

            <Button
              onClick={handleWhatsApp}
              variant="outline"
              className="w-full h-10 border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 bg-green-50/50 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <MessageSquare className="w-5 h-5 mr-3 text-green-600" />
              Order / Inquire via WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
