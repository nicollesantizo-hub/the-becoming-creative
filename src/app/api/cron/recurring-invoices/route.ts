import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { issueFromSeries } from "@/lib/recurring-invoices";
import { todayPacific } from "@/lib/invoices";
import type { InvoiceSeries } from "@/types/pricing";

export const dynamic = "force-dynamic";

// Runs once a day (see vercel.json). Vercel sends CRON_SECRET as a bearer token.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = todayPacific();
  const { data: due, error } = await supabase
    .from("invoice_series")
    .select("*")
    .eq("active", true)
    .lte("next_run_date", today);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results = [];
  for (const series of (due ?? []) as InvoiceSeries[]) {
    // Issue dated today, and schedule the next one from today so a missed day
    // never stacks up multiple invoices.
    const r = await issueFromSeries(supabase, series, today, { advanceFrom: today });
    results.push({ series: series.id, issued: !!r, sent: r?.sent ?? false });
  }

  return NextResponse.json({ today, results });
}
