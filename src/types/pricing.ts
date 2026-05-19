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
  addons: { label: string; price: number }[];
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
