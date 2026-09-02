import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import type { Contract } from "@/types/pricing";
import { fmt } from "@/lib/pricing";
import { SignaturePad } from "./signature-pad";
import { SavePdfButton } from "./save-button";

export const dynamic = "force-dynamic";

export default async function ContractSignPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: contractData } = await supabase
    .from("contracts")
    .select("*")
    .eq("share_token", token)
    .single();

  if (!contractData) notFound();
  const c = contractData as Contract;

  const { data: profileData } = await supabase
    .from("profiles")
    .select("business_name, contact_name, phone, website")
    .eq("id", c.user_id!)
    .single();

  const biz = profileData as {
    business_name: string | null;
    contact_name: string | null;
    phone: string | null;
    website: string | null;
  } | null;

  const businessHeader = biz?.business_name || biz?.contact_name || "";

  function formatDate(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });
  }

  const sessionDateDisplay = c.session_date ? formatDate(c.session_date) : null;
  const signedAtDisplay = c.signed_at
    ? new Date(c.signed_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 14px;
          line-height: 1.5;
          color: #111111;
          background: #f5f5f5;
        }
        .header-band { background: #111111; padding: 36px 48px 32px; }
        .header-inner { max-width: 660px; margin: 0 auto; }
        .biz-name { font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; color: #fff; margin-bottom: 4px; }
        .biz-contact { font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.8; }
        .page { max-width: 660px; margin: 0 auto; padding: 48px 48px 80px; background: #fff; min-height: 100vh; }
        .contract-title { font-family: 'DM Serif Display', Georgia, serif; font-size: 28px; font-weight: 400; color: #111111; margin-bottom: 6px; }
        .client-meta { font-size: 12px; color: rgba(17,17,17,0.45); letter-spacing: 0.04em; margin-bottom: 32px; }
        .section { margin-bottom: 32px; }
        .section-label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(17,17,17,0.35); margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid rgba(17,17,17,0.08); }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; }
        .info-item { font-size: 13px; color: rgba(17,17,17,0.7); }
        .info-item strong { color: #111111; display: block; font-weight: 500; }
        .line { display: flex; justify-content: space-between; align-items: baseline; padding: 5px 0; font-size: 13px; color: #111111; }
        .line-label { color: rgba(17,17,17,0.65); }
        .line-value { font-weight: 500; }
        .line-total { display: flex; justify-content: space-between; align-items: baseline; padding: 14px 0 0; margin-top: 10px; border-top: 2px solid #111111; }
        .total-label { font-size: 13px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; }
        .total-value { font-size: 22px; font-weight: 600; }
        .terms-block { font-size: 12px; color: rgba(17,17,17,0.6); line-height: 1.8; white-space: pre-wrap; }
        .signed-badge { display: inline-block; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; background: #e9f2ec; color: #2f5940; padding: 8px 14px; margin-bottom: 24px; }
        .signature-img { max-width: 320px; max-height: 120px; border-bottom: 1px solid rgba(17,17,17,0.2); padding-bottom: 8px; }
        .footer { text-align: center; font-size: 11px; color: rgba(17,17,17,0.3); letter-spacing: 0.12em; margin-top: 48px; padding-top: 24px; border-top: 1px solid rgba(17,17,17,0.06); }
        @media print { .no-print { display: none !important; } }
        @media (max-width: 640px) {
          .header-band { padding: 24px 24px 20px; }
          .page { padding: 32px 24px 60px; }
          .info-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="header-band">
        <div className="header-inner">
          <p className="biz-name">{businessHeader}</p>
          <p className="biz-contact">
            {biz?.contact_name && <>{biz.contact_name}<br /></>}
            {biz?.phone && <>{biz.phone}<br /></>}
            {biz?.website && <>{biz.website}</>}
          </p>
        </div>
      </div>

      <div className="page">
        {c.status === "signed" && <SavePdfButton />}

        <h1 className="contract-title">Photography Services Agreement</h1>
        <p className="client-meta">
          {[c.client_name, c.package_name, sessionDateDisplay, c.session_location].filter(Boolean).join("  ·  ")}
        </p>

        {c.status === "signed" && (
          <div className="signed-badge">
            Signed by {c.signer_typed_name} on {signedAtDisplay}
          </div>
        )}

        <div className="section">
          <p className="section-label">Session Details</p>
          <div className="info-grid">
            {c.package_name && (
              <div className="info-item"><strong>Package</strong>{c.package_name}</div>
            )}
            {sessionDateDisplay && (
              <div className="info-item"><strong>Date</strong>{sessionDateDisplay}</div>
            )}
            {c.session_location && (
              <div className="info-item"><strong>Location</strong>{c.session_location}</div>
            )}
            {!!c.group_size && (
              <div className="info-item"><strong>Group size</strong>{c.group_size}</div>
            )}
            {!!c.deliverable_min_photos && (
              <div className="info-item"><strong>Minimum images delivered</strong>{c.deliverable_min_photos}</div>
            )}
            {!!c.delivery_days && (
              <div className="info-item"><strong>Delivery window</strong>{c.delivery_days} days</div>
            )}
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
          <div className="line-total">
            <span className="total-label">Total</span>
            <span className="total-value">{fmt(c.price)}</span>
          </div>
        </div>

        {c.terms_text?.trim() && (
          <div className="section">
            <p className="section-label">Terms &amp; Conditions</p>
            <p className="terms-block">{c.terms_text}</p>
          </div>
        )}

        {c.status === "signed" ? (
          <div className="section">
            <p className="section-label">Signature</p>
            {c.signature_image && (
              <img src={c.signature_image} alt={`Signature of ${c.signer_typed_name}`} className="signature-img" />
            )}
            <p style={{ fontSize: "12px", color: "rgba(17,17,17,0.5)", marginTop: "8px" }}>
              {c.signer_typed_name} · {signedAtDisplay}
            </p>
          </div>
        ) : (
          <SignaturePad token={token} />
        )}

        <div className="footer">
          {biz?.website || "thebecomingcreative.com"}
        </div>
      </div>
    </>
  );
}
