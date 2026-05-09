"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export function OnlineCount() {
  const [count, setCount] = useState<number | null>(null);

  async function fetchCount() {
    const supabase = createClient();
    const cutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count: c } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("last_seen_at", cutoff);
    setCount(c ?? 0);
  }

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="p-5 border"
      style={{ borderColor: "var(--border)", backgroundColor: "white" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <p
          className="text-3xl font-light italic"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
        >
          {count ?? "—"}
        </p>
        {count !== null && count > 0 && (
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        )}
      </div>
      <p
        className="text-xs uppercase tracking-widest opacity-35"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
      >
        Online now
      </p>
    </div>
  );
}
