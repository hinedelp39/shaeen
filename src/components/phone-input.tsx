"use client"

import { useState } from "react"

interface PhoneInputProps {
  onFocus?: () => void
}

export function PhoneInput({ onFocus }: PhoneInputProps) {
  const [value, setValue] = useState("")

  return (
    <div className="w-full rounded-2xl bg-card px-5 py-4">
      <label className="block text-[13px] text-muted-foreground leading-tight mb-1">
        {"Mobil nömrə"}
      </label>
      <div className="flex items-center">
        <span className="text-[18px] text-foreground font-normal tracking-wide">
          {"+ 994"}
        </span>
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={onFocus}
          className="flex-1 bg-transparent text-[18px] text-foreground font-normal tracking-wide outline-none border-none ml-1"
          autoFocus
        />
      </div>
    </div>
  )
}
