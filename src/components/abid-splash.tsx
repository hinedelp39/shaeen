"use client"

export default function SplashScreen() {
    return (
        <div className="flex flex-col items-center justify-center h-[100dvh] w-screen overflow-hidden bg-white fixed inset-0">
            <div className="flex flex-col items-center gap-16">
                {/* ADIB Logo */}
                <div className="flex flex-col items-center">
                    {/* Arabic text */}
                    <p
                        className="text-[#2d3e6f] text-lg font-semibold "
                        style={{ fontFamily: "Arial, sans-serif", direction: "rtl" }}
                    >
                        {"مصرف أبوظبي الإسلامي"}
                    </p>
                    {/* ADIB text + Globe */}
                    <div className="flex items-center gap-1">
                        <span
                            className="text-[#1a2d5a] text-5xl tracking-tight"

                        >
                            ADIB
                        </span>
                        {/* Globe icon */}
                        {/* ADIB Logo Image */}
                        <img
                            src="https://www.adib.com/_catalogs/masterpage/ADIB_New_UI/assets/images/footer-logo.png"
                            alt="ADIB Logo"
                            width={72}
                            height={72}
                            className="mt-10"
                        />
                    </div>
                </div>

                {/* Loading spinner */}
                <div className="flex items-center justify-center">
                    <svg
                        className="animate-spin"
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M16 2 L16 8"
                            stroke="#a8d8ea"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            opacity="1"
                        />
                        <path
                            d="M16 24 L16 30"
                            stroke="#a8d8ea"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            opacity="0.3"
                        />
                        <path
                            d="M2 16 L8 16"
                            stroke="#a8d8ea"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            opacity="0.5"
                        />
                        <path
                            d="M24 16 L30 16"
                            stroke="#a8d8ea"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            opacity="0.7"
                        />
                        <path
                            d="M6.1 6.1 L10.3 10.3"
                            stroke="#a8d8ea"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            opacity="0.9"
                        />
                        <path
                            d="M21.7 21.7 L25.9 25.9"
                            stroke="#a8d8ea"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            opacity="0.4"
                        />
                        <path
                            d="M6.1 25.9 L10.3 21.7"
                            stroke="#a8d8ea"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            opacity="0.4"
                        />
                        <path
                            d="M21.7 10.3 L25.9 6.1"
                            stroke="#a8d8ea"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            opacity="0.8"
                        />
                    </svg>
                </div>
            </div>
        </div>
    )
}
