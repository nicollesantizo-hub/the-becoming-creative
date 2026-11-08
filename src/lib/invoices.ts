// Small invoice helpers shared by the builder (browser) and the monthly run (server).

export function genInvoiceNumber(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 900) + 100);
  return `INV-${y}${m}-${rand}`;
}

// "Marketing support — {month}" on 2026-12-01 → "Marketing support — December 2026"
export function fillMonth(title: string, isoDate: string) {
  const [y, m] = isoDate.split("-").map(Number);
  const month = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return title.replace(/\{month\}/gi, month);
}

// Today's date as YYYY-MM-DD in Pacific time, where the studio lives.
export function todayPacific() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(new Date());
}

export function addDays(isoDate: string, days: number) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

// The first date strictly after `after` that falls on `day` of a month.
export function nextMonthlyDate(after: string, day: number) {
  const [y, m, d] = after.split("-").map(Number);
  const thisMonth = new Date(Date.UTC(y, m - 1, day));
  const next = d < day ? thisMonth : new Date(Date.UTC(y, m, day));
  return next.toISOString().slice(0, 10);
}

export function formatLongDate(isoDate: string) {
  return new Date(isoDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
