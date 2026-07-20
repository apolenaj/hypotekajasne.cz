import type { CurrentRates } from "@/lib/rates";
import {
  buildMarketReference,
  buildPaymentScenarios,
  compareStayVsRefinance,
  monthsUntilFixation,
} from "@/lib/refinance-radar/calculate";
import { buildTimelineMilestones, generateRefinanceAlerts } from "@/lib/refinance-radar/alerts";
import type {
  RefinanceLoanProfile,
  RefinanceRadarDashboard,
} from "@/lib/refinance-radar/types";

export function buildRefinanceRadarDashboard(input: {
  profile: RefinanceLoanProfile;
  rates: CurrentRates | null;
  emittedMilestones?: Record<string, string>;
  now?: Date;
}): RefinanceRadarDashboard {
  const now = input.now ?? new Date();
  const market = buildMarketReference(input.rates);
  const monthsToFix = monthsUntilFixation(input.profile.fixationEnd, now);
  const daysToFix =
    monthsToFix != null
      ? Math.ceil(
          (Date.parse(input.profile.fixationEnd) - now.getTime()) / 86_400_000
        )
      : null;

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
      "Všechny scénáře splátek jsou MODEL — anuita na zadaném zůstatku.",
      "Tržní reference z bank_rates — ne vaše individuální nabídka.",
      "Break-even = poplatky refinancování / měsíční úspora (MODEL).",
      "Alerty jsou personalizované k vaší splátce a fixaci — ne generické „sazby klesly“.",
      "Ověření u specialisty před rozhodnutím — retention & revenue cycle.",
    ],
  };
}
