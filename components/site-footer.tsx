"use client"

import { useEffect, useState } from "react"
import { Instagram, Facebook, MessageCircle } from "lucide-react"
import type { SiteSettings } from "@/lib/types"

export function SiteFooter() {
  const [settings, setSettings] = useState<SiteSettings>({})
  const s = settings as any

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {})
  }, [])

  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl || "/placeholder.svg"}
                alt="Litoral Fishing"
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
                <span className="font-heading text-sm font-bold text-primary-foreground">
                  LF
                </span>
              </div>
            )}
            <div>
              <span className="font-heading text-sm font-bold uppercase tracking-tight text-foreground">
                Litoral Fishing
              </span>
              <div className="text-xs text-muted-foreground">Caza • Pesca • Camping • Outdoor</div>
            </div>
          </div>

          <div className="flex flex-col items-center text-center text-sm text-muted-foreground lg:items-start lg:text-left">
            <div className="mb-3 font-medium text-foreground">Contacto y Ubicación</div>
            <div className="mb-2">
              {s.address || "Dirección: Calle Falsa 123, Santa Fe"}
            </div>
            <div className="flex items-center gap-3">
              <div className="h-24 w-40 rounded-md bg-gray-100 dark:bg-muted/40 flex items-center justify-center text-xs text-muted-foreground">
                Mini mapa (placeholder)
              </div>
              <div className="text-xs text-muted-foreground">
                {s.location || "Ubicación: Santa Fe, Argentina"}
                <br />
                {s.phone || "Tel: +54 9 1234 5678"}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 lg:items-end">
            <div className="flex gap-3">
              <a href={s.instagramUrl || "#"} aria-label="Instagram" className="rounded-md p-2 hover:bg-muted" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-5 w-5" />
              </a>
              <a href={s.facebookUrl || "#"} aria-label="Facebook" className="rounded-md p-2 hover:bg-muted" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-5 w-5" />
              </a>
              <a href={s.whatsappUrl || "#"} aria-label="WhatsApp" className="rounded-md p-2 hover:bg-muted" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>

            <div className="text-xs text-muted-foreground text-center lg:text-right">
              Caza, Pesca, Camping y Outdoor · Showroom Mayorista
              <br />
              {"Todos los derechos reservados - Desarrollado por Emanuel Gigena"}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
