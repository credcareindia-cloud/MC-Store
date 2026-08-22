"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect, useRef, type ReactNode } from "react"
import {
  ShoppingCart,
  Heart,
  User,
  ShoppingBag,
  Menu,
  X,
  LogOut,
} from "lucide-react"
import { useSelector } from "react-redux"
import { useAuth } from "@/lib/contexts/auth-context"
import { useLoginModal } from "@/lib/stores/useLoginModal"
import type { RootState } from "@/lib/store"
import MotoCartLogo from "@/components/ui/logo"
import LoginModal from "@/components/auth/login-modal"
import EnhancedSearch from "@/components/ui/enhanced-search"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
]

function NavLink({
  href,
  children,
  active,
  onClick,
  className = "",
}: {
  href: string
  children: ReactNode
  active: boolean
  onClick?: () => void
  className?: string
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`whitespace-nowrap text-sm font-bold transition-colors ${
        active ? "text-red-500" : "text-white hover:text-red-400"
      } ${className}`}
    >
      {children}
    </Link>
  )
}

function IconButton({
  href,
  onClick,
  label,
  children,
  badge,
}: {
  href?: string
  onClick?: () => void
  label: string
  children: ReactNode
  badge?: number
}) {
  const className =
    "relative rounded-full p-2.5 text-white transition-colors hover:bg-white/10"

  const content = (
    <>
      {children}
      {badge != null && badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border border-zinc-300 bg-white px-1 text-[10px] font-bold text-zinc-900">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={className} aria-label={label}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className} aria-label={label}>
      {content}
    </button>
  )
}

export default function LandingNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const headerRef = useRef<HTMLElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const cartItems = useSelector((state: RootState) => state.order.cart)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items)
  const wishlistCount = wishlistItems.length
  const { isAuthenticated, user, logout } = useAuth()
  const { isOpen: isLoginModalOpen, openModal, closeModal } = useLoginModal()

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (!headerRef.current) return
      const height = headerRef.current.offsetHeight
      document.documentElement.style.setProperty("--landing-header-height", `${height}px`)
    }

    updateHeaderHeight()
    window.addEventListener("resize", updateHeaderHeight)

    const observer = new ResizeObserver(updateHeaderHeight)
    if (headerRef.current) observer.observe(headerRef.current)

    return () => {
      window.removeEventListener("resize", updateHeaderHeight)
      observer.disconnect()
    }
  }, [mobileOpen])

  const handleLogout = async () => {
    await logout()
    setMobileOpen(false)
  }

  const actionIcons = (
    <>
      <IconButton href="/orders" label="Orders">
        <ShoppingBag className="h-5 w-5" />
      </IconButton>
      <IconButton href="/wishlist" label="Wishlist" badge={wishlistCount}>
        <Heart className={`h-5 w-5 ${wishlistCount > 0 ? "fill-red-500 text-red-500" : ""}`} />
      </IconButton>
      <IconButton href="/order" label="Cart" badge={cartCount}>
        <ShoppingCart className="h-5 w-5" />
      </IconButton>
      {isAuthenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="rounded-full p-2.5 text-white hover:bg-white/10"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="border-b px-3 py-2">
              <p className="text-sm font-semibold text-zinc-900">{user?.name || "Account"}</p>
              <p className="truncate text-xs text-zinc-500">{user?.email || user?.phone}</p>
            </div>
            <DropdownMenuItem asChild>
              <Link href="/dashboard">My Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/orders">My Orders</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <IconButton onClick={openModal} label="Sign in">
          <User className="h-5 w-5" />
        </IconButton>
      )}
    </>
  )

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-50 border-b-2 border-red-600 bg-zinc-950 shadow-lg shadow-black/30"
      >
        {/* Desktop */}
        <div className="mx-auto hidden max-w-7xl px-6 py-4 lg:block">
          <div className="flex items-center gap-6">
            <Link href="/" className="shrink-0" aria-label="MotoCart">
              <MotoCartLogo className="h-10 w-auto" />
            </Link>

            <nav className="flex items-center gap-8">
              {navLinks.map((link) => (
                <NavLink key={link.href} href={link.href} active={isActive(link.href)}>
                  {link.name}
                </NavLink>
              ))}
            </nav>

            <div className="ml-auto min-w-0 flex-1 max-w-md xl:max-w-xl">
              <EnhancedSearch className="w-full" />
            </div>

            <div className="flex shrink-0 items-center gap-1">{actionIcons}</div>
          </div>
        </div>

        {/* Tablet */}
        <div className="mx-auto hidden max-w-7xl px-4 py-3 md:block lg:hidden">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Link href="/" className="shrink-0" aria-label="MotoCart">
              <MotoCartLogo className="h-9 w-auto" />
            </Link>
            <div className="flex items-center gap-1">{actionIcons}</div>
          </div>

          <div className="mb-3">
            <EnhancedSearch className="w-full" />
          </div>

          <nav className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                  isActive(link.href)
                    ? "bg-red-600 text-white"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile */}
        <div className="px-4 py-3 md:hidden">
          <div className="mb-3 grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="rounded-full p-2 text-white hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <Link href="/" className="flex justify-center" aria-label="MotoCart">
              <MotoCartLogo className="h-8 w-auto" />
            </Link>

            <div className="flex items-center justify-end gap-0.5">
              <IconButton href="/wishlist" label="Wishlist" badge={wishlistCount}>
                <Heart className={`h-5 w-5 ${wishlistCount > 0 ? "fill-red-500 text-red-500" : ""}`} />
              </IconButton>
              <IconButton href="/order" label="Cart" badge={cartCount}>
                <ShoppingCart className="h-5 w-5" />
              </IconButton>
            </div>
          </div>

          <EnhancedSearch
            className="w-full"
            onSearchSubmit={(query) => {
              router.push(`/products?search=${encodeURIComponent(query)}`)
              setMobileOpen(false)
            }}
          />

          {mobileOpen && (
            <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/95 p-3">
              <nav className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-lg px-3 py-2.5 text-center text-sm font-semibold ${
                      isActive(link.href)
                        ? "bg-red-600 text-white"
                        : "bg-zinc-800 text-zinc-200"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-zinc-800 pt-3">
                <Link
                  href="/orders"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2.5 text-sm font-medium text-white"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Orders
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2.5 text-sm font-medium text-white"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="col-span-2 flex items-center justify-center gap-2 rounded-lg bg-red-600/20 px-3 py-2.5 text-sm font-medium text-red-400"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      openModal()
                      setMobileOpen(false)
                    }}
                    className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2.5 text-sm font-semibold text-white"
                  >
                    <User className="h-4 w-4" />
                    Sign In
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <LoginModal isOpen={isLoginModalOpen} onClose={closeModal} />
    </>
  )
}
