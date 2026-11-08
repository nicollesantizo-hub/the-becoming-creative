import { FREE_MONTHLY_LIMITS, type LimitedTool } from "@/lib/plan";

const body = { color: "var(--charcoal)", fontFamily: "var(--font-body)" } as const;
const NOUNS: Record<LimitedTool, string> = { quotes: "proposals", contracts: "contracts", invoices: "invoices" };

// Small "Pro" label next to a feature free users can see but not use.
export function ProTag() {
  return (
    <a
      href="/studio/upgrade"
      className="inline-block ml-1.5 px-1.5 py-0.5 text-[9px] uppercase tracking-widest align-middle hover:opacity-70"
      style={{ ...body, backgroundColor: "var(--clay)", color: "var(--cream)", letterSpacing: "0.14em" }}
    >
      Pro
    </a>
  );
}

// "2 of 3 invoices left this month on the free plan." Nothing for Pro.
export function UsageNote({ tool, used, isPro }: { tool: LimitedTool; used: number; isPro: boolean }) {
  if (isPro) return null;
  const limit = FREE_MONTHLY_LIMITS[tool];
  const left = Math.max(0, limit - used);
  const many = NOUNS[tool];
  return (
    <div className="px-4 py-3 border-l-2 text-sm" style={{ ...body, borderColor: "var(--clay)", backgroundColor: "var(--sand, #f5f5f0)" }}>
      <span className="opacity-70">
        {left > 0
          ? `${left} of ${limit} ${many} left this month on the free plan.`
          : `You've used all ${limit} free ${many} this month. They refresh on the 1st.`}{" "}
      </span>
      <a href="/studio/upgrade" className="underline hover:opacity-70" style={{ color: "var(--clay)" }}>
        Go Pro for unlimited
      </a>
    </div>
  );
}

// Turn the database's limit errors into something kind.
export function friendlyPlanError(message: string) {
  if (message.includes("free_plan_limit")) return "You've reached this month's free limit. Go Pro for unlimited.";
  if (message.includes("pro_only")) return "This is part of Pro.";
  return message;
}
