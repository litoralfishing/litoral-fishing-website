"use client"

import React from "react"

import { useEffect, useState, useCallback, useMemo } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  LogOut,
  Upload,
  Loader2,
  ImageOff,
  Settings,
  Package,
  Search,
  X,
  Check,
  BarChart3,
  ChevronDown,
  ImagePlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import type { Product, SiteSettings, Category } from "@/lib/types"
import { CATEGORIES } from "@/lib/types"
import { toast } from "sonner"

interface AdminDashboardProps {
  onLogout: () => void
}

interface ProductForm {
  name: string
  code: string
  category: Category
  description: string
  price: string
  hidden: boolean
}

const emptyForm: ProductForm = {
  name: "",
  code: "",
  category: "Outdoor",
  description: "",
  price: "",
  hidden: false,
}

type VisibilityFilter = "all" | "visible" | "hidden"

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<SiteSettings>({})

  // Product form state
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Search, filter, selection
  const [searchQuery, setSearchQuery] = useState("")
  const [visibilityFilter, setVisibilityFilter] =
    useState<VisibilityFilter>("all")
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)

  // Settings
  const [whatsapp, setWhatsapp] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [savingSettings, setSavingSettings] = useState(false)

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products?showHidden=true")
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings")
      const data = await res.json()
      setSettings(data)
      setWhatsapp(data.whatsappNumber || "")
    } catch {
      /* empty */
    }
  }, [])

  useEffect(() => {
    fetchProducts()
    fetchSettings()
  }, [fetchProducts, fetchSettings])

  // Filter + search
  const filteredProducts = useMemo(() => {
    let result = products

    if (visibilityFilter === "visible") {
      result = result.filter((p) => !p.hidden)
    } else if (visibilityFilter === "hidden") {
      result = result.filter((p) => p.hidden)
    }

    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      )
    }

    return result
  }, [products, visibilityFilter, categoryFilter, searchQuery])

  // Statistics
  const stats = useMemo(
    () => ({
      total: products.length,
      visible: products.filter((p) => !p.hidden).length,
      hidden: products.filter((p) => p.hidden).length,
      withPrice: products.filter((p) => p.price && p.price > 0).length,
      withImage: products.filter((p) => !!p.image).length,
    }),
    [products]
  )

  // Image preview helper
  const handleImageFileChange = (file: File | null) => {
    setImageFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  const handleLogoFileChange = (file: File | null) => {
    setLogoFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setLogoPreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setLogoPreview(null)
    }
  }

  // Upload helper
  const uploadFile = async (file: File): Promise<string | null> => {
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    if (!res.ok) return null
    const data = await res.json()
    return data.url
  }

  // Selection helpers
  const allFilteredSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedIds.has(p._id))

  const someFilteredSelected =
    filteredProducts.some((p) => selectedIds.has(p._id)) &&
    !allFilteredSelected

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p._id)))
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  // Bulk visibility
  const handleBulkVisibility = async (hidden: boolean) => {
    if (selectedIds.size === 0) return
    setBulkLoading(true)
    try {
      const res = await fetch("/api/products/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds), hidden }),
      })
      if (!res.ok) throw new Error()
      toast.success(
        `${selectedIds.size} producto${selectedIds.size > 1 ? "s" : ""} ${hidden ? "oculto" : "visible"}${selectedIds.size > 1 ? "s" : ""}`
      )
      setSelectedIds(new Set())
      fetchProducts()
    } catch {
      toast.error("Error al actualizar productos")
    } finally {
      setBulkLoading(false)
    }
  }

  // Product CRUD
  const handleOpenNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setImageFile(null)
    setImagePreview(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (product: Product) => {
    setEditingId(product._id)
    setForm({
      name: product.name,
      code: product.code,
      category: product.category || "Outdoor",
      description: product.description || "",
      price: product.price?.toString() || "",
      hidden: product.hidden,
    })
    setImageFile(null)
    setImagePreview(product.image || null)
    setFormOpen(true)
  }

  const handleSaveProduct = async () => {
    if (!form.name || !form.code) {
      toast.error("Nombre y codigo son obligatorios")
      return
    }
    setSaving(true)
    try {
      let imageUrl: string | undefined
      if (imageFile) {
        const url = await uploadFile(imageFile)
        if (url) imageUrl = url
      }

      const payload: Record<string, unknown> = {
        name: form.name,
        code: form.code,
        category: form.category,
        description: form.description,
        price: form.price ? Number(form.price) : undefined,
        hidden: form.hidden,
      }
      if (imageUrl) payload.image = imageUrl

      if (editingId) {
        payload._id = editingId
        await fetch("/api/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        toast.success("Producto actualizado")
      } else {
        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        toast.success("Producto creado")
      }

      setFormOpen(false)
      fetchProducts()
    } catch {
      toast.error("Error al guardar producto")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await fetch(`/api/products?id=${deleteId}`, { method: "DELETE" })
      toast.success("Producto eliminado")
      setDeleteId(null)
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(deleteId)
        return next
      })
      fetchProducts()
    } catch {
      toast.error("Error al eliminar producto")
    }
  }

  const handleToggleVisibility = async (product: Product) => {
    try {
      await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: product._id, hidden: !product.hidden }),
      })
      toast.success(product.hidden ? "Producto visible" : "Producto oculto")
      fetchProducts()
    } catch {
      toast.error("Error al cambiar visibilidad")
    }
  }

  // Settings
  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      let logoUrl = settings.logoUrl
      if (logoFile) {
        const url = await uploadFile(logoFile)
        if (url) logoUrl = url
      }
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappNumber: whatsapp, logoUrl }),
      })
      toast.success("Configuracion guardada")
      fetchSettings()
      setLogoFile(null)
      setLogoPreview(null)
    } catch {
      toast.error("Error al guardar configuracion")
    } finally {
      setSavingSettings(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    onLogout()
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Admin header */}
        <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <span className="font-heading text-sm font-bold text-primary-foreground">
                  LF
                </span>
              </div>
              <div className="hidden sm:block">
                <span className="font-heading text-base font-bold uppercase tracking-tight text-foreground">
                  Litoral Fishing
                </span>
                <span className="ml-1.5 text-xs text-muted-foreground">Admin</span>
              </div>
              <span className="font-heading text-base font-bold uppercase tracking-tight text-foreground sm:hidden">
                LF Admin
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Salir
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <Tabs defaultValue="products">
            <TabsList className="mb-6">
              <TabsTrigger value="products" className="gap-2">
                <Package className="h-4 w-4" />
                Productos
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Configuracion
              </TabsTrigger>
            </TabsList>

            {/* ============================== */}
            {/* PRODUCTS TAB                   */}
            {/* ============================== */}
            <TabsContent value="products" className="space-y-6">
              {/* Statistics cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  icon={<Package className="h-4 w-4" />}
                  label="Total"
                  value={stats.total}
                />
                <StatCard
                  icon={<Eye className="h-4 w-4" />}
                  label="Visibles"
                  value={stats.visible}
                  accent
                />
                <StatCard
                  icon={<EyeOff className="h-4 w-4" />}
                  label="Ocultos"
                  value={stats.hidden}
                />
                <StatCard
                  icon={<BarChart3 className="h-4 w-4" />}
                  label="Con precio"
                  value={stats.withPrice}
                />
              </div>

              {/* Toolbar: search + filter + bulk actions + add */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                  {/* Search */}
                  <div className="relative flex-1 sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por nombre o codigo..."
                      className="pl-9 pr-8"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span className="sr-only">Limpiar busqueda</span>
                      </button>
                    )}
                  </div>

                  {/* Category filter */}
                  <Select
                    value={categoryFilter}
                    onValueChange={(v) => setCategoryFilter(v as Category | "all")}
                  >
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Visibility filter */}
                  <Select
                    value={visibilityFilter}
                    onValueChange={(v) =>
                      setVisibilityFilter(v as VisibilityFilter)
                    }
                  >
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="visible">Visibles</SelectItem>
                      <SelectItem value="hidden">Ocultos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  {/* Bulk actions */}
                  {selectedIds.size > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={bulkLoading}
                          className="gap-1 bg-transparent"
                        >
                          {bulkLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          {selectedIds.size} seleccionado
                          {selectedIds.size > 1 ? "s" : ""}
                          <ChevronDown className="ml-1 h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleBulkVisibility(false)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Mostrar seleccionados
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleBulkVisibility(true)}
                        >
                          <EyeOff className="mr-2 h-4 w-4" />
                          Ocultar seleccionados
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setSelectedIds(new Set())}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Deseleccionar todo
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  <Button onClick={handleOpenNew} className="gap-2">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Nuevo producto</span>
                    <span className="sm:hidden">Nuevo</span>
                  </Button>
                </div>
              </div>

              {/* Product list */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : products.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center py-16">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Package className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <p className="mt-4 text-lg font-medium text-foreground">
                      No hay productos todavia
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Crea tu primer producto para empezar a armar el catalogo.
                    </p>
                    <Button onClick={handleOpenNew} className="mt-6 gap-2">
                      <Plus className="h-4 w-4" />
                      Crear primer producto
                    </Button>
                  </CardContent>
                </Card>
              ) : filteredProducts.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center py-16">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Search className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <p className="mt-4 text-lg font-medium text-foreground">
                      Sin resultados
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      No se encontraron productos con esos filtros.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("")
                        setVisibilityFilter("all")
                        setCategoryFilter("all")
                      }}
                      className="mt-4"
                    >
                      Limpiar filtros
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Select all row */}
                  <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-2.5">
                    <Checkbox
                      checked={
                        allFilteredSelected
                          ? true
                          : someFilteredSelected
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={toggleSelectAll}
                      aria-label="Seleccionar todos"
                    />
                    <span className="text-sm text-muted-foreground">
                      {filteredProducts.length} producto
                      {filteredProducts.length !== 1 ? "s" : ""}
                      {searchQuery || visibilityFilter !== "all"
                        ? " (filtrado)"
                        : ""}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map((product) => (
                      <Card
                        key={product._id}
                        className={`group transition-opacity ${product.hidden ? "opacity-60" : ""} ${selectedIds.has(product._id) ? "ring-2 ring-primary" : ""}`}
                      >
                        <CardContent className="flex items-start gap-3 p-4">
                          {/* Checkbox */}
                          <Checkbox
                            checked={selectedIds.has(product._id)}
                            onCheckedChange={() => toggleSelect(product._id)}
                            className="mt-1 shrink-0"
                            aria-label={`Seleccionar ${product.name}`}
                          />

                          {/* Thumbnail */}
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                            {product.image ? (
                              <img
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ImageOff className="h-5 w-5 text-muted-foreground/40" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-1">
                              <h3 className="truncate text-sm font-semibold text-foreground">
                                {product.name}
                              </h3>
                              {product.hidden && (
                                <Badge
                                  variant="secondary"
                                  className="shrink-0 text-xs"
                                >
                                  Oculto
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-xs text-muted-foreground">
                                {product.code}
                              </span>
                              {product.category && (
                                <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                                  {product.category}
                                </Badge>
                              )}
                            </div>
                            {product.price != null && product.price > 0 && (
                              <p className="text-sm font-semibold text-primary">
                                ${product.price.toLocaleString("es-AR")}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex shrink-0 gap-0.5">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    handleToggleVisibility(product)
                                  }
                                >
                                  {product.hidden ? (
                                    <Eye className="h-4 w-4" />
                                  ) : (
                                    <EyeOff className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {product.hidden ? "Mostrar" : "Ocultar"}
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleOpenEdit(product)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Editar</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => setDeleteId(product._id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Eliminar</TooltipContent>
                            </Tooltip>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            {/* ============================== */}
            {/* SETTINGS TAB                   */}
            {/* ============================== */}
            <TabsContent value="settings" className="space-y-6">
              {/* Logo management card */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">
                    Logo de la empresa
                  </CardTitle>
                  <CardDescription>
                    Se mostrara en el header del catalogo publico
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                    {/* Current / preview */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-muted/50">
                        {logoPreview || settings.logoUrl ? (
                          <img
                            src={logoPreview || settings.logoUrl}
                            alt="Logo preview"
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <ImagePlus className="h-8 w-8 text-muted-foreground/40" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {logoPreview
                          ? "Vista previa"
                          : settings.logoUrl
                            ? "Logo actual"
                            : "Sin logo"}
                      </span>
                    </div>

                    {/* Upload controls */}
                    <div className="flex flex-col gap-3">
                      <Label
                        htmlFor="logo-upload"
                        className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                      >
                        <Upload className="h-4 w-4" />
                        {settings.logoUrl || logoPreview
                          ? "Cambiar logo"
                          : "Subir logo"}
                      </Label>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleLogoFileChange(e.target.files?.[0] || null)
                        }
                      />
                      {logoFile && (
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            {logoFile.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleLogoFileChange(null)}
                            className="rounded-sm text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span className="sr-only">Quitar archivo</span>
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Recomendado: PNG transparente, max 200x200px
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* WhatsApp card */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">
                    WhatsApp para pedidos
                  </CardTitle>
                  <CardDescription>
                    Los clientes enviaran sus pedidos a este numero
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="whatsapp">Numero de WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="5493424000000"
                      className="max-w-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Numero con codigo de pais, sin espacios ni guiones (ej:
                      5493424000000)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Save */}
              <Button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                size="lg"
              >
                {savingSettings && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar configuracion
              </Button>
            </TabsContent>
          </Tabs>
        </main>

        {/* ============================== */}
        {/* PRODUCT FORM DIALOG            */}
        {/* ============================== */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">
                {editingId ? "Editar producto" : "Nuevo producto"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Modifica los datos del producto"
                  : "Completa los datos del nuevo producto"}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="pname">
                    Nombre <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pname"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Cana de pescar X200"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="pcode">
                    Codigo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pcode"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="CP-X200"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Categoria</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v as Category })}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="pdesc">Descripcion</Label>
                <Textarea
                  id="pdesc"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Descripcion del producto..."
                  rows={3}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="pprice">Precio (opcional)</Label>
                <Input
                  id="pprice"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                  className="max-w-[200px]"
                />
              </div>

              {/* Image upload with preview */}
              <div className="flex flex-col gap-3">
                <Label>Imagen (opcional)</Label>
                <div className="flex items-start gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-muted/50">
                    {imagePreview ? (
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Vista previa"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImagePlus className="h-6 w-6 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="pimage"
                      className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {imagePreview ? "Cambiar imagen" : "Subir imagen"}
                    </Label>
                    <input
                      id="pimage"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageFileChange(e.target.files?.[0] || null)
                      }
                    />
                    {imageFile && (
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {imageFile.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleImageFileChange(null)}
                          className="rounded-sm text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Quitar imagen</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Hidden toggle */}
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <Label
                    htmlFor="phidden"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Ocultar del catalogo
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    El producto no sera visible para los clientes
                  </p>
                </div>
                <Switch
                  id="phidden"
                  checked={form.hidden}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, hidden: checked })
                  }
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProduct} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Guardar cambios" : "Crear producto"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
              <AlertDialogDescription>
                Esta accion no se puede deshacer. El producto sera eliminado
                permanentemente del catalogo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}

/* ================================= */
/* Stat Card sub-component           */
/* ================================= */
function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: number
  accent?: boolean
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 px-4 py-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accent ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold leading-none text-foreground">
            {value}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
