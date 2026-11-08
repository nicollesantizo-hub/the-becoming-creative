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
          <p
            className="text-sm mt-4 opacity-40 max-w-xl"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            Starting with photographers — tools for all creatives on the way.
          </p>
        </div>
      </section>

      {/* Tools */}
      <section className="py-20 px-8" style={{ backgroundColor: "var(--sand)" }}>
        <div className="max-w-4xl mx-auto">
          <p
            className="text-xs uppercase tracking-widest opacity-30 mb-8"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            Photography
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {/* The Studio — the client workflow */}
            <div className="md:col-span-2 flex flex-col gap-8 p-8 md:p-10" style={{ backgroundColor: "var(--charcoal)" }}>
              <div className="max-w-2xl">
                <span
                  className="text-xs uppercase tracking-widest opacity-30 mb-3 block"
                  style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}
                >
                  Signed in · Free to start
                </span>
                <h2
                  className="text-3xl md:text-4xl font-light italic mb-3"
                  style={{ color: "var(--cream)", fontFamily: "var(--font-heading)" }}
                >
                  The Studio
                </h2>
                <p
                  className="text-sm leading-relaxed opacity-60"
                  style={{ color: "var(--cream)", fontFamily: "var(--font-body)", fontWeight: 300 }}
                >
                  From knowing your worth to getting paid for it. Price from your real costs, send a proposal
                  your client can say yes to, have them sign in the browser, and invoice beautifully, all with
                  your name on it.
                </p>
              </div>

              <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                {[
                  { n: "01", title: "Price", href: "/studio/calculator", body: "Price My Work: a cost of doing business calculator and session pricing from your real expenses." },
                  { n: "02", title: "Propose", href: "/studio/quotes", body: "Editorial proposals with your cover photo. Clients choose add-ons and accept online." },
                  { n: "03", title: "Contract", href: "/studio/contracts", body: "Oregon & Washington starter terms, signed right in the browser. No printing." },
                  { n: "04", title: "Invoice", href: "/studio/invoices", body: "Branded invoices with a Stripe pay button, and monthly ones that send themselves." },
                ].map((step) => (
                  <li key={step.n} className="list-none" style={{ backgroundColor: "var(--charcoal)" }}>
                    <Link href={step.href} className="group flex flex-col gap-2 p-5 h-full transition-colors hover:bg-white/5">
                      <span className="text-xs tracking-widest opacity-30" style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}>
                        {step.n}
                      </span>
                      <span className="text-xl font-light italic" style={{ color: "var(--cream)", fontFamily: "var(--font-heading)" }}>
                        {step.title} <span className="not-italic text-sm opacity-0 group-hover:opacity-60 transition-opacity">→</span>
                      </span>
                      <span className="text-xs leading-relaxed opacity-50" style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}>
                        {step.body}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/studio"
                  className="px-6 py-3 text-sm uppercase tracking-widest whitespace-nowrap transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: "var(--clay)",
                    color: "var(--cream)",
                    fontFamily: "var(--font-body)",
                    letterSpacing: "0.15em",
                  }}
                >
                  Open the studio →
                </Link>
                <span className="text-xs opacity-40" style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}>
                  Free to start · <Link href="/studio/upgrade" className="underline hover:opacity-80">Pro</Link> for unlimited, your logo, and the automation
                </span>
              </div>
            </div>

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
                  className="px-6 py-3 text-sm uppercase tracking-widest whitespace-nowrap transition-opacity hover:opacity-80"
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

            {/* Photographer Planner */}
            <div
              className="flex flex-col gap-6 p-8 border"
              style={{ borderColor: "var(--border)", backgroundColor: "white" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <span
                    className="text-xs uppercase tracking-widest opacity-30 mb-3 block"
                    style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                  >
                    Photography Tool
                  </span>
                  <h2
                    className="text-3xl font-light italic mb-3"
                    style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
                  >
                    Photographer Planner
                  </h2>
                  <p
                    className="text-sm leading-relaxed opacity-50 max-w-lg"
                    style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
                  >
                    Plan your shoots, track your pipeline, keep editing deadlines, and schedule content, your whole photography week in one place.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  "Shoot day planner with shot lists & timelines",
                  "Booking & revenue pipeline tracker",
                  "Editing & delivery workflow with status tracking",
                  "Content & marketing calendar",
                  "PDF export of your full planner",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm opacity-50 list-none"
                    style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                  >
                    <span style={{ color: "var(--clay)" }}>—</span>
                    {feature}
                  </li>
                ))}
              </div>

              <div className="flex items-center gap-4 mt-auto">
                <Link
                  href="/studio/planner"
                  className="px-6 py-3 text-sm uppercase tracking-widest whitespace-nowrap transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: "var(--charcoal)",
                    color: "var(--cream)",
                    fontFamily: "var(--font-body)",
                    letterSpacing: "0.15em",
                  }}
                >
                  Open Planner →
                </Link>
                <span
                  className="text-xs opacity-30"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
                >
                  Free to start · Pro for all sections
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
                  Client guides, tax estimators, and tools for every kind of creative.
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
