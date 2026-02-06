"use client"

import React from "react"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Search, SlidersHorizontal, X, Crosshair, Fish, Tent, Mountain } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProductCard } from "@/components/product-card"
import { ProductDetail } from "@/components/product-detail"
import { ProductGridSkeleton } from "@/components/product-skeleton"
import { ErrorState } from "@/components/error-state"
import { useProducts } from "@/lib/hooks"
import { CATEGORIES, type Product, type Category } from "@/lib/types"

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  Pesca: <Fish className="h-3.5 w-3.5" />,
  Caza: <Crosshair className="h-3.5 w-3.5" />,
  Camping: <Tent className="h-3.5 w-3.5" />,
  Outdoor: <Mountain className="h-3.5 w-3.5" />,
}

export function Catalog() {
  const { products, isLoading, isError, mutate } = useProducts()
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showPriceOnly, setShowPriceOnly] = useState(false)
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all")
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  const [seeded, setSeeded] = useState(false)

  // Auto-seed on first load if no products
  useEffect(() => {
    if (!isLoading && products.length === 0 && !seeded) {
      setSeeded(true)
      fetch("/api/seed", { method: "POST" })
        .then((r) => r.json())
        .then((data) => {
          if (data.seeded) mutate()
        })
        .catch(() => {})
    }
  }, [isLoading, products.length, seeded, mutate])

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value)
      if (debounceTimer) clearTimeout(debounceTimer)
      const timer = setTimeout(() => {
        setDebouncedSearch(value)
      }, 250)
      setDebounceTimer(timer)
    },
    [debounceTimer]
  )

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      const matchesPrice = showPriceOnly ? p.price !== undefined && p.price > 0 : true
      const matchesCategory = activeCategory === "all" || p.category === activeCategory
      return matchesSearch && matchesPrice && matchesCategory
    })
  }, [products, debouncedSearch, showPriceOnly, activeCategory])

  // Count per category for badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length }
    for (const cat of CATEGORIES) {
      counts[cat] = products.filter((p) => p.category === cat).length
    }
    return counts
  }, [products])

  const hasActiveFilters = debouncedSearch || showPriceOnly || activeCategory !== "all"

  const clearFilters = () => {
    setSearch("")
    setDebouncedSearch("")
    setShowPriceOnly(false)
    setActiveCategory("all")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Hero section */}
      <section className="relative overflow-hidden rounded-xl bg-secondary px-6 py-10 text-center lg:py-14">
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Showroom Mayorista
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold text-secondary-foreground lg:text-5xl text-balance">
            Caza &middot; Pesca &middot; Camping &middot; Outdoor
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-secondary-foreground/70 lg:text-base">
            Productos de las mejores marcas al por mayor. Santa Fe Capital, Argentina.
          </p>
        </div>
        <div
          className="absolute inset-0 opacity-[0.06]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
      </section>

      {/* Category filter chips */}
      <div className="flex flex-col gap-4">
        {/* Desktop: horizontal chip bar */}
        <div className="hidden gap-2 sm:flex sm:flex-wrap">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("all")}
            className={`gap-1.5 ${activeCategory !== "all" ? "bg-transparent" : ""}`}
          >
            Todos
            <Badge variant="secondary" className="ml-0.5 h-5 min-w-5 rounded-full px-1.5 text-[10px] font-bold">
              {categoryCounts.all}
            </Badge>
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(activeCategory === cat ? "all" : cat)}
              className={`gap-1.5 ${activeCategory !== cat ? "bg-transparent" : ""}`}
            >
              {CATEGORY_ICONS[cat]}
              {cat}
              {categoryCounts[cat] > 0 && (
                <Badge variant="secondary" className="ml-0.5 h-5 min-w-5 rounded-full px-1.5 text-[10px] font-bold">
                  {categoryCounts[cat]}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Mobile: dropdown */}
        <div className="sm:hidden">
          <Select
            value={activeCategory}
            onValueChange={(v) => setActiveCategory(v as Category | "all")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorias ({categoryCounts.all})</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat} ({categoryCounts[cat]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search and price filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, codigo o descripcion..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-9"
              aria-label="Buscar productos"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(""); setDebouncedSearch("") }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Limpiar busqueda</span>
              </button>
            )}
          </div>
          <Button
            variant={showPriceOnly ? "default" : "outline"}
            onClick={() => setShowPriceOnly(!showPriceOnly)}
            className={`gap-2 shrink-0 ${!showPriceOnly ? "bg-transparent" : ""}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Con precio
          </Button>
        </div>
      </div>

      {/* Results bar */}
      {!isLoading && !isError && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>
            {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
          </span>
          {activeCategory !== "all" && (
            <Badge variant="outline" className="gap-1">
              {CATEGORY_ICONS[activeCategory]}
              {activeCategory}
              <button type="button" onClick={() => setActiveCategory("all")} className="ml-0.5 rounded-full hover:bg-muted">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {debouncedSearch && (
            <span>
              para &ldquo;<span className="font-medium text-foreground">{debouncedSearch}</span>&rdquo;
            </span>
          )}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto text-xs font-medium text-primary hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Content states */}
      {isError ? (
        <ErrorState
          title="Error al cargar productos"
          message="No pudimos conectar con el servidor. Verifica tu conexion e intenta de nuevo."
          onRetry={() => mutate()}
        />
      ) : isLoading ? (
        <ProductGridSkeleton count={8} />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg font-medium text-muted-foreground">
            No se encontraron productos
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Intenta con otra busqueda o categoria
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              className="mt-4 bg-transparent"
              onClick={clearFilters}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onViewDetail={setSelectedProduct}
            />
          ))}
        </div>
      )}

      {/* Product detail dialog */}
      <ProductDetail
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  )
}
