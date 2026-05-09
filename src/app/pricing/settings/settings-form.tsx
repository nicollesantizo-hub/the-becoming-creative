"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

interface Props {
  userId: string;
  email: string;
  initialValues: {
    business_name: string;
    contact_name: string;
    phone: string;
    website: string;
  };
}

export function SettingsForm({ userId, email, initialValues }: Props) {
  const [values, setValues] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function set(key: keyof typeof values, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update(values).eq("id", userId);
    setSaving(false);
    setSaved(true);
  }

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-widest opacity-40" style={labelStyle}>
          Business name
        </label>
        <input
          type="text"
          value={values.business_name}
          onChange={(e) => set("business_name", e.target.value)}
          placeholder="e.g. Aida Visuals"
          className="px-4 py-3 border outline-none text-sm"
          style={inputStyle}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-widest opacity-40" style={labelStyle}>
          Your name
        </label>
        <input
          type="text"
          value={values.contact_name}
          onChange={(e) => set("contact_name", e.target.value)}
          placeholder="e.g. Aida Santizo"
          className="px-4 py-3 border outline-none text-sm"
          style={inputStyle}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-widest opacity-40" style={labelStyle}>
          Email
        </label>
        <input
          type="text"
          value={email}
          disabled
          className="px-4 py-3 border outline-none text-sm opacity-40 cursor-not-allowed"
          style={inputStyle}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-widest opacity-40" style={labelStyle}>
          Phone
        </label>
        <input
          type="text"
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="e.g. (555) 000-0000"
          className="px-4 py-3 border outline-none text-sm"
          style={inputStyle}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-widest opacity-40" style={labelStyle}>
          Website
        </label>
        <input
          type="text"
          value={values.website}
          onChange={(e) => set("website", e.target.value)}
          placeholder="e.g. yoursite.com"
          className="px-4 py-3 border outline-none text-sm"
          style={inputStyle}
        />
      </div>

      <div className="flex items-center gap-4 mt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 text-sm uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{
            backgroundColor: "var(--clay)",
            color: "var(--cream)",
            fontFamily: "var(--font-body)",
            letterSpacing: "0.15em",
          }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {saved && (
          <p
            className="text-xs opacity-50"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            Saved.
          </p>
        )}
      </div>

      <div className="pt-8 mt-4 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={signOut}
          className="text-xs uppercase tracking-wider opacity-30 hover:opacity-60 transition-opacity"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
        >
          Sign out
        </button>
        {email === "aida@aidavisuals.com" && (
          <a
            href="/admin"
            className="text-xs uppercase tracking-wider opacity-30 hover:opacity-60 transition-opacity"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            Admin →
          </a>
        )}
      </div>
    </div>
  );
}
