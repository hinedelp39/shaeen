import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Standard Bank - Sign In",
  description: "Sign in to your Standard Bank account securely.",
  icons: {
    icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFGcVkJT2-qexPBQlBX16ttftLJwD2sX9ZVPrP52oLjVSAzTogcn-tySJV&s=10",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: "overlays-content",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-[#0061E1] text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
