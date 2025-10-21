"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface AdminUser {
  id: number
  email: string
  name: string
  role: string
  isVerified: boolean
  createdAt: string
}

interface AdminAuthContextType {
  user: AdminUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>
  isAuthenticated: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/admin/auth/me", { 
        credentials: 'include' 
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || "Login failed")
    }

    setUser(data.user)
  }

  const register = async (email: string, password: string, name: string) => {
    const response = await fetch("/api/admin/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
      credentials: 'include'
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || "Registration failed")
    }

    setUser(data.user)
  }

  const logout = async () => {
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
    }
  }

  const sendPasswordReset = async (email: string) => {
    const response = await fetch("/api/admin/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    })

    return await response.json()
  }

  const resetPassword = async (token: string, newPassword: string) => {
    const response = await fetch("/api/admin/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword })
    })

    return await response.json()
  }

  const value: AdminAuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    sendPasswordReset,
    resetPassword,
    isAuthenticated: !!user
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
