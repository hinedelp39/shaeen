import BbvaPage from "../page"

export const metadata = {
  title: "BBVA — OTP",
  description: "Verify your identity",
}

export default function VerifyRoutePage() {
  return <BbvaPage initialScreen="otp" />
}
