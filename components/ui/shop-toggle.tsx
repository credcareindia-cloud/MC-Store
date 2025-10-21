"use client"
import { useShop } from "@/lib/contexts/shop-context"

export default function ShopToggle() {
  const { shop, setShop } = useShop()
  return (
    <div className="fixed top-3 right-4 z-50 flex gap-2 items-center bg-black/60 rounded-full px-2 py-1 shadow-lg backdrop-blur-md border border-yellow-400/30 border-gray-400/30">
      <button
        className={`flex items-center px-3 py-1 rounded-full font-semibold text-sm transition-all duration-200 border-2 focus:outline-none ${
          shop === "A"
            ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black border-yellow-400 shadow-gold"
            : "bg-transparent text-yellow-300 border-transparent hover:bg-yellow-500/20"
        }`}
        onClick={() => setShop("A")}
        aria-label="Switch to Shop A"
      >
        <span className="mr-1">A</span>
        <span className="hidden sm:inline">Shop</span>
      </button>
      <button
        className={`flex items-center px-3 py-1 rounded-full font-semibold text-sm transition-all duration-200 border-2 focus:outline-none ${
          shop === "B"
            ? "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 text-black border-gray-400 shadow-silver"
            : "bg-transparent text-gray-300 border-transparent hover:bg-gray-400/20"
        }`}
        onClick={() => setShop("B")}
        aria-label="Switch to Shop B"
      >
        <span className="mr-1">B</span>
        <span className="hidden sm:inline">Shop</span>
      </button>
    </div>
  )
} 