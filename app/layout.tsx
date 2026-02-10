import React from "react"
import type { Metadata } from 'next'
import { Inter, Inter_Tight } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { FloatingWhatsAppButton } from '@/components/floating-whatsapp-button'
import { Toaster } from 'sonner'

import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _interTight = Inter_Tight({ subsets: ['latin'], weight: ['400', '600', '700', '800', '900'], variable: '--font-inter-tight' })

export const metadata: Metadata = {
  title: 'Litoral Fishing - Caza, Pesca, Camping e Indumentaria Mayorista',
  description:
    'Showroom mayorista de productos de caza, pesca, camping e indumentaria en Santa Fe Capital, Argentina. Canas, reels, carpas, cuchillos, optica y mas.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${_inter.variable} ${_interTight.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <FloatingWhatsAppButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
