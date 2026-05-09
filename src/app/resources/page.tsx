import Link from "next/link";
import { Logo } from "@/components/logo";
import { InstallBanner } from "@/components/install-banner";

export const metadata = {
  title: "Resources — The Becoming Creative",
  description: "Tools, guides, and calculators built for working creatives.",
};

export default function ResourcesPage() {
  return (
    <main className="flex flex-col min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6">
        <Link href="/">
          <Logo className="text-[var(--charcoal)]" />
        </Link>
        <Link
          href="/"
          className="text-sm uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
          style={{ fontFamily: "var(--font-body)", color: "var(--charcoal)", letterSpacing: "0.15em" }}
        >
          ← Home
        </Link>
      </nav>

      {/* Header */}
      <section className="pt-40 pb-20 px-8" style={{ backgroundColor: "var(--cream)" }}>
        <div className="max-w-4xl mx-auto">
          <p
            className="text-sm uppercase tracking-widest opacity-40 mb-6"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            Resources
          </p>
          <h1
            className="text-5xl md:text-7xl font-light italic leading-tight mb-6"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
          >
            Tools for
            <br />
            <span className="not-italic font-normal">working creatives.</span>
          </h1>
          <p
            className="text-base md:text-lg leading-relaxed opacity-60 max-w-xl"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            Practical tools built for the business side of being an artist. Know your
            worth, price your work, grow with intention.
          </p>
        </div>
      </section>

      {/* Tools */}
      <section className="py-20 px-8" style={{ backgroundColor: "var(--sand)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Gallery Delivery Estimator */}
            <div
              className="flex flex-col gap-6 p-8 border"
              style={{ borderColor: "var(--border)", backgroundColor: "white" }}
            >
              <div>
                <span
                  className="text-xs uppercase tracking-widest opacity-30 mb-3 block"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                >
                  Free Tool
                </span>
                <h2
                  className="text-3xl font-light italic mb-3"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
                >
                  Gallery Delivery
                </h2>
                <p
                  className="text-sm leading-relaxed opacity-50"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
                >
                  Find out when you can realistically deliver a gallery
                  based on your editing pace and schedule — and stop
                  overpromising clients.
                </p>
              </div>

              <ul className="flex flex-col gap-2">
                {[
                  "Editing pace presets or custom speed",
                  "Skips weekends automatically",
                  "Recommended promise date with buffer",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm opacity-50"
                    style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                  >
                    <span style={{ color: "var(--clay)" }}>—</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-4 mt-auto">
                <Link
                  href="/resources/delivery"
                  className="px-6 py-3 text-sm uppercase tracking-widest transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: "var(--charcoal)",
                    color: "var(--cream)",
                    fontFamily: "var(--font-body)",
                    letterSpacing: "0.15em",
                  }}
                >
                  Open tool →
                </Link>
                <span
                  className="text-xs opacity-30"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                >
                  No login needed
                </span>
              </div>
            </div>

            {/* Price My Work — the main tool */}
            <div
              className="flex flex-col gap-6 p-8"
              style={{ backgroundColor: "var(--charcoal)" }}
            >
              <div>
                <span
                  className="text-xs uppercase tracking-widest opacity-30 mb-3 block"
                  style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}
                >
                  Photography Tool
                </span>
                <h2
                  className="text-3xl font-light italic mb-3"
                  style={{ color: "var(--cream)", fontFamily: "var(--font-heading)" }}
                >
                  Price My Work
                </h2>
                <p
                  className="text-sm leading-relaxed opacity-60"
                  style={{ color: "var(--cream)", fontFamily: "var(--font-body)", fontWeight: 300 }}
                >
                  Calculate your true cost of doing business, build session
                  pricing from your actual expenses, and generate professional
                  quotes for clients — all in one place.
                </p>
              </div>

              <ul className="flex flex-col gap-2">
                {[
                  "Cost of doing business calculator",
                  "Session type builder with live pricing",
                  "Client quote generator",
                  "Travel, tax & discount support",
                  "Saves your numbers between sessions",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm opacity-60"
                    style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}
                  >
                    <span className="opacity-60">—</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-4 mt-auto">
                <Link
                  href="/pricing"
                  className="px-6 py-3 text-sm uppercase tracking-widest transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: "var(--clay)",
                    color: "var(--cream)",
                    fontFamily: "var(--font-body)",
                    letterSpacing: "0.15em",
                  }}
                >
                  Open tool →
                </Link>
                <span
                  className="text-xs opacity-30"
                  style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}
                >
                  Free to start
                </span>
              </div>
            </div>

            {/* More coming */}
            <div
              className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-8 border"
              style={{ borderColor: "var(--border)", borderStyle: "dashed", backgroundColor: "transparent" }}
            >
              <div>
                <span
                  className="text-xs uppercase tracking-widest opacity-30 mb-2 block"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                >
                  Coming soon
                </span>
                <p
                  className="text-base font-light italic"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
                >
                  More tools on the way.
                </p>
                <p
                  className="text-sm opacity-40 mt-1"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
                >
                  Contract templates, client guides, tax estimators, and more.
                </p>
              </div>
              <Link
                href="/#join"
                className="text-xs uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity shrink-0"
                style={{ color: "var(--clay)", fontFamily: "var(--font-body)" }}
              >
                Join the waitlist →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <InstallBanner />

      {/* Footer */}
      <footer
        className="py-12 px-8 flex flex-col sm:flex-row items-center justify-between gap-6 mt-auto"
        style={{ backgroundColor: "var(--charcoal)" }}
      >
        <Logo className="text-[var(--cream)] opacity-60" />
        <p
          className="text-xs opacity-30"
          style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}
        >
          © {new Date().getFullYear()} The Becoming Creative. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
