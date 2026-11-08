// Money and timing for a contract: what's already been paid, what's still due at
// signing, and what's left before the session (and by when). Shared by the builder,
// the client signing page, the PDF, and the email so they always agree.

import { fmt } from "@/lib/pricing";

export interface ContractPaymentInput {
  price: number;
  deposit_amount?: number | null;
  amount_paid?: number | null;
  balance_due_date?: string | null;
}

export function contractPayments(c: ContractPaymentInput) {
  const price = c.price || 0;
  const deposit = c.deposit_amount || 0;
  const paid = c.amount_paid || 0;
  return {
    price,
    deposit,
    paid,
    // Retainer not yet covered by what's been paid — due when the contract is signed.
    dueAtSigning: Math.max(0, deposit - paid),
    // Everything else, due before the session.
    balance: Math.max(0, price - Math.max(deposit, paid)),
    dueDate: c.balance_due_date || null,
  };
}

// "2026-12-06" minus 7 days → "2026-11-29". Pure date math, no timezone drift.
export function balanceDueDateFrom(sessionDate: string, daysBefore: number): string {
  if (!sessionDate) return "";
  const [y, m, d] = sessionDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d - (Number.isFinite(daysBefore) ? daysBefore : 7)));
  return dt.toISOString().slice(0, 10);
}

export function formatContractDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// "15:30" → "3:30 PM"
export function formatSessionTime(t?: string | null) {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  if (!Number.isFinite(h)) return t;
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m || 0).padStart(2, "0")} ${suffix}`;
}

// Adjusts the standard retainer + payment wording in generated terms to reflect money
// already received and the actual due date. Works on text from the built-in starter
// and from saved templates; custom wording that doesn't match is left alone.
export function applyPaymentWording(text: string, c: ContractPaymentInput): string {
  const p = contractPayments(c);
  let out = text;
  if (p.paid > 0 && p.deposit > 0) {
    out = out.replace(
      "is due at the time this Agreement is signed to reserve Client's date",
      p.dueAtSigning > 0
        ? `is due at the time this Agreement is signed to reserve Client's date, of which ${fmt(p.paid)} has already been received`
        : "has been received by Photographer to reserve Client's date"
    );
  }
  if (p.dueDate) {
    out = out.replace(
      "days before the session date. Payments not received",
      `days before the session date (on or before ${formatContractDate(p.dueDate)}). Payments not received`
    );
  }
  return out;
}
