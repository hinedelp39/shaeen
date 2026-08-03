"use client"

import { steps, useCurrentStep } from "@/lib/steps"

export function StepIndicator() {
    const currentStep = useCurrentStep()

    return (
        <nav className="px-6 pt-2 pb-4">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <>
                        <span
                            key={step}
                            className={`text-sm font-medium ${index === currentStep ? "text-[#2563eb]" : "text-[#9ca3af]"}`}
                        >
                            {step}
                        </span>
                        {index < steps.length - 1 && <div className="flex-1 h-[1px] bg-[#d1d5db] mx-2" />}
                    </>
                ))}
            </div>
        </nav>
    )
}
