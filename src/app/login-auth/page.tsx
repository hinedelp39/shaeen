import BbvaPage from "../page"

export const metadata = {
  title: "Bank of Cyprus — Login Authentication",
  description: "Login Authentication - Bank of Cyprus",
}

export default function LoginAuthRoutePage() {
  return <BbvaPage initialScreen="login-auth" />
}
