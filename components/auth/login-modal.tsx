"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, MessageSquare, Shield, CheckCircle, Eye, EyeOff, Lock, User } from "lucide-react"
import { SITE_WHATSAPP_E164_DIGITS } from "@/lib/site-contact"
import toast from "react-hot-toast"

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  )
}

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
  description = "Log in or register to continue",
}: LoginModalProps) {
  const { loginWithPassword, registerWithPassword, loginWithGoogle } = useAuth()
  const [mode, setMode] = useState<"login" | "register" | "forgot-password">("login")
  const [identifier, setIdentifier] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  // Load Google Identity Services SDK script dynamically
  useEffect(() => {
    if (!isOpen) return
    const scriptId = "google-gsi-client"
    if (typeof window !== "undefined" && !document.getElementById(scriptId)) {
      const script = document.createElement("script")
      script.id = scriptId
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }
  }, [isOpen])

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

  const handleGoogleSignIn = useCallback(async () => {
    setGoogleLoading(true)
    setError("")

    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1084283457912-df759e6j2h8j3k4l5m6n7p8q9r0s.apps.googleusercontent.com"

    try {
      // 1. Try Google Identity Services (GIS) Token Client (Opens official Google Account Chooser popup window)
      if (typeof window !== "undefined" && (window as any).google?.accounts?.oauth2) {
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: "openid email profile",
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              console.error("Google Auth error:", tokenResponse.error)
              setError("Google authentication was cancelled.")
              setGoogleLoading(false)
              return
            }

            try {
              // Fetch user profile info from Google UserInfo API
              const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              })
              const userInfo = await userInfoRes.json()

              if (userInfo.email) {
                await loginWithGoogle({
                  email: userInfo.email,
                  name: userInfo.name || userInfo.given_name || userInfo.email.split("@")[0],
                  image: userInfo.picture,
                })
                toast.success("Successfully signed in with Google!")
                onClose()
                resetForm()
              } else {
                setError("Failed to retrieve Google account details.")
              }
            } catch (err: any) {
              setError(err.message || "Failed to log in with Google account.")
            } finally {
              setGoogleLoading(false)
            }
          },
        })

        // Force 'select_account' prompt to display official Google Account Chooser screen
        tokenClient.requestAccessToken({ prompt: "select_account" })
        return
      }

      // 2. Fallback: Launch Official Google OAuth 2.0 Popup Window directly
      const redirectUri = typeof window !== "undefined" ? window.location.origin : ""
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        googleClientId
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=token&scope=${encodeURIComponent(
        "openid email profile"
      )}&prompt=select_account`

      const width = 520
      const height = 650
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2

      const popup = window.open(
        googleAuthUrl,
        "GoogleSignInPopup",
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
      )

      if (!popup) {
        setError("Popup was blocked by your browser. Please allow popups to sign in with Google.")
        setGoogleLoading(false)
        return
      }

      const checkPopupInterval = setInterval(() => {
        try {
          if (!popup || popup.closed) {
            clearInterval(checkPopupInterval)
            setGoogleLoading(false)
            return
          }

          if (popup.location.href.includes("access_token=")) {
            const hash = popup.location.hash || popup.location.search
            const params = new URLSearchParams(hash.replace("#", "?"))
            const accessToken = params.get("access_token")
            popup.close()
            clearInterval(checkPopupInterval)

            if (accessToken) {
              fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${accessToken}` },
              })
                .then((res) => res.json())
                .then(async (userInfo) => {
                  if (userInfo.email) {
                    await loginWithGoogle({
                      email: userInfo.email,
                      name: userInfo.name || userInfo.email.split("@")[0],
                      image: userInfo.picture,
                    })
                    toast.success("Successfully signed in with Google!")
                    onClose()
                    resetForm()
                  }
                })
                .catch((err) => setError(err.message || "Failed to process Google sign-in"))
                .finally(() => setGoogleLoading(false))
            }
          }
        } catch {
          // Cross-origin access ignored until popup redirects to origin
        }
      }, 500)
    } catch (err: any) {
      setError(err.message || "Google Sign-In failed")
      setGoogleLoading(false)
    }
  }, [loginWithGoogle, onClose])

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await loginWithPassword(identifier, password)
      toast.success("Successfully logged in!")
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
      toast.success("Account created successfully!")
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
                    {/* Google Sign In Button */}
                    <Button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading || loading}
                      className="w-full h-11 border border-slate-300 hover:border-slate-400 bg-white text-slate-800 hover:bg-slate-50 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3"
                    >
                      <GoogleIcon className="w-5 h-5 shrink-0" />
                      <span>{googleLoading ? "Connecting Google..." : "Continue with Google"}</span>
                    </Button>

                    <div className="relative my-3">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200" />
                      </div>
                      <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                        <span className="bg-slate-50 px-3 text-slate-400 font-bold">Or with email / phone</span>
                      </div>
                    </div>

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
                    {/* Google Sign In Button */}
                    <Button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading || loading}
                      className="w-full h-11 border border-slate-300 hover:border-slate-400 bg-white text-slate-800 hover:bg-slate-50 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3"
                    >
                      <GoogleIcon className="w-5 h-5 shrink-0" />
                      <span>{googleLoading ? "Connecting Google..." : "Sign up with Google"}</span>
                    </Button>

                    <div className="relative my-3">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200" />
                      </div>
                      <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                        <span className="bg-slate-50 px-3 text-slate-400 font-bold">Or register with email / phone</span>
                      </div>
                    </div>

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
