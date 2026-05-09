import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

const ADMIN_EMAIL = "aida@aidavisuals.com";

const TYPE_LABELS: Record<string, string> = {
  prompt: "Prompt",
  inspiration: "Inspiration",
  read: "Read",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) redirect("/");

  const [{ data: posts }, { count: memberCount }, { count: waitlistCount }] = await Promise.all([
    supabase
      .from("posts")
      .select("id, title, slug, type, published, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("waitlist").select("*", { count: "exact", head: true }),
  ]);

  const published = posts?.filter((p) => p.published) ?? [];
  const drafts = posts?.filter((p) => !p.published) ?? [];

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      {/* Header */}
      <div
        className="px-8 py-6 flex items-center justify-between border-b"
        style={{ borderColor: "var(--border)", backgroundColor: "white" }}
      >
        <div>
          <p
            className="text-xs uppercase tracking-widest opacity-40 mb-1"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            The Becoming Creative
          </p>
          <h1
            className="text-xl font-light italic"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
          >
            Admin
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/field-notes"
            className="text-xs uppercase tracking-widest opacity-40 hover:opacity-70 transition-opacity"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            View site →
          </Link>
          <Link
            href="/admin/field-notes/new"
            className="px-5 py-2.5 text-xs uppercase tracking-widest transition-opacity hover:opacity-80"
            style={{
              backgroundColor: "var(--clay)",
              color: "var(--cream)",
              fontFamily: "var(--font-body)",
              letterSpacing: "0.15em",
            }}
          >
            + New post
          </Link>
        </div>
      </div>

      <div className="px-8 py-10 max-w-3xl">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {[
            { label: "Members", value: memberCount ?? 0 },
            { label: "Waitlist", value: waitlistCount ?? 0 },
            { label: "Total posts", value: posts?.length ?? 0 },
            { label: "Published", value: published.length },
            { label: "Drafts", value: drafts.length },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-5 border"
              style={{ borderColor: "var(--border)", backgroundColor: "white" }}
            >
              <p
                className="text-3xl font-light italic mb-1"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
              >
                {stat.value}
              </p>
              <p
                className="text-xs uppercase tracking-widest opacity-35"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Drafts */}
        {drafts.length > 0 && (
          <div className="mb-10">
            <p
              className="text-xs uppercase tracking-widest opacity-35 mb-4"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              Drafts
            </p>
            <div className="flex flex-col gap-2">
              {drafts.map((post) => (
                <PostRow key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}

        {/* Published */}
        <div>
          <p
            className="text-xs uppercase tracking-widest opacity-35 mb-4"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            Published
          </p>
          {published.length === 0 ? (
            <p
              className="text-sm opacity-40"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              No published posts yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {published.map((post) => (
                <PostRow key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function PostRow({ post }: { post: { id: string; title: string; slug: string; type: string; published: boolean; created_at: string } }) {
  const TYPE_LABELS: Record<string, string> = {
    prompt: "Prompt",
    inspiration: "Inspiration",
    read: "Read",
  };

  return (
    <div
      className="flex items-center justify-between gap-4 px-5 py-4 border"
      style={{ borderColor: "var(--border)", backgroundColor: "white" }}
    >
      <div className="flex items-center gap-4 min-w-0">
        <span
          className="text-xs uppercase tracking-widest opacity-35 shrink-0"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
        >
          {TYPE_LABELS[post.type] ?? post.type}
        </span>
        <p
          className="text-sm truncate"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
        >
          {post.title}
        </p>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <span
          className="text-xs opacity-30"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
        >
          {new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
        <Link
          href={`/admin/field-notes/${post.id}/edit`}
          className="text-xs uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: "var(--clay)", fontFamily: "var(--font-body)" }}
        >
          Edit
        </Link>
        {post.published && (
          <Link
            href={`/field-notes/${post.slug}`}
            target="_blank"
            className="text-xs uppercase tracking-widest opacity-30 hover:opacity-60 transition-opacity"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            View →
          </Link>
        )}
      </div>
    </div>
  );
}
