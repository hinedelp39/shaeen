"use client";

import { Check } from "lucide-react";

interface SuccessScreenProps {
  onContinue: () => void;
}

export function SuccessScreen({ onContinue }: SuccessScreenProps) {
  return (
    <div className="min-h-screen bg-[#007DFE] flex flex-col items-center justify-center px-6">
      {/* Success Icon */}
      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-lg">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
          <Check className="w-10 h-10 text-white stroke-[3]" />
        </div>
      </div>

      <h1 className="text-white text-2xl font-bold text-center mb-2">
        Verification Successful!
      </h1>
      <p className="text-white/90 text-center text-base mb-10">
        Your mobile number has been verified
      </p>

      {/* Continue Button */}
      <button
        onClick={onContinue}
        className="w-full max-w-xs bg-white text-[#007DFE] font-semibold py-4 rounded-xl hover:bg-gray-50 transition-all"
      >
        Continue to GCash
      </button>
    </div>
  );
}
