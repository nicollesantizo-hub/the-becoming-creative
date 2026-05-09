import Link from "next/link";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase-server";

export const metadata = {
  title: "Field Notes — The Becoming Creative",
  description: "Prompts, inspiration, and honest thoughts for creatives figuring it out.",
};

const TYPE_LABELS: Record<string, string> = {
  prompt: "Prompt",
  inspiration: "Inspiration",
  read: "Read",
};

export default async function FieldNotesPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, type, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <main className="flex flex-col min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6">
        <Link href="/">
          <Logo className="text-[var(--charcoal)]" />
        </Link>
        <Link
          href="/"
          className="text-sm uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
          style={{ fontFamily: "var(--font-body)", color: "var(--charcoal)", letterSpacing: "0.15em" }}
        >
          ← Home
        </Link>
      </nav>

      <section className="pt-40 pb-16 px-8">
        <div className="max-w-2xl mx-auto">
          <p
            className="text-xs uppercase tracking-widest opacity-40 mb-4"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            Field Notes
          </p>
          <h1
            className="text-5xl md:text-6xl font-light italic leading-tight mb-4"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
          >
            Notes from
            <br />
            <span className="not-italic font-normal">the work.</span>
          </h1>
          <p
            className="text-base opacity-50 leading-relaxed"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            Prompts, inspiration, and honest thoughts for creatives figuring it out.
          </p>
        </div>
      </section>

      <section className="px-8 pb-24 flex-1">
        <div className="max-w-2xl mx-auto">
          {!posts || posts.length === 0 ? (
            <p
              className="text-sm opacity-40"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              Nothing here yet. Check back soon.
            </p>
          ) : (
            <div className="flex flex-col divide-y" style={{ borderColor: "var(--border)" }}>
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/field-notes/${post.slug}`}
                  className="flex items-start justify-between gap-6 py-7 group"
                >
                  <div className="flex flex-col gap-2">
                    <span
                      className="text-xs uppercase tracking-widest opacity-35"
                      style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                    >
                      {TYPE_LABELS[post.type] ?? post.type}
                    </span>
                    <h2
                      className="text-xl font-light italic group-hover:opacity-60 transition-opacity"
                      style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
                    >
                      {post.title}
                    </h2>
                  </div>
                  <span
                    className="text-xs opacity-30 shrink-0 mt-1"
                    style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                  >
                    {new Date(post.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer
        className="py-12 px-8 flex flex-col sm:flex-row items-center justify-between gap-6"
        style={{ backgroundColor: "var(--charcoal)" }}
      >
        <Logo className="text-[var(--cream)] opacity-60" />
        <p
          className="text-xs opacity-30"
          style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}
        >
          © {new Date().getFullYear()} The Becoming Creative. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
