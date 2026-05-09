"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export function AdminPostActions({ postId }: { postId: string }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("posts").delete().eq("id", postId);
    router.push("/field-notes");
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-2 border"
      style={{ backgroundColor: "white", borderColor: "var(--border)" }}
    >
      <a
        href={`/admin/field-notes/${postId}/edit`}
        className="text-xs uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
        style={{ color: "var(--clay)", fontFamily: "var(--font-body)" }}
      >
        Edit
      </a>
      <span className="opacity-20" style={{ color: "var(--charcoal)" }}>·</span>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="text-xs uppercase tracking-widest opacity-25 hover:opacity-70 transition-opacity"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
      >
        {deleting ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}
