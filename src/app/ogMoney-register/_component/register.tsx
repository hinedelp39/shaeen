"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Lock, Smartphone, User, Mail } from "lucide-react"

interface FormErrors {
  mobileNumber?: string
  password?: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = () => {
    if (validateForm()) {
      // Handle registration logic here
      setIsLoading(true)
      console.log("Registration successful")

      // Simulate delay or api call
      setTimeout(() => {
        setIsLoading(false)
        router.push("/ogMoney-login") // Redirect to login after register (example flow)
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col items-center px-4 py-8 relative">
      {/* Full Screen Loader Overlay with Og Money Branding */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-8">
            <img
              src="https://ogmoney.com/wp-content/uploads/2025/04/Og-Money-Logo-Wide-Blue-1-768x314.png"
              alt="Og Money"
              className="w-48 h-auto brightness-0 invert"
            />
            <div className="w-48 flex flex-col items-center gap-3">
              <span className="loader"></span>
            </div>
          </div>
        </div>
      )}

      {/* Logo */}
      <img
        src="https://ogmoney.com/wp-content/uploads/2025/04/Og-Money-Logo-Wide-Blue-1-768x314.png"
        alt="Og Money"
        className="w-40 mb-3"
      />

      {/* Subtitle */}
      <p className="text-[#666] text-sm mb-6 text-center">
        Please provide your information to create your account
      </p>

      {/* Form Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-5 mb-4">

        {/* Mobile Number */}
        <div className="mb-5">
          <label className="block text-[#333] font-medium text-sm mb-2">
            Mobile Number
          </label>
          <div className="flex gap-2">
            {/* Country Code Selector */}
            <button className="flex items-center gap-1 px-3 py-3 bg-[#f8f8f8] rounded-lg border border-[#e5e5e5] min-w-[90px]">
              <span className="text-base">🇰🇼</span>
              <span className="text-[#999] text-sm">965</span>
              <ChevronDown className="w-4 h-4 text-[#999]" />
            </button>
            {/* Mobile Input */}
            <div className="flex-1 relative">
              <input
                type="tel"
                placeholder="Mobile Number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className={`w-full px-4 py-3 bg-[#f8f8f8] rounded-lg border text-sm placeholder:text-[#bbb] focus:outline-none focus:border-[#3a9cb0] ${errors.mobileNumber ? "border-red-500" : "border-[#e5e5e5]"}`}
              />
              <Smartphone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#ccc]" />
            </div>
          </div>
          {errors.mobileNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="block text-[#333] font-medium text-sm mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 bg-[#f8f8f8] rounded-lg border text-sm placeholder:text-[#bbb] focus:outline-none focus:border-[#3a9cb0] ${errors.password ? "border-red-500" : "border-[#e5e5e5]"}`}
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#ccc]" />
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>
      </div>

      {/* Register Button */}
      <button
        onClick={handleRegister}
        disabled={isLoading}
        className="w-full max-w-md bg-[#3b7fbf] hover:bg-[#3571a8] disabled:bg-[#3b7fbf]/70 text-white font-medium py-4 rounded-full mb-4 text-sm tracking-wide flex items-center justify-center cursor-pointer"
      >
        REGISTER
      </button>

      {/* Login Link */}
      <button
        onClick={() => router.push("/ogMoney-login")}
        className="w-full max-w-md bg-white border border-[#3b7fbf] text-[#3b7fbf] font-medium py-4 rounded-full text-sm tracking-wide"
      >
        LOGIN
      </button>
    </div>
  )
}
