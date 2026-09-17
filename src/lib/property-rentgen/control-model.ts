/**
 * Závazný kontrolní model Investičního rentgenu (ilustrativní příklad).
 * Jediný SoT pro web, grafy, komentáře a ukázkové PDF.
 *
 * Annuity: kanonicky z finance-math/core.
 * Mezivýsledky bez průběžného zaokrouhlování — zaokrouhlení jen při zobrazení.
 */

import { calculateAnnuityPayment } from "@/lib/finance-math/core";

export const CONTROL_MODEL_VERSION = "2026-09-17.v1" as const;

/** Roční provozní náklady kromě správy (dům + pojištění + daň + údržba jednotky). */
export const CONTROL_OTHER_ANNUAL_COSTS_CZK = 42_000;

export type ControlModelInputs = {
  areaM2: number;
  purchasePriceCzk: number;
  initialFitOutCzk: number;
  closingCostsCzk: number;
  /** Držená hotovostní rezerva — není spotřebovaný pořizovací náklad */
  cashReserveCzk: number;
  loanAmountCzk: number;
  /** Poměr úvěru ke kupní ceně (modelový předpoklad, ne bankovní LTV) */
  loanToPurchaseRatio: number;
  annualRatePercent: number;
  termYears: number;
  monthlyRentCzk: number;
  /** 0–1, podíl potenciálního nájmu nevybraný */
  vacancyRate: number;
  /** 0–1 z inkasovaného nájmu */
  managementFeeRate: number;
  ownerBuildingCostsAnnualCzk: number;
  insuranceAnnualCzk: number;
  propertyTaxAnnualCzk: number;
  unitMaintenanceReserveAnnualCzk: number;
};

export const CONTROL_MODEL_INPUTS: ControlModelInputs = {
  areaM2: 60,
  purchasePriceCzk: 4_200_000,
  initialFitOutCzk: 180_000,
  closingCostsCzk: 70_000,
  cashReserveCzk: 150_000,
  loanAmountCzk: 2_940_000,
  loanToPurchaseRatio: 0.7,
  annualRatePercent: 4.8,
  termYears: 30,
  monthlyRentCzk: 20_000,
  vacancyRate: 0.05,
  managementFeeRate: 0.05,
  ownerBuildingCostsAnnualCzk: 24_000,
  insuranceAnnualCzk: 3_600,
  propertyTaxAnnualCzk: 2_400,
  unitMaintenanceReserveAnnualCzk: 12_000,
};

export type ControlScenarioId = "adverse" | "base" | "favorable";

export type ControlScenarioParams = {
  id: ControlScenarioId;
  label: string;
  monthlyRentCzk: number;
  vacancyRate: number;
  annualRatePercent: number;
};

export const CONTROL_SCENARIOS: ControlScenarioParams[] = [
  {
    id: "adverse",
    label: "Nepříznivá",
    monthlyRentCzk: 18_000,
    vacancyRate: 0.1,
    annualRatePercent: 6.8,
  },
  {
    id: "base",
    label: "Základní",
    monthlyRentCzk: 20_000,
    vacancyRate: 0.05,
    annualRatePercent: 4.8,
  },
  {
    id: "favorable",
    label: "Příznivá",
    monthlyRentCzk: 21_000,
    vacancyRate: 0.02,
    annualRatePercent: 4.8,
  },
];

export type MonthAmortizationRow = {
  month: number;
  openingBalanceCzk: number;
  interestCzk: number;
  principalCzk: number;
  paymentCzk: number;
  closingBalanceCzk: number;
};

export type ControlModelResult = {
  version: string;
  inputs: ControlModelInputs;
  totalAcquisitionCostCzk: number;
  equityTowardPurchaseCzk: number;
  totalOwnCashIncludingReserveCzk: number;
  pricePerM2Czk: number;
  potentialAnnualRentCzk: number;
  vacancyLossCzk: number;
  collectedAnnualRentCzk: number;
  managementFeeCzk: number;
  otherAnnualCostsCzk: number;
  operatingSurplusAfterReserveCzk: number;
  monthlyPaymentCzk: number;
  monthlyCashFlowCzk: number;
  annualCashFlowCzk: number;
  grossYieldOnPurchase: number;
  operatingYieldOnAcquisition: number;
  cashOnCashIncludingReserve: number;
  principalPaidFirst12MonthsCzk: number;
  rentForZeroCashFlowCzk: number;
  purchasePriceForZeroCashFlowAt70LoanCzk: number;
  first12Months: MonthAmortizationRow[];
  monthlyWaterfall: Array<{ key: string; label: string; amountCzk: number }>;
  baseConclusionCs: string;
};

export type ControlScenarioResult = {
  id: ControlScenarioId;
  label: string;
  monthlyRentCzk: number;
  vacancyRate: number;
  annualRatePercent: number;
  monthlyPaymentCzk: number;
  operatingSurplusAfterReserveCzk: number;
  monthlyCashFlowCzk: number;
};

export class ControlModelValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ControlModelValidationError";
  }
}

export function validateControlModelInputs(input: ControlModelInputs): void {
  if (!(input.purchasePriceCzk > 0) || !(input.areaM2 > 0)) {
    throw new ControlModelValidationError(
      "Kupní cena a plocha musí být kladné."
    );
  }
  if (
    !Number.isFinite(input.vacancyRate) ||
    input.vacancyRate < 0 ||
    input.vacancyRate > 1
  ) {
    throw new ControlModelValidationError("Výpadek nájmu musí být 0–100 %.");
  }
  if (
    !Number.isFinite(input.managementFeeRate) ||
    input.managementFeeRate < 0 ||
    input.managementFeeRate > 1
  ) {
    throw new ControlModelValidationError("Sazba správy musí být 0–100 %.");
  }
  if (
    !Number.isFinite(input.annualRatePercent) ||
    input.annualRatePercent < 0
  ) {
    throw new ControlModelValidationError("Sazba nesmí být záporná.");
  }
  if (!Number.isFinite(input.loanAmountCzk) || input.loanAmountCzk < 0) {
    throw new ControlModelValidationError("Úvěr nesmí být záporný.");
  }
  if (
    !Number.isFinite(input.termYears) ||
    input.termYears <= 0 ||
    !Number.isInteger(input.termYears)
  ) {
    throw new ControlModelValidationError(
      "Splatnost musí být kladné celé číslo let."
    );
  }
  if (
    input.monthlyRentCzk != null &&
    (!Number.isFinite(input.monthlyRentCzk) || input.monthlyRentCzk < 0)
  ) {
    throw new ControlModelValidationError(
      "Chybějící nájem není nula — zadejte nezápornou hodnotu, nebo nájem neuveďte."
    );
  }
}

function otherAnnualCosts(input: ControlModelInputs): number {
  return (
    input.ownerBuildingCostsAnnualCzk +
    input.insuranceAnnualCzk +
    input.propertyTaxAnnualCzk +
    input.unitMaintenanceReserveAnnualCzk
  );
}

export function computeOperatingSurplusAfterReserve(args: {
  monthlyRentCzk: number;
  vacancyRate: number;
  managementFeeRate: number;
  otherAnnualCostsCzk: number;
}): {
  potentialAnnualRentCzk: number;
  vacancyLossCzk: number;
  collectedAnnualRentCzk: number;
  managementFeeCzk: number;
  operatingSurplusAfterReserveCzk: number;
} {
  const potentialAnnualRentCzk = args.monthlyRentCzk * 12;
  const vacancyLossCzk = potentialAnnualRentCzk * args.vacancyRate;
  const collectedAnnualRentCzk = potentialAnnualRentCzk - vacancyLossCzk;
  const managementFeeCzk = collectedAnnualRentCzk * args.managementFeeRate;
  const operatingSurplusAfterReserveCzk =
    collectedAnnualRentCzk - managementFeeCzk - args.otherAnnualCostsCzk;
  return {
    potentialAnnualRentCzk,
    vacancyLossCzk,
    collectedAnnualRentCzk,
    managementFeeCzk,
    operatingSurplusAfterReserveCzk,
  };
}

/** Měsíční anuita — zero loan → 0; zero rate → L/n via finance-math. */
export function computeMonthlyAnnuity(
  loanAmountCzk: number,
  annualRatePercent: number,
  termYears: number
): number {
  if (loanAmountCzk === 0) return 0;
  return calculateAnnuityPayment(loanAmountCzk, annualRatePercent, termYears);
}

export function amortizeFirstMonths(
  loanAmountCzk: number,
  annualRatePercent: number,
  termYears: number,
  months: number
): { rows: MonthAmortizationRow[]; principalPaidCzk: number } {
  const payment = computeMonthlyAnnuity(
    loanAmountCzk,
    annualRatePercent,
    termYears
  );
  const r = annualRatePercent / 100 / 12;
  const rows: MonthAmortizationRow[] = [];
  let balance = loanAmountCzk;
  let principalPaidCzk = 0;

  for (let m = 1; m <= months; m += 1) {
    if (balance <= 0) break;
    const interest = r === 0 ? 0 : balance * r;
    const principal = Math.min(Math.max(0, payment - interest), balance);
    const closing = balance - principal;
    rows.push({
      month: m,
      openingBalanceCzk: balance,
      interestCzk: interest,
      principalCzk: principal,
      paymentCzk: payment,
      closingBalanceCzk: closing,
    });
    principalPaidCzk += principal;
    balance = closing;
  }

  return { rows, principalPaidCzk };
}

/**
 * Nájem pro nulový CF:
 * (12A + ostatní roční náklady) / (12 × obsazenost × (1 − správa))
 */
export function rentForZeroCashFlow(args: {
  monthlyPaymentCzk: number;
  otherAnnualCostsCzk: number;
  vacancyRate: number;
  managementFeeRate: number;
}): number {
  const occupancy = 1 - args.vacancyRate;
  const netFactor = occupancy * (1 - args.managementFeeRate);
  if (netFactor <= 0) return Number.POSITIVE_INFINITY;
  return (
    (12 * args.monthlyPaymentCzk + args.otherAnnualCostsCzk) / (12 * netFactor)
  );
}

/**
 * Cenová hranice nulového CF při L = 0,70P (úvěr se mění s cenou).
 * A(P) = provozní_přebytek/12; L = 0,7P; řešíme P z anuity.
 */
export function purchasePriceForZeroCashFlowAtLoanRatio(args: {
  operatingSurplusAfterReserveCzk: number;
  annualRatePercent: number;
  termYears: number;
  loanToPurchaseRatio: number;
}): number {
  const targetPayment = args.operatingSurplusAfterReserveCzk / 12;
  if (targetPayment <= 0 || args.loanToPurchaseRatio <= 0) {
    return Number.NaN;
  }
  const r = args.annualRatePercent / 100 / 12;
  const n = args.termYears * 12;
  let maxLoan: number;
  if (r === 0) {
    maxLoan = targetPayment * n;
  } else {
    maxLoan = (targetPayment * (1 - Math.pow(1 + r, -n))) / r;
  }
  return maxLoan / args.loanToPurchaseRatio;
}

export function runControlModel(
  input: ControlModelInputs = CONTROL_MODEL_INPUTS
): ControlModelResult {
  validateControlModelInputs(input);

  const totalAcquisitionCostCzk =
    input.purchasePriceCzk + input.initialFitOutCzk + input.closingCostsCzk;
  const equityTowardPurchaseCzk = input.purchasePriceCzk - input.loanAmountCzk;
  const totalOwnCashIncludingReserveCzk =
    equityTowardPurchaseCzk +
    input.initialFitOutCzk +
    input.closingCostsCzk +
    input.cashReserveCzk;

  const other = otherAnnualCosts(input);
  const ops = computeOperatingSurplusAfterReserve({
    monthlyRentCzk: input.monthlyRentCzk,
    vacancyRate: input.vacancyRate,
    managementFeeRate: input.managementFeeRate,
    otherAnnualCostsCzk: other,
  });

  const monthlyPaymentCzk = computeMonthlyAnnuity(
    input.loanAmountCzk,
    input.annualRatePercent,
    input.termYears
  );
  const monthlyCashFlowCzk =
    ops.operatingSurplusAfterReserveCzk / 12 - monthlyPaymentCzk;
  const annualCashFlowCzk = monthlyCashFlowCzk * 12;

  const amort = amortizeFirstMonths(
    input.loanAmountCzk,
    input.annualRatePercent,
    input.termYears,
    12
  );

  const rentBreakEven = rentForZeroCashFlow({
    monthlyPaymentCzk,
    otherAnnualCostsCzk: other,
    vacancyRate: input.vacancyRate,
    managementFeeRate: input.managementFeeRate,
  });

  const priceBoundary = purchasePriceForZeroCashFlowAtLoanRatio({
    operatingSurplusAfterReserveCzk: ops.operatingSurplusAfterReserveCzk,
    annualRatePercent: input.annualRatePercent,
    termYears: input.termYears,
    loanToPurchaseRatio: input.loanToPurchaseRatio,
  });

  const vacancyMonthly = (input.monthlyRentCzk * input.vacancyRate);
  const collectedMonthly = input.monthlyRentCzk - vacancyMonthly;
  const managementMonthly = collectedMonthly * input.managementFeeRate;

  return {
    version: CONTROL_MODEL_VERSION,
    inputs: input,
    totalAcquisitionCostCzk,
    equityTowardPurchaseCzk,
    totalOwnCashIncludingReserveCzk,
    pricePerM2Czk: input.purchasePriceCzk / input.areaM2,
    potentialAnnualRentCzk: ops.potentialAnnualRentCzk,
    vacancyLossCzk: ops.vacancyLossCzk,
    collectedAnnualRentCzk: ops.collectedAnnualRentCzk,
    managementFeeCzk: ops.managementFeeCzk,
    otherAnnualCostsCzk: other,
    operatingSurplusAfterReserveCzk: ops.operatingSurplusAfterReserveCzk,
    monthlyPaymentCzk,
    monthlyCashFlowCzk,
    annualCashFlowCzk,
    grossYieldOnPurchase:
      ops.potentialAnnualRentCzk / input.purchasePriceCzk,
    operatingYieldOnAcquisition:
      ops.operatingSurplusAfterReserveCzk / totalAcquisitionCostCzk,
    cashOnCashIncludingReserve:
      annualCashFlowCzk / totalOwnCashIncludingReserveCzk,
    principalPaidFirst12MonthsCzk: amort.principalPaidCzk,
    rentForZeroCashFlowCzk: rentBreakEven,
    purchasePriceForZeroCashFlowAt70LoanCzk: priceBoundary,
    first12Months: amort.rows,
    monthlyWaterfall: [
      { key: "rent", label: "Nájem", amountCzk: input.monthlyRentCzk },
      { key: "vacancy", label: "Výpadek", amountCzk: -vacancyMonthly },
      { key: "mgmt", label: "Správa", amountCzk: -managementMonthly },
      {
        key: "building",
        label: "Náklady na dům",
        amountCzk: -input.ownerBuildingCostsAnnualCzk / 12,
      },
      {
        key: "insurance",
        label: "Pojištění",
        amountCzk: -input.insuranceAnnualCzk / 12,
      },
      {
        key: "tax",
        label: "Daň z nemovitých věcí",
        amountCzk: -input.propertyTaxAnnualCzk / 12,
      },
      {
        key: "maint",
        label: "Rezerva na údržbu",
        amountCzk: -input.unitMaintenanceReserveAnnualCzk / 12,
      },
      { key: "debt", label: "Splátka úvěru", amountCzk: -monthlyPaymentCzk },
      { key: "net", label: "Peněžní tok", amountCzk: monthlyCashFlowCzk },
    ],
    baseConclusionCs: buildBaseConclusionCs({
      monthlyCashFlowCzk,
      input,
    }),
  };
}

function buildBaseConclusionCs(args: {
  monthlyCashFlowCzk: number;
  input: ControlModelInputs;
}): string {
  const cf = args.monthlyCashFlowCzk;
  const cfAbs = Math.abs(cf);
  const cfRounded = Math.round(cfAbs);
  const isControlDemo =
    args.input.purchasePriceCzk === CONTROL_MODEL_INPUTS.purchasePriceCzk &&
    args.input.monthlyRentCzk === CONTROL_MODEL_INPUTS.monthlyRentCzk &&
    args.input.loanAmountCzk === CONTROL_MODEL_INPUTS.loanAmountCzk;

  const scenarios = isControlDemo
    ? runControlScenarios(args.input)
    : runRelativeScenarios(args.input);
  const adverse = scenarios.find((s) => s.id === "adverse");
  const adverseAbs =
    adverse != null ? Math.round(Math.abs(adverse.monthlyCashFlowCzk)) : null;

  if (cf < -0.02) {
    return `Nájem při zadaném financování nepokrývá všechny modelové výdaje a rezervu na údržbu. Průměrný doplatek vychází přibližně ${cfRounded.toLocaleString("cs-CZ")} Kč měsíčně před daní z příjmů.${
      adverseAbs != null
        ? ` Při kombinaci nižšího nájmu, vyššího výpadku a dražšího úvěru dosahuje přibližně ${adverseAbs.toLocaleString("cs-CZ")} Kč.`
        : ""
    } Pro rozhodnutí je podstatná vlastní rezerva, podmínky koupě a doložení skutečných nákladů.`;
  }
  if (cf > 0.02) {
    return `Při zadaných předpokladech vychází průměrný modelový přebytek přibližně ${cfRounded.toLocaleString("cs-CZ")} Kč měsíčně před daní z příjmů. Nejde o zaručený výnos — výpadek nájmu a opravy přicházejí nerovnoměrně. Pro rozhodnutí je podstatná vlastní rezerva, podmínky koupě a doložení skutečných nákladů.`;
  }
  return `Při zadaných předpokladech je modelový peněžní tok přibližně na nule před daní z příjmů. Nulový tok není bezpečnostní marže. Pro rozhodnutí je podstatná vlastní rezerva, podmínky koupě a doložení skutečných nákladů.`;
}

export function runControlScenarios(
  base: ControlModelInputs = CONTROL_MODEL_INPUTS
): ControlScenarioResult[] {
  return CONTROL_SCENARIOS.map((s) => {
    const other = otherAnnualCosts(base);
    const ops = computeOperatingSurplusAfterReserve({
      monthlyRentCzk: s.monthlyRentCzk,
      vacancyRate: s.vacancyRate,
      managementFeeRate: base.managementFeeRate,
      otherAnnualCostsCzk: other,
    });
    const monthlyPaymentCzk = computeMonthlyAnnuity(
      base.loanAmountCzk,
      s.annualRatePercent,
      base.termYears
    );
    return {
      id: s.id,
      label: s.label,
      monthlyRentCzk: s.monthlyRentCzk,
      vacancyRate: s.vacancyRate,
      annualRatePercent: s.annualRatePercent,
      monthlyPaymentCzk,
      operatingSurplusAfterReserveCzk: ops.operatingSurplusAfterReserveCzk,
      monthlyCashFlowCzk:
        ops.operatingSurplusAfterReserveCzk / 12 - monthlyPaymentCzk,
    };
  });
}

/**
 * Scénáře odvozené od zákaznického nájmu (ne absolutní kontrolní 18/20/21 tis.).
 * Pouze pro zákaznický výstup — kontrolní ukázka dál používá CONTROL_SCENARIOS.
 */
export function runRelativeScenarios(
  base: ControlModelInputs
): ControlScenarioResult[] {
  const relative: ControlScenarioParams[] = [
    {
      id: "adverse",
      label: "Nepříznivá",
      monthlyRentCzk: Math.round(base.monthlyRentCzk * 0.9),
      vacancyRate: 0.1,
      annualRatePercent: base.annualRatePercent + 2,
    },
    {
      id: "base",
      label: "Základní",
      monthlyRentCzk: base.monthlyRentCzk,
      vacancyRate: base.vacancyRate,
      annualRatePercent: base.annualRatePercent,
    },
    {
      id: "favorable",
      label: "Příznivá",
      monthlyRentCzk: Math.round(base.monthlyRentCzk * 1.05),
      vacancyRate: 0.02,
      annualRatePercent: base.annualRatePercent,
    },
  ];

  return relative.map((s) => {
    const other = otherAnnualCosts(base);
    const ops = computeOperatingSurplusAfterReserve({
      monthlyRentCzk: s.monthlyRentCzk,
      vacancyRate: s.vacancyRate,
      managementFeeRate: base.managementFeeRate,
      otherAnnualCostsCzk: other,
    });
    const monthlyPaymentCzk = computeMonthlyAnnuity(
      base.loanAmountCzk,
      s.annualRatePercent,
      base.termYears
    );
    return {
      id: s.id,
      label: s.label,
      monthlyRentCzk: s.monthlyRentCzk,
      vacancyRate: s.vacancyRate,
      annualRatePercent: s.annualRatePercent,
      monthlyPaymentCzk,
      operatingSurplusAfterReserveCzk: ops.operatingSurplusAfterReserveCzk,
      monthlyCashFlowCzk:
        ops.operatingSurplusAfterReserveCzk / 12 - monthlyPaymentCzk,
    };
  });
}

/** Display helpers — round only at the edge. */
export function formatModelCzk(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toLocaleString("cs-CZ", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}\u00a0Kč`;
}

export function formatModelPct(ratio: number, digits = 2): string {
  if (!Number.isFinite(ratio)) return "—";
  return `${(ratio * 100).toLocaleString("cs-CZ", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}\u00a0%`;
}

/** Golden expected values from the 17. 9. 2026 control brief (full float). */
export const CONTROL_GOLDEN = {
  monthlyPaymentCzk: 15_425.16,
  monthlyCashFlowCzk: -875.16,
  annualCashFlowCzk: -10_501.94,
  operatingSurplusAfterReserveCzk: 174_600,
  principalPaidFirst12MonthsCzk: 44_962.56,
  rentForZeroCashFlowCzk: 20_969.71,
  purchasePriceForZeroCashFlowAt70LoanCzk: 3_961_708.95,
  grossYieldOnPurchase: 0.057143,
  operatingYieldOnAcquisition: 0.039236,
  cashOnCashIncludingReserve: -0.006326,
  adverseMonthlyPaymentCzk: 19_166.6,
  adverseMonthlyCashFlowCzk: -7_276.6,
  favorableMonthlyCashFlowCzk: 625.84,
  pricePerM2Czk: 70_000,
  totalAcquisitionCostCzk: 4_450_000,
  totalOwnCashIncludingReserveCzk: 1_660_000,
} as const;
