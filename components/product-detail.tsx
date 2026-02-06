"use client"

import { useState } from "react"
import { ShoppingCart, ImageOff, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { LazyImage } from "@/components/lazy-image"
import { addToCart } from "@/lib/cart"
import type { Product } from "@/lib/types"
import { toast } from "sonner"

interface ProductDetailProps {
  product: Product | null
  open: boolean
  onClose: () => void
}

export function ProductDetail({ product, open, onClose }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)

  if (!product) return null

  const handleAddToCart = () => {
    addToCart(
      {
        productId: product._id,
        name: product.name,
        code: product.code,
        price: product.price,
        image: product.image,
      },
      quantity
    )
    window.dispatchEvent(new Event("cart-updated"))
    toast.success(`${quantity}x ${product.name} agregado al pedido`)
    setQuantity(1)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setQuantity(1)
          onClose()
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {product.name}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <Badge variant="outline">{product.code}</Badge>
              {product.category && (
                <Badge variant="secondary">{product.category}</Badge>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 sm:flex-row">
          {/* Image */}
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted sm:w-64 sm:shrink-0">
            {product.image ? (
              <LazyImage
                src={product.image}
                alt={product.name}
                wrapperClassName="h-full w-full"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageOff className="h-16 w-16 text-muted-foreground/40" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-1 flex-col gap-4">
            {product.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            )}

            {product.price ? (
              <p className="text-2xl font-bold text-primary">
                ${product.price.toLocaleString("es-AR")}
              </p>
            ) : (
              <p className="text-base text-muted-foreground">
                Precio a consultar
              </p>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Cantidad:</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 bg-transparent"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-10 text-center font-medium text-foreground">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 bg-transparent"
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <Button onClick={handleAddToCart} className="mt-auto gap-2">
              <ShoppingCart className="h-4 w-4" />
              Agregar al pedido
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
