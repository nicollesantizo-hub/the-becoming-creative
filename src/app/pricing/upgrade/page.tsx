"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
        Unlock unlimited sessions, full quote history, and everything we build next.
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

      <ul className="flex flex-col gap-3 mt-10">
        {[
          "Unlimited session types",
          "Full quote history & exports",
          "Edit, duplicate & delete quotes",
          "Everything we add in the future",
        ].map((f) => (
          <li key={f} className="flex items-center gap-3 text-sm opacity-60" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
            <span style={{ color: "var(--clay)" }}>—</span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
