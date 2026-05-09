import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import type { Quote } from "@/types/pricing";
import { PrintTrigger } from "./print-trigger";

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);
}

export default async function QuotePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const [{ data: quote }, { data: profile }] = await Promise.all([
    supabase.from("quotes").select("*").eq("id", id).eq("user_id", user.id).single(),
    supabase
      .from("profiles")
      .select("business_name, contact_name, phone, website")
      .eq("id", user.id)
      .single(),
  ]);

  if (!quote) redirect("/pricing/quotes");

  const q = quote as Quote;
  const biz = profile as {
    business_name: string | null;
    contact_name: string | null;
    phone: string | null;
    website: string | null;
  } | null;

  const discount =
    q.discount_type === "percentage"
      ? q.suggested_price * (q.discount_value / 100)
      : q.discount_type === "flat"
      ? q.discount_value
      : 0;

  const addonsTotal = (q.addons ?? []).reduce((s, a) => s + a.price, 0);
  const preDiscountTotal = q.suggested_price + addonsTotal;
  const afterDiscount = preDiscountTotal - discount;
  const taxAmount = q.tax_rate > 0 ? afterDiscount * (q.tax_rate / 100) : 0;

  const contactParts = [biz?.contact_name, biz?.phone, user.email].filter(Boolean);

  return (
    <>
      <PrintTrigger />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #fff; color: #1a1a1a; }
        @media print { .no-print { display: none !important; } }
      `}</style>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "48px" }}>

        {/* Back button */}
        <div className="no-print" style={{ marginBottom: "32px" }}>
          <a
            href="/pricing/quotes"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "12px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#1a1a1a",
              opacity: 0.4,
              textDecoration: "none",
            }}
          >
            ← Back to quotes
          </a>
        </div>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px", paddingBottom: "24px", borderBottom: "1px solid #e5e1db" }}>
          <div>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "18px", fontWeight: 400, color: "#1a1a1a", marginBottom: "4px" }}>
              {biz?.business_name || biz?.contact_name || user.email}
            </p>
            {contactParts.length > 0 && (
              <p style={{ fontSize: "12px", color: "#1a1a1a", opacity: 0.45, lineHeight: 1.7 }}>
                {contactParts.join(" · ")}
              </p>
            )}
            {biz?.website && (
              <p style={{ fontSize: "12px", color: "#1a1a1a", opacity: 0.45 }}>
                {biz.website}
              </p>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#1a1a1a", opacity: 0.35 }}>
              Quote
            </p>
            {q.created_at && (
              <p style={{ fontSize: "12px", color: "#1a1a1a", opacity: 0.4, marginTop: "4px" }}>
                {new Date(q.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>
        </div>

        {/* Quote title + client */}
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "34px", fontWeight: 300, fontStyle: "italic", color: "#1a1a1a", marginBottom: "8px", lineHeight: 1.2 }}>
          {q.quote_name || q.client_name || "Quote"}
        </h1>
        <p style={{ fontSize: "13px", color: "#1a1a1a", opacity: 0.5, marginBottom: "40px" }}>
          {[q.client_name, q.client_email, q.session_date].filter(Boolean).join(" · ")}
        </p>

        {/* Pricing */}
        <p style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#1a1a1a", opacity: 0.35, marginBottom: "12px" }}>
          Pricing
        </p>

        <div style={{ borderTop: "1px solid #f0ede9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0ede9", fontSize: "13px" }}>
            <span style={{ opacity: 0.7 }}>Base price</span>
            <span style={{ fontWeight: 500 }}>{fmt(q.suggested_price)}</span>
          </div>

          {(q.addons ?? []).map((addon, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0ede9", fontSize: "13px" }}>
              <span style={{ opacity: 0.7 }}>{addon.label}</span>
              <span style={{ fontWeight: 500 }}>{fmt(addon.price)}</span>
            </div>
          ))}

          {discount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0ede9", fontSize: "13px" }}>
              <span style={{ opacity: 0.7 }}>
                Discount{q.discount_type === "percentage" ? ` (${q.discount_value}%)` : ""}
              </span>
              <span style={{ fontWeight: 500, color: "#8b6f5e" }}>−{fmt(discount)}</span>
            </div>
          )}

          {taxAmount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0ede9", fontSize: "13px" }}>
              <span style={{ opacity: 0.7 }}>Tax ({q.tax_rate}%)</span>
              <span style={{ fontWeight: 500 }}>{fmt(taxAmount)}</span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: "20px", marginTop: "8px", borderTop: "2px solid #1a1a1a" }}>
          <span style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.5 }}>Total</span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "38px", fontWeight: 300, fontStyle: "italic" }}>{fmt(q.final_price)}</span>
        </div>

        {/* Notes */}
        {q.notes && (
          <div style={{ marginTop: "36px" }}>
            <p style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#1a1a1a", opacity: 0.35, marginBottom: "12px" }}>
              Notes
            </p>
            <div style={{ background: "#f7f3ed", padding: "16px 20px", fontSize: "13px", lineHeight: 1.7, color: "#1a1a1a", opacity: 0.8 }}>
              {q.notes}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: "60px", paddingTop: "20px", borderTop: "1px solid #e5e1db", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.2, textAlign: "center" }}>
          thebecomingcreative.com · Price My Work
        </div>
      </div>
    </>
  );
}
