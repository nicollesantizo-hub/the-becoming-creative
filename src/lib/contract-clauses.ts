export interface Clause {
  id: string;
  title: string;
  body: string;
  enabled: boolean;
}

export type ContractState = "OR" | "WA" | "general";

const GOVERNING_LAW: Record<ContractState, string> = {
  OR: `This Agreement is governed by the laws of the State of Oregon, without regard to its conflict-of-laws principles. Any dispute arising under this Agreement will be resolved in the state or federal courts located in [County], Oregon.`,
  WA: `This Agreement is governed by the laws of the State of Washington, without regard to its conflict-of-laws principles. Any dispute arising under this Agreement will be resolved in the state or federal courts located in [County], Washington.`,
  general: `This Agreement is governed by the laws of the State of [Oregon/Washington], without regard to its conflict-of-laws principles. Any dispute arising under this Agreement will be resolved in the state or federal courts located in [County], [Oregon/Washington].`,
};

// Transcribed from Documents/Aida Visuals Tools/Contracts/clause-library.md —
// that file is the source of truth for the legal content itself (including
// drafting notes on which clauses are most state-law-sensitive); this is just
// the code-usable version so a starter template can be generated with one click.
export function defaultClauses(state: ContractState): Clause[] {
  return [
    {
      id: "retainer",
      title: "RETAINER / DEPOSIT (NON-REFUNDABLE)",
      body: `A retainer of [50]% of the total session fee ($[amount]), or $[flat amount], is due at the time this Agreement is signed to reserve Client's date. This retainer is earned upon booking in exchange for Photographer turning away other inquiries for that date, and is non-refundable regardless of whether the session later proceeds, except as provided in the Cancellation section below. The retainer is credited toward the total session fee.`,
      enabled: true,
    },
    {
      id: "payment-late",
      title: "PAYMENT SCHEDULE & LATE PAYMENT",
      body: `The remaining balance of $[amount] is due no later than [7] days before the session date [or: on the day of the session, before shooting begins]. Payments not received by the due date are considered late. A late payment fee of [10]% or $[flat amount], whichever is greater, may apply to balances more than [5] days overdue. Photographer is not obligated to begin or continue a session, or to deliver final images, while a balance remains outstanding.`,
      enabled: true,
    },
    {
      id: "cancellation",
      title: "CANCELLATION POLICY",
      body: `If Client cancels the session for any reason, the retainer is forfeited per the Retainer section above. If cancellation occurs less than [14] days before the session date, the full remaining balance is also due and non-refundable, as Photographer will likely be unable to rebook the date on short notice. If Photographer must cancel for any reason within Photographer's control, Client will receive a full refund of all amounts paid, or the option to reschedule at no additional cost.`,
      enabled: true,
    },
    {
      id: "rescheduling",
      title: "RESCHEDULING POLICY",
      body: `Client may reschedule the session date once at no additional charge, provided the request is made at least [7] days before the original session date and a new date is confirmed within [90] days. Rescheduling requests made with less notice, or additional reschedule requests beyond the first, may incur a rescheduling fee of $[amount]. If Client and Photographer cannot agree on a new date within [90] days, the session is treated as a cancellation under the Cancellation Policy above.`,
      enabled: true,
    },
    {
      id: "weather",
      title: "WEATHER & FORCE MAJEURE",
      body: `If weather conditions materially compromise the session (e.g., unsafe conditions, heavy rain or smoke, extreme heat or cold), Photographer may propose rescheduling at no additional cost, as a mutual accommodation rather than a fault-based cancellation. Neither party is liable for failure to perform due to causes beyond reasonable control, including but not limited to natural disaster, government order, wildfire smoke, road closures, or other events of force majeure. In such cases, the parties will reschedule in good faith; if no mutually agreeable date is found within [90] days, either party may treat the session as cancelled, with the retainer refunded to Client in full given neither party was at fault.`,
      enabled: true,
    },
    {
      id: "turnaround",
      title: "TURNAROUND TIME & DELIVERY",
      body: `Client will receive a minimum of [X] professionally edited, high-resolution digital images via private online gallery within [14] business days of the session date. Rush delivery (within [3] business days) is available for an additional fee of $[amount], subject to availability. Online galleries remain active for [90] days from delivery; Client is responsible for downloading and backing up images before expiration. Additional images beyond the stated minimum, if delivered, are a courtesy and not a guaranteed part of this Agreement.`,
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
      body: `Sessions booked under packages that include a second photographer or assistant will be staffed accordingly; Client will be notified in advance of who will be present. If Client prefers a single photographer only, Client must notify Photographer at least [7] days before the session.`,
      enabled: true,
    },
    {
      id: "travel-overtime",
      title: "TRAVEL & OVERTIME",
      body: `Session pricing includes travel within [X] miles of [city/base location]. Travel beyond this radius is billed at $[rate]/mile or a flat fee of $[amount], as agreed in advance. Sessions running beyond the contracted time due to Client delay or request will be billed at $[rate]/[15-minute increment or hour], payable at the time of the session.`,
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
      body: `Before initiating formal legal action, the parties agree to attempt to resolve any dispute arising from this Agreement through good-faith informal negotiation for at least [14] days. Nothing in this section prevents either party from pursuing a claim in small claims court.`,
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

export function flattenClauses(clauses: Clause[]): string {
  return clauses
    .filter((c) => c.enabled)
    .map((c) => `${c.title}\n${c.body}`)
    .join("\n\n");
}
