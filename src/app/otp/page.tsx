import { Suspense } from "react"
import { OtpForm } from "./_component/otp-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "InnBucks | Verify OTP",
  description: "Enter verification code to upgrade your InnBucks account",
  icons: {
    icon: "/innbucks-logo.png",
  },
}

export default function OtpPage() {
  return (
    <main className="min-h-screen w-full bg-[#28293C] flex items-center justify-center p-0 sm:p-4 text-white">
      <Suspense
        fallback={
          <div className="min-h-screen w-full flex items-center justify-center bg-[#28293C]">
            <div className="w-10 h-10 border-4 border-[#335c87] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <OtpForm />
      </Suspense>
    </main>
  )
}
