"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { defaultClauses, type Clause, type ContractState } from "@/lib/contract-clauses";
import type { ContractTemplate } from "@/types/pricing";

interface Props {
  savedTemplates: ContractTemplate[];
  userId: string;
}

const STATE_LABELS: Record<ContractState, string> = {
  OR: "Oregon",
  WA: "Washington",
  general: "General",
};

function newClause(): Clause {
  return { id: crypto.randomUUID(), title: "", body: "", enabled: true };
}

export function TemplateBuilder({ savedTemplates, userId }: Props) {
  const [templates, setTemplates] = useState<ContractTemplate[]>(savedTemplates);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [state, setState] = useState<ContractState>("general");
  const [clauses, setClauses] = useState<Clause[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setName("");
    setState("general");
    setClauses([]);
    setEditingId(null);
    setError("");
  }

  function openNew() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(t: ContractTemplate) {
    setName(t.name);
    setState(t.state);
    setClauses(t.clauses ?? []);
    setEditingId(t.id ?? null);
    setError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function loadStarter(forState: ContractState) {
    setState(forState);
    setClauses(defaultClauses(forState));
    if (!name.trim()) {
      setName(forState === "OR" ? "Oregon Starter" : forState === "WA" ? "Washington Starter" : "General Starter");
    }
  }

  function updateClause(id: string, field: "title" | "body", value: string) {
    setClauses((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  }

  function toggleClause(id: string) {
    setClauses((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));
  }

  function removeClause(id: string) {
    setClauses((prev) => prev.filter((c) => c.id !== id));
  }

  function addClause() {
    setClauses((prev) => [...prev, newClause()]);
  }

  async function handleSave() {
    if (!name.trim()) { setError("Give this template a name."); return; }
    setSaving(true);
    setError("");
    const supabase = createClient();
    const payload = { user_id: userId, name, state, clauses };

    if (editingId) {
      const { data, error: err } = await supabase
        .from("contract_templates")
        .update(payload)
        .eq("id", editingId)
        .eq("user_id", userId)
        .select()
        .single();
      if (err) { setError(err.message); setSaving(false); return; }
      setTemplates((prev) => prev.map((t) => (t.id === editingId ? data : t)));
    } else {
      const { data, error: err } = await supabase
        .from("contract_templates")
        .insert(payload)
        .select()
        .single();
      if (err) { setError(err.message); setSaving(false); return; }
      setTemplates((prev) => [data, ...prev]);
    }
    setSaving(false);
    resetForm();
    setShowForm(false);
  }

  async function deleteTemplate(t: ContractTemplate) {
    if (!confirm(`Delete template "${t.name}"?`)) return;
    const supabase = createClient();
    await supabase.from("contract_templates").delete().eq("id", t.id!).eq("user_id", userId);
    setTemplates((prev) => prev.filter((x) => x.id !== t.id));
    if (editingId === t.id) { resetForm(); setShowForm(false); }
  }

  const inputStyle = {
    fontFamily: "var(--font-body)",
    color: "var(--charcoal)",
    backgroundColor: "white",
    borderColor: "var(--border)",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-body)",
    color: "var(--charcoal)",
    fontSize: "11px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.14em",
    opacity: 0.4,
  };

  return (
    <div className="flex flex-col gap-10">
      <a
        href="/pricing/contracts"
        className="text-xs uppercase tracking-widest opacity-40 hover:opacity-70 transition-opacity"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
      >
        ← Back to contracts
      </a>

      {showForm ? (
        <div className="flex flex-col gap-6 max-w-2xl">
          <div className="flex items-center justify-between">
            <h2
              className="text-xl font-light italic"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
            >
              {editingId ? "Edit Template" : "New Template"}
            </h2>
            <button
              onClick={() => { resetForm(); setShowForm(false); }}
              className="text-xs uppercase tracking-widest opacity-30 hover:opacity-60 transition-opacity"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>Template name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Oregon Wedding"
                className="px-4 py-3 border outline-none text-sm"
                style={inputStyle}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value as ContractState)}
                className="px-4 py-3 border outline-none text-sm bg-white"
                style={inputStyle}
              >
                {(Object.keys(STATE_LABELS) as ContractState[]).map((s) => (
                  <option key={s} value={s}>{STATE_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>

          {clauses.length === 0 && (
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => loadStarter("OR")}
                className="px-6 py-2.5 text-xs uppercase tracking-widest border transition-opacity hover:opacity-80"
                style={{ borderColor: "var(--clay)", color: "var(--clay)", fontFamily: "var(--font-body)", letterSpacing: "0.15em" }}
              >
                Use Oregon starter
              </button>
              <button
                onClick={() => loadStarter("WA")}
                className="px-6 py-2.5 text-xs uppercase tracking-widest border transition-opacity hover:opacity-80"
                style={{ borderColor: "var(--clay)", color: "var(--clay)", fontFamily: "var(--font-body)", letterSpacing: "0.15em" }}
              >
                Use Washington starter
              </button>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <label style={labelStyle}>Clauses</label>
            {clauses.map((c) => (
              <div key={c.id} className="flex flex-col gap-2 p-4 border" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={c.enabled} onChange={() => toggleClause(c.id)} />
                  <input
                    type="text"
                    value={c.title}
                    onChange={(e) => updateClause(c.id, "title", e.target.value)}
                    placeholder="Section title (e.g. CANCELLATION POLICY)"
                    className="flex-1 px-3 py-2 text-sm border outline-none uppercase"
                    style={inputStyle}
                  />
                  <button
                    onClick={() => removeClause(c.id)}
                    className="text-xs opacity-30 hover:opacity-60 transition-opacity px-1"
                    style={{ color: "var(--destructive)", fontFamily: "var(--font-body)" }}
                  >
                    ✕
                  </button>
                </div>
                <textarea
                  value={c.body}
                  onChange={(e) => updateClause(c.id, "body", e.target.value)}
                  rows={4}
                  className="px-3 py-2 text-sm border outline-none resize-y leading-relaxed"
                  style={inputStyle}
                />
              </div>
            ))}
            <button
              onClick={addClause}
              className="text-xs uppercase tracking-wider opacity-40 hover:opacity-70 transition-opacity text-left"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              + Add clause
            </button>
          </div>

          {error && (
            <p className="text-sm" style={{ color: "var(--destructive)", fontFamily: "var(--font-body)" }}>
              {error}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 text-sm uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-40 self-start"
            style={{ backgroundColor: "var(--charcoal)", color: "var(--cream)", fontFamily: "var(--font-body)", letterSpacing: "0.15em" }}
          >
            {saving ? "Saving…" : "Save template"}
          </button>
        </div>
      ) : (
        <button
          onClick={openNew}
          className="px-8 py-3 text-sm uppercase tracking-widest transition-opacity hover:opacity-80 self-start"
          style={{ backgroundColor: "var(--clay)", color: "var(--cream)", fontFamily: "var(--font-body)", letterSpacing: "0.15em" }}
        >
          + New Template
        </button>
      )}

      {templates.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-widest opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
            Templates
          </p>
          {templates.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-4 px-5 py-4 border"
              style={{ borderColor: "var(--border)", backgroundColor: "white" }}
            >
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-sm font-medium" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                  {t.name}
                </span>
                <span className="text-xs opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                  {STATE_LABELS[t.state]} · {(t.clauses ?? []).filter((c) => c.enabled).length} clauses
                </span>
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={() => openEdit(t)}
                  className="text-xs uppercase tracking-wider opacity-30 hover:opacity-70 transition-opacity"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTemplate(t)}
                  className="text-xs uppercase tracking-wider opacity-20 hover:opacity-50 transition-opacity"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
