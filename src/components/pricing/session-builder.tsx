"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { fmt, calcSessionPrice } from "@/lib/pricing";
import type { SessionType, CODBResults } from "@/types/pricing";

const LOCATION_TYPES = [
  { value: "outdoor", label: "Outdoor" },
  { value: "studio", label: "Studio" },
  { value: "travel", label: "Travel" },
  { value: "event", label: "Event" },
  { value: "other", label: "Other" },
] as const;

const EMPTY_SESSION: Omit<SessionType, "id" | "user_id" | "created_at"> = {
  name: "",
  location_type: "outdoor",
  duration_hours: 2,
  editing_hours: 2,
  travel_miles: 0,
  travel_rate_per_mile: 0.67,
  studio_hourly_rate: 0,
  editing_hourly_rate: 0,
  shooting_hourly_rate: 0,
  profit_margin: 30,
  event_days: 1,
};


export function SessionBuilder({
  initialSessions,
  userId,
  codb,
  isPro,
}: {
  initialSessions: SessionType[];
  userId: string;
  codb: CODBResults | null;
  isPro: boolean;
}) {
  const [sessions, setSessions] = useState<SessionType[]>(initialSessions);
  const [form, setForm] = useState(EMPTY_SESSION);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(initialSessions.length === 0);

  const canAddMore = isPro || sessions.length < 1;

  function updateForm(key: keyof typeof EMPTY_SESSION, value: string | number) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startEdit(session: SessionType) {
    setForm({
      name: session.name,
      location_type: session.location_type,
      duration_hours: session.duration_hours,
      editing_hours: session.editing_hours,
      travel_miles: session.travel_miles,
      travel_rate_per_mile: session.travel_rate_per_mile,
      studio_hourly_rate: session.studio_hourly_rate ?? 0,
      editing_hourly_rate: session.editing_hourly_rate ?? 0,
      shooting_hourly_rate: session.shooting_hourly_rate ?? 0,
      profit_margin: session.profit_margin,
      event_days: session.event_days ?? 1,
    });
    setEditingId(session.id ?? null);
    setShowForm(true);
  }

  function cancelForm() {
    setForm(EMPTY_SESSION);
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    const supabase = createClient();

    if (editingId) {
      const { data, error } = await supabase
        .from("session_types")
        .update({ ...form })
        .eq("id", editingId)
        .eq("user_id", userId)
        .select()
        .single();
      if (!error && data) {
        setSessions((prev) => prev.map((s) => (s.id === editingId ? data : s)));
      }
    } else {
      const { data, error } = await supabase
        .from("session_types")
        .insert({ ...form, user_id: userId })
        .select()
        .single();
      if (!error && data) {
        setSessions((prev) => [...prev, data]);
      }
    }

    setSaving(false);
    cancelForm();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("session_types").delete().eq("id", id).eq("user_id", userId);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  const eventDays = 1;
  const previewPrice = codb ? calcSessionPrice({ ...form, travel_miles: 0 }, codb) : null;
  const studioCost = (form.studio_hourly_rate ?? 0) * form.duration_hours * eventDays;
  const editingCost = (form.editing_hourly_rate ?? 0) * form.editing_hours * eventDays;
  const shootingCost = (form.shooting_hourly_rate ?? 0) * form.duration_hours * eventDays;

  return (
    <div className="max-w-2xl">
      {/* Saved sessions list */}
      {sessions.length > 0 && (
        <div className="mb-10">
          <h2
            className="text-xl font-light italic mb-5"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
          >
            Your Session Types
          </h2>
          <div className="flex flex-col gap-3">
            {sessions.map((session) => {
              const price = codb ? calcSessionPrice({ ...session, travel_miles: 0 }, codb) : null;
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-5 border"
                  style={{ borderColor: "var(--border)", backgroundColor: "white" }}
                >
                  <div className="flex flex-col gap-1">
                    <p
                      className="text-base font-medium"
                      style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                    >
                      {session.name}
                    </p>
                    <p
                      className="text-xs opacity-50"
                      style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                    >
                      {session.location_type} · {session.duration_hours}h shoot ·{" "}
                      {session.editing_hours}h edit ·{" "}
                      {session.profit_margin}% margin
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    {price !== null && (
                      <span
                        className="text-lg font-light italic"
                        style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
                      >
                        {fmt(price)}
                      </span>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={() => startEdit(session)}
                        className="text-xs uppercase tracking-wider opacity-40 hover:opacity-80 transition-opacity"
                        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => session.id && handleDelete(session.id)}
                        className="text-xs uppercase tracking-wider opacity-30 hover:opacity-70 transition-opacity"
                        style={{ color: "var(--destructive)", fontFamily: "var(--font-body)" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit form */}
      {!showForm && canAddMore && (
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 text-sm uppercase tracking-widest transition-opacity hover:opacity-80 border"
          style={{
            borderColor: "var(--clay)",
            color: "var(--clay)",
            fontFamily: "var(--font-body)",
            letterSpacing: "0.15em",
          }}
        >
          + New session type
        </button>
      )}

      {!canAddMore && !showForm && (
        <div
          className="p-5 border-l-2"
          style={{ borderColor: "var(--clay)", backgroundColor: "var(--sand)" }}
        >
          <p
            className="text-sm opacity-70"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            Free plan includes 1 session type.{" "}
            <a
              href="/pricing/upgrade"
              className="underline opacity-100 hover:opacity-70 transition-opacity"
              style={{ color: "var(--clay)" }}
            >
              Upgrade to Pro
            </a>{" "}
            for unlimited.
          </p>
        </div>
      )}

      {showForm && (
        <div>
          {/* Approach explainer */}
          <div
            className="p-5 mb-8"
            style={{ backgroundColor: "var(--sand)" }}
          >
            <p
              className="text-xs uppercase tracking-widest opacity-50 mb-3"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              How pricing works — choose your approach
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                  Approach 1 — CODB-based
                </p>
                <p className="text-xs opacity-60 leading-relaxed" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                  Set your income goal in the Calculator. Leave shooting &amp; editing rates at $0 — your CODB minimum already covers all your time spread across sessions.
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                  Approach 2 — Hourly billing
                </p>
                <p className="text-xs opacity-60 leading-relaxed" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                  Set desired income to $0 in the Calculator (expenses only). Use shooting + editing rates here to charge for your time explicitly per session.
                </p>
              </div>
            </div>
          </div>

          <h2
            className="text-xl font-light italic mb-6"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
          >
            {editingId ? "Edit Session Type" : "New Session Type"}
          </h2>

          <div className="flex flex-col gap-5 mb-8">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs uppercase tracking-wider opacity-50"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Session Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                placeholder="e.g. Outdoor Portrait, Family Session…"
                className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors"
                style={{
                  borderColor: "var(--border)",
                  fontFamily: "var(--font-body)",
                  color: "var(--charcoal)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Location type */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs uppercase tracking-wider opacity-50"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Session Type
              </label>
              <div className="flex flex-wrap gap-2">
                {LOCATION_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => updateForm("location_type", t.value)}
                    className="px-4 py-1.5 text-xs uppercase tracking-wider border transition-colors"
                    style={{
                      fontFamily: "var(--font-body)",
                      borderColor: form.location_type === t.value ? "var(--clay)" : "var(--border)",
                      backgroundColor: form.location_type === t.value ? "var(--clay)" : "white",
                      color: form.location_type === t.value ? "var(--cream)" : "var(--charcoal)",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration & Editing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs uppercase tracking-wider opacity-50"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                >
                  {eventDays > 1 ? "Shoot Duration (hrs/day)" : "Shoot Duration (hrs)"}
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={form.duration_hours || ""}
                  onChange={(e) => updateForm("duration_hours", parseFloat(e.target.value) || 0)}
                  className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors"
                  style={{
                    borderColor: "var(--border)",
                    fontFamily: "var(--font-body)",
                    color: "var(--charcoal)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs uppercase tracking-wider opacity-50"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                >
                  {eventDays > 1 ? "Editing Time (hrs/day)" : "Editing Time (hrs)"}
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={form.editing_hours || ""}
                  onChange={(e) => updateForm("editing_hours", parseFloat(e.target.value) || 0)}
                  className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors"
                  style={{
                    borderColor: "var(--border)",
                    fontFamily: "var(--font-body)",
                    color: "var(--charcoal)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            </div>

            {/* Travel rate */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs uppercase tracking-wider opacity-50"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Rate per mile ($)
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.travel_rate_per_mile || ""}
                onChange={(e) =>
                  updateForm("travel_rate_per_mile", parseFloat(e.target.value) || 0)
                }
                className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors"
                style={{
                  borderColor: "var(--border)",
                  fontFamily: "var(--font-body)",
                  color: "var(--charcoal)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Editing rate */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs uppercase tracking-wider opacity-50"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Editing hourly rate ($/hr — leave 0 to skip)
              </label>
              <input
                type="number"
                min={0}
                step={5}
                value={form.editing_hourly_rate || ""}
                placeholder="0"
                onChange={(e) => updateForm("editing_hourly_rate", parseFloat(e.target.value) || 0)}
                className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors"
                style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
              <p
                className="text-xs opacity-40"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Multiplied by editing hours — add this if you want editing billed separately on top of your CODB minimum
              </p>
            </div>

            {/* Shooting rate */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs uppercase tracking-wider opacity-50"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Shooting hourly rate ($/hr — leave 0 to skip)
              </label>
              <input
                type="number"
                min={0}
                step={5}
                value={form.shooting_hourly_rate || ""}
                placeholder="0"
                onChange={(e) => updateForm("shooting_hourly_rate", parseFloat(e.target.value) || 0)}
                className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors"
                style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
              <p
                className="text-xs opacity-40"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Multiplied by shoot duration — use with Approach 2 (set desired income to $0 in Calculator)
              </p>
            </div>

            {/* Studio rental */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs uppercase tracking-wider opacity-50"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Studio rental rate ($/hr — leave 0 if not applicable)
              </label>
              <input
                type="number"
                min={0}
                step={5}
                value={form.studio_hourly_rate || ""}
                placeholder="0"
                onChange={(e) => updateForm("studio_hourly_rate", parseFloat(e.target.value) || 0)}
                className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors"
                style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
              <p
                className="text-xs opacity-40"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Will be multiplied by shoot duration to calculate total studio cost
              </p>
            </div>

            {/* Profit margin */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs uppercase tracking-wider opacity-50"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Profit margin / growth buffer (%)
              </label>
              <input
                type="number"
                min={0}
                max={200}
                step={5}
                value={form.profit_margin || ""}
                onChange={(e) => updateForm("profit_margin", parseFloat(e.target.value) || 0)}
                className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors"
                style={{
                  borderColor: "var(--border)",
                  fontFamily: "var(--font-body)",
                  color: "var(--charcoal)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
              <p
                className="text-xs opacity-40"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Added on top of your minimum rate for business savings & growth
              </p>
            </div>
          </div>

          {/* Live price preview */}
          {codb && (
            <div
              className="p-5 mb-6"
              style={{ backgroundColor: "var(--sand)" }}
            >
              <p
                className="text-xs uppercase tracking-widest opacity-40 mb-3"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Price preview
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-sm opacity-60" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                    Minimum per session (from CODB)
                  </span>
                  <span className="text-sm" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                    {fmt(codb.minimumPerSession)}
                  </span>
                </div>
                {studioCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm opacity-60" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                      Studio rental (${form.studio_hourly_rate}/hr × {form.duration_hours}h{eventDays > 1 ? ` × ${eventDays}d` : ""})
                    </span>
                    <span className="text-sm" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                      {fmt(studioCost)}
                    </span>
                  </div>
                )}
                {shootingCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm opacity-60" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                      Shooting (${form.shooting_hourly_rate}/hr × {form.duration_hours}h{eventDays > 1 ? ` × ${eventDays}d` : ""})
                    </span>
                    <span className="text-sm" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                      {fmt(shootingCost)}
                    </span>
                  </div>
                )}
                {editingCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm opacity-60" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                      Editing (${form.editing_hourly_rate}/hr × {form.editing_hours}h{eventDays > 1 ? ` × ${eventDays}d` : ""})
                    </span>
                    <span className="text-sm" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                      {fmt(editingCost)}
                    </span>
                  </div>
                )}
                <div
                  className="flex justify-between pt-2"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <span
                    className="text-base font-medium"
                    style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                  >
                    Suggested price (+{form.profit_margin}%)
                  </span>
                  <span
                    className="text-xl font-light italic"
                    style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
                  >
                    {fmt(previewPrice ?? 0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {!codb && (
            <div
              className="p-4 mb-6 border-l-2"
              style={{ borderColor: "var(--clay)", backgroundColor: "var(--sand)" }}
            >
              <p
                className="text-sm opacity-70"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Set up your Calculator first to see live price calculations.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="px-8 py-3 text-sm uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{
                backgroundColor: "var(--clay)",
                color: "var(--cream)",
                fontFamily: "var(--font-body)",
                letterSpacing: "0.15em",
              }}
            >
              {saving ? "Saving…" : editingId ? "Update session" : "Save session"}
            </button>
            <button
              onClick={() => setForm(EMPTY_SESSION)}
              className="px-6 py-3 text-sm uppercase tracking-wider opacity-40 hover:opacity-70 transition-opacity"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              Clear
            </button>
            <button
              onClick={cancelForm}
              className="px-6 py-3 text-sm uppercase tracking-wider opacity-30 hover:opacity-60 transition-opacity"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
