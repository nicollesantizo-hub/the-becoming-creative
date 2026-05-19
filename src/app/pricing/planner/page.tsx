import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { PhotographerPlanner } from "@/components/pricing/photographer-planner";

export const metadata = {
  title: "Photographer Planner — The Becoming Creative",
  description: "Plan your shoots, track bookings, manage editing workflow, and schedule content — all in one place.",
};

export default async function PlannerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const [
    { data: profile },
    { data: shoots },
    { data: bookings },
    { data: edits },
    { data: content },
  ] = await Promise.all([
    supabase.from("profiles").select("tier").eq("id", user.id).single(),
    supabase.from("planner_shoots").select("*").eq("user_id", user.id).order("session_date", { ascending: true }),
    supabase.from("planner_bookings").select("*").eq("user_id", user.id).order("session_date", { ascending: true }),
    supabase.from("planner_edits").select("*").eq("user_id", user.id).order("delivery_deadline", { ascending: true }),
    supabase.from("planner_content").select("*").eq("user_id", user.id).order("scheduled_date", { ascending: true }),
  ]);

  const isPro = profile?.tier === "pro";

  return (
    <div className="px-5 md:px-8 py-10 md:py-12">
      <p
        className="text-xs uppercase tracking-widest opacity-40 mb-4"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
      >
        Planner
      </p>
      <h1
        className="text-4xl md:text-5xl font-light italic mb-2"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
      >
        Photographer Planner
      </h1>
      <p
        className="text-base opacity-50 mb-10 leading-relaxed max-w-lg"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
      >
        Plan your shoots, track your pipeline, manage editing, and schedule
        content — your whole photography business in one place.
      </p>

      <PhotographerPlanner
        userId={user.id}
        isPro={isPro}
        initialShoots={shoots ?? []}
        initialBookings={bookings ?? []}
        initialEdits={edits ?? []}
        initialContent={content ?? []}
      />
    </div>
  );
}
