"use client"

import React from "react"

export function LoadingOverlay() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
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
