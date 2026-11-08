"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { fmt } from "@/lib/pricing";
import { defaultClauses, defaultVariableValues, flattenClauses, type Clause } from "@/lib/contract-clauses";
import { VariableFields } from "@/components/pricing/variable-fields";
import { applyPaymentWording, balanceDueDateFrom, contractPayments, formatContractDate } from "@/lib/contract-payments";
import type { Contract, ContractTemplate } from "@/types/pricing";

interface Props {
  savedContracts: Contract[];
  savedTemplates: ContractTemplate[];
  userId: string;
}

const PACKAGES: { name: string; price: number; minPhotos: number }[] = [
  { name: "Local Wonders", price: 350, minPhotos: 15 },
  { name: "Magic Memories", price: 650, minPhotos: 30 },
  { name: "Coastal Captures", price: 765, minPhotos: 25 },
  { name: "Surprise Proposal", price: 895, minPhotos: 35 },
  { name: "Elevated Adventures", price: 1100, minPhotos: 60 },
  { name: "Elopements & Intimate Images", price: 2220, minPhotos: 100 },
];

function genContractNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 900) + 100);
  return `CTR-${y}${m}-${rand}`;
}

const STATUS_LABELS: Record<Contract["status"], string> = {
  draft: "Draft",
  sent: "Sent",
  signed: "Signed",
};

const STATUS_COLORS: Record<Contract["status"], string> = {
  draft: "rgba(0,0,0,0.2)",
  sent: "var(--clay)",
  signed: "#4a7c59",
};

export function ContractBuilder({ savedContracts, savedTemplates, userId }: Props) {
  const [contracts, setContracts] = useState<Contract[]>(savedContracts);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [contractNumber, setContractNumber] = useState(genContractNumber());
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [packageName, setPackageName] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionLocation, setSessionLocation] = useState("");
  const [groupSize, setGroupSize] = useState(1);
  const [price, setPrice] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [sessionTime, setSessionTime] = useState("");
  const [balanceDueDate, setBalanceDueDate] = useState("");
  // Once the due date is set by hand, stop recalculating it from the session date.
  const [dueDateTouched, setDueDateTouched] = useState(false);
  const [deliverableMinPhotos, setDeliverableMinPhotos] = useState(0);
  const [deliveryDays, setDeliveryDays] = useState(14);
  const [termsText, setTermsText] = useState("");
  const [activeClauses, setActiveClauses] = useState<Clause[] | null>(null);
  const [contractVariables, setContractVariables] = useState<Record<string, string>>({});
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [status, setStatus] = useState<Contract["status"]>("draft");

  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setContractNumber(genContractNumber());
    setClientName("");
    setClientEmail("");
    setPackageName("");
    setSessionDate("");
    setSessionLocation("");
    setGroupSize(1);
    setPrice(0);
    setDepositAmount(0);
    setAmountPaid(0);
    setSessionTime("");
    setBalanceDueDate("");
    setDueDateTouched(false);
    setDeliverableMinPhotos(0);
    setDeliveryDays(14);
    setTermsText("");
    setActiveClauses(null);
    setContractVariables({});
    setShareToken(null);
    setStatus("draft");
    setEditingId(null);
    setError("");
    setSendSuccess(false);
  }

  function openNew() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(c: Contract) {
    setContractNumber(c.contract_number || genContractNumber());
    setClientName(c.client_name);
    setClientEmail(c.client_email);
    setPackageName(c.package_name ?? "");
    setSessionDate(c.session_date ?? "");
    setSessionLocation(c.session_location ?? "");
    setGroupSize(c.group_size ?? 1);
    setPrice(c.price);
    setDepositAmount(c.deposit_amount ?? 0);
    setAmountPaid(c.amount_paid ?? 0);
    setSessionTime(c.session_time ?? "");
    setBalanceDueDate(c.balance_due_date ?? "");
    setDueDateTouched(!!c.balance_due_date && c.balance_due_date !== balanceDueDateFrom(c.session_date ?? "", 7));
    setDeliverableMinPhotos(c.deliverable_min_photos ?? 0);
    setDeliveryDays(c.delivery_days ?? 14);
    setTermsText(c.terms_text || "");
    setActiveClauses(null);
    setContractVariables({});
    setShareToken(c.share_token ?? null);
    setStatus(c.status);
    setEditingId(c.id ?? null);
    setError("");
    setSendSuccess(false);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Merges policy variables (from the panel) with the numbers the form already
  // has (price/deposit/photo count/delivery days), then regenerates the terms
  // text from whichever clause set is currently active. Called explicitly from
  // every relevant onChange rather than a useEffect, so it never fights with
  // hand-edits to the textarea — it only runs when something that should
  // regenerate the text actually changes.
  function regenerate(
    clauses: Clause[],
    vars: Record<string, string>,
    opts?: { price?: number; deposit?: number; paid?: number; dueDate?: string; minPhotos?: number; days?: number }
  ) {
    const money = {
      price: opts?.price ?? price,
      deposit_amount: opts?.deposit ?? depositAmount,
      amount_paid: opts?.paid ?? amountPaid,
      balance_due_date: opts?.dueDate ?? balanceDueDate,
    };
    const pay = contractPayments(money);
    const merged = {
      ...vars,
      deliverableMinPhotos: String(opts?.minPhotos ?? deliverableMinPhotos),
      deliveryDays: String(opts?.days ?? deliveryDays),
      depositAmount: fmt(pay.deposit),
      balanceRemaining: fmt(pay.balance),
    };
    setTermsText(applyPaymentWording(flattenClauses(clauses, merged), money));
  }

  // Days-before-session comes from the "Balance due" policy field (7 if no terms loaded yet).
  function dueDaysSetting(vars: Record<string, string> = contractVariables) {
    const n = parseInt(vars.balanceDueDays ?? "");
    return Number.isFinite(n) ? n : 7;
  }

  function changeSessionDate(value: string) {
    setSessionDate(value);
    if (dueDateTouched) return;
    const due = balanceDueDateFrom(value, dueDaysSetting());
    setBalanceDueDate(due);
    if (activeClauses) regenerate(activeClauses, contractVariables, { dueDate: due });
  }

  function selectPackage(name: string) {
    setPackageName(name);
    const pkg = PACKAGES.find((p) => p.name === name);
    if (pkg) {
      setPrice(pkg.price);
      setDeliverableMinPhotos(pkg.minPhotos);
      if (activeClauses) regenerate(activeClauses, contractVariables, { price: pkg.price, minPhotos: pkg.minPhotos });
    }
  }

  function loadTemplate(templateId: string) {
    const template = savedTemplates.find((t) => t.id === templateId);
    if (!template) return;
    const vars = template.variables && Object.keys(template.variables).length > 0 ? template.variables : defaultVariableValues();
    setActiveClauses(template.clauses);
    setContractVariables(vars);
    regenerate(template.clauses, vars);
  }

  function loadStarterTerms(forState: "OR" | "WA") {
    const clauses = defaultClauses(forState);
    const vars = defaultVariableValues();
    setActiveClauses(clauses);
    setContractVariables(vars);
    regenerate(clauses, vars);
  }

  function updateVariable(id: string, value: string) {
    const next = { ...contractVariables, [id]: value };
    setContractVariables(next);
    let due = balanceDueDate;
    if (id === "balanceDueDays" && !dueDateTouched && sessionDate) {
      due = balanceDueDateFrom(sessionDate, dueDaysSetting(next));
      setBalanceDueDate(due);
    }
    if (activeClauses) regenerate(activeClauses, next, { dueDate: due });
  }

  async function duplicateContract(c: Contract) {
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("contracts")
      .insert({
        user_id: userId,
        contract_number: genContractNumber(),
        client_name: `${c.client_name} (copy)`,
        client_email: c.client_email,
        package_name: c.package_name,
        session_date: null,
        session_location: c.session_location,
        group_size: c.group_size,
        price: c.price,
        deposit_amount: c.deposit_amount,
        amount_paid: 0,
        session_time: c.session_time ?? null,
        balance_due_date: null,
        deliverable_min_photos: c.deliverable_min_photos,
        delivery_days: c.delivery_days,
        terms_text: c.terms_text,
        status: "draft",
        share_token: crypto.randomUUID(),
      })
      .select()
      .single();
    if (!err && data) setContracts((prev) => [data, ...prev]);
  }

  async function saveContract(nextStatus: Contract["status"]): Promise<Contract | null> {
    setSaving(true);
    setError("");
    const supabase = createClient();
    const payload = {
      user_id: userId,
      contract_number: contractNumber,
      client_name: clientName,
      client_email: clientEmail,
      package_name: packageName || null,
      session_date: sessionDate || null,
      session_location: sessionLocation || null,
      group_size: groupSize,
      price,
      deposit_amount: depositAmount,
      amount_paid: amountPaid,
      session_time: sessionTime || null,
      balance_due_date: balanceDueDate || null,
      deliverable_min_photos: deliverableMinPhotos,
      delivery_days: deliveryDays,
      terms_text: termsText,
      status: nextStatus,
    };

    let result: Contract | null = null;
    if (editingId) {
      const { data, error: err } = await supabase
        .from("contracts")
        .update(payload)
        .eq("id", editingId)
        .eq("user_id", userId)
        .select()
        .single();
      if (err) { setError(err.message); setSaving(false); return null; }
      result = data as Contract;
      setContracts((prev) => prev.map((c) => c.id === editingId ? result! : c));
    } else {
      const token = crypto.randomUUID();
      const { data, error: err } = await supabase
        .from("contracts")
        .insert({ ...payload, share_token: token })
        .select()
        .single();
      if (err) { setError(err.message); setSaving(false); return null; }
      result = data as Contract;
      setContracts((prev) => [result!, ...prev]);
      setEditingId(result.id ?? null);
      setShareToken(result.share_token ?? null);
    }
    setStatus(nextStatus);
    setSaving(false);
    return result;
  }

  async function handleSave() {
    await saveContract("draft");
  }

  async function handleSend() {
    if (!clientEmail.trim()) { setError("Client email is required to send."); return; }
    const c = await saveContract(status === "signed" ? "signed" : "sent");
    if (!c) return;
    setSending(true);
    try {
      const res = await fetch("/api/email/contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId: c.id }),
      });
      if (!res.ok) throw new Error("Email failed");
      setSendSuccess(true);
    } catch {
      setError("Contract saved but email failed to send. Try again.");
    }
    setSending(false);
  }

  async function deleteContract(c: Contract) {
    if (!confirm(`Delete contract for ${c.client_name}?`)) return;
    const supabase = createClient();
    await supabase.from("contracts").delete().eq("id", c.id!).eq("user_id", userId);
    setContracts((prev) => prev.filter((x) => x.id !== c.id));
    if (editingId === c.id) { resetForm(); setShowForm(false); }
  }

  function copyLink(token: string) {
    navigator.clipboard.writeText(`${window.location.origin}/c/${token}`);
  }

  const pay = contractPayments({ price, deposit_amount: depositAmount, amount_paid: amountPaid, balance_due_date: balanceDueDate });

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
              {editingId ? "Edit Contract" : "New Contract"}
            </h2>
            <button
              onClick={() => { resetForm(); setShowForm(false); }}
              className="text-xs uppercase tracking-widest opacity-30 hover:opacity-60 transition-opacity"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              Cancel
            </button>
          </div>

          {/* Contract number */}
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Contract #</label>
            <input
              type="text"
              value={contractNumber}
              onChange={(e) => setContractNumber(e.target.value)}
              className="px-4 py-3 border outline-none text-sm max-w-xs"
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>Client name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Sarah Johnson"
                className="px-4 py-3 border outline-none text-sm"
                style={inputStyle}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>Client email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="e.g. sarah@email.com"
                className="px-4 py-3 border outline-none text-sm"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Package */}
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Package</label>
            <select
              value={packageName}
              onChange={(e) => selectPackage(e.target.value)}
              className="px-4 py-3 border outline-none text-sm bg-white"
              style={inputStyle}
            >
              <option value="">— Custom —</option>
              {PACKAGES.map((p) => (
                <option key={p.name} value={p.name}>{p.name} — {fmt(p.price)}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>Session date</label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => changeSessionDate(e.target.value)}
                className="px-4 py-3 border outline-none text-sm"
                style={inputStyle}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>Session time</label>
              <input
                type="time"
                value={sessionTime}
                onChange={(e) => setSessionTime(e.target.value)}
                className="px-4 py-3 border outline-none text-sm"
                style={inputStyle}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_8rem] gap-4">
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>Location</label>
              <input
                type="text"
                value={sessionLocation}
                onChange={(e) => setSessionLocation(e.target.value)}
                placeholder="e.g. Cannon Beach, OR"
                className="px-4 py-3 border outline-none text-sm"
                style={inputStyle}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>Group size</label>
              <input
                type="number"
                min={1}
                value={groupSize || ""}
                onChange={(e) => setGroupSize(parseInt(e.target.value) || 1)}
                className="px-4 py-3 border outline-none text-sm"
                style={inputStyle}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>Price</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={price || ""}
                onChange={(e) => {
                  const v = parseFloat(e.target.value) || 0;
                  setPrice(v);
                  if (activeClauses) regenerate(activeClauses, contractVariables, { price: v });
                }}
                className="px-4 py-3 border outline-none text-sm"
                style={inputStyle}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>Deposit</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={depositAmount || ""}
                onChange={(e) => {
                  const v = parseFloat(e.target.value) || 0;
                  setDepositAmount(v);
                  if (activeClauses) regenerate(activeClauses, contractVariables, { deposit: v });
                }}
                className="px-4 py-3 border outline-none text-sm"
                style={inputStyle}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>Already paid</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={amountPaid || ""}
                placeholder="0"
                onChange={(e) => {
                  const v = parseFloat(e.target.value) || 0;
                  setAmountPaid(v);
                  if (activeClauses) regenerate(activeClauses, contractVariables, { paid: v });
                }}
                className="px-4 py-3 border outline-none text-sm"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Payment picture — what's been received and what's left */}
          {price > 0 && (
            <div className="flex flex-col gap-2 px-5 py-4" style={{ backgroundColor: "var(--sand, #f5f5f0)" }}>
              <div className="flex justify-between text-sm" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                <span className="opacity-60">Session total</span>
                <span>{fmt(price)}</span>
              </div>
              {pay.paid > 0 && (
                <div className="flex justify-between text-sm" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                  <span className="opacity-60">Already received</span>
                  <span>−{fmt(pay.paid)}</span>
                </div>
              )}
              {pay.dueAtSigning > 0 && (
                <div className="flex justify-between text-sm" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                  <span className="opacity-60">{pay.paid > 0 ? "Rest of retainer, due at signing" : "Retainer, due at signing"}</span>
                  <span>{fmt(pay.dueAtSigning)}</span>
                </div>
              )}
              <div
                className="flex flex-wrap justify-between items-center gap-3 pt-2 mt-1"
                style={{ borderTop: "1px solid var(--border)", color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                <span className="text-sm font-medium">Left before the session</span>
                <span className="text-xl font-light italic" style={{ fontFamily: "var(--font-heading)" }}>{fmt(pay.balance)}</span>
              </div>
              {pay.balance > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                  <label style={labelStyle}>Due by</label>
                  <input
                    type="date"
                    value={balanceDueDate}
                    onChange={(e) => {
                      setBalanceDueDate(e.target.value);
                      setDueDateTouched(true);
                      if (activeClauses) regenerate(activeClauses, contractVariables, { dueDate: e.target.value });
                    }}
                    className="px-3 py-2 border outline-none text-sm"
                    style={inputStyle}
                  />
                  <span className="text-xs opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                    {!sessionDate
                      ? "Add a session date and this fills in for you"
                      : dueDateTouched
                      ? "Set by hand"
                      : `${dueDaysSetting()} days before the session${balanceDueDate ? ` (${formatContractDate(balanceDueDate)})` : ""}`}
                  </span>
                  {dueDateTouched && sessionDate && (
                    <button
                      type="button"
                      onClick={() => {
                        const due = balanceDueDateFrom(sessionDate, dueDaysSetting());
                        setBalanceDueDate(due);
                        setDueDateTouched(false);
                        if (activeClauses) regenerate(activeClauses, contractVariables, { dueDate: due });
                      }}
                      className="text-xs opacity-40 hover:opacity-80 transition-opacity underline"
                      style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                    >
                      recalculate
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>Min. photos</label>
              <input
                type="number"
                min={0}
                value={deliverableMinPhotos || ""}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 0;
                  setDeliverableMinPhotos(v);
                  if (activeClauses) regenerate(activeClauses, contractVariables, { minPhotos: v });
                }}
                className="px-4 py-3 border outline-none text-sm"
                style={inputStyle}
              />
            </div>
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Delivery (days)</label>
            <input
              type="number"
              min={0}
              value={deliveryDays || ""}
              onChange={(e) => {
                const v = parseInt(e.target.value) || 0;
                setDeliveryDays(v);
                if (activeClauses) regenerate(activeClauses, contractVariables, { days: v });
              }}
              className="px-4 py-3 border outline-none text-sm"
              style={inputStyle}
            />
          </div>
          </div>

          {/* Terms */}
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Terms &amp; conditions</label>
            <p className="text-xs opacity-40 mb-1" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
              Editable per client. This is a starting template, not legal advice — have a lawyer review before relying on it.
            </p>

            {savedTemplates.length > 0 ? (
              <select
                defaultValue=""
                onChange={(e) => { if (e.target.value) loadTemplate(e.target.value); }}
                className="px-4 py-2.5 text-sm border outline-none bg-white mb-2 max-w-sm"
                style={inputStyle}
              >
                <option value="">Start from template…</option>
                {savedTemplates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            ) : (
              <div className="flex gap-3 flex-wrap mb-2">
                <button
                  type="button"
                  onClick={() => loadStarterTerms("OR")}
                  className="text-xs uppercase tracking-wider opacity-50 hover:opacity-90 transition-opacity underline"
                  style={{ color: "var(--clay)", fontFamily: "var(--font-body)" }}
                >
                  Use Oregon starter
                </button>
                <button
                  type="button"
                  onClick={() => loadStarterTerms("WA")}
                  className="text-xs uppercase tracking-wider opacity-50 hover:opacity-90 transition-opacity underline"
                  style={{ color: "var(--clay)", fontFamily: "var(--font-body)" }}
                >
                  Use Washington starter
                </button>
                <a
                  href="/pricing/contracts/templates"
                  className="text-xs uppercase tracking-wider opacity-40 hover:opacity-70 transition-opacity"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                >
                  or save a reusable template →
                </a>
              </div>
            )}

            {activeClauses && (
              <div className="flex flex-col gap-3 p-4 mb-3" style={{ backgroundColor: "var(--sand, #f5f5f0)" }}>
                <p className="text-xs opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                  Fill these in — they plug straight into the text below. Changing one regenerates the text, so hand-edits made after this point will be overwritten if you change a field again.
                </p>
                <VariableFields values={contractVariables} onChange={updateVariable} />
              </div>
            )}

            <textarea
              value={termsText}
              onChange={(e) => setTermsText(e.target.value)}
              rows={14}
              className="px-4 py-3 border outline-none text-sm resize-y leading-relaxed"
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
              Contract sent to {clientEmail}.
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
              disabled={sending || saving || !clientName.trim() || !clientEmail.trim() || status === "signed"}
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
                href={`/print/contract/${editingId}`}
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
            {shareToken && (
              <button
                onClick={() => copyLink(shareToken)}
                className="text-xs uppercase tracking-wider opacity-40 hover:opacity-80 transition-opacity"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Copy sign link
              </button>
            )}
          </div>
        </div>
      ) : (
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
          + New Contract
        </button>
      )}

      {/* Contract list */}
      {contracts.length > 0 && (
        <div className="flex flex-col gap-3">
          <p
            className="text-xs uppercase tracking-widest opacity-40"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            Contracts
          </p>
          {contracts.map((c) => {
            const dateFmt = c.session_date
              ? new Date(c.session_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : null;
            return (
              <div
                key={c.id}
                className="flex items-start justify-between gap-4 px-5 py-4 border"
                style={{ borderColor: "var(--border)", backgroundColor: "white" }}
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                    >
                      {c.client_name || "—"}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 uppercase tracking-widest"
                      style={{
                        backgroundColor: STATUS_COLORS[c.status] ?? "rgba(0,0,0,0.15)",
                        color: c.status === "draft" ? "var(--charcoal)" : "var(--cream)",
                        fontFamily: "var(--font-body)",
                        letterSpacing: "0.12em",
                        fontSize: "9px",
                        opacity: c.status === "draft" ? 0.5 : 1,
                      }}
                    >
                      {STATUS_LABELS[c.status]}
                    </span>
                  </div>
                  <p
                    className="text-xs opacity-40 truncate"
                    style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                  >
                    {[
                      c.contract_number,
                      c.package_name,
                      dateFmt,
                      (c.amount_paid ?? 0) > 0 ? `${fmt(contractPayments(c).balance)} left` : null,
                    ].filter(Boolean).join("  ·  ")}
                  </p>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <span
                    className="text-base font-light"
                    style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)", fontStyle: "italic" }}
                  >
                    {fmt(c.price)}
                  </span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => openEdit(c)}
                      className="text-xs uppercase tracking-wider opacity-30 hover:opacity-70 transition-opacity"
                      style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                    >
                      Edit
                    </button>
                    {c.share_token && (
                      <button
                        onClick={() => copyLink(c.share_token!)}
                        className="text-xs uppercase tracking-wider opacity-30 hover:opacity-70 transition-opacity"
                        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                      >
                        Link
                      </button>
                    )}
                    <a
                      href={`/print/contract/${c.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs uppercase tracking-wider opacity-30 hover:opacity-70 transition-opacity"
                      style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                    >
                      PDF
                    </a>
                    <button
                      onClick={() => duplicateContract(c)}
                      className="text-xs uppercase tracking-wider opacity-30 hover:opacity-70 transition-opacity"
                      style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => deleteContract(c)}
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
