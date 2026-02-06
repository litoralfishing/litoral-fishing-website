import type { Metadata } from "next"
import { AdminPageClient } from "@/components/admin-page-client"

export const metadata: Metadata = {
  title: "Admin - Litoral Fishing",
  description: "Panel de administracion de productos y configuracion.",
  robots: { index: false, follow: false },
}

export default function AdminPage() {
  return <AdminPageClient />
}
