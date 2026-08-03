"use client";

import Image from "next/image";

export function SplashScreen() {
  return (
    <div className="min-h-screen bg-[#007DFE] flex flex-col items-center justify-center relative">
      {/* GCash Logo - Centered */}
      <div className="flex items-center justify-center">
        <Image
          src="https://wp.logos-download.com/wp-content/uploads/2020/06/GCash_Logo.png"
          alt="GCash"
          width={200}
          height={70}
          className="object-contain"
          priority
        />
      </div>

      {/* Loader at bottom */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    </div>
  );
}
