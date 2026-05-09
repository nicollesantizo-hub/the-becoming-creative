"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

interface Post {
  id: string;
  title: string;
  slug: string;
  body: string;
  type: string;
  published: boolean;
}

export function EditPostForm({ post }: { post: Post }) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body);
  const [type, setType] = useState(post.type);
  const [published, setPublished] = useState(post.published);
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
      .update({ title: title.trim(), slug: toSlug(title), body: body.trim(), type, published })
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

  const inputClass = "w-full px-4 py-3 border outline-none text-sm";
  const inputStyle = {
    fontFamily: "var(--font-body)",
    color: "var(--charcoal)",
    backgroundColor: "white",
    borderColor: "var(--border)",
  };
  const labelStyle = { fontFamily: "var(--font-body)", color: "var(--charcoal)" };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-widest opacity-40" style={labelStyle}>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          style={inputStyle}
        />
        <p className="text-xs opacity-30 px-1" style={labelStyle}>
          slug: /field-notes/{toSlug(title)}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-widest opacity-40" style={labelStyle}>Type</label>
        <div className="flex gap-2">
          {["prompt", "inspiration", "read"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className="px-4 py-2 text-xs uppercase tracking-widest border transition-colors"
              style={{
                fontFamily: "var(--font-body)",
                borderColor: type === t ? "var(--clay)" : "var(--border)",
                backgroundColor: type === t ? "rgba(139,111,94,0.08)" : "white",
                color: "var(--charcoal)",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-widest opacity-40" style={labelStyle}>Body</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={14}
          className="w-full px-4 py-3 border outline-none text-sm resize-none"
          style={inputStyle}
        />
      </div>

      <button
        onClick={() => setPublished((v) => !v)}
        className="flex items-center gap-2 text-sm w-fit"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
      >
        <div
          className="w-9 h-5 rounded-full relative transition-colors"
          style={{ backgroundColor: published ? "var(--clay)" : "var(--border)" }}
        >
          <div
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
            style={{ left: published ? "18px" : "2px" }}
          />
        </div>
        <span className="opacity-60">{published ? "Published" : "Draft"}</span>
      </button>

      {error && (
        <p className="text-xs" style={{ color: "var(--destructive)", fontFamily: "var(--font-body)" }}>{error}</p>
      )}

      <div className="flex items-center justify-between pt-2">
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
