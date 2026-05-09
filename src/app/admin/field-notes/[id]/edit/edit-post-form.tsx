"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { PostEditor } from "@/components/post-editor";

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

interface Post {
  id: string;
  title: string;
  slug: string;
  body: string;
  type: string;
  published: boolean;
  cover_image: string | null;
}

export function EditPostForm({ post }: { post: Post }) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body);
  const [type, setType] = useState(post.type);
  const [published, setPublished] = useState(post.published);
  const [coverImage, setCoverImage] = useState(post.cover_image ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    setError("");

    const supabase = createClient();
    const { error: err } = await supabase
      .from("posts")
      .update({
        title: title.trim(),
        slug: toSlug(title),
        body: body.trim(),
        type,
        published,
        cover_image: coverImage || null,
      })
      .eq("id", post.id);

    if (err) { setError(err.message); setSaving(false); return; }
    router.push("/admin");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("posts").delete().eq("id", post.id);
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <PostEditor
        title={title}
        body={body}
        type={type}
        published={published}
        coverImage={coverImage}
        onChangeTitle={setTitle}
        onChangeBody={setBody}
        onChangeType={setType}
        onChangePublished={setPublished}
        onChangeCoverImage={setCoverImage}
        slug={toSlug(title)}
      />

      {error && (
        <p className="text-xs" style={{ color: "var(--destructive)", fontFamily: "var(--font-body)" }}>{error}</p>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={handleSave}
          disabled={saving || !title.trim() || !body.trim()}
          className="px-8 py-3 text-sm uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{
            backgroundColor: "var(--clay)",
            color: "var(--cream)",
            fontFamily: "var(--font-body)",
            letterSpacing: "0.15em",
          }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs uppercase tracking-widest opacity-25 hover:opacity-60 transition-opacity"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
        >
          {deleting ? "Deleting…" : "Delete post"}
        </button>
      </div>
    </div>
  );
}
