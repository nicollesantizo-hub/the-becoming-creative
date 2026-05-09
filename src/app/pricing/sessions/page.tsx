import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { SessionBuilder } from "@/components/pricing/session-builder";
import { calculateCODB } from "@/lib/pricing";

export default async function SessionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const [{ data: codbConfig }, { data: sessions }, { data: profile }] =
    await Promise.all([
      supabase.from("codb_config").select("*").eq("user_id", user.id).single(),
      supabase
        .from("session_types")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at"),
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
        Step 2
      </p>
      <h1
        className="text-4xl md:text-5xl font-light italic mb-2"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
      >
        Session Types
      </h1>
      <p
        className="text-base opacity-50 mb-10 leading-relaxed max-w-lg"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
      >
        Build reusable session templates — outdoor portraits, studio shoots,
        travel sessions. Prices calculate automatically from your CODB.
      </p>

      <SessionBuilder
        initialSessions={sessions ?? []}
        userId={user.id}
        codb={codb}
        isPro={isPro}
      />
    </div>
  );
}
