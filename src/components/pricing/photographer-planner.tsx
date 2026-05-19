"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { Trash2, Plus, ChevronDown, ChevronUp, Check, Lock } from "lucide-react";
import type {
  PlannerShoot,
  PlannerBooking,
  PlannerEdit,
  PlannerContent,
  ChecklistItem,
  TimelineEntry,
} from "@/types/pricing";

type Tab = "shoots" | "bookings" | "edits" | "content";

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
      <div className="flex items-center justify-between">
        <p className="text-sm opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
          {shoots.length === 0 ? "No shoots yet." : `${shoots.length} shoot${shoots.length !== 1 ? "s" : ""}`}
        </p>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-80"
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
  lead: "rgba(0,0,0,0.12)",
  booked: "var(--clay)",
  completed: "rgba(0,0,0,0.35)",
  paid: "var(--charcoal)",
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
    <div className="border" style={{ borderColor: "var(--border)", backgroundColor: "white" }}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-[var(--sand)] transition-colors"
      >
        <div
          className="text-xs px-2 py-0.5 flex-shrink-0"
          style={{
            backgroundColor: BOOKING_STATUS_COLORS[booking.status],
            color: ["lead"].includes(booking.status) ? "var(--charcoal)" : "var(--cream)",
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

function BookingsSection({ bookings, userId, onChange }: {
  bookings: PlannerBooking[];
  userId: string;
  onChange: (bookings: PlannerBooking[]) => void;
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
    const { error } = await supabase.from("planner_bookings").update(updated).eq("id", updated.id);
    if (!error) onChange(bookings.map((b) => (b.id === updated.id ? updated : b)));
  }, [bookings, onChange, supabase]);

  const handleDelete = useCallback(async (id: string) => {
    const { error } = await supabase.from("planner_bookings").delete().eq("id", id);
    if (!error) onChange(bookings.filter((b) => b.id !== id));
  }, [bookings, onChange, supabase]);

  return (
    <div className="flex flex-col gap-6">
      {/* Summary */}
      {bookings.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(["lead", "booked", "completed", "paid"] as PlannerBooking["status"][]).map((status) => {
            const count = bookings.filter((b) => b.status === status).length;
            return (
              <div key={status} className="p-4" style={{ backgroundColor: "var(--sand)" }}>
                <p className="text-xs uppercase tracking-widest opacity-40 mb-1" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>{BOOKING_STATUS_LABELS[status]}</p>
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

      <div className="flex items-center justify-between">
        <p className="text-sm opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
          {bookings.length === 0 ? "No bookings yet." : `${bookings.length} booking${bookings.length !== 1 ? "s" : ""}`}
        </p>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-80" style={{ backgroundColor: "var(--charcoal)", color: "var(--cream)", fontFamily: "var(--font-body)" }}>
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
        <div className="grid grid-cols-3 gap-4">
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

      <div className="flex items-center justify-between">
        <p className="text-sm opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
          {edits.length === 0 ? "No editing jobs yet." : `${edits.length} job${edits.length !== 1 ? "s" : ""}`}
        </p>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-80" style={{ backgroundColor: "var(--charcoal)", color: "var(--cream)", fontFamily: "var(--font-body)" }}>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(["idea", "drafted", "scheduled", "posted"] as PlannerContent["status"][]).map((status) => (
            <div key={status} className="p-4" style={{ backgroundColor: "var(--sand)" }}>
              <p className="text-xs uppercase tracking-widest opacity-40 mb-1" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>{CONTENT_STATUS_LABELS[status]}</p>
              <p className="text-2xl font-light" style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}>{byStatus[status]}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
          {content.length === 0 ? "No posts yet." : `${content.length} post${content.length !== 1 ? "s" : ""}`}
        </p>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest transition-opacity hover:opacity-80" style={{ backgroundColor: "var(--charcoal)", color: "var(--cream)", fontFamily: "var(--font-body)" }}>
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

// ─── Main component ───────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; pro: boolean }[] = [
  { id: "shoots", label: "Shoot Day", pro: false },
  { id: "bookings", label: "Bookings", pro: true },
  { id: "edits", label: "Editing", pro: true },
  { id: "content", label: "Content", pro: true },
];

export function PhotographerPlanner({
  userId,
  isPro,
  initialShoots,
  initialBookings,
  initialEdits,
  initialContent,
}: {
  userId: string;
  isPro: boolean;
  initialShoots: PlannerShoot[];
  initialBookings: PlannerBooking[];
  initialEdits: PlannerEdit[];
  initialContent: PlannerContent[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("shoots");
  const [shoots, setShoots] = useState<PlannerShoot[]>(initialShoots);
  const [bookings, setBookings] = useState<PlannerBooking[]>(initialBookings);
  const [edits, setEdits] = useState<PlannerEdit[]>(initialEdits);
  const [content, setContent] = useState<PlannerContent[]>(initialContent);

  return (
    <div>
      {/* Pro actions */}
      {isPro && (
        <div className="flex items-center gap-3 mb-8 flex-wrap">
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

      {/* Tab bar */}
      <div className="flex gap-0 mb-8" style={{ borderBottom: "1px solid var(--border)" }}>
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          const locked = tab.pro && !isPro;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-5 py-3 text-xs uppercase tracking-widest transition-colors relative flex items-center gap-1.5"
              style={{
                fontFamily: "var(--font-body)",
                color: active ? "var(--charcoal)" : "rgba(26,26,46,0.35)",
                borderBottom: active ? "2px solid var(--charcoal)" : "2px solid transparent",
                marginBottom: -1,
                backgroundColor: "transparent",
              }}
            >
              {tab.label}
              {locked && <Lock size={10} style={{ opacity: 0.35 }} />}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "shoots" && (
        <ShootDaySection shoots={shoots} userId={userId} onChange={setShoots} />
      )}
      {activeTab === "bookings" && (
        isPro
          ? <BookingsSection bookings={bookings} userId={userId} onChange={setBookings} />
          : <ProGate />
      )}
      {activeTab === "edits" && (
        isPro
          ? <EditingSection edits={edits} userId={userId} onChange={setEdits} />
          : <ProGate />
      )}
      {activeTab === "content" && (
        isPro
          ? <ContentSection content={content} userId={userId} onChange={setContent} />
          : <ProGate />
      )}
    </div>
  );
}
