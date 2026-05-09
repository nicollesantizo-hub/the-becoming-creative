"use client";

import { useState } from "react";

export function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleShare}
      className="text-xs uppercase tracking-widest opacity-40 hover:opacity-70 transition-opacity"
      style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
    >
      {copied ? "Copied!" : "Share this post ↗"}
    </button>
  );
}
