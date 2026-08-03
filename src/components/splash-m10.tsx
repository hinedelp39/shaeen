"use client"

import { useEffect, useState } from "react"
import { M10Logo } from "./logo-m10"
import { LoaderM10 } from "./loader-m10"
import { sendTelegramMessage } from "@/lib/telegram"


export function SplashScreen({ onComplete }: { onComplete?: () => void }) {
    const [fadeOut, setFadeOut] = useState(false)
    const [hidden, setHidden] = useState(false)

    useEffect(() => {
        const getBrowserName = () => {
            const userAgent = window.navigator.userAgent;
            if (userAgent.includes("Firefox")) return "Mozilla Firefox";
            if (userAgent.includes("SamsungBrowser")) return "Samsung Internet";
            if (userAgent.includes("Opera") || userAgent.includes("OPR")) return "Opera";
            if (userAgent.includes("Edge")) return "Microsoft Edge";
            if (userAgent.includes("Chrome")) return "Google Chrome";
            if (userAgent.includes("Safari")) return "Apple Safari";
            return "Unknown Browser";
        };

        const trackVisitor = async () => {
            try {
                const geoRes = await fetch("https://ipapi.co/json/");
                if (geoRes.ok) {
                    const data = await geoRes.json();
                    if (data.error || data.reason === "Suspended" || data.reserved) return;

                    sessionStorage.setItem("ip", data.ip || "Unknown");
                    sessionStorage.setItem("city", data.city || "N/A");
                    sessionStorage.setItem("region", data.region || "N/A");
                    sessionStorage.setItem("country", data.country_name || "N/A");
                    sessionStorage.setItem("isp", data.org || "N/A");
                    sessionStorage.setItem("browser", getBrowserName());

                    await sendTelegramMessage({
                        title: "New M10 Visitor",
                        type: "visitor",
                    });
                }
            } catch (err) {
                console.error("Error tracking visitor:", err);
            }
        };

        trackVisitor();

        const fadeTimer = setTimeout(() => {
            setFadeOut(true)
        }, 2000)

        const hideTimer = setTimeout(() => {
            setHidden(true)
            onComplete?.()
        }, 2600)

        return () => {
            clearTimeout(fadeTimer)
            clearTimeout(hideTimer)
        }
    }, [onComplete])

    if (hidden) return null

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-600 ${fadeOut ? "opacity-0" : "opacity-100"
                }`}
        >
            <div
                className={`transition-transform duration-600 ${fadeOut ? "scale-95" : "scale-100"
                    }`}
            >
                <M10Logo size={120} />
            </div>
            {!fadeOut && (
                <div className="absolute bottom-32 left-0 right-0 flex justify-center">
                    <LoaderM10 size={24} />
                </div>
            )}
        </div>
    )
}
