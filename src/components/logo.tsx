interface LogoProps {
  className?: string;
  markOnly?: boolean;
}

export function Logo({ className = "", markOnly = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width="28"
        height="36"
        viewBox="0 0 28 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Stem */}
        <line
          x1="14"
          y1="34"
          x2="14"
          y2="10"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        {/* Left leaf */}
        <path
          d="M14 20 C14 20 6 16 3 8 C9 9 15 15 14 20Z"
          fill="currentColor"
          opacity="0.75"
        />
        {/* Right leaf */}
        <path
          d="M14 14 C14 14 22 10 25 2 C19 4 13 10 14 14Z"
          fill="currentColor"
        />
        {/* Seed */}
        <circle cx="14" cy="34" r="2.5" fill="currentColor" opacity="0.6" />
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
