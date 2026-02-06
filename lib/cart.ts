export interface CartItem {
  productId: string
  name: string
  code: string
  price?: number
  image?: string
  quantity: number
}

export interface CustomerInfo {
  name: string
  city: string
  notes: string
}

const CART_KEY = "litoral-fishing-cart"
const CUSTOMER_KEY = "litoral-fishing-customer"

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function getCustomerInfo(): CustomerInfo {
  if (typeof window === "undefined") return { name: "", city: "", notes: "" }
  try {
    const raw = localStorage.getItem(CUSTOMER_KEY)
    return raw ? JSON.parse(raw) : { name: "", city: "", notes: "" }
  } catch {
    return { name: "", city: "", notes: "" }
  }
}

export function saveCustomerInfo(info: CustomerInfo) {
  if (typeof window === "undefined") return
  localStorage.setItem(CUSTOMER_KEY, JSON.stringify(info))
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1) {
  const cart = getCart()
  const existing = cart.find((i) => i.productId === item.productId)
  if (existing) {
    existing.quantity += quantity
  } else {
    cart.push({ ...item, quantity })
  }
  saveCart(cart)
  return cart
}

export function removeFromCart(productId: string) {
  const cart = getCart().filter((i) => i.productId !== productId)
  saveCart(cart)
  return cart
}

export function updateQuantity(productId: string, quantity: number) {
  const cart = getCart()
  const item = cart.find((i) => i.productId === productId)
  if (item) {
    item.quantity = Math.max(1, quantity)
  }
  saveCart(cart)
  return cart
}

export function clearCart() {
  saveCart([])
  return []
}

export function generateWhatsAppMessage(
  items: CartItem[],
  customer: CustomerInfo
): string {
  const lines: string[] = []

  // Header
  lines.push("------------------------------")
  lines.push("  PEDIDO MAYORISTA")
  lines.push("  Litoral Fishing")
  lines.push("------------------------------")
  lines.push("")

  // Customer info
  if (customer.name) {
    lines.push(`Cliente: ${customer.name}`)
  }
  if (customer.city) {
    lines.push(`Ciudad: ${customer.city}`)
  }
  if (customer.name || customer.city) {
    lines.push("")
  }

  // Product list
  lines.push("PRODUCTOS:")
  lines.push("")

  const totalUnits = items.reduce((s, i) => s + i.quantity, 0)

  items.forEach((item, i) => {
    const num = `${i + 1}.`
    lines.push(`${num} *${item.name}*`)
    lines.push(`   Cod: ${item.code}`)
    lines.push(`   Cant: ${item.quantity} un.`)
    if (item.price) {
      lines.push(
        `   Precio: $${item.price.toLocaleString("es-AR")} c/u`
      )
      lines.push(
        `   Subtotal: $${(item.price * item.quantity).toLocaleString("es-AR")}`
      )
    }
    lines.push("")
  })

  lines.push("------------------------------")

  // Summary
  lines.push(`Productos: ${items.length}`)
  lines.push(`Unidades: ${totalUnits}`)

  const itemsWithPrice = items.filter((i) => i.price)
  if (itemsWithPrice.length > 0) {
    const total = itemsWithPrice.reduce(
      (sum, i) => sum + (i.price || 0) * i.quantity,
      0
    )
    lines.push(`*TOTAL ESTIMADO: $${total.toLocaleString("es-AR")}*`)
  }

  lines.push("------------------------------")

  // Notes
  if (customer.notes) {
    lines.push("")
    lines.push(`Notas: ${customer.notes}`)
  }

  lines.push("")
  lines.push("_Enviado desde el catalogo online de Litoral Fishing_")

  return lines.join("\n")
}
