import { usePathname } from "next/navigation"

export const steps = ["Contact", "Secure", "OTP", "Login", "Verify"]

// Map routes to step indices
const routeToStepMap: Record<string, number> = {
    "/login-type": 0,  // Connect (first step)
    "/pin": 1,         // Secure (second step)
    "/new-otp": 2,     // OTP (third step)
    "/cred": 3,        // Login (fourth step)
    "/otp2": 4,        // Verify (fifth step)
}

export function useCurrentStep(): number {
    const pathname = usePathname()
    return routeToStepMap[pathname] ?? 0
}
