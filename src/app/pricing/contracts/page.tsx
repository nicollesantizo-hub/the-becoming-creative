import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { ContractBuilder } from "@/components/pricing/contract-builder";

export default async function ContractsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const [{ data: contracts }, { data: templates }] = await Promise.all([
    supabase.from("contracts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("contract_templates").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  return (
    <div className="px-5 md:px-8 py-10 md:py-12">
      <p
        className="text-xs uppercase tracking-widest opacity-40 mb-4"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
      >
        Contracts
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
        href="/pricing/contracts/templates"
        className="inline-block text-xs uppercase tracking-widest opacity-50 hover:opacity-80 transition-opacity mb-10"
        style={{ color: "var(--clay)", fontFamily: "var(--font-body)" }}
      >
        Manage templates →
      </a>

      <ContractBuilder
        savedContracts={contracts ?? []}
        savedTemplates={templates ?? []}
        userId={user.id}
      />
    </div>
  );
}
