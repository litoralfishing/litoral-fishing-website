"use client"

import React from "react"
import { ShoppingCart, Eye, ImageOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LazyImage } from "@/components/lazy-image"
import { addToCart } from "@/lib/cart"
import type { Product } from "@/lib/types"
import { toast } from "sonner"

interface ProductCardProps {
  product: Product
  onViewDetail: (product: Product) => void
}

export function ProductCard({ product, onViewDetail }: ProductCardProps) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart({
      productId: product._id,
      name: product.name,
      code: product.code,
      price: product.price,
      image: product.image,
    })
    window.dispatchEvent(new Event("cart-updated"))
    toast.success(`${product.name} agregado al pedido`)
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/30">
      <button
        type="button"
        className="relative block w-full cursor-pointer aspect-square overflow-hidden bg-muted text-left"
        onClick={() => onViewDetail(product)}
        aria-label={`Ver detalle de ${product.name}`}
      >
        {product.image ? (
          <LazyImage
            src={product.image}
            alt={product.name}
            wrapperClassName="h-full w-full"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 opacity-0 transition-all group-hover:bg-foreground/10 group-hover:opacity-100">
          <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
            <Eye className="h-4 w-4" />
            Ver detalle
          </span>
        </div>
      </button>
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-base font-semibold leading-tight text-foreground line-clamp-2">
            {product.name}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="text-xs">
            {product.code}
          </Badge>
          {product.category && (
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
          )}
        </div>
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          {product.price ? (
            <span className="text-lg font-bold text-primary">
              ${product.price.toLocaleString("es-AR")}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Consultar precio</span>
          )}
          <Button size="sm" onClick={handleAddToCart} className="gap-1">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Agregar</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
