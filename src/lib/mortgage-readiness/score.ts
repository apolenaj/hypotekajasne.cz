import { calculateAnnuityPayment } from "@/lib/calculators";
import { maxLoanFromPayment } from "@/lib/finance-math/core";
import { MODEL_FALLBACK_RATE_PERCENT } from "@/lib/rates/model-fallback";
import {
  MODEL_DISCLAIMER,
  type ActionPlan,
  type IncomeTypeId,
  type ReadinessAnswers,
  type ReadinessResult,
} from "@/lib/mortgage-readiness/types";

export { maxLoanFromPayment };

function incomeStabilityScore(type: IncomeTypeId | null): number {
  switch (type) {
    case "employee":
      return 15;
    case "osvc_evidence":
      return 11;
    case "osvc_pausal":
      return 9;
    case "sro":
      return 8;
    case "rental":
      return 7;
    case "other":
      return 5;
    default:
      return 0;
  }
}

/**
 * Orientační skóre 0–100. Nikdy netvrdí schválení bankou.
 */
export function calculateReadiness(
  answers: ReadinessAnswers,
  /** Modelová sazba pro odhad rozsahu — null = SoT model fallback */
  modelRatePercent: number | null = MODEL_FALLBACK_RATE_PERCENT
): ReadinessResult {
  const rate =
    modelRatePercent != null && modelRatePercent > 0
      ? modelRatePercent
      : MODEL_FALLBACK_RATE_PERCENT;
  const age = answers.age ?? 40;
  const termYears = Math.min(30, Math.max(5, 65 - age));
  const income = Math.max(0, answers.netIncome);
  const liabilities =
    Math.max(0, answers.otherLiabilities) +
    Math.max(0, answers.creditLimitPayments);
  const ownFunds =
    Math.max(0, answers.ownFunds) +
    (answers.hasCzCollateral ? Math.max(0, answers.czCollateralEquity) : 0);

  const dstiCap =
    answers.intent === "investment" || answers.intent === "foreign_purchase"
      ? 0.35
      : 0.45;
  const maxPayment = Math.max(0, income * dstiCap - liabilities);
  const maxByIncome = Math.round(
    maxLoanFromPayment(maxPayment, rate, termYears)
  );
  const maxByEquity = Math.round(ownFunds * 4); // orientační LTV rámec ~80 %
  const high = Math.max(0, Math.min(maxByIncome, maxByEquity || maxByIncome));
  const low = Math.round(high * 0.65);

  let score = 0;
  const strengths: string[] = [];
  const obstacles: string[] = [];
  const improvements: string[] = [];
  const riskFactors: string[] = [];

  // Příjmová kapacita (0–30)
  const capacityRatio =
    income > 0 ? Math.min(1, maxPayment / (income * dstiCap || 1)) : 0;
  const capacityPts = Math.round(capacityRatio * 30);
  score += capacityPts;
  if (capacityPts >= 22) {
    strengths.push(
      "Orientační rezervní kapacita příjmu vůči modelové zátěži vypadá solidně."
    );
  } else if (capacityPts <= 12) {
    obstacles.push(
      "Měsíční závazky a modelová zátěž výrazně snižují prostor pro novou splátku."
    );
    improvements.push(
      "Snižte nesplácené limity / konsolidujte závazky před žádostí."
    );
  }

  // Vlastní zdroje (0–25)
  const price = answers.targetPrice ?? (high > 0 ? high / 0.8 : 0);
  const ltv =
    price > 0 ? Math.min(1, Math.max(0, (price - answers.ownFunds) / price)) : 0.8;
  const equityPts =
    price > 0
      ? Math.round((1 - Math.min(1, Math.max(0, ltv - 0.5) / 0.4)) * 25)
      : ownFunds >= 500_000
        ? 18
        : ownFunds >= 200_000
          ? 12
          : ownFunds > 0
            ? 6
            : 0;
  score += equityPts;
  if (equityPts >= 18) {
    strengths.push("Vlastní zdroje / zajištění podporují nižší modelové LTV.");
  } else {
    obstacles.push("Vlastní zdroje jsou relativně nízké vůči cílové ceně.");
    improvements.push(
      "Doplňte akontaci nebo zvažte dozajištění (bez příslibu schválení)."
    );
  }

  // Stabilita příjmu (0–15)
  const stab = incomeStabilityScore(answers.incomeType);
  score += stab;
  if (stab >= 13) strengths.push("Typ příjmu je z pohledu modelů obvykle snáze doložitelný.");
  else if (stab > 0 && stab <= 8) {
    riskFactors.push(
      "Typ příjmu může vyžadovat delší historii a podrobnější dokumentaci."
    );
    improvements.push("Připravte daňová přiznání / výpisy za 12–24 měsíců.");
  }

  // Věk / splatnost (0–10)
  const agePts = age >= 25 && age <= 50 ? 10 : age < 60 ? 7 : 4;
  score += agePts;
  if (age > 55) {
    riskFactors.push(
      "Kratší maximální splatnost může zvyšovat měsíční zátěž v modelu."
    );
  }

  // Kreditní zátěž (0–10)
  const creditPressure =
    income > 0 ? liabilities / income : liabilities > 0 ? 1 : 0;
  const creditPts = Math.round((1 - Math.min(1, creditPressure / 0.4)) * 10);
  score += creditPts;
  if (creditPts <= 4) {
    obstacles.push("Stávající splátky a limity výrazně zatěžují modelovou bonitu.");
  }

  // Intent / specifické (0–10)
  let intentPts = 5;
  if (answers.intent === "foreign_purchase") {
    intentPts = answers.hasCzCollateral ? 8 : 3;
    if (!answers.targetCountry) {
      obstacles.push("U zahraniční koupě chybí cílová země — doplňte ji.");
    }
    if (!answers.hasCzCollateral) {
      riskFactors.push(
        "Bez českého zajištění je lokální financování v zahraničí často omezené."
      );
    } else {
      strengths.push("České zajištění může otevřít cestu americké hypotéky (orientačně).");
    }
  } else if (answers.intent === "refinance") {
    intentPts =
      answers.currentBalance != null && answers.currentBalance > 0 ? 8 : 4;
    if (answers.currentRate != null && answers.currentRate > rate + 0.5) {
      strengths.push(
        "Orientační rozdíl sazeb naznačuje prostor ke zkoumání refinancování."
      );
    }
  } else if (answers.intent === "investment") {
    intentPts = 6;
    riskFactors.push(
      "Investiční účel mívá přísnější interní limity bank (LTV/DSTI)."
    );
  } else if (answers.intent === "owner_occupied") {
    intentPts = 9;
    strengths.push("Účel vlastní bydlení odpovídá nejběžnějšímu produktovému rámci.");
  }
  score += intentPts;

  // Employment / defaults self-declare (bonus up to 5, already in 100 budget — clamp)
  if (answers.employmentMonths != null && answers.employmentMonths >= 12) {
    score += 3;
    strengths.push("Delší kontinuita příjmu (self-reported) podporuje připravenost dokumentace.");
  }
  if (answers.noRecentDefaults === false) {
    score -= 8;
    riskFactors.push(
      "Uvedené problémy se splácením mohou být zásadní překážkou — ověřte s partnerem."
    );
  } else if (answers.noRecentDefaults === true) {
    score += 2;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  if (answers.coApplicant) {
    strengths.push("Spolužadatel může (orientačně) posílit doložitelný příjem.");
  }
  if (answers.dependents >= 3) {
    riskFactors.push(
      "Vyšší počet vyživovaných osob — banky často zohledňují životní minimum domácnosti."
    );
  }

  improvements.push(
    "Doplňte výpisy z účtu, potvrzení o příjmu a odhad nemovitosti dříve, než oslovíte banku."
  );
  if (score < 60) {
    improvements.push(
      "Zvažte nižší cílovou cenu nebo vyšší vlastní zdroje před podáním žádosti."
    );
  }

  const nextSteps = [
    "Uložte si výsledek a aktualizujte ho po změně příjmu nebo závazků.",
    "Nechte si model ověřit individuální konzultací — bez příslibu schválení.",
    "Porovnejte orientační rozpočet s nabídkou nemovitostí (Majetio).",
  ];

  const actionPlan = buildActionPlan(answers, score);

  const ownFundsNote =
    ownFunds <= 0
      ? "Vlastní zdroje zatím nejsou vyplněny — doplňte akontaci a případné zajištění."
      : `Model počítá s vlastními zdroji / equity cca ${Math.round(ownFunds).toLocaleString("cs-CZ")} Kč (včetně případného českého zajištění).`;

  return {
    score,
    strengths: strengths.length ? strengths : ["Základní profil je vyplněný — pokračujte v doložení dokumentů."],
    obstacles: obstacles.length
      ? obstacles
      : ["V modelu nevyšly zásadní překážky — finální posouzení vždy provádí banka."],
    improvements,
    financingRange:
      high > 0
        ? { low: Math.max(0, low), high }
        : null,
    ownFundsNote,
    riskFactors: riskFactors.length
      ? riskFactors
      : ["Standardní tržní a úrokové riziko — sazba po fixaci se může změnit."],
    nextSteps,
    actionPlan,
    modelDisclaimer: MODEL_DISCLAIMER,
  };
}

function buildActionPlan(
  answers: ReadinessAnswers,
  score: number
): ActionPlan {
  const days30 = [
    "Shromážděte potvrzení o příjmu a výpisy za poslední 3 měsíce.",
    "Spočítejte přesně limity karet a další splátky — model je citlivý na závazky.",
    "Uložte aktuální skóre připravenosti a doplňte chybějící pole.",
  ];
  const months3 = [
    "Dolaďte vlastní zdroje / rezervu na transakční náklady.",
    "Nechte si nezávazně projít profil v individuální konzultaci.",
    answers.intent === "foreign_purchase"
      ? "Ověřte ownership a financování v cílové zemi (přehled země / laboratoř rozhodnutí)."
      : "Porovnejte 2–3 produktové rámce bank bez závazku.",
  ];
  const months6to12 = [
    score < 70
      ? "Cíleně snižte závazky nebo zvyšte akontaci a skóre znovu přepočítejte."
      : "Připravte termín odhadu nemovitosti a kompletní složku pro banku.",
    "Sledujte sazby a fixace — rozhodnutí načasujte podle vašeho horizontu, ne marketingu.",
    "Po změně situace aktualizujte uložený profil Hypoteční připravenosti.",
  ];
  return { days30, months3, months6to12 };
}

/** @deprecated — use `@/lib/majetio` `buildMajetioDiscoveryUrl`. */
export { buildMajetioListingUrl } from "@/lib/majetio/urls";

export function monthlyPaymentForLoan(
  loan: number,
  ratePercent: number,
  termYears: number
): number {
  return calculateAnnuityPayment(loan, ratePercent, termYears);
}
