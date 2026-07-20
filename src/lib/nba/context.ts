import type { FinancialPassportDocument } from "@/lib/financial-passport/types";
import type {
  PropertyDashboardRow,
  WatchlistItem,
} from "@/lib/dashboard/types";
import { profileCompleteness } from "@/lib/dashboard/persona";
import type { NbaEngineInput } from "@/lib/nba/types";
import type { FinancialProfileAnswers } from "@/lib/financial-passport/types";

/**
 * Map dashboard / passport state → pure engine input.
 */
export function buildNbaEngineInput(input: {
  doc: FinancialPassportDocument | null;
  profile?: FinancialProfileAnswers | null;
  properties: PropertyDashboardRow[];
  watchlist: WatchlistItem[];
  now?: Date;
}): NbaEngineInput {
  const { doc, profile, properties, watchlist } = input;

  const priceDrop = properties.find(
    (p) => p.priceChangePct != null && p.priceChangePct <= -3
  );
  const over = properties.find((p) => p.affordabilityFit === "over");

  let fixationMonthsRemaining: number | null = null;
  if (profile?.yearsLeft != null && profile.yearsLeft >= 0) {
    // yearsLeft on refinance form = years remaining on loan/fix — treat as months*12 if < 40
    const y = profile.yearsLeft;
    fixationMonthsRemaining = y <= 15 ? Math.round(y * 12) : null;
  }
  // If purpose refinance but no yearsLeft, leave null (generic refinance rule)

  let estimatedLtv: number | null = null;
  if (doc) {
    const price = doc.propertyGoals.targetPrice;
    const funds = doc.assets.totalOwnFundsModel;
    if (price != null && price > 0) {
      estimatedLtv = Math.min(1, Math.max(0, (price - funds) / price));
    }
  }

  return {
    readinessScore: doc?.readiness.overall ?? null,
    hasProfile: doc != null,
    incomeNet: doc?.income.totalNetIncome ?? 0,
    ownFunds: doc?.assets.totalOwnFundsModel ?? 0,
    profileCompleteness: profileCompleteness(doc),
    purpose: doc?.propertyGoals.purpose ?? null,
    fixationMonthsRemaining,
    estimatedLtv,
    watchlistCount: watchlist.length,
    hasSavedProperty: watchlist.length > 0,
    priceDropPct: priceDrop?.priceChangePct ?? null,
    priceDropLabel: priceDrop?.item.label ?? null,
    propertyOverBudgetLabel: over?.item.label ?? null,
    topLeverTitle: doc?.readiness.topLevers[0]?.title ?? null,
    now: input.now,
  };
}
