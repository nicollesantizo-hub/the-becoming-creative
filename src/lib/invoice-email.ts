// Server-only: the invoice email a client receives. Used by the "Send to client"
// button and by the monthly recurring run, so both send the same thing.

import { getResend, FROM } from "@/lib/resend";
import { paymentMethodLabel, payButtonLabel, safeLink } from "@/lib/payment-methods";
import type { Invoice } from "@/types/pricing";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export interface InvoiceBiz {
  business_name: string | null;
  contact_name: string | null;
  phone: string | null;
  website: string | null;
  logo_url?: string | null;
  tier?: string | null;
}

export async function sendInvoiceEmail(inv: Invoice, biz: InvoiceBiz | null, replyTo: string | undefined) {
  const businessName = biz?.business_name || biz?.contact_name || replyTo || "";
  const lineItems = (inv.line_items ?? []).filter((i) => i.description?.trim());
  const total = lineItems.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const depositAmount = inv.deposit_amount ?? 0;
  const balanceDue = Math.max(0, total - depositAmount);
  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const formattedDue = inv.due_date
    ? new Date(inv.due_date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  const logoUrl = biz?.tier === "pro" ? safeLink(biz.logo_url) : null;
  const payMethod = paymentMethodLabel(inv.payment_method);
  const payLink = biz?.tier === "pro" ? safeLink(inv.payment_link) : null;
  const payInstructions = inv.payment_instructions?.trim() ?? "";
  const payHtml =
    payMethod || payLink || payInstructions
      ? `
        <div style="margin-top: 24px; padding: 20px; border: 1px solid #e5e5e5;">
          <p style="font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; opacity: 0.4; margin: 0 0 6px;">How to pay</p>
          ${payMethod ? `<p style="font-size: 15px; margin: 0 0 6px; color: #111111;">${payMethod}</p>` : ""}
          ${payInstructions ? `<p style="font-size: 13px; line-height: 1.6; opacity: 0.65; margin: 0; white-space: pre-wrap;">${escapeHtml(payInstructions)}</p>` : ""}
          ${
            payLink
              ? `<a href="${payLink}" style="display: inline-block; margin-top: 14px; background: #111111; color: #ffffff; text-decoration: none; padding: 14px 28px; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; font-family: 'DM Sans', Arial, sans-serif;">${payButtonLabel(inv.payment_method)}</a>`
              : ""
          }
        </div>`
      : "";

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
    // letters@ has no inbox — client replies go straight to the photographer.
    replyTo,
    subject: `Invoice from ${businessName}${inv.invoice_number ? ` — ${inv.invoice_number}` : ""}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; color: #2c2c2c;">
        ${logoUrl ? `<div style="text-align: center; margin-bottom: 28px;"><img src="${logoUrl}" alt="${escapeHtml(businessName)}" width="96" height="96" style="width: 96px; height: 96px; object-fit: contain;" /></div>` : ""}
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
          <span style="font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; opacity: 0.35;">${depositAmount > 0 ? "Total" : "Total Due"}</span>
          <span style="font-family: Georgia, serif; font-size: 34px; font-style: italic; font-weight: 400; color: #111111; line-height: 1;">${fmt(total)}</span>
        </div>

        ${depositAmount > 0 ? `
          <div style="margin-top: 12px; padding: 10px 16px; background: #f5f5f5; font-size: 12px; display: flex; justify-content: space-between;">
            <span style="font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.4;">Deposit received</span>
            <span style="font-weight: 500; opacity: 0.7;">${fmt(depositAmount)}</span>
          </div>
          <div style="margin-top: 6px; padding: 0 16px; font-size: 12px; display: flex; justify-content: space-between;">
            <span style="font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.5;">Balance due</span>
            <span style="font-weight: 600;">${fmt(balanceDue)}</span>
          </div>
        ` : ""}

        ${formattedDue ? `
          <div style="margin-top: 12px; padding: 10px 16px; background: #f5f5f5; font-size: 12px; display: flex; justify-content: space-between;">
            <span style="font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.4;">Payment due</span>
            <span style="font-weight: 500; opacity: 0.7;">${formattedDue}</span>
          </div>
        ` : ""}

        ${payHtml}

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

}
