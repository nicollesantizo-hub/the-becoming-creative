"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { calculateCODB as calculate, fmt } from "@/lib/pricing";
import type { CODBConfig, CODBResults } from "@/types/pricing";

type Frequency = "monthly" | "annual";

const DEFAULTS: CODBConfig = {
  equipment: 0,
  insurance: 0,
  software: 0,
  storage: 0,
  website: 0,
  marketing: 0,
  education: 0,
  studio: 0,
  other: 0,
  desired_income: 0,
  tax_rate: 25,
  hours_per_week: 20,
  weeks_per_year: 48,
  shoots_per_year: 50,
};


const expenseFields: { key: keyof CODBConfig; label: string; hint: string }[] = [
  { key: "equipment", label: "Equipment & Gear", hint: "Cameras, lenses, lighting, accessories" },
  { key: "insurance", label: "Camera Insurance", hint: "Gear coverage, liability insurance" },
  { key: "software", label: "Editing Software", hint: "Lightroom, Capture One, Photoshop, etc." },
  { key: "storage", label: "Cloud Storage & Backup", hint: "Google Drive, Backblaze, hard drives" },
  { key: "website", label: "Website & Portfolio", hint: "Hosting, domain, gallery platform" },
  { key: "marketing", label: "Marketing & Ads", hint: "Social ads, print materials, promotions" },
  { key: "education", label: "Education & Workshops", hint: "Courses, workshops, presets" },
  { key: "studio", label: "Studio & Props", hint: "Studio rental, backdrops, props" },
  { key: "other", label: "Other Expenses", hint: "Anything else that costs you money" },
];

function NumberInput({
  label,
  hint,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-sm" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
          {label}
        </span>
        {hint && (
          <span className="text-xs opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
            {hint}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {prefix && (
          <span className="text-sm opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
            {prefix}
          </span>
        )}
        <input
          type="number"
          min={0}
          step={step}
          value={value || ""}
          placeholder="0"
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-24 px-2 py-1.5 text-sm text-right bg-white border outline-none transition-colors"
          style={{
            borderColor: "var(--border)",
            fontFamily: "var(--font-body)",
            color: "var(--charcoal)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
        {suffix && (
          <span className="text-sm opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export function CODBCalculator({
  initialConfig,
  userId,
}: {
  initialConfig: CODBConfig | null;
  userId: string;
}) {
  const [config, setConfig] = useState<CODBConfig>(initialConfig ?? DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [frequencies, setFrequencies] = useState<Record<string, Frequency>>(
    Object.fromEntries(expenseFields.map((f) => [f.key, "annual" as Frequency]))
  );

  const results = calculate(config);

  function update(key: keyof CODBConfig, value: number) {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function toggleFrequency(key: string) {
    setFrequencies((prev) => ({
      ...prev,
      [key]: prev[key] === "annual" ? "monthly" : "annual",
    }));
  }

  function getDisplayValue(key: keyof CODBConfig): number {
    const annual = config[key] as number;
    return frequencies[key] === "monthly" ? Math.round((annual / 12) * 100) / 100 : annual;
  }

  function handleExpenseChange(key: keyof CODBConfig, displayValue: number) {
    const annual = frequencies[key] === "monthly" ? displayValue * 12 : displayValue;
    update(key, annual);
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("codb_config").upsert(
      { ...config, user_id: userId, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
    setSaving(false);
    if (!error) setSaved(true);
  }

  return (
    <div className="max-w-2xl">
      {/* Annual Expenses */}
      <section className="mb-12">
        <h2
          className="text-2xl font-light italic mb-1"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
        >
          Business Expenses
        </h2>
        <p
          className="text-sm opacity-50 mb-6"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
        >
          Enter what you spend to run your business. Toggle each line between monthly and annual.
        </p>

        <div>
          {expenseFields.map(({ key, label, hint }) => {
            const freq = frequencies[key] ?? "annual";
            return (
              <div
                key={key}
                className="flex items-center justify-between gap-3 py-3"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="text-sm" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                    {label}
                  </span>
                  {hint && (
                    <span className="text-xs opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                      {hint}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleFrequency(key)}
                    className="text-xs px-2 py-1 border transition-colors"
                    style={{
                      fontFamily: "var(--font-body)",
                      borderColor: freq === "monthly" ? "var(--clay)" : "var(--border)",
                      color: freq === "monthly" ? "var(--clay)" : "rgba(42,33,24,0.35)",
                      backgroundColor: "white",
                    }}
                  >
                    {freq === "monthly" ? "Mo" : "Yr"}
                  </button>
                  <span className="text-sm opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>$</span>
                  <input
                    type="number"
                    min={0}
                    value={getDisplayValue(key) || ""}
                    placeholder="0"
                    onChange={(e) => handleExpenseChange(key, parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1.5 text-sm text-right bg-white border outline-none transition-colors"
                    style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="flex items-center justify-between py-3 mt-1"
          style={{ borderTop: "1px solid var(--charcoal)", opacity: 0.15 }}
        />
        <div className="flex items-center justify-between -mt-4">
          <span
            className="text-sm font-medium"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            Total Annual Expenses
          </span>
          <span
            className="text-base font-medium"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            {fmt(results.totalExpenses)}
          </span>
        </div>
      </section>

      {/* Time & Goals */}
      <section className="mb-12">
        <h2
          className="text-2xl font-light italic mb-1"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
        >
          Your Time &amp; Goals
        </h2>
        <p
          className="text-sm opacity-50 mb-6"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
        >
          How much you work and what you want to take home.
        </p>

        <div>
          <NumberInput
            label="Hours per week on business"
            hint="Shooting, editing, admin, marketing — all of it"
            value={config.hours_per_week}
            onChange={(v) => update("hours_per_week", v)}
            suffix="hrs"
          />
          <NumberInput
            label="Weeks working per year"
            hint="Subtract vacation, holidays, off-season"
            value={config.weeks_per_year}
            onChange={(v) => update("weeks_per_year", v)}
            suffix="wks"
          />
          <NumberInput
            label="Sessions per year"
            hint="How many paid shoots you do (or want to do)"
            value={config.shoots_per_year}
            onChange={(v) => update("shoots_per_year", v)}
            suffix="sessions"
          />
          <NumberInput
            label="Desired take-home income"
            hint="What you want to pay yourself after taxes"
            value={config.desired_income}
            onChange={(v) => update("desired_income", v)}
            prefix="$"
          />
          <NumberInput
            label="Tax rate to set aside"
            hint="Self-employment + income tax (typically 25–30%)"
            value={config.tax_rate}
            onChange={(v) => update("tax_rate", v)}
            suffix="%"
            step={0.5}
          />
        </div>
      </section>

      {/* Results */}
      <section className="mb-10">
        <h2
          className="text-2xl font-light italic mb-6"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
        >
          Your Numbers
        </h2>

        <div
          className="p-6 mb-4"
          style={{ backgroundColor: "var(--sand)" }}
        >
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span
                className="text-sm opacity-60"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
              >
                Total business expenses
              </span>
              <span
                className="text-sm"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                {fmt(results.totalExpenses)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span
                className="text-sm opacity-60"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
              >
                Gross income needed (pre-tax)
              </span>
              <span
                className="text-sm"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                {fmt(results.grossIncomeNeeded)}
              </span>
            </div>
            <div
              className="flex justify-between items-center pt-3"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Total revenue needed
              </span>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                {fmt(results.totalRevenueNeeded)}
              </span>
            </div>
          </div>
        </div>

        <div
          className="p-6"
          style={{ backgroundColor: "var(--charcoal)" }}
        >
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <p
                  className="text-base font-medium"
                  style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}
                >
                  Minimum per session
                </p>
                <p
                  className="text-xs opacity-40 mt-0.5"
                  style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}
                >
                  to cover all costs + pay yourself
                </p>
              </div>
              <span
                className="text-3xl font-light italic"
                style={{ color: "var(--cream)", fontFamily: "var(--font-heading)" }}
              >
                {fmt(results.minimumPerSession)}
              </span>
            </div>
            <div
              className="flex justify-between items-center pt-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}
            >
              <p
                className="text-sm opacity-60"
                style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}
              >
                Your hourly rate
              </p>
              <span
                className="text-lg font-light"
                style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}
              >
                {fmt(results.hourlyRate)}/hr
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="flex gap-3 items-center">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 text-sm uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{
            backgroundColor: "var(--clay)",
            color: "var(--cream)",
            fontFamily: "var(--font-body)",
            letterSpacing: "0.15em",
          }}
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save your numbers"}
        </button>
        <button
          onClick={() => { setConfig(DEFAULTS); setSaved(false); }}
          className="px-6 py-3 text-sm uppercase tracking-wider opacity-40 hover:opacity-70 transition-opacity"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
        >
          Clear
        </button>
      </div>

      {saved && (
        <p
          className="text-xs opacity-50 mt-3"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
        >
          Your numbers are saved and will be used to calculate session prices.
        </p>
      )}
    </div>
  );
}
