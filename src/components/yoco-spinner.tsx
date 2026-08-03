"use client"

export function LoadingSpinner() {
  return (
    <div className="relative h-5 w-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2 h-[2px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            backgroundColor: `rgba(120, 120, 128, ${0.2 + (i / 8) * 0.6})`,
            transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-7px)`,
            animation: `spinnerFade 1s linear infinite`,
            animationDelay: `${-(8 - i) * 0.125}s`,
          }}
        />
      ))}
    </div>
  )
}
