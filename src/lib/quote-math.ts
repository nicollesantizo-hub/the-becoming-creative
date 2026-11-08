// One calculation for every place a quote total appears — the builder, the client
// proposal page, and the PDF — so the lines a client reads always add up.
// Order: everything chosen → discount → tax on the discounted amount.

export interface QuoteTotalsInput {
  base: number;
  extras: number; // marketing, lodging, meals, personnel
  requiredAddons: number;
  chosenOptionalAddons: number;
  taxRate: number;
  discountType: "percentage" | "flat" | "none" | null;
  discountValue: number;
}

export interface QuoteTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export function quoteTotals(i: QuoteTotalsInput): QuoteTotals {
  const subtotal = i.base + i.extras + i.requiredAddons + i.chosenOptionalAddons;
  const discount =
    i.discountType === "percentage"
      ? subtotal * (i.discountValue / 100)
      : i.discountType === "flat"
      ? Math.min(i.discountValue, subtotal)
      : 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  const tax = afterDiscount * ((i.taxRate || 0) / 100);
  return { subtotal, discount, tax, total: afterDiscount + tax };
}
