"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

type Status = "idle" | "loading" | "success" | "duplicate" | "error";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const supabase = createClient();
    const { error } = await supabase.from("waitlist").insert({ email });

    if (error) {
      setStatus(error.code === "23505" ? "duplicate" : "error");
    } else {
      setStatus("success");
      setEmail("");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <p
          className="text-2xl italic font-light"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
        >
          You&apos;re in.
        </p>
        <p
          className="text-sm mt-2 opacity-60"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
        >
          Welcome to The Becoming Creative. We&apos;ll be in touch.
        </p>
      </div>
    );
  }

  if (status === "duplicate") {
    return (
      <div className="text-center">
        <p
          className="text-2xl italic font-light"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
        >
          You&apos;re already in.
        </p>
        <p
          className="text-sm mt-2 opacity-60"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
        >
          We already have you on the list.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "loading"}
        className="flex-1 px-5 py-4 text-sm outline-none"
        style={{
          backgroundColor: "var(--sand)",
          color: "var(--charcoal)",
          fontFamily: "var(--font-body)",
          border: "1px solid var(--border)",
        }}
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="px-8 py-4 text-sm uppercase transition-opacity hover:opacity-80 disabled:opacity-50"
        style={{
          backgroundColor: "var(--charcoal)",
          color: "var(--cream)",
          fontFamily: "var(--font-body)",
          letterSpacing: "0.18em",
        }}
      >
        {status === "loading" ? "Joining..." : "Begin"}
      </button>

      {status === "error" && (
        <p
          className="w-full text-xs text-red-500 mt-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
