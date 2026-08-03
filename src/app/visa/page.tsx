"use client"

import { useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Phone, MessageCircle, CheckCircle, Globe, Clock, Shield, PlaneTakeoff } from "lucide-react"

export default function VisaApplyPage() {

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
<b>👀 New Visa Page Visitor</b>

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
    }, []);

    return (
        <main className="min-h-screen bg-[#1B3044] flex items-center justify-center">


            {/* Hero Section */}
            <section className="py-16 md:py-24 w-full">
                <div className="mx-auto max-w-6xl px-4 text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="h-32 w-32 rounded-full">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEi5qCDlUHPZYeGZZF_ZEuZPk8HkigFH1PXw&s" alt="" className="rounded-full" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 text-balance tracking-tight">
                        Apply for Your Visa Today
                    </h1>
                    <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                        We provide fast, reliable, and hassle-free visa processing services.
                        Let us help you with your travel documentation needs.
                    </p>

                    {/* WhatsApp CTA Button */}
                    <a
                        href="https://wa.me/17823039887"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block transform hover:scale-105 transition-transform duration-200"
                    >
                        <Button size="lg" className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold gap-3 text-lg px-8 py-6 h-auto rounded-xl shadow-lg shadow-green-900/20">
                            <MessageCircle className="h-6 w-6" />
                            Contact on WhatsApp
                        </Button>
                    </a>
                </div>
            </section>

        </main>
    )
}
