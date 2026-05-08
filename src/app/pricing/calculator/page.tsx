import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { CODBCalculator } from "@/components/pricing/codb-calculator";

export default async function CalculatorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const { data: codbConfig } = await supabase
    .from("codb_config")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="px-8 py-12">
      <p
        className="text-xs uppercase tracking-widest opacity-40 mb-4"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
      >
        Step 1
      </p>
      <h1
        className="text-4xl md:text-5xl font-light italic mb-2"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
      >
        Cost of Doing Business
      </h1>
      <p
        className="text-base opacity-50 mb-10 leading-relaxed max-w-lg"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
      >
        Know exactly what it costs to run your business — and what you need to
        charge to pay yourself what you deserve.
      </p>

      <CODBCalculator
        initialConfig={codbConfig}
        userId={user.id}
      />
    </div>
  );
}
