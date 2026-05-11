import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import type { Quote, SessionType } from "@/types/pricing";
import { fmt } from "@/lib/pricing";
import { SavePdfButton } from "./save-button";

export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: quoteData } = await supabase
    .from("quotes")
    .select("*")
    .eq("share_token", token)
    .single();

  if (!quoteData) notFound();
  const q = quoteData as Quote;

  const [{ data: profileData }, sessionResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("business_name, contact_name, phone, website, logo_url, payment_terms, tier")
      .eq("id", q.user_id!)
      .single(),
    q.session_type_id
      ? supabase.from("session_types").select("*").eq("id", q.session_type_id).single()
      : Promise.resolve({ data: null }),
  ]);

  const biz = profileData as {
    business_name: string | null;
    contact_name: string | null;
    phone: string | null;
    website: string | null;
    logo_url: string | null;
    payment_terms: string | null;
    tier: string | null;
  } | null;

  const sessionType = sessionResult.data as SessionType | null;
  const isPro = biz?.tier === "pro";

  const isEvent = q.location_type === "event";
  const eventDays = q.event_days && q.event_days > 1 ? q.event_days : 1;

  function formatDate(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });
  }

  const dateDisplay = q.session_date && q.event_end_date
    ? `${formatDate(q.session_date)} – ${formatDate(q.event_end_date)}`
    : q.session_date
    ? formatDate(q.session_date)
    : null;

  const mktCost = q.marketing_cost ?? 0;
  const lodgCost = q.lodging_cost ?? 0;
  const mlCost = q.meal_cost ?? 0;
  const personnel = (q.additional_personnel ?? []).filter(p => p.name?.trim() || p.role?.trim());
  const personnelTotal = personnel.reduce((s, p) => s + (p.cost || 0), 0);
  const addons = (q.addons ?? []).filter(a => a.label?.trim());
  const addonsTotal = addons.reduce((s, a) => s + a.price, 0);

  const subtotalBeforeDiscount = q.suggested_price + mktCost + lodgCost + mlCost + personnelTotal + addonsTotal;
  const discount =
    q.discount_type === "percentage"
      ? subtotalBeforeDiscount * (q.discount_value / 100)
      : q.discount_type === "flat"
      ? q.discount_value
      : 0;
  const afterDiscount = subtotalBeforeDiscount - discount;
  const taxAmount = q.tax_rate > 0 ? afterDiscount * (q.tax_rate / 100) : 0;

  const paymentTerms = q.payment_terms?.trim() || biz?.payment_terms?.trim() || null;
  const businessHeader = biz?.business_name || biz?.contact_name || "";
  const coverageItems = (q.coverage_items ?? []).filter(s => s.trim());

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 14px;
          line-height: 1.5;
          color: #1c1917;
          background: #f7f5f2;
        }
        .header-band { background: #1c1917; padding: 36px 48px 32px; }
        .header-inner { max-width: 660px; margin: 0 auto; display: flex; justify-content: space-between; align-items: flex-start; }
        .biz-name { font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; color: #fff; margin-bottom: 4px; }
        .biz-contact { font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.8; }
        .logo-img { max-height: 52px; max-width: 140px; object-fit: contain; filter: brightness(0) invert(1); opacity: 0.9; }
        .page { max-width: 660px; margin: 0 auto; padding: 48px 48px 80px; background: #fff; min-height: 100vh; }
        .quote-title { font-family: 'DM Serif Display', Georgia, serif; font-size: 28px; font-weight: 400; color: #1c1917; margin-bottom: 6px; }
        .client-meta { font-size: 12px; color: rgba(28,25,23,0.45); letter-spacing: 0.04em; margin-bottom: 32px; }
        .section { margin-bottom: 32px; }
        .section-label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(28,25,23,0.35); margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid rgba(28,25,23,0.08); }
        .line { display: flex; justify-content: space-between; align-items: baseline; padding: 5px 0; font-size: 13px; color: #1c1917; }
        .line-label { color: rgba(28,25,23,0.65); }
        .line-value { font-weight: 500; }
        .line-total { display: flex; justify-content: space-between; align-items: baseline; padding: 14px 0 0; margin-top: 10px; border-top: 2px solid #1c1917; }
        .total-label { font-size: 13px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; }
        .total-value { font-size: 22px; font-weight: 600; }
        ul.coverage { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 5px; }
        ul.coverage li { font-size: 13px; color: rgba(28,25,23,0.75); padding-left: 14px; position: relative; }
        ul.coverage li::before { content: "—"; position: absolute; left: 0; color: rgba(28,25,23,0.3); }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; }
        .info-item { font-size: 13px; color: rgba(28,25,23,0.7); }
        .info-item strong { color: #1c1917; display: block; font-weight: 500; }
        .terms-block { font-size: 12px; color: rgba(28,25,23,0.55); line-height: 1.7; white-space: pre-wrap; }
        .footer { text-align: center; font-size: 11px; color: rgba(28,25,23,0.3); letter-spacing: 0.12em; margin-top: 48px; padding-top: 24px; border-top: 1px solid rgba(28,25,23,0.06); }
@media print { .no-print { display: none !important; } }
        @media (max-width: 640px) {
          .header-band { padding: 24px 24px 20px; }
          .page { padding: 32px 24px 60px; }
          .info-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="header-band">
        <div className="header-inner">
          <div>
            {isPro && biz?.logo_url ? (
              <img src={biz.logo_url} alt={businessHeader} className="logo-img" />
            ) : (
              <p className="biz-name">{businessHeader}</p>
            )}
            <p className="biz-contact">
              {biz?.contact_name && <>{biz.contact_name}<br /></>}
              {biz?.phone && <>{biz.phone}<br /></>}
              {biz?.website && <>{biz.website}</>}
            </p>
          </div>
        </div>
      </div>

      <div className="page">
        <SavePdfButton />

        <h1 className="quote-title">
          {q.event_name || q.client_name || "Photography Proposal"}
        </h1>
        <p className="client-meta">
          {[
            q.client_business || null,
            q.point_of_contact ? `Attn: ${q.point_of_contact}` : null,
            q.client_name || null,
            dateDisplay,
            q.event_location || null,
          ].filter(Boolean).join("  ·  ")}
        </p>

        {/* Session details */}
        {(sessionType || dateDisplay) && (
          <div className="section">
            <p className="section-label">Details</p>
            <div className="info-grid">
              {sessionType && (
                <div className="info-item">
                  <strong>Coverage type</strong>
                  {sessionType.name}
                </div>
              )}
              {dateDisplay && (
                <div className="info-item">
                  <strong>{isEvent && eventDays > 1 ? "Event dates" : "Date"}</strong>
                  {dateDisplay}
                </div>
              )}
              {isEvent && eventDays > 1 && (
                <div className="info-item">
                  <strong>Coverage days</strong>
                  {eventDays} days
                </div>
              )}
              {q.duration_hours > 0 && (
                <div className="info-item">
                  <strong>Hours per day</strong>
                  {q.duration_hours}h
                </div>
              )}
              {q.editing_hours > 0 && (
                <div className="info-item">
                  <strong>Post-production</strong>
                  {q.editing_hours}h total
                </div>
              )}
              {q.gallery_turnaround && (
                <div className="info-item">
                  <strong>Gallery turnaround</strong>
                  {q.gallery_turnaround}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Coverage plan */}
        {coverageItems.length > 0 && (
          <div className="section">
            <p className="section-label">Coverage Plan</p>
            <ul className="coverage">
              {coverageItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Photography team */}
        {(isEvent && personnel.length > 0) && (
          <div className="section">
            <p className="section-label">Photography Team</p>
            <ul className="coverage">
              <li>
                <strong style={{ color: "#1c1917" }}>Lead Photographer</strong>
                {biz?.contact_name ? ` — ${biz.contact_name}` : ""}
                {biz?.business_name ? ` · ${biz.business_name}` : ""}
              </li>
              {personnel.map((p, i) => (
                <li key={i}>
                  <strong style={{ color: "#1c1917" }}>{p.role || "Additional Photographer"}</strong>
                  {p.name ? ` — ${p.name}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Investment breakdown */}
        <div className="section">
          <p className="section-label">Investment</p>

          <div className="line">
            <span className="line-label">{sessionType?.name ?? "Photography coverage"}{isEvent && eventDays > 1 ? ` (${eventDays} days)` : ""}</span>
            <span className="line-value">{fmt(q.suggested_price)}</span>
          </div>

          {q.travel_miles > 0 && (
            <div className="line">
              <span className="line-label">Travel ({q.travel_miles} mi)</span>
              <span className="line-value">{fmt(sessionType ? q.travel_miles * sessionType.travel_rate_per_mile : 0)}</span>
            </div>
          )}

          {mktCost > 0 && (
            <div className="line">
              <span className="line-label">Marketing &amp; promotion</span>
              <span className="line-value">{fmt(mktCost)}</span>
            </div>
          )}

          {lodgCost > 0 && (
            <div className="line">
              <span className="line-label">Lodging</span>
              <span className="line-value">{fmt(lodgCost)}</span>
            </div>
          )}

          {mlCost > 0 && (
            <div className="line">
              <span className="line-label">Meals</span>
              <span className="line-value">{fmt(mlCost)}</span>
            </div>
          )}

          {personnel.map((p, i) => (
            <div className="line" key={i}>
              <span className="line-label">{p.role || "Additional photographer"}{p.name ? ` — ${p.name}` : ""}</span>
              <span className="line-value">{fmt(p.cost)}</span>
            </div>
          ))}

          {addons.map((a, i) => (
            <div className="line" key={i}>
              <span className="line-label">{a.label}</span>
              <span className="line-value">{fmt(a.price)}</span>
            </div>
          ))}

          {discount > 0 && (
            <div className="line" style={{ color: "#6b7c5e" }}>
              <span>Discount{q.discount_type === "percentage" ? ` (${q.discount_value}%)` : ""}</span>
              <span>–{fmt(discount)}</span>
            </div>
          )}

          {taxAmount > 0 && (
            <div className="line">
              <span className="line-label">Tax ({q.tax_rate}%)</span>
              <span className="line-value">{fmt(taxAmount)}</span>
            </div>
          )}

          <div className="line-total">
            <span className="total-label">Total Investment</span>
            <span className="total-value">{fmt(q.final_price)}</span>
          </div>
        </div>

        {/* Notes */}
        {q.notes?.trim() && (
          <div className="section">
            <p className="section-label">Notes</p>
            <p style={{ fontSize: "13px", color: "rgba(28,25,23,0.7)", lineHeight: "1.7", whiteSpace: "pre-wrap" }}>{q.notes}</p>
          </div>
        )}

        {/* Payment terms */}
        {paymentTerms && (
          <div className="section">
            <p className="section-label">Payment Terms</p>
            <p className="terms-block">{paymentTerms}</p>
          </div>
        )}

        <div className="footer">
          {isPro && biz?.website ? biz.website : "thebecomingcreative.com"} · Price My Work
        </div>
      </div>
    </>
  );
}
