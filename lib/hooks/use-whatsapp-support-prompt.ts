"use client"

import { useEffect, useState } from "react"
import { WHATSAPP_PROMPT_ROTATE_MS, WHATSAPP_SUPPORT_PROMPTS } from "@/lib/whatsapp-support"

export function useWhatsAppSupportPrompt(rotateMs = WHATSAPP_PROMPT_ROTATE_MS) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % WHATSAPP_SUPPORT_PROMPTS.length)
    }, rotateMs)

    return () => window.clearInterval(timer)
  }, [rotateMs])

  return WHATSAPP_SUPPORT_PROMPTS[index]
}
