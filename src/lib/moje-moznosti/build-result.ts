/**
 * Složení výsledku „Vaše možnosti“ z readiness + passport + market matching.
 */

import { estimateAffordability } from "@/lib/affordability";
import {
  buildFinancialPassportDocument,
  type FinancialProfileAnswers,
} from "@/lib/financial-passport";
import { MODEL_DISCLAIMER } from "@/lib/mortgage-readiness/types";
import { matchMarkets } from "@/lib/market-matching";
import { profileToMatchingForm } from "@/lib/moje-moznosti/map-matching";
import type {
  MatchingPreferences,
  MojeMoznostiNextAction,
  MojeMoznostiResult,
} from "@/lib/moje-moznosti/types";
import type { RateUiKind } from "@/lib/rates/resolve-engine";
import { routes } from "@/lib/routes";

export function buildMojeMoznostiResult(
  profile: FinancialProfileAnswers,
  ratePercent: number,
  rateUiKind: RateUiKind,
  matchingPrefs?: MatchingPreferences
): MojeMoznostiResult {
  const doc = buildFinancialPassportDocument(profile, ratePercent);
  const funds = doc.assets.totalOwnFundsModel;
  const maxLoan = doc.financing.estimatedMaximum;
  const recommended = doc.financing.recommendedMaximum;
  const conservative = doc.financing.conservativeMaximum;

  const modelMaxBudget =
    maxLoan != null ? Math.round(maxLoan + funds) : funds > 0 ? funds : null;
  const recommendedBudget =
    recommended != null ? Math.round(recommended + funds) : null;
  const saferBudget =
    conservative != null
      ? Math.round(conservative + funds)
      : recommendedBudget != null
        ? Math.round(recommendedBudget * 0.85)
        : modelMaxBudget != null
          ? Math.round(modelMaxBudget * 0.85)
          : null;

  const target = profile.targetPrice;
  const ownFundsNeeded =
    target != null && target > 0
      ? Math.max(0, Math.round(target - (maxLoan ?? 0)))
      : modelMaxBudget != null && funds > 0
        ? Math.round(Math.max(0, (modelMaxBudget - funds) * 0.2))
        : null;

  // Light cross-check with affordability (same engine as homepage)
  const afford = estimateAffordability({
    monthlyIncome: profile.netIncome + profile.secondaryIncome,
    monthlyLiabilities:
      profile.otherLiabilities +
      profile.consumerLoanPayments +
      profile.leasePayments +
      profile.mortgagePayment +
      profile.creditLimitPayments,
    cash: funds,
    ratePercent,
    termYears: 30,
  });

  const matching = matchMarkets(
    profileToMatchingForm(profile, matchingPrefs)
  );

  const nextActions = buildNextActions(profile);

  return {
    finance: {
      modelMaxBudget: modelMaxBudget ?? (afford.maxPropertyPrice || null),
      saferBudget:
        saferBudget ??
        (afford.maxPropertyPrice > 0
          ? Math.round(afford.maxPropertyPrice * 0.85)
          : null),
      recommendedBudget,
      ownFundsNeeded,
      ownFundsHave: funds,
      maxLoanModel: maxLoan,
      claimKind: "MODEL",
      claimNote: doc.claimNote,
    },
    readiness: {
      score: doc.readiness.overall,
      band: doc.readiness.band,
      obstacles: doc.obstacles.slice(0, 4),
      strengths: doc.strengths.slice(0, 3),
      nextStep: doc.improvements[0] ?? doc.readiness.band,
      claimKind: "MODEL",
      disclaimer: MODEL_DISCLAIMER,
    },
    markets: {
      markets: matching.topMarkets.slice(0, 3).map((m) => ({
        id: m.marketId,
        name: m.name,
        overallMatch: Math.round(m.overallMatch),
        whyMatch: m.whyMatches.slice(0, 2),
        topRisks: m.topRisks.slice(0, 2),
        dataStatus: m.dataFreshness.status,
      })),
      profileLabel: matching.profileLabel,
      claimKind: "MODEL",
      note: "Organické skóre trhů — placené partnerství nemění pořadí. Nejde o investiční doporučení.",
    },
    nextActions,
    ratePercentUsed: ratePercent,
    rateUiKind,
  };
}

function buildNextActions(
  profile: FinancialProfileAnswers
): MojeMoznostiNextAction[] {
  if (profile.intent === "refinance") {
    return [
      {
        id: "refinance",
        label: "Spočítat refinancování",
        description:
          "Čas do konce fixace a modelové scénáře splátek.",
        href: routes.refinanceRadar,
      },
      {
        id: "passport",
        label: "Otevřít Finanční pas",
        description: "Plný profil připravenosti — jen lokálně v prohlížeči.",
        href: routes.financniPas,
      },
      {
        id: "kalkulacka",
        label: "Spočítat hypotéku",
        description: "Splátka, LTV a zátěžový test podle sazeb.",
        href: routes.kalkulacky.root,
      },
      {
        id: "specialista",
        label: "Nezávazná konzultace",
        description: "Hypotéka Jasně není banka — schválení vždy dělá banka.",
        href: routes.navrhNaMiru,
      },
    ];
  }

  return [
    {
      id: "kalkulacka",
      label: "Spočítat hypotéku",
      description: "Splátka, LTV a zátěžový test podle sazeb.",
      href: routes.kalkulacky.root,
    },
    {
      id: "trhy",
      label: "Porovnat trhy",
      description: "Destinace — vlastnictví, financování, rizika.",
      href: routes.pruvodceInvestora,
    },
    {
      id: "rentgen",
      label: "Analyzovat nemovitost",
      description: "Výnos, cena/m² a fit financování.",
      href: routes.investicniRentgen,
    },
    {
      id: "passport",
      label: "Otevřít Finanční pas",
      description: "Plný profil připravenosti — jen lokálně v prohlížeči.",
      href: routes.financniPas,
    },
  ];
}

/** Minimální data pro první užitečný výsledek. */
export function canComputeFirstResult(
  profile: FinancialProfileAnswers
): boolean {
  return (
    profile.intent != null &&
    profile.netIncome > 0 &&
    profile.ownFunds >= 0
  );
}
