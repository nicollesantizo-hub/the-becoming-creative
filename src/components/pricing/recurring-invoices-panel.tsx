"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { formatLongDate, nextMonthlyDate, todayPacific } from "@/lib/invoices";
import { paymentMethodLabel } from "@/lib/payment-methods";
import { PaymentFields, type PaymentValue } from "@/components/pricing/payment-fields";
import type { Invoice, InvoiceSeries } from "@/types/pricing";

const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
const body = { color: "var(--charcoal)", fontFamily: "var(--font-body)" } as const;
const labelStyle: React.CSSProperties = { ...body, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.14em", opacity: 0.4 };
const inputStyle = { ...body, backgroundColor: "white", borderColor: "var(--border)" };
const quiet = "text-xs uppercase tracking-wider opacity-30 hover:opacity-70 transition-opacity disabled:opacity-15";

// The list of monthly invoices, with editing (this is where rates get raised),
// pause/resume, send now, and delete.
export function RecurringInvoicesPanel({
  series,
  onSeriesChange,
  onInvoiceIssued,
}: {
  series: InvoiceSeries[];
  onSeriesChange: (s: InvoiceSeries[]) => void;
  onInvoiceIssued: (inv: Invoice) => void;
}) {
  const [editing, setEditing] = useState<InvoiceSeries | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  if (series.length === 0) return null;

  async function patch(s: InvoiceSeries, changes: Partial<InvoiceSeries>) {
    const supabase = createClient();
    const { data, error } = await supabase.from("invoice_series").update(changes).eq("id", s.id!).select().single();
    if (error) {
      setMessage(error.message);
      return null;
    }
    onSeriesChange(series.map((x) => (x.id === s.id ? (data as InvoiceSeries) : x)));
    return data as InvoiceSeries;
  }

  async function toggleActive(s: InvoiceSeries) {
    const resuming = !s.active;
    // Resuming after a pause picks up from the next upcoming date, never a past one.
    const today = todayPacific();
    const next = resuming && s.next_run_date <= today ? nextMonthlyDate(today, s.day_of_month) : s.next_run_date;
    await patch(s, { active: resuming, next_run_date: next });
  }

  async function sendNow(s: InvoiceSeries) {
    const who = s.client_business || s.client_name;
    if (s.auto_send && !confirm(`Create this month's invoice for ${who} and email it now?`)) return;
    setBusy(s.id!);
    setMessage("");
    const res = await fetch("/api/invoices/series/send-now", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seriesId: s.id }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) {
      setMessage(json.error ?? "Something went wrong.");
      return;
    }
    onInvoiceIssued(json.invoice as Invoice);
    // Refresh the series to pick up its new next date.
    const { data } = await createClient().from("invoice_series").select("*").eq("id", s.id!).single();
    if (data) onSeriesChange(series.map((x) => (x.id === s.id ? (data as InvoiceSeries) : x)));
    setMessage(json.sent ? `Sent to ${s.client_email}.` : "This month's invoice is ready above. Give it a look and click Send to client.");
  }

  async function remove(s: InvoiceSeries) {
    if (!confirm(`Stop and delete the monthly invoice for ${s.client_business || s.client_name}? Past invoices stay.`)) return;
    await createClient().from("invoice_series").delete().eq("id", s.id!);
    onSeriesChange(series.filter((x) => x.id !== s.id));
  }

  async function saveEdit() {
    if (!editing) return;
    const original = series.find((x) => x.id === editing.id)!;
    const changes: Partial<InvoiceSeries> = {
      client_name: editing.client_name,
      client_business: editing.client_business || null,
      client_email: editing.client_email,
      title: editing.title,
      line_items: editing.line_items.filter((i) => i.description.trim()),
      notes: editing.notes ?? "",
      day_of_month: editing.day_of_month,
      due_days: editing.due_days,
      auto_send: editing.auto_send,
      payment_method: editing.payment_method || null,
      payment_link: editing.payment_link || null,
      payment_instructions: editing.payment_instructions || null,
    };
    // Changing the day moves the next run to match.
    if (editing.day_of_month !== original.day_of_month) {
      changes.next_run_date = nextMonthlyDate(todayPacific(), editing.day_of_month);
    }
    const saved = await patch(original, changes);
    if (saved) {
      setEditing(null);
      setMessage("Saved. Future invoices will use these details.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs uppercase tracking-widest opacity-40" style={body}>
        Monthly invoices
      </p>
      {message && (
        <p className="text-xs opacity-60" style={body}>
          {message}
        </p>
      )}

      {series.map((s) => {
        const total = s.line_items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
        const isEditing = editing?.id === s.id;
        return (
          <div key={s.id} className="flex flex-col gap-4 px-5 py-4 border" style={{ borderColor: "var(--border)", backgroundColor: "white" }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-sm font-medium" style={body}>
                  {s.client_business || s.client_name}
                  {!s.active && (
                    <span className="ml-2 text-[9px] uppercase tracking-widest px-2 py-0.5" style={{ backgroundColor: "rgba(0,0,0,0.08)" }}>
                      Paused
                    </span>
                  )}
                </span>
                <span className="text-xs opacity-40" style={body}>
                  {[
                    s.title.replace(/\{month\}/gi, "[month]"),
                    s.active ? `Next: ${formatLongDate(s.next_run_date)}` : null,
                    s.auto_send ? "sends automatically" : "ready for you to send",
                    paymentMethodLabel(s.payment_method),
                  ]
                    .filter(Boolean)
                    .join("  ·  ")}
                </span>
              </div>
              <span className="text-base font-light italic shrink-0" style={{ ...body, fontFamily: "var(--font-heading)" }}>
                {fmt(total)}
                <span className="text-xs not-italic opacity-40"> /mo</span>
              </span>
            </div>

            {!isEditing && (
              <div className="flex gap-4 flex-wrap">
                <button onClick={() => setEditing(structuredClone(s))} className={quiet} style={body}>
                  Edit / change rate
                </button>
                <button onClick={() => sendNow(s)} disabled={busy === s.id} className={quiet} style={body}>
                  {busy === s.id ? "Working…" : s.auto_send ? "Send now" : "Prepare this month's"}
                </button>
                <button onClick={() => toggleActive(s)} className={quiet} style={body}>
                  {s.active ? "Pause" : "Resume"}
                </button>
                <button onClick={() => remove(s)} className="text-xs uppercase tracking-wider opacity-20 hover:opacity-50 transition-opacity" style={body}>
                  Delete
                </button>
              </div>
            )}

            {isEditing && editing && (
              <div className="flex flex-col gap-4 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Contact name" value={editing.client_name} onChange={(v) => setEditing({ ...editing, client_name: v })} />
                  <Field label="Company" value={editing.client_business ?? ""} onChange={(v) => setEditing({ ...editing, client_business: v })} />
                  <Field label="Client email" value={editing.client_email} onChange={(v) => setEditing({ ...editing, client_email: v })} />
                  <Field label="Title (use {month})" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
                </div>

                <div className="flex flex-col gap-2">
                  <label style={labelStyle}>Line items</label>
                  {editing.line_items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const li = [...editing.line_items];
                          li[i] = { ...li[i], description: e.target.value };
                          setEditing({ ...editing, line_items: li });
                        }}
                        className="flex-1 px-3 py-2 border outline-none text-sm"
                        style={inputStyle}
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.amount || ""}
                        onChange={(e) => {
                          const li = [...editing.line_items];
                          li[i] = { ...li[i], amount: parseFloat(e.target.value) || 0 };
                          setEditing({ ...editing, line_items: li });
                        }}
                        className="w-28 px-3 py-2 border outline-none text-sm text-right"
                        style={inputStyle}
                      />
                      {editing.line_items.length > 1 && (
                        <button
                          onClick={() => setEditing({ ...editing, line_items: editing.line_items.filter((_, x) => x !== i) })}
                          className="text-xs opacity-20 hover:opacity-50 px-1"
                          style={body}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setEditing({ ...editing, line_items: [...editing.line_items, { description: "", amount: 0 }] })}
                    className="text-xs uppercase tracking-widest opacity-30 hover:opacity-60 text-left"
                    style={body}
                  >
                    + Add line
                  </button>
                </div>

                <ScheduleFields
                  day={editing.day_of_month}
                  dueDays={editing.due_days}
                  autoSend={editing.auto_send}
                  onChange={(v) => setEditing({ ...editing, day_of_month: v.day, due_days: v.dueDays, auto_send: v.autoSend })}
                />

                <PaymentFields
                  value={{ method: editing.payment_method ?? "", link: editing.payment_link ?? "", instructions: editing.payment_instructions ?? "" }}
                  onChange={(v: PaymentValue) =>
                    setEditing({ ...editing, payment_method: v.method, payment_link: v.link, payment_instructions: v.instructions })
                  }
                />

                <div className="flex gap-3">
                  <button
                    onClick={saveEdit}
                    className="px-6 py-2.5 text-xs uppercase tracking-widest hover:opacity-80"
                    style={{ backgroundColor: "var(--charcoal)", color: "var(--cream)", fontFamily: "var(--font-body)" }}
                  >
                    Save changes
                  </button>
                  <button onClick={() => setEditing(null)} className={quiet} style={body}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label style={labelStyle}>{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="px-3 py-2 border outline-none text-sm" style={inputStyle} />
    </div>
  );
}

// Day of month, payment window, and auto-send — shared with the "Repeat monthly" box.
export function ScheduleFields({
  day,
  dueDays,
  autoSend,
  onChange,
}: {
  day: number;
  dueDays: number;
  autoSend: boolean;
  onChange: (v: { day: number; dueDays: number; autoSend: boolean }) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label style={labelStyle}>Goes out on the</label>
          <select
            value={day}
            onChange={(e) => onChange({ day: parseInt(e.target.value), dueDays, autoSend })}
            className="px-3 py-2 border outline-none text-sm bg-white"
            style={inputStyle}
          >
            {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {ordinal(d)} of each month
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label style={labelStyle}>Due</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={dueDays}
              onChange={(e) => onChange({ day, dueDays: parseInt(e.target.value) || 0, autoSend })}
              className="w-20 px-3 py-2 border outline-none text-sm"
              style={inputStyle}
            />
            <span className="text-xs opacity-50" style={body}>
              days after it&apos;s sent
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {[
          { v: false, label: "Have it ready for me to send", sub: "Each month a fresh copy waits as a draft and you get a reminder. Nothing goes out until you click Send." },
          { v: true, label: "Send it to them automatically", sub: "Goes straight to your client. You'll get a quick note each time." },
        ].map((o) => (
          <label key={String(o.v)} className="flex items-start gap-2 cursor-pointer" style={body}>
            <input
              type="radio"
              checked={autoSend === o.v}
              onChange={() => onChange({ day, dueDays, autoSend: o.v })}
              className="mt-1"
              style={{ accentColor: "var(--clay)" }}
            />
            <span className="text-sm">
              {o.label}
              <span className="block text-xs opacity-40">{o.sub}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
