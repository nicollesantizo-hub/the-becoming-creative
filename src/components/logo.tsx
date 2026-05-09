interface LogoProps {
  className?: string;
  markOnly?: boolean;
  style?: React.CSSProperties;
}

export function Logo({ className = "", markOnly = false, style }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`} style={style}>
      <svg
        width="24"
        height="44"
        viewBox="0 0 24 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Partial bulb — upper arc only, open at base */}
        <path
          d="M6,16 C5,12 6,8 8.5,6 C10.5,4 13.5,4 15.5,6 C18,8 19,12 18,16"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Soft filament */}
        <path
          d="M10,12 C11,10 12,12.5 13,10.5"
          stroke="currentColor"
          strokeWidth="0.85"
          fill="none"
          strokeLinecap="round"
          opacity="0.38"
        />
        {/* Throat — curved base connecting bulb to stem */}
        <path
          d="M6,16 C7,19 9.5,20 12,20 C14.5,20 17,19 18,16"
          stroke="currentColor"
          strokeWidth="1.1"
          fill="none"
          strokeLinecap="round"
        />
        {/* Stem */}
        <line
          x1="12"
          y1="20"
          x2="12"
          y2="39"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Left leaf — line art */}
        <path
          d="M12,34 C10,31 6,28 3,23 C7,24 11,28 12,34Z"
          stroke="currentColor"
          strokeWidth="1.05"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right leaf — line art */}
        <path
          d="M12,28 C14,25 18,22 21,18 C17,19 13,23 12,28Z"
          stroke="currentColor"
          strokeWidth="1.05"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Spark */}
        <circle cx="12" cy="39" r="1.8" fill="currentColor" opacity="0.5" />
      </svg>

      {!markOnly && (
        <span
          className="text-lg tracking-wide"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 400, letterSpacing: "0.08em" }}
        >
          the becoming creative
        </span>
      )}
    </div>
  );
}
