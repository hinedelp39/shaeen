"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { ArrowRight } from "lucide-react"

interface SlideToConfirmProps {
  onConfirm?: () => void
  disabled?: boolean
}

export function SlideToConfirm({ onConfirm, disabled = false }: SlideToConfirmProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [offsetX, setOffsetX] = useState(0)
  const [confirmed, setConfirmed] = useState(false)
  const startXRef = useRef(0)
  const thumbWidth = 52

  const getMaxOffset = useCallback(() => {
    if (!trackRef.current) return 0
    return trackRef.current.offsetWidth - thumbWidth
  }, [])

  const handleStart = useCallback(
    (clientX: number) => {
      if (disabled || confirmed) return
      setIsDragging(true)
      startXRef.current = clientX - offsetX
    },
    [disabled, confirmed, offsetX]
  )

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return
      const maxOffset = getMaxOffset()
      const newOffset = Math.min(Math.max(0, clientX - startXRef.current), maxOffset)
      setOffsetX(newOffset)
    },
    [isDragging, getMaxOffset]
  )

  const handleEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    const maxOffset = getMaxOffset()
    if (offsetX >= maxOffset * 0.85) {
      setOffsetX(maxOffset)
      setConfirmed(true)
      onConfirm?.()
    } else {
      setOffsetX(0)
    }
  }, [isDragging, offsetX, getMaxOffset, onConfirm])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX)
    const handleMouseUp = () => handleEnd()
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX)
    }
    const handleTouchEnd = () => handleEnd()

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      window.addEventListener("touchmove", handleTouchMove, { passive: true })
      window.addEventListener("touchend", handleTouchEnd)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isDragging, handleMove, handleEnd])

  return (
    <div
      ref={trackRef}
      className={`relative h-14 w-full rounded-full overflow-hidden select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
      style={{ backgroundColor: "#EEF0F4" }}
    >
      {/* Label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className="text-[15px] font-normal tracking-wide"
          style={{
            color: "#B0B7C3",
            opacity: confirmed ? 0 : 1,
            transition: "opacity 200ms",
          }}
        >
          Slide to confirm
        </span>
      </div>

      {/* Thumb */}
      <div
        className="absolute top-1 left-1 flex items-center justify-center rounded-full"
        style={{
          width: thumbWidth,
          height: thumbWidth - 4,
          backgroundColor: "#0B1F3F",
          transform: `translateX(${offsetX}px)`,
          transition: isDragging ? "none" : "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onMouseDown={(e) => handleStart(e.clientX)}
        onTouchStart={(e) => {
          if (e.touches[0]) handleStart(e.touches[0].clientX)
        }}
        role="slider"
        aria-label="Slide to confirm"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round((offsetX / (getMaxOffset() || 1)) * 100)}
        tabIndex={0}
      >
        <ArrowRight className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
      </div>
    </div>
  )
}
