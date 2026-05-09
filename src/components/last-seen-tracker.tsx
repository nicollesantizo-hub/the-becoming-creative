"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase";

export function LastSeenTracker() {
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", user.id);
    });
  }, []);

  return null;
}
