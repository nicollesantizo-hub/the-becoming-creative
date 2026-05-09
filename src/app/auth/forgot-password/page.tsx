"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Logo } from "@/components/logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
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
              Check your email.
            </h1>
            <p
              className="text-sm leading-relaxed opacity-60"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              We sent a reset link to{" "}
              <span className="opacity-100" style={{ color: "var(--charcoal)" }}>
                {email}
              </span>
              . Click it to set a new password.
            </p>
          </div>
          <Link
            href="/auth/signin"
            className="text-sm uppercase tracking-wider"
            style={{ color: "var(--clay)", fontFamily: "var(--font-body)" }}
          >
            Back to sign in →
          </Link>
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
              Reset password.
            </h1>
            <p
              className="text-sm mt-2 opacity-60"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              Enter your email and we&apos;ll send a reset link.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 text-sm bg-white border outline-none transition-colors"
            style={{
              borderColor: "var(--border)",
              fontFamily: "var(--font-body)",
              color: "var(--charcoal)",
            }}
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
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p className="text-center text-sm opacity-60" style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}>
          <Link href="/auth/signin" className="underline" style={{ color: "var(--clay)", opacity: 1 }}>
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
