// Server-only: turns a monthly series into this month's invoice. Used by the daily
// cron and by the "Send now" button.

import type { SupabaseClient } from "@supabase/supabase-js";
import { getResend, FROM } from "@/lib/resend";
import { sendInvoiceEmail, type InvoiceBiz } from "@/lib/invoice-email";
import { addDays, fillMonth, formatLongDate, genInvoiceNumber, nextMonthlyDate } from "@/lib/invoices";
import type { Invoice, InvoiceSeries } from "@/types/pricing";

const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export async function issueFromSeries(
  supabase: SupabaseClient,
  series: InvoiceSeries,
  issueDate: string,
  opts: { advanceFrom: string }
): Promise<{ invoice: Invoice; sent: boolean } | null> {
  // Monthly invoices are a Pro feature; a lapsed plan quietly pauses them.
  const { data: ownerPlan } = await supabase.from("profiles").select("tier").eq("id", series.user_id!).single();
  if (ownerPlan?.tier !== "pro") return null;

  // Claim this run first: only one caller can move next_run_date off its current
  // value, so a retried cron (or a double click) can't issue the same month twice.
  const nextRun = nextMonthlyDate(opts.advanceFrom, series.day_of_month);
  const { data: claimed } = await supabase
    .from("invoice_series")
    .update({ next_run_date: nextRun, last_issued_at: new Date().toISOString() })
    .eq("id", series.id!)
    .eq("next_run_date", series.next_run_date)
    .select("id")
    .single();
  if (!claimed) return null;

  const [{ data: profile }, { data: owner }] = await Promise.all([
    supabase.from("profiles").select("business_name, contact_name, phone, website, logo_url, tier").eq("id", series.user_id!).single(),
    supabase.auth.admin.getUserById(series.user_id!),
  ]);
  const ownerEmail = owner?.user?.email;
  const biz = profile as InvoiceBiz | null;

  const { data: created, error } = await supabase
    .from("invoices")
    .insert({
      user_id: series.user_id,
      series_id: series.id,
      invoice_number: genInvoiceNumber(new Date(issueDate + "T12:00:00")),
      client_name: series.client_name,
      client_business: series.client_business || null,
      client_email: series.client_email,
      session_name: fillMonth(series.title, issueDate),
      line_items: series.line_items,
      deposit_amount: 0,
      notes: series.notes ?? "",
      payment_method: series.payment_method ?? null,
      payment_link: series.payment_link ?? null,
      payment_instructions: series.payment_instructions ?? null,
      due_date: addDays(issueDate, series.due_days),
      status: series.auto_send ? "sent" : "draft",
    })
    .select()
    .single();

  if (error || !created) {
    // Put the run back so tomorrow's cron tries again.
    await supabase.from("invoice_series").update({ next_run_date: series.next_run_date }).eq("id", series.id!);
    console.error("Recurring invoice insert failed", error);
    return null;
  }

  const invoice = created as Invoice;
  let sent = false;
  if (series.auto_send && series.client_email.trim()) {
    try {
      await sendInvoiceEmail(invoice, biz, ownerEmail);
      sent = true;
    } catch (e) {
      console.error("Recurring invoice email failed", e);
      await supabase.from("invoices").update({ status: "draft" }).eq("id", invoice.id!);
    }
  }

  // A short note to the photographer either way, so nothing happens silently.
  if (ownerEmail) {
    const total = (invoice.line_items ?? []).reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const who = series.client_business || series.client_name;
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.thebecomingcreative.com";
    try {
      await getResend().emails.send({
        from: FROM,
        to: ownerEmail,
        subject: sent
          ? `${who}'s ${fillMonth("{month}", issueDate)} invoice is on its way`
          : `${who}'s ${fillMonth("{month}", issueDate)} invoice is ready for you`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #2c2c2c;">
            <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.4; margin-bottom: 24px;">Monthly invoice</p>
            <h1 style="font-size: 26px; font-weight: 300; font-style: italic; margin-bottom: 18px; line-height: 1.25;">
              ${sent ? `Sent to ${who}, ${fmt(total)}.` : `${who}'s invoice is ready, ${fmt(total)}.`}
            </h1>
            <p style="font-size: 14px; line-height: 1.7; opacity: 0.8; margin-bottom: 8px;">
              ${invoice.session_name} · ${invoice.invoice_number}<br />
              Payment due ${invoice.due_date ? formatLongDate(invoice.due_date) : "on receipt"}.
            </p>
            <p style="font-size: 14px; line-height: 1.7; opacity: 0.8; margin: 16px 0 28px;">
              ${
                sent
                  ? `It went to ${series.client_email}. The next one goes out ${formatLongDate(nextRun)}.`
                  : series.auto_send
                  ? "It couldn't be emailed automatically, so it's waiting for you as a draft."
                  : "Give it a look and send it whenever it feels right."
              }
            </p>
            <a href="${site}/pricing/invoices" style="display: inline-block; background: #111111; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; font-family: 'DM Sans', sans-serif;">
              ${sent ? "View invoices" : "Review & send"}
            </a>
          </div>
        `,
      });
    } catch (e) {
      console.error("Recurring invoice notice failed", e);
    }
  }

  return { invoice, sent };
}
