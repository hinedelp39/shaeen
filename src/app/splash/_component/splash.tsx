"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SplashScreen() {
    const router = useRouter()

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push("/")
        }, 3000)

        return () => clearTimeout(timer)
    }, [router])

    return (
        <div className="fixed inset-0 z-50 bg-[#60ac28] flex flex-col items-center justify-between py-12 px-6 overflow-hidden select-none animate-in fade-in duration-500">
            {/* Background Geometric Pattern */}
            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `url('/mama-money-pattern.svg')`,
                    backgroundSize: '100px 100px',
                    backgroundRepeat: 'repeat'
                }}
            />

            {/* Decorative Sweeping Arcs Top Right */}
            <svg className="absolute -top-16 -right-24 w-[480px] h-[480px] text-[#71bc30] opacity-80 pointer-events-none" viewBox="0 0 400 400" fill="none">
                <circle cx="400" cy="0" r="380" stroke="currentColor" strokeWidth="48" opacity="0.4" />
                <circle cx="400" cy="0" r="300" stroke="currentColor" strokeWidth="44" opacity="0.6" />
                <circle cx="400" cy="0" r="220" stroke="currentColor" strokeWidth="40" opacity="0.8" />
                <circle cx="400" cy="0" r="140" stroke="currentColor" strokeWidth="36" />
            </svg>

            {/* Decorative Sweeping Arcs Bottom Left */}
            <svg className="absolute -bottom-20 -left-28 w-[400px] h-[400px] text-[#71bc30] opacity-60 pointer-events-none" viewBox="0 0 400 400" fill="none">
                <circle cx="0" cy="400" r="320" stroke="currentColor" strokeWidth="40" opacity="0.4" />
                <circle cx="0" cy="400" r="240" stroke="currentColor" strokeWidth="36" opacity="0.6" />
                <circle cx="0" cy="400" r="160" stroke="currentColor" strokeWidth="32" opacity="0.8" />
            </svg>

            {/* Top Empty Spacer */}
            <div className="w-full h-8 opacity-0 pointer-events-none" />

            {/* Center Branding & Logo */}
            <div className="relative z-10 flex flex-col items-center justify-center space-y-6 text-center">
                {/* Animated Logo Container with glowing ring */}
                <div className="relative">
                    <div className="absolute -inset-4 rounded-full bg-[#043323]/20 animate-ping opacity-30" />
                    <div className="relative w-36 h-36 sm:w-44 sm:h-44 drop-shadow-2xl transition-transform duration-500 hover:scale-105">
                        <img
                            src="/q32.png"
                            alt="Mama Money Logo"
                            className="w-full h-full object-contain pointer-events-none select-none rounded-full"
                            draggable={false}
                        />
                    </div>
                </div>

                {/* Brand Name & Tagline */}
                <div className="flex flex-col items-center space-y-1">
                    <h1 className="text-[#043323] text-5xl sm:text-6xl font-black tracking-tight leading-none drop-shadow-sm">
                        Mama Money
                    </h1>
                    <p className="text-white text-lg sm:text-xl font-bold tracking-wider mt-2 drop-shadow-md">
                        More Money Home
                    </p>
                </div>

                {/* Modern Loader */}
                <div className="pt-6 flex flex-col items-center space-y-4">
                    <div className="relative w-10 h-10">
                        <div className="absolute inset-0 border-4 border-[#043323]/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-[#043323] rounded-full border-t-transparent animate-spin"></div>
                    </div>
                </div>
            </div>

            {/* Footer info */}
            <div className="relative z-10 text-center">
                <p className="text-[#043323]/80 text-xs font-semibold uppercase tracking-widest">
                    Safe • Fast • Reliable Money Transfer
                </p>
            </div>
        </div>
    )
}

