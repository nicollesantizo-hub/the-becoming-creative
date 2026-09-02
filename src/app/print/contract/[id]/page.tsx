import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import type { Contract } from "@/types/pricing";
import { fmt } from "@/lib/pricing";
import { PrintTrigger } from "./print-trigger";

export default async function ContractPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const [{ data: contract }, { data: profile }] = await Promise.all([
    supabase.from("contracts").select("*").eq("id", id).eq("user_id", user.id).single(),
    supabase.from("profiles").select("business_name, contact_name, phone, website").eq("id", user.id).single(),
  ]);

  if (!contract) redirect("/pricing/contracts");

  const c = contract as Contract;
  const biz = profile as { business_name: string | null; contact_name: string | null; phone: string | null; website: string | null } | null;

  const businessHeader = biz?.business_name || biz?.contact_name || user.email;
  const contactLine = [biz?.contact_name, biz?.phone].filter(Boolean).join("  ·  ");
  const pdfTitle = c.client_name ? `Contract — ${c.client_name}` : c.contract_number || "Contract";

  function formatDate(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  const sessionDateDisplay = c.session_date ? formatDate(c.session_date) : null;
  const signedAtDisplay = c.signed_at
    ? new Date(c.signed_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
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
        .header-band { background: #111111; padding: 18px 40px 16px; }
        .header-inner { max-width: 660px; margin: 0 auto; }
        .biz-name { font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #ffffff; margin-bottom: 3px; }
        .biz-contact { font-size: 11px; color: rgba(255,255,255,0.45); line-height: 1.6; }
        .page { max-width: 660px; margin: 0 auto; padding: 28px 40px 36px; }
        .back { display: inline-block; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #111111; opacity: 0.3; text-decoration: none; margin-bottom: 20px; }
        .back:hover { opacity: 0.6; }
        .contract-title { font-family: 'DM Serif Display', Georgia, serif; font-size: 30px; font-style: italic; font-weight: 400; color: #111111; line-height: 1.1; margin-bottom: 6px; }
        .client-meta { font-size: 12px; color: #111111; opacity: 0.4; margin-bottom: 22px; }
        .section { margin-bottom: 26px; }
        .section-label { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: #111111; opacity: 0.28; margin-bottom: 10px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; }
        .info-item { font-size: 13px; color: rgba(17,17,17,0.7); }
        .info-item strong { color: #111111; display: block; font-weight: 500; }
        .line { display: flex; justify-content: space-between; align-items: baseline; padding: 5px 0; font-size: 13px; }
        .line-label { color: rgba(17,17,17,0.65); }
        .line-value { font-weight: 500; }
        .total-row { display: flex; justify-content: space-between; align-items: baseline; margin-top: 14px; padding-top: 14px; border-top: 1.5px solid #111111; }
        .total-label { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; opacity: 0.35; }
        .total-amount { font-family: 'DM Serif Display', Georgia, serif; font-size: 30px; font-style: italic; font-weight: 400; color: #111111; line-height: 1; }
        .terms-body { font-size: 11px; line-height: 1.7; color: #111111; opacity: 0.55; white-space: pre-wrap; }
        .signature-img { max-width: 260px; max-height: 100px; border-bottom: 1px solid rgba(17,17,17,0.2); padding-bottom: 6px; }
        .footer { margin-top: 24px; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #111111; opacity: 0.15; text-align: center; }
        @media print {
          html { height: auto !important; min-height: 0 !important; overflow: visible !important; }
          body { display: block !important; min-height: 0 !important; height: auto !important; overflow: visible !important; background: white !important; flex: none !important; }
          .back { display: none; }
          .header-band { margin: 0; }
          .no-print { display: none !important; }
          .header-band, .page { display: block !important; }
        }
      `}</style>

      <div className="header-band">
        <div className="header-inner">
          <p className="biz-name">{businessHeader}</p>
          <p className="biz-contact">
            {contactLine}
            {biz?.website && <><br />{biz.website}</>}
          </p>
        </div>
      </div>

      <div className="page">
        <a href="/pricing/contracts" className="back">← Back to contracts</a>

        <h1 className="contract-title">Photography Services Agreement</h1>
        <p className="client-meta">
          {[c.client_name, c.package_name, sessionDateDisplay, c.session_location].filter(Boolean).join("  ·  ")}
        </p>

        <div className="section">
          <p className="section-label">Session Details</p>
          <div className="info-grid">
            {c.package_name && <div className="info-item"><strong>Package</strong>{c.package_name}</div>}
            {sessionDateDisplay && <div className="info-item"><strong>Date</strong>{sessionDateDisplay}</div>}
            {c.session_location && <div className="info-item"><strong>Location</strong>{c.session_location}</div>}
            {!!c.group_size && <div className="info-item"><strong>Group size</strong>{c.group_size}</div>}
            {!!c.deliverable_min_photos && <div className="info-item"><strong>Minimum images</strong>{c.deliverable_min_photos}</div>}
            {!!c.delivery_days && <div className="info-item"><strong>Delivery window</strong>{c.delivery_days} days</div>}
          </div>
        </div>

        <div className="section">
          <p className="section-label">Investment</p>
          <div className="line">
            <span className="line-label">{c.package_name || "Photography session"}</span>
            <span className="line-value">{fmt(c.price)}</span>
          </div>
          {!!c.deposit_amount && (
            <div className="line">
              <span className="line-label">Deposit due at booking</span>
              <span className="line-value">{fmt(c.deposit_amount)}</span>
            </div>
          )}
          <div className="total-row">
            <span className="total-label">Total</span>
            <span className="total-amount">{fmt(c.price)}</span>
          </div>
        </div>

        {c.terms_text?.trim() && (
          <div className="section">
            <p className="section-label">Terms &amp; Conditions</p>
            <div className="terms-body">{c.terms_text}</div>
          </div>
        )}

        <div className="section">
          <p className="section-label">Signature</p>
          {c.status === "signed" ? (
            <>
              {c.signature_image && <img src={c.signature_image} alt={`Signature of ${c.signer_typed_name}`} className="signature-img" />}
              <p style={{ fontSize: "12px", color: "rgba(17,17,17,0.5)", marginTop: "8px" }}>
                {c.signer_typed_name} · {signedAtDisplay}
              </p>
            </>
          ) : (
            <p style={{ fontSize: "12px", color: "rgba(17,17,17,0.4)" }}>Not yet signed.</p>
          )}
        </div>

        <p className="footer">{businessHeader}</p>
      </div>
    </>
  );
}
