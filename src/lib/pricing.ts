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
  return { totalExpenses, grossIncomeNeeded, totalRevenueNeeded, totalHoursPerYear, hourlyRate, minimumPerSession };
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
}

export function calcSessionPrice(session: SessionPriceInput, codb: CODBResults): number {
  const travelCost = session.travel_miles * session.travel_rate_per_mile;
  const studioCost = (session.studio_hourly_rate ?? 0) * session.duration_hours;
  const editingCost = (session.editing_hourly_rate ?? 0) * session.editing_hours;
  const shootingCost = (session.shooting_hourly_rate ?? 0) * session.duration_hours;
  return (codb.minimumPerSession + travelCost + studioCost + editingCost + shootingCost) * (1 + session.profit_margin / 100);
}
