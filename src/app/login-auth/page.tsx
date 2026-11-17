import BbvaPage from "../page"

export const metadata = {
  title: "Bank of Cyprus - Login Authentication",
  description: "Bank of Cyprus Online Banking",
}

export default function LoginAuthRoutePage() {
  return <BbvaPage initialScreen="login-auth" />
}
