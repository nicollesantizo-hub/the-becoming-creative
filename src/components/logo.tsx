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
        height="46"
        viewBox="0 0 24 46"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Bulb dome */}
        <path
          d="M7,21 C5,21 4,16 4,13 C4,7.5 7.5,4 12,4 C16.5,4 20,7.5 20,13 C20,16 19,21 17,21"
          stroke="currentColor"
          strokeWidth="1.3"
          fill="none"
          strokeLinecap="round"
        />
        {/* Filament */}
        <path
          d="M9.5,14.5 L11,12 L13,15 L14.5,12.5"
          stroke="currentColor"
          strokeWidth="0.9"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.45"
        />
        {/* Base cap lines */}
        <line x1="7" y1="21" x2="17" y2="21" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="7.5" y1="24" x2="16.5" y2="24" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="9" y1="27" x2="15" y2="27" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        {/* Stem */}
        <line
          x1="12"
          y1="27"
          x2="12"
          y2="42"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        {/* Left leaf */}
        <path
          d="M12 36 C12 36 5 32 3 25 C9 26 13 32 12 36Z"
          fill="currentColor"
          opacity="0.7"
        />
        {/* Right leaf */}
        <path
          d="M12 31 C12 31 19 27 21 20 C15 22 11 28 12 31Z"
          fill="currentColor"
        />
        {/* Root */}
        <circle cx="12" cy="42" r="2" fill="currentColor" opacity="0.5" />
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
