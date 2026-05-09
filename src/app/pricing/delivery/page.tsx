import { DeliveryEstimator } from "./delivery-estimator";

export const metadata = {
  title: "Delivery Estimator — Price My Work",
};

export default function DeliveryPage() {
  return (
    <div className="px-5 md:px-10 py-10 max-w-xl">
      <p
        className="text-xs uppercase tracking-widest opacity-40 mb-4"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
      >
        Tool
      </p>
      <h1
        className="text-3xl md:text-4xl font-light italic mb-2"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
      >
        Gallery Delivery
      </h1>
      <p
        className="text-sm opacity-50 mb-10 leading-relaxed"
        style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
      >
        Find out when you can realistically deliver — and stop overpromising.
      </p>
      <DeliveryEstimator />
    </div>
  );
}
