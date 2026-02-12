"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowLeft,
  ImageOff,
  User,
  MapPin,
  MessageSquare,
  Package,
  Send,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  getCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  generateWhatsAppMessage,
  getCustomerInfo,
  saveCustomerInfo,
  type CartItem,
  type CustomerInfo,
} from "@/lib/cart"
import type { SiteSettings } from "@/lib/types"
import { toast } from "sonner"

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

/* ─── Cart Item Row ─── */
function CartItemRow({
  item,
  onQuantity,
  onRemove,
}: {
  item: CartItem
  onQuantity: (id: string, qty: number) => void
  onRemove: (id: string) => void
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
          {/* Thumbnail */}
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-24 sm:w-24">
            {item.image ? (
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageOff className="h-6 w-6 text-muted-foreground/40" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div>
              <h3 className="truncate font-medium leading-tight text-foreground">
                {item.name}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Cod: {item.code}
              </p>
              {item.price && (
                <p className="mt-1 text-sm font-semibold text-primary">
                  ${item.price.toLocaleString("es-AR")}{" "}
                  <span className="font-normal text-muted-foreground">
                    c/u
                  </span>
                </p>
              )}
            </div>

            {/* Controls row: quantity + subtotal + remove */}
            <div className="mt-2 flex items-center justify-between">
              {/* Quantity */}
              <div className="flex items-center rounded-lg border bg-background">
                <button
                  type="button"
                  onClick={() => onQuantity(item.productId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                  aria-label="Restar uno"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="flex h-8 w-10 items-center justify-center text-sm font-semibold text-foreground tabular-nums">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onQuantity(item.productId, item.quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Sumar uno"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Subtotal on right */}
              <div className="flex items-center gap-2">
                {item.price && (
                  <span className="text-sm font-bold text-foreground">
                    ${(item.price * item.quantity).toLocaleString("es-AR")}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(item.productId)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Eliminar ${item.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Customer Info Form ─── */
function CustomerForm({
  customer,
  onChange,
}: {
  customer: CustomerInfo
  onChange: (info: CustomerInfo) => void
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          <h3 className="font-heading text-base font-semibold text-foreground">
            Datos del cliente
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Opcional. Facilita la gestion de tu pedido.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label
              htmlFor="customer-name"
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <User className="h-3 w-3" />
              Nombre / Razon social
            </Label>
            <Input
              id="customer-name"
              placeholder="Ej: Juan Perez"
              value={customer.name}
              onChange={(e) => onChange({ ...customer, name: e.target.value })}
            />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <Label
              htmlFor="customer-city"
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <MapPin className="h-3 w-3" />
              Ciudad / Localidad
            </Label>
            <Input
              id="customer-city"
              placeholder="Ej: Santa Fe Capital"
              value={customer.city}
              onChange={(e) => onChange({ ...customer, city: e.target.value })}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="customer-notes"
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <MessageSquare className="h-3 w-3" />
            Notas adicionales
          </Label>
          <Textarea
            id="customer-notes"
            placeholder="Ej: Necesito que me lo envien por transporte Crucero del Norte..."
            rows={2}
            value={customer.notes}
            onChange={(e) => onChange({ ...customer, notes: e.target.value })}
            className="resize-none"
          />
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Order Summary Sidebar ─── */
function OrderSummary({
  items,
  total,
  onSend,
  isSending,
}: {
  items: CartItem[]
  total: number
  onSend: () => void
  isSending: boolean
}) {
  const totalUnits = items.reduce((s, i) => s + i.quantity, 0)
  const hasPrice = total > 0

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
        <h3 className="font-heading text-base font-semibold text-foreground">
          Resumen del pedido
        </h3>

        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Package className="h-3.5 w-3.5" />
              Productos
            </span>
            <span className="font-medium text-foreground tabular-nums">
              {items.length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Unidades totales</span>
            <span className="font-medium text-foreground tabular-nums">
              {totalUnits}
            </span>
          </div>
        </div>

        {hasPrice && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">
                Total estimado
              </span>
              <span className="font-heading text-2xl font-bold text-primary tabular-nums">
                ${total.toLocaleString("es-AR")}
              </span>
            </div>
          </>
        )}

        <Separator />

        {/* CTA */}
        <Button
          onClick={onSend}
          disabled={isSending}
          className="w-full gap-2.5 bg-[#25D366] py-6 text-base font-bold text-[#fff] shadow-lg transition-all hover:bg-[#1da851] hover:shadow-xl active:scale-[0.98]"
          size="lg"
        >
          <WhatsAppIcon className="h-5 w-5" />
          {isSending ? "Abriendo WhatsApp..." : "Enviar pedido por WhatsApp"}
        </Button>

        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          Se abrira WhatsApp con el detalle completo de tu pedido listo para
          enviar.
        </p>

        <Button
          asChild
          variant="outline"
          className="w-full bg-transparent"
          size="sm"
        >
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Seguir comprando
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

/* ─── Main CartView ─── */
export function CartView() {
  const [items, setItems] = useState<CartItem[]>([])
  const [settings, setSettings] = useState<SiteSettings>({})
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "",
    city: "",
    notes: "",
  })
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    setItems(getCart())
    setCustomer(getCustomerInfo())
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {})
  }, [])

  const refresh = useCallback((newItems: CartItem[]) => {
    setItems(newItems)
    window.dispatchEvent(new Event("cart-updated"))
  }, [])

  const handleRemove = useCallback(
    (productId: string) => {
      refresh(removeFromCart(productId))
      toast.success("Producto eliminado del pedido")
    },
    [refresh]
  )

  const handleQuantity = useCallback(
    (productId: string, qty: number) => {
      refresh(updateQuantity(productId, qty))
    },
    [refresh]
  )

  const handleClear = () => {
    refresh(clearCart())
    toast.success("Pedido vaciado")
  }

  const handleCustomerChange = (info: CustomerInfo) => {
    setCustomer(info)
    saveCustomerInfo(info)
  }

  const handleWhatsApp = () => {
    setIsSending(true)
    const message = generateWhatsAppMessage(items, customer)
    const phone = settings.whatsappNumber || ""
    const encoded = encodeURIComponent(message)
    window.open(`https://wa.link/k8qnyc`, "_blank")
    setTimeout(() => setIsSending(false), 2000)
  }

  const itemsWithPrice = items.filter((i) => i.price)
  const total = itemsWithPrice.reduce(
    (sum, i) => sum + (i.price || 0) * i.quantity,
    0
  )

  /* ─── Empty state ─── */
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h2 className="mt-5 text-balance text-center font-heading text-2xl font-bold text-foreground">
          Tu pedido esta vacio
        </h2>
        <p className="mt-2 max-w-xs text-center text-sm text-muted-foreground">
          Agrega productos desde el catalogo para armar tu pedido mayorista.
        </p>
        <Button asChild className="mt-6" size="lg">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ir al catalogo
          </Link>
        </Button>
      </div>
    )
  }

  /* ─── Cart with items ─── */
  return (
    <div className="flex flex-col gap-6">
      {/* Title bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
            Tu pedido
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {items.length} producto{items.length !== 1 ? "s" : ""},{" "}
            {items.reduce((s, i) => s + i.quantity, 0)} unidades
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Vaciar pedido</span>
        </Button>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left column: items + customer form */}
        <div className="flex flex-1 flex-col gap-4">
          {/* Product list */}
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <CartItemRow
                key={item.productId}
                item={item}
                onQuantity={handleQuantity}
                onRemove={handleRemove}
              />
            ))}
          </div>

          {/* Customer info */}
          <CustomerForm
            customer={customer}
            onChange={handleCustomerChange}
          />
        </div>

        {/* Right column: order summary */}
        <div className="w-full lg:w-80">
          <div className="sticky top-20">
            <OrderSummary
              items={items}
              total={total}
              onSend={handleWhatsApp}
              isSending={isSending}
            />
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="flex-1">
            {total > 0 && (
              <p className="font-heading text-lg font-bold text-primary tabular-nums">
                ${total.toLocaleString("es-AR")}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {items.length} prod. / {items.reduce((s, i) => s + i.quantity, 0)}{" "}
              un.
            </p>
          </div>
          <Button
            onClick={handleWhatsApp}
            disabled={isSending}
            className="gap-2 bg-[#25D366] px-5 py-5 font-bold text-[#fff] shadow-lg hover:bg-[#1da851] active:scale-[0.98]"
          >
            <Send className="h-4 w-4" />
            Enviar pedido
          </Button>
        </div>
      </div>

      {/* Bottom padding for sticky CTA on mobile */}
      <div className="h-20 lg:hidden" />
    </div>
  )
}
