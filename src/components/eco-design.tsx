"use client"

import { useState, useEffect } from "react"

function SplashScreen() {
  return (
    <div className="relative h-screen w-full bg-white overflow-hidden flex flex-col">
      {/* Logo Section */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-8">
          <img
            src="https://images.seeklogo.com/logo-png/32/1/ecocash-logo-png_seeklogo-322045.png"
            alt="EcoCash Logo"
            className="h-14 w-auto"
          />
          {/* Loader */}
          <div className="w-8 h-8 border-4 border-[#2D5F9E] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>

      {/* Blue Wave Section */}
      <div className="h-[45%] relative">
        <svg
          viewBox="0 0 1440 580"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 580V180C0 180 280 0 720 0C1160 0 1440 180 1440 180V580H0Z"
            fill="#2D5F9E"
          />
        </svg>
      </div>
    </div>
  )
}

function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [pin, setPin] = useState(["", "", "", ""])

  const handlePinChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newPin = [...pin]
      newPin[index] = value
      setPin(newPin)
      
      // Auto-focus next input
      if (value && index < 3) {
        const nextInput = document.getElementById(`pin-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`)
      prevInput?.focus()
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-white overflow-hidden flex flex-col">
      {/* White Section */}
      <div className="flex-1 flex flex-col px-6 pt-10 pb-4">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="https://images.seeklogo.com/logo-png/32/1/ecocash-logo-png_seeklogo-322045.png"
            alt="EcoCash Logo"
            className="h-12 w-auto"
          />
        </div>

        {/* Login Title */}
        <h1 className="text-center text-[#2D5F9E] text-xl font-bold mb-6">Login</h1>

        {/* Phone Number Input */}
        <div className="flex items-center border-2 border-[#2D5F9E] rounded-lg px-3 py-3 mb-6">
          <div className="flex items-center gap-2 border-r border-gray-300 pr-3">
            <img
              src="https://flagcdn.com/w40/zw.png"
              alt="Zimbabwe Flag"
              className="w-8 h-5 object-cover"
            />
            <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <span className="text-gray-600 ml-3 mr-2">+263</span>
          <input
            type="tel"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="flex-1 outline-none text-gray-600 placeholder-gray-400"
          />
        </div>

        {/* Enter PIN Label */}
        <p className="text-center text-gray-500 mb-4">Enter your PIN</p>

        {/* PIN Input Boxes */}
        <div className="flex justify-center gap-4 mb-8">
          {pin.map((digit, index) => (
            <input
              key={index}
              id={`pin-${index}`}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-14 h-14 border-2 border-[#2D5F9E] rounded-lg text-center text-2xl font-bold outline-none focus:border-[#1a4a7a]"
            />
          ))}
        </div>
      </div>

      {/* Blue Wave Section */}
      <div className="h-[42%] relative">
        <svg
          viewBox="0 0 1440 580"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 580V180C0 180 280 0 720 0C1160 0 1440 180 1440 180V580H0Z"
            fill="#2D5F9E"
          />
        </svg>
        
        {/* Content on Blue Section */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pt-20">
          <p className="text-white text-center text-sm mb-6">
            To register an EcoCash wallet or get assistance,
            <br />
            click below
          </p>
          
          {/* Action Buttons */}
          <div className="flex gap-4 w-full max-w-sm">
            <button className="flex-1 bg-white rounded-xl py-4 flex flex-col items-center gap-2 shadow-lg">
              <svg className="w-6 h-6 text-[#2D5F9E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="text-[#2D5F9E] text-sm font-medium">Register</span>
            </button>
            
            <button className="flex-1 bg-white rounded-xl py-4 flex flex-col items-center gap-2 shadow-lg">
              <svg className="w-6 h-6 text-[#2D5F9E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[#2D5F9E] text-sm font-medium">Help & Support</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  if (showSplash) {
    return <SplashScreen />
  }

  return <LoginScreen />
}
