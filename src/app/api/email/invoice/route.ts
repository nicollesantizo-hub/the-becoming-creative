import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { sendInvoiceEmail, type InvoiceBiz } from "@/lib/invoice-email";
import type { Invoice } from "@/types/pricing";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { invoiceId } = await request.json();
  if (!invoiceId) return NextResponse.json({ error: "Invoice ID required" }, { status: 400 });

  const [{ data: invoice }, { data: profile }] = await Promise.all([
    supabase.from("invoices").select("*").eq("id", invoiceId).eq("user_id", user.id).single(),
    supabase.from("profiles").select("business_name, contact_name, phone, website, logo_url, tier").eq("id", user.id).single(),
  ]);

  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  // letters@ has no inbox — client replies go straight to the photographer.
  await sendInvoiceEmail(invoice as Invoice, profile as InvoiceBiz | null, user.email);

  return NextResponse.json({ ok: true });
}
