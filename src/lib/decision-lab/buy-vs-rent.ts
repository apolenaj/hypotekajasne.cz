/**
 * Prezentace koupě vs. nájem pro současné UI.
 * Matematika je jen v `simulateRentVsBuy` — tento soubor ji nepřepočítává.
 */

import type { ChartMeta } from "@/lib/decision-lab/types";
import {
  simulateRentVsBuy,
  type RentVsBuyInputs,
  type RentVsBuyYearPoint as EngineYear,
} from "@/lib/decision-lab/rent-vs-buy-cashflow";

export type BuyVsRentInput = {
  purchasePrice: number;
  monthlyRent: number;
  mortgageRate: number | null;
  downPayment: number;
  /** Roční údržba jako podíl z kupní ceny — UI zatím zadává %, engine chce Kč/měsíc */
  maintenanceRate: number;
  transactionCostRate: number;
  annualPropertyGrowth: number;
  annualRentGrowth: number;
  alternativeEquityReturn: number;
  horizonYears: number;
  termYears: number;
};

export type BuyVsRentYearPoint = {
  year: number;
  label: string;
  propertyValue: number;
  debtRemaining: number;
  buyNetWorth: number;
  rentNetWorth: number;
  monthlyRentInYear: number;
  rentPaidThisYear: number;
  rentCumulativeCashOut: number;
  interestPaidThisYear: number;
  principalPaidThisYear: number;
  maintenanceThisYear: number;
  buyCumulativeEconomicCost: number;
  buyCumulativeCashOut: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
  cumulativeMaintenance: number;
};

export type BuyVsRentBreakdown = {
  horizonYears: number;
  initialDownPayment: number;
  transactionCosts: number;
  totalMortgagePayments: number;
  totalInterest: number;
  totalPrincipalPaid: number;
  totalMaintenance: number;
  debtRemaining: number;
  propertyValue: number;
  buyEquity: number;
  buyCumulativeEconomicCost: number;
  buyCumulativeCashOut: number;
  totalRentPaid: number;
  averageMonthlyRent: number;
  rentAtHorizonMonthly: number;
  initialInvestedCapital: number;
  portfolioValue: number;
  portfolioGain: number;
};

export type BuyVsRentToday = {
  monthlyMortgage: number;
  monthlyMaintenance: number;
  monthlyBuyTotal: number;
  monthlyRent: number;
  monthlyDifference: number;
  loanAmount: number;
  ltvPercent: number;
};

export type BuyVsRentSensitivityItem = {
  id: string;
  label: string;
  deltaNetWorthGap: number;
};

export type BuyVsRentResult = {
  series: BuyVsRentYearPoint[];
  today: BuyVsRentToday;
  breakdown: BuyVsRentBreakdown;
  buyAdvantageFromYear: number | null;
  rentAdvantageFromYear: number | null;
  costBreakEvenYear: number | null;
  costBreakEvenLeader: "buy" | "rent" | null;
  netWorthBreakEvenYear: number | null;
  netWorthBreakEvenLeader: "buy" | "rent" | null;
  finalLeader: "buy" | "rent" | "tie";
  finalGap: number;
  verdictSentence: string;
  costBreakEvenSentence: string;
  netWorthBreakEvenSentence: string;
  assumptions: string[];
  chartMeta: ChartMeta;
  costChartMeta: ChartMeta;
  sensitivity: BuyVsRentSensitivityItem[];
};

function toEngineInput(input: BuyVsRentInput): RentVsBuyInputs {
  const price = Math.max(0, Number.isFinite(input.purchasePrice) ? input.purchasePrice : 0);
  const maintRate = Math.max(0, input.maintenanceRate || 0);
  return {
    propertyPrice: price,
    downPayment: input.downPayment,
    annualMortgageRatePct:
      input.mortgageRate != null && Number.isFinite(input.mortgageRate)
        ? Math.max(0, input.mortgageRate)
        : 0,
    termYears: input.termYears,
    monthlyOwnershipCosts: (price * maintRate) / 12,
    monthlyRent: input.monthlyRent,
    horizonYears: input.horizonYears,
    alternativeAnnualReturn: input.alternativeEquityReturn,
    annualPropertyGrowth: input.annualPropertyGrowth,
    annualRentGrowth: input.annualRentGrowth,
    transactionCostRate: input.transactionCostRate,
  };
}

function round(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
}

function mapYear(p: EngineYear): BuyVsRentYearPoint {
  return {
    year: p.year,
    label: p.label,
    propertyValue: round(p.propertyValue),
    debtRemaining: round(p.debtRemaining),
    buyNetWorth: round(p.buyerNetWorth),
    rentNetWorth: round(p.tenantNetWorth),
    monthlyRentInYear: round(p.monthlyRentInYear),
    rentPaidThisYear: round(p.rentPaidThisYear),
    rentCumulativeCashOut: round(p.tenantSunkCosts),
    interestPaidThisYear: round(p.interestPaidThisYear),
    principalPaidThisYear: round(p.principalPaidThisYear),
    maintenanceThisYear: round(p.ownershipPaidThisYear),
    buyCumulativeEconomicCost: round(p.buyerSunkCosts),
    buyCumulativeCashOut: round(p.buyerCumulativeCashOut),
    cumulativeInterest: round(p.cumulativeInterest),
    cumulativePrincipal: round(p.cumulativePrincipal),
    cumulativeMaintenance: round(p.cumulativeOwnership),
  };
}

function firstCrossover(
  series: BuyVsRentYearPoint[],
  left: (p: BuyVsRentYearPoint) => number,
  right: (p: BuyVsRentYearPoint) => number
): { year: number; leader: "buy" | "rent" } | null {
  let prev = 0;
  for (const p of series) {
    const sign = Math.sign(left(p) - right(p));
    if (sign !== 0 && sign !== prev) {
      return { year: p.year, leader: sign > 0 ? "buy" : "rent" };
    }
    if (sign !== 0) prev = sign;
  }
  return null;
}

function gapOf(input: BuyVsRentInput): number {
  const r = simulateRentVsBuy(toEngineInput(input));
  return r.final.buyerNetWorth - r.final.tenantNetWorth;
}

export function simulateBuyVsRent(input: BuyVsRentInput): BuyVsRentResult {
  const engine = simulateRentVsBuy(toEngineInput(input));
  const series = engine.years.map(mapYear);
  const last = series[series.length - 1]!;
  const horizon = last.year;
  const finalGap = last.buyNetWorth - last.rentNetWorth;
  const finalLeader: "buy" | "rent" | "tie" =
    Math.abs(finalGap) < 1 ? "tie" : finalGap > 0 ? "buy" : "rent";

  let buyAdvantageFromYear: number | null = null;
  let rentAdvantageFromYear: number | null = null;
  for (const p of series) {
    if (p.buyNetWorth > p.rentNetWorth && buyAdvantageFromYear == null) {
      buyAdvantageFromYear = p.year;
    }
    if (p.rentNetWorth > p.buyNetWorth && rentAdvantageFromYear == null) {
      rentAdvantageFromYear = p.year;
    }
  }

  const nwCross = firstCrossover(
    series,
    (p) => p.buyNetWorth,
    (p) => p.rentNetWorth
  );
  let netWorthBreakEvenYear: number | null = null;
  let netWorthBreakEvenLeader: "buy" | "rent" | null = null;
  if (finalLeader === "buy" && buyAdvantageFromYear != null) {
    netWorthBreakEvenYear = buyAdvantageFromYear;
    netWorthBreakEvenLeader = "buy";
  } else if (finalLeader === "rent" && rentAdvantageFromYear != null) {
    netWorthBreakEvenYear = rentAdvantageFromYear;
    netWorthBreakEvenLeader = "rent";
  } else if (nwCross) {
    netWorthBreakEvenYear = nwCross.year;
    netWorthBreakEvenLeader = nwCross.leader;
  }

  const costCross = firstCrossover(
    series,
    (p) => p.buyCumulativeEconomicCost,
    (p) => p.rentCumulativeCashOut
  );

  const down = Math.min(
    Math.max(0, input.downPayment),
    Math.max(0, input.purchasePrice)
  );

  const today: BuyVsRentToday = {
    monthlyMortgage: round(engine.monthlyMortgage),
    monthlyMaintenance: round(engine.monthlyOwnershipCosts),
    monthlyBuyTotal: round(engine.monthlyBuyOutflow),
    monthlyRent: round(engine.monthlyRent),
    monthlyDifference: round(engine.monthlyBuyOutflow - engine.monthlyRent),
    loanAmount: round(engine.loanAmount),
    ltvPercent: Math.round(engine.ltvPercent * 10) / 10,
  };

  const breakdown: BuyVsRentBreakdown = {
    horizonYears: horizon,
    initialDownPayment: round(down),
    transactionCosts: round(engine.transactionCosts),
    totalMortgagePayments: round(
      engine.final.cumulativeInterest + engine.final.cumulativePrincipal
    ),
    totalInterest: round(engine.final.cumulativeInterest),
    totalPrincipalPaid: round(engine.final.cumulativePrincipal),
    totalMaintenance: round(engine.final.cumulativeOwnership),
    debtRemaining: last.debtRemaining,
    propertyValue: last.propertyValue,
    buyEquity: last.buyNetWorth,
    buyCumulativeEconomicCost: last.buyCumulativeEconomicCost,
    buyCumulativeCashOut: last.buyCumulativeCashOut,
    totalRentPaid: last.rentCumulativeCashOut,
    averageMonthlyRent:
      horizon > 0 ? round(last.rentCumulativeCashOut / (horizon * 12)) : 0,
    rentAtHorizonMonthly: last.monthlyRentInYear,
    initialInvestedCapital: round(engine.initialTenantCapital),
    portfolioValue: last.rentNetWorth,
    portfolioGain: round(last.rentNetWorth - engine.initialTenantCapital),
  };

  const sensitivity = buildSensitivity(input, finalGap);

  return {
    series,
    today,
    breakdown,
    buyAdvantageFromYear,
    rentAdvantageFromYear,
    costBreakEvenYear: costCross?.year ?? null,
    costBreakEvenLeader: costCross?.leader ?? null,
    netWorthBreakEvenYear,
    netWorthBreakEvenLeader,
    finalLeader,
    finalGap,
    verdictSentence: buildWealthVerdict(
      finalLeader,
      finalGap,
      horizon,
      netWorthBreakEvenYear,
      buyAdvantageFromYear,
      rentAdvantageFromYear
    ),
    costBreakEvenSentence: buildCostBreakEvenSentence(
      costCross?.year ?? null,
      costCross?.leader ?? null,
      horizon,
      last
    ),
    netWorthBreakEvenSentence: buildNetWorthBreakEvenSentence(
      netWorthBreakEvenYear,
      netWorthBreakEvenLeader,
      horizon,
      finalLeader
    ),
    assumptions: [
      `Cena ${round(input.purchasePrice).toLocaleString("cs-CZ")} Kč, vlastní prostředky ${round(down).toLocaleString("cs-CZ")} Kč, úvěr ${today.loanAmount.toLocaleString("cs-CZ")} Kč (LTV ${today.ltvPercent} %).`,
      `Sazba ${today.loanAmount > 0 ? `${input.mortgageRate ?? 0} %` : "bez hypotéky"}, splatnost ${input.termYears} let, horizont ${horizon} let.`,
      `Provoz ${today.monthlyMaintenance.toLocaleString("cs-CZ")} Kč/měsíc, transakční náklady ${round(engine.transactionCosts).toLocaleString("cs-CZ")} Kč.`,
      `Růst hodnoty ${((input.annualPropertyGrowth || 0) * 100).toFixed(1)} %, růst nájemného ${((input.annualRentGrowth || 0) * 100).toFixed(1)} %.`,
      `Alternativní výnos ${(input.alternativeEquityReturn * 100).toFixed(1)} % p.a., měsíční kapitalizace.`,
      "Jistina hypotéky není utopený náklad. Akontace kupujícího je ve vlastním kapitálu nemovitosti, u nájemníka startuje portfolio spolu s ušetřenými transakčními náklady.",
      "Pokud je nájem dražší než splátka a provoz, portfolio nájemníka neklesá — jen se dál úročí počáteční kapitál. Úsporu v tom případě investuje kupující.",
      "Model je scénářový a orientační — není investiční doporučení ani garance budoucího vývoje.",
    ],
    chartMeta: {
      title: "Jaký majetek budu mít?",
      methodology:
        "Čisté jmění při koupi = modelová hodnota nemovitosti − zbývající hypotéka + investovaná úspora proti nájmu. Při nájmu = akontace a ušetřené transakční náklady, zhodnocené alternativním výnosem, plus investovaný kladný rozdíl cashflow. Záporný rozdíl portfolio nájemníka nesnižuje.",
      source: "Laboratoř rozhodnutí (HypotekaJasne.cz)",
      sourceUrl: null,
      statusNote:
        "MODELOVÝ VÝPOČET — výsledky závisí na vstupech, ne na historické jistotě.",
    },
    costChartMeta: {
      title: "Kolik mě bude bydlení stát?",
      methodology:
        "Utopené náklady koupě = zaplacené úroky + provoz + transakční náklady (bez jistiny a bez akontace). Náklady nájmu = skutečně zaplacené nájemné.",
      source: "Laboratoř rozhodnutí (HypotekaJasne.cz)",
      sourceUrl: null,
      statusNote:
        "Splácená jistina není ztracený náklad — zvyšuje vlastní kapitál v nemovitosti.",
    },
    sensitivity,
  };
}

function buildWealthVerdict(
  finalLeader: "buy" | "rent" | "tie",
  finalGap: number,
  horizon: number,
  breakYear: number | null,
  buyFrom: number | null,
  rentFrom: number | null
): string {
  const abs = Math.round(Math.abs(finalGap)).toLocaleString("cs-CZ");
  if (finalLeader === "tie") {
    return `Při zadaných předpokladech vychází po ${horizon} letech modelové čisté jmění u obou variant přibližně stejně.`;
  }
  const winner =
    finalLeader === "buy" ? "koupě (vlastní bydlení)" : "bydlení v nájmu";
  let extra = "";
  if (buyFrom != null && rentFrom != null && buyFrom !== rentFrom) {
    extra =
      finalLeader === "buy"
        ? ` Pořadí se v horizontu může měnit; na konci vede koupě.`
        : ` Pořadí se v horizontu může měnit; na konci vede bydlení v nájmu.`;
  } else if (breakYear != null && breakYear > 1) {
    extra = ` Vyšší čisté jmění u této varianty se v modelu objevuje od roku ${breakYear}.`;
  }
  return `Při zadaných předpokladech vychází po ${horizon} letech vyšší modelové čisté jmění u varianty ${winner} o přibližně ${abs} Kč.${extra}`;
}

function buildCostBreakEvenSentence(
  year: number | null,
  leader: "buy" | "rent" | null,
  horizon: number,
  last: BuyVsRentYearPoint
): string {
  if (year == null || leader == null) {
    return `V zadaném horizontu ${horizon} let k bodu zvratu nevratných nákladů na bydlení nedojde.`;
  }
  const who =
    leader === "buy"
      ? "nevratné náklady koupě převýší zaplacené nájemné"
      : "zaplacené nájemné převýší nevratné náklady koupě";
  return `Bod zvratu nákladů na bydlení: od roku ${year} ${who}. Na konci horizontu: koupě ${last.buyCumulativeEconomicCost.toLocaleString("cs-CZ")} Kč nevratných nákladů vs. nájem ${last.rentCumulativeCashOut.toLocaleString("cs-CZ")} Kč.`;
}

function buildNetWorthBreakEvenSentence(
  year: number | null,
  leader: "buy" | "rent" | null,
  horizon: number,
  finalLeader: "buy" | "rent" | "tie"
): string {
  if (finalLeader === "tie" || year == null || leader == null) {
    return `V zadaném horizontu ${horizon} let k jednoznačnému bodu zvratu čistého majetku nedojde.`;
  }
  const who = leader === "buy" ? "koupě (vlastní bydlení)" : "bydlení v nájmu";
  return `Bod zvratu čistého majetku: od roku ${year} vychází v modelu vyšší čisté jmění u varianty ${who}.`;
}

function buildSensitivity(
  base: BuyVsRentInput,
  baseGap: number
): BuyVsRentSensitivityItem[] {
  const items: Array<{ id: string; label: string; patch: Partial<BuyVsRentInput> }> = [
    {
      id: "rate-plus-1",
      label: "Úroková sazba +1 p. b.",
      patch: {
        mortgageRate: (base.mortgageRate ?? 0) + 1,
      },
    },
    {
      id: "price-minus-10",
      label: "Cena nemovitosti −10 %",
      patch: {
        purchasePrice: base.purchasePrice * 0.9,
        downPayment: Math.min(base.downPayment, base.purchasePrice * 0.9),
      },
    },
    {
      id: "rent-growth-plus-1",
      label: "Růst nájemného +1 p. b.",
      patch: { annualRentGrowth: base.annualRentGrowth + 0.01 },
    },
    {
      id: "prop-growth-plus-1",
      label: "Růst hodnoty +1 p. b.",
      patch: { annualPropertyGrowth: base.annualPropertyGrowth + 0.01 },
    },
    {
      id: "alt-plus-1",
      label: "Alternativní výnos +1 p. b.",
      patch: { alternativeEquityReturn: base.alternativeEquityReturn + 0.01 },
    },
  ];

  return items.map((item) => ({
    id: item.id,
    label: item.label,
    deltaNetWorthGap: Math.round(gapOf({ ...base, ...item.patch }) - baseGap),
  }));
}
