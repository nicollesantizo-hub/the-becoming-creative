"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { Trash2, Plus, ChevronDown, ChevronUp, Check, Lock } from "lucide-react";
import type {
  PlannerShoot,
  PlannerBooking,
  PlannerEdit,
  PlannerContent,
  PlannerInspo,
  InspoCollaborator,
  InspoImage,
  ChecklistItem,
  TimelineEntry,
} from "@/types/pricing";

type Tab = "shoots" | "bookings" | "edits" | "content" | "inspo";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function inputStyle(focused: boolean) {
  return {
    borderColor: focused ? "var(--clay)" : "var(--border)",
    fontFamily: "var(--font-body)",
    color: "var(--charcoal)",
  };
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs uppercase tracking-widest opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="px-3 py-2 text-sm border bg-white outline-none transition-colors"
        style={inputStyle(focused)}
      />
    </div>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs uppercase tracking-widest opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
        {label}
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="px-3 py-2 text-sm border bg-white outline-none transition-colors"
        style={inputStyle(focused)}
      />
    </div>
  );
}

function TextareaInput({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs uppercase tracking-widest opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
        {label}
      </label>
      <textarea
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="px-3 py-2 text-sm border bg-white outline-none transition-colors resize-none"
        style={inputStyle(focused)}
      />
    </div>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs uppercase tracking-widest opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="px-3 py-2 text-sm border bg-white outline-none transition-colors"
        style={inputStyle(focused)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ProGate() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-5 py-20 px-8 text-center"
      style={{ backgroundColor: "var(--sand)" }}
    >
      <div
        className="w-10 h-10 flex items-center justify-center rounded-full"
        style={{ backgroundColor: "var(--charcoal)" }}
      >
        <Lock size={18} style={{ color: "var(--cream)" }} />
      </div>
      <div>
        <p className="text-lg font-light italic mb-1" style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}>
          Pro feature
        </p>
        <p className="text-sm opacity-50 max-w-xs" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}>
          Upgrade to unlock all four planner sections, plus PDF export and digital template download.
        </p>
      </div>
      <a
        href="/pricing/upgrade"
        className="px-6 py-3 text-sm uppercase tracking-widest transition-opacity hover:opacity-80"
        style={{ backgroundColor: "var(--clay)", color: "var(--cream)", fontFamily: "var(--font-body)", letterSpacing: "0.15em" }}
      >
        Upgrade to Pro →
      </a>
    </div>
  );
}

// ─── Checklist ──────────────────────────────────────────────────────────────

function ChecklistEditor({
  label,
  items,
  onChange,
}: {
  label: string;
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}) {
  const [newText, setNewText] = useState("");

  function addItem() {
    const text = newText.trim();
    if (!text) return;
    onChange([...items, { id: uid(), text, checked: false }]);
    setNewText("");
  }

  function toggleItem(id: string) {
    onChange(items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  }

  function removeItem(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs uppercase tracking-widest opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
        {label}
      </p>
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 group">
            <button
              onClick={() => toggleItem(item.id)}
              className="w-5 h-5 flex items-center justify-center border flex-shrink-0 transition-colors"
              style={{
                borderColor: item.checked ? "var(--clay)" : "var(--border)",
                backgroundColor: item.checked ? "var(--clay)" : "transparent",
              }}
            >
              {item.checked && <Check size={11} style={{ color: "var(--cream)" }} />}
            </button>
            <span
              className="text-sm flex-1"
              style={{
                color: "var(--charcoal)",
                fontFamily: "var(--font-body)",
                textDecoration: item.checked ? "line-through" : "none",
                opacity: item.checked ? 0.4 : 1,
              }}
            >
              {item.text}
            </span>
            <button
              onClick={() => removeItem(item.id)}
              className="opacity-0 group-hover:opacity-30 hover:!opacity-70 transition-opacity"
              style={{ color: "var(--charcoal)" }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-1">
        <input
          type="text"
          value={newText}
          placeholder="Add item..."
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          className="flex-1 px-3 py-1.5 text-sm border bg-white outline-none"
          style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
        />
        <button
          onClick={addItem}
          className="px-3 py-1.5 text-sm transition-opacity hover:opacity-80"
          style={{ backgroundColor: "var(--charcoal)", color: "var(--cream)", fontFamily: "var(--font-body)" }}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Timeline editor ─────────────────────────────────────────────────────────

function TimelineEditor({
  entries,
  onChange,
}: {
  entries: TimelineEntry[];
  onChange: (entries: TimelineEntry[]) => void;
}) {
  const [newTime, setNewTime] = useState("");
  const [newNote, setNewNote] = useState("");

  function addEntry() {
    const time = newTime.trim();
    const note = newNote.trim();
    if (!time && !note) return;
    const sorted = [...entries, { id: uid(), time, note }].sort((a, b) =>
      a.time.localeCompare(b.time)
    );
    onChange(sorted);
    setNewTime("");
    setNewNote("");
  }

  function removeEntry(id: string) {
    onChange(entries.filter((e) => e.id !== id));
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs uppercase tracking-widest opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
        Timeline
      </p>
      <div className="flex flex-col gap-1">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3 group py-1" style={{ borderBottom: "1px solid var(--border)" }}>
            <span
              className="text-xs pt-0.5 flex-shrink-0 w-14 font-mono opacity-60"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              {entry.time || "—"}
            </span>
            <span className="text-sm flex-1" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
              {entry.note}
            </span>
            <button
              onClick={() => removeEntry(entry.id)}
              className="opacity-0 group-hover:opacity-30 hover:!opacity-70 transition-opacity mt-0.5"
              style={{ color: "var(--charcoal)" }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-1">
        <input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
          className="w-28 px-2 py-1.5 text-sm border bg-white outline-none"
          style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
        />
        <input
          type="text"
          value={newNote}
          placeholder="What's happening..."
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addEntry()}
          className="flex-1 px-3 py-1.5 text-sm border bg-white outline-none"
          style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
        />
        <button
          onClick={addEntry}
          className="px-3 py-1.5 text-sm transition-opacity hover:opacity-80"
          style={{ backgroundColor: "var(--charcoal)", color: "var(--cream)", fontFamily: "var(--font-body)" }}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Shoot Day ───────────────────────────────────────────────────────────────

const EMPTY_SHOOT: Omit<PlannerShoot, "id" | "user_id" | "created_at"> = {
  client_name: "",
  session_date: null,
  location: "",
  session_type: "",
  notes: "",
  shot_list: [],
  timeline: [],
  gear_checklist: [],
};

function ShootCard({
  shoot,
  onSave,
  onDelete,
}: {
  shoot: PlannerShoot;
  onSave: (s: PlannerShoot) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState(shoot);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof PlannerShoot>(key: K, value: PlannerShoot[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
  }

  return (
    <div className="border" style={{ borderColor: "var(--border)", backgroundColor: "white" }}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[var(--sand)] transition-colors"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-medium truncate" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
              {shoot.client_name || "Unnamed shoot"}
            </span>
            <span className="text-xs opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
              {fmtDate(shoot.session_date)}
              {shoot.location ? ` · ${shoot.location}` : ""}
              {shoot.session_type ? ` · ${shoot.session_type}` : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {shoot.shot_list.length > 0 && (
            <span className="text-xs opacity-30" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
              {shoot.shot_list.filter((i) => i.checked).length}/{shoot.shot_list.length} shots
            </span>
          )}
          {expanded ? <ChevronUp size={16} style={{ color: "var(--charcoal)", opacity: 0.4 }} /> : <ChevronDown size={16} style={{ color: "var(--charcoal)", opacity: 0.4 }} />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-6 pt-2 flex flex-col gap-5" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="grid sm:grid-cols-2 gap-4">
            <TextInput label="Client Name" value={draft.client_name} onChange={(v) => update("client_name", v)} placeholder="Sarah & James" />
            <DateInput label="Session Date" value={draft.session_date ?? ""} onChange={(v) => update("session_date", v || null)} />
            <TextInput label="Location" value={draft.location} onChange={(v) => update("location", v)} placeholder="Griffith Park, LA" />
            <TextInput label="Session Type" value={draft.session_type} onChange={(v) => update("session_type", v)} placeholder="Engagement, Wedding, etc." />
          </div>

          <TextareaInput label="Notes" value={draft.notes} onChange={(v) => update("notes", v)} placeholder="Client preferences, parking, outfit details..." />

          <ChecklistEditor
            label="Shot List"
            items={draft.shot_list}
            onChange={(items) => update("shot_list", items)}
          />

          <TimelineEditor
            entries={draft.timeline}
            onChange={(entries) => update("timeline", entries)}
          />

          <ChecklistEditor
            label="Gear Checklist"
            items={draft.gear_checklist}
            onChange={(items) => update("gear_checklist", items)}
          />

          <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--border)" }}>
            <button
              onClick={() => onDelete(shoot.id)}
              className="flex items-center gap-1.5 text-xs opacity-30 hover:opacity-60 transition-opacity"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              <Trash2 size={13} />
              Delete
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ backgroundColor: "var(--charcoal)", color: "var(--cream)", fontFamily: "var(--font-body)" }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ShootDaySection({ shoots, userId, onChange }: {
  shoots: PlannerShoot[];
  userId: string;
  onChange: (shoots: PlannerShoot[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newShoot, setNewShoot] = useState<Omit<PlannerShoot, "id" | "user_id" | "created_at">>(EMPTY_SHOOT);
  const supabase = createClient();

  async function handleAdd() {
    const { data, error } = await supabase
      .from("planner_shoots")
      .insert({ ...newShoot, user_id: userId })
      .select()
      .single();
    if (!error && data) {
      onChange([...shoots, data as PlannerShoot]);
      setNewShoot(EMPTY_SHOOT);
      setAdding(false);
    }
  }

  const handleSave = useCallback(async (updated: PlannerShoot) => {
    const { error } = await supabase
      .from("planner_shoots")
      .update(updated)
      .eq("id", updated.id);
    if (!error) {
      onChange(shoots.map((s) => (s.id === updated.id ? updated : s)));
    }
  }, [shoots, onChange, supabase]);

  const handleDelete = useCallback(async (id: string) => {
    const { error } = await supabase.from("planner_shoots").delete().eq("id", id);
    if (!error) onChange(shoots.filter((s) => s.id !== id));
  }, [shoots, onChange, supabase]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
          {shoots.length === 0 ? "No shoots yet." : `${shoots.length} shoot${shoots.length !== 1 ? "s" : ""}`}
        </p>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 flex-shrink-0"
          style={{ backgroundColor: "var(--charcoal)", color: "var(--cream)", fontFamily: "var(--font-body)" }}
        >
          <Plus size={13} />
          New Shoot
        </button>
      </div>

      {adding && (
        <div className="border p-5 flex flex-col gap-4" style={{ borderColor: "var(--clay)", backgroundColor: "white" }}>
          <p className="text-xs uppercase tracking-widest opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
            New Shoot
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <TextInput label="Client Name" value={newShoot.client_name} onChange={(v) => setNewShoot((s) => ({ ...s, client_name: v }))} placeholder="Sarah & James" />
            <DateInput label="Session Date" value={newShoot.session_date ?? ""} onChange={(v) => setNewShoot((s) => ({ ...s, session_date: v || null }))} />
            <TextInput label="Location" value={newShoot.location} onChange={(v) => setNewShoot((s) => ({ ...s, location: v }))} placeholder="Griffith Park, LA" />
            <TextInput label="Session Type" value={newShoot.session_type} onChange={(v) => setNewShoot((s) => ({ ...s, session_type: v }))} placeholder="Engagement, Wedding, etc." />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => { setAdding(false); setNewShoot(EMPTY_SHOOT); }}
              className="px-4 py-2 text-xs uppercase tracking-widest opacity-40 hover:opacity-70 transition-opacity"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-5 py-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-80"
              style={{ backgroundColor: "var(--charcoal)", color: "var(--cream)", fontFamily: "var(--font-body)" }}
            >
              Add Shoot
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {shoots.map((shoot) => (
          <ShootCard key={shoot.id} shoot={shoot} onSave={handleSave} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}

// ─── Bookings ────────────────────────────────────────────────────────────────

const BOOKING_STATUS_LABELS: Record<PlannerBooking["status"], string> = {
  lead: "Lead",
  booked: "Booked",
  completed: "Completed",
  paid: "Paid",
};

const BOOKING_STATUS_COLORS: Record<PlannerBooking["status"], string> = {
  lead:      "#c9a96e",
  booked:    "#6a9b7e",
  completed: "#8b5e3c",
  paid:      "#2c2c3a",
};

const BOOKING_STATUS_TEXT: Record<PlannerBooking["status"], string> = {
  lead:      "#2c2c3a",
  booked:    "#f7f3ed",
  completed: "#f7f3ed",
  paid:      "#f7f3ed",
};

const EMPTY_BOOKING: Omit<PlannerBooking, "id" | "user_id" | "created_at"> = {
  client_name: "",
  session_type: "",
  session_date: null,
  status: "lead",
  amount: 0,
  notes: "",
};

function BookingRow({ booking, onSave, onDelete }: {
  booking: PlannerBooking;
  onSave: (b: PlannerBooking) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState(booking);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof PlannerBooking>(key: K, value: PlannerBooking[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
  }

  return (
    <div
      className="border"
      style={{
        borderColor: "var(--border)",
        borderLeftColor: BOOKING_STATUS_COLORS[booking.status],
        borderLeftWidth: 3,
        backgroundColor: "white",
      }}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-[var(--sand)] transition-colors"
      >
        <div
          className="text-xs px-2 py-0.5 flex-shrink-0"
          style={{
            backgroundColor: BOOKING_STATUS_COLORS[booking.status],
            color: BOOKING_STATUS_TEXT[booking.status],
            fontFamily: "var(--font-body)",
            letterSpacing: "0.08em",
          }}
        >
          {BOOKING_STATUS_LABELS[booking.status]}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium truncate block" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
            {booking.client_name || "Unnamed client"}
          </span>
          <span className="text-xs opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
            {fmtDate(booking.session_date)}{booking.session_type ? ` · ${booking.session_type}` : ""}
          </span>
        </div>
        {booking.amount > 0 && (
          <span className="text-sm flex-shrink-0" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
            ${booking.amount.toLocaleString()}
          </span>
        )}
        {expanded ? <ChevronUp size={15} style={{ color: "var(--charcoal)", opacity: 0.3 }} /> : <ChevronDown size={15} style={{ color: "var(--charcoal)", opacity: 0.3 }} />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-3 flex flex-col gap-4" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="grid sm:grid-cols-2 gap-4">
            <TextInput label="Client Name" value={draft.client_name} onChange={(v) => update("client_name", v)} />
            <DateInput label="Session Date" value={draft.session_date ?? ""} onChange={(v) => update("session_date", v || null)} />
            <TextInput label="Session Type" value={draft.session_type} onChange={(v) => update("session_type", v)} placeholder="Wedding, Portraits, etc." />
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-widest opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>Amount ($)</label>
              <input
                type="number"
                min={0}
                value={draft.amount || ""}
                placeholder="0"
                onChange={(e) => update("amount", parseFloat(e.target.value) || 0)}
                className="px-3 py-2 text-sm border bg-white outline-none"
                style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
              />
            </div>
          </div>
          <SelectInput
            label="Status"
            value={draft.status}
            onChange={(v) => update("status", v as PlannerBooking["status"])}
            options={[
              { value: "lead", label: "Lead" },
              { value: "booked", label: "Booked" },
              { value: "completed", label: "Completed" },
              { value: "paid", label: "Paid" },
            ]}
          />
          <TextareaInput label="Notes" value={draft.notes} onChange={(v) => update("notes", v)} rows={2} />
          <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--border)" }}>
            <button onClick={() => onDelete(booking.id)} className="flex items-center gap-1.5 text-xs opacity-30 hover:opacity-60 transition-opacity" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
              <Trash2 size={13} /> Delete
            </button>
            <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-40" style={{ backgroundColor: "var(--charcoal)", color: "var(--cream)", fontFamily: "var(--font-body)" }}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingsSection({ bookings, userId, onChange, onStatusChange }: {
  bookings: PlannerBooking[];
  userId: string;
  onChange: (bookings: PlannerBooking[]) => void;
  onStatusChange?: (prev: PlannerBooking, next: PlannerBooking) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newBooking, setNewBooking] = useState<Omit<PlannerBooking, "id" | "user_id" | "created_at">>(EMPTY_BOOKING);
  const supabase = createClient();

  const totalBooked = bookings.filter((b) => b.status === "booked").reduce((sum, b) => sum + b.amount, 0);
  const totalPaid = bookings.filter((b) => b.status === "paid").reduce((sum, b) => sum + b.amount, 0);

  async function handleAdd() {
    const { data, error } = await supabase.from("planner_bookings").insert({ ...newBooking, user_id: userId }).select().single();
    if (!error && data) { onChange([...bookings, data as PlannerBooking]); setNewBooking(EMPTY_BOOKING); setAdding(false); }
  }

  const handleSave = useCallback(async (updated: PlannerBooking) => {
    const prev = bookings.find((b) => b.id === updated.id);
    const { error } = await supabase.from("planner_bookings").update(updated).eq("id", updated.id);
    if (!error) {
      onChange(bookings.map((b) => (b.id === updated.id ? updated : b)));
      if (prev && prev.status !== updated.status) onStatusChange?.(prev, updated);
    }
  }, [bookings, onChange, onStatusChange, supabase]);

  const handleDelete = useCallback(async (id: string) => {
    const { error } = await supabase.from("planner_bookings").delete().eq("id", id);
    if (!error) onChange(bookings.filter((b) => b.id !== id));
  }, [bookings, onChange, supabase]);

  return (
    <div className="flex flex-col gap-6">
      {/* Summary */}
      {bookings.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {(["lead", "booked", "completed", "paid"] as PlannerBooking["status"][]).map((status) => {
            const count = bookings.filter((b) => b.status === status).length;
            return (
              <div key={status} className="p-4 border-l-2" style={{ backgroundColor: "var(--sand)", borderLeftColor: BOOKING_STATUS_COLORS[status] }}>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: BOOKING_STATUS_COLORS[status], fontFamily: "var(--font-body)" }}>{BOOKING_STATUS_LABELS[status]}</p>
                <p className="text-2xl font-light" style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}>{count}</p>
              </div>
            );
          })}
        </div>
      )}

      {(totalBooked > 0 || totalPaid > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 border-l-2" style={{ borderLeftColor: "var(--clay)", backgroundColor: "var(--sand)" }}>
            <p className="text-xs uppercase tracking-widest opacity-40 mb-1" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>Booked Revenue</p>
            <p className="text-2xl font-light" style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}>${totalBooked.toLocaleString()}</p>
          </div>
          <div className="p-4 border-l-2" style={{ borderLeftColor: "var(--charcoal)", backgroundColor: "var(--sand)" }}>
            <p className="text-xs uppercase tracking-widest opacity-40 mb-1" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>Collected</p>
            <p className="text-2xl font-light" style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}>${totalPaid.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
          {bookings.length === 0 ? "No bookings yet." : `${bookings.length} booking${bookings.length !== 1 ? "s" : ""}`}
        </p>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 flex-shrink-0" style={{ backgroundColor: "var(--charcoal)", color: "var(--cream)", fontFamily: "var(--font-body)" }}>
          <Plus size={13} /> New Booking
        </button>
      </div>

      {adding && (
        <div className="border p-5 flex flex-col gap-4" style={{ borderColor: "var(--clay)", backgroundColor: "white" }}>
          <p className="text-xs uppercase tracking-widest opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>New Booking</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <TextInput label="Client Name" value={newBooking.client_name} onChange={(v) => setNewBooking((b) => ({ ...b, client_name: v }))} />
            <DateInput label="Session Date" value={newBooking.session_date ?? ""} onChange={(v) => setNewBooking((b) => ({ ...b, session_date: v || null }))} />
            <TextInput label="Session Type" value={newBooking.session_type} onChange={(v) => setNewBooking((b) => ({ ...b, session_type: v }))} placeholder="Wedding, Portraits, etc." />
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-widest opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>Amount ($)</label>
              <input type="number" min={0} value={newBooking.amount || ""} placeholder="0" onChange={(e) => setNewBooking((b) => ({ ...b, amount: parseFloat(e.target.value) || 0 }))} className="px-3 py-2 text-sm border bg-white outline-none" style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }} />
            </div>
          </div>
          <SelectInput label="Status" value={newBooking.status} onChange={(v) => setNewBooking((b) => ({ ...b, status: v as PlannerBooking["status"] }))} options={[{ value: "lead", label: "Lead" }, { value: "booked", label: "Booked" }, { value: "completed", label: "Completed" }, { value: "paid", label: "Paid" }]} />
          <div className="flex gap-3 justify-end">
            <button onClick={() => { setAdding(false); setNewBooking(EMPTY_BOOKING); }} className="px-4 py-2 text-xs uppercase tracking-widest opacity-40 hover:opacity-70 transition-opacity" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>Cancel</button>
            <button onClick={handleAdd} className="px-5 py-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-80" style={{ backgroundColor: "var(--charcoal)", color: "var(--cream)", fontFamily: "var(--font-body)" }}>Add Booking</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {bookings.map((booking) => (
          <BookingRow key={booking.id} booking={booking} onSave={handleSave} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}

// ─── Editing Workflow ─────────────────────────────────────────────────────────

const EDIT_STATUS_LABELS: Record<PlannerEdit["status"], string> = {
  not_started: "Not Started",
  culling: "Culling",
  editing: "Editing",
  reviewing: "Reviewing",
  delivered: "Delivered",
};

const EDIT_STATUS_ORDER: PlannerEdit["status"][] = ["not_started", "culling", "editing", "reviewing", "delivered"];

const EMPTY_EDIT: Omit<PlannerEdit, "id" | "user_id" | "created_at"> = {
  client_name: "",
  session_date: null,
  editing_deadline: null,
  delivery_deadline: null,
  status: "not_started",
  photos_count: 0,
  notes: "",
  tasks: [],
};

function EditRow({ edit, onSave, onDelete }: {
  edit: PlannerEdit;
  onSave: (e: PlannerEdit) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState(edit);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof PlannerEdit>(key: K, value: PlannerEdit[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
  }

  const statusIndex = EDIT_STATUS_ORDER.indexOf(edit.status);

  return (
    <div className="border" style={{ borderColor: "var(--border)", backgroundColor: "white" }}>
      <button onClick={() => setExpanded((v) => !v)} className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-[var(--sand)] transition-colors">
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium truncate block" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>{edit.client_name || "Unnamed client"}</span>
          <span className="text-xs opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
            Deliver by {fmtDate(edit.delivery_deadline)}{edit.photos_count > 0 ? ` · ${edit.photos_count} photos` : ""}
          </span>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Status progress dots */}
          <div className="hidden sm:flex items-center gap-1">
            {EDIT_STATUS_ORDER.map((s, i) => (
              <div
                key={s}
                className="w-2 h-2 rounded-full transition-colors"
                style={{ backgroundColor: i <= statusIndex ? "var(--charcoal)" : "var(--border)" }}
              />
            ))}
          </div>
          <span className="text-xs opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
            {EDIT_STATUS_LABELS[edit.status]}
          </span>
          {expanded ? <ChevronUp size={15} style={{ color: "var(--charcoal)", opacity: 0.3 }} /> : <ChevronDown size={15} style={{ color: "var(--charcoal)", opacity: 0.3 }} />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-3 flex flex-col gap-4" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="grid sm:grid-cols-2 gap-4">
            <TextInput label="Client Name" value={draft.client_name} onChange={(v) => update("client_name", v)} />
            <DateInput label="Session Date" value={draft.session_date ?? ""} onChange={(v) => update("session_date", v || null)} />
            <DateInput label="Editing Deadline" value={draft.editing_deadline ?? ""} onChange={(v) => update("editing_deadline", v || null)} />
            <DateInput label="Delivery Deadline" value={draft.delivery_deadline ?? ""} onChange={(v) => update("delivery_deadline", v || null)} />
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-widest opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>Photo Count</label>
              <input type="number" min={0} value={draft.photos_count || ""} placeholder="0" onChange={(e) => update("photos_count", parseInt(e.target.value) || 0)} className="px-3 py-2 text-sm border bg-white outline-none" style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }} />
            </div>
            <SelectInput
              label="Status"
              value={draft.status}
              onChange={(v) => update("status", v as PlannerEdit["status"])}
              options={EDIT_STATUS_ORDER.map((s) => ({ value: s, label: EDIT_STATUS_LABELS[s] }))}
            />
          </div>
          <TextareaInput label="Notes" value={draft.notes} onChange={(v) => update("notes", v)} rows={2} />
          <ChecklistEditor label="Tasks" items={draft.tasks} onChange={(items) => update("tasks", items)} />
          <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--border)" }}>
            <button onClick={() => onDelete(edit.id)} className="flex items-center gap-1.5 text-xs opacity-30 hover:opacity-60 transition-opacity" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
              <Trash2 size={13} /> Delete
            </button>
            <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-40" style={{ backgroundColor: "var(--charcoal)", color: "var(--cream)", fontFamily: "var(--font-body)" }}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EditingSection({ edits, userId, onChange }: {
  edits: PlannerEdit[];
  userId: string;
  onChange: (edits: PlannerEdit[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newEdit, setNewEdit] = useState<Omit<PlannerEdit, "id" | "user_id" | "created_at">>(EMPTY_EDIT);
  const supabase = createClient();

  async function handleAdd() {
    const { data, error } = await supabase.from("planner_edits").insert({ ...newEdit, user_id: userId }).select().single();
    if (!error && data) { onChange([...edits, data as PlannerEdit]); setNewEdit(EMPTY_EDIT); setAdding(false); }
  }

  const handleSave = useCallback(async (updated: PlannerEdit) => {
    const { error } = await supabase.from("planner_edits").update(updated).eq("id", updated.id);
    if (!error) onChange(edits.map((e) => (e.id === updated.id ? updated : e)));
  }, [edits, onChange, supabase]);

  const handleDelete = useCallback(async (id: string) => {
    const { error } = await supabase.from("planner_edits").delete().eq("id", id);
    if (!error) onChange(edits.filter((e) => e.id !== id));
  }, [edits, onChange, supabase]);

  const inProgress = edits.filter((e) => e.status !== "delivered" && e.status !== "not_started").length;
  const delivered = edits.filter((e) => e.status === "delivered").length;

  return (
    <div className="flex flex-col gap-6">
      {edits.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "In Queue", value: edits.filter((e) => e.status === "not_started").length },
            { label: "In Progress", value: inProgress },
            { label: "Delivered", value: delivered },
          ].map(({ label, value }) => (
            <div key={label} className="p-4" style={{ backgroundColor: "var(--sand)" }}>
              <p className="text-xs uppercase tracking-widest opacity-40 mb-1" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>{label}</p>
              <p className="text-2xl font-light" style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
          {edits.length === 0 ? "No editing jobs yet." : `${edits.length} job${edits.length !== 1 ? "s" : ""}`}
        </p>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 flex-shrink-0" style={{ backgroundColor: "var(--charcoal)", color: "var(--cream)", fontFamily: "var(--font-body)" }}>
          <Plus size={13} /> New Job
        </button>
      </div>

      {adding && (
        <div className="border p-5 flex flex-col gap-4" style={{ borderColor: "var(--clay)", backgroundColor: "white" }}>
          <p className="text-xs uppercase tracking-widest opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>New Editing Job</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <TextInput label="Client Name" value={newEdit.client_name} onChange={(v) => setNewEdit((e) => ({ ...e, client_name: v }))} />
            <DateInput label="Delivery Deadline" value={newEdit.delivery_deadline ?? ""} onChange={(v) => setNewEdit((e) => ({ ...e, delivery_deadline: v || null }))} />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => { setAdding(false); setNewEdit(EMPTY_EDIT); }} className="px-4 py-2 text-xs uppercase tracking-widest opacity-40 hover:opacity-70 transition-opacity" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>Cancel</button>
            <button onClick={handleAdd} className="px-5 py-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-80" style={{ backgroundColor: "var(--charcoal)", color: "var(--cream)", fontFamily: "var(--font-body)" }}>Add Job</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {edits.map((edit) => (
          <EditRow key={edit.id} edit={edit} onSave={handleSave} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}

// ─── Content Planner ──────────────────────────────────────────────────────────

const CONTENT_STATUS_LABELS: Record<PlannerContent["status"], string> = {
  idea: "Idea",
  drafted: "Drafted",
  scheduled: "Scheduled",
  posted: "Posted",
};

const PLATFORMS = ["Instagram", "TikTok", "Blog", "Email", "Pinterest", "YouTube", "Other"];

const EMPTY_CONTENT: Omit<PlannerContent, "id" | "user_id" | "created_at"> = {
  platform: "Instagram",
  scheduled_date: null,
  caption_idea: "",
  status: "idea",
  notes: "",
};

function ContentRow({ content, onSave, onDelete }: {
  content: PlannerContent;
  onSave: (c: PlannerContent) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState(content);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof PlannerContent>(key: K, value: PlannerContent[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
  }

  const statusColors: Record<PlannerContent["status"], string> = {
    idea: "rgba(0,0,0,0.1)",
    drafted: "rgba(0,0,0,0.2)",
    scheduled: "var(--clay)",
    posted: "var(--charcoal)",
  };

  return (
    <div className="border" style={{ borderColor: "var(--border)", backgroundColor: "white" }}>
      <button onClick={() => setExpanded((v) => !v)} className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-[var(--sand)] transition-colors">
        <span className="text-xs px-2 py-0.5 flex-shrink-0" style={{ backgroundColor: statusColors[content.status], color: ["idea", "drafted"].includes(content.status) ? "var(--charcoal)" : "var(--cream)", fontFamily: "var(--font-body)" }}>
          {CONTENT_STATUS_LABELS[content.status]}
        </span>
        <div className="flex-1 min-w-0">
          <span className="text-sm truncate block" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
            {content.caption_idea || "No caption yet"}
          </span>
          <span className="text-xs opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
            {content.platform} · {fmtDate(content.scheduled_date)}
          </span>
        </div>
        {expanded ? <ChevronUp size={15} style={{ color: "var(--charcoal)", opacity: 0.3 }} /> : <ChevronDown size={15} style={{ color: "var(--charcoal)", opacity: 0.3 }} />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-3 flex flex-col gap-4" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="grid sm:grid-cols-2 gap-4">
            <SelectInput
              label="Platform"
              value={draft.platform}
              onChange={(v) => update("platform", v)}
              options={PLATFORMS.map((p) => ({ value: p, label: p }))}
            />
            <DateInput label="Scheduled Date" value={draft.scheduled_date ?? ""} onChange={(v) => update("scheduled_date", v || null)} />
            <SelectInput
              label="Status"
              value={draft.status}
              onChange={(v) => update("status", v as PlannerContent["status"])}
              options={[
                { value: "idea", label: "Idea" },
                { value: "drafted", label: "Drafted" },
                { value: "scheduled", label: "Scheduled" },
                { value: "posted", label: "Posted" },
              ]}
            />
          </div>
          <TextareaInput label="Caption Idea" value={draft.caption_idea} onChange={(v) => update("caption_idea", v)} placeholder="Write your caption or rough idea..." rows={3} />
          <TextareaInput label="Notes" value={draft.notes} onChange={(v) => update("notes", v)} placeholder="Image reference, hashtags, tag list..." rows={2} />
          <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--border)" }}>
            <button onClick={() => onDelete(content.id)} className="flex items-center gap-1.5 text-xs opacity-30 hover:opacity-60 transition-opacity" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
              <Trash2 size={13} /> Delete
            </button>
            <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-40" style={{ backgroundColor: "var(--charcoal)", color: "var(--cream)", fontFamily: "var(--font-body)" }}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ContentSection({ content, userId, onChange }: {
  content: PlannerContent[];
  userId: string;
  onChange: (content: PlannerContent[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newContent, setNewContent] = useState<Omit<PlannerContent, "id" | "user_id" | "created_at">>(EMPTY_CONTENT);
  const supabase = createClient();

  async function handleAdd() {
    const { data, error } = await supabase.from("planner_content").insert({ ...newContent, user_id: userId }).select().single();
    if (!error && data) { onChange([...content, data as PlannerContent]); setNewContent(EMPTY_CONTENT); setAdding(false); }
  }

  const handleSave = useCallback(async (updated: PlannerContent) => {
    const { error } = await supabase.from("planner_content").update(updated).eq("id", updated.id);
    if (!error) onChange(content.map((c) => (c.id === updated.id ? updated : c)));
  }, [content, onChange, supabase]);

  const handleDelete = useCallback(async (id: string) => {
    const { error } = await supabase.from("planner_content").delete().eq("id", id);
    if (!error) onChange(content.filter((c) => c.id !== id));
  }, [content, onChange, supabase]);

  const byStatus = {
    idea: content.filter((c) => c.status === "idea").length,
    drafted: content.filter((c) => c.status === "drafted").length,
    scheduled: content.filter((c) => c.status === "scheduled").length,
    posted: content.filter((c) => c.status === "posted").length,
  };

  return (
    <div className="flex flex-col gap-6">
      {content.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {(["idea", "drafted", "scheduled", "posted"] as PlannerContent["status"][]).map((status) => (
            <div key={status} className="p-4" style={{ backgroundColor: "var(--sand)" }}>
              <p className="text-xs uppercase tracking-widest opacity-40 mb-1" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>{CONTENT_STATUS_LABELS[status]}</p>
              <p className="text-2xl font-light" style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}>{byStatus[status]}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
          {content.length === 0 ? "No posts yet." : `${content.length} post${content.length !== 1 ? "s" : ""}`}
        </p>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 flex-shrink-0" style={{ backgroundColor: "var(--charcoal)", color: "var(--cream)", fontFamily: "var(--font-body)" }}>
          <Plus size={13} /> New Post
        </button>
      </div>

      {adding && (
        <div className="border p-5 flex flex-col gap-4" style={{ borderColor: "var(--clay)", backgroundColor: "white" }}>
          <p className="text-xs uppercase tracking-widest opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>New Post</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <SelectInput label="Platform" value={newContent.platform} onChange={(v) => setNewContent((c) => ({ ...c, platform: v }))} options={PLATFORMS.map((p) => ({ value: p, label: p }))} />
            <DateInput label="Scheduled Date" value={newContent.scheduled_date ?? ""} onChange={(v) => setNewContent((c) => ({ ...c, scheduled_date: v || null }))} />
          </div>
          <TextareaInput label="Caption Idea" value={newContent.caption_idea} onChange={(v) => setNewContent((c) => ({ ...c, caption_idea: v }))} placeholder="Write your caption or rough idea..." rows={2} />
          <div className="flex gap-3 justify-end">
            <button onClick={() => { setAdding(false); setNewContent(EMPTY_CONTENT); }} className="px-4 py-2 text-xs uppercase tracking-widest opacity-40 hover:opacity-70 transition-opacity" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>Cancel</button>
            <button onClick={handleAdd} className="px-5 py-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-80" style={{ backgroundColor: "var(--charcoal)", color: "var(--cream)", fontFamily: "var(--font-body)" }}>Add Post</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {content.map((c) => (
          <ContentRow key={c.id} content={c} onSave={handleSave} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}

// ─── Inspo Board ─────────────────────────────────────────────────────────────

const EMPTY_INSPO: Omit<PlannerInspo, "id" | "user_id" | "created_at"> = {
  title: "",
  description: "",
  images: [],
  mood_words: [],
  colors: [],
  collaborators: [],
};

function MoodWordEditor({ words, onChange }: { words: string[]; onChange: (w: string[]) => void }) {
  const [input, setInput] = useState("");

  function add() {
    const word = input.trim();
    if (!word || words.includes(word)) return;
    onChange([...words, word]);
    setInput("");
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs uppercase tracking-widest opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>Mood Words</p>
      <div className="flex flex-wrap gap-2">
        {words.map((w) => (
          <button
            key={w}
            onClick={() => onChange(words.filter((x) => x !== w))}
            className="flex items-center gap-1 px-3 py-1 text-xs transition-opacity hover:opacity-60"
            style={{ backgroundColor: "var(--sand)", color: "var(--charcoal)", fontFamily: "var(--font-body)", border: "1px solid var(--border)" }}
          >
            {w} <span className="opacity-40 ml-0.5">×</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          placeholder="golden, moody, soft..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className="flex-1 px-3 py-1.5 text-sm border bg-white outline-none"
          style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
        />
        <button onClick={add} className="px-3 py-1.5 transition-opacity hover:opacity-80" style={{ backgroundColor: "var(--charcoal)", color: "var(--cream)" }}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

function ColorPaletteEditor({ colors, onChange }: { colors: string[]; onChange: (c: string[]) => void }) {
  const [input, setInput] = useState("#");

  function add() {
    const hex = input.trim();
    if (!hex || colors.includes(hex)) return;
    onChange([...colors, hex]);
    setInput("#");
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs uppercase tracking-widest opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>Color Palette</p>
      <div className="flex flex-wrap gap-3 items-center">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => onChange(colors.filter((x) => x !== c))}
            className="group relative flex flex-col items-center gap-1"
            title={`Remove ${c}`}
          >
            <div
              className="w-10 h-10 border border-[var(--border)] transition-opacity group-hover:opacity-60"
              style={{ backgroundColor: c }}
            />
            <span className="text-[10px] opacity-40" style={{ fontFamily: "var(--font-body)", color: "var(--charcoal)" }}>{c}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={input.startsWith("#") && input.length === 7 ? input : "#cccccc"}
          onChange={(e) => setInput(e.target.value)}
          className="w-10 h-9 border cursor-pointer p-0.5"
          style={{ borderColor: "var(--border)" }}
        />
        <input
          type="text"
          value={input}
          placeholder="#f7c59f"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className="w-28 px-3 py-1.5 text-sm border bg-white outline-none font-mono"
          style={{ borderColor: "var(--border)", fontFamily: "monospace", color: "var(--charcoal)" }}
        />
        <button onClick={add} className="px-3 py-1.5 transition-opacity hover:opacity-80" style={{ backgroundColor: "var(--charcoal)", color: "var(--cream)" }}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

function CollaboratorEditor({ collaborators, onChange }: { collaborators: InspoCollaborator[]; onChange: (c: InspoCollaborator[]) => void }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  function add() {
    if (!name.trim()) return;
    onChange([...collaborators, { id: uid(), name: name.trim(), role: role.trim() }]);
    setName("");
    setRole("");
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs uppercase tracking-widest opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>Collaborators</p>
      <div className="flex flex-col gap-1">
        {collaborators.map((c) => (
          <div key={c.id} className="flex items-center gap-3 group py-1.5 px-3" style={{ backgroundColor: "var(--sand)" }}>
            <div className="flex-1">
              <span className="text-sm" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>{c.name}</span>
              {c.role && <span className="text-xs opacity-40 ml-2" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>{c.role}</span>}
            </div>
            <button onClick={() => onChange(collaborators.filter((x) => x.id !== c.id))} className="opacity-0 group-hover:opacity-30 hover:!opacity-70 transition-opacity" style={{ color: "var(--charcoal)" }}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={name} placeholder="Name" onChange={(e) => setName(e.target.value)} className="flex-1 px-3 py-1.5 text-sm border bg-white outline-none" style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }} />
        <input type="text" value={role} placeholder="Role (MUA, florist...)" onChange={(e) => setRole(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} className="flex-1 px-3 py-1.5 text-sm border bg-white outline-none" style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }} />
        <button onClick={add} className="px-3 py-1.5 transition-opacity hover:opacity-80" style={{ backgroundColor: "var(--charcoal)", color: "var(--cream)" }}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

function ImageUploader({ images, onAdd, onRemove, userId, inspoId }: {
  images: InspoImage[];
  onAdd: (img: InspoImage) => void;
  onRemove: (path: string) => void;
  userId: string;
  inspoId: string;
}) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${userId}/inspo/${inspoId}/${uid()}.${ext}`;
      const { error } = await supabase.storage.from("planner-inspo").upload(path, file, { upsert: false });
      if (!error) {
        const { data: urlData } = supabase.storage.from("planner-inspo").getPublicUrl(path);
        onAdd({ path, url: urlData.publicUrl });
      }
    }
    setUploading(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs uppercase tracking-widest opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>Images</p>
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((img) => (
            <div key={img.path} className="relative group aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => onRemove(img.path)}
                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
              >
                <Trash2 size={11} style={{ color: "white" }} />
              </button>
            </div>
          ))}
        </div>
      )}
      <label
        className="flex items-center justify-center gap-2 px-4 py-3 border cursor-pointer transition-colors hover:bg-[var(--sand)]"
        style={{ borderColor: "var(--border)", borderStyle: "dashed" }}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Plus size={14} style={{ color: "var(--charcoal)", opacity: 0.4 }} />
        <span className="text-xs uppercase tracking-widest opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
          {uploading ? "Uploading..." : "Add Images"}
        </span>
      </label>
    </div>
  );
}

function InspoCard({ inspo, onSave, onDelete, userId }: {
  inspo: PlannerInspo;
  onSave: (i: PlannerInspo) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  userId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState(inspo);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  function update<K extends keyof PlannerInspo>(key: K, value: PlannerInspo[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
  }

  async function handleRemoveImage(path: string) {
    await supabase.storage.from("planner-inspo").remove([path]);
    const updated = { ...draft, images: draft.images.filter((i) => i.path !== path) };
    setDraft(updated);
    await onSave(updated);
  }

  const coverImage = inspo.images[0];

  return (
    <div className="border" style={{ borderColor: "var(--border)", backgroundColor: "white" }}>
      <button onClick={() => setExpanded((v) => !v)} className="w-full flex items-center gap-4 text-left hover:bg-[var(--sand)] transition-colors">
        {coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage.url} alt="" className="w-16 h-16 object-cover flex-shrink-0" />
        )}
        {!coverImage && (
          <div className="w-16 h-16 flex-shrink-0" style={{ backgroundColor: "var(--sand)" }} />
        )}
        <div className="flex-1 min-w-0 py-4 pr-5">
          <span className="text-sm font-medium truncate block" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
            {inspo.title || "Untitled session"}
          </span>
          <div className="flex items-center gap-2 flex-wrap mt-1">
            {inspo.colors.slice(0, 5).map((c) => (
              <div key={c} className="w-3 h-3 rounded-full border border-[var(--border)]" style={{ backgroundColor: c }} />
            ))}
            {inspo.mood_words.slice(0, 3).map((w) => (
              <span key={w} className="text-xs opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>{w}</span>
            ))}
            {inspo.images.length > 1 && (
              <span className="text-xs opacity-30" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>{inspo.images.length} images</span>
            )}
          </div>
        </div>
        <div className="pr-5 flex-shrink-0">
          {expanded ? <ChevronUp size={15} style={{ color: "var(--charcoal)", opacity: 0.3 }} /> : <ChevronDown size={15} style={{ color: "var(--charcoal)", opacity: 0.3 }} />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-6 pt-4 flex flex-col gap-6" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="grid sm:grid-cols-2 gap-4">
            <TextInput label="Session Title" value={draft.title} onChange={(v) => update("title", v)} placeholder="Golden hour elopement, Dark romance, etc." />
          </div>
          <TextareaInput label="Description / Vision" value={draft.description} onChange={(v) => update("description", v)} placeholder="Describe the feeling, the light, the story you want to tell..." rows={3} />

          <ImageUploader
            images={draft.images}
            userId={userId}
            inspoId={inspo.id}
            onAdd={(img) => update("images", [...draft.images, img])}
            onRemove={handleRemoveImage}
          />

          <MoodWordEditor words={draft.mood_words} onChange={(w) => update("mood_words", w)} />
          <ColorPaletteEditor colors={draft.colors} onChange={(c) => update("colors", c)} />
          <CollaboratorEditor collaborators={draft.collaborators} onChange={(c) => update("collaborators", c)} />

          <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--border)" }}>
            <button onClick={() => onDelete(inspo.id)} className="flex items-center gap-1.5 text-xs opacity-30 hover:opacity-60 transition-opacity" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
              <Trash2 size={13} /> Delete
            </button>
            <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-40" style={{ backgroundColor: "var(--charcoal)", color: "var(--cream)", fontFamily: "var(--font-body)" }}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InspoSection({ inspo, userId, onChange }: {
  inspo: PlannerInspo[];
  userId: string;
  onChange: (inspo: PlannerInspo[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const supabase = createClient();

  async function handleAdd() {
    const { data, error } = await supabase
      .from("planner_inspo")
      .insert({ ...EMPTY_INSPO, user_id: userId })
      .select()
      .single();
    if (!error && data) {
      onChange([...inspo, data as PlannerInspo]);
      setAdding(false);
    }
  }

  const handleSave = useCallback(async (updated: PlannerInspo) => {
    const { error } = await supabase.from("planner_inspo").update(updated).eq("id", updated.id);
    if (!error) onChange(inspo.map((i) => (i.id === updated.id ? updated : i)));
  }, [inspo, onChange, supabase]);

  const handleDelete = useCallback(async (id: string) => {
    const entry = inspo.find((i) => i.id === id);
    if (entry?.images.length) {
      await supabase.storage.from("planner-inspo").remove(entry.images.map((i) => i.path));
    }
    const { error } = await supabase.from("planner_inspo").delete().eq("id", id);
    if (!error) onChange(inspo.filter((i) => i.id !== id));
  }, [inspo, onChange, supabase]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm opacity-40 mb-1" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
          Dream sessions, mood boards, and visual direction — all in one place.
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
          {inspo.length === 0 ? "No sessions yet." : `${inspo.length} session idea${inspo.length !== 1 ? "s" : ""}`}
        </p>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 flex-shrink-0"
          style={{ backgroundColor: "var(--charcoal)", color: "var(--cream)", fontFamily: "var(--font-body)" }}
        >
          <Plus size={13} /> New Session Idea
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {inspo.map((i) => (
          <InspoCard key={i.id} inspo={i} userId={userId} onSave={handleSave} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}

// ─── PDF export ───────────────────────────────────────────────────────────────

function printPlanner(
  shoots: PlannerShoot[],
  bookings: PlannerBooking[],
  edits: PlannerEdit[],
  content: PlannerContent[]
) {
  const win = window.open("", "_blank");
  if (!win) return;

  const section = (title: string, rows: string) => `
    <div style="margin-bottom:40px">
      <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid #e0dbd4;">${title}</h2>
      ${rows || '<p style="opacity:0.4;font-size:13px;">No entries.</p>'}
    </div>`;

  const row = (left: string, right?: string) => `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:8px 0;border-bottom:1px solid #f0ede8;">
      <span>${left}</span>${right ? `<span style="opacity:0.5;font-size:12px;">${right}</span>` : ""}
    </div>`;

  const shootRows = shoots.map((s) => row(
    `<strong>${s.client_name || "—"}</strong><br/><span style="font-size:12px;opacity:0.5">${s.session_type ? s.session_type + " · " : ""}${fmtDate(s.session_date)}${s.location ? " · " + s.location : ""}</span>`,
    `${s.shot_list.filter((i) => i.checked).length}/${s.shot_list.length} shots`
  )).join("");

  const bookingRows = bookings.map((b) => row(
    `<strong>${b.client_name || "—"}</strong> <span style="font-size:11px;background:#e0dbd4;padding:1px 6px">${BOOKING_STATUS_LABELS[b.status]}</span><br/><span style="font-size:12px;opacity:0.5">${b.session_type ? b.session_type + " · " : ""}${fmtDate(b.session_date)}</span>`,
    b.amount > 0 ? `$${b.amount.toLocaleString()}` : undefined
  )).join("");

  const editRows = edits.map((e) => row(
    `<strong>${e.client_name || "—"}</strong><br/><span style="font-size:12px;opacity:0.5">Deliver: ${fmtDate(e.delivery_deadline)}${e.photos_count > 0 ? " · " + e.photos_count + " photos" : ""}</span>`,
    EDIT_STATUS_LABELS[e.status]
  )).join("");

  const contentRows = content.map((c) => row(
    `<span style="font-size:11px;background:#e0dbd4;padding:1px 6px">${c.platform}</span> ${c.caption_idea ? `<br/><span style="font-size:12px">${c.caption_idea.slice(0, 120)}${c.caption_idea.length > 120 ? "…" : ""}</span>` : ""}`,
    `${fmtDate(c.scheduled_date)} · ${CONTENT_STATUS_LABELS[c.status]}`
  )).join("");

  win.document.write(`<!DOCTYPE html>
<html><head><title>Photographer Planner — The Becoming Creative</title>
<style>
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a2e; margin: 0; padding: 40px; font-size: 13px; line-height: 1.5; }
  @media print { body { padding: 20px; } }
</style></head><body>
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:20px;border-bottom:2px solid #1a1a2e;">
  <div>
    <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.15em;opacity:0.4;margin:0 0 6px">The Becoming Creative</p>
    <h1 style="font-size:28px;font-weight:300;font-style:italic;margin:0">Photographer Planner</h1>
  </div>
  <p style="font-size:12px;opacity:0.4;margin:0">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
</div>
${section("Shoot Day", shootRows)}
${section("Bookings", bookingRows)}
${section("Editing & Delivery", editRows)}
${section("Content & Marketing", contentRows)}
</body></html>`);
  win.document.close();
  win.focus();
  win.print();
}

// ─── Journal view ────────────────────────────────────────────────────────────

type JournalKind = "shoot" | "booking" | "edit" | "content" | "inspo";

type JournalItem =
  | { kind: "shoot"; entry: PlannerShoot }
  | { kind: "booking"; entry: PlannerBooking }
  | { kind: "edit"; entry: PlannerEdit }
  | { kind: "content"; entry: PlannerContent }
  | { kind: "inspo"; entry: PlannerInspo };

const KIND_CONFIG: Record<JournalKind, { label: string; color: string }> = {
  shoot:   { label: "Shoot",   color: "var(--clay)" },
  booking: { label: "Booking", color: "var(--charcoal)" },
  edit:    { label: "Editing", color: "rgba(0,0,0,0.45)" },
  content: { label: "Content", color: "rgba(0,0,0,0.25)" },
  inspo:   { label: "Inspo",   color: "rgba(0,0,0,0.12)" },
};

const KIND_SECTIONS: { kind: JournalKind; label: string; pro: boolean }[] = [
  { kind: "shoot",   label: "Shoot",   pro: false },
  { kind: "booking", label: "Booking", pro: true },
  { kind: "edit",    label: "Editing", pro: true },
  { kind: "content", label: "Content", pro: true },
  { kind: "inspo",   label: "Inspo",   pro: true },
];

function JournalView({
  shoots, bookings, edits, content, inspo,
  userId, isPro,
  onShootsChange, onBookingsChange, onEditsChange, onContentChange, onInspoChange,
  onBookingStatusChange,
}: {
  shoots: PlannerShoot[];
  bookings: PlannerBooking[];
  edits: PlannerEdit[];
  content: PlannerContent[];
  inspo: PlannerInspo[];
  userId: string;
  isPro: boolean;
  onShootsChange: (s: PlannerShoot[]) => void;
  onBookingsChange: (b: PlannerBooking[]) => void;
  onEditsChange: (e: PlannerEdit[]) => void;
  onContentChange: (c: PlannerContent[]) => void;
  onInspoChange: (i: PlannerInspo[]) => void;
  onBookingStatusChange?: (prev: PlannerBooking, next: PlannerBooking) => void;
}) {
  const supabase = createClient();
  const [creating, setCreating] = useState(false);
  const [sortMode, setSortMode] = useState<"added" | "date">("added");

  function entryEventDate(item: JournalItem): string | null {
    if (item.kind === "shoot")   return (item.entry as PlannerShoot).session_date    ?? null;
    if (item.kind === "booking") return (item.entry as PlannerBooking).session_date   ?? null;
    if (item.kind === "edit")    return (item.entry as PlannerEdit).delivery_deadline ?? null;
    if (item.kind === "content") return (item.entry as PlannerContent).scheduled_date ?? null;
    return null;
  }

  const items: JournalItem[] = [
    ...shoots.map((e) => ({ kind: "shoot" as const, entry: e })),
    ...(isPro ? bookings.map((e) => ({ kind: "booking" as const, entry: e })) : []),
    ...(isPro ? edits.map((e) => ({ kind: "edit" as const, entry: e })) : []),
    ...(isPro ? content.map((e) => ({ kind: "content" as const, entry: e })) : []),
    ...(isPro ? inspo.map((e) => ({ kind: "inspo" as const, entry: e })) : []),
  ].sort((a, b) => {
    if (sortMode === "added") {
      return new Date(b.entry.created_at).getTime() - new Date(a.entry.created_at).getTime();
    }
    const aDate = entryEventDate(a);
    const bDate = entryEventDate(b);
    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;
    return new Date(aDate).getTime() - new Date(bDate).getTime();
  });

  async function handleCreate(kind: JournalKind) {
    setCreating(false);
    if (kind === "shoot") {
      const { data, error } = await supabase.from("planner_shoots").insert({ ...EMPTY_SHOOT, user_id: userId }).select().single();
      if (!error && data) onShootsChange([...shoots, data as PlannerShoot]);
    } else if (kind === "booking") {
      const { data, error } = await supabase.from("planner_bookings").insert({ ...EMPTY_BOOKING, user_id: userId }).select().single();
      if (!error && data) onBookingsChange([...bookings, data as PlannerBooking]);
    } else if (kind === "edit") {
      const { data, error } = await supabase.from("planner_edits").insert({ ...EMPTY_EDIT, user_id: userId }).select().single();
      if (!error && data) onEditsChange([...edits, data as PlannerEdit]);
    } else if (kind === "content") {
      const { data, error } = await supabase.from("planner_content").insert({ ...EMPTY_CONTENT, user_id: userId }).select().single();
      if (!error && data) onContentChange([...content, data as PlannerContent]);
    } else if (kind === "inspo") {
      const { data, error } = await supabase.from("planner_inspo").insert({ ...EMPTY_INSPO, user_id: userId }).select().single();
      if (!error && data) onInspoChange([...inspo, data as PlannerInspo]);
    }
  }

  const shootHandlers = {
    onSave: useCallback(async (updated: PlannerShoot) => {
      const { error } = await supabase.from("planner_shoots").update(updated).eq("id", updated.id);
      if (!error) onShootsChange(shoots.map((s) => (s.id === updated.id ? updated : s)));
    }, [shoots, onShootsChange, supabase]),
    onDelete: useCallback(async (id: string) => {
      const { error } = await supabase.from("planner_shoots").delete().eq("id", id);
      if (!error) onShootsChange(shoots.filter((s) => s.id !== id));
    }, [shoots, onShootsChange, supabase]),
  };

  const bookingHandlers = {
    onSave: useCallback(async (updated: PlannerBooking) => {
      const prev = bookings.find((b) => b.id === updated.id);
      const { error } = await supabase.from("planner_bookings").update(updated).eq("id", updated.id);
      if (!error) {
        onBookingsChange(bookings.map((b) => (b.id === updated.id ? updated : b)));
        if (prev && prev.status !== updated.status) onBookingStatusChange?.(prev, updated);
      }
    }, [bookings, onBookingsChange, onBookingStatusChange, supabase]),
    onDelete: useCallback(async (id: string) => {
      const { error } = await supabase.from("planner_bookings").delete().eq("id", id);
      if (!error) onBookingsChange(bookings.filter((b) => b.id !== id));
    }, [bookings, onBookingsChange, supabase]),
  };

  const editHandlers = {
    onSave: useCallback(async (updated: PlannerEdit) => {
      const { error } = await supabase.from("planner_edits").update(updated).eq("id", updated.id);
      if (!error) onEditsChange(edits.map((e) => (e.id === updated.id ? updated : e)));
    }, [edits, onEditsChange, supabase]),
    onDelete: useCallback(async (id: string) => {
      const { error } = await supabase.from("planner_edits").delete().eq("id", id);
      if (!error) onEditsChange(edits.filter((e) => e.id !== id));
    }, [edits, onEditsChange, supabase]),
  };

  const contentHandlers = {
    onSave: useCallback(async (updated: PlannerContent) => {
      const { error } = await supabase.from("planner_content").update(updated).eq("id", updated.id);
      if (!error) onContentChange(content.map((c) => (c.id === updated.id ? updated : c)));
    }, [content, onContentChange, supabase]),
    onDelete: useCallback(async (id: string) => {
      const { error } = await supabase.from("planner_content").delete().eq("id", id);
      if (!error) onContentChange(content.filter((c) => c.id !== id));
    }, [content, onContentChange, supabase]),
  };

  const inspoHandlers = {
    onSave: useCallback(async (updated: PlannerInspo) => {
      const { error } = await supabase.from("planner_inspo").update(updated).eq("id", updated.id);
      if (!error) onInspoChange(inspo.map((i) => (i.id === updated.id ? updated : i)));
    }, [inspo, onInspoChange, supabase]),
    onDelete: useCallback(async (id: string) => {
      const entry = inspo.find((i) => i.id === id);
      if (entry?.images.length) await supabase.storage.from("planner-inspo").remove(entry.images.map((i) => i.path));
      const { error } = await supabase.from("planner_inspo").delete().eq("id", id);
      if (!error) onInspoChange(inspo.filter((i) => i.id !== id));
    }, [inspo, onInspoChange, supabase]),
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Sort + add row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 p-1" style={{ backgroundColor: "var(--sand)" }}>
          {([["added", "Order Added"], ["date", "Chronological"]] as const).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => setSortMode(mode)}
              className="px-3 py-1.5 text-xs uppercase tracking-widest transition-colors"
              style={{
                fontFamily: "var(--font-body)",
                color: sortMode === mode ? "var(--cream)" : "rgba(26,26,46,0.45)",
                backgroundColor: sortMode === mode ? "var(--charcoal)" : "transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Add entry */}
      <div className="flex flex-col gap-3">
        {!creating ? (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-4 py-3 border w-full sm:w-auto transition-colors hover:bg-[var(--sand)]"
            style={{ borderColor: "var(--border)", borderStyle: "dashed", color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            <Plus size={14} style={{ opacity: 0.4 }} />
            <span className="text-xs uppercase tracking-widest opacity-40">Add entry</span>
          </button>
        ) : (
          <div className="flex flex-wrap gap-2 items-center p-4" style={{ backgroundColor: "var(--sand)" }}>
            <span className="text-xs uppercase tracking-widest opacity-40 w-full mb-1" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
              What are you adding?
            </span>
            {KIND_SECTIONS.filter((s) => isPro || !s.pro).map((s) => (
              <button
                key={s.kind}
                onClick={() => handleCreate(s.kind)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: KIND_CONFIG[s.kind].color,
                  color: ["inspo", "content"].includes(s.kind) ? "var(--charcoal)" : "var(--cream)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {s.label}
              </button>
            ))}
            <button
              onClick={() => setCreating(false)}
              className="px-3 py-2 text-xs opacity-30 hover:opacity-60 transition-opacity"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Journal entries */}
      {items.length === 0 && (
        <p className="text-sm opacity-30 py-8 text-center" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
          Nothing here yet. Add your first entry above.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const config = KIND_CONFIG[item.kind];
          return (
            <div key={`${item.kind}-${item.entry.id}`} className="flex gap-0">
              {/* Type indicator */}
              <div className="flex flex-col items-center gap-1 pt-4 pr-3 flex-shrink-0">
                <div className="w-1 flex-1 min-h-[20px] rounded-full" style={{ backgroundColor: config.color }} />
                <span
                  className="text-[10px] uppercase tracking-widest"
                  style={{
                    color: config.color === "var(--clay)" ? "var(--clay)" : "rgba(26,26,46,0.35)",
                    fontFamily: "var(--font-body)",
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    letterSpacing: "0.12em",
                  }}
                >
                  {config.label}
                </span>
              </div>

              {/* Card */}
              <div className="flex-1 min-w-0">
                {item.kind === "shoot" && (
                  <ShootCard shoot={item.entry} onSave={shootHandlers.onSave} onDelete={shootHandlers.onDelete} />
                )}
                {item.kind === "booking" && (
                  <BookingRow booking={item.entry} onSave={bookingHandlers.onSave} onDelete={bookingHandlers.onDelete} />
                )}
                {item.kind === "edit" && (
                  <EditRow edit={item.entry} onSave={editHandlers.onSave} onDelete={editHandlers.onDelete} />
                )}
                {item.kind === "content" && (
                  <ContentRow content={item.entry} onSave={contentHandlers.onSave} onDelete={contentHandlers.onDelete} />
                )}
                {item.kind === "inspo" && (
                  <InspoCard inspo={item.entry} userId={userId} onSave={inspoHandlers.onSave} onDelete={inspoHandlers.onDelete} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; pro: boolean }[] = [
  { id: "shoots", label: "Shoot Day", pro: false },
  { id: "bookings", label: "Bookings", pro: true },
  { id: "edits", label: "Editing", pro: true },
  { id: "content", label: "Content", pro: true },
  { id: "inspo", label: "Inspo", pro: true },
];

export function PhotographerPlanner({
  userId,
  isPro,
  initialShoots,
  initialBookings,
  initialEdits,
  initialContent,
  initialInspo,
}: {
  userId: string;
  isPro: boolean;
  initialShoots: PlannerShoot[];
  initialBookings: PlannerBooking[];
  initialEdits: PlannerEdit[];
  initialContent: PlannerContent[];
  initialInspo: PlannerInspo[];
}) {
  const [viewMode, setViewMode] = useState<"tabs" | "journal">("tabs");
  const [activeTab, setActiveTab] = useState<Tab>("shoots");
  const [shoots, setShoots] = useState<PlannerShoot[]>(initialShoots);
  const [bookings, setBookings] = useState<PlannerBooking[]>(initialBookings);
  const [edits, setEdits] = useState<PlannerEdit[]>(initialEdits);
  const [content, setContent] = useState<PlannerContent[]>(initialContent);
  const [inspo, setInspo] = useState<PlannerInspo[]>(initialInspo);

  const supabase = createClient();
  const shootsRef = useRef(shoots);
  const editsRef = useRef(edits);
  useEffect(() => { shootsRef.current = shoots; }, [shoots]);
  useEffect(() => { editsRef.current = edits; }, [edits]);

  const maybeCreateShoot = useCallback(async (booking: PlannerBooking) => {
    const exists = shootsRef.current.some(
      (s) => s.client_name === booking.client_name && s.session_date === booking.session_date
    );
    if (exists) return;
    const { data } = await supabase.from("planner_shoots").insert({
      user_id: userId,
      client_name: booking.client_name,
      session_date: booking.session_date,
      session_type: booking.session_type,
      location: "", notes: "", shot_list: [], timeline: [], gear_checklist: [],
    }).select().single();
    if (data) setShoots((prev) => [...prev, data as PlannerShoot]);
  }, [userId, supabase]);

  const maybeCreateEditJob = useCallback(async (booking: PlannerBooking) => {
    const exists = editsRef.current.some(
      (e) => e.client_name === booking.client_name && e.session_date === booking.session_date
    );
    if (exists) return;
    const { data } = await supabase.from("planner_edits").insert({
      user_id: userId,
      client_name: booking.client_name,
      session_date: booking.session_date,
      status: "not_started",
      photos_count: 0, notes: "", tasks: [],
      editing_deadline: null, delivery_deadline: null,
    }).select().single();
    if (data) setEdits((prev) => [...prev, data as PlannerEdit]);
  }, [userId, supabase]);

  const handleBookingStatusChange = useCallback(async (prev: PlannerBooking, next: PlannerBooking) => {
    if (prev.status !== "booked" && next.status === "booked") {
      await maybeCreateShoot(next);
    }
    if (prev.status !== "completed" && next.status === "completed") {
      await maybeCreateEditJob(next);
    }
  }, [maybeCreateShoot, maybeCreateEditJob]);

  // On mount: auto-create edit jobs for bookings whose session date has passed
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const pastBookings = initialBookings.filter(
      (b) => b.session_date && b.session_date < today && (b.status === "booked" || b.status === "completed")
    );
    pastBookings.forEach((b) => maybeCreateEditJob(b));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-full overflow-hidden">
      {/* View mode toggle + pro actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
        {/* Toggle */}
        <div className="flex items-center gap-1 p-1" style={{ backgroundColor: "var(--sand)" }}>
          {(["tabs", "journal"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="px-4 py-2 text-xs uppercase tracking-widest transition-colors"
              style={{
                fontFamily: "var(--font-body)",
                color: viewMode === mode ? "var(--cream)" : "rgba(26,26,46,0.45)",
                backgroundColor: viewMode === mode ? "var(--charcoal)" : "transparent",
              }}
            >
              {mode === "tabs" ? "Organized" : "Journal"}
            </button>
          ))}
        </div>

        {/* Pro actions */}
        {isPro && (
          <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => printPlanner(shoots, bookings, edits, content)}
            className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest border transition-opacity hover:opacity-70"
            style={{ borderColor: "var(--border)", color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            Save as PDF
          </button>
          <a
            href="/downloads/photographer-planner-template.pdf"
            download
            className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest border transition-opacity hover:opacity-70"
            style={{ borderColor: "var(--border)", color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            Download Template
          </a>
          </div>
        )}
      </div>

      {/* Journal view */}
      {viewMode === "journal" && (
        <JournalView
          shoots={shoots} bookings={bookings} edits={edits} content={content} inspo={inspo}
          userId={userId} isPro={isPro}
          onShootsChange={setShoots} onBookingsChange={setBookings}
          onEditsChange={setEdits} onContentChange={setContent} onInspoChange={setInspo}
          onBookingStatusChange={handleBookingStatusChange}
        />
      )}

      {/* Tabs mode */}
      {viewMode === "tabs" && (
        <>
          <div className="grid grid-cols-3 sm:flex sm:flex-nowrap gap-1 mb-8 p-1" style={{ backgroundColor: "var(--sand)" }}>
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              const locked = tab.pro && !isPro;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs uppercase tracking-widest transition-colors sm:flex-1"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: active ? "var(--cream)" : "rgba(26,26,46,0.45)",
                    backgroundColor: active ? "var(--charcoal)" : "transparent",
                  }}
                >
                  {tab.label}
                  {locked && <Lock size={10} style={{ opacity: 0.4 }} />}
                </button>
              );
            })}
          </div>

          {activeTab === "shoots" && (
            <ShootDaySection shoots={shoots} userId={userId} onChange={setShoots} />
          )}
          {activeTab === "bookings" && (
            isPro ? <BookingsSection bookings={bookings} userId={userId} onChange={setBookings} onStatusChange={handleBookingStatusChange} /> : <ProGate />
          )}
          {activeTab === "edits" && (
            isPro ? <EditingSection edits={edits} userId={userId} onChange={setEdits} /> : <ProGate />
          )}
          {activeTab === "content" && (
            isPro ? <ContentSection content={content} userId={userId} onChange={setContent} /> : <ProGate />
          )}
          {activeTab === "inspo" && (
            isPro ? <InspoSection inspo={inspo} userId={userId} onChange={setInspo} /> : <ProGate />
          )}
        </>
      )}
    </div>
  );
}
