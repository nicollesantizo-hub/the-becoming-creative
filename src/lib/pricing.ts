import type { CODBConfig, CODBResults } from "@/types/pricing";

export function calculateCODB(config: CODBConfig): CODBResults {
  const totalExpenses =
    config.equipment + config.insurance + config.software + config.storage +
    config.website + config.marketing + config.education + config.studio + config.other;
  const grossIncomeNeeded =
    config.tax_rate < 100
      ? config.desired_income / (1 - config.tax_rate / 100)
      : config.desired_income;
  const totalRevenueNeeded = totalExpenses + grossIncomeNeeded;
  const totalHoursPerYear = config.hours_per_week * config.weeks_per_year;
  const hourlyRate = totalHoursPerYear > 0 ? totalRevenueNeeded / totalHoursPerYear : 0;
  const minimumPerSession =
    config.shoots_per_year > 0 ? totalRevenueNeeded / config.shoots_per_year : 0;
  const expensesMinimumPerSession =
    config.shoots_per_year > 0 ? totalExpenses / config.shoots_per_year : 0;
  return { totalExpenses, grossIncomeNeeded, totalRevenueNeeded, totalHoursPerYear, hourlyRate, minimumPerSession, expensesMinimumPerSession };
}

export function fmt(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export interface SessionPriceInput {
  travel_miles: number;
  travel_rate_per_mile: number;
  studio_hourly_rate: number;
  editing_hourly_rate: number;
  shooting_hourly_rate: number;
  editing_hours: number;
  duration_hours: number;
  profit_margin: number;
  event_days?: number;
}

export function calcSessionPrice(session: SessionPriceInput, codb: CODBResults): number {
  const days = session.event_days && session.event_days > 1 ? session.event_days : 1;
  const travelCost = session.travel_miles * session.travel_rate_per_mile;
  const studioCost = (session.studio_hourly_rate ?? 0) * session.duration_hours * days;
  const editingCost = (session.editing_hourly_rate ?? 0) * session.editing_hours;
  const shootingCost = (session.shooting_hourly_rate ?? 0) * session.duration_hours * days;
  // When a shooting rate is set, income is earned through that rate — use expenses-only overhead
  const overhead = shootingCost > 0 ? codb.expensesMinimumPerSession : codb.minimumPerSession;
  return (overhead + travelCost + studioCost + editingCost + shootingCost) * (1 + session.profit_margin / 100);
}
