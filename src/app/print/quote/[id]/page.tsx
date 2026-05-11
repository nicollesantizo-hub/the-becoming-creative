import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import type { Quote, SessionType } from "@/types/pricing";
import { fmt } from "@/lib/pricing";
import { PrintTrigger } from "./print-trigger";

export default async function QuotePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const [{ data: quote }, { data: profile }] = await Promise.all([
    supabase.from("quotes").select("*").eq("id", id).eq("user_id", user.id).single(),
    supabase
      .from("profiles")
      .select("business_name, contact_name, phone, website, tier, logo_url, payment_terms")
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
    tier: string | null;
    logo_url: string | null;
    payment_terms: string | null;
  } | null;

  let sessionType: SessionType | null = null;
  if (q.session_type_id) {
    const { data: st } = await supabase
      .from("session_types")
      .select("*")
      .eq("id", q.session_type_id)
      .single();
    sessionType = st as SessionType | null;
  }

  const isPro = biz?.tier === "pro";
  const hasBreakdown = sessionType !== null;
  const isEventQuote = q.location_type === "event" && sessionType !== null;
  const eventDays = q.event_days && q.event_days > 1 ? q.event_days : 1;

  const shootingCost = sessionType ? (sessionType.shooting_hourly_rate ?? 0) * q.duration_hours * eventDays : 0;
  const editingCost = sessionType ? (sessionType.editing_hourly_rate ?? 0) * q.editing_hours : 0;
  const studioCost = sessionType ? (sessionType.studio_hourly_rate ?? 0) * q.duration_hours * eventDays : 0;
  const travelCost = sessionType ? q.travel_miles * sessionType.travel_rate_per_mile : 0;
  const mktCost = q.marketing_cost ?? 0;
  const lodgCost = q.lodging_cost ?? 0;
  const mlCost = q.meal_cost ?? 0;
  const personnel = (q.additional_personnel ?? []).filter(p => p.name?.trim() || p.role?.trim());
  const personnelTotal = personnel.reduce((s, p) => s + (p.cost || 0), 0);

  const addonsTotal = (q.addons ?? []).reduce((s, a) => s + a.price, 0);
  const discount =
    q.discount_type === "percentage"
      ? (q.suggested_price + mktCost + lodgCost + mlCost + personnelTotal + addonsTotal) * (q.discount_value / 100)
      : q.discount_type === "flat"
      ? q.discount_value
      : 0;
  const afterDiscount = q.suggested_price + mktCost + lodgCost + mlCost + personnelTotal + addonsTotal - discount;
  const taxAmount = q.tax_rate > 0 ? afterDiscount * (q.tax_rate / 100) : 0;

  const businessHeader = biz?.business_name || biz?.contact_name || user.email;
  const contactLine = [biz?.contact_name, biz?.phone].filter(Boolean).join("  ·  ");
  const pdfTitle = q.client_name ? `Quote — ${q.client_name}` : q.quote_name || "Quote";
  const paymentTerms = q.payment_terms?.trim() || biz?.payment_terms?.trim() || null;

  const formattedDate = q.created_at
    ? new Date(q.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "";

  function formatSessionDate(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }
  const sessionDateDisplay = q.session_date && q.event_end_date
    ? `${formatSessionDate(q.session_date)} – ${formatSessionDate(q.event_end_date)}`
    : q.session_date
    ? formatSessionDate(q.session_date)
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
          color: #1c1917;
          background: #ffffff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* ── Header band ── */
        .header-band {
          background: #1c1917;
          padding: 36px 48px 32px;
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
          font-size: 15px;
          font-weight: 500;
          color: #ffffff;
          margin-bottom: 6px;
        }

        .biz-contact {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          line-height: 1.8;
        }

        .meta-right { text-align: right; }

        .meta-label {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 5px;
        }

        .meta-date {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
        }

        /* ── Page content ── */
        .page {
          max-width: 660px;
          margin: 0 auto;
          padding: 48px 48px 64px;
        }

        .back {
          display: inline-block;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #1c1917;
          opacity: 0.3;
          text-decoration: none;
          margin-bottom: 40px;
        }
        .back:hover { opacity: 0.6; }

        /* ── Quote title ── */
        .quote-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 40px;
          font-style: italic;
          font-weight: 400;
          color: #1c1917;
          line-height: 1.1;
          margin-bottom: 10px;
        }

        .client-meta {
          font-size: 13px;
          color: #1c1917;
          opacity: 0.4;
          margin-bottom: 44px;
        }

        /* ── Section label ── */
        .section-label {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #1c1917;
          opacity: 0.28;
          margin-bottom: 12px;
        }

        /* ── What's included ── */
        .included {
          margin-bottom: 40px;
          padding: 24px 28px;
          background: #f7f4f0;
          border-left: 2px solid #e0d9d0;
        }

        .included-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .included-list li {
          font-size: 13px;
          color: #1c1917;
          opacity: 0.7;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .included-list li::before {
          content: '';
          display: inline-block;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #c4b8a8;
          flex-shrink: 0;
        }

        /* ── Items table ── */
        .items {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 0;
        }

        .items tr {
          border-bottom: 1px solid #f0ece6;
        }

        .items tr:last-child {
          border-bottom: none;
        }

        .items td {
          padding: 12px 0;
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

        .items tr.addons-header td {
          padding-top: 20px;
          padding-bottom: 4px;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          opacity: 0.25;
          border-bottom: none;
        }

        .discount-row td { color: #9b7a6a; }

        /* ── Total ── */
        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1.5px solid #1c1917;
        }

        .total-label {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          opacity: 0.35;
        }

        .total-amount {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 48px;
          font-style: italic;
          font-weight: 400;
          color: #1c1917;
          line-height: 1;
        }

        /* ── Notes ── */
        .notes { margin-top: 44px; }

        .notes-body {
          font-size: 13px;
          line-height: 1.7;
          color: #1c1917;
          opacity: 0.65;
          white-space: pre-wrap;
        }

        /* ── Terms ── */
        .terms { margin-top: 44px; }

        .terms-body {
          font-size: 12px;
          line-height: 1.8;
          color: #1c1917;
          opacity: 0.45;
          white-space: pre-wrap;
        }

        /* ── Signature ── */
        .signature {
          margin-top: 44px;
          padding-top: 28px;
          border-top: 1px solid #ede8e2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .signature-text {
          font-size: 13px;
          color: #1c1917;
          opacity: 0.5;
          font-style: italic;
          font-family: 'DM Serif Display', Georgia, serif;
        }

        .signature-name {
          font-size: 12px;
          color: #1c1917;
          opacity: 0.35;
          text-align: right;
        }

        /* ── Footer ── */
        .footer {
          margin-top: 56px;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #1c1917;
          opacity: 0.15;
          text-align: center;
        }

        @media print {
          .back { display: none; }
          .header-band { margin: 0; }
        }
      `}</style>

      {/* Dark header band */}
      <div className="header-band">
        <div className="header-inner">
          <div>
            {isPro && biz?.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={biz.logo_url}
                alt="Logo"
                style={{ maxHeight: "44px", maxWidth: "150px", objectFit: "contain", marginBottom: "12px", display: "block" }}
              />
            )}
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
      </div>

      <div className="page">
        <a href="/pricing/quotes" className="back">← Back to quotes</a>

        {/* Title + client */}
        <h1 className="quote-title">{q.event_name || q.client_name || "Quote"}</h1>
        <p className="client-meta">
          {[q.event_name || null, q.client_business || null, q.client_name || null, q.client_email || null, sessionDateDisplay].filter(Boolean).join("  ·  ")}
        </p>

        {q.notes && (
          <div className="notes" style={{ marginTop: "20px" }}>
            <div className="notes-body">{q.notes}</div>
          </div>
        )}

        {/* Location + point of contact — events only */}
        {(q.event_location || q.point_of_contact) && (
          <p style={{ fontSize: "12px", color: "#1c1917", opacity: 0.45, marginBottom: "36px", marginTop: "-32px", lineHeight: 1.9 }}>
            {q.event_location && <>{q.event_location}<br /></>}
            {q.point_of_contact && <>{q.point_of_contact}</>}
          </p>
        )}

        {/* What's included */}
        {hasBreakdown && (
          <div className="included">
            <p className="section-label" style={{ marginBottom: "14px" }}>What&apos;s included</p>
            <ul className="included-list">
              {/* Event date range */}
              {isEventQuote && sessionDateDisplay && (
                <li>
                  {q.event_end_date ? `Event dates — ${sessionDateDisplay}` : `Event date — ${sessionDateDisplay}`}
                </li>
              )}
              {/* Shooting — show per-day × days for multi-day events */}
              {q.duration_hours > 0 && (
                <li>
                  {isEventQuote && eventDays > 1
                    ? `Coverage — ${q.duration_hours}h/day × ${eventDays} days`
                    : `Shooting — ${q.duration_hours} ${q.duration_hours === 1 ? "hour" : "hours"}`}
                </li>
              )}
              {q.editing_hours > 0 && (
                <li>Post-production — {q.editing_hours} {q.editing_hours === 1 ? "hour" : "hours"} total</li>
              )}
              {studioCost > 0 && <li>Studio rental</li>}
              {travelCost > 0 && <li>Travel</li>}
              {mktCost > 0 && <li>Marketing & advertising</li>}
              {lodgCost > 0 && <li>Lodging</li>}
              {mlCost > 0 && <li>Meals & per diem</li>}
              <li>
                Private gallery delivery
                {q.gallery_turnaround ? ` — within ${q.gallery_turnaround}` : ""}
              </li>
            </ul>
          </div>
        )}

        {/* Photography team — event only */}
        {isEventQuote && (
          <div style={{ marginBottom: "40px" }}>
            <p className="section-label" style={{ marginBottom: "12px" }}>Photography Team</p>
            <ul className="included-list">
              <li>
                <strong style={{ fontWeight: 500 }}>Lead Photographer</strong>
                {" — "}
                {[biz?.contact_name, biz?.business_name].filter(Boolean).join(" · ") || user.email}
                {biz?.phone ? `  ·  ${biz.phone}` : ""}
              </li>
              {personnel.map((p, i) => (
                <li key={i}>
                  <strong style={{ fontWeight: 500 }}>{p.role || "Additional Photographer"}</strong>
                  {p.name ? ` — ${p.name}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Coverage plan — event only */}
        {isEventQuote && (q.coverage_items ?? []).filter(s => s.trim()).length > 0 && (
          <div style={{ marginBottom: "40px" }}>
            <p className="section-label" style={{ marginBottom: "12px" }}>Coverage Plan</p>
            <ul className="included-list">
              {(q.coverage_items ?? []).filter(s => s.trim()).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Pricing */}
        <p className="section-label">{isEventQuote ? "Cost Breakdown" : "Pricing"}</p>
        <table className="items">
          <tbody>
            {isEventQuote ? (
              <>
                {/* Event full breakdown */}
                {(shootingCost > 0 || editingCost > 0) && (
                  <tr className="addons-header">
                    <td colSpan={2}>Labor</td>
                  </tr>
                )}
                {shootingCost > 0 && (
                  <tr>
                    <td className="label-col">
                      Coverage — ${sessionType!.shooting_hourly_rate}/hr
                      {eventDays > 1
                        ? ` × ${q.duration_hours}h/day × ${eventDays} days`
                        : ` × ${q.duration_hours}h`}
                    </td>
                    <td className="amount">{fmt(shootingCost)}</td>
                  </tr>
                )}
                {editingCost > 0 && (
                  <tr>
                    <td className="label-col">
                      Post-production — ${sessionType!.editing_hourly_rate}/hr × {q.editing_hours}h total
                    </td>
                    <td className="amount">{fmt(editingCost)}</td>
                  </tr>
                )}

                {(studioCost > 0 || travelCost > 0 || mktCost > 0) && (
                  <tr className="addons-header">
                    <td colSpan={2}>Costs</td>
                  </tr>
                )}
                {studioCost > 0 && (
                  <tr>
                    <td className="label-col">
                      Studio rental — ${sessionType!.studio_hourly_rate}/hr
                      {eventDays > 1
                        ? ` × ${q.duration_hours}h/day × ${eventDays} days`
                        : ` × ${q.duration_hours}h`}
                    </td>
                    <td className="amount">{fmt(studioCost)}</td>
                  </tr>
                )}
                {travelCost > 0 && (
                  <tr>
                    <td className="label-col">
                      Travel — {q.travel_miles} mi × ${sessionType!.travel_rate_per_mile}/mi
                    </td>
                    <td className="amount">{fmt(travelCost)}</td>
                  </tr>
                )}
                {mktCost > 0 && (
                  <tr>
                    <td className="label-col">Marketing & advertising</td>
                    <td className="amount">{fmt(mktCost)}</td>
                  </tr>
                )}
                {lodgCost > 0 && (
                  <tr>
                    <td className="label-col">Lodging</td>
                    <td className="amount">{fmt(lodgCost)}</td>
                  </tr>
                )}
                {mlCost > 0 && (
                  <tr>
                    <td className="label-col">Meals & per diem</td>
                    <td className="amount">{fmt(mlCost)}</td>
                  </tr>
                )}
                {personnel.filter(p => p.cost > 0).map((p, i) => (
                  <tr key={i}>
                    <td className="label-col">
                      {p.role || "Additional photographer"}{p.name ? ` — ${p.name}` : ""}
                    </td>
                    <td className="amount">{fmt(p.cost)}</td>
                  </tr>
                ))}

                <tr className="addons-header">
                  <td colSpan={2}>&nbsp;</td>
                </tr>
                <tr>
                  <td className="label-col">
                    {sessionType?.name ?? "Event coverage"} (incl. overhead)
                  </td>
                  <td className="amount">{fmt(q.suggested_price)}</td>
                </tr>
              </>
            ) : (
              <tr>
                <td className="label-col">
                  {sessionType?.name ?? "Session fee"}
                </td>
                <td className="amount">{fmt(q.suggested_price)}</td>
              </tr>
            )}

            {/* Add-ons */}
            {(q.addons ?? []).length > 0 && (
              <>
                <tr className="addons-header">
                  <td colSpan={2}>Add-ons</td>
                </tr>
                {(q.addons ?? []).map((addon, i) => (
                  <tr key={i}>
                    <td className="label-col">{addon.label}</td>
                    <td className="amount">{fmt(addon.price)}</td>
                  </tr>
                ))}
              </>
            )}

            {/* Discount */}
            {discount > 0 && (
              <tr className="discount-row">
                <td>
                  Discount{q.discount_type === "percentage" ? ` (${q.discount_value}%)` : ""}
                </td>
                <td className="amount">−{fmt(discount)}</td>
              </tr>
            )}

            {/* Tax */}
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


        {/* Payment terms */}
        {paymentTerms && (
          <div className="terms">
            <p className="section-label">Payment terms</p>
            <p className="terms-body">{paymentTerms}</p>
          </div>
        )}

        {/* Signature / acceptance */}
        <div className="signature">
          <p className="signature-text">
            To confirm this quote, simply reply to this email.
          </p>
          <p className="signature-name">
            {(biz?.contact_name || biz?.business_name) && (
              <>{biz?.contact_name || biz?.business_name}<br /></>
            )}
            {user.email}
          </p>
        </div>

        <div className="footer">
          {isPro && biz?.website ? biz.website : "thebecomingcreative.com"} · Price My Work
        </div>
      </div>
    </>
  );
}
