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
  profit_margin: number;
  created_at?: string;
}

export interface Quote {
  id?: string;
  user_id?: string;
  session_type_id?: string | null;
  client_name: string;
  client_email: string;
  session_date: string;
  location_type: string;
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
  status: "draft" | "sent" | "accepted" | "declined";
  created_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  tier: "free" | "pro";
  created_at: string;
}
