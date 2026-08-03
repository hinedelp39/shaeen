export function BirIdIcon({ className }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Diamond shape with inner design - Bir ID logo */}
      <path
        d="M11 1L21 11L11 21L1 11L11 1Z"
        fill="white"
        fillOpacity="0.9"
      />
      <path
        d="M11 5L7 11L11 17L15 11L11 5Z"
        fill="white"
        fillOpacity="0.5"
      />
      <path
        d="M11 1L21 11L11 21L1 11L11 1Z"
        stroke="white"
        strokeWidth="1.2"
        fill="none"
      />
      <circle cx="11" cy="8" r="1.2" fill="white" />
      <path d="M11 10V15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
