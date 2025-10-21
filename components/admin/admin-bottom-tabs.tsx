"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingBag,
  ListOrdered,
  Users,
  Settings,
  Image as ImageIcon,
  Tag,
  Star,
  BookOpen,
  Calendar,
  Menu,
  MessageCircle,
} from "lucide-react"

const tabs = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ListOrdered },
  { href: "/admin/menu", label: "Products", icon: ShoppingBag },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/slider", label: "Slider", icon: ImageIcon },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/about", label: "About", icon: BookOpen },
//   { href: "/admin/reservations", label: "Reservations", icon: Calendar },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export default function AdminBottomTabs() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[linear-gradient(135deg,_#0a0a0a_0%,_#1a1a2e_50%,_#16213e_100%)] backdrop-blur-xl border-t border-blue-300/20 flex justify-between px-2 py-2 lg:hidden overflow-x-auto shadow-2xl rounded-t-xl">

      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
            <Link
            key={href}
            href={href}
            className={`flex flex-col items-center flex-1 min-w-[70px] px-0 py-0 mx-1 transition-all duration-200
              ${active ? "" : "hover:text-gray-900"}
            `}
          >
            <div
              className={`flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg border-2 transition-all duration-200
                ${active
                  ? "bg-[linear-gradient(135deg,_#0a0a0a_0%,_#1a1a2e_50%,_#16213e_100%)] border-blue-400 shadow-blue-900"
                  : "bg-gradient-to-br from-gray-800/80 via-gray-700/80 to-gray-900/80 border-gray-700/60"}
              `}
              style={{
                boxShadow: active ? "0 2px 16px 0 #1a1a2eaa" : undefined
              }}
            >
              <Icon className={`w-7 h-7 ${active ? "text-blue-100" : "text-gray-300"}`} />
            </div>
            <span
              className="text-xs leading-tight font-medium whitespace-nowrap mt-1 text-center"
              style={{ color: active ? "#cbd5e1" : undefined }}
            >
              {label}
            </span>
          </Link>
          
        )
      })}
    </nav>
  )
} 