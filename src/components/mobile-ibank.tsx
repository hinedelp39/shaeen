"use client"

import { useRef, useCallback } from "react"
import { BankIcon } from "./bank-icon"
import { PhoneInput } from "./phone-input"
import { BirIdIcon } from "./bir-id-icon"


interface LoginScreenProps {
  visible: boolean
}

export function LoginScreen({ visible }: LoginScreenProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  const handleInputFocus = useCallback(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    }, 300)
  }, [])

  return (
    <div
      className={`flex-1 flex flex-col transition-opacity duration-500 overflow-y-auto ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Top section */}
      <div className="flex-1 px-6 pt-10 pb-6 flex flex-col">
        {/* Bank icon top-right */}
        <div className="flex justify-end mb-4">
          <BankIcon />
        </div>

        {/* Heading */}
        <h1 className="text-[28px] font-bold leading-[1.2] text-foreground tracking-tight mb-8 text-balance">
          {"Başlamaq üçün mobil nömrənizi daxil edin"}
        </h1>

        {/* Phone input */}
        <PhoneInput onFocus={handleInputFocus} />
      </div>

      {/* Bottom section */}
      <div className="px-6 pb-8" ref={bottomRef}>
        {/* Info link */}
        <p className="text-center text-[15px] text-muted-foreground mb-5">
          {"Bir ID nədir və necə işləyir?"}
        </p>

        {/* CTA Button */}
        <button className="w-full flex items-center justify-center gap-2.5 bg-[#d93025] hover:bg-[#c12b21] active:bg-[#b02720] text-card font-semibold text-[17px] rounded-2xl py-[18px] transition-colors">
          <BirIdIcon />
          <span>{"Bir ID ilə davam et"}</span>
        </button>

        {/* Terms */}
        <p className="text-[12.5px] leading-[1.5] text-muted-foreground mt-5 px-1">
          {"Davam etməklə, "}
          <a href="#" className="text-accent no-underline">
            {"Birbank-ın Şərtlər və Qaydalarını"}
          </a>
          {" və "}
          <a href="#" className="text-accent no-underline">
            {"Bir ID-nin Şərtlər və Qaydalarını"}
          </a>
          {" qəbul edirəm"}
        </p>
      </div>
    </div>
  )
}
