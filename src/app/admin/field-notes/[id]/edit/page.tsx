import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { EditPostForm } from "./edit-post-form";

const ADMIN_EMAIL = "aida@aidavisuals.com";

export default async function EditPostPage({
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
    <main className="min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      <div
        className="px-8 py-6 flex items-center justify-between border-b"
        style={{ borderColor: "var(--border)", backgroundColor: "white" }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="text-xs uppercase tracking-widest opacity-40 hover:opacity-70 transition-opacity"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            ← Admin
          </Link>
          <span className="opacity-20" style={{ color: "var(--charcoal)" }}>·</span>
          <p
            className="text-xs uppercase tracking-widest opacity-40"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            Edit post
          </p>
        </div>
        {post.published && (
          <Link
            href={`/field-notes/${post.slug}`}
            target="_blank"
            className="text-xs uppercase tracking-widest opacity-40 hover:opacity-70 transition-opacity"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            View live →
          </Link>
        )}
      </div>
      <div className="px-8 py-10 max-w-2xl">
        <EditPostForm post={post} />
      </div>
    </main>
  );
}
