"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useUser as useClerkUser, useAuth as useClerkAuth } from "@clerk/nextjs"

interface User {
  id: number | string   
  email: string
  name?: string
  isVerified: boolean
  createdAt?: string
  isClerkUser?: boolean
  dbId?: number // Database ID for Clerk users
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, otp: string, name?: string) => Promise<void>
  register: (email: string, otp: string, name: string, password: string) => Promise<void>
  loginWithPassword: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  sendOTP: (email: string) => Promise<{ success: boolean; message: string; otp?: string }>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { user: clerkUser, isLoaded: clerkLoaded } = useClerkUser()
  const { signOut: clerkSignOut } = useClerkAuth()

  // Function to sync Clerk user to database
  const syncClerkUserToDatabase = async (clerkUser: any) => {
    try {
      const response = await fetch("/api/auth/sync-clerk-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress || "",
          name: clerkUser.fullName || clerkUser.firstName || "",
          phone: clerkUser.phoneNumbers?.[0]?.phoneNumber || ""
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Clerk user ${data.action} in database:`, data.user.email)
        return data.user
      } else {
        console.error("❌ Failed to sync Clerk user to database")
      }
    } catch (error) {
      console.error("❌ Error syncing Clerk user:", error)
    }
    return null
  }

  useEffect(() => {  
  if (clerkLoaded && clerkUser) {
    // Sync Clerk user to database first
    syncClerkUserToDatabase(clerkUser).then((dbUser) => {
      setUser({
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress || "",
        name: clerkUser.fullName || clerkUser.firstName || "",
        isVerified: true,
        isClerkUser: true,
        createdAt: dbUser?.created_at || undefined,
        dbId: dbUser?.id, // Store database ID for reference
      })
      setLoading(false)
    })
  } else if (clerkLoaded && !clerkUser) {
    console.log('🔍 No Clerk user, checking manual auth...')
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
  }
}, [clerkUser, clerkLoaded])

  // ---- MANUAL AUTH FUNCTIONS ----
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

  const loginWithPassword = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Failed to login")
    }
    setUser(data.user)
  }

  // ---- LOGOUT ----
  const logout = async () => {
    if (user?.isClerkUser) {
      await clerkSignOut()
      setUser(null)
      setLoading(false)
    } else {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithPassword,
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
