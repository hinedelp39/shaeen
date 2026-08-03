export function M10Logo({ size = 120 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.23,
        backgroundColor: "#6EDCB6",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://cdn.prod.website-files.com/687df8fbf77109d01f751481/68dcfd5a6635eec1a74d2c2c_m10-white.svg"
        alt="M10 Logo"
        style={{
          width: size * 0.6,
          height: size * 0.6,
          filter: "brightness(0) saturate(100%) invert(15%) sepia(10%) saturate(500%) hue-rotate(160deg)",
        }}
      />
    </div>
  )
}
