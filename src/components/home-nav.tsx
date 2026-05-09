"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase";

const ADMIN_EMAIL = "aida@aidavisuals.com";

export function HomeNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setLoggedIn(!!user);
      setIsAdmin(user?.email === ADMIN_EMAIL);
    });
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setLoggedIn(false);
    setIsAdmin(false);
    setOpen(false);
    router.refresh();
  }

  const textColor = scrolled ? "var(--ink)" : "var(--paper)";
  const joinClass = scrolled ? "nav-join-btn-dark" : "nav-join-btn";
  const linkStyle = { fontFamily: "var(--font-body)", letterSpacing: "0.15em", color: textColor, opacity: 0.65 };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-8 py-5 md:py-6 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? "var(--paper)" : "transparent",
          borderBottom: scrolled ? "1px solid var(--dust)" : "none",
        }}
      >
        <Logo style={{ color: textColor }} />

        <div className="hidden md:flex items-center gap-4">
          <a href="/field-notes" className="text-sm uppercase transition-opacity hover:opacity-60" style={linkStyle}>
            Field Notes
          </a>
          <a href="/resources" className="text-sm uppercase transition-opacity hover:opacity-60" style={linkStyle}>
            Resources
          </a>
          {loggedIn ? (
            <>
              <a href="/pricing/settings" className="text-sm uppercase transition-opacity hover:opacity-60" style={linkStyle}>
                Settings
              </a>
              {isAdmin && (
                <a href="/admin" className="text-sm uppercase transition-opacity hover:opacity-60" style={linkStyle}>
                  Admin
                </a>
              )}
              <button onClick={signOut} className="text-sm uppercase transition-opacity hover:opacity-60" style={linkStyle}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <a href="/auth/signin" className="text-sm uppercase transition-opacity hover:opacity-60" style={linkStyle}>
                Sign in
              </a>
              <a
                href="#join"
                className={`${joinClass} text-sm uppercase px-5 py-2`}
                style={{ fontFamily: "var(--font-body)", letterSpacing: "0.15em" }}
              >
                Join
              </a>
            </>
          )}
        </div>

        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className="block w-6 h-px transition-all duration-300"
            style={{ backgroundColor: textColor, transform: open ? "translateY(5px) rotate(45deg)" : "none" }} />
          <span className="block w-6 h-px transition-all duration-300"
            style={{ backgroundColor: textColor, opacity: open ? 0 : 1 }} />
          <span className="block w-6 h-px transition-all duration-300"
            style={{ backgroundColor: textColor, transform: open ? "translateY(-5px) rotate(-45deg)" : "none" }} />
        </button>
      </nav>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 flex flex-col items-center justify-center gap-10"
          style={{ backgroundColor: "var(--ink)" }}
          onClick={() => setOpen(false)}
        >
          <a href="/field-notes" className="text-2xl uppercase tracking-widest"
            style={{ color: "var(--paper)", fontFamily: "var(--font-body)", opacity: 0.75 }}>
            Field Notes
          </a>
          <a href="/resources" className="text-2xl uppercase tracking-widest"
            style={{ color: "var(--paper)", fontFamily: "var(--font-body)", opacity: 0.75 }}>
            Resources
          </a>
          {loggedIn ? (
            <>
              <a href="/pricing/settings" className="text-2xl uppercase tracking-widest"
                style={{ color: "var(--paper)", fontFamily: "var(--font-body)", opacity: 0.75 }}>
                Settings
              </a>
              {isAdmin && (
                <a href="/admin" className="text-2xl uppercase tracking-widest"
                  style={{ color: "var(--paper)", fontFamily: "var(--font-body)", opacity: 0.75 }}>
                  Admin
                </a>
              )}
              <button onClick={signOut} className="text-2xl uppercase tracking-widest"
                style={{ color: "var(--paper)", fontFamily: "var(--font-body)", opacity: 0.75 }}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <a href="/auth/signin" className="text-2xl uppercase tracking-widest"
                style={{ color: "var(--paper)", fontFamily: "var(--font-body)", opacity: 0.75 }}>
                Sign in
              </a>
              <a href="#join" className="text-2xl uppercase tracking-widest"
                style={{ color: "var(--paper)", fontFamily: "var(--font-body)" }}>
                Join
              </a>
            </>
          )}
        </div>
      )}
    </>
  );
}
