// Shadow HVAC shield mark with a defensive shield split into heat and
// cool (ice) halves, echoing "Defend Your Comfort Zone".
export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label="Shadow Heating & Cooling shield"
    >
      <defs>
        <linearGradient id="logo-heat" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff8a3d" />
          <stop offset="1" stopColor="#e23c00" />
        </linearGradient>
        <linearGradient id="logo-cool" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <path
        d="M24 2 L44 9 V24 C44 36 35 44 24 47 C13 44 4 36 4 24 V9 Z"
        fill="#0a0e16"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1.2"
      />
      {/* heat half */}
      <path d="M24 6 L40 11.5 V24 C40 33.5 33 40 24 42.7 Z" fill="url(#logo-heat)" opacity="0.92" />
      {/* cool half */}
      <path d="M24 6 L8 11.5 V24 C8 33.5 15 40 24 42.7 Z" fill="url(#logo-cool)" opacity="0.92" />
      {/* central S bolt */}
      <path
        d="M27 14 L20 24 H25 L21 34 L30 21 H25 Z"
        fill="#0a0e16"
        stroke="#fff"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
