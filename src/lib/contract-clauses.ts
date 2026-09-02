export interface Clause {
  id: string;
  title: string;
  body: string;
  enabled: boolean;
}

export interface VariableDef {
  id: string;
  label: string;
  defaultValue: string;
  group: string;
}

export type ContractState = "OR" | "WA" | "general";

const GOVERNING_LAW: Record<ContractState, string> = {
  OR: `This Agreement is governed by the laws of the State of Oregon, without regard to its conflict-of-laws principles. Any dispute arising under this Agreement will be resolved in the state or federal courts located in {{county}}, Oregon.`,
  WA: `This Agreement is governed by the laws of the State of Washington, without regard to its conflict-of-laws principles. Any dispute arising under this Agreement will be resolved in the state or federal courts located in {{county}}, Washington.`,
  general: `This Agreement is governed by the laws of the State of [Oregon/Washington], without regard to its conflict-of-laws principles. Any dispute arising under this Agreement will be resolved in the state or federal courts located in {{county}}, [Oregon/Washington].`,
};

// Policy variables — fillable per template (as reusable defaults) and per
// contract (as an override). "Structured" values that already live as fields
// on the contract itself (price, deposit, deliverable count, delivery days)
// are NOT here — those are merged in separately at generation time so they're
// never typed twice. See contract-builder.tsx's regenerate().
export const VARIABLE_DEFS: VariableDef[] = [
  { id: "balanceDueDays", label: "Balance due (days before session)", defaultValue: "7", group: "Payment" },
  { id: "lateFeePercent", label: "Late fee (%)", defaultValue: "10", group: "Payment" },
  { id: "lateFeeFlatAmount", label: "Late fee (flat $, if greater)", defaultValue: "50", group: "Payment" },
  { id: "lateFeeGraceDays", label: "Late fee grace period (days)", defaultValue: "5", group: "Payment" },

  { id: "cancellationNoticeDays", label: "Cancellation notice (days)", defaultValue: "14", group: "Cancellation & Rescheduling" },
  { id: "rescheduleNoticeDays", label: "Reschedule notice (days)", defaultValue: "7", group: "Cancellation & Rescheduling" },
  { id: "rescheduleFee", label: "Late reschedule fee ($)", defaultValue: "75", group: "Cancellation & Rescheduling" },
  { id: "rescheduleWindowDays", label: "Reschedule window (days)", defaultValue: "90", group: "Cancellation & Rescheduling" },

  { id: "rushDeliveryDays", label: "Rush delivery (business days)", defaultValue: "3", group: "Delivery" },
  { id: "rushDeliveryFee", label: "Rush delivery fee ($)", defaultValue: "150", group: "Delivery" },
  { id: "galleryExpiryDays", label: "Gallery expiration (days)", defaultValue: "90", group: "Delivery" },

  { id: "travelRadiusMiles", label: "Included travel radius (miles)", defaultValue: "25", group: "Travel & Overtime" },
  { id: "baseLocation", label: "Base location", defaultValue: "Portland, OR", group: "Travel & Overtime" },
  { id: "travelRatePerMile", label: "Travel rate ($/mile beyond radius)", defaultValue: "0.67", group: "Travel & Overtime" },
  { id: "travelFlatFee", label: "Travel flat fee alternative ($)", defaultValue: "50", group: "Travel & Overtime" },
  { id: "overtimeRatePerHour", label: "Overtime rate ($/hour)", defaultValue: "150", group: "Travel & Overtime" },

  { id: "secondShooterNoticeDays", label: "Second photographer opt-out notice (days)", defaultValue: "7", group: "Team & Legal" },
  { id: "county", label: "County (governing law / venue)", defaultValue: "Multnomah", group: "Team & Legal" },
  { id: "negotiationPeriodDays", label: "Dispute negotiation period (days)", defaultValue: "14", group: "Team & Legal" },
];

export function defaultVariableValues(): Record<string, string> {
  return Object.fromEntries(VARIABLE_DEFS.map((v) => [v.id, v.defaultValue]));
}

export function substitute(text: string, values: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, token) => {
    const value = values[token];
    return value !== undefined && value !== "" ? value : `[${token}]`;
  });
}

// Transcribed from Documents/Aida Visuals Tools/Contracts/clause-library.md —
// that file is the source of truth for the legal content itself (including
// drafting notes on which clauses are most state-law-sensitive); this is just
// the code-usable version so a starter template can be generated with one click.
export function defaultClauses(state: ContractState): Clause[] {
  return [
    {
      id: "retainer",
      title: "RETAINER / DEPOSIT (NON-REFUNDABLE)",
      body: `A retainer of {{depositAmount}} is due at the time this Agreement is signed to reserve Client's date. This retainer is earned upon booking in exchange for Photographer turning away other inquiries for that date, and is non-refundable regardless of whether the session later proceeds, except as provided in the Cancellation section below. The retainer is credited toward the total session fee.`,
      enabled: true,
    },
    {
      id: "payment-late",
      title: "PAYMENT SCHEDULE & LATE PAYMENT",
      body: `The remaining balance of {{balanceRemaining}} is due no later than {{balanceDueDays}} days before the session date. Payments not received by the due date are considered late. A late payment fee of {{lateFeePercent}}% or \${{lateFeeFlatAmount}}, whichever is greater, may apply to balances more than {{lateFeeGraceDays}} days overdue. Photographer is not obligated to begin or continue a session, or to deliver final images, while a balance remains outstanding.`,
      enabled: true,
    },
    {
      id: "cancellation",
      title: "CANCELLATION POLICY",
      body: `If Client cancels the session for any reason, the retainer is forfeited per the Retainer section above. If cancellation occurs less than {{cancellationNoticeDays}} days before the session date, the full remaining balance is also due and non-refundable, as Photographer will likely be unable to rebook the date on short notice. If Photographer must cancel for any reason within Photographer's control, Client will receive a full refund of all amounts paid, or the option to reschedule at no additional cost.`,
      enabled: true,
    },
    {
      id: "rescheduling",
      title: "RESCHEDULING POLICY",
      body: `Client may reschedule the session date once at no additional charge, provided the request is made at least {{rescheduleNoticeDays}} days before the original session date and a new date is confirmed within {{rescheduleWindowDays}} days. Rescheduling requests made with less notice, or additional reschedule requests beyond the first, may incur a rescheduling fee of \${{rescheduleFee}}. If Client and Photographer cannot agree on a new date within {{rescheduleWindowDays}} days, the session is treated as a cancellation under the Cancellation Policy above.`,
      enabled: true,
    },
    {
      id: "weather",
      title: "WEATHER & FORCE MAJEURE",
      body: `If weather conditions materially compromise the session (e.g., unsafe conditions, heavy rain or smoke, extreme heat or cold), Photographer may propose rescheduling at no additional cost, as a mutual accommodation rather than a fault-based cancellation. Neither party is liable for failure to perform due to causes beyond reasonable control, including but not limited to natural disaster, government order, wildfire smoke, road closures, or other events of force majeure. In such cases, the parties will reschedule in good faith; if no mutually agreeable date is found within {{rescheduleWindowDays}} days, either party may treat the session as cancelled, with the retainer refunded to Client in full given neither party was at fault.`,
      enabled: true,
    },
    {
      id: "turnaround",
      title: "TURNAROUND TIME & DELIVERY",
      body: `Client will receive a minimum of {{deliverableMinPhotos}} professionally edited, high-resolution digital images via private online gallery within {{deliveryDays}} business days of the session date. Rush delivery (within {{rushDeliveryDays}} business days) is available for an additional fee of \${{rushDeliveryFee}}, subject to availability. Online galleries remain active for {{galleryExpiryDays}} days from delivery; Client is responsible for downloading and backing up images before expiration. Additional images beyond the stated minimum, if delivered, are a courtesy and not a guaranteed part of this Agreement.`,
      enabled: true,
    },
    {
      id: "usage-copyright",
      title: "IMAGE USAGE, COPYRIGHT & LICENSING",
      body: `Photographer retains copyright and all intellectual property rights to every image produced during the session, per U.S. Copyright Law (17 U.S.C. § 101 et seq.). Client is granted a non-exclusive, non-transferable license to print, share, and post the delivered images for personal, non-commercial use. Client may not sell, license, or use delivered images for commercial purposes without a separate written agreement. Photographer retains the right to use images from the session for portfolio, marketing, competition entry, and promotional purposes (including this website and social media), unless Client opts out in writing before the session date.`,
      enabled: true,
    },
    {
      id: "model-release",
      title: "MODEL RELEASE",
      body: `Client consents to being photographed and to Photographer's use of the resulting images as described in the Image Usage section above. If any minor will be included in the session, that minor's parent or legal guardian must also sign this Agreement, consenting on the minor's behalf.`,
      enabled: true,
    },
    {
      id: "liability",
      title: "LIABILITY & LIMITATION OF LIABILITY",
      body: `Photographer will exercise reasonable professional care in performing this Agreement. Photographer is not liable for circumstances beyond reasonable control that prevent full delivery of the session, including but not limited to venue restrictions, third-party interference, illness, accidents, or equipment malfunction despite reasonable maintenance. In the event Photographer is unable to deliver any usable images for a reason within Photographer's control, Client's sole and exclusive remedy is a full refund of all amounts paid under this Agreement. Except in cases of Photographer's gross negligence or willful misconduct, Photographer's total liability under this Agreement will not exceed the total amount paid by Client.`,
      enabled: true,
    },
    {
      id: "incapacity",
      title: "EQUIPMENT FAILURE & PHOTOGRAPHER INCAPACITY",
      body: `In the rare event Photographer is unable to complete the session due to illness, injury, or emergency, Photographer will make reasonable efforts to secure a qualified replacement photographer of similar caliber. If no replacement is available, Client will receive a full refund of all amounts paid, including the retainer, as this outcome is outside Client's control as well as Photographer's.`,
      enabled: true,
    },
    {
      id: "second-photographer",
      title: "SECOND PHOTOGRAPHER / ASSISTANTS",
      body: `Sessions booked under packages that include a second photographer or assistant will be staffed accordingly; Client will be notified in advance of who will be present. If Client prefers a single photographer only, Client must notify Photographer at least {{secondShooterNoticeDays}} days before the session.`,
      enabled: true,
    },
    {
      id: "travel-overtime",
      title: "TRAVEL & OVERTIME",
      body: `Session pricing includes travel within {{travelRadiusMiles}} miles of {{baseLocation}}. Travel beyond this radius is billed at \${{travelRatePerMile}}/mile or a flat fee of \${{travelFlatFee}}, as agreed in advance. Sessions running beyond the contracted time due to Client delay or request will be billed at \${{overtimeRatePerHour}}/hour, payable at the time of the session.`,
      enabled: true,
    },
    {
      id: "client-responsibilities",
      title: "CLIENT RESPONSIBILITIES",
      body: `Client is responsible for arriving on time, for the conduct of any guests or family members present during the session, and for obtaining any permits required by the session location (some public parks, beaches, and venues require a photography permit — this is Client's responsibility unless otherwise agreed in writing).`,
      enabled: true,
    },
    {
      id: "governing-law",
      title: "GOVERNING LAW & VENUE",
      body: GOVERNING_LAW[state],
      enabled: true,
    },
    {
      id: "dispute-resolution",
      title: "DISPUTE RESOLUTION",
      body: `Before initiating formal legal action, the parties agree to attempt to resolve any dispute arising from this Agreement through good-faith informal negotiation for at least {{negotiationPeriodDays}} days. Nothing in this section prevents either party from pursuing a claim in small claims court.`,
      enabled: true,
    },
    {
      id: "entire-agreement",
      title: "ENTIRE AGREEMENT / MISCELLANEOUS",
      body: `This Agreement constitutes the entire agreement between the parties regarding the session described herein and supersedes any prior oral or written agreements. If any provision of this Agreement is found unenforceable, the remaining provisions remain in full force. This Agreement may only be amended in writing signed by both parties. Client may not assign this Agreement without Photographer's written consent.`,
      enabled: true,
    },
    {
      id: "esignature",
      title: "ELECTRONIC SIGNATURE CONSENT",
      body: `By signing electronically below, Client agrees to conduct this transaction electronically and confirms that Client's typed name and drawn signature constitute a legally binding signature under the Uniform Electronic Transactions Act as adopted in Oregon (ORS 84.001–84.061) and Washington (RCW 19.360).`,
      enabled: true,
    },
  ];
}

export function flattenClauses(clauses: Clause[], values: Record<string, string> = {}): string {
  return clauses
    .filter((c) => c.enabled)
    .map((c) => `${c.title}\n${substitute(c.body, values)}`)
    .join("\n\n");
}
