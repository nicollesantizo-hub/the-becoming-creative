interface LogoProps {
  className?: string;
  markOnly?: boolean;
  style?: React.CSSProperties;
}

export function Logo({ className = "", markOnly = false, style }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`} style={style}>
      <svg
        width="22"
        height="48"
        viewBox="0 0 22 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Organic bulb — smooth oval */}
        <path
          d="M11,4 C15.5,4 18.5,7.5 18.5,12 C18.5,16.5 15.5,20.5 11,21.5 C6.5,20.5 3.5,16.5 3.5,12 C3.5,7.5 6.5,4 11,4Z"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
        />
        {/* Organic filament — soft squiggle */}
        <path
          d="M8,13.5 C9,11.5 10,14.5 11,12.5 C12,10.5 13,13.5 14,11.5"
          stroke="currentColor"
          strokeWidth="0.85"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.35"
        />
        {/* Calyx — curved cup wrapping base of bulb */}
        <path
          d="M8,21.5 C8,24 9.5,26.5 11,27 C12.5,26.5 14,24 14,21.5"
          stroke="currentColor"
          strokeWidth="1.1"
          fill="none"
          strokeLinecap="round"
        />
        {/* Left sepal */}
        <path
          d="M8,22 C6,23.5 5.5,26.5 7.5,28.5"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          opacity="0.55"
        />
        {/* Right sepal */}
        <path
          d="M14,22 C16,23.5 16.5,26.5 14.5,28.5"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          opacity="0.55"
        />
        {/* Stem */}
        <line
          x1="11"
          y1="27"
          x2="11"
          y2="43"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Left leaf */}
        <path
          d="M11 37 C11 37 4 33 2 26 C8 27 12 33 11 37Z"
          fill="currentColor"
          opacity="0.7"
        />
        {/* Right leaf */}
        <path
          d="M11 32 C11 32 18 28 20 21 C14 23 10 29 11 32Z"
          fill="currentColor"
        />
        {/* Root */}
        <circle cx="11" cy="43" r="1.8" fill="currentColor" opacity="0.45" />
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
