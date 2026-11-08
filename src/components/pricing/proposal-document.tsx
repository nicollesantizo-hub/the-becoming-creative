"use client";

import { useState } from "react";
import { fmt } from "@/lib/pricing";
import { quoteTotals } from "@/lib/quote-math";
import type { ProposalData } from "@/lib/proposal-data";
import type { QuoteSection } from "@/lib/quote-sections";

// Renders a quote as a client-facing proposal. "share" is the live /q/[token] page,
// where the client can choose optional add-ons and accept; "print" is the PDF view.
export function ProposalDocument({ data, mode }: { data: ProposalData; mode: "share" | "print" }) {
  const accepted = data.accepted;
  const [chosen, setChosen] = useState<Set<number>>(() =>
    accepted
      ? new Set(data.optionalAddons.flatMap((a, i) => (accepted.selected.includes(a.label) ? [i] : [])))
      : new Set()
  );
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [acceptedNow, setAcceptedNow] = useState<{ name: string; at: string; total: number } | null>(null);

  const isAccepted = !!accepted || !!acceptedNow;
  const interactive = mode === "share" && !isAccepted;
  const chosenAddons = data.optionalAddons.filter((_, i) => chosen.has(i));
  const totals = quoteTotals({
    base: data.base,
    extras: data.extras,
    requiredAddons: data.requiredAddons.reduce((s, a) => s + a.price, 0),
    chosenOptionalAddons: chosenAddons.reduce((s, a) => s + a.price, 0),
    taxRate: data.taxRate,
    discountType: data.discountType,
    discountValue: data.discountValue,
  });
  const displayTotal = acceptedNow?.total ?? accepted?.total ?? totals.total;

  function toggle(i: number) {
    if (!interactive) return;
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  async function accept() {
    if (!name.trim() || !data.shareToken) return;
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/quotes/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: data.shareToken, name: name.trim(), selected: [...chosen] }),
    });
    const json = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      setError(json.error ?? "Something went wrong. Please try again.");
      return;
    }
    setAcceptedNow({ name: name.trim(), at: new Date().toISOString(), total: json.total ?? totals.total });
  }

  const visible = data.sections.filter(
    (s) =>
      s.enabled &&
      hasContent(s, data) &&
      // Once accepted, the add-ons section only lists what was chosen — skip it if nothing was.
      !(s.kind === "addons" && mode === "share" && isAccepted && chosen.size === 0)
  );
  const acceptedInfo = acceptedNow ?? accepted;

  return (
    <div className={`pp pp-${mode}`}>
      <style>{STYLES}</style>

      {/* Cover */}
      <header className={`pp-cover ${data.coverImageUrl ? "has-image" : ""} ${data.business.logoUrl ? "has-seal" : ""}`}>
        {data.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.coverImageUrl} alt="" className="pp-cover-img" />
        )}
        <div className="pp-cover-inner">
          <div className="pp-brand">
            <span>{data.business.name}</span>
          </div>
          <div>
            <p className="pp-eyebrow">A proposal</p>
            <h1 className="pp-title">{data.title}</h1>
            {data.clientLine && <p className="pp-client">{data.clientLine}</p>}
          </div>
        </div>
      </header>

      <main className={`pp-page ${data.business.logoUrl ? "has-seal" : ""}`}>
        {/* Logo seal — sits on the seam between cover and page, like a letterhead mark */}
        {data.business.logoUrl && (
          <div className="pp-seal">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.business.logoUrl} alt={data.business.name} />
          </div>
        )}
        {mode === "share" && (
          <button type="button" onClick={() => window.print()} className="pp-save no-print">
            Save PDF
          </button>
        )}

        {visible.map((section, n) => (
          <section key={section.id} className="pp-section" id={`s-${section.kind}`}>
            <div className="pp-section-head">
              <span className="pp-num">{String(n + 1).padStart(2, "0")}</span>
              <h2 className="pp-h2">{section.title}</h2>
            </div>
            {renderSection(section)}
          </section>
        ))}

        {/* Acceptance */}
        {mode === "share" && data.shareToken && (
          <section className={`pp-accept ${acceptedInfo ? "done" : ""}`} id="accept">
            {acceptedInfo ? (
              <>
                <p className="pp-eyebrow dark">Accepted</p>
                <h2 className="pp-accept-title">Thank you, {acceptedInfo.name.split(" ")[0]}.</h2>
                <p className="pp-accept-copy">
                  Accepted on{" "}
                  {new Date(acceptedInfo.at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}{" "}
                  for {fmt(displayTotal)}. {data.business.contactName || data.business.name || "Your photographer"} will be in
                  touch with your next steps.
                </p>
              </>
            ) : (
              <>
                <p className="pp-eyebrow dark">Ready to begin?</p>
                <h2 className="pp-accept-title">{fmt(totals.total)}</h2>
                <p className="pp-accept-copy">
                  Type your name below to accept this proposal
                  {chosenAddons.length > 0 ? `, including ${chosenAddons.map((a) => a.label).join(", ")}` : ""}.
                  Your contract and retainer details will follow.
                </p>
                <div className="pp-accept-row">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="pp-input"
                    aria-label="Your full name"
                  />
                  <button type="button" onClick={accept} disabled={!name.trim() || submitting} className="pp-btn">
                    {submitting ? "One moment…" : "Accept proposal"}
                  </button>
                </div>
                {error && <p className="pp-error">{error}</p>}
              </>
            )}
          </section>
        )}

        {mode === "print" && (
          <p className="pp-print-close">
            {data.shareToken
              ? `To accept, visit thebecomingcreative.com/q/${data.shareToken}`
              : "To accept this proposal, simply reply to this email."}
          </p>
        )}

        <footer className="pp-footer">
          {[data.business.contactName, data.business.phone].filter(Boolean).join("  ·  ")}
          {(data.business.contactName || data.business.phone) && <br />}
          {data.business.footer}
        </footer>
      </main>

      {/* Live total while choosing add-ons */}
      {interactive && data.optionalAddons.length > 0 && (
        <div className="pp-bar no-print">
          <div>
            <span className="pp-bar-label">Your total</span>
            <span className="pp-bar-total">{fmt(totals.total)}</span>
          </div>
          <a href="#accept" className="pp-btn small">
            Review &amp; accept
          </a>
        </div>
      )}
    </div>
  );

  function renderSection(section: QuoteSection) {
    switch (section.kind) {
      case "welcome":
        return (
          <div className="pp-welcome">
            <p>{data.notes}</p>
            {data.business.contactName && <p className="pp-sign">— {data.business.contactName}</p>}
          </div>
        );
      case "details":
        return (
          <dl className="pp-details">
            {data.details.map((d) => (
              <div key={d.label}>
                <dt>{d.label}</dt>
                <dd>{d.value}</dd>
              </div>
            ))}
          </dl>
        );
      case "included":
        return (
          <ul className="pp-list">
            {data.included.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        );
      case "coverage":
        return (
          <ul className="pp-list dash">
            {data.coverage.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        );
      case "team":
        return (
          <ul className="pp-list">
            {data.team.map((p, i) => (
              <li key={i}>
                <strong>{p.role}</strong>
                {p.name ? ` — ${p.name}` : ""}
              </li>
            ))}
          </ul>
        );
      case "investment":
        return (
          <div className="pp-invest">
            {data.breakdown.length > 0 && (
              <div className="pp-breakdown">
                {data.breakdown.map((l, i) => (
                  <div key={i} className="pp-line muted">
                    <span>{l.label}</span>
                    <span>{fmt(l.amount)}</span>
                  </div>
                ))}
              </div>
            )}
            {data.lines.map((l, i) => (
              <div key={i} className="pp-line">
                <span>{l.label}</span>
                <span>{fmt(l.amount)}</span>
              </div>
            ))}
            {chosenAddons.map((a, i) => (
              <div key={`o${i}`} className="pp-line added">
                <span>{a.label}</span>
                <span>{fmt(a.price)}</span>
              </div>
            ))}
            {totals.discount > 0 && (
              <div className="pp-line muted">
                <span>Discount{data.discountType === "percentage" ? ` (${data.discountValue}%)` : ""}</span>
                <span>−{fmt(totals.discount)}</span>
              </div>
            )}
            {totals.tax > 0 && (
              <div className="pp-line muted">
                <span>Tax ({data.taxRate}%)</span>
                <span>{fmt(totals.tax)}</span>
              </div>
            )}
            <div className="pp-total">
              <span>Total investment</span>
              <span className="pp-total-value">{fmt(displayTotal)}</span>
            </div>
            {mode === "print" && data.optionalAddons.length > 0 && !isAccepted && (
              <p className="pp-note">Optional additions are listed separately and not included in this total.</p>
            )}
          </div>
        );
      case "addons":
        return (
          <div className="pp-addons">
            {interactive && <p className="pp-note">Choose anything you&apos;d like to add. Your total updates as you go.</p>}
            {data.optionalAddons.map((a, i) => {
              const on = chosen.has(i);
              if (isAccepted && !on && mode === "share") return null;
              return (
                <label key={i} className={`pp-addon ${on ? "on" : ""} ${interactive ? "" : "static"}`}>
                  {mode === "share" && (
                    <input type="checkbox" checked={on} onChange={() => toggle(i)} disabled={!interactive} />
                  )}
                  <span className="pp-addon-body">
                    <span className="pp-addon-label">{a.label}</span>
                    {a.description && <span className="pp-addon-desc">{a.description}</span>}
                  </span>
                  <span className="pp-addon-price">+{fmt(a.price)}</span>
                </label>
              );
            })}
          </div>
        );
      case "terms":
        return <p className="pp-prose small">{data.paymentTerms}</p>;
      case "custom":
        return <p className="pp-prose">{section.body}</p>;
    }
  }
}

function hasContent(s: QuoteSection, d: ProposalData) {
  switch (s.kind) {
    case "welcome":
      return !!d.notes;
    case "details":
      return d.details.length > 0;
    case "included":
      return d.included.length > 0;
    case "coverage":
      return d.coverage.length > 0;
    case "team":
      return d.team.length > 1;
    case "investment":
      return true;
    case "addons":
      return d.optionalAddons.length > 0;
    case "terms":
      return !!d.paymentTerms;
    case "custom":
      return !!(s.title.trim() || s.body?.trim());
  }
}

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=DM+Serif+Display:ital@0;1&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #f3f1ee; }
.pp {
  --ink: #141414; --paper: #ffffff; --wash: #f3f1ee; --soft: rgba(20,20,20,0.62);
  --faint: rgba(20,20,20,0.38); --rule: rgba(20,20,20,0.1);
  font-family: 'DM Sans', system-ui, sans-serif; font-size: 15px; line-height: 1.6; color: var(--ink);
  background: var(--wash); min-height: 100vh;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.pp-cover { position: relative; background: var(--ink); color: #fff; min-height: 300px; display: flex; overflow: hidden; }
.pp-cover.has-image { min-height: min(68vh, 620px); }
.pp-cover-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.pp-cover.has-image::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.6) 100%); }
.pp-cover-inner { position: relative; z-index: 1; width: 100%; max-width: 760px; margin: 0 auto; padding: 32px 40px 44px; display: flex; flex-direction: column; justify-content: space-between; gap: 48px; }
.pp-brand { font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,255,255,0.85); }
.pp-eyebrow { font-size: 11px; letter-spacing: 0.24em; text-transform: uppercase; color: rgba(255,255,255,0.7); margin-bottom: 12px; }
.pp-eyebrow.dark { color: var(--faint); }
.pp-title { font-family: 'DM Serif Display', Georgia, serif; font-weight: 400; font-size: clamp(36px, 6vw, 60px); line-height: 1.05; letter-spacing: -0.01em; }
.pp-client { margin-top: 14px; font-size: 13px; letter-spacing: 0.06em; color: rgba(255,255,255,0.75); }

.pp-page { position: relative; max-width: 760px; margin: 0 auto; background: var(--paper); padding: 64px 72px 56px; }
.pp-page.has-seal { padding-top: 104px; }
.pp-cover.has-seal .pp-cover-inner { padding-bottom: 88px; }
.pp-seal { position: absolute; z-index: 2; top: -60px; left: 50%; transform: translateX(-50%); width: 120px; height: 120px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; padding: 9px; box-shadow: 0 0 0 1px rgba(20,20,20,0.06), 0 10px 30px -12px rgba(0,0,0,0.25); }
.pp-seal img { width: 100%; height: 100%; object-fit: contain; }
.pp-save { position: absolute; top: 20px; right: 24px; font: inherit; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; background: none; border: 1px solid var(--rule); color: var(--soft); padding: 8px 14px; cursor: pointer; }
.pp-save:hover { color: var(--ink); border-color: var(--ink); }

.pp-section { padding: 0 0 52px; }
.pp-section + .pp-section { padding-top: 44px; border-top: 1px solid var(--rule); }
.pp-section-head { display: flex; align-items: baseline; gap: 16px; margin-bottom: 22px; }
.pp-num { font-size: 11px; letter-spacing: 0.2em; color: var(--faint); font-variant-numeric: tabular-nums; }
.pp-h2 { font-family: 'DM Serif Display', Georgia, serif; font-weight: 400; font-size: 28px; line-height: 1.15; }

.pp-welcome p { font-family: 'DM Serif Display', Georgia, serif; font-style: italic; font-size: 19px; line-height: 1.7; color: rgba(20,20,20,0.82); white-space: pre-wrap; }
.pp-welcome .pp-sign { font-family: 'DM Sans', sans-serif; font-style: normal; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--faint); margin-top: 18px; }

.pp-details { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 32px; }
.pp-details dt { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--faint); margin-bottom: 3px; }
.pp-details dd { font-size: 15px; }

.pp-list { list-style: none; }
.pp-list li { padding: 11px 0; border-bottom: 1px solid var(--rule); font-size: 15px; }
.pp-list li:last-child { border-bottom: none; }
.pp-list.dash li { border: none; padding: 5px 0 5px 22px; position: relative; color: var(--soft); }
.pp-list.dash li::before { content: "—"; position: absolute; left: 0; color: var(--faint); }
.pp-list strong { font-weight: 500; }

.pp-breakdown { margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed var(--rule); }
.pp-line { display: flex; justify-content: space-between; gap: 24px; padding: 7px 0; font-size: 15px; }
.pp-line span:last-child { font-variant-numeric: tabular-nums; white-space: nowrap; }
.pp-line.muted { color: var(--soft); font-size: 14px; }
.pp-line.added span:first-child::after { content: "added"; margin-left: 10px; font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--faint); }
.pp-total { display: flex; justify-content: space-between; align-items: baseline; margin-top: 14px; padding-top: 18px; border-top: 1.5px solid var(--ink); font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; }
.pp-total-value { font-family: 'DM Serif Display', Georgia, serif; font-size: 36px; letter-spacing: 0; text-transform: none; font-variant-numeric: tabular-nums; }
.pp-note { font-size: 13px; color: var(--faint); margin: 4px 0 14px; }

.pp-addons { display: flex; flex-direction: column; gap: 10px; }
.pp-addon { display: flex; align-items: flex-start; gap: 14px; padding: 18px 20px; border: 1px solid var(--rule); cursor: pointer; transition: border-color .15s, background .15s; }
.pp-addon:hover:not(.static) { border-color: rgba(20,20,20,0.35); }
.pp-addon.on { border-color: var(--ink); background: #faf9f7; }
.pp-addon.static { cursor: default; }
.pp-addon input { margin-top: 4px; width: 16px; height: 16px; accent-color: var(--ink); flex-shrink: 0; }
.pp-addon-body { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.pp-addon-label { font-size: 15px; font-weight: 500; }
.pp-addon-desc { font-size: 13px; color: var(--soft); line-height: 1.55; }
.pp-addon-price { font-size: 15px; font-variant-numeric: tabular-nums; white-space: nowrap; }

.pp-prose { font-size: 15px; line-height: 1.75; color: rgba(20,20,20,0.78); white-space: pre-wrap; }
.pp-prose.small { font-size: 13px; color: var(--soft); }

.pp-accept { margin: 12px -72px 0; padding: 64px 72px; background: var(--ink); color: #fff; text-align: center; }
.pp-accept .pp-eyebrow.dark { color: rgba(255,255,255,0.5); }
.pp-accept .pp-accept-copy { color: rgba(255,255,255,0.7); }
.pp-accept .pp-input { border-color: rgba(255,255,255,0.25); background: transparent; color: #fff; }
.pp-accept .pp-input::placeholder { color: rgba(255,255,255,0.4); }
.pp-accept .pp-input:focus { border-color: #fff; }
.pp-accept .pp-btn { background: #fff; color: var(--ink); }
.pp-accept .pp-error { color: #f0a597; }
.pp-accept-title { font-family: 'DM Serif Display', Georgia, serif; font-weight: 400; font-size: 44px; line-height: 1.1; margin-bottom: 14px; }
.pp-accept-copy { max-width: 460px; margin: 0 auto 28px; font-size: 14px; color: var(--soft); }
.pp-accept-row { display: flex; gap: 10px; max-width: 480px; margin: 0 auto; }
.pp-input { flex: 1; min-width: 0; font: inherit; font-size: 15px; padding: 13px 16px; border: 1px solid rgba(20,20,20,0.2); background: #fff; color: var(--ink); outline: none; }
.pp-input:focus { border-color: var(--ink); }
.pp-btn { font: inherit; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; background: var(--ink); color: #fff; border: none; padding: 14px 24px; cursor: pointer; text-decoration: none; white-space: nowrap; display: inline-flex; align-items: center; }
.pp-btn:disabled { opacity: 0.35; cursor: default; }
.pp-btn.small { padding: 11px 18px; }
.pp-error { margin-top: 12px; font-size: 13px; color: #a3392b; }

.pp-print-close { margin-top: 8px; font-size: 12px; color: var(--soft); text-align: center; }
.pp-footer { margin-top: 48px; padding-top: 22px; border-top: 1px solid var(--rule); text-align: center; font-size: 11px; letter-spacing: 0.12em; color: var(--faint); line-height: 1.9; }

.pp-bar { position: sticky; bottom: 0; z-index: 10; max-width: 760px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 14px 24px; background: rgba(20,20,20,0.96); color: #fff; }
.pp-bar-label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.55); margin-right: 12px; }
.pp-bar-total { font-family: 'DM Serif Display', Georgia, serif; font-size: 24px; font-variant-numeric: tabular-nums; }
.pp-bar .pp-btn { background: #fff; color: var(--ink); }

@media (max-width: 640px) {
  .pp-cover-inner { padding: 24px 20px 32px; }
  .pp-page { padding: 48px 20px 40px; }
  .pp-save { top: 12px; right: 16px; }
  .pp-page.has-seal { padding-top: 80px; }
  .pp-seal { width: 92px; height: 92px; top: -46px; padding: 7px; }
  .pp-details { grid-template-columns: 1fr; }
  .pp-accept { margin: 8px -20px 0; padding: 44px 20px; }
  .pp-accept-row { flex-direction: column; }
  .pp-accept-title { font-size: 36px; }
  .pp-bar { padding: 12px 16px; }
  .pp-bar-label { display: block; margin: 0 0 2px; }
}

.pp-print .pp-page { padding-top: 48px; }
@media print {
  html, body, .pp { background: #fff !important; }
  .no-print { display: none !important; }
  .pp-cover { min-height: 220px !important; }
  .pp-cover.has-image { min-height: 300px !important; }
  .pp-page { padding: 36px 8px 24px; max-width: none; }
  .pp-page.has-seal { padding-top: 76px; }
  .pp-seal { width: 96px; height: 96px; top: -48px; box-shadow: 0 0 0 1px rgba(20,20,20,0.08); }
  .pp-section { padding-bottom: 28px; }
  .pp-section-head { break-after: avoid; }
  .pp-line, .pp-addon, .pp-list li, .pp-details > div, .pp-total { break-inside: avoid; }
  .pp-section + .pp-section { padding-top: 24px; }
  .pp-accept:not(.done) { display: none; }
  .pp-accept { margin: 0; padding: 24px; background: #fff; color: var(--ink); border-top: 1px solid var(--rule); }
  .pp-accept .pp-accept-copy { color: var(--soft); }
  .pp-addon { padding: 10px 14px; }
  .pp-footer { margin-top: 20px; padding-top: 12px; }
  .pp-print-close { margin-top: 0; }
}
`;
