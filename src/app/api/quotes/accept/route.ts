import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { getResend, FROM } from "@/lib/resend";
import { fmt } from "@/lib/pricing";
import { quoteMoney } from "@/lib/proposal-data";
import { quoteTotals } from "@/lib/quote-math";
import type { Quote } from "@/types/pricing";

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export async function POST(request: Request) {
  const { token, name, selected } = await request.json();

  if (!token || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Please type your name to accept." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: quoteData } = await supabase.from("quotes").select("*").eq("share_token", token).single();
  if (!quoteData) return NextResponse.json({ error: "We couldn't find this proposal." }, { status: 404 });
  const q = quoteData as Quote;

  // Recompute from the saved quote — the browser only tells us which add-ons were chosen.
  const money = quoteMoney(q);
  const picks = new Set<number>(Array.isArray(selected) ? selected.filter((n) => Number.isInteger(n)) : []);
  const chosen = money.optionalAddons.filter((_, i) => picks.has(i));
  const { total } = quoteTotals({
    base: money.base,
    extras: money.extras,
    requiredAddons: money.requiredAddons.reduce((s, a) => s + a.price, 0),
    chosenOptionalAddons: chosen.reduce((s, a) => s + a.price, 0),
    taxRate: q.tax_rate ?? 0,
    discountType: q.discount_type,
    discountValue: q.discount_value ?? 0,
  });

  const acceptedName = name.trim().slice(0, 120);

  // Only lands if the proposal hasn't already been accepted.
  const { data: updated, error } = await supabase
    .from("quotes")
    .update({
      status: "accepted",
      accepted_name: acceptedName,
      accepted_at: new Date().toISOString(),
      accepted_total: total,
      selected_addons: chosen.map((a) => ({ label: a.label, price: a.price })),
    })
    .eq("id", q.id!)
    .is("accepted_at", null)
    .select("id")
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: "This proposal has already been accepted." }, { status: 409 });
  }

  // Let the photographer know. A failed email never undoes the acceptance.
  try {
    const { data: owner } = await supabase.auth.admin.getUserById(q.user_id!);
    const to = owner?.user?.email;
    if (to) {
      const title = q.event_name || q.quote_name || q.client_name || "your proposal";
      await getResend().emails.send({
        from: FROM,
        to,
        ...(q.client_email?.trim() ? { replyTo: q.client_email.trim() } : {}),
        subject: `${acceptedName} accepted ${title}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #2c2c2c;">
            <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.4; margin-bottom: 24px;">Proposal accepted</p>
            <h1 style="font-size: 28px; font-weight: 300; font-style: italic; margin-bottom: 18px; line-height: 1.2;">
              ${escapeHtml(acceptedName)} said yes.
            </h1>
            <p style="font-size: 14px; line-height: 1.7; opacity: 0.8; margin-bottom: 8px;">
              ${escapeHtml(title)} — <strong>${fmt(total)}</strong>
            </p>
            ${
              chosen.length
                ? `<p style="font-size: 14px; line-height: 1.7; opacity: 0.8; margin-bottom: 8px;">They added: ${chosen
                    .map((a) => `${escapeHtml(a.label)} (${fmt(a.price)})`)
                    .join(", ")}</p>`
                : ""
            }
            <p style="font-size: 14px; line-height: 1.7; opacity: 0.8; margin: 20px 0 28px;">
              A lovely moment to send their contract and retainer while the excitement is fresh.
            </p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/pricing/contracts" style="display: inline-block; background: #111111; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; font-family: 'DM Sans', sans-serif;">
              Prepare their contract
            </a>
          </div>
        `,
      });
    }
  } catch (e) {
    console.error("Quote accepted, but notification email failed", e);
  }

  return NextResponse.json({ ok: true, total });
}
