"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface User {
  id: number | string   
  email: string
  phone?: string
  name?: string
  isVerified: boolean
  createdAt?: string
  image?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  loginWithPassword: (identifier: string, password: string) => Promise<void>
  registerWithPassword: (name: string, identifier: string, password: string) => Promise<void>
  login: (email: string, otp: string, name?: string) => Promise<void>
  register: (email: string, otp: string, name: string, password: string) => Promise<void>
  logout: () => Promise<void>
  sendOTP: (email: string) => Promise<{ success: boolean; message: string; otp?: string }>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {  
    fetch("/api/auth/me", { credentials: 'include' }) 
      .then(async (resp) => {
        if (resp.ok) {
          const data = await resp.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const loginWithPassword = async (identifier: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Failed to login")
    }
    setUser(data.user)
  }

  const registerWithPassword = async (name: string, identifier: string, password: string) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, identifier, password }),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Failed to register")
    }
    setUser(data.user)
  }

  const sendOTP = async (email: string) => {
    const response = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Failed to send OTP")
    }
    return data
  }

  const login = async (email: string, otp: string, name?: string) => {
    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, name }),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Failed to verify OTP")
    }
    setUser(data.user)
  }

  const register = async (email: string, otp: string, name: string, password: string) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, name, password }),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Failed to register")
    }
    setUser(data.user)
  }

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    setLoading(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithPassword,
        registerWithPassword,
        login,
        register,
        logout,
        sendOTP,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
