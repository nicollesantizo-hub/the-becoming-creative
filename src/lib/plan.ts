// What the free plan includes each month. The database enforces the same numbers
// (see supabase-plan-limits.sql) — keep the two in step.

export const FREE_MONTHLY_LIMITS = {
  quotes: 2,
  contracts: 2,
  invoices: 3,
} as const;

export type LimitedTool = keyof typeof FREE_MONTHLY_LIMITS;

// Start of the current calendar month (UTC), matching date_trunc('month', now()).
export function monthStartIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export function remainingThisMonth(tool: LimitedTool, usedThisMonth: number, isPro: boolean) {
  if (isPro) return Infinity;
  return Math.max(0, FREE_MONTHLY_LIMITS[tool] - usedThisMonth);
}

export const PRO_FEATURES = [
  "Unlimited proposals, contracts, and invoices",
  "Your logo on everything you send",
  "Clients accept proposals online, with optional add-ons",
  "Monthly invoices that send themselves",
  "Stripe pay button on invoices",
  "Oregon & Washington contract starters and saved templates",
  "Unlimited session types",
  "The full Planner: bookings, editing, content, inspo",
];
