import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { SessionBuilder } from "@/components/pricing/session-builder";
import type { CODBConfig, CODBResults } from "@/types/pricing";

function calculateCODB(config: CODBConfig): CODBResults {
  const totalExpenses =
    config.equipment + config.insurance + config.software + config.storage +
    config.website + config.marketing + config.education + config.studio + config.other;
  const grossIncomeNeeded =
    config.tax_rate < 100
      ? config.desired_income / (1 - config.tax_rate / 100)
      : config.desired_income;
  const totalRevenueNeeded = totalExpenses + grossIncomeNeeded;
  const totalHoursPerYear = config.hours_per_week * config.weeks_per_year;
  const hourlyRate = totalHoursPerYear > 0 ? totalRevenueNeeded / totalHoursPerYear : 0;
  const minimumPerSession =
    config.shoots_per_year > 0 ? totalRevenueNeeded / config.shoots_per_year : 0;
  return { totalExpenses, grossIncomeNeeded, totalRevenueNeeded, totalHoursPerYear, hourlyRate, minimumPerSession };
}

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
