"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

interface Props {
  userId: string;
  email: string;
  isPro: boolean;
  initialLogoUrl: string;
  initialValues: {
    business_name: string;
    contact_name: string;
    phone: string;
    website: string;
  };
}

export function SettingsForm({ userId, email, isPro, initialLogoUrl, initialValues }: Props) {
  const [values, setValues] = useState(initialValues);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [uploading, setUploading] = useState(false);
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

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${userId}.${ext}`;
    const { error } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("logos").getPublicUrl(path);
      setLogoUrl(data.publicUrl);
      await supabase.from("profiles").update({ logo_url: data.publicUrl }).eq("id", userId);
    }
    setUploading(false);
  }

  async function handleRemoveLogo() {
    const supabase = createClient();
    setLogoUrl("");
    await supabase.from("profiles").update({ logo_url: null }).eq("id", userId);
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
      {/* Logo — pro only */}
      {isPro && (
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest opacity-40" style={labelStyle}>
            Logo
          </label>
          {logoUrl ? (
            <div className="flex items-center gap-4">
              <img src={logoUrl} alt="Logo" className="h-14 object-contain" style={{ maxWidth: "160px" }} />
              <button
                onClick={handleRemoveLogo}
                className="text-xs uppercase tracking-widest opacity-30 hover:opacity-60 transition-opacity"
                style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
              >
                Remove
              </button>
            </div>
          ) : (
            <label
              className="flex items-center justify-center border-2 border-dashed cursor-pointer transition-colors hover:border-[var(--clay)]"
              style={{ borderColor: "var(--border)", height: "90px" }}
            >
              <p className="text-sm opacity-40" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
                {uploading ? "Uploading…" : "Click to upload logo"}
              </p>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
          )}
          <p className="text-xs opacity-30" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
            Appears on your PDF quotes. PNG with transparent background works best.
          </p>
        </div>
      )}

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
          <p className="text-xs opacity-50" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
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
