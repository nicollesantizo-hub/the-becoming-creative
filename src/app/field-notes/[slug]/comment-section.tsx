"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

interface Comment {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  profiles: { email: string }[] | null;
}

interface Props {
  postId: string;
  postTitle: string;
  postSlug: string;
  initialComments: Comment[];
  currentUserId: string | null;
}

export function CommentSection({ postId, postTitle, postSlug, initialComments, currentUserId }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || !currentUserId) return;
    setSubmitting(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: postId, user_id: currentUserId, body: body.trim() })
      .select("id, body, created_at, user_id, profiles(email)")
      .single();

    if (!error && data) {
      setComments((prev) => [...prev, data as Comment]);
      setBody("");
      const commenterEmail = (data as Comment).profiles?.[0]?.email ?? "";
      fetch("/api/email/new-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postTitle, postSlug, commentBody: body.trim(), commenterEmail }),
      }).catch(() => {});
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (!error) setComments((prev) => prev.filter((c) => c.id !== id));
  }

  const inputStyle = {
    fontFamily: "var(--font-body)",
    color: "var(--charcoal)",
    backgroundColor: "white",
    borderColor: "var(--border)",
  };

  return (
    <div className="mt-16">
      <p
        className="text-xs uppercase tracking-widest opacity-35 mb-8"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
      >
        {comments.length === 0 ? "No responses yet" : `${comments.length} ${comments.length === 1 ? "Response" : "Responses"}`}
      </p>

      <div className="flex flex-col gap-6 mb-12">
        {comments.map((comment) => (
          <div key={comment.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <p
                className="text-xs opacity-35"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                {comment.profiles?.[0]?.email?.split("@")[0] ?? "creative"} ·{" "}
                {new Date(comment.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
              {currentUserId === comment.user_id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-xs opacity-25 hover:opacity-50 transition-opacity"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                >
                  Delete
                </button>
              )}
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", opacity: 0.75 }}
            >
              {comment.body}
            </p>
          </div>
        ))}
      </div>

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Leave a response…"
            rows={4}
            className="w-full px-4 py-3 border outline-none text-sm resize-none"
            style={inputStyle}
          />
          <div>
            <button
              type="submit"
              disabled={submitting || !body.trim()}
              className="px-6 py-3 text-sm uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{
                backgroundColor: "var(--charcoal)",
                color: "var(--cream)",
                fontFamily: "var(--font-body)",
                letterSpacing: "0.15em",
              }}
            >
              {submitting ? "Posting…" : "Post response"}
            </button>
          </div>
        </form>
      ) : (
        <p
          className="text-sm opacity-40"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
        >
          <a href="/auth/signin" style={{ color: "var(--clay)", textDecoration: "underline" }}>
            Sign in
          </a>{" "}
          to leave a response.
        </p>
      )}
    </div>
  );
}
