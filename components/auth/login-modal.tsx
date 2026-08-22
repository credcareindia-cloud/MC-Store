"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { MessageSquare, CheckCircle, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { SITE_WHATSAPP_E164_DIGITS } from "@/lib/site-contact"
import MotoCartLogo from "@/components/ui/logo"
import toast from "react-hot-toast"

function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
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

const inputClassName =
  "h-11 rounded-xl border-zinc-200 bg-zinc-50 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:border-red-500 focus-visible:ring-red-500/20"

export default function LoginModal({
  isOpen,
  onClose,
  onWhatsAppRedirect,
  title = "Welcome back",
  description = "Sign in to continue shopping",
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

    const googleClientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      "1084283457912-df759e6j2h8j3k4l5m6n7p8q9r0s.apps.googleusercontent.com"

    try {
      if (typeof window !== "undefined" && (window as any).google?.accounts?.oauth2) {
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: "openid email profile",
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              setError("Google sign-in was cancelled.")
              setGoogleLoading(false)
              return
            }

            try {
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
                toast.success("Signed in with Google")
                onClose()
                resetForm()
              } else {
                setError("Could not load Google account details.")
              }
            } catch (err: any) {
              setError(err.message || "Google sign-in failed.")
            } finally {
              setGoogleLoading(false)
            }
          },
        })

        tokenClient.requestAccessToken({ prompt: "select_account" })
        return
      }

      const redirectUri = typeof window !== "undefined" ? window.location.origin : ""
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        googleClientId
      )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(
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
        setError("Allow popups to sign in with Google.")
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
                    toast.success("Signed in with Google")
                    onClose()
                    resetForm()
                  }
                })
                .catch((err) => setError(err.message || "Google sign-in failed."))
                .finally(() => setGoogleLoading(false))
            }
          }
        } catch {
          // cross-origin until redirect
        }
      }, 500)
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.")
      setGoogleLoading(false)
    }
  }, [loginWithGoogle, onClose])

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await loginWithPassword(identifier, password)
      toast.success("Welcome back!")
      onClose()
      resetForm()
    } catch (err: any) {
      setError(err.message || "Sign in failed")
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
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    try {
      await registerWithPassword(name, identifier, password)
      toast.success("Account created")
      onClose()
      resetForm()
    } catch (err: any) {
      setError(err.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identifier }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email")
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
    window.open(`https://wa.me/${SITE_WHATSAPP_E164_DIGITS}?text=${message}`, "_blank")
    onWhatsAppRedirect?.()
    onClose()
  }

  const dialogTitle =
    mode === "register" ? "Create account" : mode === "forgot-password" ? "Reset password" : title

  const ErrorMessage = error ? (
    <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600">{error}</p>
  ) : null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="gap-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-0 shadow-2xl sm:max-w-[400px]">
        <div className="border-b border-zinc-100 px-6 pb-5 pt-6 text-center">
          <MotoCartLogo className="mx-auto h-8 w-auto" variant="light" />
          <DialogTitle className="mt-4 text-xl font-bold tracking-tight text-zinc-900">
            {dialogTitle}
          </DialogTitle>
          {mode !== "forgot-password" && (
            <p className="mt-1 text-sm text-zinc-500">{description}</p>
          )}
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {mode === "forgot-password" ? (
            <div className="space-y-4">
              {!resetEmailSent ? (
                <>
                  <p className="text-center text-sm text-zinc-500">
                    Enter your email and we&apos;ll send a reset link.
                  </p>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="reset-email" className="text-xs font-medium text-zinc-600">
                        Email
                      </Label>
                      <Input
                        id="reset-email"
                        type="email"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="you@email.com"
                        required
                        className={inputClassName}
                      />
                    </div>
                    {ErrorMessage}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-11 w-full rounded-full bg-red-600 font-semibold text-white hover:bg-red-700"
                    >
                      {loading ? "Sending…" : "Send reset link"}
                    </Button>
                  </form>
                  <button
                    type="button"
                    onClick={() => handleModeChange("login")}
                    className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-800"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to sign in
                  </button>
                </>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="text-sm text-zinc-600">
                    Reset link sent to <span className="font-semibold text-zinc-900">{identifier}</span>
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleModeChange("login")}
                    className="h-11 w-full rounded-full border-zinc-200"
                  >
                    Back to sign in
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="mb-5 flex rounded-full bg-zinc-100 p-1">
                <button
                  type="button"
                  onClick={() => handleModeChange("login")}
                  className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                    mode === "login" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange("register")}
                  className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                    mode === "register" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                  }`}
                >
                  Sign up
                </button>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="mb-4 flex h-11 w-full items-center justify-center gap-2.5 rounded-full border-zinc-200 bg-white font-medium text-zinc-800 hover:bg-zinc-50"
              >
                <GoogleIcon />
                {googleLoading ? "Connecting…" : "Continue with Google"}
              </Button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-100" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-zinc-400">or</span>
                </div>
              </div>

              {mode === "login" ? (
                <form onSubmit={handlePasswordLogin} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-identifier" className="text-xs font-medium text-zinc-600">
                      Email or phone
                    </Label>
                    <Input
                      id="login-identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="you@email.com"
                      required
                      className={inputClassName}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="login-password" className="text-xs font-medium text-zinc-600">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className={`${inputClassName} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {ErrorMessage}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full rounded-full bg-red-600 font-semibold text-white hover:bg-red-700"
                  >
                    {loading ? "Signing in…" : "Sign in"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => handleModeChange("forgot-password")}
                    className="w-full text-center text-xs font-medium text-zinc-500 hover:text-red-600"
                  >
                    Forgot password?
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="register-name" className="text-xs font-medium text-zinc-600">
                      Full name
                    </Label>
                    <Input
                      id="register-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                      className={inputClassName}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="register-identifier" className="text-xs font-medium text-zinc-600">
                      Email or phone
                    </Label>
                    <Input
                      id="register-identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="you@email.com"
                      required
                      className={inputClassName}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="register-password" className="text-xs font-medium text-zinc-600">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        required
                        minLength={6}
                        className={`${inputClassName} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-password" className="text-xs font-medium text-zinc-600">
                      Confirm password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        required
                        minLength={6}
                        className={`${inputClassName} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {ErrorMessage}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full rounded-full bg-red-600 font-semibold text-white hover:bg-red-700"
                  >
                    {loading ? "Creating account…" : "Create account"}
                  </Button>
                </form>
              )}
            </>
          )}

          <button
            type="button"
            onClick={handleWhatsApp}
            className="mt-6 flex w-full items-center justify-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800"
          >
            <MessageSquare className="h-4 w-4 text-emerald-600" />
            Order via WhatsApp
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
