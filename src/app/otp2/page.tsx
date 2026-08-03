
"use client";

import { useRouter } from "next/navigation";
import OtpForm from "./_component/otp-form";

export default function OtpPage() {
  const router = useRouter();

  return (
    <OtpForm
      onVerify={() => console.log("Verify")}
      onBack={() => router.back()}
    />
  )
}
