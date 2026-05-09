"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Logo } from "@/components/logo";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center px-8 py-16"
        style={{ backgroundColor: "var(--cream)" }}
      >
        <div className="w-full max-w-sm text-center flex flex-col gap-8 items-center">
          <Link href="/">
            <Logo className="text-[var(--charcoal)]" />
          </Link>
          <div className="flex flex-col gap-4">
            <h1
              className="text-4xl font-light italic"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
            >
              Password updated.
            </h1>
            <p
              className="text-sm leading-relaxed opacity-60"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              You&apos;re all set. Sign in with your new password.
            </p>
          </div>
          <a
            href="/auth/signin"
            className="text-sm uppercase tracking-wider"
            style={{ color: "var(--clay)", fontFamily: "var(--font-body)" }}
          >
            Sign in →
          </a>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-8 py-16"
      style={{ backgroundColor: "var(--cream)" }}
    >
      <div className="w-full max-w-sm flex flex-col gap-10">
        <div className="flex flex-col items-center gap-6">
          <Link href="/">
            <Logo className="text-[var(--charcoal)]" />
          </Link>
          <div className="text-center">
            <h1
              className="text-4xl font-light italic"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
            >
              New password.
            </h1>
            <p
              className="text-sm mt-2 opacity-60"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              Choose a new password for your account.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="New password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 text-sm bg-white border outline-none transition-colors"
            style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
            onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 text-sm bg-white border outline-none transition-colors"
            style={{ borderColor: "var(--border)", fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
            onFocus={(e) => (e.target.style.borderColor = "var(--clay)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />

          {error && (
            <p className="text-sm" style={{ color: "var(--destructive)", fontFamily: "var(--font-body)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-50 mt-2"
            style={{
              backgroundColor: "var(--clay)",
              color: "var(--cream)",
              fontFamily: "var(--font-body)",
              letterSpacing: "0.15em",
            }}
          >
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </main>
  );
}
