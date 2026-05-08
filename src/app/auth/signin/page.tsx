"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Logo } from "@/components/logo";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/pricing");
    router.refresh();
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
              Welcome back.
            </h1>
            <p
              className="text-sm mt-2 opacity-60"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
            >
              Sign in to The Becoming Creative
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
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            <p
              className="text-sm"
              style={{ color: "var(--destructive)", fontFamily: "var(--font-body)" }}
            >
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
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p
          className="text-center text-sm opacity-60"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="underline"
            style={{ color: "var(--clay)", opacity: 1 }}
          >
            Create one free
          </Link>
        </p>
      </div>
    </main>
  );
}
