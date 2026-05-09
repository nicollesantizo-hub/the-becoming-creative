import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { QuoteBuilder } from "@/components/pricing/quote-builder";
import { calculateCODB } from "@/lib/pricing";

export default async function QuotesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const [{ data: codbConfig }, { data: sessions }, { data: quotes }, { data: profile }] =
    await Promise.all([
      supabase.from("codb_config").select("*").eq("user_id", user.id).single(),
      supabase.from("session_types").select("*").eq("user_id", user.id).order("created_at"),
      supabase
        .from("quotes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("tier").eq("id", user.id).single(),
    ]);

  const codb = codbConfig ? calculateCODB(codbConfig) : null;
  const isPro = profile?.tier === "pro";

  return (
    <div className="px-5 md:px-8 py-10 md:py-12">
      <p
        className="text-xs uppercase tracking-widest opacity-40 mb-4"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
      >
        Step 3
      </p>
      <h1
        className="text-4xl md:text-5xl font-light italic mb-2"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
      >
        Quotes
      </h1>
      <p
        className="text-base opacity-50 mb-10 leading-relaxed max-w-lg"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
      >
        Generate a quote for any client in seconds. Add discounts, sales tax,
        and custom notes.
      </p>

      <QuoteBuilder
        savedQuotes={quotes ?? []}
        sessions={sessions ?? []}
        userId={user.id}
        codb={codb}
        isPro={isPro}
      />
    </div>
  );
}
