import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import type { Quote } from "@/types/pricing";
import { fmt } from "@/lib/pricing";
import { PrintTrigger } from "./print-trigger";

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
  const afterDiscount = q.suggested_price + addonsTotal - discount;
  const taxAmount = q.tax_rate > 0 ? afterDiscount * (q.tax_rate / 100) : 0;

  const businessHeader = biz?.business_name || biz?.contact_name || user.email;
  const contactLine = [biz?.contact_name, biz?.phone, user.email].filter(Boolean).join("  ·  ");
  const pdfTitle = q.client_name
    ? `Quote — ${q.client_name}`
    : q.quote_name || "Quote";

  const formattedDate = q.created_at
    ? new Date(q.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "";

  return (
    <>
      <PrintTrigger title={pdfTitle} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=DM+Serif+Display:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 14px;
          line-height: 1.5;
          color: #1c1917;
          background: #ffffff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .page {
          max-width: 660px;
          margin: 0 auto;
          padding: 56px 48px 64px;
        }

        /* Back link */
        .back {
          display: inline-block;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #1c1917;
          opacity: 0.35;
          text-decoration: none;
          margin-bottom: 40px;
        }
        .back:hover { opacity: 0.6; }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 28px;
          margin-bottom: 36px;
          border-bottom: 1.5px solid #e7e3dd;
        }

        .biz-name {
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          font-weight: 500;
          color: #1c1917;
          margin-bottom: 5px;
        }

        .biz-contact {
          font-size: 12px;
          color: #1c1917;
          opacity: 0.45;
          line-height: 1.8;
        }

        .meta-right {
          text-align: right;
        }

        .meta-label {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #1c1917;
          opacity: 0.3;
          margin-bottom: 4px;
        }

        .meta-date {
          font-size: 12px;
          color: #1c1917;
          opacity: 0.45;
        }

        /* Quote title */
        .quote-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 36px;
          font-style: italic;
          font-weight: 400;
          color: #1c1917;
          line-height: 1.15;
          margin-bottom: 10px;
        }

        .client-meta {
          font-size: 13px;
          color: #1c1917;
          opacity: 0.45;
          margin-bottom: 44px;
        }

        /* Line items */
        .section-label {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #1c1917;
          opacity: 0.3;
          margin-bottom: 10px;
        }

        .items {
          width: 100%;
          border-collapse: collapse;
        }

        .items tr {
          border-bottom: 1px solid #f0ece6;
        }

        .items tr:last-child {
          border-bottom: none;
        }

        .items td {
          padding: 11px 0;
          font-size: 13px;
        }

        .items td.amount {
          text-align: right;
          font-weight: 500;
          white-space: nowrap;
          padding-left: 24px;
        }

        .items td.label-col {
          color: #1c1917;
          opacity: 0.65;
        }

        .discount-amount {
          color: #9b7a6a;
        }

        /* Total */
        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1.5px solid #1c1917;
        }

        .total-label {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          opacity: 0.4;
        }

        .total-amount {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 42px;
          font-style: italic;
          font-weight: 400;
          color: #1c1917;
          line-height: 1;
        }

        /* Notes */
        .notes {
          margin-top: 40px;
        }

        .notes-body {
          font-size: 13px;
          line-height: 1.7;
          color: #1c1917;
          opacity: 0.7;
          padding: 18px 20px;
          background: #f7f4f0;
          border-left: 2px solid #d6cfc6;
        }

        /* Footer */
        .footer {
          margin-top: 64px;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #1c1917;
          opacity: 0.18;
          text-align: center;
        }

        @media print {
          .back { display: none; }
          .page { padding: 0; }
        }
      `}</style>

      <div className="page">
        <a href="/pricing/quotes" className="back">← Back to quotes</a>

        {/* Header */}
        <div className="header">
          <div>
            <p className="biz-name">{businessHeader}</p>
            <p className="biz-contact">
              {contactLine}
              {biz?.website && <><br />{biz.website}</>}
            </p>
          </div>
          <div className="meta-right">
            <p className="meta-label">Quote</p>
            {formattedDate && <p className="meta-date">{formattedDate}</p>}
          </div>
        </div>

        {/* Title */}
        <h1 className="quote-title">{q.quote_name || q.client_name || "Quote"}</h1>
        <p className="client-meta">
          {[q.client_name, q.client_email, q.session_date].filter(Boolean).join("  ·  ")}
        </p>

        {/* Pricing */}
        <p className="section-label">Pricing</p>
        <table className="items">
          <tbody>
            <tr>
              <td className="label-col">Base price</td>
              <td className="amount">{fmt(q.suggested_price)}</td>
            </tr>

            {(q.addons ?? []).map((addon, i) => (
              <tr key={i}>
                <td className="label-col">{addon.label}</td>
                <td className="amount">{fmt(addon.price)}</td>
              </tr>
            ))}

            {discount > 0 && (
              <tr>
                <td className="label-col">
                  Discount{q.discount_type === "percentage" ? ` (${q.discount_value}%)` : ""}
                </td>
                <td className="amount discount-amount">−{fmt(discount)}</td>
              </tr>
            )}

            {taxAmount > 0 && (
              <tr>
                <td className="label-col">Tax ({q.tax_rate}%)</td>
                <td className="amount">{fmt(taxAmount)}</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="total-row">
          <span className="total-label">Total</span>
          <span className="total-amount">{fmt(q.final_price)}</span>
        </div>

        {/* Notes */}
        {q.notes && (
          <div className="notes">
            <p className="section-label">Notes</p>
            <div className="notes-body">{q.notes}</div>
          </div>
        )}

        <div className="footer">{biz?.website || businessHeader} · Price My Work</div>
      </div>
    </>
  );
}
