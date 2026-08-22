"use client"

import WhatsAppIcon from "@/components/ui/whatsapp-icon"
import WhatsAppPromptCard from "@/components/ui/whatsapp-prompt-card"
import { useWhatsAppSupportPrompt } from "@/lib/hooks/use-whatsapp-support-prompt"
import { openWhatsAppSupport } from "@/lib/whatsapp-support"

export default function WhatsAppFab() {
  const prompt = useWhatsAppSupportPrompt()

  return (
    <div
      className="pointer-events-none fixed bottom-6 right-6 z-[90] hidden items-center gap-3 lg:flex"
      aria-live="polite"
    >
      <WhatsAppPromptCard
        prompt={prompt}
        className="pointer-events-auto"
        onClick={() => openWhatsAppSupport(prompt.message)}
      />

      <button
        type="button"
        onClick={() => openWhatsAppSupport(prompt.message)}
        className="pointer-events-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.45)] transition-transform hover:scale-105 hover:bg-[#20bd5a] active:scale-95"
        aria-label={`Chat on WhatsApp: ${prompt.label}`}
      >
        <WhatsAppIcon className="h-7 w-7" />
      </button>
    </div>
  )
}
