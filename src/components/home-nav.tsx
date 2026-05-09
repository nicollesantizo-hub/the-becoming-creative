"use client";

import { useState } from "react";
import { Logo } from "@/components/logo";

export function HomeNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-8 py-5 md:py-6">
        <Logo className="text-[var(--cream)]" />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="/resources"
            className="text-sm uppercase px-5 py-2 transition-opacity hover:opacity-70"
            style={{ fontFamily: "var(--font-body)", letterSpacing: "0.15em", color: "var(--cream)", opacity: 0.7 }}
          >
            Resources
          </a>
          <a
            href="#join"
            className="nav-join-btn text-sm uppercase px-5 py-2"
            style={{ fontFamily: "var(--font-body)", letterSpacing: "0.15em" }}
          >
            Join
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span
            className="block w-6 h-px transition-all duration-300"
            style={{
              backgroundColor: "var(--cream)",
              transform: open ? "translateY(5px) rotate(45deg)" : "none",
            }}
          />
          <span
            className="block w-6 h-px transition-all duration-300"
            style={{
              backgroundColor: "var(--cream)",
              opacity: open ? 0 : 1,
            }}
          />
          <span
            className="block w-6 h-px transition-all duration-300"
            style={{
              backgroundColor: "var(--cream)",
              transform: open ? "translateY(-5px) rotate(-45deg)" : "none",
            }}
          />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 flex flex-col items-center justify-center gap-10"
          style={{ backgroundColor: "rgba(42,33,24,0.97)" }}
          onClick={() => setOpen(false)}
        >
          <a
            href="/resources"
            className="text-2xl uppercase tracking-widest"
            style={{ color: "var(--cream)", fontFamily: "var(--font-body)", opacity: 0.8 }}
          >
            Resources
          </a>
          <a
            href="#join"
            className="text-2xl uppercase tracking-widest"
            style={{ color: "var(--clay)", fontFamily: "var(--font-body)" }}
          >
            Join
          </a>
        </div>
      )}
    </>
  );
}
