export function BankIcon({ className }: { className?: string }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Roof / triangle */}
      <path
        d="M14 3L2 11H26L14 3Z"
        stroke="#8e8e93"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Columns */}
      <line x1="7" y1="12" x2="7" y2="21" stroke="#8e8e93" strokeWidth="1.5" />
      <line x1="11.5" y1="12" x2="11.5" y2="21" stroke="#8e8e93" strokeWidth="1.5" />
      <line x1="16.5" y1="12" x2="16.5" y2="21" stroke="#8e8e93" strokeWidth="1.5" />
      <line x1="21" y1="12" x2="21" y2="21" stroke="#8e8e93" strokeWidth="1.5" />
      {/* Base */}
      <rect x="3" y="21" width="22" height="2.5" rx="0.5" stroke="#8e8e93" strokeWidth="1.5" fill="none" />
    </svg>
  )
}
