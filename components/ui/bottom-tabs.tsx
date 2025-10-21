"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingBag, User, Sparkles, Watch, QrCode, Home, ShoppingCart, LogOut, Bell } from "lucide-react"
import { useSelector } from "react-redux"
import { useAuth } from "@/lib/contexts/auth-context"
import { useShop } from "@/lib/contexts/shop-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useUser } from "@clerk/nextjs"
import LoginModal from "@/components/auth/login-modal"
import type { RootState } from "@/lib/store"

export default function BottomTabs() {
  const pathname = usePathname()
  const cartItems = useSelector((state: RootState) => state.order.cart)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const { isAuthenticated, user, logout } = useAuth()
  const { shop, setShop, isShopSwitchEnabled } = useShop()
  const { user: clerkUser } = useUser()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const shopType = shop === "A" ? "cosmetics" : "accessories"

  const navItems = [
    { href: "/products", icon: Home, label: "Home", isActive: pathname === "/" },
    { href: "/orders", icon: ShoppingBag, label: "Orders", isActive: pathname === "/orders" },
    // Only include shop toggle if enabled in admin settings
    ...(isShopSwitchEnabled ? [{ type: "toggle" }] : []),
    { href: "/order", icon: ShoppingCart, label: "Cart", isActive: pathname === "/order", badge: cartCount || null },
    { type: "profile" }, 
  ]

  const handleShopToggle = (type: "cosmetics" | "accessories") => {
    setShop(type === "cosmetics" ? "A" : "B")
  }

  const handleLogout = async () => {
    await logout()
  }

  const handleLoginClick = () => {
    setIsLoginModalOpen(true)
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 md:block lg:hidden">
        <div className={`relative rounded-t-2xl backdrop-blur-xl border-t shadow-lg transition-all duration-300 ${
          shop === "A" 
            ? "bg-gradient-to-r from-yellow-400/60 via-orange-400/60 to-yellow-500/60 border-yellow-300/30" 
            : "bg-gradient-to-r from-purple-600/60 via-blue-600/60 to-indigo-700/60 border-purple-300/30"
        }`}>
          <div className={`absolute inset-0 pointer-events-none transition-all duration-300 ${
            shop === "A"
              ? "bg-gradient-to-r from-[#f6d365]/20 to-[#fda085]/20"
              : "bg-gradient-to-r from-purple-500/20 to-indigo-500/20"
          }`} />

          <div className="relative flex items-center justify-between px-5 py-3">
            {navItems.map((item, index) => {
              // Toggle switch
              if (item.type === "toggle") {
                return (
                  <div key="toggle" className="flex flex-col items-center">
                    <div className="relative bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-orange-900/30 backdrop-blur-md rounded-full p-1 border border-white/20 transition-all duration-500 shadow-2xl hover:shadow-purple-500/25">
                      {/* Animated Background Glow */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 blur-lg animate-pulse"></div>
                      
                      {/* Active Slider with Enhanced Glow */}
                      <div
                        className={`absolute top-1 rounded-full transition-all duration-500 ease-out shadow-xl ${
                          shopType === "cosmetics" 
                            ? "bg-gradient-to-r from-orange-400 to-pink-500 shadow-orange-500/50" 
                            : "bg-gradient-to-r from-purple-500 to-indigo-600 shadow-purple-500/50"
                        }`}
                        style={{
                          width: "calc(50% - 4px)",
                          height: "calc(100% - 8px)",
                          left: shopType === "cosmetics" ? "4px" : "calc(50% + 0px)",
                          boxShadow: shopType === "cosmetics" 
                            ? "0 0 15px rgba(251, 146, 60, 0.6), 0 0 30px rgba(251, 146, 60, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)" 
                            : "0 0 15px rgba(147, 51, 234, 0.6), 0 0 30px rgba(147, 51, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
                        }}
                      />
                      
                      <div className="relative flex">
                        <button
                          onClick={() => handleShopToggle("cosmetics")}
                          className={`group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 relative z-10 transform hover:scale-110 ${
                            shopType === "cosmetics" 
                              ? "text-white drop-shadow-lg" 
                              : "text-white/70 hover:text-white hover:drop-shadow-lg"
                          }`}
                        >
                          <Sparkles className={`w-4 h-4 transition-all duration-300 ${
                            shopType === "cosmetics" 
                              ? "drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] animate-pulse" 
                              : "group-hover:drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]"
                          }`} />
                          {shopType === "cosmetics" && (
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400/20 to-pink-500/20 animate-ping"></div>
                          )}
                        </button>
                        <button
                          onClick={() => handleShopToggle("accessories")}
                          className={`group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 relative z-10 transform hover:scale-110 ${
                            shopType === "accessories" 
                              ? "text-white drop-shadow-lg" 
                              : "text-white/70 hover:text-white hover:drop-shadow-lg"
                          }`}
                        >
                          <Watch className={`w-4 h-4 transition-all duration-300 ${
                            shopType === "accessories" 
                              ? "drop-shadow-[0_0_6px_rgba(255,255,255,0.8)] animate-pulse" 
                              : "group-hover:drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]"
                          }`} />
                          {shopType === "accessories" && (
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-600/20 animate-ping"></div>
                          )}
                        </button>
                      </div>
                      
                      {/* Floating Particles Effect */}
                      <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                        <div className={`absolute w-0.5 h-0.5 bg-white rounded-full animate-bounce ${shopType === "cosmetics" ? "left-3 top-1.5" : "right-3 top-1.5"}`} style={{animationDelay: "0s"}}></div>
                        <div className={`absolute w-0.5 h-0.5 bg-white/60 rounded-full animate-bounce ${shopType === "cosmetics" ? "left-4 bottom-2" : "right-4 bottom-2"}`} style={{animationDelay: "0.5s"}}></div>
                        <div className={`absolute w-0.5 h-0.5 bg-white/40 rounded-full animate-bounce ${shopType === "cosmetics" ? "left-5 top-2.5" : "right-5 top-2.5"}`} style={{animationDelay: "1s"}}></div>
                      </div>
                    </div>
                    <span className={`mt-1 text-xs font-medium transition-colors duration-300 ${
                      shop === "A" ? "text-orange-700" : "text-purple-200"
                    }`}>
                      {shopType === "cosmetics" ? "Beauty" : "Style"}
                    </span>
                  </div>
                )
              }

              // Profile dropdown
              if (item.type === "profile") {
                return (
                  <div key="profile" className="flex flex-col items-center">
                    {isAuthenticated ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className={`relative transition-all duration-300 ${
                            pathname === "/profile"
                              ? shop === "A" 
                                ? "text-orange-600" 
                                : "text-purple-200"
                              : shop === "A"
                              ? "text-gray-600 hover:text-gray-800"
                              : "text-gray-300 hover:text-white"
                          }`}>
                            <div className="relative mb-0.5">
                              {user?.isClerkUser && clerkUser?.imageUrl ? (
                                <Image
                                  src={clerkUser.imageUrl}
                                  alt="Profile"
                                  width={20}
                                  height={20}
                                  className="rounded-full"
                                />
                              ) : (
                                <User size={20} />
                              )}
                            </div>
                            <span className="text-xs">My</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 p-0 border-0 shadow-2xl mb-4">
                          <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-yellow-500 rounded-t-lg p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                {user?.isClerkUser && clerkUser?.imageUrl ? (
                                  <Image
                                    src={clerkUser.imageUrl}
                                    alt="Profile"
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                  />
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
                                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <User className="w-4 h-4 text-orange-600" />
                                  </div>
                                  <span className="font-medium text-gray-700">My Profile</span>
                                </Link>
                              </DropdownMenuItem>

                              <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                <Link href="/orders" className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <ShoppingBag className="w-4 h-4 text-orange-600" />
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
                        className={`relative transition-all duration-300 ${
                          shop === "A"
                            ? "text-gray-600 hover:text-gray-800"
                            : "text-gray-300 hover:text-white"
                        }`}
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

              // Regular nav items
              if (!item.href || !item.icon) return null
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex flex-col items-center transition-all duration-300 ${
                    item.isActive 
                      ? shop === "A" 
                        ? "text-orange-600" 
                        : "text-purple-200"
                      : shop === "A"
                      ? "text-gray-600 hover:text-gray-800"
                      : "text-gray-300 hover:text-white"
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
