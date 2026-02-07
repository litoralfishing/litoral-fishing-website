"use client"

import { useEffect, useState } from "react"
import { MessageCircle } from "lucide-react"
import type { SiteSettings } from "@/lib/types"

export function FloatingWhatsAppButton() {
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: SiteSettings) => {
        if (data.whatsappUrl) {
          setWhatsappUrl(data.whatsappUrl)
        }
      })
      .catch(() => {})
  }, [])

  if (!whatsappUrl) return null

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
      aria-label="Chat con nosotros en WhatsApp"
      title="Chat con nosotros en WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  )
}
