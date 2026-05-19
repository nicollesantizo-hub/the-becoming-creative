"use client";

export function SavePdfButton() {
  return (
    <div className="no-print" style={{ textAlign: "center", marginBottom: "32px" }}>
      <button
        onClick={() => window.print()}
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "11px",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          backgroundColor: "#111111",
          color: "#fff",
          border: "none",
          padding: "12px 32px",
          cursor: "pointer",
        }}
      >
        Save PDF
      </button>
    </div>
  );
}
