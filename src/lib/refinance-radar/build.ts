import type { CurrentRates } from "@/lib/rates";
import type { ResolvedMortgageRate } from "@/lib/rates/resolve-engine";
import {
  buildMarketReference,
  buildMarketReferenceFromResolved,
  buildPaymentScenarios,
  compareStayVsRefinance,
  monthsUntilFixation,
  recommendedRefinanceStartDate,
  RECOMMENDED_START_MONTHS_BEFORE,
} from "@/lib/refinance-radar/calculate";
import { buildTimelineMilestones, generateRefinanceAlerts } from "@/lib/refinance-radar/alerts";
import type {
  RefinanceLoanProfile,
  RefinanceRadarDashboard,
} from "@/lib/refinance-radar/types";

export function buildRefinanceRadarDashboard(input: {
  profile: RefinanceLoanProfile;
  rates?: CurrentRates | null;
  /** Preferovaný vstup — LIVE / STALE / MODEL z rate engine */
  resolvedRate?: ResolvedMortgageRate | null;
  emittedMilestones?: Record<string, string>;
  now?: Date;
}): RefinanceRadarDashboard {
  const now = input.now ?? new Date();
  const market =
    input.resolvedRate != null
      ? buildMarketReferenceFromResolved(input.resolvedRate)
      : buildMarketReference(input.rates ?? null);

  const monthsToFix = monthsUntilFixation(input.profile.fixationEnd, now);
  const daysToFix =
    monthsToFix != null && Number.isFinite(Date.parse(input.profile.fixationEnd))
      ? Math.ceil(
          (Date.parse(input.profile.fixationEnd) - now.getTime()) / 86_400_000
        )
      : null;

  const recommendedStart = recommendedRefinanceStartDate(
    input.profile.fixationEnd,
    RECOMMENDED_START_MONTHS_BEFORE
  );

  const paymentScenarios = buildPaymentScenarios(input.profile, market);
  const comparison = compareStayVsRefinance({
    profile: input.profile,
    marketRatePercent: market.ratePercent,
    now,
  });

  const timeline = buildTimelineMilestones(input.profile.fixationEnd, now);
  const { alerts } = generateRefinanceAlerts({
    profile: input.profile,
    marketRatePercent: market.ratePercent,
    emittedMilestones: input.emittedMilestones ?? {},
    now,
  });

  return {
    generatedAt: now.toISOString(),
    profile: input.profile,
    monthsToFixation: monthsToFix,
    daysToFixation: daysToFix,
    recommendedStartDate: recommendedStart,
    recommendedStartMonthsBefore: RECOMMENDED_START_MONTHS_BEFORE,
    currentRate: {
      value: input.profile.ratePercent,
      claimKind: "DATA",
    },
    marketReference: market,
    paymentScenarios,
    comparison,
    timeline,
    alerts,
    methodology: [
      "Všechny scénáře splátek jsou orientační model — anuita na zadaném zůstatku.",
      "Tržní reference: LIVE (čerstvá data) / STALE (neaktuální) / MODEL (fallback) — nikdy jako individuální nabídka banky.",
      "Bod zvratu = poplatky refinancování / měsíční úspora (MODEL).",
      "Hlídání je lokální v prohlížeči a v Centru upozornění — e-mailové notifikace zatím nejsou dostupné.",
      "Ověření u specialisty před rozhodnutím.",
    ],
  };
}
