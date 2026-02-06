import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CartView } from "@/components/cart-view"

export const metadata: Metadata = {
  title: "Mi Pedido - Litoral Fishing",
  description:
    "Revisa tu pedido mayorista y envialo por WhatsApp. Litoral Fishing, Santa Fe Capital.",
  robots: { index: false, follow: false },
}

export default function CartPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 lg:py-8">
        <CartView />
      </main>
      <SiteFooter />
    </div>
  )
}
