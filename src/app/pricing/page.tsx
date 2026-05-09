import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

export default async function PricingDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const [{ data: codb }, { data: sessions }, { count: quoteCount }] =
    await Promise.all([
      supabase
        .from("codb_config")
        .select("shoots_per_year")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("session_types")
        .select("id")
        .eq("user_id", user.id),
      supabase
        .from("quotes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  const hasSetupCODB = !!codb;
  const sessionCount = sessions?.length ?? 0;

  const cards = [
    {
      num: "01",
      href: "/pricing/calculator",
      title: "Calculator",
      desc: hasSetupCODB
        ? "Your costs are configured"
        : "Set up your annual costs & minimum rate",
      cta: hasSetupCODB ? "Update →" : "Set up now →",
    },
    {
      num: "02",
      href: "/pricing/sessions",
      title: "Sessions",
      desc:
        sessionCount > 0
          ? `${sessionCount} session type${sessionCount > 1 ? "s" : ""} saved`
          : "Build reusable session types with pricing",
      cta: sessionCount > 0 ? "Manage →" : "Build now →",
    },
    {
      num: "03",
      href: "/pricing/quotes",
      title: "Quotes",
      desc:
        quoteCount && quoteCount > 0
          ? `${quoteCount} quote${quoteCount > 1 ? "s" : ""} generated`
          : "Generate quotes to send to clients",
      cta: "Open →",
    },
  ];

  return (
    <div className="px-5 md:px-8 py-10 md:py-12 max-w-3xl">
      <p
        className="text-xs uppercase tracking-widest opacity-40 mb-4"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
      >
        Price My Work
      </p>
      <h1
        className="text-5xl md:text-6xl font-light italic mb-3 leading-tight"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
      >
        Know your worth.
        <br />
        <span className="not-italic font-normal">Charge it.</span>
      </h1>
      <p
        className="text-base opacity-50 mb-14 leading-relaxed"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
      >
        Your one-stop tool for pricing sessions, calculating costs, and quoting
        clients.
      </p>

      {!hasSetupCODB && (
        <div
          className="p-5 mb-10 border-l-2"
          style={{ borderColor: "var(--clay)", backgroundColor: "var(--sand)" }}
        >
          <p
            className="text-sm font-medium mb-1"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            Start with your calculator
          </p>
          <p
            className="text-sm opacity-60 mb-3 leading-relaxed"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            Enter your annual costs and income goals to find your minimum
            per-session rate. Everything else builds from there.
          </p>
          <Link
            href="/pricing/calculator"
            className="text-sm uppercase tracking-wider"
            style={{ color: "var(--clay)", fontFamily: "var(--font-body)" }}
          >
            Set up now →
          </Link>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="pricing-card flex flex-col gap-4 p-6 border"
          >
            <span
              className="text-xs tracking-widest opacity-30"
              style={{ fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
            >
              {card.num}
            </span>
            <h2
              className="text-2xl font-light italic"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
            >
              {card.title}
            </h2>
            <p
              className="text-sm opacity-60 leading-relaxed flex-1"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              {card.desc}
            </p>
            <span
              className="text-xs uppercase tracking-wider"
              style={{ color: "var(--clay)", fontFamily: "var(--font-body)" }}
            >
              {card.cta}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
