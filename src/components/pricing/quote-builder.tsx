"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { fmt, calcSessionPrice } from "@/lib/pricing";
import type { SessionType, Quote, CODBResults } from "@/types/pricing";

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
  const [saveError, setSaveError] = useState("");
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [customTravel, setCustomTravel] = useState(0);
  const [customTravelRate, setCustomTravelRate] = useState(0.67);
  const [customMargin, setCustomMargin] = useState(30);
  const [taxRate, setTaxRate] = useState(0);
  const [discountType, setDiscountType] = useState<"none" | "percentage" | "flat">("none");
  const [discountValue, setDiscountValue] = useState(0);
  const [quoteName, setQuoteName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientBusiness, setClientBusiness] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [pointOfContact, setPointOfContact] = useState("");
  const [marketingCost, setMarketingCost] = useState(0);
  const [lodgingCost, setLodgingCost] = useState(0);
  const [mealCost, setMealCost] = useState(0);
  const [additionalPersonnel, setAdditionalPersonnel] = useState<{ name: string; role: string; cost: number }[]>([]);
  const [coverageItems, setCoverageItems] = useState<string[]>([]);
  const [galleryTurnaround, setGalleryTurnaround] = useState("");
  const [quoteEventDays, setQuoteEventDays] = useState(1);
  const [sessionDate, setSessionDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [addons, setAddons] = useState<{ label: string; price: number }[]>([]);
  const [shareSlug, setShareSlug] = useState("");

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);
  const isEventSession = selectedSession?.location_type === "event";
  const isMultiDay = isEventSession && (quoteEventDays > 1 || !!eventEndDate);

  const travel = customTravel;
  const travelRate = selectedSession ? selectedSession.travel_rate_per_mile : customTravelRate;
  const margin = selectedSession ? selectedSession.profit_margin : customMargin;

  // Override session type's event_days with the quote-level value
  const effectiveSession = selectedSession
    ? {
        ...selectedSession,
        travel_miles: customTravel,
        ...(isEventSession ? { event_days: Math.max(1, quoteEventDays) } : {}),
      }
    : null;

  const basePrice =
    codb && effectiveSession
      ? calcSessionPrice(effectiveSession, codb)
      : codb
      ? (codb.minimumPerSession + travel * travelRate) * (1 + margin / 100)
      : 0;

  const mktCost = isEventSession ? (marketingCost || 0) : 0;
  const lodgCost = isMultiDay ? (lodgingCost || 0) : 0;
  const mlCost = isMultiDay ? (mealCost || 0) : 0;
  const personnelTotal = isEventSession ? additionalPersonnel.reduce((sum, p) => sum + (p.cost || 0), 0) : 0;
  const addonsTotal = addons.reduce((sum, a) => sum + (a.price || 0), 0);
  const taxAmount = (basePrice + mktCost + lodgCost + mlCost + personnelTotal + addonsTotal) * (taxRate / 100);
  const subtotal = basePrice + mktCost + lodgCost + mlCost + personnelTotal + addonsTotal + taxAmount;

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
    setClientBusiness("");
    setClientEmail("");
    setEventName("");
    setEventLocation("");
    setPointOfContact("");
    setMarketingCost(0);
    setLodgingCost(0);
    setMealCost(0);
    setAdditionalPersonnel([]);
    setCoverageItems([]);
    setGalleryTurnaround("");
    setQuoteEventDays(1);
    setSessionDate("");
    setEventEndDate("");
    setNotes("");
    setPaymentTerms("");
    setAddons([]);
    setQuoteName("");
    setShareSlug("");
    setEditingQuoteId(null);
    setShowForm(false);
  }

  function loadQuoteIntoForm(quote: Quote) {
    setQuoteName(quote.quote_name ?? "");
    setClientName(quote.client_name ?? "");
    setClientBusiness(quote.client_business ?? "");
    setClientEmail(quote.client_email ?? "");
    setEventName(quote.event_name ?? "");
    setEventLocation(quote.event_location ?? "");
    setPointOfContact(quote.point_of_contact ?? "");
    setMarketingCost(quote.marketing_cost ?? 0);
    setLodgingCost(quote.lodging_cost ?? 0);
    setMealCost(quote.meal_cost ?? 0);
    setAdditionalPersonnel(quote.additional_personnel ?? []);
    setCoverageItems(quote.coverage_items ?? []);
    setGalleryTurnaround(quote.gallery_turnaround ?? "");
    setQuoteEventDays(quote.event_days ?? 1);
    setSessionDate(quote.session_date ?? "");
    setEventEndDate(quote.event_end_date ?? "");
    setNotes(quote.notes ?? "");
    setPaymentTerms(quote.payment_terms ?? "");
    setSelectedSessionId(quote.session_type_id ?? "");
    setTaxRate(quote.tax_rate ?? 0);
    setDiscountType(quote.discount_type ?? "none");
    setDiscountValue(quote.discount_value ?? 0);
    setCustomTravel(quote.travel_miles ?? 0);
    setAddons(quote.addons ?? []);
    setShareSlug(quote.share_token ?? "");
    setEditingQuoteId(quote.id ?? null);
    setShowForm(true);
    setSaveError("");
  }

  async function duplicateQuote(quote: Quote) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("quotes")
      .insert({
        user_id: userId,
        session_type_id: quote.session_type_id,
        quote_name: quote.quote_name ? `${quote.quote_name} (copy)` : "",
        client_name: `${quote.client_name} (copy)`,
        client_business: quote.client_business,
        client_email: quote.client_email,
        event_name: quote.event_name,
        event_location: quote.event_location,
        point_of_contact: quote.point_of_contact,
        marketing_cost: quote.marketing_cost ?? 0,
        lodging_cost: quote.lodging_cost ?? 0,
        meal_cost: quote.meal_cost ?? 0,
        additional_personnel: quote.additional_personnel ?? [],
        coverage_items: quote.coverage_items ?? [],
        gallery_turnaround: quote.gallery_turnaround,
        event_days: quote.event_days,
        session_date: quote.session_date,
        event_end_date: quote.event_end_date,
        location_type: quote.location_type,
        duration_hours: quote.duration_hours,
        editing_hours: quote.editing_hours,
        travel_miles: quote.travel_miles,
        tax_rate: quote.tax_rate,
        discount_type: quote.discount_type,
        discount_value: quote.discount_value,
        minimum_price: quote.minimum_price,
        suggested_price: quote.suggested_price,
        final_price: quote.final_price,
        notes: quote.notes,
        payment_terms: quote.payment_terms,
        addons: quote.addons ?? [],
        status: "draft",
      })
      .select()
      .single();
    if (!error && data) setQuotes((prev) => [data, ...prev]);
  }

  async function handleSave() {
    if (!isPro) {
      // Free users can generate but not save
      return;
    }
    const hasIdentity = clientName.trim() || (isEventSession && (clientBusiness.trim() || pointOfContact.trim()));
    if (!hasIdentity) return;
    setSaving(true);
    const supabase = createClient();
    const quote: Omit<Quote, "id" | "created_at"> = {
      user_id: userId,
      session_type_id: selectedSessionId || null,
      quote_name: quoteName,
      client_name: clientName,
      client_business: clientBusiness,
      client_email: clientEmail,
      event_name: eventName || undefined,
      event_location: eventLocation || undefined,
      point_of_contact: pointOfContact || undefined,
      marketing_cost: mktCost,
      lodging_cost: lodgCost,
      meal_cost: mlCost,
      additional_personnel: isEventSession ? additionalPersonnel.filter(p => p.name.trim() || p.role.trim()) : [],
      coverage_items: isEventSession ? coverageItems.filter(s => s.trim()) : [],
      gallery_turnaround: galleryTurnaround || undefined,
      event_days: isEventSession ? quoteEventDays : undefined,
      session_date: sessionDate,
      event_end_date: (isEventSession && eventEndDate) ? eventEndDate : undefined,
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
      payment_terms: paymentTerms || undefined,
      addons,
      status: "draft",
    };
    if (editingQuoteId) {
      const updatedSlug = shareSlug.trim()
        ? shareSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
        : Math.random().toString(36).slice(2, 10);
      const { data, error } = await supabase
        .from("quotes")
        .update({ ...quote, share_token: updatedSlug })
        .eq("id", editingQuoteId)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) { setSaveError(error.message); setSaving(false); return; }
      if (data) setQuotes((prev) => prev.map((q) => (q.id === editingQuoteId ? data : q)));
    } else {
      const slug = shareSlug.trim()
        ? shareSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
        : Math.random().toString(36).slice(2, 10);
      const { data, error } = await supabase
        .from("quotes")
        .insert({ ...quote, share_token: slug })
        .select()
        .single();
      if (error) { setSaveError(error.message); setSaving(false); return; }
      if (data) setQuotes((prev) => [data, ...prev]);
    }
    setSaving(false);
    setSaveError("");
    resetForm();
  }

  async function updateStatus(id: string, status: Quote["status"]) {
    const supabase = createClient();
    await supabase.from("quotes").update({ status }).eq("id", id).eq("user_id", userId);
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
  }

  return (
    <div className="max-w-2xl">
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

      {/* Quote history (pro only) */}
      {isPro && quotes.length > 0 && !showForm && (
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
                className="flex flex-col gap-4 p-5 border"
                style={{ borderColor: "var(--border)", backgroundColor: "white" }}
              >
                {/* Quote info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <p
                      className="text-base font-medium"
                      style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                    >
                      {quote.quote_name || quote.client_name || "Unnamed quote"}
                    </p>
                    <p
                      className="text-xs opacity-50"
                      style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                    >
                      {quote.quote_name ? `${[quote.client_business, quote.client_name].filter(Boolean).join(" · ")} · ` : ""}{quote.session_date || "No date"}
                    </p>
                  </div>
                  <span
                    className="text-base font-medium shrink-0"
                    style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                  >
                    {fmt(quote.final_price)}
                  </span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 flex-wrap">
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
                  <button
                    onClick={() => loadQuoteIntoForm(quote)}
                    className="text-xs uppercase tracking-wider opacity-40 hover:opacity-80 transition-opacity"
                    style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => duplicateQuote(quote)}
                    className="text-xs uppercase tracking-wider opacity-40 hover:opacity-80 transition-opacity"
                    style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                  >
                    Duplicate
                  </button>
                  <a
                    href={`/print/quote/${quote.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs uppercase tracking-wider opacity-40 hover:opacity-80 transition-opacity"
                    style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                  >
                    PDF
                  </a>
                  {quote.share_token && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/q/${quote.share_token}`);
                      }}
                      className="text-xs uppercase tracking-wider opacity-40 hover:opacity-80 transition-opacity"
                      style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                    >
                      Copy Link
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      if (!quote.id) return;
                      const supabase = createClient();
                      const { error } = await supabase.from("quotes").delete().eq("id", quote.id).eq("user_id", userId);
                      if (!error) setQuotes((prev) => prev.filter((q) => q.id !== quote.id));
                    }}
                    className="text-xs uppercase tracking-wider opacity-30 hover:opacity-70 transition-opacity"
                    style={{ color: "var(--destructive)", fontFamily: "var(--font-body)" }}
                  >
                    Delete
                  </button>
                </div>
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
            Free plan: generate quotes and view the breakdown, but quote history requires{" "}
            <a
              href="/pricing/upgrade"
              className="underline opacity-100 hover:opacity-70 transition-opacity"
              style={{ color: "var(--clay)" }}
            >
              Pro
            </a>
            .
          </p>
        </div>
      )}

      {showForm && (
        <div>
          {editingQuoteId && quotes.length > 0 && (
            <button
              onClick={resetForm}
              className="text-xs uppercase tracking-wider opacity-40 hover:opacity-80 transition-opacity mb-5 block"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              ← Back to quotes
            </button>
          )}
          <h2
            className="text-xl font-light italic mb-6"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
          >
            {editingQuoteId ? `Editing: ${quotes.find(q => q.id === editingQuoteId)?.quote_name || quotes.find(q => q.id === editingQuoteId)?.client_name || "Quote"}` : "New Quote"}
          </h2>

          <div className="flex flex-col gap-5 mb-8">
            {/* Quote name */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs uppercase tracking-wider opacity-50"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Quote Label (optional)
              </label>
              <input
                type="text"
                value={quoteName}
                onChange={(e) => setQuoteName(e.target.value)}
                placeholder="e.g. Summer Portraits, Wedding Inquiry, Senior Session…"
                className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors"
                style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Personal note */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs uppercase tracking-wider opacity-50"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Personal note to client (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Hi [name], thank you so much for reaching out! I'd love to work with you…"
                rows={3}
                className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors resize-none"
                style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Client name — hidden for events once business/POC are filled */}
            {!(isEventSession && (clientBusiness.trim() || pointOfContact.trim())) && (
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
            )}

            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs uppercase tracking-wider opacity-50"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Business / Brand <span style={{ opacity: 0.4 }}>(optional)</span>
              </label>
              <input
                type="text"
                value={clientBusiness}
                onChange={(e) => setClientBusiness(e.target.value)}
                placeholder="e.g. Bloom Studio"
                className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors"
                style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Event-specific client fields */}
            {isEventSession && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs uppercase tracking-wider opacity-50"
                    style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                  >
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g. Portland Night Market, Annual Gala, Brand Launch…"
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
                    Venue / Location
                  </label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="e.g. Oregon Convention Center, Portland OR"
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
                    Point of Contact
                  </label>
                  <input
                    type="text"
                    value={pointOfContact}
                    onChange={(e) => setPointOfContact(e.target.value)}
                    placeholder="Name and/or phone number"
                    className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors"
                    style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
              </>
            )}

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
                  {isEventSession ? "Event Start Date" : "Session Date"}
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

            {/* Event end date */}
            {isEventSession && (
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs uppercase tracking-wider opacity-50"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                >
                  Event End Date <span style={{ opacity: 0.4 }}>(optional — for multi-day)</span>
                </label>
                <input
                  type="date"
                  value={eventEndDate}
                  min={sessionDate || undefined}
                  onChange={(e) => setEventEndDate(e.target.value)}
                  className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors"
                  style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            )}

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

            {/* Number of days — event session only */}
            {isEventSession && (
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs uppercase tracking-wider opacity-50"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                >
                  Number of Days
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={quoteEventDays > 0 ? quoteEventDays : ""}
                  onChange={(e) => setQuoteEventDays(parseInt(e.target.value) || 0)}
                  className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors w-32"
                  style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border)";
                    if (!quoteEventDays || quoteEventDays < 1) setQuoteEventDays(1);
                  }}
                />
              </div>
            )}

            {/* Travel miles — always shown */}
            <div className={`grid gap-4 p-4 ${!selectedSessionId ? "grid-cols-3" : "grid-cols-2"}`} style={{ backgroundColor: "var(--sand)" }}>
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
              {!selectedSessionId && (
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
              )}
              {!selectedSessionId && (
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
              )}
            </div>

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

            {/* Add-ons */}
            <div className="flex flex-col gap-3">
              <label
                className="text-xs uppercase tracking-wider opacity-50"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Add-ons & extra charges
              </label>
              {addons.map((addon, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="e.g. Props, Rush delivery, Extra hour…"
                    value={addon.label}
                    onChange={(e) => {
                      const updated = [...addons];
                      updated[i] = { ...updated[i], label: e.target.value };
                      setAddons(updated);
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-white border outline-none"
                    style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                  />
                  <input
                    type="number"
                    placeholder="$"
                    min={0}
                    value={addon.price || ""}
                    onChange={(e) => {
                      const updated = [...addons];
                      updated[i] = { ...updated[i], price: parseFloat(e.target.value) || 0 };
                      setAddons(updated);
                    }}
                    className="w-24 px-3 py-2 text-sm bg-white border outline-none"
                    style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setAddons(addons.filter((_, idx) => idx !== i))}
                    className="text-xs opacity-30 hover:opacity-60 transition-opacity px-2"
                    style={{ color: "var(--destructive)", fontFamily: "var(--font-body)" }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setAddons([...addons, { label: "", price: 0 }])}
                className="text-xs uppercase tracking-wider opacity-40 hover:opacity-70 transition-opacity text-left"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                + Add line item
              </button>
            </div>

            {/* Marketing cost — event only */}
            {isEventSession && (
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs uppercase tracking-wider opacity-50"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                >
                  Marketing & Advertising ($) <span style={{ opacity: 0.4 }}>(optional)</span>
                </label>
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={marketingCost || ""}
                  placeholder="0"
                  onChange={(e) => setMarketingCost(parseFloat(e.target.value) || 0)}
                  className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors w-40"
                  style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
                <p className="text-xs opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                  Licensing, promotions, or ad costs passed through to the client
                </p>
              </div>
            )}

            {/* Lodging & meals — multi-day events only */}
            {isMultiDay && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-xs uppercase tracking-wider opacity-50"
                    style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                  >
                    Lodging ($) <span style={{ opacity: 0.4 }}>(optional)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={lodgingCost || ""}
                    placeholder="0"
                    onChange={(e) => setLodgingCost(parseFloat(e.target.value) || 0)}
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
                    Meals ($) <span style={{ opacity: 0.4 }}>(optional)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={5}
                    value={mealCost || ""}
                    placeholder="0"
                    onChange={(e) => setMealCost(parseFloat(e.target.value) || 0)}
                    className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors"
                    style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
              </div>
            )}

            {/* Additional personnel — event only */}
            {isEventSession && (
              <div className="flex flex-col gap-3">
                <div>
                  <label
                    className="text-xs uppercase tracking-wider opacity-50"
                    style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                  >
                    Additional Personnel <span style={{ opacity: 0.4 }}>(optional)</span>
                  </label>
                  <p className="text-xs opacity-40 mt-1" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                    Second shooters, assistants, or other crew — each added as a cost line item on the PDF.
                  </p>
                </div>
                {additionalPersonnel.map((person, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Name"
                      value={person.name}
                      onChange={(e) => {
                        const updated = [...additionalPersonnel];
                        updated[i] = { ...updated[i], name: e.target.value };
                        setAdditionalPersonnel(updated);
                      }}
                      className="flex-1 px-3 py-2 text-sm bg-white border outline-none"
                      style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                    />
                    <input
                      type="text"
                      placeholder="Role (e.g. Second Shooter)"
                      value={person.role}
                      onChange={(e) => {
                        const updated = [...additionalPersonnel];
                        updated[i] = { ...updated[i], role: e.target.value };
                        setAdditionalPersonnel(updated);
                      }}
                      className="flex-1 px-3 py-2 text-sm bg-white border outline-none"
                      style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                    />
                    <input
                      type="number"
                      placeholder="$"
                      min={0}
                      value={person.cost || ""}
                      onChange={(e) => {
                        const updated = [...additionalPersonnel];
                        updated[i] = { ...updated[i], cost: parseFloat(e.target.value) || 0 };
                        setAdditionalPersonnel(updated);
                      }}
                      className="w-24 px-3 py-2 text-sm bg-white border outline-none"
                      style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                    />
                    <button
                      type="button"
                      onClick={() => setAdditionalPersonnel(additionalPersonnel.filter((_, idx) => idx !== i))}
                      className="text-xs opacity-30 hover:opacity-60 transition-opacity px-2"
                      style={{ color: "var(--destructive)", fontFamily: "var(--font-body)" }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setAdditionalPersonnel([...additionalPersonnel, { name: "", role: "", cost: 0 }])}
                  className="text-xs uppercase tracking-wider opacity-40 hover:opacity-70 transition-opacity text-left"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                >
                  + Add personnel
                </button>
              </div>
            )}

            {/* Key coverage moments — event only */}
            {isEventSession && (
              <div className="flex flex-col gap-3">
                <div>
                  <label
                    className="text-xs uppercase tracking-wider opacity-50"
                    style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                  >
                    Key Coverage Moments <span style={{ opacity: 0.4 }}>(optional)</span>
                  </label>
                  <p className="text-xs opacity-40 mt-1" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                    Specific shots or scenes to document — shown on the PDF to justify scope for grant proposals or client approvals.
                  </p>
                </div>
                {coverageItems.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder={`e.g. ${["Opening ceremony", "Keynote speaker on stage", "Exhibitor booths & signage", "Award presentations", "Attendee engagement moments", "Sponsor activations"][i % 6]}`}
                      value={item}
                      onChange={(e) => {
                        const updated = [...coverageItems];
                        updated[i] = e.target.value;
                        setCoverageItems(updated);
                      }}
                      className="flex-1 px-3 py-2 text-sm bg-white border outline-none"
                      style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                    />
                    <button
                      type="button"
                      onClick={() => setCoverageItems(coverageItems.filter((_, idx) => idx !== i))}
                      className="text-xs opacity-30 hover:opacity-60 transition-opacity px-2"
                      style={{ color: "var(--destructive)", fontFamily: "var(--font-body)" }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setCoverageItems([...coverageItems, ""])}
                  className="text-xs uppercase tracking-wider opacity-40 hover:opacity-70 transition-opacity text-left"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                >
                  + Add coverage moment
                </button>
              </div>
            )}

            {/* Gallery turnaround */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs uppercase tracking-wider opacity-50"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Gallery Turnaround <span style={{ opacity: 0.4 }}>(optional)</span>
              </label>
              <input
                type="text"
                value={galleryTurnaround}
                onChange={(e) => setGalleryTurnaround(e.target.value)}
                placeholder="e.g. 2–3 weeks, 30 days, 6–8 weeks…"
                className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors"
                style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Payment terms */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs uppercase tracking-wider opacity-50"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Payment Terms <span style={{ opacity: 0.4 }}>(optional — overrides your default)</span>
              </label>
              <textarea
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="e.g. 50% retainer due upon signing. Remaining balance due 7 days before the event."
                rows={3}
                className="px-4 py-2.5 text-sm bg-white border outline-none transition-colors resize-none leading-relaxed"
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
                {mktCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm opacity-60" style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}>
                      Marketing & advertising
                    </span>
                    <span className="text-sm" style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}>
                      {fmt(mktCost)}
                    </span>
                  </div>
                )}
                {lodgCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm opacity-60" style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}>
                      Lodging
                    </span>
                    <span className="text-sm" style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}>
                      {fmt(lodgCost)}
                    </span>
                  </div>
                )}
                {mlCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm opacity-60" style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}>
                      Meals & per diem
                    </span>
                    <span className="text-sm" style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}>
                      {fmt(mlCost)}
                    </span>
                  </div>
                )}
                {additionalPersonnel.filter(p => p.cost > 0).map((p, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-sm opacity-60" style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}>
                      {p.role || p.name || "Additional personnel"}
                    </span>
                    <span className="text-sm" style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}>
                      {fmt(p.cost)}
                    </span>
                  </div>
                ))}
                {addons.filter(a => a.label || a.price).map((addon, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-sm opacity-60" style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}>
                      {addon.label || "Add-on"}
                    </span>
                    <span className="text-sm" style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}>
                      {fmt(addon.price)}
                    </span>
                  </div>
                ))}
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

          {isPro && (
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-xs uppercase tracking-wider opacity-50" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                Custom link  <span className="normal-case opacity-60">thebecomingcreative.com/q/</span>
              </label>
              <input
                type="text"
                value={shareSlug}
                placeholder="e.g. pax-west-2026"
                onChange={(e) => setShareSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                className="px-3 py-2 text-sm bg-white border outline-none"
                style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
              />
            </div>
          )}

          <div className="flex gap-3">
            {isPro ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !(clientName.trim() || (isEventSession && (clientBusiness.trim() || pointOfContact.trim()))) || !codb}
                  className="px-8 py-3 text-sm uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-40"
                  style={{ backgroundColor: "var(--clay)", color: "var(--cream)", fontFamily: "var(--font-body)", letterSpacing: "0.15em" }}
                >
                  {saving ? "Saving…" : editingQuoteId ? "Update quote" : "Save quote"}
                </button>
                {saveError && (
                  <p className="text-xs" style={{ color: "var(--destructive)", fontFamily: "var(--font-body)" }}>
                    Error: {saveError}
                  </p>
                )}
                {!(clientName.trim() || (isEventSession && (clientBusiness.trim() || pointOfContact.trim()))) && (
                  <p className="text-xs opacity-50" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                    {isEventSession ? "Business name or point of contact is required to save." : "Client name is required to save."}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p
                  className="text-xs opacity-50"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                >
                  Saving quotes requires{" "}
                  <a
                    href="/pricing/upgrade"
                    className="underline opacity-100 hover:opacity-70 transition-opacity"
                    style={{ color: "var(--clay)" }}
                  >
                    Pro
                  </a>
                  . You can use the summary above for reference.
                </p>
              </div>
            )}
            <button
              onClick={() => {
                setClientName(""); setClientEmail(""); setSessionDate("");
                setClientBusiness(""); setEventName(""); setPointOfContact("");
                setMarketingCost(0); setLodgingCost(0); setMealCost(0); setAdditionalPersonnel([]); setCoverageItems([]); setGalleryTurnaround(""); setQuoteEventDays(1); setEventEndDate(""); setSelectedSessionId(""); setTaxRate(0);
                setDiscountType("none"); setDiscountValue(0); setNotes(""); setPaymentTerms("");
                setCustomTravel(0); setCustomTravelRate(0.67); setCustomMargin(30);
                setAddons([]);
              }}
              className="px-6 py-3 text-sm uppercase tracking-wider opacity-40 hover:opacity-70 transition-opacity"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              Clear
            </button>
            <button
              onClick={resetForm}
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
