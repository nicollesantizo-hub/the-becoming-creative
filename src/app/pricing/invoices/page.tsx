import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { InvoiceBuilder } from "@/components/pricing/invoice-builder";
import { monthStartIso } from "@/lib/plan";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const [{ data: invoices }, { data: profile }, { data: series }] = await Promise.all([
    supabase.from("invoices").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("profiles").select("tier").eq("id", user.id).single(),
    supabase.from("invoice_series").select("*").eq("user_id", user.id).order("created_at"),
  ]);

  const isPro = profile?.tier === "pro";
  const usedThisMonth = (invoices ?? []).filter((i) => i.created_at && i.created_at >= monthStartIso()).length;

  return (
    <div className="px-5 md:px-8 py-10 md:py-12">
      <p
        className="text-xs uppercase tracking-widest opacity-40 mb-4"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
      >
        Invoices
      </p>
      <h1
        className="text-4xl md:text-5xl font-light italic mb-2"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
      >
        Invoices
      </h1>
      <p
        className="text-base opacity-50 mb-10 leading-relaxed max-w-lg"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
      >
        Create and send invoices to your clients. Track what&apos;s been sent and paid.
      </p>

      <InvoiceBuilder
        savedInvoices={invoices ?? []}
        savedSeries={series ?? []}
        userId={user.id}
        isPro={isPro}
        usedThisMonth={usedThisMonth}
      />
    </div>
  );
}
