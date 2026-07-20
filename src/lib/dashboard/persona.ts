import type { FinancialPassportDocument } from "@/lib/financial-passport/types";
import type { WatchlistItem } from "@/lib/dashboard/types";
import type { DashboardPersona } from "@/lib/dashboard/types";

export function detectPersona(
  doc: FinancialPassportDocument | null,
  watchlist: WatchlistItem[]
): DashboardPersona {
  if (!doc) return "onboarding";

  const purpose = doc.propertyGoals.purpose;
  if (purpose === "refinance") return "refinance";
  if (purpose === "investment" || purpose === "foreign_purchase") {
    return "investor";
  }
  if (watchlist.length >= 2) return "investor";
  if (doc.readiness.overall >= 55 && doc.income.totalNetIncome > 0) {
    return "buyer";
  }
  return "onboarding";
}

export function profileCompleteness(
  doc: FinancialPassportDocument | null
): number {
  if (!doc) return 0;
  let n = 0;
  let total = 6;
  if (doc.propertyGoals.purpose !== "unknown") n += 1;
  if (doc.income.totalNetIncome > 0) n += 1;
  if (doc.assets.totalOwnFundsModel > 0) n += 1;
  if (doc.identity.age != null) n += 1;
  if (doc.income.primaryType) n += 1;
  if (doc.liabilities.totalMonthly >= 0 && doc.income.totalNetIncome > 0) n += 1;
  return Math.round((n / total) * 100);
}
