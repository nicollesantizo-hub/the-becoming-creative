// How a client pays an invoice. The pay link (e.g. a Stripe Payment Link) becomes a
// button on the email and the PDF.

export const PAYMENT_METHODS: { id: string; label: string; linkLabel?: string; hint?: string }[] = [
  { id: "stripe", label: "Card via Stripe", linkLabel: "Stripe payment link", hint: "In Stripe: Payment Links → New. Paste the link here." },
  { id: "zelle", label: "Zelle", hint: "e.g. Zelle to aida@aidavisuals.com" },
  { id: "venmo", label: "Venmo", linkLabel: "Venmo link (optional)", hint: "e.g. @aidavisuals" },
  { id: "paypal", label: "PayPal", linkLabel: "PayPal.me link (optional)" },
  { id: "check", label: "Check", hint: "e.g. Made out to Aida Visuals LLC" },
  { id: "cash", label: "Cash" },
  { id: "other", label: "Other", linkLabel: "Payment link (optional)" },
];

export function paymentMethodLabel(id?: string | null) {
  return PAYMENT_METHODS.find((m) => m.id === id)?.label ?? null;
}

export function payButtonLabel(id?: string | null) {
  return id === "stripe" ? "Pay securely by card" : "Pay online";
}

// Only allow real web links into emails and PDFs.
export function safeLink(url?: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url.trim());
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}
