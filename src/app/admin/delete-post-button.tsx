"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export function DeletePostButton({ postId }: { postId: string }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("posts").delete().eq("id", postId);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs uppercase tracking-widest opacity-25 hover:opacity-60 transition-opacity disabled:opacity-20"
      style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
    >
      {deleting ? "…" : "Delete"}
    </button>
  );
}
