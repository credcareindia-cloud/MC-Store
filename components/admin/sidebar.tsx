"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingBag,
  Calendar,
  Settings,
  Menu,
  Tags,
  ImageIcon,
  MessageSquare,
  Star,
  Info,
  BadgePercent,
  Users,
  Shield
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/menu", icon: Menu },
  { name: "Categories", href: "/admin/categories", icon: Tags },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  // { name: "Testimonials", href: "/admin/testimonials", icon: Star },
  // { name: "About Section", href: "/admin/about", icon: Info },
  // { name: "Hero Slider", href: "/admin/slider", icon: ImageIcon },
  // { name: "Banners", href: "/admin/banners", icon: MessageSquare },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Admin Users", href: "/admin/users", icon: Shield },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Spinner-Offers", href: "/admin/offer", icon:BadgePercent}
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col bg-[linear-gradient(135deg,_#0a0a0a_0%,_#1a1a2e_50%,_#16213e_100%)] shadow-xl">
      <div className="flex h-16 shrink-0 items-center px-4 border-b border-blue-900/30">
        <h1 className="text-xl font-bold text-blue-100">Admin Panel</h1>
      </div>
      <nav className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-semibold leading-6 transition-colors duration-200
                    ${
                      isActive
                        ? "bg-[linear-gradient(135deg,_#0a0a0a_0%,_#1a1a2e_50%,_#16213e_100%)] text-blue-100 shadow-lg border border-blue-500/20"
                        : "text-blue-300 hover:text-white hover:bg-blue-900/40"
                    }
                  `}
                >
                  <item.icon
                    className={`h-5 w-5 shrink-0 transition-all duration-200 ${
                      isActive ? "text-blue-200" : "text-blue-400 group-hover:text-white"
                    }`}
                  />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
