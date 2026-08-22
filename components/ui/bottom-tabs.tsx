"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingBag, User, Home, ShoppingCart, LogOut } from "lucide-react"
import { useSelector } from "react-redux"
import { useAuth } from "@/lib/contexts/auth-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import LoginModal from "@/components/auth/login-modal"
import WhatsAppIcon from "@/components/ui/whatsapp-icon"
import WhatsAppPromptCard from "@/components/ui/whatsapp-prompt-card"
import { useWhatsAppSupportPrompt } from "@/lib/hooks/use-whatsapp-support-prompt"
import { openWhatsAppSupport } from "@/lib/whatsapp-support"
import type { RootState } from "@/lib/store"

export default function BottomTabs() {
  const pathname = usePathname()
  const cartItems = useSelector((state: RootState) => state.order.cart)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const { isAuthenticated, user, logout } = useAuth()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const prompt = useWhatsAppSupportPrompt()

  const navItems = [
    { href: "/", icon: Home, label: "Home", isActive: pathname === "/" || pathname === "/home" },
    { href: "/orders", icon: ShoppingBag, label: "Orders", isActive: pathname === "/orders" },
    { type: "whatsapp" as const },
    { href: "/order", icon: ShoppingCart, label: "Cart", isActive: pathname === "/order", badge: cartCount || null },
    { type: "profile" as const },
  ]

  const handleLogout = async () => {
    await logout()
  }

  const tabButtonClass = (active: boolean) =>
    `relative flex min-w-[52px] flex-col items-center rounded-full px-3 py-1.5 transition-all duration-300 ${
      active
        ? "bg-white/75 text-red-600 shadow-[0_2px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]"
        : "text-zinc-600 hover:bg-white/40 hover:text-zinc-900"
    }`

  return (
    <>
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-[100] block px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="pointer-events-auto mx-auto flex max-w-lg flex-col items-center gap-1.5">
          <div className="w-full flex justify-center" aria-live="polite">
            <WhatsAppPromptCard
              prompt={prompt}
              compact
              onClick={() => openWhatsAppSupport(prompt.message)}
            />
          </div>

          <nav
            className="flex w-full items-end justify-between gap-1 rounded-full border border-white/50 bg-white/45 px-3 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-2xl backdrop-saturate-150"
            aria-label="Mobile navigation"
          >
          {navItems.map((item) => {
            if (item.type === "whatsapp") {
              return (
                <button
                  key="whatsapp"
                  type="button"
                  onClick={() => openWhatsAppSupport(prompt.message)}
                  className="relative -mt-5 flex min-w-[52px] flex-col items-center px-2"
                  aria-label={`Chat on WhatsApp: ${prompt.label}`}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_6px_20px_rgba(37,211,102,0.45)] transition-transform active:scale-95">
                    <WhatsAppIcon className="h-6 w-6" />
                  </span>
                  <span className="mt-1 text-[10px] font-semibold text-[#25D366]">Chat</span>
                </button>
              )
            }

            if (item.type === "profile") {
              return (
                <div key="profile" className="flex flex-col items-center">
                  {isAuthenticated ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className={tabButtonClass(pathname === "/dashboard" || pathname === "/profile")}
                          aria-label="Account menu"
                        >
                          <User size={19} strokeWidth={2.25} />
                          <span className="mt-0.5 text-[10px] font-semibold">My</span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="mb-3 w-64 border-0 p-0 shadow-2xl">
                        <div className="rounded-t-lg border-b border-zinc-800 bg-zinc-900 p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-white">{user?.name || "User"}</h3>
                              <p className="text-sm text-white/80">{user?.email || user?.phone || ""}</p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-b-lg bg-white">
                          <div className="p-2">
                            <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-3 transition-colors hover:bg-gray-50">
                              <Link href="/dashboard" className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100">
                                  <User className="h-4 w-4 text-zinc-700" />
                                </div>
                                <span className="font-medium text-gray-700">My Profile</span>
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-3 transition-colors hover:bg-gray-50">
                              <Link href="/orders" className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100">
                                  <ShoppingBag className="h-4 w-4 text-zinc-700" />
                                </div>
                                <span className="font-medium text-gray-700">My Orders</span>
                              </Link>
                            </DropdownMenuItem>
                          </div>

                          <div className="border-t border-gray-100 p-2">
                            <DropdownMenuItem
                              onClick={handleLogout}
                              className="cursor-pointer rounded-lg p-3 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                                  <LogOut className="h-4 w-4 text-red-600" />
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
                      onClick={() => setIsLoginModalOpen(true)}
                      className={tabButtonClass(false)}
                      aria-label="Login"
                    >
                      <User size={19} strokeWidth={2.25} />
                      <span className="mt-0.5 text-[10px] font-semibold">Login</span>
                    </button>
                  )}
                </div>
              )
            }

            if (!item.href || !item.icon) return null
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className={tabButtonClass(!!item.isActive)}>
                <div className="relative">
                  <Icon size={19} strokeWidth={item.isActive ? 2.5 : 2.25} />
                  {item.badge ? (
                    <div className="absolute -right-2.5 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border border-white/80 bg-red-500 px-1 text-[9px] font-bold text-white">
                      {item.badge > 99 ? "99+" : item.badge}
                    </div>
                  ) : null}
                </div>
                <span className="mt-0.5 text-[10px] font-semibold">{item.label}</span>
              </Link>
            )
          })}
          </nav>
        </div>
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  )
}
