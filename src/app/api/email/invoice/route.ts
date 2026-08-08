import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getResend, FROM } from "@/lib/resend";
import type { Invoice } from "@/types/pricing";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { invoiceId } = await request.json();
  if (!invoiceId) return NextResponse.json({ error: "Invoice ID required" }, { status: 400 });

  const [{ data: invoice }, { data: profile }] = await Promise.all([
    supabase.from("invoices").select("*").eq("id", invoiceId).eq("user_id", user.id).single(),
    supabase.from("profiles").select("business_name, contact_name, phone, website, payment_terms").eq("id", user.id).single(),
  ]);

  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  const inv = invoice as Invoice;
  const biz = profile as { business_name: string | null; contact_name: string | null; phone: string | null; website: string | null; payment_terms: string | null } | null;

  const businessName = biz?.business_name || biz?.contact_name || user.email;
  const lineItems = (inv.line_items ?? []).filter((i) => i.description?.trim());
  const total = lineItems.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const formattedDue = inv.due_date
    ? new Date(inv.due_date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  const lineItemsHtml = lineItems.map((item) => `
    <tr>
      <td style="padding: 8px 0; font-size: 13px; color: #444444; border-bottom: 1px solid #eeeeee;">${item.description}</td>
      <td style="padding: 8px 0; font-size: 13px; text-align: right; font-weight: 500; color: #111111; border-bottom: 1px solid #eeeeee; padding-left: 24px;">${fmt(Number(item.amount) || 0)}</td>
    </tr>
  `).join("");

  const resend = getResend();
  await resend.emails.send({
    from: FROM,
    to: inv.client_email,
    subject: `Invoice from ${businessName}${inv.invoice_number ? ` — ${inv.invoice_number}` : ""}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #2c2c2c;">
        <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.4; margin-bottom: 24px;">${businessName}</p>
        <h1 style="font-size: 28px; font-weight: 300; font-style: italic; margin-bottom: 6px; line-height: 1.2;">
          ${inv.session_name || "Invoice"}
        </h1>
        <p style="font-size: 12px; opacity: 0.4; margin-bottom: 32px;">${[inv.invoice_number, inv.client_business].filter(Boolean).join("  ·  ") || "&nbsp;"}</p>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 0;">
          <tbody>
            ${lineItemsHtml}
          </tbody>
        </table>

        <div style="margin-top: 16px; padding-top: 16px; border-top: 1.5px solid #111111; display: flex; justify-content: space-between; align-items: baseline;">
          <span style="font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; opacity: 0.35;">Total Due</span>
          <span style="font-family: Georgia, serif; font-size: 34px; font-style: italic; font-weight: 400; color: #111111; line-height: 1;">${fmt(total)}</span>
        </div>

        ${formattedDue ? `
          <div style="margin-top: 12px; padding: 10px 16px; background: #f5f5f5; font-size: 12px; display: flex; justify-content: space-between;">
            <span style="font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.4;">Payment due</span>
            <span style="font-weight: 500; opacity: 0.7;">${formattedDue}</span>
          </div>
        ` : ""}

        ${inv.notes?.trim() ? `
          <div style="margin-top: 28px;">
            <p style="font-size: 13px; line-height: 1.7; opacity: 0.65; white-space: pre-wrap;">${inv.notes}</p>
          </div>
        ` : ""}

        <hr style="margin: 36px 0 20px; border: none; border-top: 1px solid #eeeeee;" />
        <p style="font-size: 11px; opacity: 0.3; line-height: 1.6;">${businessName}${biz?.phone ? ` · ${biz.phone}` : ""}${biz?.website ? ` · ${biz.website}` : ""}</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
