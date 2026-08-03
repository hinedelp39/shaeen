"use client"

import { useState } from "react"
import { Eye, EyeOff, Loader2, ChevronLeft } from "lucide-react"

const GRADIENT_BG = "linear-gradient(to right, #c9e2f5, #e8e0eb, #f2ddd5)"

interface LoginScreenProps {
    onLoginSuccess: (email: string) => void
    onBack?: () => void
}

function validateEmail(value: string) {
    if (!value.trim()) return "Email address is required"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address"
    return ""
}

function validatePassword(value: string) {
    if (!value) return "Password is required"
    if (value.length < 6) return "Password must be at least 6 characters"
    return ""
}

export function LoginScreen({ onLoginSuccess, onBack }: LoginScreenProps) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [emailError, setEmailError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleLogin = () => {
        const eErr = validateEmail(email)
        const pErr = validatePassword(password)
        setEmailError(eErr)
        setPasswordError(pErr)

        if (eErr || pErr) return

        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            onLoginSuccess(email)
        }, 1500)
    }

    return (
        <main
            className="flex min-h-svh flex-col animate-in fade-in duration-500"
            style={{ background: GRADIENT_BG }}
        >
            {/* Header with Back Button and Logo */}
            <div className="relative flex w-full items-center justify-center px-5 pt-6 pb-2">
                {onBack && (
                    <button
                        type="button"
                        onClick={onBack}
                        className="absolute left-5 p-1 transition-opacity active:opacity-60"
                        aria-label="Go back"
                    >
                        <ChevronLeft className="h-6 w-6" style={{ color: "#1a1a2e" }} />
                    </button>
                )}
                <span
                    className="text-[1.75rem] font-black tracking-tight"
                    style={{
                        color: "#1a1a2e",
                        letterSpacing: "-0.02em",
                    }}
                >
                    YOCO
                </span>
            </div>

            {/* Form */}
            <div className="flex flex-1 flex-col justify-start px-5 pt-6 pb-8">
                <div className="flex flex-col gap-5">
                    {/* Email field */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="email"
                            className="text-sm font-semibold"
                            style={{ color: "#1a1a2e" }}
                        >
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value)
                                if (emailError) setEmailError(validateEmail(e.target.value))
                            }}
                            placeholder="Enter your email address"
                            className="w-full rounded-xl border-2 px-4 py-3.5 text-sm outline-none placeholder:text-gray-500"
                            style={{
                                borderColor: emailError ? "#e53e3e" : "rgba(26, 26, 46, 0.25)",
                                color: "#1a1a2e",
                                backgroundColor: "rgba(255, 255, 255, 0.5)",
                            }}
                        />
                        {emailError && (
                            <span className="mt-1 text-xs" style={{ color: "#e53e3e" }}>
                                {emailError}
                            </span>
                        )}
                    </div>

                    {/* Password field */}
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="password"
                            className="text-sm font-semibold"
                            style={{ color: "#1a1a2e" }}
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    if (passwordError) setPasswordError(validatePassword(e.target.value))
                                }}
                                placeholder="Enter your password"
                                className="w-full rounded-xl border-2 px-4 py-3.5 pr-12 text-sm outline-none placeholder:text-gray-500"
                                style={{
                                    borderColor: passwordError ? "#e53e3e" : "rgba(26, 26, 46, 0.25)",
                                    color: "#1a1a2e",
                                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400" />
                                )}
                            </button>
                        </div>
                        {passwordError && (
                            <span className="mt-1 text-xs" style={{ color: "#e53e3e" }}>
                                {passwordError}
                            </span>
                        )}
                    </div>

                    {/* Log in button moved here */}
                    <button
                        type="button"
                        onClick={handleLogin}
                        disabled={loading}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border-2 py-4 text-base font-semibold transition-opacity disabled:opacity-70"
                        style={{
                            borderColor: "rgba(26, 26, 46, 0.25)",
                            color: "#1a1a2e",
                            backgroundColor: "rgba(255, 255, 255, 0.5)",
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Logging in...
                            </>
                        ) : (
                            "Log in"
                        )}
                    </button>
                </div>
            </div>
        </main>
    )
}
