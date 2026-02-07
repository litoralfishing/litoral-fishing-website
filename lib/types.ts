export const CATEGORIES = [
  "Pesca",
  "Caza",
  "Camping",
  "Outdoor",
] as const

export type Category = (typeof CATEGORIES)[number]

export interface Product {
  _id: string
  name: string
  code: string
  category: Category
  description: string
  price?: number
  image?: string
  hidden: boolean
  createdAt: string
  updatedAt: string
}

export interface SiteSettings {
  _id?: string
  logoUrl?: string
  whatsappNumber?: string
  instagramUrl?: string
  facebookUrl?: string
  whatsappUrl?: string
  address?: string
  location?: string
  phone?: string
}
