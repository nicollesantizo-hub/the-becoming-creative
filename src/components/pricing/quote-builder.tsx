"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import type { SessionType, Quote, CODBResults } from "@/types/pricing";

function fmt(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function calcSessionPrice(
  session: Pick<SessionType, "travel_miles" | "travel_rate_per_mile" | "studio_hourly_rate" | "duration_hours" | "profit_margin">,
  codb: CODBResults
): number {
  const travelCost = session.travel_miles * session.travel_rate_per_mile;
  const studioCost = (session.studio_hourly_rate ?? 0) * session.duration_hours;
  return (codb.minimumPerSession + travelCost + studioCost) * (1 + session.profit_margin / 100);
}

const STATUS_LABELS: Record<Quote["status"], string> = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  declined: "Declined",
};

const STATUS_COLORS: Record<Quote["status"], string> = {
  draft: "rgba(0,0,0,0.3)",
  sent: "var(--clay)",
  accepted: "var(--sage)",
  declined: "var(--destructive)",
};

export function QuoteBuilder({
  savedQuotes,
  sessions,
  userId,
  codb,
  isPro,
}: {
  savedQuotes: Quote[];
  sessions: SessionType[];
  userId: string;
  codb: CODBResults | null;
  isPro: boolean;
}) {
  const [quotes, setQuotes] = useState<Quote[]>(savedQuotes);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [customTravel, setCustomTravel] = useState(0);
  const [customTravelRate, setCustomTravelRate] = useState(0.67);
  const [customMargin, setCustomMargin] = useState(30);
  const [taxRate, setTaxRate] = useState(0);
  const [discountType, setDiscountType] = useState<"none" | "percentage" | "flat">("none");
  const [discountValue, setDiscountValue] = useState(0);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [notes, setNotes] = useState("");

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  const travel = selectedSession
    ? selectedSession.travel_miles
    : customTravel;
  const travelRate = selectedSession
    ? selectedSession.travel_rate_per_mile
    : customTravelRate;
  const margin = selectedSession ? selectedSession.profit_margin : customMargin;

  const basePrice =
    codb && selectedSession
      ? calcSessionPrice(selectedSession, codb)
      : codb
      ? (codb.minimumPerSession + travel * travelRate) * (1 + margin / 100)
      : 0;

  const taxAmount = basePrice * (taxRate / 100);
  const subtotal = basePrice + taxAmount;

  const discountAmount =
    discountType === "percentage"
      ? subtotal * (discountValue / 100)
      : discountType === "flat"
      ? discountValue
      : 0;

  const finalPrice = Math.max(0, subtotal - discountAmount);

  function resetForm() {
    setSelectedSessionId("");
    setCustomTravel(0);
    setCustomTravelRate(0.67);
    setCustomMargin(30);
    setTaxRate(0);
    setDiscountType("none");
    setDiscountValue(0);
    setClientName("");
    setClientEmail("");
    setSessionDate("");
    setNotes("");
    setShowForm(false);
  }

  async function handleSave() {
    if (!isPro) {
      // Free users can generate but not save
      return;
    }
    if (!clientName.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const quote: Omit<Quote, "id" | "created_at"> = {
      user_id: userId,
      session_type_id: selectedSessionId || null,
      client_name: clientName,
      client_email: clientEmail,
      session_date: sessionDate,
      location_type: selectedSession?.location_type ?? "other",
      duration_hours: selectedSession?.duration_hours ?? 0,
      editing_hours: selectedSession?.editing_hours ?? 0,
      travel_miles: travel,
      tax_rate: taxRate,
      discount_type: discountType === "none" ? null : discountType,
      discount_value: discountValue,
      minimum_price: codb?.minimumPerSession ?? 0,
      suggested_price: basePrice,
      final_price: finalPrice,
      notes,
      status: "draft",
    };
    const { data, error } = await supabase
      .from("quotes")
      .insert(quote)
      .select()
      .single();
    if (!error && data) setQuotes((prev) => [data, ...prev]);
    setSaving(false);
    resetForm();
  }

  async function updateStatus(id: string, status: Quote["status"]) {
    const supabase = createClient();
    await supabase.from("quotes").update({ status }).eq("id", id).eq("user_id", userId);
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
  }

  return (
    <div className="max-w-2xl">
      {/* Quote history (pro only) */}
      {isPro && quotes.length > 0 && (
        <div className="mb-10">
          <h2
            className="text-xl font-light italic mb-5"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
          >
            Quote History
          </h2>
          <div className="flex flex-col gap-3">
            {quotes.map((quote) => (
              <div
                key={quote.id}
                className="flex items-center justify-between p-5 border"
                style={{ borderColor: "var(--border)", backgroundColor: "white" }}
              >
                <div className="flex flex-col gap-1">
                  <p
                    className="text-base font-medium"
                    style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                  >
                    {quote.client_name || "Unnamed client"}
                  </p>
                  <p
                    className="text-xs opacity-50"
                    style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                  >
                    {quote.session_date || "No date"} · {fmt(quote.final_price)}
                  </p>
                </div>
                <select
                  value={quote.status}
                  onChange={(e) =>
                    quote.id && updateStatus(quote.id, e.target.value as Quote["status"])
                  }
                  className="text-xs uppercase tracking-wider px-3 py-1.5 border outline-none bg-white"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: STATUS_COLORS[quote.status],
                    borderColor: "var(--border)",
                  }}
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isPro && quotes.length === 0 && (
        <div
          className="p-5 mb-8 border-l-2"
          style={{ borderColor: "var(--clay)", backgroundColor: "var(--sand)" }}
        >
          <p
            className="text-sm opacity-70"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            Free plan: generate quotes and view the breakdown, but quote history
            requires Pro.
          </p>
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 text-sm uppercase tracking-widest transition-opacity hover:opacity-80 border mb-8"
          style={{
            borderColor: "var(--clay)",
            color: "var(--clay)",
            fontFamily: "var(--font-body)",
            letterSpacing: "0.15em",
          }}
        >
          + New quote
        </button>
      )}

      {showForm && (
        <div>
          <h2
            className="text-xl font-light italic mb-6"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
          >
            New Quote
          </h2>

          <div className="flex flex-col gap-5 mb-8">
            {/* Client info */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs uppercase tracking-wider opacity-50"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Client Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client name"
                className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors"
                style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs uppercase tracking-wider opacity-50"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                >
                  Client Email
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors"
                  style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs uppercase tracking-wider opacity-50"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                >
                  Session Date
                </label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors"
                  style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            </div>

            {/* Session selection */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs uppercase tracking-wider opacity-50"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Session Type
              </label>
              {sessions.length > 0 ? (
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors"
                  style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                >
                  <option value="">— Custom / one-off —</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p
                  className="text-sm opacity-50"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                >
                  No session types saved yet — using custom pricing below.
                </p>
              )}
            </div>

            {/* Custom pricing (shown when no session selected) */}
            {!selectedSessionId && (
              <div className="grid grid-cols-3 gap-4 p-4" style={{ backgroundColor: "var(--sand)" }}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider opacity-50" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                    Travel (mi)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={customTravel || ""}
                    placeholder="0"
                    onChange={(e) => setCustomTravel(parseFloat(e.target.value) || 0)}
                    className="px-3 py-2 text-sm bg-white border outline-none"
                    style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider opacity-50" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                    $/mile
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={customTravelRate || ""}
                    onChange={(e) => setCustomTravelRate(parseFloat(e.target.value) || 0)}
                    className="px-3 py-2 text-sm bg-white border outline-none"
                    style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-wider opacity-50" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                    Margin %
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={customMargin || ""}
                    onChange={(e) => setCustomMargin(parseFloat(e.target.value) || 0)}
                    className="px-3 py-2 text-sm bg-white border outline-none"
                    style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                  />
                </div>
              </div>
            )}

            {/* Sales tax */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs uppercase tracking-wider opacity-50"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Sales tax rate (% — 0 if not applicable)
              </label>
              <input
                type="number"
                min={0}
                max={30}
                step={0.25}
                value={taxRate || ""}
                placeholder="0"
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors w-32"
                style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Discount */}
            <div className="flex flex-col gap-2">
              <label
                className="text-xs uppercase tracking-wider opacity-50"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Discount
              </label>
              <div className="flex gap-2">
                {(["none", "percentage", "flat"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDiscountType(type)}
                    className="px-4 py-1.5 text-xs uppercase tracking-wider border transition-colors"
                    style={{
                      fontFamily: "var(--font-body)",
                      borderColor: discountType === type ? "var(--clay)" : "var(--border)",
                      backgroundColor: discountType === type ? "var(--clay)" : "white",
                      color: discountType === type ? "var(--cream)" : "var(--charcoal)",
                    }}
                  >
                    {type === "none" ? "None" : type === "percentage" ? "% Off" : "$ Off"}
                  </button>
                ))}
              </div>
              {discountType !== "none" && (
                <input
                  type="number"
                  min={0}
                  value={discountValue || ""}
                  placeholder={discountType === "percentage" ? "e.g. 10" : "e.g. 50"}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors w-40"
                  style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              )}
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs uppercase tracking-wider opacity-50"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Package details, deliverables, special requests…"
                rows={3}
                className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors resize-none"
                style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
          </div>

          {/* Quote summary */}
          {codb && (
            <div
              className="p-6 mb-6"
              style={{ backgroundColor: "var(--charcoal)" }}
            >
              <p
                className="text-xs uppercase tracking-widest opacity-40 mb-4"
                style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}
              >
                Quote Summary
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="text-sm opacity-60" style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}>
                    {selectedSession ? selectedSession.name : "Custom session"}
                  </span>
                  <span className="text-sm" style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}>
                    {fmt(basePrice)}
                  </span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm opacity-60" style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}>
                      Sales tax ({taxRate}%)
                    </span>
                    <span className="text-sm" style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}>
                      {fmt(taxAmount)}
                    </span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm opacity-60" style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}>
                      Discount
                    </span>
                    <span className="text-sm" style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}>
                      −{fmt(discountAmount)}
                    </span>
                  </div>
                )}
                <div
                  className="flex justify-between pt-3"
                  style={{ borderTop: "1px solid rgba(247,243,237,0.15)" }}
                >
                  <span
                    className="text-base font-medium"
                    style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}
                  >
                    Total
                  </span>
                  <span
                    className="text-3xl font-light italic"
                    style={{ color: "var(--cream)", fontFamily: "var(--font-heading)" }}
                  >
                    {fmt(finalPrice)}
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
              <p className="text-sm opacity-70" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                Set up your Calculator to generate accurate quotes.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            {isPro ? (
              <button
                onClick={handleSave}
                disabled={saving || !clientName.trim() || !codb}
                className="px-8 py-3 text-sm uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{ backgroundColor: "var(--clay)", color: "var(--cream)", fontFamily: "var(--font-body)", letterSpacing: "0.15em" }}
              >
                {saving ? "Saving…" : "Save quote"}
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <p
                  className="text-xs opacity-50"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                >
                  Saving quotes requires Pro. You can use the summary above for reference.
                </p>
              </div>
            )}
            <button
              onClick={resetForm}
              className="px-6 py-3 text-sm uppercase tracking-wider opacity-40 hover:opacity-70 transition-opacity"
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
