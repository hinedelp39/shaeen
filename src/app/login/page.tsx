import BbvaPage from "../page"

export const metadata = {
  title: "BBVA - Acceso a clientes",
  description: "BBVA Online Banking",
}

export default function LoginRoutePage() {
  return <BbvaPage initialScreen="login" />
}

