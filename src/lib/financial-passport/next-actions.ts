import {
  computeDimensionScores,
  overallFromDimensions,
  profileMetrics,
} from "@/lib/financial-passport/dimensions";
import { applyWhatIfToProfile } from "@/lib/financial-passport/what-if";
import type {
  FinancialProfileAnswers,
  NextActionHint,
  ScoreDimensionId,
} from "@/lib/financial-passport/types";

function fmtCzk(n: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(n);
}

function gainFromWhatIf(
  profile: FinancialProfileAnswers,
  modelRate: number,
  baselineOverall: number,
  mutate: (p: FinancialProfileAnswers) => FinancialProfileAnswers
): number {
  const next = mutate(profile);
  const nextOverall = overallFromDimensions(
    computeDimensionScores(next, modelRate)
  );
  return nextOverall - baselineOverall;
}

/**
 * „Co mám udělat dál?“ — kvantifikované modelové kroky, nikdy bankovní schválení.
 */
export function buildNextActions(
  profile: FinancialProfileAnswers,
  modelRate: number,
  baselineOverall: number
): NextActionHint[] {
  const metrics = profileMetrics(profile, modelRate);
  const actions: NextActionHint[] = [];

  if (metrics.reserveMonths < 6 && metrics.funds >= 0) {
    const targetMonths = 6;
    const neededReserve = Math.max(
      0,
      Math.round(targetMonths * metrics.monthlyBurn - metrics.funds)
    );
    const reserveBoost = neededReserve > 0 ? neededReserve : 150_000;
    const gain = gainFromWhatIf(profile, modelRate, baselineOverall, (p) =>
      applyWhatIfToProfile(p, {
        incomeDeltaCzk: 0,
        liabilitiesDeltaCzk: 0,
        capitalDeltaCzk: reserveBoost,
        targetPriceDeltaCzk: 0,
        modelRatePercent: modelRate,
      })
    );
    actions.push({
      id: "boost_reserve",
      priority: metrics.reserveMonths < 3 ? 1 : 2,
      title: "Zvýšit finanční rezervu",
      detail: `Zvýšení rezervy o ${fmtCzk(reserveBoost)} by v modelu prodloužilo finanční polštář a zlepšilo odolnost při vyšší sazbě${metrics.rateSensitivityDelta ? ` (+2 p.b. ≈ ${fmtCzk(metrics.rateSensitivityDelta)}/měs.)` : ""}.`,
      dimensionId: "liquidity",
      estimatedGain: gain > 0 ? gain : null,
      simulationId: "increase_equity",
    });
  }

  if (metrics.liabilities > 0 && metrics.burden > 0.2) {
    const cut = Math.min(
      metrics.liabilities,
      Math.max(3_000, Math.round(metrics.liabilities * 0.25))
    );
    const gain = gainFromWhatIf(profile, modelRate, baselineOverall, (p) =>
      applyWhatIfToProfile(p, {
        incomeDeltaCzk: 0,
        liabilitiesDeltaCzk: -cut,
        capitalDeltaCzk: 0,
        targetPriceDeltaCzk: 0,
        modelRatePercent: modelRate,
      })
    );
    actions.push({
      id: "cut_liabilities",
      priority: metrics.burden > 0.35 ? 1 : 3,
      title: "Snížit měsíční závazky",
      detail: `Snížení závazků o ${fmtCzk(cut)}/měs. by v modelu uvolnilo DSTI kapacitu a zlepšilo dluhové zatížení — stále jde o modelovou připravenost, ne schválení banky.`,
      dimensionId: "debt_load",
      estimatedGain: gain > 0 ? gain : null,
      simulationId: "pay_off_loan",
    });
  }

  if (metrics.price > 0 && metrics.funds > 0) {
    const equityGap = Math.max(0, Math.round(metrics.price * 0.2 - metrics.funds));
    if (equityGap > 50_000) {
      const boost = Math.min(equityGap, 400_000);
      const gain = gainFromWhatIf(profile, modelRate, baselineOverall, (p) =>
        applyWhatIfToProfile(p, {
          incomeDeltaCzk: 0,
          liabilitiesDeltaCzk: 0,
          capitalDeltaCzk: boost,
          targetPriceDeltaCzk: 0,
          modelRatePercent: modelRate,
        })
      );
      actions.push({
        id: "add_equity",
        priority: 4,
        title: "Doplnit vlastní kapitál",
        detail: `Doplnění akontace o ${fmtCzk(boost)} by v modelu posunulo LTV a regulační fit blíž k orientačnímu rámci.`,
        dimensionId: "equity",
        estimatedGain: gain > 0 ? gain : null,
        simulationId: "increase_equity",
      });
    }
  }

  if (metrics.income > 0) {
    const incomeBoost = 5_000;
    const gain = gainFromWhatIf(profile, modelRate, baselineOverall, (p) =>
      applyWhatIfToProfile(p, {
        incomeDeltaCzk: incomeBoost,
        liabilitiesDeltaCzk: 0,
        capitalDeltaCzk: 0,
        targetPriceDeltaCzk: 0,
        modelRatePercent: modelRate,
      })
    );
    if (gain > 0) {
      actions.push({
        id: "raise_income",
        priority: 5,
        title: "Navýšit čistý příjem",
        detail: `Navýšení příjmu o ${fmtCzk(incomeBoost)}/měs. by v modelu zlepšilo affordability stress test — ověřte, zda banka uzná stejný zdroj.`,
        dimensionId: "income_stability",
        estimatedGain: gain,
        simulationId: "increase_income",
      });
    }
  }

  if (metrics.price > 0) {
    const priceCut = 500_000;
    const gain = gainFromWhatIf(profile, modelRate, baselineOverall, (p) =>
      applyWhatIfToProfile(p, {
        incomeDeltaCzk: 0,
        liabilitiesDeltaCzk: 0,
        capitalDeltaCzk: 0,
        targetPriceDeltaCzk: -priceCut,
        modelRatePercent: modelRate,
      })
    );
    if (gain > 0) {
      actions.push({
        id: "cheaper_target",
        priority: 6,
        title: "Snížit cílovou cenu nemovitosti",
        detail: `Snížení cíle o ${fmtCzk(priceCut)} by v modelu zlepšilo affordability stress test a regulační fit bez změny příjmu.`,
        dimensionId: "affordability_stress",
        estimatedGain: gain,
        simulationId: "cheaper_property",
      });
    }
  }

  if (metrics.rateSensitivityDelta != null && metrics.rateSensitivityDelta > 4_000) {
    actions.push({
      id: "rate_buffer",
      priority: 2,
      title: "Počítat s vyšší sazbou",
      detail: `Při +2 p.b. sazby model počítá navýšení splátky o ${fmtCzk(metrics.rateSensitivityDelta)}/měs. — zvažte delší fixaci nebo vyšší rezervu; model nepredikuje schválení.`,
      dimensionId: "affordability_stress",
      estimatedGain: null,
      simulationId: "change_rate",
    });
  }

  const weakDim = [...computeDimensionScores(profile, modelRate)]
    .sort((a, b) => a.score - b.score)[0];
  if (weakDim?.id === "documentation_readiness" && weakDim.score < 65) {
    actions.push({
      id: "complete_docs",
      priority: 3,
      title: "Doplnit profil a dokumentaci",
      detail:
        "Nejrychlejší zlepšení modelové připravenosti: typ příjmu, délka zaměstnání a účel financování — stále bez nároku na bankovní schválení.",
      dimensionId: "documentation_readiness" as ScoreDimensionId,
      estimatedGain: null,
      simulationId: null,
    });
  }

  actions.sort((a, b) => a.priority - b.priority);
  return actions.slice(0, 6);
}
