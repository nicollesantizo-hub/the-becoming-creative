import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { Logo } from "@/components/logo";

export default async function WelcomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const name = user.email?.split("@")[0] ?? "friend";

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--cream)" }}>
      <nav className="px-8 py-6">
        <Logo className="text-[var(--charcoal)]" />
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
        <div className="max-w-lg w-full flex flex-col gap-10">

          <div className="flex flex-col gap-6">
            <p
              className="text-sm uppercase tracking-widest opacity-35"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              You're in.
            </p>
            <h1
              className="text-4xl md:text-5xl font-light italic leading-tight"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
            >
              Hey, {name}.<br />I see you.
            </h1>
            <div className="flex flex-col gap-4">
              <p
                className="text-base leading-loose"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300, opacity: 0.7 }}
              >
                Whatever brought you here — a search, a feeling, a moment of
                wondering if you&apos;re doing this right — I&apos;m glad it led you here.
              </p>
              <p
                className="text-base leading-loose"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300, opacity: 0.7 }}
              >
                This space was made for the in-between. For creatives who are
                still figuring it out — and building something beautiful in the process.
              </p>
              <p
                className="text-base leading-loose"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300, opacity: 0.7 }}
              >
                You belong here. Take your time.
              </p>
            </div>
          </div>

          <div className="w-8 h-px" style={{ backgroundColor: "var(--border)" }} />

          <div className="flex flex-col gap-4">
            <p
              className="text-xs uppercase tracking-widest opacity-35"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              When you&apos;re ready
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/field-notes"
                className="text-sm uppercase tracking-widest transition-opacity hover:opacity-60"
                style={{ color: "var(--clay)", fontFamily: "var(--font-body)" }}
              >
                Read Field Notes →
              </Link>
              <Link
                href="/resources"
                className="text-sm uppercase tracking-widest transition-opacity hover:opacity-60"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", opacity: 0.5 }}
              >
                Explore Resources →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
