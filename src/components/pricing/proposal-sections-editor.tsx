"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import {
  SECTION_META,
  CUSTOM_PRESETS,
  defaultSections,
  newSectionId,
  type QuoteSection,
} from "@/lib/quote-sections";

const label = "text-xs uppercase tracking-wider opacity-50";
const body = { color: "var(--charcoal)", fontFamily: "var(--font-body)" } as const;
const input = "px-3 py-2 text-sm bg-white border outline-none";
const inputStyle = { borderColor: "var(--border)", ...body } as const;
const quiet = "text-xs opacity-40 hover:opacity-80 transition-opacity disabled:opacity-15";

// The "shape your proposal" panel: cover image plus which sections show, in what
// order, under what title. Custom sections hold their own text.
export function ProposalSectionsEditor({
  userId,
  sections,
  onSectionsChange,
  coverImageUrl,
  onCoverChange,
  isEvent,
}: {
  userId: string;
  sections: QuoteSection[];
  onSectionsChange: (s: QuoteSection[]) => void;
  coverImageUrl: string;
  onCoverChange: (url: string) => void;
  isEvent: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  function update(id: string, patch: Partial<QuoteSection>) {
    onSectionsChange(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    onSectionsChange(next);
  }

  function addCustom(preset: { title: string; body: string }) {
    const section: QuoteSection = {
      id: newSectionId(),
      kind: "custom",
      enabled: true,
      title: preset.title,
      body: preset.body,
    };
    // New sections land just above the investment, where stories usually belong.
    const at = sections.findIndex((s) => s.kind === "investment");
    const next = [...sections];
    next.splice(at === -1 ? next.length : at, 0, section);
    onSectionsChange(next);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setUploadError("Please choose an image under 8 MB.");
      return;
    }
    setUploading(true);
    setUploadError("");
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("quote-covers").upload(path, file, { upsert: false });
    if (error) {
      setUploadError(error.message);
    } else {
      onCoverChange(supabase.storage.from("quote-covers").getPublicUrl(path).data.publicUrl);
    }
    setUploading(false);
  }

  return (
    <div className="flex flex-col gap-6 p-5 border" style={{ borderColor: "var(--border)", backgroundColor: "white" }}>
      <div>
        <h3 className="text-lg font-light italic" style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}>
          Shape your proposal
        </h3>
        <p className="text-xs opacity-40 mt-1 leading-relaxed" style={body}>
          Choose what your client sees and in what order. Sections without content stay hidden on their own.
        </p>
      </div>

      {/* Cover image */}
      <div className="flex flex-col gap-2">
        <label className={label} style={body}>
          Cover image <span style={{ opacity: 0.4 }}>(optional)</span>
        </label>
        {coverImageUrl ? (
          <div className="flex items-end gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImageUrl} alt="Cover" className="w-40 h-24 object-cover border" style={{ borderColor: "var(--border)" }} />
            <button type="button" onClick={() => onCoverChange("")} className={quiet} style={{ ...body, color: "var(--destructive)" }}>
              Remove
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <label
              className="px-4 py-2 text-xs uppercase tracking-wider border cursor-pointer hover:opacity-70 transition-opacity"
              style={{ ...body, borderColor: "var(--border)" }}
            >
              {uploading ? "Uploading…" : "Upload image"}
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
            <span className="text-xs opacity-30" style={body}>or paste a link</span>
            <input
              type="url"
              placeholder="https://…"
              onBlur={(e) => e.target.value.trim() && onCoverChange(e.target.value.trim())}
              className={`${input} flex-1 min-w-40`}
              style={inputStyle}
            />
          </div>
        )}
        {uploadError && (
          <p className="text-xs" style={{ ...body, color: "var(--destructive)" }}>
            {uploadError}
          </p>
        )}
        <p className="text-xs opacity-30" style={body}>
          A wide, landscape image works best. It fills the top of the proposal behind the title.
        </p>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className={label} style={body}>
            Sections
          </label>
          <button type="button" onClick={() => onSectionsChange(defaultSections())} className={quiet} style={body}>
            Reset layout
          </button>
        </div>

        {sections.map((s, i) => {
          const hint = s.kind === "custom" ? "Your own section" : SECTION_META[s.kind].hint;
          return (
            <div
              key={s.id}
              className="flex flex-col gap-2 p-3 border transition-opacity"
              style={{ borderColor: "var(--border)", opacity: s.enabled ? 1 : 0.55 }}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={s.enabled}
                  onChange={(e) => update(s.id, { enabled: e.target.checked })}
                  aria-label={`Show ${s.title || "section"}`}
                  className="w-4 h-4 shrink-0"
                  style={{ accentColor: "var(--clay)" }}
                />
                <div className="flex-1 min-w-0 flex flex-col">
                  <input
                    type="text"
                    value={s.title}
                    onChange={(e) => update(s.id, { title: e.target.value })}
                    placeholder="Section title"
                    className="text-sm bg-transparent outline-none border-b border-transparent focus:border-current py-0.5"
                    style={body}
                  />
                  <span className="text-xs opacity-35" style={body}>
                    {hint}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={quiet} style={body} aria-label="Move up">
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === sections.length - 1}
                    className={quiet}
                    style={body}
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  {s.kind === "custom" && (
                    <button
                      type="button"
                      onClick={() => onSectionsChange(sections.filter((x) => x.id !== s.id))}
                      className={quiet}
                      style={{ ...body, color: "var(--destructive)" }}
                      aria-label="Remove section"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {s.kind === "custom" && s.enabled && (
                <textarea
                  value={s.body ?? ""}
                  onChange={(e) => update(s.id, { body: e.target.value })}
                  placeholder="Write anything you'd love your client to know…"
                  rows={3}
                  className={`${input} resize-y leading-relaxed ml-7`}
                  style={inputStyle}
                />
              )}

              {s.kind === "investment" && s.enabled && isEvent && (
                <label className="flex items-center gap-2 ml-7 text-xs opacity-60 cursor-pointer" style={body}>
                  <input
                    type="checkbox"
                    checked={s.detailed ?? true}
                    onChange={(e) => update(s.id, { detailed: e.target.checked })}
                    style={{ accentColor: "var(--clay)" }}
                  />
                  Show hourly cost breakdown (helpful for grants and approvals)
                </label>
              )}
            </div>
          );
        })}

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
          {CUSTOM_PRESETS.map((p) => (
            <button
              key={p.title || "blank"}
              type="button"
              onClick={() => addCustom(p)}
              className="text-xs uppercase tracking-wider opacity-40 hover:opacity-70 transition-opacity"
              style={body}
            >
              + {p.title || "Blank section"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
