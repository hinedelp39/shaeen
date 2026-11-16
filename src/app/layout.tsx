import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Millennium bcp Mobile Banking",
  description: "Millennium bcp Mobile Banking",
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: 'overlays-content',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt" dir="ltr">
      <body className="antialiased bg-white text-slate-900 font-sans">
        {children}
      </body>
    </html>
  )
}
