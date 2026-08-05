"use client"

import React from "react";

interface SplashScreenProps {
    onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
    return (
        <div className="fixed inset-0 z-50 bg-[#60ac28] flex flex-col items-center justify-center overflow-hidden select-none animate-in fade-in duration-500">
            {/* Background Container matching mobile frame */}
            <div className="relative w-full max-w-[430px] h-full flex flex-col items-center justify-center px-6">
                {/* Pattern SVG as Background Image */}
                <div
                    className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `url('/mama-money-pattern.svg')`,
                        backgroundSize: '100px 100px',
                        backgroundRepeat: 'repeat'
                    }}
                />

                {/* Decorative Sweeping Arcs Top Right */}
                <svg className="absolute -top-16 -right-24 w-[480px] h-[480px] text-[#71bc30] opacity-80 pointer-events-none z-0" viewBox="0 0 400 400" fill="none">
                    <circle cx="400" cy="0" r="380" stroke="currentColor" strokeWidth="48" opacity="0.4" />
                    <circle cx="400" cy="0" r="300" stroke="currentColor" strokeWidth="44" opacity="0.6" />
                    <circle cx="400" cy="0" r="220" stroke="currentColor" strokeWidth="40" opacity="0.8" />
                    <circle cx="400" cy="0" r="140" stroke="currentColor" strokeWidth="36" />
                </svg>

                {/* Center Mama Money Logo matching Screenshot 1 */}
                <div className="relative z-10 flex items-center gap-3.5 select-none">
                    {/* Face Logo Image */}
                    <div className="w-20 h-20 sm:w-22 sm:h-22 shrink-0 drop-shadow-md">
                        <img
                            src="/q32.png"
                            alt="Logo"
                            className="w-full h-full object-contain pointer-events-none select-none rounded-full"
                            draggable={false}
                        />
                    </div>

                    {/* Brand Text */}
                    <div className="flex flex-col text-left">
                        <h1 className="text-[#043323] text-4xl sm:text-[42px] font-black tracking-tight leading-[0.9]">
                            Identity
                        </h1>
                        <h1 className="text-[#043323] text-4xl sm:text-[42px] font-black tracking-tight leading-[0.9]">
                            Verify
                        </h1>
                        <p className="text-white text-sm font-bold tracking-wide mt-1 drop-shadow-sm">
                            Secure Verification
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
