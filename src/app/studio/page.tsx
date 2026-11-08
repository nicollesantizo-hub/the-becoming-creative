import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

export default async function StudioDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const [{ data: codb }, { data: sessions }, { data: quotes }, { data: contracts }, { data: invoices }] =
    await Promise.all([
      supabase.from("codb_config").select("shoots_per_year").eq("user_id", user.id).single(),
      supabase.from("session_types").select("id").eq("user_id", user.id),
      supabase.from("quotes").select("status").eq("user_id", user.id),
      supabase.from("contracts").select("status").eq("user_id", user.id),
      supabase.from("invoices").select("status").eq("user_id", user.id),
    ]);

  const hasSetupCODB = !!codb;
  const sessionCount = sessions?.length ?? 0;
  const count = (rows: { status: string }[] | null, status?: string) =>
    (rows ?? []).filter((r) => !status || r.status === status).length;
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

  const awaitingYes = count(quotes, "sent");
  const awaitingSignature = count(contracts, "sent");
  const unpaid = count(invoices, "sent");

  const cards = [
    {
      num: "01",
      href: hasSetupCODB ? "/studio/sessions" : "/studio/calculator",
      title: "Price",
      desc: !hasSetupCODB
        ? "Start with your costs to find your true minimum rate."
        : sessionCount > 0
        ? `Costs set · ${plural(sessionCount, "session type")} priced`
        : "Costs set. Now build your session types.",
      cta: hasSetupCODB ? "Sessions →" : "Set up now →",
    },
    {
      num: "02",
      href: "/studio/quotes",
      title: "Propose",
      desc:
        count(quotes) === 0
          ? "Send a proposal your client can say yes to."
          : awaitingYes > 0
          ? `${plural(awaitingYes, "proposal")} waiting on a yes`
          : `${plural(count(quotes), "proposal")} · ${count(quotes, "accepted")} accepted`,
      cta: "Proposals →",
    },
    {
      num: "03",
      href: "/studio/contracts",
      title: "Contract",
      desc:
        count(contracts) === 0
          ? "Terms they sign right in the browser."
          : awaitingSignature > 0
          ? `${plural(awaitingSignature, "contract")} waiting for a signature`
          : `${plural(count(contracts, "signed"), "signed contract")}`,
      cta: "Contracts →",
    },
    {
      num: "04",
      href: "/studio/invoices",
      title: "Invoice",
      desc:
        count(invoices) === 0
          ? "Branded invoices, paid with a click."
          : unpaid > 0
          ? `${plural(unpaid, "invoice")} out, not yet paid`
          : "All caught up. Every invoice is paid.",
      cta: "Invoices →",
    },
  ];

  return (
    <div className="px-5 md:px-8 py-10 md:py-12 max-w-3xl">
      <p
        className="text-xs uppercase tracking-widest opacity-40 mb-4"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
      >
        The Studio
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
        Price it, propose it, contract it, get paid. Everything between you and your
        clients, in one calm place.
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
            href="/studio/calculator"
            className="text-sm uppercase tracking-wider"
            style={{ color: "var(--clay)", fontFamily: "var(--font-body)" }}
          >
            Set up now →
          </Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
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

      <Link
        href="/studio/planner"
        className="mt-8 inline-block text-xs uppercase tracking-widest opacity-50 hover:opacity-80 transition-opacity"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
      >
        Planner: shoots, editing, content →
      </Link>
    </div>
  );
}
