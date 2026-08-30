import type React from "react"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import "./globals.css"

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
})

export const metadata: Metadata = {
  title: "وسيط باي | WaseetPay",
  description: "ادفع، حوّل، واشترِ بسهولة وأمان مع وسيط باي",
  icons: {
    icon: "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/87/ae/5f/87ae5fa1-5f59-8287-5eed-960ccc48750c/Placeholder.mill/400x400bb-75.webp",
  },
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
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className={`${cairo.className} antialiased bg-white text-slate-900`}>
        {children}
      </body>
    </html>
  )
}
