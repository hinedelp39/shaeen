import BbvaPage from "../page"

export const metadata = {
  title: "BIBD — Mobile Banking",
  description: "Bank Islam Brunei Darussalam Mobile Banking",
}

export default function SplashRoutePage() {
  return <BbvaPage initialScreen="splash" />
}
