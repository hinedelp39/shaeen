"use client"

import {
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react"

export interface OtpInputHandle {
  reset: () => void
}

interface OtpInputProps {
  length?: number
  onComplete?: (otp: string) => void
}

export const OtpInput = forwardRef<OtpInputHandle, OtpInputProps>(
  function OtpInput({ length = 6, onComplete }, ref) {
    const [values, setValues] = useState<string[]>(Array(length).fill(""))
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    useImperativeHandle(ref, () => ({
      reset() {
        setValues(Array(length).fill(""))
        setTimeout(() => inputRefs.current[0]?.focus(), 50)
      },
    }))

    const handleChange = useCallback(
      (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return

        const digit = value.slice(-1)
        const newValues = [...values]
        newValues[index] = digit
        setValues(newValues)

        if (digit && index < length - 1) {
          inputRefs.current[index + 1]?.focus()
        }

        const otpString = newValues.join("")
        if (otpString.length === length && newValues.every((v) => v !== "")) {
          onComplete?.(otpString)
        }
      },
      [values, length, onComplete]
    )

    const handleKeyDown = useCallback(
      (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !values[index] && index > 0) {
          inputRefs.current[index - 1]?.focus()
          const newValues = [...values]
          newValues[index - 1] = ""
          setValues(newValues)
        }
      },
      [values]
    )

    const handlePaste = useCallback(
      (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasteData = e.clipboardData
          .getData("text")
          .replace(/\D/g, "")
          .slice(0, length)
        if (!pasteData) return

        const newValues = [...values]
        for (let i = 0; i < pasteData.length; i++) {
          newValues[i] = pasteData[i]
        }
        setValues(newValues)

        const nextIndex = Math.min(pasteData.length, length - 1)
        inputRefs.current[nextIndex]?.focus()

        if (pasteData.length === length) {
          onComplete?.(pasteData)
        }
      },
      [values, length, onComplete]
    )

    return (
      <div className="flex items-center justify-center gap-3">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={values[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            onPaste={handlePaste}
            className={`w-12 h-14 rounded-xl text-center text-xl font-semibold transition-all duration-150 focus:outline-none ${
              values[index]
                ? "bg-input text-foreground ring-2 ring-ring/30"
                : focusedIndex === index
                  ? "bg-input text-foreground ring-2 ring-ring/40"
                  : "bg-input text-foreground"
            }`}
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </div>
    )
  }
)
