"use client"

import { useState } from "react"
import { ArrowLeft, Smartphone } from "lucide-react"

import { useRouter } from "next/navigation"

interface LoginScreenProps {
    onNext: () => void
}

export default function LoginScreen() {
    const router = useRouter()
    const [phoneNumber, setPhoneNumber] = useState("")

    const handleBack = () => {
        router.back()
    }

    //   const handleSubmit = () => {
    //     if (phoneNumber.length >= 9) {
    //       onNext()
    //     }
    //   }

    return (
        <div className="min-h-screen bg-[#60ac28] flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-center relative px-4 py-4">
                <button onClick={handleBack} className="absolute left-4 p-2 text-[#1a2a4a]" aria-label="Go back">
                    <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
                </button>
                {/* Logo */}
                <div className="flex items-center">
                    <span className="text-[22px] font-bold text-[#1a2a4a]">hello</span>
                    <span className="text-[22px] font-bold text-[#d91a32]">paisa</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col px-6 pt-6">
                {/* Title */}
                <h1 className="text-[#1a2a4a] text-xl font-normal text-center mb-8">Login with your cellphone number</h1>

                {/* Phone Input */}
                <div className="relative mb-10">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e8a0a8]">
                        <Smartphone className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="0786786109"
                        className="w-full h-14 pl-12 pr-4 rounded-xl border border-[#e0e4ea] text-[#1a2a4a] text-base placeholder:text-[#a0a8b4] focus:outline-none focus:border-[#1a2a4a] transition-colors"
                    />
                </div>

                {/* Next Button */}
                <button
                    //   onClick={handleSubmit}
                    className="w-full h-14 bg-[#152850] text-white text-base font-medium rounded-full hover:bg-[#1a3260] active:bg-[#0f1e3d] transition-colors"
                >
                    Next
                </button>
            </main>
        </div>
    )
}
