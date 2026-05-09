"use client";

import { useState, useMemo } from "react";

const PACE_PRESETS = [
  { label: "Light edit", value: 40, description: "Culling + basic adjustments" },
  { label: "Standard", value: 20, description: "Color grade + selective retouching" },
  { label: "Heavy retouch", value: 8, description: "Full retouch on most images" },
];

function addWorkingDays(start: Date, hours: number, hoursPerDay: number): Date {
  const totalDays = Math.ceil(hours / hoursPerDay);
  const result = new Date(start);
  let added = 0;
  while (added < totalDays) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return result;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function DeliveryEstimator() {
  const today = new Date().toISOString().split("T")[0];

  const [shootDate, setShootDate] = useState(today);
  const [photoCount, setPhotoCount] = useState(400);
  const [customPace, setCustomPace] = useState<number | null>(null);
  const [selectedPreset, setSelectedPreset] = useState(1);
  const [hoursPerDay, setHoursPerDay] = useState(3);

  const pace = customPace ?? PACE_PRESETS[selectedPreset].value;
  const totalHours = photoCount / pace;
  const totalDays = Math.ceil(totalHours / hoursPerDay);

  const result = useMemo(() => {
    const start = shootDate ? new Date(shootDate + "T12:00:00") : new Date();
    const realistic = addWorkingDays(start, totalHours, hoursPerDay);
    const withBuffer = addWorkingDays(new Date(realistic), hoursPerDay * 2, hoursPerDay);
    return { realistic, withBuffer };
  }, [shootDate, totalHours, hoursPerDay]);

  const inputClass = "w-full px-4 py-3 border outline-none text-sm";
  const inputStyle = {
    fontFamily: "var(--font-body)",
    color: "var(--charcoal)",
    backgroundColor: "white",
    borderColor: "var(--border)",
  };
  const labelStyle = {
    fontFamily: "var(--font-body)",
    color: "var(--charcoal)",
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Inputs */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-widest opacity-40" style={labelStyle}>
            Shoot date
          </label>
          <input
            type="date"
            value={shootDate}
            onChange={(e) => setShootDate(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-widest opacity-40" style={labelStyle}>
            Photos to deliver
          </label>
          <input
            type="number"
            min={1}
            value={photoCount}
            onChange={(e) => setPhotoCount(Math.max(1, parseInt(e.target.value) || 1))}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest opacity-40" style={labelStyle}>
            Editing pace
          </label>
          <div className="flex flex-col gap-2">
            {PACE_PRESETS.map((preset, i) => (
              <button
                key={i}
                onClick={() => { setSelectedPreset(i); setCustomPace(null); }}
                className="flex items-center justify-between px-4 py-3 border text-left transition-colors"
                style={{
                  fontFamily: "var(--font-body)",
                  borderColor: selectedPreset === i && customPace === null ? "var(--clay)" : "var(--border)",
                  backgroundColor: selectedPreset === i && customPace === null ? "rgba(139,111,94,0.06)" : "white",
                }}
              >
                <div>
                  <p className="text-sm" style={{ color: "var(--charcoal)" }}>{preset.label}</p>
                  <p className="text-xs opacity-40 mt-0.5" style={{ color: "var(--charcoal)" }}>{preset.description}</p>
                </div>
                <span className="text-xs opacity-50 shrink-0 ml-4" style={{ color: "var(--charcoal)" }}>
                  {preset.value} photos/hr
                </span>
              </button>
            ))}

            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                placeholder="Custom photos/hr"
                value={customPace ?? ""}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  setCustomPace(v > 0 ? v : null);
                }}
                className="flex-1 px-4 py-3 border outline-none text-sm"
                style={{
                  ...inputStyle,
                  borderColor: customPace !== null ? "var(--clay)" : "var(--border)",
                  backgroundColor: customPace !== null ? "rgba(139,111,94,0.06)" : "white",
                }}
              />
              <span className="text-xs opacity-40 shrink-0" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                photos / hr
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-widest opacity-40" style={labelStyle}>
              Hours available per day
            </label>
            <span className="text-sm font-medium" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
              {hoursPerDay}h
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={0.5}
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
            className="w-full accent-[var(--clay)]"
          />
          <div className="flex justify-between text-xs opacity-30" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
            <span>1h</span>
            <span>10h</span>
          </div>
        </div>
      </div>

      {/* Result */}
      <div
        className="p-6 flex flex-col gap-5"
        style={{ backgroundColor: "var(--sand)", borderLeft: "3px solid var(--clay)" }}
      >
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-widest opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
            Editing time
          </p>
          <p className="text-2xl font-light italic" style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}>
            {totalHours < 1
              ? `${Math.round(totalHours * 60)} minutes`
              : `${totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1)} hours`}
            <span className="text-base opacity-40 ml-2 not-italic">
              ({totalDays} {totalDays === 1 ? "day" : "days"})
            </span>
          </p>
        </div>

        <div className="h-px" style={{ backgroundColor: "var(--border)" }} />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-widest opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
              Earliest delivery
            </p>
            <p className="text-lg font-medium" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
              {formatDate(result.realistic)}
            </p>
            <p className="text-xs opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
              Skips weekends — assumes you start editing right after the shoot.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-widest opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
              Recommended promise date
            </p>
            <p
              className="text-xl font-light italic"
              style={{ color: "var(--clay)", fontFamily: "var(--font-heading)" }}
            >
              {formatDate(result.withBuffer)}
            </p>
            <p className="text-xs opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
              Adds a 2-day buffer — tell clients this date.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
