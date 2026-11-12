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

export const sendTelegramMessage = async (_params?: any) => {
    // Telegram messaging disabled for now
    return null;
};
