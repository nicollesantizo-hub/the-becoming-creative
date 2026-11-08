import type { Clause } from "@/lib/contract-clauses";
import type { QuoteSection } from "@/lib/quote-sections";

export interface QuoteAddon {
  label: string;
  price: number;
  // Optional add-ons stay out of the total until the client chooses them on the proposal.
  optional?: boolean;
  description?: string;
}

export interface CODBConfig {
  id?: string;
  user_id?: string;
  equipment: number;
  insurance: number;
  software: number;
  storage: number;
  website: number;
  marketing: number;
  education: number;
  studio: number;
  other: number;
  desired_income: number;
  tax_rate: number;
  hours_per_week: number;
  weeks_per_year: number;
  shoots_per_year: number;
}

export interface CODBResults {
  totalExpenses: number;
  grossIncomeNeeded: number;
  totalRevenueNeeded: number;
  totalHoursPerYear: number;
  hourlyRate: number;
  minimumPerSession: number;
  expensesMinimumPerSession: number;
}

export interface SessionType {
  id?: string;
  user_id?: string;
  name: string;
  location_type: "outdoor" | "studio" | "travel" | "event" | "other";
  duration_hours: number;
  editing_hours: number;
  travel_miles: number;
  travel_rate_per_mile: number;
  studio_hourly_rate: number;
  editing_hourly_rate: number;
  shooting_hourly_rate: number;
  profit_margin: number;
  event_days?: number;
  created_at?: string;
}

export interface Quote {
  id?: string;
  user_id?: string;
  session_type_id?: string | null;
  quote_name: string;
  client_name: string;
  client_business: string;
  client_email: string;
  event_name?: string;
  event_location?: string;
  point_of_contact?: string;
  session_date: string;
  event_end_date?: string;
  location_type: "outdoor" | "studio" | "travel" | "event" | "other";
  duration_hours: number;
  editing_hours: number;
  travel_miles: number;
  tax_rate: number;
  discount_type: "percentage" | "flat" | null;
  discount_value: number;
  minimum_price: number;
  suggested_price: number;
  final_price: number;
  notes: string;
  addons: QuoteAddon[];
  payment_terms?: string;
  marketing_cost?: number;
  lodging_cost?: number;
  meal_cost?: number;
  additional_personnel?: { name: string; role: string; cost: number }[];
  coverage_items?: string[];
  gallery_turnaround?: string;
  event_days?: number;
  status: "draft" | "sent" | "accepted" | "declined";
  share_token?: string;
  base_override?: number | null;
  included_items?: { text: string; price?: number | null }[] | null;
  sections?: QuoteSection[] | null;
  cover_image_url?: string | null;
  selected_addons?: { label: string; price: number }[] | null;
  accepted_at?: string | null;
  accepted_name?: string | null;
  accepted_total?: number | null;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  tier: "free" | "pro";
  created_at: string;
}

// Photographer Planner types

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface TimelineEntry {
  id: string;
  time: string;
  note: string;
}

export interface PlannerShoot {
  id: string;
  user_id: string;
  client_name: string;
  session_date: string | null;
  location: string;
  session_type: string;
  notes: string;
  shot_list: ChecklistItem[];
  timeline: TimelineEntry[];
  gear_checklist: ChecklistItem[];
  created_at: string;
}

export interface PlannerBooking {
  id: string;
  user_id: string;
  client_name: string;
  session_type: string;
  session_date: string | null;
  status: "lead" | "booked" | "completed" | "paid";
  amount: number;
  notes: string;
  created_at: string;
}

export interface PlannerEdit {
  id: string;
  user_id: string;
  client_name: string;
  session_date: string | null;
  editing_deadline: string | null;
  delivery_deadline: string | null;
  status: "not_started" | "culling" | "editing" | "reviewing" | "delivered";
  photos_count: number;
  notes: string;
  tasks: ChecklistItem[];
  created_at: string;
}

export interface PlannerContent {
  id: string;
  user_id: string;
  platform: string;
  scheduled_date: string | null;
  caption_idea: string;
  status: "idea" | "drafted" | "scheduled" | "posted";
  notes: string;
  created_at: string;
}

export interface InspoCollaborator {
  id: string;
  name: string;
  role: string;
}

export interface InspoImage {
  path: string;
  url: string;
}

export interface Invoice {
  id?: string;
  user_id?: string;
  invoice_number?: string;
  client_name: string;
  client_business?: string;
  client_email: string;
  session_name: string;
  line_items: { description: string; amount: number }[];
  deposit_amount?: number;
  notes?: string;
  due_date?: string;
  status: "draft" | "sent" | "paid";
  series_id?: string | null;
  payment_method?: string | null;
  payment_link?: string | null;
  payment_instructions?: string | null;
  created_at?: string;
}

export interface InvoiceSeries {
  id?: string;
  user_id?: string;
  client_name: string;
  client_business?: string | null;
  client_email: string;
  title: string; // may contain {month}
  line_items: { description: string; amount: number }[];
  notes?: string;
  payment_method?: string | null;
  payment_link?: string | null;
  payment_instructions?: string | null;
  day_of_month: number;
  due_days: number;
  auto_send: boolean;
  active: boolean;
  next_run_date: string;
  last_issued_at?: string | null;
  created_at?: string;
}

export interface ContractTemplate {
  id?: string;
  user_id?: string;
  name: string;
  state: "OR" | "WA" | "general";
  clauses: Clause[];
  variables?: Record<string, string>;
  created_at?: string;
}

export interface Contract {
  id?: string;
  user_id?: string;
  contract_number?: string;
  client_name: string;
  client_email: string;
  package_name?: string;
  session_date?: string;
  session_location?: string;
  group_size?: number;
  price: number;
  deposit_amount?: number;
  amount_paid?: number;
  session_time?: string | null;
  balance_due_date?: string | null;
  deliverable_min_photos?: number;
  delivery_days?: number;
  terms_text: string;
  status: "draft" | "sent" | "signed";
  share_token?: string;
  signature_image?: string | null;
  signer_typed_name?: string | null;
  signed_at?: string | null;
  signer_ip?: string | null;
  created_at?: string;
}

export interface PlannerInspo {
  id: string;
  user_id: string;
  title: string;
  description: string;
  images: InspoImage[];
  mood_words: string[];
  colors: string[];
  collaborators: InspoCollaborator[];
  created_at: string;
}
