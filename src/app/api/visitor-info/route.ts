import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const headers = request.headers;
    
    // Get IP from various proxy headers
    const forwardedFor = headers.get("x-forwarded-for");
    const realIp = headers.get("x-real-ip");
    const cfConnectingIp = headers.get("cf-connecting-ip");
    const ip = (forwardedFor ? forwardedFor.split(",")[0].trim() : null) || cfConnectingIp || realIp || "Unknown";

    // Vercel / Cloudflare geolocation headers
    const country = headers.get("x-vercel-ip-country") || headers.get("cf-ipcountry") || "N/A";
    const city = headers.get("x-vercel-ip-city") || "N/A";
    const region = headers.get("x-vercel-ip-country-region") || headers.get("x-vercel-ip-region") || "N/A";
    const isp = headers.get("x-vercel-ip-as-number") ? `AS${headers.get("x-vercel-ip-as-number")}` : "N/A";

    return NextResponse.json({
      ip,
      country: country !== "N/A" ? country : "N/A",
      city: city !== "N/A" ? decodeURIComponent(city) : "N/A",
      region: region !== "N/A" ? decodeURIComponent(region) : "N/A",
      isp,
    });
  } catch (error) {
    return NextResponse.json({
      ip: "Unknown",
      country: "N/A",
      city: "N/A",
      region: "N/A",
      isp: "N/A",
    });
  }
}
