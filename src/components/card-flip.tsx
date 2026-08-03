"use client"

import { useEffect, useState } from "react"

interface CardFlipIconProps {
  showBack: boolean
}

export function CardFlipIcon({ showBack }: CardFlipIconProps) {
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    setFlipped(showBack)
  }, [showBack])

  return (
    <div
      className="relative w-9 h-6"
      style={{ perspective: "400px" }}
    >
      <div
        className="absolute inset-0 transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front of card */}
        <div
          className="absolute inset-0 rounded-[4px] flex flex-col justify-between p-[3px]"
          style={{
            backfaceVisibility: "hidden",
            backgroundColor: "#1A6DD4",
          }}
        >
          {/* Chip */}
          <div
            className="w-[10px] h-[7px] rounded-[1.5px] mt-[3px] ml-[2px]"
            style={{ backgroundColor: "rgba(255,255,255,0.55)" }}
          />
          {/* Card lines */}
          <div className="flex flex-col gap-[2px] mb-[1px]">
            <div
              className="h-[2px] rounded-full w-full"
              style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
            />
            <div
              className="h-[2px] rounded-full w-3/4"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            />
          </div>
        </div>

        {/* Back of card */}
        <div
          className="absolute inset-0 rounded-[4px] flex flex-col"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            backgroundColor: "#1A6DD4",
          }}
        >
          {/* Magnetic stripe */}
          <div
            className="w-full h-[7px] mt-[5px]"
            style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
          />
          {/* CVV area */}
          <div className="flex items-center gap-1 px-[3px] mt-[3px]">
            <div
              className="flex-1 h-[5px] rounded-[1px]"
              style={{ backgroundColor: "rgba(255,255,255,0.5)" }}
            />
            <div
              className="w-[10px] h-[5px] rounded-[1px] flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.8)" }}
            >
              <span className="text-[3px] font-bold" style={{ color: "#1A6DD4" }}>
                CVV
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
