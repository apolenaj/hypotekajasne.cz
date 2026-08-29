/**
 * Display-ready summary of the user's mortgage journey (calculator → /sazby).
 * Uses computeMiniMortgage — no independent payment math.
 */

import {
  computeMiniMortgage,
  validateMiniMortgageInput,
  type MiniMortgageInput,
} from "@/lib/mini-mortgage-calculator";
import {
  formatExactLtvCs,
  formatLtvBandLabel,
} from "@/lib/mortgage-rates/ltv-context";
import {
  buildCalculatorHref,
  type MortgageJourneyContext,
  type MortgageJourneyParseResult,
  type MortgageJourneyPurpose,
} from "@/lib/mortgage-rates/mortgage-journey-context";

export const MORTGAGE_JOURNEY_PURPOSE_LABELS: Record<MortgageJourneyPurpose, string> = {
  purchase: "Koupě bydlení",
  refinance: "Refinancování",
};

export type MortgageJourneySummaryReady = {
  status: "ready";
  propertyValueCzk: number;
  ownFundsCzk: number;
  loanAmountCzk: number;
  termYears: number;
  fixationMonths: number;
  fixationLabel: string;
  purpose: MortgageJourneyPurpose;
  purposeLabel: string;
  exactLtv: number;
  exactLtvLabel: string;
  ltvBand: number | null;
  ltvBandLabel: string | null;
  modelMonthlyPaymentCzk: number;
  modelRatePercent: number;
  editHref: string;
};

export type MortgageJourneySummaryIncomplete = {
  status: "incomplete";
  message: string;
  editHref: string;
};

export type MortgageJourneySummary =
  | MortgageJourneySummaryReady
  | MortgageJourneySummaryIncomplete;

export function journeyContextToMiniMortgageInput(
  context: MortgageJourneyContext
): MiniMortgageInput {
  return {
    propertyPriceCzk: context.propertyValueCzk,
    ownFundsCzk: context.ownFundsCzk,
    termYears: context.termYears,
    annualRatePercent: context.modelRatePercent,
    purpose: context.purpose,
    fixationMonths: context.fixationMonths,
  };
}

export function formatFixationMonthsCs(fixationMonths: number): string {
  const years = fixationMonths / 12;
  if (years === 1) return "1 rok";
  if (years >= 2 && years <= 4) return `${years} roky`;
  return `${years} let`;
}

/** Whether URL/context carries an explicit user calculation (not bare /sazby defaults). */
export function hasExplicitMortgageJourney(
  journey: MortgageJourneyParseResult
): boolean {
  return !journey.fromDefaults && journey.paramErrors.length === 0;
}

/**
 * Resolve summary for UI. Returns incomplete state instead of misleading defaults.
 */
export function resolveMortgageJourneySummary(
  journey: MortgageJourneyParseResult
): MortgageJourneySummary {
  const editHref = buildCalculatorHref(journey.context);

  if (journey.fromDefaults) {
    return {
      status: "incomplete",
      message:
        "Zatím nemáme váš výpočet. Nejdřív zadejte údaje v hypoteční kalkulačce — pak uvidíte sazby pro stejné parametry.",
      editHref,
    };
  }

  if (journey.paramErrors.length > 0) {
    return {
      status: "incomplete",
      message:
        "Odkaz neobsahuje kompletní výpočet. Opravte údaje v kalkulačce a znovu zobrazte sazby.",
      editHref,
    };
  }

  const input = journeyContextToMiniMortgageInput(journey.context);
  const validation = validateMiniMortgageInput(input);
  if (!validation.valid) {
    return {
      status: "incomplete",
      message: validation.reason ?? "Doplňte údaje pro výpočet hypotéky.",
      editHref,
    };
  }

  if (journey.ltvContext.exactLtv == null || journey.ltvContext.validationError) {
    return {
      status: "incomplete",
      message:
        journey.ltvContext.validationError ??
        "LTV nelze z aktuálních údajů spočítat. Zkontrolujte cenu nemovitosti a výši úvěru.",
      editHref,
    };
  }

  const result = computeMiniMortgage(input);

  return {
    status: "ready",
    propertyValueCzk: journey.context.propertyValueCzk,
    ownFundsCzk: journey.context.ownFundsCzk,
    loanAmountCzk: journey.context.loanAmountCzk,
    termYears: journey.context.termYears,
    fixationMonths: journey.context.fixationMonths,
    fixationLabel: formatFixationMonthsCs(journey.context.fixationMonths),
    purpose: journey.context.purpose,
    purposeLabel: MORTGAGE_JOURNEY_PURPOSE_LABELS[journey.context.purpose],
    exactLtv: journey.ltvContext.exactLtv,
    exactLtvLabel: `${formatExactLtvCs(journey.ltvContext.exactLtv)}\u00a0%`,
    ltvBand: journey.ltvContext.ltvBand,
    ltvBandLabel:
      journey.ltvContext.ltvBand != null
        ? formatLtvBandLabel(journey.ltvContext.ltvBand)
        : null,
    modelMonthlyPaymentCzk: result.monthlyPaymentCzk,
    modelRatePercent: result.annualRatePercent,
    editHref,
  };
}
