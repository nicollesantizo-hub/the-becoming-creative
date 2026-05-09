import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase-server";
import { PostRenderer } from "@/app/field-notes/[slug]/post-renderer";

const ADMIN_EMAIL = "aida@aidavisuals.com";

const TYPE_LABELS: Record<string, string> = {
  prompt: "Prompt",
  inspiration: "Inspiration",
  read: "Read",
};

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) redirect("/");

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) notFound();

  return (
    <main className="flex flex-col min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      {/* Preview banner */}
      <div
        className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-6 py-2 text-xs uppercase tracking-widest"
        style={{ backgroundColor: "var(--clay)", color: "var(--cream)", fontFamily: "var(--font-body)" }}
      >
        <span style={{ opacity: 0.8 }}>Preview — not visible to readers</span>
        <Link
          href={`/admin/field-notes/${id}/edit`}
          style={{ opacity: 0.8 }}
          className="hover:opacity-100 transition-opacity"
        >
          ← Back to editor
        </Link>
      </div>

      <nav className="fixed top-8 left-0 right-0 z-50 flex items-center justify-between px-8 py-6">
        <Link href="/">
          <Logo className="text-[var(--charcoal)]" />
        </Link>
        <Link
          href="/field-notes"
          className="text-sm uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
          style={{ fontFamily: "var(--font-body)", color: "var(--charcoal)", letterSpacing: "0.15em" }}
        >
          ← Field Notes
        </Link>
      </nav>

      <article className="pt-48 pb-24 px-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <span
              className="text-xs uppercase tracking-widest opacity-35"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              {TYPE_LABELS[post.type] ?? post.type}
            </span>
            <span className="opacity-20" style={{ color: "var(--charcoal)" }}>·</span>
            <span
              className="text-xs opacity-35"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              {new Date(post.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {!post.published && (
              <>
                <span className="opacity-20" style={{ color: "var(--charcoal)" }}>·</span>
                <span
                  className="text-xs uppercase tracking-widest"
                  style={{ color: "var(--clay)", fontFamily: "var(--font-body)", opacity: 0.7 }}
                >
                  Draft
                </span>
              </>
            )}
          </div>

          {post.cover_image && (
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full object-cover mb-10"
              style={{ maxHeight: "400px" }}
            />
          )}

          <h1
            className="text-4xl md:text-5xl font-light italic leading-tight mb-12"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
          >
            {post.title}
          </h1>

          <PostRenderer body={post.body} />
        </div>
      </article>

      <footer
        className="py-12 px-8 flex flex-col sm:flex-row items-center justify-between gap-6 mt-auto"
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
