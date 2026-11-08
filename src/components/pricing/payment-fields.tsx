"use client";

import { PAYMENT_METHODS } from "@/lib/payment-methods";
import { ProTag } from "@/components/pricing/plan-note";

export interface PaymentValue {
  method: string;
  link: string;
  instructions: string;
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  color: "var(--charcoal)",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  opacity: 0.4,
};
const inputStyle = { fontFamily: "var(--font-body)", color: "var(--charcoal)", backgroundColor: "white", borderColor: "var(--border)" };

// How the client pays — shared by a single invoice and a monthly series.
export function PaymentFields({
  value,
  onChange,
  isPro = true,
}: {
  value: PaymentValue;
  onChange: (v: PaymentValue) => void;
  isPro?: boolean;
}) {
  const def = PAYMENT_METHODS.find((m) => m.id === value.method);
  return (
    <div className="flex flex-col gap-3">
      <label style={labelStyle}>How they&apos;ll pay</label>
      <div className="flex flex-wrap gap-1.5">
        {PAYMENT_METHODS.map((m) => {
          const on = value.method === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange({ ...value, method: on ? "" : m.id })}
              className="px-3 py-1.5 text-xs border transition-colors"
              style={{
                fontFamily: "var(--font-body)",
                borderColor: on ? "var(--charcoal)" : "var(--border)",
                backgroundColor: on ? "var(--charcoal)" : "white",
                color: on ? "var(--cream)" : "var(--charcoal)",
              }}
            >
              {m.label}
            </button>
          );
        })}
      </div>
      {def?.linkLabel && !isPro && (
        <p className="text-xs opacity-50" style={{ fontFamily: "var(--font-body)", color: "var(--charcoal)" }}>
          Add a pay button (like a Stripe payment link) to your invoice.
          <ProTag />
        </p>
      )}
      {def?.linkLabel && isPro && (
        <div className="flex flex-col gap-1">
          <label style={labelStyle}>{def.linkLabel}</label>
          <input
            type="url"
            value={value.link}
            onChange={(e) => onChange({ ...value, link: e.target.value })}
            placeholder="https://"
            className="px-4 py-3 border outline-none text-sm"
            style={inputStyle}
          />
          {def.id === "stripe" && (
            <p className="text-xs opacity-40 leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "var(--charcoal)" }}>
              In Stripe: Payment Links → New. Set the amount, copy the link, paste it here. It becomes a &ldquo;Pay securely by card&rdquo; button on the email and PDF.
            </p>
          )}
        </div>
      )}
      {value.method && (
        <div className="flex flex-col gap-1">
          <label style={labelStyle}>
            Payment note <span style={{ opacity: 0.4 }}>(optional)</span>
          </label>
          <input
            type="text"
            value={value.instructions}
            onChange={(e) => onChange({ ...value, instructions: e.target.value })}
            placeholder={def?.hint ?? "Anything they should know about paying"}
            className="px-4 py-3 border outline-none text-sm"
            style={inputStyle}
          />
        </div>
      )}
    </div>
  );
}
