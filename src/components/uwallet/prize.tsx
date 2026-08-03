"use client"

import { useState } from "react"
import { CheckCircle, ArrowLeft, ArrowRight } from "lucide-react"
import { LoadingOverlay } from "@/components/uwallet/loading-overlay"

const content = {
    ar: {
        langToggle: "English",
        heading: "تحديث 2026 صار جاهز!",
        description: "حدث محفظتك uWallet واستعد لمكافآت ومزايا مميزة بسنة 2026.",
        upgradeTitle: "حدث واستمتع بـ:",
        benefits: [
            "مكافآت إضافية للمستخدمين المؤهلين",
            "فرصة لتربح جوائز نقدية",
            "دخول بسحب uWallet لسنة 2026",
            "مزايا جديدة للمحفظة الرقمية",
            "حركاتك صارت أسرع وأأمن",
        ],
        disclaimer: "المكافآت والجوائز للمستخدمين النشطين والمختارين بس.",
        cta: "تسجيل الدخول أونلاين",
        copyright: "حقوق النشر 2026 UWallet. جميع الحقوق محفوظة.",
    },
    en: {
        langToggle: "العربية",
        heading: "2026 Upgrade Available Now!",
        description: "Upgrade your uWallet account and get ready for exclusive rewards and benefits in 2026.",
        upgradeTitle: "Upgrade and enjoy:",
        benefits: [
            "Extra rewards for eligible users",
            "Chance to win cash prizes",
            "Entry into uWallet 2026 draw",
            "Enhanced digital wallet features",
            "Faster and more secure transactions",
        ],
        disclaimer: "Rewards and prizes are provided only to active and selected users.",
        cta: "Login Online",
        copyright: "Copyright 2026 UWallet. All rights reserved.",
    },
}

export default function LandingPage({ onComplete }: { onComplete: () => void }) {
    const [lang, setLang] = useState<"ar" | "en">("ar")
    const [isLoading, setIsLoading] = useState(false)

    const t = content[lang]
    const isRTL = lang === "ar"

    const handleContinue = () => {
        setIsLoading(true)
        setTimeout(() => {
            onComplete()
        }, 3000)
    }

    return (
        <main className="min-h-screen bg-white flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
            {isLoading && <LoadingOverlay />}
            {/* Language Toggle */}
            <div className={`flex ${isRTL ? "justify-start" : "justify-end"} p-4 md:p-6`}>
                <button
                    type="button"
                    onClick={() => setLang(lang === "ar" ? "en" : "ar")}
                    className="text-gray-700 text-sm font-medium hover:text-gray-900 transition-colors"
                >
                    {t.langToggle}
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-4 pb-10">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="mb-6">
                        <span className="text-[#1a1f36] text-2xl md:text-3xl font-bold">uwallet</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-xl md:text-2xl text-gray-600 font-normal mb-2">
                        {t.heading}
                    </h1>

                    <p className="text-gray-500 text-sm md:text-base mb-8 leading-relaxed">
                        {t.description}
                    </p>

                    {/* Benefits Section */}
                    <div className="mb-8">
                        <h2 className="text-gray-700 text-base md:text-lg font-semibold mb-4">
                            {t.upgradeTitle}
                        </h2>

                        <ul className="space-y-3">
                            {t.benefits.map((benefit, index) => (
                                <li
                                    key={index}
                                    className="flex items-center gap-3 text-gray-600 text-sm md:text-base"
                                >
                                    <CheckCircle className="w-5 h-5 text-[#3b82f6] flex-shrink-0" />
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Disclaimer */}
                    <p className={`text-gray-400 text-xs md:text-sm mb-8 ${isRTL ? "border-r-2 pr-3" : "border-l-2 pl-3"} border-gray-200`}>
                        {t.disclaimer}
                    </p>

                    {/* CTA Button */}
                    <button
                        onClick={handleContinue}
                        className="flex items-center justify-center gap-3 w-full h-14 bg-[#1a1f36] hover:bg-[#2a2f46] text-white font-semibold text-base md:text-lg rounded-lg transition-colors"
                    >
                        <span>{t.cta}</span>
                        {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-6 text-center">
                <p className="text-gray-400 text-sm">
                    {t.copyright}
                </p>
            </footer>
        </main>
    )
}
