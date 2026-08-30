import { Suspense } from "react"
import { OtpForm } from "./_component/otp-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "تأكيد رمز التحقق  | وسيط باي",
  description: "أدخل رمز التحقق السري لتأكيد تسجيل الدخول إلى حسابك في وسيط باي",
}

export default function OtpPage() {
  return (
    <main className="min-h-screen w-full bg-white flex flex-col justify-between">
      <Suspense
        fallback={
          <div className="min-h-screen w-full flex items-center justify-center bg-white">
            <div className="w-10 h-10 border-4 border-[#1E64EC] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <OtpForm />
      </Suspense>
    </main>
  )
}
