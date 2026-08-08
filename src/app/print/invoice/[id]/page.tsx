import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import type { Invoice } from "@/types/pricing";
import { PrintTrigger } from "./print-trigger";

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const [{ data: invoice }, { data: profile }] = await Promise.all([
    supabase.from("invoices").select("*").eq("id", id).eq("user_id", user.id).single(),
    supabase.from("profiles").select("business_name, contact_name, phone, website, tier, logo_url, payment_terms").eq("id", user.id).single(),
  ]);

  if (!invoice) redirect("/pricing/invoices");

  const inv = invoice as Invoice;
  const biz = profile as {
    business_name: string | null;
    contact_name: string | null;
    phone: string | null;
    website: string | null;
    tier: string | null;
    logo_url: string | null;
    payment_terms: string | null;
  } | null;

  const isPro = biz?.tier === "pro";
  const lineItems = (inv.line_items ?? []).filter((i) => i.description?.trim());
  const total = lineItems.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const businessHeader = biz?.business_name || biz?.contact_name || user.email;
  const contactLine = [biz?.contact_name, biz?.phone].filter(Boolean).join("  ·  ");
  const pdfTitle = inv.client_name ? `Invoice — ${inv.client_name}` : inv.invoice_number || "Invoice";

  const formattedDate = inv.created_at
    ? new Date(inv.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "";

  const formattedDue = inv.due_date
    ? new Date(inv.due_date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

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
          color: #111111;
          background: #ffffff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .header-band {
          background: #111111;
          padding: 18px 40px 16px;
        }

        .header-inner {
          max-width: 660px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .biz-name {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #ffffff;
          margin-bottom: 3px;
        }

        .biz-contact {
          font-size: 11px;
          color: rgba(255,255,255,0.45);
          line-height: 1.6;
        }

        .meta-right { text-align: right; }

        .meta-label {
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 3px;
        }

        .meta-date { font-size: 11px; color: rgba(255,255,255,0.45); }

        .page {
          max-width: 660px;
          margin: 0 auto;
          padding: 28px 40px 36px;
        }

        .back {
          display: inline-block;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #111111;
          opacity: 0.3;
          text-decoration: none;
          margin-bottom: 20px;
        }
        .back:hover { opacity: 0.6; }

        .invoice-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 30px;
          font-style: italic;
          font-weight: 400;
          color: #111111;
          line-height: 1.1;
          margin-bottom: 6px;
        }

        .client-meta {
          font-size: 12px;
          color: #111111;
          opacity: 0.4;
          margin-bottom: 22px;
        }

        .section-label {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #111111;
          opacity: 0.28;
          margin-bottom: 10px;
        }

        .items {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 0;
        }

        .items tr { border-bottom: 1px solid #ebebeb; }
        .items tr:last-child { border-bottom: none; }

        .items td {
          padding: 8px 0;
          font-size: 12px;
        }

        .items td.amount {
          text-align: right;
          font-weight: 500;
          white-space: nowrap;
          padding-left: 24px;
        }

        .items td.label-col {
          color: #111111;
          opacity: 0.65;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1.5px solid #111111;
        }

        .total-label {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          opacity: 0.35;
        }

        .total-amount {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 38px;
          font-style: italic;
          font-weight: 400;
          color: #111111;
          line-height: 1;
        }

        .due-row {
          margin-top: 16px;
          padding: 10px 16px;
          background: #f5f5f5;
          font-size: 12px;
          color: #111111;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .due-label {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          opacity: 0.4;
        }

        .due-date {
          font-weight: 500;
          opacity: 0.7;
        }

        .notes { margin-top: 24px; }

        .notes-body {
          font-size: 12px;
          line-height: 1.6;
          color: #111111;
          opacity: 0.65;
          white-space: pre-wrap;
        }

        .terms { margin-top: 22px; }

        .terms-body {
          font-size: 11px;
          line-height: 1.7;
          color: #111111;
          opacity: 0.45;
          white-space: pre-wrap;
        }

        .footer {
          margin-top: 24px;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #111111;
          opacity: 0.15;
          text-align: center;
        }

        @media print {
          html { height: auto !important; }
          body { display: block !important; min-height: 0 !important; height: auto !important; background: white !important; }
          .back { display: none; }
          .header-band { margin: 0; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Dark header band */}
      <div className="header-band">
        <div className="header-inner">
          <div>
            <p className="biz-name">{businessHeader}</p>
            <p className="biz-contact">
              {contactLine}
              {biz?.website && <><br />{biz.website}</>}
            </p>
          </div>
          <div className="meta-right">
            <p className="meta-label">Invoice</p>
            {inv.invoice_number && <p className="meta-date">{inv.invoice_number}</p>}
            {formattedDate && <p className="meta-date" style={{ opacity: 0.6 }}>{formattedDate}</p>}
          </div>
        </div>
      </div>

      <div className="page">
        <a href="/pricing/invoices" className="back">← Back to invoices</a>

        {/* Title + client */}
        <h1 className="invoice-title">{inv.session_name || inv.client_name || "Invoice"}</h1>
        <p className="client-meta">
          {[inv.client_business || null, inv.client_name, inv.client_email].filter(Boolean).join("  ·  ")}
        </p>

        {/* Line items */}
        {lineItems.length > 0 && (
          <div style={{ marginBottom: "0" }}>
            <p className="section-label">Services</p>
            <table className="items">
              <tbody>
                {lineItems.map((item, i) => (
                  <tr key={i}>
                    <td className="label-col">{item.description}</td>
                    <td className="amount">{fmt(Number(item.amount) || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Total */}
        <div className="total-row">
          <span className="total-label">Total Due</span>
          <span className="total-amount">{fmt(total)}</span>
        </div>

        {/* Due date */}
        {formattedDue && (
          <div className="due-row">
            <span className="due-label">Payment due</span>
            <span className="due-date">{formattedDue}</span>
          </div>
        )}

        {/* Notes */}
        {inv.notes?.trim() && (
          <div className="notes">
            <p className="section-label" style={{ marginBottom: "8px" }}>Notes</p>
            <div className="notes-body">{inv.notes}</div>
          </div>
        )}

        {/* Logo */}
        {isPro && biz?.logo_url && (
          <div style={{ textAlign: "center", marginTop: "28px" }}>
            <img
              src={biz.logo_url}
              alt="Logo"
              style={{ maxHeight: "44px", maxWidth: "150px", objectFit: "contain", opacity: 0.7, display: "inline-block" }}
            />
          </div>
        )}

        <p className="footer">{businessHeader}</p>
      </div>
    </>
  );
}
