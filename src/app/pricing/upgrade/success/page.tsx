import Link from "next/link";

export default function UpgradeSuccessPage() {
  return (
    <div className="px-5 md:px-8 py-16 max-w-lg">
      <p
        className="text-xs uppercase tracking-widest opacity-40 mb-6"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
      >
        Welcome to Pro
      </p>
      <h1
        className="text-4xl md:text-5xl font-light italic mb-4 leading-tight"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
      >
        You&apos;re in.
      </h1>
      <p
        className="text-base opacity-50 mb-10 leading-relaxed"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
      >
        Your account has been upgraded. Unlimited sessions, full quote history — all yours.
      </p>
      <Link
        href="/pricing"
        className="px-8 py-3 text-sm uppercase tracking-widest transition-opacity hover:opacity-80"
        style={{ backgroundColor: "var(--clay)", color: "var(--cream)", fontFamily: "var(--font-body)", letterSpacing: "0.15em" }}
      >
        Go to dashboard →
      </Link>
    </div>
  );
}
