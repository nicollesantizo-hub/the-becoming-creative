import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { ContractBuilder } from "@/components/pricing/contract-builder";
import { monthStartIso } from "@/lib/plan";
import type { ContractPrefill } from "@/components/pricing/contract-builder";
import type { Quote } from "@/types/pricing";

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ fromQuote?: string }>;
}) {
  const { fromQuote } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const [{ data: contracts }, { data: templates }, { data: profile }] = await Promise.all([
    supabase.from("contracts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("contract_templates").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("profiles").select("tier").eq("id", user.id).single(),
  ]);
  const isPro = profile?.tier === "pro";
  const usedThisMonth = (contracts ?? []).filter((c) => c.created_at && c.created_at >= monthStartIso()).length;

  // "Create contract" from a proposal: carry its client, package, date, and price over.
  let prefill: ContractPrefill | null = null;
  if (fromQuote) {
    const { data: q } = await supabase.from("quotes").select("*").eq("id", fromQuote).eq("user_id", user.id).single();
    if (q) {
      const quote = q as Quote;
      const { data: st } = quote.session_type_id
        ? await supabase.from("session_types").select("name").eq("id", quote.session_type_id).single()
        : { data: null };
      prefill = {
        sourceLabel: quote.event_name || quote.quote_name || quote.client_name || "your proposal",
        client_name: quote.client_name || quote.point_of_contact || quote.client_business || "",
        client_email: quote.client_email ?? "",
        package_name: st?.name || quote.event_name || quote.quote_name || "",
        session_date: quote.session_date || "",
        session_location: quote.event_location || "",
        price: Math.round((quote.accepted_total ?? quote.final_price ?? 0) * 100) / 100,
      };
    }
  }

  return (
    <div className="px-5 md:px-8 py-10 md:py-12">
      <p
        className="text-xs uppercase tracking-widest opacity-40 mb-4"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
      >
        03 · Contract
      </p>
      <h1
        className="text-4xl md:text-5xl font-light italic mb-2"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
      >
        Contracts
      </h1>
      <p
        className="text-base opacity-50 mb-4 leading-relaxed max-w-lg"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
      >
        Create a contract, send it to your client, and they sign it right in the browser — no printing or scanning.
      </p>
      <a
        href="/studio/contracts/templates"
        className="inline-block text-xs uppercase tracking-widest opacity-50 hover:opacity-80 transition-opacity mb-10"
        style={{ color: "var(--clay)", fontFamily: "var(--font-body)" }}
      >
        Manage templates →{!isPro && " (Pro)"}
      </a>

      <ContractBuilder
        savedContracts={contracts ?? []}
        savedTemplates={templates ?? []}
        userId={user.id}
        isPro={isPro}
        usedThisMonth={usedThisMonth}
        prefill={prefill}
      />
    </div>
  );
}
