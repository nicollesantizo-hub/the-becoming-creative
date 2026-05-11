"use client";

import Script from "next/script";

export function Analytics() {
  if (typeof window !== "undefined" && localStorage.getItem("tbc_no_track") === "1") {
    return null;
  }
  return <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />;
}
