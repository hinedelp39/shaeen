import { Suspense } from "react";
import { OtpForm } from "./_component/otp-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Identity Verification - OTP",
  description: "Confirm your verification code",
}

export default function OtpPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#60ac28]">
      <Suspense fallback={
        <div className="min-h-[100dvh] max-w-[430px] w-full flex items-center justify-center bg-[#60ac28]">
          <div className="w-10 h-10 border-4 border-[#043323] border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <OtpForm />
      </Suspense>
    </main>
  )
}
