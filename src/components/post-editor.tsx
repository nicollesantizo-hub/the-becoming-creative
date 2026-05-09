"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase";

interface Props {
  title: string;
  body: string;
  type: string;
  published: boolean;
  coverImage: string;
  onChangeTitle: (v: string) => void;
  onChangeBody: (v: string) => void;
  onChangeType: (v: string) => void;
  onChangePublished: (v: boolean) => void;
  onChangeCoverImage: (v: string) => void;
  slug?: string;
  postId?: string;
}

function renderMarkdown(text: string) {
  return text
    .split("\n")
    .map((line, i) => {
      if (line.startsWith("> ")) {
        return (
          <blockquote
            key={i}
            style={{
              borderLeft: "3px solid var(--clay)",
              paddingLeft: "16px",
              color: "var(--charcoal)",
              opacity: 0.6,
              fontStyle: "italic",
              margin: "8px 0",
            }}
          >
            {applyInline(line.slice(2))}
          </blockquote>
        );
      }
      if (line === "") return <br key={i} />;
      return (
        <p key={i} style={{ marginBottom: "16px", lineHeight: 1.75, opacity: 0.75 }}>
          {applyInline(line)}
        </p>
      );
    });
}

function applyInline(text: string) {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let last = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[0].startsWith("**")) {
      parts.push(<strong key={match.index}>{match[2]}</strong>);
    } else {
      parts.push(<em key={match.index}>{match[3]}</em>);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function PostEditor({
  title, body, type, published, coverImage,
  onChangeTitle, onChangeBody, onChangeType, onChangePublished, onChangeCoverImage,
  slug, postId,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);

  function wrap(before: string, after: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = body.slice(start, end);
    const newBody =
      body.slice(0, start) + before + (selected || "text") + after + body.slice(end);
    onChangeBody(newBody);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(
        start + before.length,
        start + before.length + (selected || "text").length
      );
    }, 0);
  }

  function insertQuote() {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = body.lastIndexOf("\n", start - 1) + 1;
    const newBody = body.slice(0, lineStart) + "> " + body.slice(lineStart);
    onChangeBody(newBody);
    setTimeout(() => ta.focus(), 0);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("post-images")
      .upload(path, file, { upsert: true });

    if (!error) {
      const { data } = supabase.storage.from("post-images").getPublicUrl(path);
      onChangeCoverImage(data.publicUrl);
    }
    setUploading(false);
  }

  const inputStyle = {
    fontFamily: "var(--font-body)",
    color: "var(--charcoal)",
    backgroundColor: "white",
    borderColor: "var(--border)",
  };
  const labelStyle = { fontFamily: "var(--font-body)", color: "var(--charcoal)" };
  const btnStyle = (active?: boolean) => ({
    fontFamily: "var(--font-body)",
    color: "var(--charcoal)",
    backgroundColor: active ? "rgba(139,111,94,0.1)" : "white",
    border: "1px solid var(--border)",
    cursor: "pointer",
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Cover image */}
      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-widest opacity-40" style={labelStyle}>
          Cover photo
        </label>
        {coverImage ? (
          <div className="relative">
            <img
              src={coverImage}
              alt="Cover"
              className="w-full object-cover"
              style={{ maxHeight: "280px" }}
            />
            <button
              onClick={() => onChangeCoverImage("")}
              className="absolute top-3 right-3 px-3 py-1.5 text-xs uppercase tracking-widest"
              style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "white", fontFamily: "var(--font-body)" }}
            >
              Remove
            </button>
          </div>
        ) : (
          <label
            className="flex items-center justify-center border-2 border-dashed cursor-pointer transition-colors hover:border-[var(--clay)]"
            style={{ borderColor: "var(--border)", height: "140px" }}
          >
            <div className="text-center">
              <p className="text-sm opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                {uploading ? "Uploading…" : "Click to upload a photo"}
              </p>
              <p className="text-xs opacity-25 mt-1" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                JPG, PNG, WEBP
              </p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        )}
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-widest opacity-40" style={labelStyle}>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onChangeTitle(e.target.value)}
          placeholder="What made you pick up a camera?"
          className="w-full px-4 py-3 border outline-none text-sm"
          style={inputStyle}
        />
        {title && slug !== undefined && (
          <p className="text-xs opacity-30 px-1" style={labelStyle}>
            slug: /field-notes/{slug}
          </p>
        )}
      </div>

      {/* Type */}
      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-widest opacity-40" style={labelStyle}>Type</label>
        <div className="flex gap-2">
          {["prompt", "inspiration", "read"].map((t) => (
            <button
              key={t}
              onClick={() => onChangeType(t)}
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

      {/* Body */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs uppercase tracking-widest opacity-40" style={labelStyle}>Body</label>
          {postId ? (
            <a
              href={`/admin/field-notes/${postId}/preview`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-widest opacity-40 hover:opacity-70 transition-opacity"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              Preview ↗
            </a>
          ) : (
            <button
              onClick={() => setPreview((v) => !v)}
              className="text-xs uppercase tracking-widest opacity-40 hover:opacity-70 transition-opacity"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              {preview ? "Edit" : "Preview"}
            </button>
          )}
        </div>

        {!preview && (
          <div className="flex gap-1 mb-1">
            {[
              { label: "B", title: "Bold", action: () => wrap("**", "**") },
              { label: "I", title: "Italic", action: () => wrap("*", "*") },
              { label: "❝", title: "Quote", action: insertQuote },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={btn.action}
                title={btn.title}
                className="w-8 h-8 text-sm border flex items-center justify-center transition-colors hover:bg-[rgba(139,111,94,0.08)]"
                style={btnStyle()}
              >
                {btn.label}
              </button>
            ))}
            <p className="ml-2 text-xs opacity-25 self-center" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
              Select text then click
            </p>
          </div>
        )}

        {preview ? (
          <div
            className="w-full px-4 py-4 border min-h-[280px] text-sm"
            style={{ ...inputStyle, backgroundColor: "var(--sand)" }}
          >
            {body ? renderMarkdown(body) : (
              <p style={{ opacity: 0.3, fontFamily: "var(--font-body)", color: "var(--charcoal)" }}>Nothing to preview yet.</p>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => onChangeBody(e.target.value)}
            placeholder={"Write your post…\n\nSeparate paragraphs with a blank line.\nSelect text and use the toolbar above to format."}
            rows={14}
            className="w-full px-4 py-3 border outline-none text-sm resize-none"
            style={inputStyle}
          />
        )}
      </div>

      {/* Publish toggle */}
      <button
        onClick={() => onChangePublished(!published)}
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
    </div>
  );
}
