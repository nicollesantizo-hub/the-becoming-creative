import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { TemplateBuilder } from "@/components/pricing/template-builder";

export default async function ContractTemplatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const { data: templates } = await supabase
    .from("contract_templates")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

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
        Templates
      </h1>
      <p
        className="text-base opacity-50 mb-10 leading-relaxed max-w-lg"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
      >
        Save reusable sets of contract clauses by state, and start new contracts from them instead of writing terms from scratch each time.
      </p>

      <TemplateBuilder
        savedTemplates={templates ?? []}
        userId={user.id}
      />
    </div>
  );
}
