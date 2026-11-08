"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FREE_MONTHLY_LIMITS, PRO_FEATURES } from "@/lib/plan";

const FREE_FEATURES = [
  "Cost of doing business calculator",
  "Gallery delivery estimator",
  "1 session type",
  `${FREE_MONTHLY_LIMITS.quotes} proposals a month, with a share link`,
  `${FREE_MONTHLY_LIMITS.contracts} contracts a month, signed in the browser`,
  `${FREE_MONTHLY_LIMITS.invoices} invoices a month`,
  "Planner: Shoot Day",
];

const MONTHLY_PRICE_ID = "price_1TV6M7GEeCINMO292iKYGVP5";
const ANNUAL_PRICE_ID = "price_1TV6OiGEeCINMO29A6bGucrR";

export default function UpgradePage() {
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null);
  const router = useRouter();

  async function handleUpgrade(plan: "monthly" | "annual") {
    setLoading(plan);
    const priceId = plan === "monthly" ? MONTHLY_PRICE_ID : ANNUAL_PRICE_ID;

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });

    const { url, error } = await res.json();
    if (error || !url) { setLoading(null); return; }
    router.push(url);
  }

  return (
    <div className="px-5 md:px-8 py-10 md:py-16 max-w-2xl">
      <p
        className="text-xs uppercase tracking-widest opacity-40 mb-4"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
      >
        Upgrade
      </p>
      <h1
        className="text-4xl md:text-5xl font-light italic mb-3"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
      >
        Go Pro.
      </h1>
      <p
        className="text-base opacity-50 mb-12 leading-relaxed"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
      >
        You&apos;ve done the hard part, the art. Pro carries the rest: proposals your clients can say yes to,
        contracts they sign in a moment, and invoices that arrive on their own, all with your name on them.
      </p>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Monthly */}
        <div className="flex flex-col gap-6 p-8 border" style={{ borderColor: "var(--border)", backgroundColor: "white" }}>
          <div>
            <p className="text-xs uppercase tracking-widest opacity-40 mb-2" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>Monthly</p>
            <p className="text-4xl font-light italic" style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}>$9.99</p>
            <p className="text-xs opacity-40 mt-1" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>per month</p>
          </div>
          <button
            onClick={() => handleUpgrade("monthly")}
            disabled={loading !== null}
            className="py-3 text-sm uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ backgroundColor: "var(--clay)", color: "var(--cream)", fontFamily: "var(--font-body)", letterSpacing: "0.15em" }}
          >
            {loading === "monthly" ? "Redirecting…" : "Get started"}
          </button>
        </div>

        {/* Annual */}
        <div className="flex flex-col gap-6 p-8 border" style={{ borderColor: "var(--clay)", backgroundColor: "white" }}>
          <div>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--clay)", fontFamily: "var(--font-body)" }}>Annual — save 26%</p>
            <p className="text-4xl font-light italic" style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}>$89</p>
            <p className="text-xs opacity-40 mt-1" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>per year (~$7.42/mo)</p>
          </div>
          <button
            onClick={() => handleUpgrade("annual")}
            disabled={loading !== null}
            className="py-3 text-sm uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ backgroundColor: "var(--clay)", color: "var(--cream)", fontFamily: "var(--font-body)", letterSpacing: "0.15em" }}
          >
            {loading === "annual" ? "Redirecting…" : "Get started"}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <div>
          <p className="text-xs uppercase tracking-widest opacity-40 mb-4" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
            Free, always
          </p>
          <ul className="flex flex-col gap-3">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex gap-3 text-sm opacity-60 leading-snug" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                <span className="opacity-40">—</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--clay)", fontFamily: "var(--font-body)" }}>
            Pro adds
          </p>
          <ul className="flex flex-col gap-3">
            {[...PRO_FEATURES, "Everything we build next"].map((f) => (
              <li key={f} className="flex gap-3 text-sm leading-snug" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                <span style={{ color: "var(--clay)" }}>—</span>
                <span className="opacity-80">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
