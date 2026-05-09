import { notFound } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase-server";
import { CommentSection } from "./comment-section";

const TYPE_LABELS: Record<string, string> = {
  prompt: "Prompt",
  inspiration: "Inspiration",
  read: "Read",
};

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const [{ data: post }, { data: { user } }] = await Promise.all([
    supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single(),
    supabase.auth.getUser(),
  ]);

  if (!post) notFound();

  const { data: comments } = await supabase
    .from("comments")
    .select("id, body, created_at, user_id, profiles(email)")
    .eq("post_id", post.id)
    .order("created_at", { ascending: true });

  return (
    <main className="flex flex-col min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6">
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

      <article className="pt-40 pb-24 px-8">
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
          </div>

          <h1
            className="text-4xl md:text-5xl font-light italic leading-tight mb-12"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
          >
            {post.title}
          </h1>

          <div
            className="prose prose-sm max-w-none leading-relaxed"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            {post.body.split("\n").filter(Boolean).map((para: string, i: number) => (
              <p key={i} className="mb-5 opacity-70 leading-relaxed text-base">
                {para}
              </p>
            ))}
          </div>

          <div className="mt-12 pt-12 border-t" style={{ borderColor: "var(--border)" }}>
            <CommentSection
              postId={post.id}
              initialComments={comments ?? []}
              currentUserId={user?.id ?? null}
            />
          </div>
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
