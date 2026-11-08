import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { InvoiceBuilder } from "@/components/pricing/invoice-builder";
import { monthStartIso } from "@/lib/plan";
import { contractPayments, formatContractDate } from "@/lib/contract-payments";
import type { InvoicePrefill } from "@/components/pricing/invoice-builder";
import type { Contract } from "@/types/pricing";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ fromContract?: string }>;
}) {
  const { fromContract } = await searchParams;
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

  // "Create invoice" from a contract: the session, what's been paid, and when the rest is due.
  let prefill: InvoicePrefill | null = null;
  if (fromContract) {
    const { data: c } = await supabase.from("contracts").select("*").eq("id", fromContract).eq("user_id", user.id).single();
    if (c) {
      const contract = c as Contract;
      const pay = contractPayments(contract);
      const what = contract.package_name || "Photography session";
      prefill = {
        sourceLabel: [contract.contract_number, contract.client_name].filter(Boolean).join(" · "),
        client_name: contract.client_name,
        client_email: contract.client_email,
        session_name: `${what}${contract.session_date ? ` — ${formatContractDate(contract.session_date)}` : ""}`,
        line_items: [{ description: what, amount: pay.price }],
        deposit_amount: pay.paid,
        due_date: pay.dueDate ?? "",
      };
    }
  }

  return (
    <div className="px-5 md:px-8 py-10 md:py-12">
      <p
        className="text-xs uppercase tracking-widest opacity-40 mb-4"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
      >
        04 · Invoice
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
        prefill={prefill}
      />
    </div>
  );
}
