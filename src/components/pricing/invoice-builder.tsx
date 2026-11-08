"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { fillMonth, genInvoiceNumber, nextMonthlyDate, todayPacific, addDays } from "@/lib/invoices";
import { PaymentFields, type PaymentValue } from "@/components/pricing/payment-fields";
import { RecurringInvoicesPanel, ScheduleFields } from "@/components/pricing/recurring-invoices-panel";
import type { Invoice, InvoiceSeries } from "@/types/pricing";
import { ProTag, UsageNote, friendlyPlanError } from "@/components/pricing/plan-note";
import { remainingThisMonth } from "@/lib/plan";

export interface InvoicePrefill {
  sourceLabel: string;
  client_name: string;
  client_email: string;
  session_name: string;
  line_items: { description: string; amount: number }[];
  deposit_amount: number;
  due_date: string;
}

interface Props {
  savedInvoices: Invoice[];
  savedSeries: InvoiceSeries[];
  userId: string;
  isPro: boolean;
  usedThisMonth: number;
  prefill?: InvoicePrefill | null;
}

const emptyLine = () => ({ description: "", amount: 0 });

// Start a new invoice with whatever payment method was used last.
function lastPayment(invoices: Invoice[]): PaymentValue {
  const last = invoices.find((i) => i.payment_method);
  return {
    method: last?.payment_method ?? "",
    link: last?.payment_link ?? "",
    instructions: last?.payment_instructions ?? "",
  };
}

// First date on `day` that falls in a later month than today — the current month's
// invoice is the one being sent now.
function firstRunAfterThisMonth(day: number) {
  const today = todayPacific();
  const [y, m] = today.split("-").map(Number);
  const lastOfMonth = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  return nextMonthlyDate(lastOfMonth, day);
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "rgba(0,0,0,0.2)",
  sent: "var(--clay)",
  paid: "#4a7c59",
};

export function InvoiceBuilder({ savedInvoices, savedSeries, userId, isPro, usedThisMonth, prefill }: Props) {
  const [invoices, setInvoices] = useState<Invoice[]>(savedInvoices);
  const [used, setUsed] = useState(usedThisMonth);
  const atLimit = remainingThisMonth("invoices", used, isPro) <= 0;
  const [series, setSeries] = useState<InvoiceSeries[]>(savedSeries);
  const [payment, setPayment] = useState<PaymentValue>(() => lastPayment(savedInvoices));
  const [editingSeriesId, setEditingSeriesId] = useState<string | null>(null);
  const [repeat, setRepeat] = useState(false);
  const [repeatDay, setRepeatDay] = useState(1);
  const [repeatDueDays, setRepeatDueDays] = useState(14);
  const [repeatAutoSend, setRepeatAutoSend] = useState(true);
  const [showForm, setShowForm] = useState(!!prefill);
  const [startedFrom, setStartedFrom] = useState(prefill?.sourceLabel ?? "");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [clientName, setClientName] = useState(prefill?.client_name ?? "");
  const [clientBusiness, setClientBusiness] = useState("");
  const [clientEmail, setClientEmail] = useState(prefill?.client_email ?? "");
  const [sessionName, setSessionName] = useState(prefill?.session_name ?? "");
  const [lineItems, setLineItems] = useState(prefill?.line_items.length ? prefill.line_items : [emptyLine()]);
  const [depositAmount, setDepositAmount] = useState(prefill?.deposit_amount ?? 0);
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState(prefill?.due_date ?? "");
  const [invoiceNumber, setInvoiceNumber] = useState(genInvoiceNumber());

  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [error, setError] = useState("");

  const total = lineItems.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const balanceDue = Math.max(0, total - depositAmount);
  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  function resetForm() {
    setStartedFrom("");
    setClientName("");
    setClientBusiness("");
    setClientEmail("");
    setSessionName("");
    setLineItems([emptyLine()]);
    setDepositAmount(0);
    setNotes("");
    setDueDate("");
    setInvoiceNumber(genInvoiceNumber());
    setPayment(lastPayment(invoices));
    setEditingSeriesId(null);
    setRepeat(false);
    setRepeatDay(1);
    setRepeatDueDays(14);
    setRepeatAutoSend(true);
    setEditingId(null);
    setError("");
    setSendSuccess(false);
  }

  function openNew() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(inv: Invoice) {
    setClientName(inv.client_name);
    setClientBusiness(inv.client_business ?? "");
    setClientEmail(inv.client_email);
    setSessionName(inv.session_name);
    setLineItems(inv.line_items.length > 0 ? inv.line_items : [emptyLine()]);
    setDepositAmount(inv.deposit_amount ?? 0);
    setNotes(inv.notes ?? "");
    setDueDate(inv.due_date ?? "");
    setInvoiceNumber(inv.invoice_number ?? genInvoiceNumber());
    setPayment({ method: inv.payment_method ?? "", link: inv.payment_link ?? "", instructions: inv.payment_instructions ?? "" });
    setEditingSeriesId(inv.series_id ?? null);
    setRepeat(false);
    setEditingId(inv.id ?? null);
    setError("");
    setSendSuccess(false);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setItem(index: number, field: "description" | "amount", value: string) {
    setLineItems((prev) => prev.map((item, i) =>
      i === index ? { ...item, [field]: field === "amount" ? parseFloat(value) || 0 : value } : item
    ));
  }

  function addLine() {
    setLineItems((prev) => [...prev, emptyLine()]);
  }

  function removeLine(index: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveInvoice(status: "draft" | "sent"): Promise<Invoice | null> {
    if (!editingId && atLimit) { setError(friendlyPlanError("free_plan_limit")); return null; }
    setSaving(true);
    setError("");
    const supabase = createClient();
    const today = todayPacific();
    const makeSeries = isPro && repeat && !editingId && !editingSeriesId;
    const payload = {
      user_id: userId,
      invoice_number: invoiceNumber,
      client_name: clientName,
      client_business: clientBusiness || null,
      client_email: clientEmail,
      session_name: fillMonth(sessionName, today),
      line_items: lineItems.filter((i) => i.description.trim()),
      deposit_amount: depositAmount || 0,
      notes,
      due_date: dueDate || (makeSeries ? addDays(today, repeatDueDays) : null),
      status,
      payment_method: payment.method || null,
      payment_link: payment.link.trim() || null,
      payment_instructions: payment.instructions.trim() || null,
    };

    let result: Invoice | null = null;
    if (editingId) {
      const { data, error: err } = await supabase
        .from("invoices")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();
      if (err) { setError(err.message); setSaving(false); return null; }
      result = data as Invoice;
      setInvoices((prev) => prev.map((inv) => inv.id === editingId ? result! : inv));
    } else {
      const { data, error: err } = await supabase
        .from("invoices")
        .insert(payload)
        .select()
        .single();
      if (err) { setError(friendlyPlanError(err.message)); setSaving(false); return null; }
      result = data as Invoice;
      setUsed((u) => u + 1);
      if (makeSeries) {
        const { data: created, error: seriesErr } = await supabase
          .from("invoice_series")
          .insert({
            user_id: userId,
            client_name: clientName,
            client_business: clientBusiness || null,
            client_email: clientEmail,
            title: sessionName,
            line_items: payload.line_items,
            notes,
            payment_method: payload.payment_method,
            payment_link: payload.payment_link,
            payment_instructions: payload.payment_instructions,
            day_of_month: repeatDay,
            due_days: repeatDueDays,
            auto_send: repeatAutoSend,
            active: true,
            next_run_date: firstRunAfterThisMonth(repeatDay),
          })
          .select()
          .single();
        if (seriesErr || !created) {
          setError(`Invoice saved, but the monthly repeat couldn't be set up: ${seriesErr?.message ?? "unknown error"}`);
        } else {
          setSeries((prev) => [...prev, created as InvoiceSeries]);
          await supabase.from("invoices").update({ series_id: created.id }).eq("id", result.id!);
          result = { ...result, series_id: created.id };
          setEditingSeriesId(created.id);
          setRepeat(false);
        }
      }
      setInvoices((prev) => [result!, ...prev]);
      setEditingId(result.id ?? null);
    }
    setSaving(false);
    return result;
  }

  async function handleSave() {
    await saveInvoice("draft");
  }

  async function handleSend() {
    if (!clientEmail.trim()) { setError("Client email is required to send."); return; }
    const inv = await saveInvoice("sent");
    if (!inv) return;
    setSending(true);
    try {
      const res = await fetch("/api/email/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: inv.id }),
      });
      if (!res.ok) throw new Error("Email failed");
      setSendSuccess(true);
    } catch {
      setError("Invoice saved but email failed to send. Try again.");
    }
    setSending(false);
  }

  async function markPaid(inv: Invoice) {
    const supabase = createClient();
    await supabase.from("invoices").update({ status: "paid" }).eq("id", inv.id!);
    setInvoices((prev) => prev.map((i) => i.id === inv.id ? { ...i, status: "paid" } : i));
  }

  async function deleteInvoice(inv: Invoice) {
    if (!confirm(`Delete invoice ${inv.invoice_number}?`)) return;
    const supabase = createClient();
    await supabase.from("invoices").delete().eq("id", inv.id!);
    setInvoices((prev) => prev.filter((i) => i.id !== inv.id));
    if (editingId === inv.id) { resetForm(); setShowForm(false); }
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
      {/* Form */}
      {showForm ? (
        <div className="flex flex-col gap-6 max-w-2xl">
          <div className="flex items-center justify-between">
            <h2
              className="text-xl font-light italic"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
            >
              {editingId ? "Edit Invoice" : "New Invoice"}
            </h2>
            <button
              onClick={() => { resetForm(); setShowForm(false); }}
              className="text-xs uppercase tracking-widest opacity-30 hover:opacity-60 transition-opacity"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              Cancel
            </button>
          </div>

          {startedFrom && (
            <p className="text-xs px-4 py-3" style={{ backgroundColor: "var(--paper, #f5f5f5)", color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
              <span className="opacity-60">Started from contract </span>
              <strong className="font-medium">{startedFrom}</strong>
              <span className="opacity-60">. What&apos;s already been paid is filled in, so the balance is ready to send.</span>
            </p>
          )}

          {/* Invoice number */}
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Invoice #</label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="px-4 py-3 border outline-none text-sm max-w-xs"
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client name */}
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>Contact name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Sarah Johnson"
                className="px-4 py-3 border outline-none text-sm"
                style={inputStyle}
              />
            </div>

            {/* Company / client */}
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>Company / Client <span style={{ opacity: 0.4 }}>(optional)</span></label>
              <input
                type="text"
                value={clientBusiness}
                onChange={(e) => setClientBusiness(e.target.value)}
                placeholder="e.g. Bloom Studio"
                className="px-4 py-3 border outline-none text-sm"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Client email */}
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Client email</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="e.g. sarah@email.com"
              className="px-4 py-3 border outline-none text-sm max-w-sm"
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Session / event */}
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>Session / Event</label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="e.g. Brand shoot — July 2026"
                className="px-4 py-3 border outline-none text-sm"
                style={inputStyle}
              />
            </div>

            {/* Due date */}
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="px-4 py-3 border outline-none text-sm"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Line items */}
          <div className="flex flex-col gap-2">
            <label style={labelStyle}>Line items</label>
            <div className="flex flex-col gap-2">
              {lineItems.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => setItem(i, "description", e.target.value)}
                    placeholder="Description"
                    className="flex-1 px-4 py-3 border outline-none text-sm"
                    style={inputStyle}
                  />
                  <input
                    type="number"
                    value={item.amount || ""}
                    onChange={(e) => setItem(i, "amount", e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-28 px-4 py-3 border outline-none text-sm text-right"
                    style={inputStyle}
                  />
                  {lineItems.length > 1 && (
                    <button
                      onClick={() => removeLine(i)}
                      className="text-xs opacity-20 hover:opacity-50 transition-opacity px-1"
                      style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addLine}
              className="text-xs uppercase tracking-widest opacity-30 hover:opacity-60 transition-opacity text-left mt-1"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              + Add line
            </button>

            {/* Total preview */}
            {total > 0 && (
              <div
                className="flex justify-between items-baseline px-4 py-3 mt-1"
                style={{ backgroundColor: "var(--paper, #f5f5f5)" }}
              >
                <span className="text-xs uppercase tracking-widest opacity-40" style={{ fontFamily: "var(--font-body)" }}>Total</span>
                <span
                  className="text-2xl font-light italic"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--charcoal)" }}
                >
                  {fmt(total)}
                </span>
              </div>
            )}
          </div>

          {/* Deposit already received */}
          <div className="flex flex-col gap-1 max-w-xs">
            <label style={labelStyle}>Deposit already received <span style={{ opacity: 0.4 }}>(optional)</span></label>
            <input
              type="number"
              value={depositAmount || ""}
              onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="px-4 py-3 border outline-none text-sm"
              style={inputStyle}
            />
          </div>

          {/* Balance due preview */}
          {depositAmount > 0 && total > 0 && (
            <div
              className="flex justify-between items-baseline px-4 py-3"
              style={{ backgroundColor: "var(--paper, #f5f5f5)" }}
            >
              <span className="text-xs uppercase tracking-widest opacity-40" style={{ fontFamily: "var(--font-body)" }}>Balance due</span>
              <span
                className="text-xl font-light italic"
                style={{ fontFamily: "var(--font-heading)", color: "var(--charcoal)" }}
              >
                {fmt(balanceDue)}
              </span>
            </div>
          )}

          {/* Payment */}
          <PaymentFields value={payment} onChange={setPayment} isPro={isPro} />

          {/* Repeat monthly */}
          {editingSeriesId ? (
            <p className="text-xs opacity-50 px-4 py-3" style={{ backgroundColor: "var(--paper, #f5f5f5)", color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
              Part of a monthly invoice. To change future months (like a new rate), use Monthly invoices below.
            </p>
          ) : !editingId && (
            <div className="flex flex-col gap-4 px-5 py-4 border" style={{ borderColor: repeat ? "var(--charcoal)" : "var(--border)" }}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={repeat}
                  disabled={!isPro}
                  onChange={(e) => setRepeat(e.target.checked)}
                  className="mt-1 w-4 h-4"
                  style={{ accentColor: "var(--clay)" }}
                />
                <span style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                  <span className="text-sm">Repeat monthly{!isPro && <ProTag />}</span>
                  <span className="block text-xs opacity-40 mt-0.5">
                    This invoice goes out now, then the same one every month until you change or pause it.
                  </span>
                </span>
              </label>
              {repeat && (
                <>
                  <ScheduleFields
                    day={repeatDay}
                    dueDays={repeatDueDays}
                    autoSend={repeatAutoSend}
                    onChange={(v) => { setRepeatDay(v.day); setRepeatDueDays(v.dueDays); setRepeatAutoSend(v.autoSend); }}
                  />
                  <p className="text-xs opacity-40 leading-relaxed" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                    Tip: put <strong>{"{month}"}</strong> in the Session / Event title, like &ldquo;Marketing support — {"{month}"}&rdquo;, and each invoice fills in its own month.
                    {sessionName.includes("{") && ` This one will read “${fillMonth(sessionName, todayPacific())}”.`}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details for the client…"
              rows={3}
              className="px-4 py-3 border outline-none text-sm resize-none leading-relaxed"
              style={inputStyle}
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: "var(--destructive)", fontFamily: "var(--font-body)" }}>
              {error}
            </p>
          )}
          {sendSuccess && (
            <p className="text-sm opacity-60" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
              Invoice sent to {clientEmail}.
            </p>
          )}

          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={handleSave}
              disabled={saving || !clientName.trim()}
              className="px-8 py-3 text-sm uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{
                backgroundColor: "var(--charcoal)",
                color: "var(--cream)",
                fontFamily: "var(--font-body)",
                letterSpacing: "0.15em",
              }}
            >
              {saving ? "Saving…" : "Save draft"}
            </button>
            <button
              onClick={handleSend}
              disabled={sending || saving || !clientName.trim() || !clientEmail.trim()}
              className="px-8 py-3 text-sm uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{
                backgroundColor: "var(--clay)",
                color: "var(--cream)",
                fontFamily: "var(--font-body)",
                letterSpacing: "0.15em",
              }}
            >
              {sending ? "Sending…" : "Send to client"}
            </button>
            {editingId && (
              <a
                href={`/print/invoice/${editingId}`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 text-sm uppercase tracking-widest opacity-50 hover:opacity-80 transition-opacity border"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--charcoal)",
                  fontFamily: "var(--font-body)",
                  letterSpacing: "0.15em",
                }}
              >
                View PDF
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
        <UsageNote tool="invoices" used={used} isPro={isPro} />
        <button
          onClick={openNew}
          className="px-8 py-3 text-sm uppercase tracking-widest transition-opacity hover:opacity-80 self-start"
          style={{
            backgroundColor: "var(--clay)",
            color: "var(--cream)",
            fontFamily: "var(--font-body)",
            letterSpacing: "0.15em",
          }}
        >
          + New Invoice
        </button>
        </div>
      )}

      <RecurringInvoicesPanel
        series={series}
        onSeriesChange={setSeries}
        onInvoiceIssued={(inv) => setInvoices((prev) => [inv, ...prev])}
      />

      {/* Invoice list */}
      {invoices.length > 0 && (
        <div className="flex flex-col gap-3">
          <p
            className="text-xs uppercase tracking-widest opacity-40"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            Invoices
          </p>
          {invoices.map((inv) => {
            const lineTotal = (inv.line_items ?? []).reduce((s, i) => s + (Number(i.amount) || 0), 0);
            const dueFmt = inv.due_date
              ? new Date(inv.due_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : null;
            return (
              <div
                key={inv.id}
                className="flex items-start justify-between gap-4 px-5 py-4 border"
                style={{ borderColor: "var(--border)", backgroundColor: "white" }}
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                    >
                      {inv.client_business || inv.client_name || "—"}
                    </span>
                    {inv.client_business && inv.client_name && (
                      <span className="text-xs opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                        {inv.client_name}
                      </span>
                    )}
                    <span
                      className="text-xs px-2 py-0.5 uppercase tracking-widest"
                      style={{
                        backgroundColor: STATUS_COLORS[inv.status] ?? "rgba(0,0,0,0.15)",
                        color: inv.status === "draft" ? "var(--charcoal)" : "var(--cream)",
                        fontFamily: "var(--font-body)",
                        letterSpacing: "0.12em",
                        fontSize: "9px",
                        opacity: inv.status === "draft" ? 0.5 : 1,
                      }}
                    >
                      {STATUS_LABELS[inv.status]}
                    </span>
                    {inv.series_id && (
                      <span className="text-[9px] uppercase tracking-widest opacity-40" style={{ fontFamily: "var(--font-body)" }}>
                        ↻ Monthly
                      </span>
                    )}
                  </div>
                  <p
                    className="text-xs opacity-40 truncate"
                    style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                  >
                    {[
                      inv.invoice_number,
                      inv.session_name,
                      dueFmt ? `Due ${dueFmt}` : null,
                      inv.deposit_amount ? `${fmt(inv.deposit_amount)} deposit received` : null,
                    ].filter(Boolean).join("  ·  ")}
                  </p>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="flex flex-col items-end">
                    <span
                      className="text-base font-light"
                      style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)", fontStyle: "italic" }}
                    >
                      {fmt(inv.deposit_amount ? Math.max(0, lineTotal - inv.deposit_amount) : lineTotal)}
                    </span>
                    {!!inv.deposit_amount && (
                      <span className="text-[10px] uppercase tracking-widest opacity-35" style={{ fontFamily: "var(--font-body)" }}>
                        balance due
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => openEdit(inv)}
                      className="text-xs uppercase tracking-wider opacity-30 hover:opacity-70 transition-opacity"
                      style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                    >
                      Edit
                    </button>
                    <a
                      href={`/print/invoice/${inv.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs uppercase tracking-wider opacity-30 hover:opacity-70 transition-opacity"
                      style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                    >
                      PDF
                    </a>
                    {inv.status !== "paid" && (
                      <button
                        onClick={() => markPaid(inv)}
                        className="text-xs uppercase tracking-wider opacity-30 hover:opacity-70 transition-opacity"
                        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                      >
                        Paid
                      </button>
                    )}
                    <button
                      onClick={() => deleteInvoice(inv)}
                      className="text-xs uppercase tracking-wider opacity-20 hover:opacity-50 transition-opacity"
                      style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
