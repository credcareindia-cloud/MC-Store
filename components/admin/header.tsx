"use client"

import { User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAdminAuth } from "@/lib/contexts/admin-auth-context"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function AdminHeader() {
  const { user, logout } = useAdminAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Logged out successfully", { position: 'top-center' })
      router.push("/admin/login")
    } catch (error) {
      toast.error("Failed to logout", { position: 'top-center' })
    }
  }
  return (
    <header className="bg-gray-900/50 backdrop-blur-md border-b border-cyan-500/20 px-6 py-4">
      <div className="flex items-center justify-between">
<h1 className="text-2xl font-bold text-white"></h1>
        <div className="flex items-center space-x-4">
          {/* PRO Badge */}
          <h1 className="text-2xl font-bold text-white">OpenCoders</h1>
          <div className="px-4 py-1 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-gray-900 font-semibold text-sm shadow-lg border border-yellow-300 relative overflow-hidden">
            
            <span className="relative z-10">PRO</span>
            {/* shiny highlight effect */}
            <div className="absolute inset-0 rounded-full bg-white/20 blur-sm animate-pulse" />
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-gray-800/50"
              >
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-gray-800 border-gray-700"
            >
              <div className="px-3 py-2 text-sm text-gray-300">
                <div className="font-medium">{user?.name || 'Admin'}</div>
                <div className="text-xs text-gray-400">{user?.email}</div>
              </div>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem 
                className="text-red-400 hover:text-red-300 hover:bg-gray-700 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
