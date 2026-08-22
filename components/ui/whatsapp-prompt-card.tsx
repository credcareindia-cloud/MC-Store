"use client"

import { AnimatePresence, motion } from "framer-motion"
import type { WhatsAppSupportPrompt } from "@/lib/whatsapp-support"

interface WhatsAppPromptCardProps {
  prompt: WhatsAppSupportPrompt
  className?: string
  onClick?: () => void
  compact?: boolean
}

export default function WhatsAppPromptCard({
  prompt,
  className = "",
  onClick,
  compact = false,
}: WhatsAppPromptCardProps) {
  const Component = onClick ? "button" : "div"

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`max-w-[240px] rounded-2xl border border-zinc-200/80 bg-white/95 text-left shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl ${compact ? "px-3 py-2" : "px-4 py-3"} ${onClick ? "transition-transform active:scale-[0.98]" : ""} ${className}`}
      aria-label={onClick ? `Chat on WhatsApp: ${prompt.label}` : undefined}
    >
      <p className={`font-semibold uppercase tracking-wide text-zinc-400 ${compact ? "mb-0 text-[9px]" : "mb-0.5 text-[10px]"}`}>
        Need help?
      </p>
      <div className={`relative overflow-hidden ${compact ? "h-8" : "h-10"}`}>
        <AnimatePresence mode="wait">
          <motion.p
            key={prompt.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className={`font-medium leading-snug text-zinc-800 ${compact ? "text-xs" : "text-sm"}`}
          >
            {prompt.label}
          </motion.p>
        </AnimatePresence>
      </div>
    </Component>
  )
}
