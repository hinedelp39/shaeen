"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { M10Logo } from "./logo-m10"
import { LoaderM10 } from "./loader-m10"


export function PhoneEntry({ onContinue }: { onContinue?: () => void }) {
    const [phone, setPhone] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 9)
        setPhone(digits)
    }

    const formatPhone = (value: string): string => {
        const digits = value.replace(/\D/g, "")
        if (digits.length <= 2) return digits
        if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`
        if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
        return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`
    }

    return (
        <div className="flex min-h-dvh flex-col" style={{ backgroundColor: "#FAFAFA" }}>
            {/* Top bar with English link */}
            <div className="flex items-center justify-end px-5 pt-3">
                <button
                    className="text-[15px] font-medium"
                    style={{ color: "#4DA6E8" }}
                >
                    English
                </button>
            </div>

            {/* bir ID header */}
            <div className="flex items-center justify-center pb-4 pt-2">
                <div
                    className="h-px flex-1"
                    style={{ backgroundColor: "#E5E5EA" }}
                />
                <div className="flex items-center gap-1.5 px-4">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z" fill="#4DA6E8" />
                    </svg>
                    <span
                        className="text-[15px] font-semibold"
                        style={{ color: "#1C1C1E" }}
                    >
                        bir ID
                    </span>
                </div>
                <div
                    className="h-px flex-1"
                    style={{ backgroundColor: "#E5E5EA" }}
                />
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col items-center px-6 pt-4">
                {/* M10 Logo */}
                <div className="mb-8">
                    <M10Logo size={64} />
                </div>

                {/* Title */}
                <h1
                    className="mb-2 text-center text-[26px] font-bold leading-tight"
                    style={{ color: "#1C1C1E" }}
                >
                    {"m10-a Bir ID il\u0259 daxil olun"}
                </h1>

                {/* Subtitle */}
                <p
                    className="mb-8 text-center text-[15px]"
                    style={{ color: "#8E8E93" }}
                >
                    {"Telefon n\u00F6mr\u0259nizi daxil edin"}
                </p>

                {/* Phone Field */}
                <div className="w-full" style={{ maxWidth: "380px" }}>
                    <label
                        className="mb-2 block text-[14px] font-medium"
                        style={{ color: "#1C1C1E" }}
                    >
                        {"Telefon n\u00F6mr\u0259si"}
                    </label>
                    <div
                        className="flex h-[52px] items-center overflow-hidden rounded-xl border"
                        style={{
                            backgroundColor: "#F2F2F7",
                            borderColor: "#E5E5EA",
                        }}
                    >
                        {/* Country Code */}
                        <div className="flex h-full items-center pl-4 pr-2">
                            <span
                                className="text-[16px] font-semibold"
                                style={{ color: "#1C1C1E" }}
                            >
                                +994
                            </span>
                        </div>
                        {/* Divider */}
                        <div
                            className="h-6 w-px"
                            style={{ backgroundColor: "#D1D1D6" }}
                        />
                        {/* Input */}
                        <input
                            type="tel"
                            inputMode="numeric"
                            value={formatPhone(phone)}
                            onChange={handlePhoneChange}
                            className="h-full flex-1 bg-transparent px-3 text-[16px] outline-none"
                            style={{ color: "#1C1C1E" }}
                            placeholder=""
                            autoFocus
                        />
                    </div>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Submit Button */}
                <div className="w-full pb-8 pt-6" style={{ maxWidth: "380px" }}>
                    <button
                        onClick={() => {
                            setIsLoading(true)
                            setTimeout(() => {
                                if (onContinue) {
                                    onContinue()
                                } else {
                                    router.push("/card-entry")
                                }
                            }, 3000)
                        }}
                        disabled={phone.length < 9 || isLoading}
                        className="h-[52px] w-full rounded-2xl text-[16px] font-semibold transition-opacity disabled:opacity-60"
                        style={{
                            backgroundColor: "#2C3E5A",
                            color: "#FFFFFF",
                        }}
                    >
                        Davam et
                    </button>
                </div>
            </div>

            {isLoading && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAFAFA]">
                    <div className="mb-8">
                        <M10Logo size={64} />
                    </div>
                    <LoaderM10 size={32} color="#2C3E5A" />
                </div>
            )}
        </div>
    )
}
