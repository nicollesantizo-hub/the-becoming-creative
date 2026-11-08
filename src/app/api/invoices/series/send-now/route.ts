import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { issueFromSeries } from "@/lib/recurring-invoices";
import { addDays, todayPacific } from "@/lib/invoices";
import type { InvoiceSeries } from "@/types/pricing";

// Issue this month's invoice from a series right away. If the scheduled run is
// still coming up this month, it's skipped so the client isn't billed twice.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { seriesId } = await request.json();
  const { data: series } = await supabase
    .from("invoice_series")
    .select("*")
    .eq("id", seriesId)
    .eq("user_id", user.id)
    .single();
  if (!series) return NextResponse.json({ error: "Series not found" }, { status: 404 });

  const s = series as InvoiceSeries;
  const today = todayPacific();
  let advanceFrom: string;
  if (s.next_run_date <= today) advanceFrom = today; // overdue: schedule the next from today
  else if (s.next_run_date.slice(0, 7) === today.slice(0, 7)) advanceFrom = s.next_run_date; // later this month: skip it
  else advanceFrom = addDays(s.next_run_date, -1); // a later month: leave it as scheduled

  const result = await issueFromSeries(createAdminClient(), s, today, { advanceFrom });
  if (!result) return NextResponse.json({ error: "Couldn't create the invoice. Please try again." }, { status: 409 });

  return NextResponse.json({ ok: true, invoice: result.invoice, sent: result.sent });
}
