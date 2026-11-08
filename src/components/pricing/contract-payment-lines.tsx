import { fmt } from "@/lib/pricing";
import { contractPayments, formatContractDate, type ContractPaymentInput } from "@/lib/contract-payments";

// The money lines under "Investment" on the client signing page and the PDF.
// Both pages style .line / .line-label / .line-value the same way.
export function ContractPaymentLines({ c, packageName }: { c: ContractPaymentInput; packageName?: string | null }) {
  const p = contractPayments(c);
  return (
    <>
      <div className="line">
        <span className="line-label">{packageName || "Photography session"}</span>
        <span className="line-value">{fmt(p.price)}</span>
      </div>
      {p.paid > 0 && (
        <div className="line">
          <span className="line-label">Already received, thank you</span>
          <span className="line-value">−{fmt(p.paid)}</span>
        </div>
      )}
      {p.dueAtSigning > 0 && (
        <div className="line">
          <span className="line-label">{p.paid > 0 ? "Remaining retainer due at signing" : "Retainer due at signing"}</span>
          <span className="line-value">{fmt(p.dueAtSigning)}</span>
        </div>
      )}
      {p.balance > 0 && (
        <div className="line">
          <span className="line-label">
            Balance due{p.dueDate ? ` by ${formatContractDate(p.dueDate)}` : " before your session"}
          </span>
          <span className="line-value">{fmt(p.balance)}</span>
        </div>
      )}
    </>
  );
}
