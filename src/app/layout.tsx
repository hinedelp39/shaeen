import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "InnBucks | Welcome To Upgrade InnBucks Account",
  description: "Upgrade Your InnBucks Account Now to enjoy exclusive benefits",
  icons: {
    icon: "/innbucks-logo.png",
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: "overlays-content",
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" dir="ltr">
      <body className="antialiased bg-[#28293C] text-white">
        {children}
      </body>
    </html>
  )
}
