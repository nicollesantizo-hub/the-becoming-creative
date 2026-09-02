"use client";

import { VARIABLE_DEFS } from "@/lib/contract-clauses";

interface Props {
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
}

export function VariableFields({ values, onChange }: Props) {
  const groups = Array.from(new Set(VARIABLE_DEFS.map((v) => v.group)));

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-body)",
    color: "var(--charcoal)",
    fontSize: "10px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.12em",
    opacity: 0.4,
  };

  const inputStyle = {
    fontFamily: "var(--font-body)",
    color: "var(--charcoal)",
    backgroundColor: "white",
    borderColor: "var(--border)",
  };

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group} className="flex flex-col gap-2">
          <p
            className="text-xs uppercase tracking-widest opacity-30"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            {group}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {VARIABLE_DEFS.filter((v) => v.group === group).map((v) => (
              <div key={v.id} className="flex flex-col gap-1">
                <label style={labelStyle}>{v.label}</label>
                <input
                  type="text"
                  value={values[v.id] ?? v.defaultValue}
                  onChange={(e) => onChange(v.id, e.target.value)}
                  className="px-3 py-2 text-sm border outline-none"
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
