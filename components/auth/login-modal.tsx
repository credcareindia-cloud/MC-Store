"use client"
import type React from "react"
import { useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, MessageSquare, ArrowLeft, Shield, CheckCircle, Eye, EyeOff, Lock, User } from "lucide-react"
import { SignInButton, useSignIn } from "@clerk/nextjs"

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
  title = "Login Required",
  description = "Please authenticate to continue with your order/reservation",
}: LoginModalProps) {
  const { sendOTP, login, register, loginWithPassword } = useAuth()
  const { signIn } = useSignIn()
  const [mode, setMode] = useState<"login" | "register" | "forgot-password">("login")
  const [step, setStep] = useState<"email" | "otp" | "password">("email")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [clerkLoading, setClerkLoading] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  const resetForm = () => {
    setStep("email")
    setEmail("")
    setName("")
    setPassword("")
    setConfirmPassword("")
    setOtp("")
    setOtpSent(false)
    setError("")
    setShowPassword(false)
    setShowConfirmPassword(false)
    setResetEmailSent(false)
  }

  const handleModeChange = (newMode: "login" | "register" | "forgot-password") => {
    setMode(newMode)
    resetForm()
  }

  // Handle Clerk Google Sign In
  const handleGoogleSignIn = async () => {
    if (!signIn) return
    
    setClerkLoading(true)
    setError("")
    
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback", // You can customize this
        redirectUrlComplete: "/", // Where to redirect after successful sign in
      })
      
      // The modal will close automatically when the redirect happens
      onClose()
      resetForm()
    } catch (error: any) {
      console.error("Google sign-in error:", error)
      setError("Failed to sign in with Google. Please try again.")
    } finally {
      setClerkLoading(false)
    }
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await loginWithPassword(email, password)
      onClose()
      resetForm()
    } catch (error: any) {
      setError(error.message)
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
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email')
      }

      setResetEmailSent(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await sendOTP(email)
      setOtpSent(true)
      setStep("otp")

      // Show OTP in development
      if (result.otp) {
        alert(`Development OTP: ${result.otp}`)
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (mode === "register") {
        if (password !== confirmPassword) {
          setError("Passwords don't match")
          setLoading(false)
          return
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters")
          setLoading(false)
          return
        }
        await register(email, otp, name, password)
      } else {
        await login(email, otp, name)
      }
      onClose()
      resetForm()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsApp = () => {
    const phoneNumber = "+1234567890" // Replace with actual restaurant WhatsApp number
    const message = encodeURIComponent("Hi! I'd like to make a reservation/order. Can you help me?")
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
    window.open(whatsappUrl, "_blank")
    onWhatsAppRedirect?.()
    onClose()
  }

  // Dynamically set the dialog title based on mode
  const dialogTitle = mode === "register" ? "Registration" : mode === "forgot-password" ? "Reset Password" : title

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] max-h-[90vh] border-0 p-0 bg-transparent shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 text-white flex-shrink-0">
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <DialogTitle className="text-lg font-semibold text-white">{dialogTitle}</DialogTitle>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{description}</p>
            </DialogHeader>
          </div>

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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            className="h-10 pl-4 pr-4 border-slate-300 focus:border-slate-500 focus:ring-slate-500 rounded-lg text-slate-900 placeholder:text-slate-400 bg-white shadow-sm"
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
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending reset link...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Send reset link
                          </div>
                        )}
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
                      <span className="font-medium text-slate-900">{email}</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Check your inbox and click the link to reset your password.
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
            ) : step === "email" ? (
              <div className="space-y-5">
                {/* Google Sign In Button - Always visible */}
                <div className="space-y-4">
                  <Button
                    onClick={handleGoogleSignIn}
                    disabled={clerkLoading}
                    className="w-full h-11 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 border border-gray-200"
                  >
                    {clerkLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                        Signing in with Google...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        {/* Google Logo SVG */}
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285f4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34a853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#fbbc05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#ea4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continue with Google
                      </div>
                    )}
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-slate-500 font-medium">Or continue with email</span>
                  </div>
                </div>

                {/* Mode Tabs */}
                <Tabs value={mode} onValueChange={(value) => handleModeChange(value as "login" | "register" | "forgot-password")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={handlePasswordLogin} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="login-email" className="text-sm font-medium text-slate-700">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Input
                            id="login-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            className="h-10 pl-4 pr-4 border-slate-300 focus:border-slate-500 focus:ring-slate-500 rounded-lg text-slate-900 placeholder:text-slate-400 bg-white shadow-sm"
                          />
                          <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
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
                            className="h-10 pl-8 pr-10 border-slate-300 focus:border-slate-500 focus:ring-slate-500 rounded-lg text-slate-900 placeholder:text-slate-400 bg-white shadow-sm"
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
                        className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Logging in...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Login
                          </div>
                        )}
                      </Button>
                    </form>

                    {/* Forgot Password Link */}
                    <div className="text-center">
                      <button
                        onClick={() => handleModeChange("forgot-password")}
                        className="text-sm text-slate-600 hover:text-slate-900 underline"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-4">
                    <form onSubmit={handleSendOTP} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="register-name" className="text-sm font-medium text-slate-700">
                          Full Name
                        </Label>
                        <div className="relative">
                          <Input
                            id="register-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                            required
                            className="h-10 pl-8 pr-4 border-slate-300 focus:border-slate-500 focus:ring-slate-500 rounded-lg text-slate-900 placeholder:text-slate-400 bg-white shadow-sm"
                          />
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="register-email" className="text-sm font-medium text-slate-700">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Input
                            id="register-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            className="h-10 pl-8 pr-4 border-slate-300 focus:border-slate-500 focus:ring-slate-500 rounded-lg text-slate-900 placeholder:text-slate-400 bg-white shadow-sm"
                          />
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
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
                              placeholder="Create a password"
                              required
                              minLength={6}
                              className="h-10 pl-8 pr-10 border-slate-300 focus:border-slate-500 focus:ring-slate-500 rounded-lg text-slate-900 placeholder:text-slate-400 bg-white shadow-sm"
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
                              placeholder="Confirm your password"
                              required
                              minLength={6}
                              className="h-10 pl-8 pr-10 border-slate-300 focus:border-slate-500 focus:ring-slate-500 rounded-lg text-slate-900 placeholder:text-slate-400 bg-white shadow-sm"
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
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending verification...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Send verification code
                          </div>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="space-y-5">
                {/* OTP Step - Same as before */}
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Check your email</h3>
                  <p className="text-sm text-slate-600">
                    We've sent a 6-digit verification code to
                    <br />
                    <span className="font-medium text-slate-900">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="otp" className="text-sm font-medium text-slate-700">
                      Verification Code
                    </Label>
                    <Input
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                      required
                      className="h-10 pl-4 pr-4 border-slate-300 focus:border-slate-500 focus:ring-slate-500 rounded-lg text-slate-900 placeholder:text-slate-400 bg-white shadow-sm text-center text-lg font-mono tracking-widest"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("email")}
                      className="flex-1 h-10 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verifying...
                        </div>
                      ) : mode === "register" ? (
                        "Create Account"
                      ) : (
                        "Verify & Login"
                      )}
                    </Button>
                  </div>
                </form>
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
              Continue with WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
