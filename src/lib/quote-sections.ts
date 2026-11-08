// The shape of a proposal: which sections appear, in what order, under what title.
// Built-in sections pull their content from the quote itself; custom sections carry
// their own body text.

export type SectionKind =
  | "welcome"
  | "details"
  | "included"
  | "team"
  | "coverage"
  | "investment"
  | "addons"
  | "terms"
  | "custom";

export interface QuoteSection {
  id: string;
  kind: SectionKind;
  enabled: boolean;
  title: string;
  body?: string;
  // Investment only: show the hourly labor + cost lines for event quotes.
  detailed?: boolean;
}

export const SECTION_META: Record<Exclude<SectionKind, "custom">, { title: string; hint: string }> = {
  welcome: { title: "A note for you", hint: "Your personal note, written above" },
  details: { title: "The details", hint: "Date, location, hours, and turnaround" },
  included: { title: "What's included", hint: "Your What's Included list" },
  team: { title: "Your photography team", hint: "Additional personnel (events)" },
  coverage: { title: "Moments we'll capture", hint: "Key coverage moments (events)" },
  investment: { title: "Your investment", hint: "Pricing and total" },
  addons: { title: "Make it yours", hint: "Optional add-ons your client can choose" },
  terms: { title: "Payment terms", hint: "Your payment terms" },
};

const BUILT_IN_ORDER: Exclude<SectionKind, "custom">[] = [
  "welcome",
  "details",
  "included",
  "team",
  "coverage",
  "investment",
  "addons",
  "terms",
];

// Starting points for custom sections — written to be edited, not sent as-is.
export const CUSTOM_PRESETS: { title: string; body: string }[] = [
  {
    title: "Your experience",
    body: "From the moment you book, I'll be with you, from planning your session to the day your gallery arrives. My hope is that you walk away feeling truly seen.",
  },
  {
    title: "What to wear",
    body: "Choose pieces that feel like you. Soft, neutral tones and textures photograph beautifully. I'll send a full guide once you've booked.",
  },
  {
    title: "What happens next",
    body: "Once you accept, I'll send your contract and retainer invoice. As soon as those are complete, your date is officially held.",
  },
  { title: "", body: "" },
];

export function newSectionId() {
  return Math.random().toString(36).slice(2, 10);
}

export function defaultSections(): QuoteSection[] {
  return BUILT_IN_ORDER.map((kind) => ({
    id: kind,
    kind,
    enabled: true,
    title: SECTION_META[kind].title,
  }));
}

// Older quotes have no saved sections; give them the default layout. Any built-in
// section missing from a saved layout is appended so new sections never vanish.
export function normalizeSections(saved: QuoteSection[] | null | undefined): QuoteSection[] {
  if (!saved || saved.length === 0) return defaultSections();
  const present = new Set(saved.map((s) => s.kind));
  const missing = defaultSections().filter((s) => !present.has(s.kind));
  return [...saved, ...missing];
}
