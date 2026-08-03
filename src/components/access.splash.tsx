"use client"

import { useEffect, useState } from "react"
import Image from "next/image"


export function SplashScreen({ onComplete }: { onComplete: () => void }) {
    const [isAnimating, setIsAnimating] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsAnimating(false)
            setTimeout(onComplete, 500)
        }, 2500)
        return () => clearTimeout(timer)
    }, [onComplete])

    return (
        <div
            className={`fixed inset-0 z-50 w-full max-w-[100vw] overflow-hidden flex flex-col items-center justify-center transition-opacity duration-500 ${isAnimating ? "opacity-100" : "opacity-0"
                }`}
        >
            <style>{`
        @keyframes slideInFromLeft {
          from { transform: translateX(-150px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes loadingProgress {
          0% { width: 0%; opacity: 0; }
          20% { opacity: 1; }
          100% { width: 100%; opacity: 1; }
        }
      `}</style>

            {/* Background Image - Full bleed building photo */}
            <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/AccessBank-Lagos-Headquarters-Nigeria.jpg/960px-AccessBank-Lagos-Headquarters-Nigeria.jpg"
                alt="Access Bank Building"
                className="absolute inset-0 h-full w-full object-cover object-center"
            />

            {/* Dark blue overlay to match screenshot */}
            <div className="absolute inset-0 bg-[#0d1a33]/60" />

            {/* Content - centered vertically */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Logo */}
                <div
                    className="flex items-center gap-2 mb-6"
                    style={{ animation: 'slideInFromLeft 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                >
                    <img src="https://cdn.brandfetch.io/idPXJmyni4/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B" alt="Access Logo" className="h-16 w-16" />
                </div>

                {/* Welcome Text */}
                <h1 className="mb-4 text-xl font-medium tracking-wide text-white">
                    Welcome to Access Bank
                </h1>

                {/* Loading bar */}
                <div className="h-[3px] w-64 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ animation: 'loadingProgress 2.5s ease-out forwards' }} />
                </div>
            </div>
        </div>
    )
}
