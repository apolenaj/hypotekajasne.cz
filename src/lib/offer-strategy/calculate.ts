import { calculateInvestment } from "@/lib/investment-engine";
import type { InvestmentEngineInput } from "@/lib/investment-engine";
import type {
  OfferInvestmentSnapshot,
  OfferStrategyInput,
  OfferStrategyOutput,
  ScenarioSliderPoint,
} from "@/lib/offer-strategy/types";

function roundCzk(n: number): number {
  return Math.round(n / 10_000) * 10_000;
}

function openingDiscount(input: OfferStrategyInput): number {
  let pct = 0.02;
  if (input.daysOnMarket != null) {
    if (input.daysOnMarket > 90) pct = 0.05;
    else if (input.daysOnMarket > 45) pct = 0.03;
    else if (input.daysOnMarket < 14) pct = 0.01;
  }
  if (input.condition === "needs_work") pct += 0.02;
  if (input.condition === "good") pct -= 0.005;
  if (input.urgency === "high") pct -= 0.015;
  if (input.urgency === "low") pct += 0.01;
  if (input.competition.verified && input.competition.note) pct += 0.01;
  return Math.max(0.005, Math.min(0.08, pct));
}

export function buildOfferStrategyOutput(
  input: OfferStrategyInput
): OfferStrategyOutput {
  const discount = openingDiscount(input);
  const opening = roundCzk(input.fairValueLowCzk * (1 - discount));
  const openingHigh = roundCzk(input.fairValueLowCzk);
  const target = roundCzk(
    Math.min(
      (input.fairValueLowCzk + input.fairValueHighCzk) / 2,
      input.askingPriceCzk
    )
  );

  let maximum = roundCzk(input.fairValueHighCzk * 1.02);
  if (input.targetNetYield != null && input.rentMonthlyCzk > 0) {
    const maxFromYield = findMaxPriceForNetYield(input, input.targetNetYield);
    if (maxFromYield != null) {
      maximum = roundCzk(Math.min(maximum, maxFromYield));
    }
  }

  const margin = input.askingPriceCzk - opening;
  const marginPct =
    input.askingPriceCzk > 0 ? (margin / input.askingPriceCzk) * 100 : 0;

  const snapTarget = investmentSnapshot(input, target);
  const snapOpening = investmentSnapshot(input, opening);

  return {
    openingRange: { lowCzk: opening, highCzk: openingHigh },
    openingScenarioCzk: opening,
    targetPriceCzk: target,
    maximumEconomicallySensibleCzk: maximum,
    negotiationMarginCzk: Math.max(0, margin),
    negotiationMarginPercent: Math.round(marginPct * 10) / 10,
    effectOnYield: `Při cíli ${fmt(target)} MODEL čistý výnos ~${pct(snapTarget.netYield)} (opening ~${pct(snapOpening.netYield)}).`,
    effectOnCashFlow: `Měsíční CF MODEL: cíl ${fmt(snapTarget.monthlyCashFlowCzk)}, opening ${fmt(snapOpening.monthlyCashFlowCzk)}.`,
    keyQuestions: buildKeyQuestions(input),
    scenarios: [
      { label: "Opening", priceCzk: opening, role: "opening", claimKind: "MODEL" },
      { label: "Target", priceCzk: target, role: "target", claimKind: "MODEL" },
      { label: "Maximum", priceCzk: maximum, role: "maximum", claimKind: "MODEL" },
    ],
    claimKind: "MODEL",
    disclaimer:
      "Orientační strategie nabídky — ne znalecký posudek ani garantovaná valuace. Negociační rozhodnutí je vždy na vás.",
  };
}

function buildKeyQuestions(input: OfferStrategyInput): string[] {
  const q = [
    "Jak dlouho je nemovitost na trhu a proč dosud neprodána? (faktická otázka, ne nátlak)",
    "Jsou známé vady nebo plánované investice do domu/SVJ?",
    "Je součástí ceny vybavení, parkování nebo sklep — co přesně?",
    "Jaká je situace s nájemníky, pokud jde o investici?",
    "Jaký je termín předání a stav financování prodávajícího?",
  ];
  if (input.priceHistory.length > 1) {
    q.push("Proč došlo ke změně ceny v historii inzerce?");
  }
  if (input.comparables.length > 0) {
    q.push("Jak prodejce vysvětluje rozdíl oproti srovnatelným inzerátům?");
  }
  if (input.competition.verified) {
    q.push(
      `Ověřená konkurence: ${input.competition.note} — jak ovlivňuje váš timing?`
    );
  } else {
    q.push(
      "Máte ověřenou informaci o jiných zájemcích? Bez ověření neargumentujte „konkurencí“."
    );
  }
  if (input.condition === "needs_work") {
    q.push("Jaký je odhad nutných oprav a kdo je hradí před předáním?");
  }
  return q;
}

export function investmentSnapshot(
  input: OfferStrategyInput,
  purchasePriceCzk: number
): OfferInvestmentSnapshot {
  const down = (purchasePriceCzk * input.downPaymentPercent) / 100;
  const loan = purchasePriceCzk - down;
  const engineInput: InvestmentEngineInput = {
    purchasePrice: purchasePriceCzk,
    downPayment: down,
    loan,
    rate: loan > 0 ? input.mortgageRatePercent : null,
    termYears: input.termYears,
    rentMonthly: input.rentMonthlyCzk,
    vacancyRate: 0.05,
    managementFeeRate: 0.08,
    serviceChargesAnnual: 24_000,
    insuranceAnnual: 6_000,
    propertyTaxAnnual: 0,
    incomeTaxRate: 0.15,
    maintenanceAnnual: purchasePriceCzk * 0.01,
    capexReserveAnnual: 12_000,
    furnishing: 0,
    acquisitionCosts: purchasePriceCzk * 0.04,
    sellingCostRate: 0.03,
    annualRentGrowth: 0.02,
    annualPropertyGrowth: 0.02,
    annualFxReturn: 0,
    holdingPeriodYears: input.holdingYears,
  };
  const result = calculateInvestment(engineInput, "base");
  return {
    purchasePriceCzk,
    grossYield: result.grossYield,
    netYield: result.netYield,
    monthlyCashFlowCzk: result.monthlyCashFlow,
    irr: result.irr,
    ownFundsCzk: result.initialEquity,
    claimKind: "MODEL",
  };
}

function findMaxPriceForNetYield(
  input: OfferStrategyInput,
  target: number
): number | null {
  let lo = input.fairValueLowCzk * 0.8;
  let hi = input.askingPriceCzk * 1.1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    const snap = investmentSnapshot(input, mid);
    if (snap.netYield >= target) lo = mid;
    else hi = mid;
  }
  return lo;
}

export function buildScenarioSlider(
  input: OfferStrategyInput,
  output: OfferStrategyOutput,
  steps = 12
): ScenarioSliderPoint[] {
  const min = output.openingScenarioCzk;
  const max = Math.max(
    min,
    output.targetPriceCzk,
    output.maximumEconomicallySensibleCzk
  );
  const step = Math.max(10_000, Math.round((max - min) / steps / 10_000) * 10_000);
  const points: ScenarioSliderPoint[] = [];
  for (let p = min; p <= max; p += step) {
    points.push({ priceCzk: p, snapshot: investmentSnapshot(input, p) });
  }
  if (points.at(-1)?.priceCzk !== max) {
    points.push({ priceCzk: max, snapshot: investmentSnapshot(input, max) });
  }
  return points;
}

function fmt(n: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(n);
}

function pct(d: number): string {
  return `${(d * 100).toFixed(2).replace(".", ",")} %`;
}

export { fmt as formatOfferCzk, pct as formatOfferPct };
