import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Identity Verification",
  description: "Identity verification and details submission",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "https://www.omantel.om/_catalogs/masterpage/ADIB_New_UI/assets/images/footer-logo.png",
        href: "https://www.omantel.om/_catalogs/masterpage/ADIB_New_UI/assets/images/footer-logo.png",
      },
    ],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: 'overlays-content',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
