"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Logo } from "@/components/logo";
import type { UserProfile } from "@/types/pricing";

const navItems = [
  { href: "/pricing/calculator", label: "Calculator" },
  { href: "/pricing/sessions", label: "Sessions" },
  { href: "/pricing/quotes", label: "Quotes" },
];

export function PricingNav({ profile }: { profile: UserProfile | null }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* Sidebar — desktop */}
      <aside
        className="hidden md:flex fixed top-0 left-0 bottom-0 w-52 flex-col py-8 px-5 gap-8 z-40"
        style={{ backgroundColor: "var(--charcoal)" }}
      >
        <Link href="/">
          <Logo className="text-[var(--cream)] opacity-70 hover:opacity-100 transition-opacity" />
        </Link>

        <div className="flex flex-col gap-1 flex-1">
          <p
            className="text-xs uppercase tracking-widest opacity-30 mb-3 px-3"
            style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}
          >
            Tools
          </p>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm rounded-sm transition-colors"
                style={{
                  fontFamily: "var(--font-body)",
                  color: active ? "var(--cream)" : "rgba(247,243,237,0.45)",
                  backgroundColor: active ? "rgba(247,243,237,0.1)" : "transparent",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          {profile?.tier === "pro" ? (
            <div
              className="flex items-center gap-2 px-3 py-2"
              style={{ backgroundColor: "rgba(247,243,237,0.08)" }}
            >
              <span
                className="text-xs px-2 py-0.5 uppercase tracking-widest"
                style={{
                  backgroundColor: "var(--clay)",
                  color: "var(--cream)",
                  fontFamily: "var(--font-body)",
                  letterSpacing: "0.15em",
                }}
              >
                Pro
              </span>
              <p
                className="text-xs opacity-40"
                style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}
              >
                Full access
              </p>
            </div>
          ) : (
            <div
              className="p-3 rounded-sm"
              style={{ backgroundColor: "rgba(247,243,237,0.06)" }}
            >
              <p
                className="text-xs opacity-40 mb-2"
                style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}
              >
                Free plan
              </p>
              <p
                className="text-xs leading-relaxed opacity-60"
                style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}
              >
                Upgrade for unlimited sessions, quote history &amp; exports.
              </p>
              <p
                className="text-xs mt-2"
                style={{ color: "var(--clay)", fontFamily: "var(--font-body)" }}
              >
                Coming soon
              </p>
            </div>
          )}
          <button
            onClick={signOut}
            className="text-xs uppercase tracking-wider text-left opacity-30 hover:opacity-60 transition-opacity"
            style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Bottom nav — mobile */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around py-4 px-4 z-40"
        style={{ backgroundColor: "var(--charcoal)" }}
      >
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center"
              style={{
                fontFamily: "var(--font-body)",
                color: active ? "var(--cream)" : "rgba(247,243,237,0.4)",
              }}
            >
              <span className="text-xs uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
