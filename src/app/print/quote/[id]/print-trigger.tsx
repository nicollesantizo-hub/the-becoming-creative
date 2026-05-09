"use client";

import { useEffect } from "react";

export function PrintTrigger({ title }: { title: string }) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div style={{ position: "fixed", top: "16px", right: "16px", zIndex: 50 }} className="no-print">
      <button
        onClick={() => window.print()}
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "11px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          backgroundColor: "#8b6f5e",
          color: "#fff",
          border: "none",
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        Save PDF
      </button>
    </div>
  );
}
