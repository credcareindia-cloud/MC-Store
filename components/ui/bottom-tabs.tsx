"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingBag, User, Home, ShoppingCart, LogOut } from "lucide-react"
import { useSelector } from "react-redux"
import { useAuth } from "@/lib/contexts/auth-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@clerk/nextjs"
import LoginModal from "@/components/auth/login-modal"
import type { RootState } from "@/lib/store"

export default function BottomTabs() {
  const pathname = usePathname()
  const cartItems = useSelector((state: RootState) => state.order.cart)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const { isAuthenticated, user, logout } = useAuth()
  const { user: clerkUser } = useUser()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const navItems = [
    { href: "/products", icon: Home, label: "Home", isActive: pathname === "/" },
    { href: "/orders", icon: ShoppingBag, label: "Orders", isActive: pathname === "/orders" },
    { href: "/order", icon: ShoppingCart, label: "Cart", isActive: pathname === "/order", badge: cartCount || null },
    { type: "profile" as const },
  ]

  const handleLogout = async () => {
    await logout()
  }

  const handleLoginClick = () => {
    setIsLoginModalOpen(true)
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 md:block lg:hidden">
        <div className="relative rounded-t-xl border-t border-zinc-200 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.06)] transition-all duration-300">

          <div className="relative flex items-center justify-between px-5 py-3">
            {navItems.map((item) => {
              if (item.type === "profile") {
                return (
                  <div key="profile" className="flex flex-col items-center">
                    {isAuthenticated ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={`relative transition-all duration-300 ${
                              pathname === "/profile" ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-900"
                            }`}
                          >
                            <div className="relative mb-0.5">
                              {user?.isClerkUser ? (
                                <Avatar className="h-5 w-5">
                                  {clerkUser?.imageUrl ? <AvatarImage src={clerkUser.imageUrl} alt="Profile" /> : null}
                                  <AvatarFallback className="bg-zinc-200 text-zinc-700">
                                    <User className="w-3.5 h-3.5" />
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <User size={20} />
                              )}
                            </div>
                            <span className="text-xs">My</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 p-0 border-0 shadow-2xl mb-4">
                          <div className="bg-zinc-900 rounded-t-lg p-4 border-b border-zinc-800">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                                {user?.isClerkUser ? (
                                  <Avatar className="h-10 w-10">
                                    {clerkUser?.imageUrl ? <AvatarImage src={clerkUser.imageUrl} alt="Profile" /> : null}
                                    <AvatarFallback className="bg-zinc-700 text-white">
                                      <User className="w-5 h-5" />
                                    </AvatarFallback>
                                  </Avatar>
                                ) : (
                                  <User className="w-5 h-5 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-white font-semibold">{user?.name || "User"}</h3>
                                <p className="text-white/80 text-sm">{user?.email}</p>
                                {user?.isClerkUser && (
                                  <p className="text-white/60 text-xs">Google Account</p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="bg-white rounded-b-lg">
                            <div className="p-2">
                              <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                <Link href="/dashboard" className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
                                    <User className="w-4 h-4 text-zinc-700" />
                                  </div>
                                  <span className="font-medium text-gray-700">My Profile</span>
                                </Link>
                              </DropdownMenuItem>

                              <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                <Link href="/orders" className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
                                    <ShoppingBag className="w-4 h-4 text-zinc-700" />
                                  </div>
                                  <span className="font-medium text-gray-700">My Orders</span>
                                </Link>
                              </DropdownMenuItem>
                            </div>

                            <div className="border-t border-gray-100 p-2">
                              <DropdownMenuItem
                                onClick={handleLogout}
                                className="cursor-pointer rounded-lg p-3 hover:bg-red-50 transition-colors text-red-600 hover:text-red-700"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                    <LogOut className="w-4 h-4 text-red-600" />
                                  </div>
                                  <span className="font-medium">Logout</span>
                                </div>
                              </DropdownMenuItem>
                            </div>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <button
                        onClick={handleLoginClick}
                        className="relative transition-all duration-300 text-zinc-500 hover:text-zinc-900"
                      >
                        <div className="relative mb-0.5">
                          <User size={20} />
                        </div>
                        <span className="text-xs">Login</span>
                      </button>
                    )}
                  </div>
                )
              }

              if (!item.href || !item.icon) return null
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex flex-col items-center transition-all duration-300 ${
                    item.isActive ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  <div className="relative mb-0.5">
                    <Icon size={20} />
                    {item.badge && (
                      <div className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold border border-white">
                        {item.badge > 99 ? "99+" : item.badge}
                      </div>
                    )}
                  </div>
                  <span className="text-xs">{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  )
}
