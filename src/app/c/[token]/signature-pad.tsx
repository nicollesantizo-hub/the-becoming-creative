"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function SignaturePad({ token }: { token: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const hasDrawn = useRef(false);
  const router = useRouter();

  const [typedName, setTypedName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function startDraw(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111111";
    ctx.lineTo(x, y);
    ctx.stroke();
    hasDrawn.current = true;
  }

  function endDraw() {
    drawing.current = false;
  }

  function clearPad() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn.current = false;
  }

  async function handleSubmit() {
    setError("");
    if (!typedName.trim()) { setError("Type your full name."); return; }
    if (!agreed) { setError("Please confirm you agree to the terms above."); return; }
    if (!hasDrawn.current) { setError("Please draw your signature in the box."); return; }
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSubmitting(true);
    try {
      const signatureImage = canvas.toDataURL("image/png");
      const res = await fetch("/api/contracts/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, signatureImage, typedName }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to submit signature.");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit signature.");
      setSubmitting(false);
    }
  }

  return (
    <div className="section">
      <p className="section-label">Sign to accept</p>

      <div className="flex flex-col gap-3">
        <div>
          <label className="field-label">Type your full name</label>
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder="Full name"
            className="sig-input"
          />
        </div>

        <div>
          <label className="field-label">Draw your signature</label>
          <canvas
            ref={canvasRef}
            width={600}
            height={180}
            className="sig-canvas"
            onPointerDown={startDraw}
            onPointerMove={draw}
            onPointerUp={endDraw}
            onPointerLeave={endDraw}
          />
          <button type="button" onClick={clearPad} className="sig-clear">
            Clear
          </button>
        </div>

        <label className="sig-agree">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>I have read and agree to the terms above.</span>
        </label>

        {error && <p className="sig-error">{error}</p>}

        <button type="button" onClick={handleSubmit} disabled={submitting} className="sig-submit">
          {submitting ? "Submitting…" : "Sign contract"}
        </button>
      </div>

      <style>{`
        .field-label {
          display: block;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(17,17,17,0.4);
          margin-bottom: 6px;
        }
        .sig-input {
          width: 100%;
          max-width: 360px;
          padding: 10px 14px;
          font-size: 14px;
          border: 1px solid rgba(17,17,17,0.15);
          outline: none;
          font-family: 'DM Sans', sans-serif;
        }
        .sig-canvas {
          width: 100%;
          max-width: 600px;
          height: 180px;
          border: 1px solid rgba(17,17,17,0.15);
          background: #fafafa;
          touch-action: none;
          cursor: crosshair;
          display: block;
        }
        .sig-clear {
          margin-top: 6px;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(17,17,17,0.4);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .sig-clear:hover { color: rgba(17,17,17,0.7); }
        .sig-agree {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(17,17,17,0.65);
          cursor: pointer;
        }
        .sig-error {
          font-size: 13px;
          color: #b3261e;
        }
        .sig-submit {
          align-self: flex-start;
          font-size: 12px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          background-color: #111111;
          color: #fff;
          border: none;
          padding: 12px 32px;
          cursor: pointer;
          opacity: 1;
        }
        .sig-submit:disabled { opacity: 0.5; cursor: default; }
      `}</style>
    </div>
  );
}
