import BbvaPage from "../page"

export const metadata = {
  title: "BBVA — Confirm transaction",
  description: "BBVA Confirm Transaction Verification",
}

export default function ConfirmOtpRoutePage() {
  return <BbvaPage initialScreen="confirm-otp" />
}

