"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { PostEditor } from "@/components/post-editor";

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

export function PostForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("prompt");
  const [published, setPublished] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    setError("");

    const supabase = createClient();
    const { error: err } = await supabase.from("posts").insert({
      title: title.trim(),
      slug: toSlug(title),
      body: body.trim(),
      type,
      published,
      cover_image: coverImage || null,
    });

    if (err) { setError(err.message); setSaving(false); return; }
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

      <button
        onClick={handleSave}
        disabled={saving || !title.trim() || !body.trim()}
        className="px-8 py-3 text-sm uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-40 w-fit"
        style={{
          backgroundColor: "var(--clay)",
          color: "var(--cream)",
          fontFamily: "var(--font-body)",
          letterSpacing: "0.15em",
        }}
      >
        {saving ? "Saving…" : published ? "Publish" : "Save draft"}
      </button>
    </div>
  );
}
