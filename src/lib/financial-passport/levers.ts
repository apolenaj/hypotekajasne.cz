import {
  computeDimensionScores,
  overallFromDimensions,
} from "@/lib/financial-passport/dimensions";
import { applySimulation } from "@/lib/financial-passport/mutations";
import type {
  FinancialProfileAnswers,
  ScoreLever,
  SimulationId,
} from "@/lib/financial-passport/types";

function overallOf(
  profile: FinancialProfileAnswers,
  modelRate: number
): number {
  return overallFromDimensions(computeDimensionScores(profile, modelRate));
}

/**
 * „Co zvýší moje skóre nejrychleji?“ — modelové páky s odhadovaným ziskem.
 */
export function rankScoreLevers(
  profile: FinancialProfileAnswers,
  modelRate: number,
  baselineOverall: number
): ScoreLever[] {
  const candidates: {
    id: string;
    title: string;
    simulationId: SimulationId | null;
    amount?: number;
    rationale: string;
  }[] = [
    {
      id: "cut_credit",
      title: "Snížit kreditní limity",
      simulationId: "cut_credit_limit",
      amount: Math.max(profile.creditLimitPayments, 2_000),
      rationale: "Nižší modelová zátěž z karet okamžitě uvolní DSTI kapacitu.",
    },
    {
      id: "pay_consumer",
      title: "Splatit spotřebitelské splátky",
      simulationId: "pay_off_loan",
      rationale: "Odstranění měsíčních splátek zvedá affordability i debt_load.",
    },
    {
      id: "add_equity",
      title: "Doplnit vlastní zdroje (+300 tis.)",
      simulationId: "increase_equity",
      amount: 300_000,
      rationale: "Vyšší equity zlepší LTV rámec a likviditu.",
    },
    {
      id: "income_up",
      title: "Navýšit čistý příjem (+5 tis.)",
      simulationId: "increase_income",
      amount: 5_000,
      rationale: "Vyšší příjem posílí affordability i odolnost.",
    },
    {
      id: "cheaper",
      title: "Snížit cílovou cenu (−500 tis.)",
      simulationId: "cheaper_property",
      amount: 500_000,
      rationale: "Levnější cíl zlepší fit dostupnosti bez změny příjmu.",
    },
  ];

  const ranked: ScoreLever[] = [];

  for (const c of candidates) {
    if (c.simulationId === "pay_off_loan") {
      const hasLoan =
        profile.consumerLoanPayments > 0 ||
        profile.leasePayments > 0 ||
        profile.otherLiabilities > 0;
      if (!hasLoan) continue;
    }
    if (
      c.simulationId === "cut_credit_limit" &&
      profile.creditLimitPayments <= 0
    ) {
      continue;
    }
    if (
      c.simulationId === "cheaper_property" &&
      (profile.targetPrice == null || profile.targetPrice <= 0)
    ) {
      continue;
    }

    const simProfile = c.simulationId
      ? applySimulation(profile, c.simulationId, c.amount ?? 0)
      : profile;
    const nextOverall = overallOf(simProfile, modelRate);
    const gain = nextOverall - baselineOverall;
    if (gain <= 0) continue;

    ranked.push({
      id: c.id,
      title: c.title,
      estimatedGain: gain,
      rationale: c.rationale,
      simulationId: c.simulationId,
    });
  }

  ranked.sort((a, b) => b.estimatedGain - a.estimatedGain);
  return ranked.slice(0, 5);
}
