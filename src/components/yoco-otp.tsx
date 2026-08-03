"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Loader2, ChevronLeft } from "lucide-react"

const GRADIENT_BG = "linear-gradient(to right, #c9e2f5, #e8e0eb, #f2ddd5)"

interface OtpScreenProps {
    email?: string
    onBack?: () => void
}

export function OtpScreen({ email, onBack }: OtpScreenProps) {
    const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""))
    const [otpError, setOtpError] = useState("")
    const [loading, setLoading] = useState(false)
    const [timer, setTimer] = useState(60)
    const otpRefs = useRef<(HTMLInputElement | null)[]>([])

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
        if (timer === 0) {
            setTimer(60)
            // Logic to resend code would go here
        }
    }

    const handleOtpChange = useCallback(
        (index: number, value: string) => {
            if (!/^\d*$/.test(value)) return

            const newValues = [...otpValues]
            newValues[index] = value.slice(-1)
            setOtpValues(newValues)
            if (otpError) setOtpError("")

            if (value && index < 5) {
                otpRefs.current[index + 1]?.focus()
            }
        },
        [otpValues, otpError]
    )

    const handleOtpKeyDown = useCallback(
        (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Backspace" && !otpValues[index] && index > 0) {
                otpRefs.current[index - 1]?.focus()
            }
        },
        [otpValues]
    )

    const handleOtpPaste = useCallback(
        (e: React.ClipboardEvent<HTMLInputElement>) => {
            e.preventDefault()
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
            if (!pasted) return
            const newValues = [...otpValues]
            for (let i = 0; i < pasted.length; i++) {
                newValues[i] = pasted[i]
            }
            setOtpValues(newValues)
            const focusIndex = Math.min(pasted.length, 5)
            otpRefs.current[focusIndex]?.focus()
        },
        [otpValues]
    )

    const handleVerify = () => {
        const filled = otpValues.every((v) => v !== "")
        if (!filled) {
            setOtpError("Please enter all 6 digits")
            return
        }
        setOtpError("")
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
        }, 1500)
    }

    return (
        <main
            className="flex min-h-svh flex-col animate-in fade-in duration-500"
            style={{ background: GRADIENT_BG }}
        >
            {/* Header with Back Button and Logo */}
            <div className="relative flex w-full items-center justify-center px-5 pt-6 pb-2">
                {onBack && (
                    <button
                        type="button"
                        onClick={onBack}
                        className="absolute left-5 p-1 transition-opacity active:opacity-60"
                        aria-label="Go back"
                    >
                        <ChevronLeft className="h-6 w-6" style={{ color: "#1a1a2e" }} />
                    </button>
                )}
                <span
                    className="text-[1.75rem] font-black tracking-tight"
                    style={{
                        color: "#1a1a2e",
                        letterSpacing: "-0.02em",
                    }}
                >
                    YOCO
                </span>
            </div>

            {/* OTP Content */}
            <div className="flex flex-1 flex-col justify-start px-5 pt-10 pb-8">
                <div className="flex flex-col items-center">
                    <h2
                        className="text-xl font-bold"
                        style={{ color: "#1a1a2e" }}
                    >
                        Enter your 6-digit code
                    </h2>
                    <p
                        className="mt-2 text-center text-sm"
                        style={{ color: "rgba(26, 26, 46, 0.6)" }}
                    >
                        We've sent a verification code to<br />
                        <span className="font-bold">{email || "your email"}</span>
                    </p>

                    {/* OTP Inputs */}
                    <div className="mt-8 flex items-center gap-3">
                        {otpValues.map((value, index) => (
                            <input
                                key={index}
                                ref={(el) => {
                                    otpRefs.current[index] = el
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={value}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                onPaste={index === 0 ? handleOtpPaste : undefined}
                                className="h-12 w-11 rounded-lg border-2 text-center text-lg font-semibold outline-none transition-colors focus:border-[#1a1a2e]"
                                style={{
                                    borderColor: value
                                        ? "rgba(26, 26, 46, 0.5)"
                                        : "rgba(26, 26, 46, 0.2)",
                                    color: "#1a1a2e",
                                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                                }}
                                aria-label={`Digit ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Error */}
                    {otpError && (
                        <span className="mt-4 text-xs" style={{ color: "#e53e3e" }}>
                            {otpError}
                        </span>
                    )}

                    {/* Resend and Timer */}
                    <div className="mt-8 flex flex-col items-center gap-2">
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={timer > 0}
                            className="text-sm font-semibold transition-opacity disabled:opacity-40"
                            style={{ color: "#1a1a2e" }}
                        >
                            Resend code {timer > 0 && (
                                <span className="text-sm font-semibold transition-opacity disabled:opacity-40">
                                    00:{timer < 10 ? `0${timer}` : timer}
                                </span>
                            )}
                        </button>

                    </div>

                    {/* Verify button */}
                    <button
                        type="button"
                        onClick={handleVerify}
                        disabled={loading}
                        className="mt-10 flex w-full items-center justify-center gap-2 rounded-full border-2 py-4 text-base font-semibold transition-opacity disabled:opacity-70"
                        style={{
                            borderColor: "rgba(26, 26, 46, 0.25)",
                            color: "#1a1a2e",
                            backgroundColor: "rgba(255, 255, 255, 0.5)",
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Verify"
                        )}
                    </button>
                </div>
            </div>
        </main>
    )
}
