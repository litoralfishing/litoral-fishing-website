"use client"

import { useEffect, useState } from "react"
import type { SiteSettings } from "@/lib/types"

export function SiteFooter() {
  const [settings, setSettings] = useState<SiteSettings>({})

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {})
  }, [])

  return (
    <footer className="border-t bg-card">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 lg:flex-row lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl || "/placeholder.svg"}
              alt="Litoral Fishing"
              className="h-8 w-auto object-contain"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <span className="font-heading text-sm font-bold text-primary-foreground">
                LF
              </span>
            </div>
          )}
          <span className="font-heading text-sm font-bold uppercase tracking-tight text-foreground">
            Litoral Fishing
          </span>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Caza, Pesca, Camping y Outdoor &middot; Showroom Mayorista &middot; Santa Fe Capital, Argentina
        </p>
        <p className="text-xs text-muted-foreground">
          {"Todos los derechos reservados - Desarrollado por Emanuel Gigena"}
        </p>
      </div>
    </footer>
  )
}
