"use client"

import Link from "next/link"
import { ShoppingCart, Menu, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { getCart } from "@/lib/cart"
import { useSettings } from "@/lib/hooks"

export function SiteHeader() {
  const { theme, setTheme } = useTheme()
  const [cartCount, setCartCount] = useState(0)
  const { settings } = useSettings()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const updateCart = () => {
      const items = getCart()
      setCartCount(items.reduce((sum, i) => sum + i.quantity, 0))
    }
    updateCart()
    window.addEventListener("cart-updated", updateCart)
    return () => window.removeEventListener("cart-updated", updateCart)
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto relative flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Logo + Brand */}
        <Link href="/" className="flex items-center gap-3">
          {settings.logoUrl ? (
            <div className="flex items-center justify-center">
              <img
                src={settings.logoUrl || "/placeholder.svg"}
                alt="Litoral Fishing"
                className="h-28 w-28 object-contain"
                loading="eager"
                decoding="async"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="font-heading text-lg font-bold text-primary-foreground">
                  LF
                </span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-heading text-lg font-bold uppercase leading-tight tracking-tight text-foreground">
                  Litoral Fishing
                </h1>
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Caza &middot; Pesca &middot; Camping &middot; Outdoor
                </p>
              </div>
            </div>
          )}
        </Link>

        {/* Centered title */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary text-center">
            Showroom Mayorista
          </p>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Navegacion principal">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Catalogo
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ShoppingCart className="h-5 w-5" />
            Pedido
            {cartCount > 0 && (
              <Badge className="absolute -right-4 -top-2 h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs">
                {cartCount}
              </Badge>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Cambiar tema"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </nav>

        {/* Mobile nav */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Ver pedido">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {cartCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs">
                {cartCount}
              </Badge>
            )}
          </Link>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="font-heading uppercase tracking-tight">Litoral Fishing</SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-4" aria-label="Menu movil">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-medium text-foreground"
                >
                  Catalogo
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-medium text-foreground"
                >
                  Pedido ({cartCount})
                </Link>
                <Button
                  variant="outline"
                  className="mt-4 w-fit bg-transparent"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}
                  {theme === "dark" ? "Modo claro" : "Modo oscuro"}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
