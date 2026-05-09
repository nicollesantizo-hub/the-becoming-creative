import Link from "next/link";
import { Logo } from "@/components/logo";
import { DeliveryEstimator } from "./delivery-estimator";

export const metadata = {
  title: "Gallery Delivery Estimator — The Becoming Creative",
  description: "Find out when you can realistically deliver a gallery — and stop overpromising clients.",
};

export default function DeliveryPage() {
  return (
    <main className="flex flex-col min-h-screen" style={{ backgroundColor: "var(--cream)" }}>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6">
        <Link href="/">
          <Logo className="text-[var(--charcoal)]" />
        </Link>
        <Link
          href="/resources"
          className="text-sm uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
          style={{ fontFamily: "var(--font-body)", color: "var(--charcoal)", letterSpacing: "0.15em" }}
        >
          ← Resources
        </Link>
      </nav>

      <div className="pt-36 pb-20 px-8 max-w-2xl mx-auto w-full">
        <p
          className="text-xs uppercase tracking-widest opacity-40 mb-4"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
        >
          Free Tool
        </p>
        <h1
          className="text-4xl md:text-5xl font-light italic mb-3 leading-tight"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
        >
          Gallery Delivery
        </h1>
        <p
          className="text-base opacity-50 mb-12 leading-relaxed"
          style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
        >
          Find out when you can realistically deliver — and stop overpromising.
        </p>
        <DeliveryEstimator />
      </div>

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
