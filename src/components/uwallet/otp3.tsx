"use client"

import React from "react"
import { Suspense } from "react"


import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import Loading from "./loading"

type Language = "en" | "ar"

const translations = {
  en: {
    verifyOTP: "Verify OTP",
    enterCode: "Enter the 4-digit code sent to your mobile",
    verify: "Verify",
    resendCode: "Resend Code",
    timeRemaining: "Time remaining:",
    seconds: "seconds",
    errorMessage: "Your OTP expired, please try again",
    copyright: "Copyright 2026 UWallet. All rights reserved.",
    langToggle: "العربية",
  },
  ar: {
    verifyOTP: "التحقق من الرمز",
    enterCode: "أدخل الرمز المكون من 4 أرقام المرسل إلى هاتفك",
    verify: "تحقق",
    resendCode: "إعادة إرسال الرمز",
    timeRemaining: "الوقت المتبقي:",
    seconds: "ثانية",
    errorMessage: "انتهت صلاحية رمز التحقق، يرجى المحاولة مرة أخرى",
    copyright: "حقوق النشر 2026 UWallet. جميع الحقوق محفوظة.",
    langToggle: "English",
  },
}

export default function OTPPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const langParam = searchParams.get("lang") as Language | null

  const [language, setLanguage] = useState<Language>(langParam || "en")
  const [otp, setOtp] = useState<string[]>(["", "", "", ""])
  const [timer, setTimer] = useState(60)
  const [showError, setShowError] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const t = translations[language]
  const isRTL = language === "ar"

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en")
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1)
    }

    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setShowError(false)

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 4)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    for (let i = 0; i < pastedData.length && i < 4; i++) {
      newOtp[i] = pastedData[i]
    }
    setOtp(newOtp)

    const focusIndex = Math.min(pastedData.length, 3)
    inputRefs.current[focusIndex]?.focus()
  }

  const handleVerify = () => {
    setShowError(true)
    setTimer(60)
  }

  const handleResend = () => {
    setTimer(60)
    setOtp(["", "", "", ""])
    setShowError(false)
    inputRefs.current[0]?.focus()
  }

  return (
    <Suspense fallback={<Loading />}>
      <div
        className="min-h-screen flex flex-col bg-[#f5f5f7]"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <div className="w-full max-w-sm">
            {/* Language Toggle */}
            <div
              className="flex mb-6"
              style={{ justifyContent: isRTL ? "flex-start" : "flex-end" }}
            >
              <button
                type="button"
                onClick={toggleLanguage}
                className="text-[#6b7280] text-sm font-medium hover:text-[#374151] transition-colors"
                style={{ direction: "ltr" }}
              >
                {t.langToggle}
              </button>
            </div>

            {/* Logo */}
            <div className="flex justify-center mb-8">
              <svg
                viewBox="0 0 120 50"
                className="w-32 h-auto"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Wallet Icon */}
                <g transform="translate(35, -5)">
                  <path
                    d="M20 8C20 8 22 5 25 5C28 5 30 8 30 11C30 14 28 16 25 16C22 16 20 14 20 11"
                    stroke="#1a1f3c"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <ellipse
                    cx="25"
                    cy="11"
                    rx="3"
                    ry="5"
                    stroke="#1a1f3c"
                    strokeWidth="2"
                    fill="none"
                  />
                </g>

                {/* "uwallet" text */}
                <text
                  x="60"
                  y="42"
                  textAnchor="middle"
                  fill="#1a1f3c"
                  fontSize="22"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontWeight="700"
                  letterSpacing="-0.5"
                >
                  uwallet
                </text>
              </svg>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-[#374151] text-xl font-semibold mb-2">
                {t.verifyOTP}
              </h1>
              <p className="text-[#9ca3af] text-sm">{t.enterCode}</p>
            </div>

            {/* OTP Input Fields */}
            <div
              className="flex justify-center gap-3 mb-6"
              style={{ direction: "ltr" }}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-12 h-14 text-center text-xl font-semibold bg-white border-2 rounded-lg text-[#1f2937] focus:outline-none focus:ring-1 transition-colors ${digit ? "border-green-500 focus:border-green-500 focus:ring-green-500" : "border-gray-400 focus:border-[#1a1f3c] focus:ring-[#1a1f3c]"
                    }`}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-center mb-4">
              <p className="text-[#6b7280] text-sm">
                {t.timeRemaining}{" "}
                <span className="font-semibold text-[#1a1f3c]">
                  {timer} {t.seconds}
                </span>
              </p>
            </div>

            {/* Error Message */}
            {showError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center">{t.errorMessage}</p>
              </div>
            )}

            {/* Verify Button */}
            <button
              type="button"
              onClick={handleVerify}
              className="w-full h-12 bg-[#1a1f3c] hover:bg-[#2d3561] text-white font-semibold text-base rounded-lg transition-colors mb-4"
            >
              {t.verify}
            </button>

            {/* Resend Code */}
            {timer === 0 && (
              <button
                type="button"
                onClick={handleResend}
                className="w-full h-12 bg-white border border-[#e5e7eb] hover:bg-[#f9fafb] text-[#374151] font-semibold text-base rounded-lg transition-colors"
              >
                {t.resendCode}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="py-6 text-center">
          <p className="text-[#9ca3af] text-xs">{t.copyright}</p>
        </footer>
      </div>
    </Suspense>
  )
}
