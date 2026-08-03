"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

const GRADIENT_BG = "linear-gradient(to right, #c9e2f5, #e8e0eb, #f2ddd5)"

interface SplashScreenProps {
    onComplete: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
    const [fadeOut, setFadeOut] = useState(false)

    useEffect(() => {
        const fadeTimer = setTimeout(() => {
            setFadeOut(true)
        }, 2000)

        const removeTimer = setTimeout(() => {
            onComplete()
        }, 2500)

        return () => {
            clearTimeout(fadeTimer)
            clearTimeout(removeTimer)
        }
    }, [onComplete])

    return (
        <main
            className="flex min-h-svh flex-col items-center justify-center transition-opacity duration-500"
            style={{
                background: GRADIENT_BG,
                opacity: fadeOut ? 0 : 1,
            }}
        >
            <h1
                className="text-[2.25rem] font-black tracking-tight"
                style={{
                    color: "#1a1a2e",
                    letterSpacing: "-0.02em",
                }}
            >
                YOCO
            </h1>
            <div className="mt-6">
                <Loader2 className="h-6 w-6 animate-spin" style={{ color: "rgba(26, 26, 46, 0.4)" }} />
            </div>
        </main>
    )
}
