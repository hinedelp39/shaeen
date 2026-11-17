import BbvaPage from "../page"

export const metadata = {
  title: "Bank of Cyprus - 1Bank Login",
  description: "Bank of Cyprus Online Banking",
}

export default function LoginRoutePage() {
  return <BbvaPage initialScreen="login" />
}

