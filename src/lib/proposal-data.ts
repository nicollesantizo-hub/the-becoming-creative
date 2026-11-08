// Server-only: shapes a saved quote into exactly what a client may see. The proposal
// page is interactive, so whatever lands here ends up in the browser — keep internal
// numbers (minimum price, margins, hourly rates unless shown on purpose) out.

import type { Quote, SessionType } from "@/types/pricing";
import { normalizeSections, type QuoteSection } from "@/lib/quote-sections";

export interface ProposalBusiness {
  name: string;
  contactName: string | null;
  phone: string | null;
  website: string | null;
  logoUrl: string | null;
  footer: string;
}

export interface ProposalLine {
  label: string;
  amount: number;
}

export interface ProposalAddon {
  label: string;
  price: number;
  description?: string;
}

export interface ProposalData {
  title: string;
  clientLine: string;
  coverImageUrl: string | null;
  notes: string;
  sections: QuoteSection[];
  details: { label: string; value: string }[];
  included: string[];
  coverage: string[];
  team: { role: string; name: string }[];
  breakdown: ProposalLine[]; // informational hourly detail, shown above the session line
  lines: ProposalLine[]; // priced lines that make up base + extras + required add-ons
  requiredAddons: ProposalAddon[];
  optionalAddons: ProposalAddon[];
  base: number;
  extras: number;
  taxRate: number;
  discountType: "percentage" | "flat" | null;
  discountValue: number;
  paymentTerms: string | null;
  shareToken: string | null;
  canAccept: boolean; // online acceptance is a Pro feature
  accepted: { name: string; at: string; total: number; selected: string[] } | null;
  business: ProposalBusiness;
}

interface BizRow {
  business_name: string | null;
  contact_name: string | null;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  payment_terms: string | null;
  tier: string | null;
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// The pieces every total is built from — shared with the accept route so the server
// recomputes the client's total itself instead of trusting the browser.
export function quoteMoney(q: Quote) {
  const personnel = (q.additional_personnel ?? []).filter((p) => p.name?.trim() || p.role?.trim());
  const extras =
    (q.marketing_cost ?? 0) +
    (q.lodging_cost ?? 0) +
    (q.meal_cost ?? 0) +
    personnel.reduce((s, p) => s + (p.cost || 0), 0);
  const addons = (q.addons ?? []).filter((a) => a.label?.trim());
  const toAddon = (a: (typeof addons)[number]): ProposalAddon => ({
    label: a.label.trim(),
    price: a.price || 0,
    ...(a.description?.trim() ? { description: a.description.trim() } : {}),
  });
  return {
    base: q.suggested_price ?? 0,
    extras,
    personnel,
    requiredAddons: addons.filter((a) => !a.optional).map(toAddon),
    optionalAddons: addons.filter((a) => a.optional).map(toAddon),
  };
}

export function buildProposal(q: Quote, biz: BizRow | null, sessionType: SessionType | null): ProposalData {
  const isPro = biz?.tier === "pro";
  const isEvent = q.location_type === "event";
  const eventDays = q.event_days && q.event_days > 1 ? q.event_days : 1;
  const money = quoteMoney(q);
  const sections = normalizeSections(q.sections);
  const investment = sections.find((s) => s.kind === "investment");
  const showDetailed = investment?.detailed ?? isEvent;

  const dateDisplay =
    q.session_date && q.event_end_date
      ? `${formatDate(q.session_date)} – ${formatDate(q.event_end_date)}`
      : q.session_date
      ? formatDate(q.session_date)
      : null;

  const details: { label: string; value: string }[] = [];
  if (sessionType) details.push({ label: isEvent ? "Coverage" : "Session", value: sessionType.name });
  if (dateDisplay) details.push({ label: eventDays > 1 ? "Dates" : "Date", value: dateDisplay });
  if (q.event_location) details.push({ label: "Location", value: q.event_location });
  if (isEvent && eventDays > 1) details.push({ label: "Coverage days", value: `${eventDays} days` });
  if (q.duration_hours > 0)
    details.push({ label: isEvent ? "Hours per day" : "Session length", value: `${q.duration_hours} ${q.duration_hours === 1 ? "hour" : "hours"}` });
  if (q.gallery_turnaround) details.push({ label: "Gallery delivery", value: `Within ${q.gallery_turnaround}` });
  if (q.point_of_contact) details.push({ label: "Point of contact", value: q.point_of_contact });

  const customIncluded = (q.included_items ?? []).filter((i) => i.text?.trim());
  const customPriced = customIncluded.filter((i) => (i.price ?? 0) > 0);

  // Priced lines
  const lines: ProposalLine[] = [];
  const breakdown: ProposalLine[] = [];
  const sessionLabel = `${sessionType?.name ?? "Photography coverage"}${isEvent && eventDays > 1 ? ` (${eventDays} days)` : ""}`;
  if (customPriced.length > 0) {
    customPriced.forEach((i) => lines.push({ label: i.text.trim(), amount: i.price! }));
  } else {
    if (showDetailed && isEvent && sessionType) {
      const perDay = eventDays > 1 ? `${q.duration_hours}h/day × ${eventDays} days` : `${q.duration_hours}h`;
      const shoot = (sessionType.shooting_hourly_rate ?? 0) * q.duration_hours * eventDays;
      const edit = (sessionType.editing_hourly_rate ?? 0) * q.editing_hours;
      const studio = (sessionType.studio_hourly_rate ?? 0) * q.duration_hours * eventDays;
      const travel = q.travel_miles * (sessionType.travel_rate_per_mile ?? 0);
      if (shoot > 0) breakdown.push({ label: `Coverage — $${sessionType.shooting_hourly_rate}/hr × ${perDay}`, amount: shoot });
      if (edit > 0) breakdown.push({ label: `Post-production — $${sessionType.editing_hourly_rate}/hr × ${q.editing_hours}h`, amount: edit });
      if (studio > 0) breakdown.push({ label: `Studio — $${sessionType.studio_hourly_rate}/hr × ${perDay}`, amount: studio });
      if (travel > 0) breakdown.push({ label: `Travel — ${q.travel_miles} mi`, amount: travel });
    }
    lines.push({ label: sessionLabel, amount: money.base });
  }
  if ((q.marketing_cost ?? 0) > 0) lines.push({ label: "Marketing & promotion", amount: q.marketing_cost! });
  if ((q.lodging_cost ?? 0) > 0) lines.push({ label: "Lodging", amount: q.lodging_cost! });
  if ((q.meal_cost ?? 0) > 0) lines.push({ label: "Meals & per diem", amount: q.meal_cost! });
  money.personnel
    .filter((p) => p.cost > 0)
    .forEach((p) => lines.push({ label: `${p.role || "Additional photographer"}${p.name ? ` — ${p.name}` : ""}`, amount: p.cost }));
  money.requiredAddons.forEach((a) => lines.push({ label: a.label, amount: a.price }));

  const included =
    customIncluded.length > 0
      ? customIncluded.map((i) => i.text.trim())
      : [
          q.duration_hours > 0
            ? isEvent && eventDays > 1
              ? `Coverage — ${q.duration_hours}h/day × ${eventDays} days`
              : `Photography — ${q.duration_hours} ${q.duration_hours === 1 ? "hour" : "hours"}`
            : null,
          q.editing_hours > 0 ? "Thoughtful editing and post-production" : null,
          `Private online gallery${q.gallery_turnaround ? `, delivered within ${q.gallery_turnaround}` : ""}`,
        ].filter((x): x is string => !!x);

  const businessName = biz?.business_name || biz?.contact_name || "";
  const namedTitle = q.event_name;
  const clientLine = [q.client_business || null, namedTitle ? q.client_name || null : null]
    .filter(Boolean)
    .join("  ·  ");

  return {
    title: namedTitle || (q.client_name ? `For ${q.client_name}` : "Your proposal"),
    clientLine,
    coverImageUrl: q.cover_image_url || null,
    notes: q.notes?.trim() ?? "",
    sections,
    details,
    included,
    coverage: (q.coverage_items ?? []).filter((s) => s.trim()),
    team: isEvent
      ? [
          { role: "Lead Photographer", name: [biz?.contact_name, biz?.business_name].filter(Boolean).join(" · ") },
          ...money.personnel.map((p) => ({ role: p.role || "Additional Photographer", name: p.name || "" })),
        ]
      : [],
    breakdown,
    lines,
    requiredAddons: money.requiredAddons,
    optionalAddons: isPro ? money.optionalAddons : [],
    base: money.base,
    extras: money.extras,
    taxRate: q.tax_rate ?? 0,
    discountType: q.discount_type,
    discountValue: q.discount_value ?? 0,
    paymentTerms: q.payment_terms?.trim() || biz?.payment_terms?.trim() || null,
    shareToken: q.share_token ?? null,
    canAccept: isPro,
    accepted: q.accepted_at
      ? {
          name: q.accepted_name ?? "",
          at: q.accepted_at,
          total: q.accepted_total ?? q.final_price,
          selected: (q.selected_addons ?? []).map((a) => a.label),
        }
      : null,
    business: {
      name: businessName,
      contactName: biz?.contact_name ?? null,
      phone: biz?.phone ?? null,
      website: biz?.website ?? null,
      logoUrl: isPro ? biz?.logo_url ?? null : null,
      footer: `${isPro && biz?.website ? biz.website : "thebecomingcreative.com"} · Price My Work`,
    },
  };
}
