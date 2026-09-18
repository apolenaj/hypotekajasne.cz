/**
 * Koupě vs. nájem — vlastní bydlení vs. placení nájmu majiteli.
 * Odděluje cash-flow, ekonomické (nevratné) náklady a čisté jmění / equity.
 * Nejde o investiční pronájem (to řeší Investiční rentgen).
 */

import { calculateAnnuityPayment } from "@/lib/calculators";
import { remainingLoanBalance } from "@/lib/investment-engine/math";
import type { ChartMeta } from "@/lib/decision-lab/types";

export type BuyVsRentInput = {
  purchasePrice: number;
  /** Měsíční nájem, který byste platili majiteli (ne příjem) */
  monthlyRent: number;
  /** Sazba hypotéky % p.a. — null/0 = bez úroku (linear / cash) */
  mortgageRate: number | null;
  downPayment: number;
  /** Roční údržba jako podíl z kupní ceny */
  maintenanceRate: number;
  /** Transakční náklady jako podíl z kupní ceny (jednorázově) */
  transactionCostRate: number;
  annualPropertyGrowth: number;
  annualRentGrowth: number;
  /** Alternativní výnos kapitálu (opportunity cost) */
  alternativeEquityReturn: number;
  horizonYears: number;
  termYears: number;
};

export type BuyVsRentYearPoint = {
  year: number;
  label: string;
  /** Tržní hodnota nemovitosti (model) */
  propertyValue: number;
  /** Zbývající jistina */
  debtRemaining: number;
  /** Equity = hodnota − dluh */
  buyNetWorth: number;
  /** Portfolio nájemníka */
  rentNetWorth: number;
  /** Měsíční nájem v daném roce */
  monthlyRentInYear: number;
  /** Roční nájem v daném roce */
  rentPaidThisYear: number;
  /** Kumulativní zaplacené nájemné */
  rentCumulativeCashOut: number;
  /** Roční úroky hypotéky */
  interestPaidThisYear: number;
  /** Roční splacená jistina */
  principalPaidThisYear: number;
  /** Roční údržba */
  maintenanceThisYear: number;
  /** Kumulativní nevratné náklady koupě (úroky + údržba + tx) */
  buyCumulativeEconomicCost: number;
  /** Kumulativní peněžní odtok koupě (akontace + tx + splátky + údržba) */
  buyCumulativeCashOut: number;
  /** Kumulativní úroky */
  cumulativeInterest: number;
  /** Kumulativní jistina splacená */
  cumulativePrincipal: number;
  /** Kumulativní údržba */
  cumulativeMaintenance: number;
};

export type BuyVsRentBreakdown = {
  horizonYears: number;
  // Buy
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
  // Rent
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
  /** Změna rozdílu (buy NW − rent NW) na konci horizontu oproti základu */
  deltaNetWorthGap: number;
};

export type BuyVsRentResult = {
  series: BuyVsRentYearPoint[];
  today: BuyVsRentToday;
  breakdown: BuyVsRentBreakdown;
  /** První rok, kdy buy NW > rent NW */
  buyAdvantageFromYear: number | null;
  /** První rok, kdy rent NW > buy NW */
  rentAdvantageFromYear: number | null;
  /** První rok, kdy kumulativní ekonomické náklady koupě > kumulativní nájem (nebo naopak — viz costBreakEvenLeader) */
  costBreakEvenYear: number | null;
  /** Kdo má vyšší nevratné náklady od costBreakEvenYear */
  costBreakEvenLeader: "buy" | "rent" | null;
  /** První rok, kdy NW leader se změní na trvalou dominanci — viz netWorthBreakEven */
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

function safeNum(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return n;
}

function loanBalanceAtYear(
  loan: number,
  rate: number | null,
  termYears: number,
  yearsElapsed: number,
  hasInterestDebt: boolean
): number {
  if (loan <= 0) return 0;
  if (yearsElapsed <= 0) return loan;
  if (yearsElapsed >= termYears) return 0;
  if (hasInterestDebt && rate != null && rate > 0) {
    return remainingLoanBalance(loan, rate, termYears, yearsElapsed);
  }
  // Linear principal (0 % rate or cash-like amortisation)
  return Math.max(0, loan * (1 - yearsElapsed / termYears));
}

function findFirstCrossover(
  series: BuyVsRentYearPoint[],
  left: (p: BuyVsRentYearPoint) => number,
  right: (p: BuyVsRentYearPoint) => number
): { year: number; leader: "buy" | "rent" } | null {
  if (series.length === 0) return null;
  let prevSign = Math.sign(left(series[0]!) - right(series[0]!));
  // If already unequal in year 1, that is the first dominance year
  if (prevSign !== 0) {
    return {
      year: series[0]!.year,
      leader: prevSign > 0 ? "buy" : "rent",
    };
  }
  for (let i = 1; i < series.length; i++) {
    const p = series[i]!;
    const sign = Math.sign(left(p) - right(p));
    if (sign !== 0 && sign !== prevSign) {
      return { year: p.year, leader: sign > 0 ? "buy" : "rent" };
    }
    if (sign !== 0) prevSign = sign;
  }
  return null;
}

export function simulateBuyVsRent(input: BuyVsRentInput): BuyVsRentResult {
  const price = Math.max(0, safeNum(input.purchasePrice));
  const down = Math.min(Math.max(0, safeNum(input.downPayment)), price);
  const loan = Math.max(0, price - down);
  const txRate = Math.max(0, safeNum(input.transactionCostRate));
  const tx = price * txRate;
  const initialCapitalTied = down + tx;
  const horizon = Math.max(1, Math.round(safeNum(input.horizonYears)));
  const termYears = Math.max(1, Math.round(safeNum(input.termYears)));
  const monthlyRent0 = Math.max(0, safeNum(input.monthlyRent));
  const maintRate = Math.max(0, safeNum(input.maintenanceRate));
  const propGrowth = safeNum(input.annualPropertyGrowth);
  const rentGrowth = safeNum(input.annualRentGrowth);
  const altReturn = safeNum(input.alternativeEquityReturn);

  const rate =
    input.mortgageRate != null && Number.isFinite(input.mortgageRate)
      ? input.mortgageRate
      : null;

  const hasInterestDebt = loan > 0 && rate != null && rate > 0 && termYears > 0;
  const hasLoan = loan > 0 && termYears > 0;

  const monthlyMortgage = hasInterestDebt
    ? calculateAnnuityPayment(loan, rate!, termYears)
    : hasLoan
      ? loan / (termYears * 12)
      : 0;

  const annualDebt = monthlyMortgage * 12;
  const annualMaintenance = price * maintRate;
  const monthlyMaintenance = annualMaintenance / 12;
  const ltvPercent = price > 0 ? (loan / price) * 100 : 0;

  const series: BuyVsRentYearPoint[] = [];
  let buyCashOut = initialCapitalTied;
  let rentCashOut = 0;
  let rentPortfolio = initialCapitalTied;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  let cumulativeMaintenance = 0;
  let buyEconomic = tx; // tx is economic (sunk); down payment is equity, not sunk cost

  let prevDebt = loan;

  for (let y = 1; y <= horizon; y++) {
    const rentAnnual =
      monthlyRent0 * 12 * Math.pow(1 + rentGrowth, y - 1);
    const monthlyRentInYear = rentAnnual / 12;
    const propValue = price * Math.pow(1 + propGrowth, y);
    const debtLeft = loanBalanceAtYear(
      loan,
      rate,
      termYears,
      y,
      hasInterestDebt
    );

    // Payments this year (may be partial after payoff)
    const debtAtStart = prevDebt;
    const principalPaid = Math.max(0, debtAtStart - debtLeft);
    // If still in term, scheduled annual payment; after payoff, 0
    const scheduledPayment =
      y <= termYears && hasLoan ? annualDebt : 0;
    const interestPaid = Math.max(0, scheduledPayment - principalPaid);
    // If linear 0% rate, interest is 0 and principal = scheduled
    const interestThisYear = hasInterestDebt ? interestPaid : 0;
    const principalThisYear = hasInterestDebt
      ? principalPaid
      : hasLoan && y <= termYears
        ? Math.min(scheduledPayment, debtAtStart)
        : principalPaid;

    const actualDebtService = interestThisYear + principalThisYear;
    const maint = annualMaintenance;

    buyCashOut += actualDebtService + maint;
    rentCashOut += rentAnnual;
    cumulativeInterest += interestThisYear;
    cumulativePrincipal += principalThisYear;
    cumulativeMaintenance += maint;
    buyEconomic += interestThisYear + maint;

    // Symmetric cash-flow gap: renter invests (buyCash − rent) this year
    const buyCarryThisYear = actualDebtService + maint;
    rentPortfolio =
      rentPortfolio * (1 + altReturn) + (buyCarryThisYear - rentAnnual);

    const buyNetWorth = propValue - debtLeft;
    const rentNetWorth = rentPortfolio;

    series.push({
      year: y,
      label: `Rok ${y}`,
      propertyValue: Math.round(propValue),
      debtRemaining: Math.round(debtLeft),
      buyNetWorth: Math.round(buyNetWorth),
      rentNetWorth: Math.round(rentNetWorth),
      monthlyRentInYear: Math.round(monthlyRentInYear),
      rentPaidThisYear: Math.round(rentAnnual),
      rentCumulativeCashOut: Math.round(rentCashOut),
      interestPaidThisYear: Math.round(interestThisYear),
      principalPaidThisYear: Math.round(principalThisYear),
      maintenanceThisYear: Math.round(maint),
      buyCumulativeEconomicCost: Math.round(buyEconomic),
      buyCumulativeCashOut: Math.round(buyCashOut),
      cumulativeInterest: Math.round(cumulativeInterest),
      cumulativePrincipal: Math.round(cumulativePrincipal),
      cumulativeMaintenance: Math.round(cumulativeMaintenance),
    });

    prevDebt = debtLeft;
  }

  const last = series[series.length - 1]!;
  const finalGap = last.buyNetWorth - last.rentNetWorth;
  const finalLeader: "buy" | "rent" | "tie" =
    Math.abs(finalGap) < 1
      ? "tie"
      : finalGap > 0
        ? "buy"
        : "rent";

  // Net-worth crossover: first year buy leads / rent leads
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

  const nwCross = findFirstCrossover(
    series,
    (p) => p.buyNetWorth,
    (p) => p.rentNetWorth
  );
  // Prefer lasting end-state leader's first year of dominance
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

  const costCross = findFirstCrossover(
    series,
    (p) => p.buyCumulativeEconomicCost,
    (p) => p.rentCumulativeCashOut
  );
  const costBreakEvenYear = costCross?.year ?? null;
  const costBreakEvenLeader = costCross?.leader ?? null;

  const verdictSentence = buildWealthVerdict(
    finalLeader,
    finalGap,
    horizon,
    netWorthBreakEvenYear,
    buyAdvantageFromYear,
    rentAdvantageFromYear
  );

  const costBreakEvenSentence = buildCostBreakEvenSentence(
    costBreakEvenYear,
    costBreakEvenLeader,
    horizon,
    last
  );

  const netWorthBreakEvenSentence = buildNetWorthBreakEvenSentence(
    netWorthBreakEvenYear,
    netWorthBreakEvenLeader,
    horizon,
    finalLeader
  );

  const breakdown: BuyVsRentBreakdown = {
    horizonYears: horizon,
    initialDownPayment: Math.round(down),
    transactionCosts: Math.round(tx),
    totalMortgagePayments: Math.round(cumulativeInterest + cumulativePrincipal),
    totalInterest: Math.round(cumulativeInterest),
    totalPrincipalPaid: Math.round(cumulativePrincipal),
    totalMaintenance: Math.round(cumulativeMaintenance),
    debtRemaining: last.debtRemaining,
    propertyValue: last.propertyValue,
    buyEquity: last.buyNetWorth,
    buyCumulativeEconomicCost: last.buyCumulativeEconomicCost,
    buyCumulativeCashOut: last.buyCumulativeCashOut,
    totalRentPaid: last.rentCumulativeCashOut,
    averageMonthlyRent: Math.round(
      last.rentCumulativeCashOut / (horizon * 12)
    ),
    rentAtHorizonMonthly: last.monthlyRentInYear,
    initialInvestedCapital: Math.round(initialCapitalTied),
    portfolioValue: last.rentNetWorth,
    portfolioGain: Math.round(last.rentNetWorth - initialCapitalTied),
  };

  const today: BuyVsRentToday = {
    monthlyMortgage: Math.round(monthlyMortgage),
    monthlyMaintenance: Math.round(monthlyMaintenance),
    monthlyBuyTotal: Math.round(monthlyMortgage + monthlyMaintenance),
    monthlyRent: Math.round(monthlyRent0),
    monthlyDifference: Math.round(
      monthlyMortgage + monthlyMaintenance - monthlyRent0
    ),
    loanAmount: Math.round(loan),
    ltvPercent: Math.round(ltvPercent * 10) / 10,
  };

  const sensitivity = buildSensitivity(input, finalGap);

  return {
    series,
    today,
    breakdown,
    buyAdvantageFromYear,
    rentAdvantageFromYear,
    costBreakEvenYear,
    costBreakEvenLeader,
    netWorthBreakEvenYear,
    netWorthBreakEvenLeader,
    finalLeader,
    finalGap: Math.round(finalGap),
    verdictSentence,
    costBreakEvenSentence,
    netWorthBreakEvenSentence,
    assumptions: [
      `Cena ${Math.round(price).toLocaleString("cs-CZ")} Kč, vlastní prostředky ${Math.round(down).toLocaleString("cs-CZ")} Kč, úvěr ${Math.round(loan).toLocaleString("cs-CZ")} Kč (LTV ${today.ltvPercent} %).`,
      `Sazba ${hasInterestDebt ? `${rate} %` : loan > 0 ? "0 % / bez úroku" : "bez hypotéky"}, splatnost ${termYears} let, horizont ${horizon} let.`,
      `Údržba ${(maintRate * 100).toFixed(1)} % p.a., transakční náklady ${(txRate * 100).toFixed(1)} %.`,
      `Růst hodnoty ${(propGrowth * 100).toFixed(1)} %, růst nájemného ${(rentGrowth * 100).toFixed(1)} %.`,
      `Alternativní výnos kapitálu ${(altReturn * 100).toFixed(1)} % p.a.`,
      "Jistina hypotéky není nevratný náklad — zvyšuje vlastní kapitál. Akontace tvoří equity, ne spotřebovaný náklad.",
      "Model je scénářový a orientační — není investiční doporučení ani garance budoucího vývoje.",
    ],
    chartMeta: {
      title: "Jaký majetek budu mít?",
      methodology:
        "Čisté jmění při koupi = modelová hodnota nemovitosti − zbývající hypotéka. Při nájmu = alternativně investované prostředky (vlastní kapitál + transakční náklady, které by šly do koupě) ± investované rozdíly cash-flow, zhodnocené alternativním výnosem.",
      source: "Laboratoř rozhodnutí (HypotekaJasne.cz)",
      sourceUrl: null,
      statusNote:
        "MODELOVÝ VÝPOČET — výsledky závisí na vstupech, ne na historické jistotě.",
    },
    costChartMeta: {
      title: "Kolik mě bude bydlení stát?",
      methodology:
        "Nevratné náklady koupě = zaplacené úroky + údržba + transakční náklady (bez jistiny). Náklady nájmu = skutečně zaplacené nájemné. Celkový peněžní odtok kupujícího (včetně jistiny) je veden odděleně.",
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
  if (
    buyFrom != null &&
    rentFrom != null &&
    buyFrom > rentFrom &&
    finalLeader === "buy"
  ) {
    extra = ` Do roku ${buyFrom - 1} vycházelo vyšší čisté jmění u bydlení v nájmu; od roku ${buyFrom} u koupě.`;
  } else if (
    rentFrom != null &&
    buyFrom != null &&
    rentFrom > buyFrom &&
    finalLeader === "rent"
  ) {
    extra = ` Do roku ${rentFrom - 1} vycházelo vyšší čisté jmění u koupě; od roku ${rentFrom} u bydlení v nájmu.`;
  } else if (breakYear != null) {
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
  const endBuy = last.buyCumulativeEconomicCost.toLocaleString("cs-CZ");
  const endRent = last.rentCumulativeCashOut.toLocaleString("cs-CZ");
  return `Bod zvratu nákladů na bydlení: od roku ${year} ${who}. Na konci horizontu: koupě ${endBuy} Kč nevratných nákladů vs. nájem ${endRent} Kč.`;
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
  const who =
    leader === "buy" ? "koupě (vlastní bydlení)" : "bydlení v nájmu";
  return `Bod zvratu čistého majetku: od roku ${year} vychází v modelu vyšší čisté jmění u varianty ${who}.`;
}

function buildSensitivity(
  base: BuyVsRentInput,
  baseGap: number
): BuyVsRentSensitivityItem[] {
  const run = (patch: Partial<BuyVsRentInput>): number => {
    const r = simulateBuyVsRentCore(base, patch);
    const last = r.series[r.series.length - 1];
    return last ? last.buyNetWorth - last.rentNetWorth : 0;
  };

  // Use lightweight core without nested sensitivity
  const items: Array<{ id: string; label: string; patch: Partial<BuyVsRentInput> }> = [
    {
      id: "rate-plus-1",
      label: "Úroková sazba +1 p. b.",
      patch: {
        mortgageRate:
          (base.mortgageRate ?? 0) > 0 ? (base.mortgageRate ?? 0) + 1 : 1,
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

  return items.map((item) => {
    const gap = run(item.patch);
    return {
      id: item.id,
      label: item.label,
      deltaNetWorthGap: Math.round(gap - baseGap),
    };
  });
}

/** Core without sensitivity recursion */
function simulateBuyVsRentCore(
  base: BuyVsRentInput,
  patch: Partial<BuyVsRentInput>
): { series: BuyVsRentYearPoint[] } {
  const input = { ...base, ...patch };
  // Inline minimal loop to avoid infinite recursion via buildSensitivity
  const price = Math.max(0, input.purchasePrice);
  const down = Math.min(Math.max(0, input.downPayment), price);
  const loan = Math.max(0, price - down);
  const tx = price * Math.max(0, input.transactionCostRate);
  const horizon = Math.max(1, Math.round(input.horizonYears));
  const termYears = Math.max(1, Math.round(input.termYears));
  const rate = input.mortgageRate;
  const hasInterestDebt = loan > 0 && rate != null && rate > 0;
  const hasLoan = loan > 0 && termYears > 0;
  const monthlyMortgage = hasInterestDebt
    ? calculateAnnuityPayment(loan, rate!, termYears)
    : hasLoan
      ? loan / (termYears * 12)
      : 0;
  const annualDebt = monthlyMortgage * 12;
  const annualMaintenance = price * Math.max(0, input.maintenanceRate);
  const series: BuyVsRentYearPoint[] = [];
  let rentPortfolio = down + tx;
  let prevDebt = loan;

  for (let y = 1; y <= horizon; y++) {
    const rentAnnual =
      Math.max(0, input.monthlyRent) *
      12 *
      Math.pow(1 + input.annualRentGrowth, y - 1);
    const propValue =
      price * Math.pow(1 + input.annualPropertyGrowth, y);
    const debtLeft = loanBalanceAtYear(
      loan,
      rate,
      termYears,
      y,
      hasInterestDebt
    );
    const debtAtStart = prevDebt;
    const principalPaid = Math.max(0, debtAtStart - debtLeft);
    const scheduled = y <= termYears && hasLoan ? annualDebt : 0;
    const interestThisYear = hasInterestDebt
      ? Math.max(0, scheduled - principalPaid)
      : 0;
    const principalThisYear = hasInterestDebt
      ? principalPaid
      : hasLoan && y <= termYears
        ? Math.min(scheduled, debtAtStart)
        : principalPaid;
    const buyCarry = interestThisYear + principalThisYear + annualMaintenance;
    rentPortfolio =
      rentPortfolio * (1 + input.alternativeEquityReturn) +
      (buyCarry - rentAnnual);
    series.push({
      year: y,
      label: `Rok ${y}`,
      propertyValue: Math.round(propValue),
      debtRemaining: Math.round(debtLeft),
      buyNetWorth: Math.round(propValue - debtLeft),
      rentNetWorth: Math.round(rentPortfolio),
      monthlyRentInYear: 0,
      rentPaidThisYear: 0,
      rentCumulativeCashOut: 0,
      interestPaidThisYear: 0,
      principalPaidThisYear: 0,
      maintenanceThisYear: 0,
      buyCumulativeEconomicCost: 0,
      buyCumulativeCashOut: 0,
      cumulativeInterest: 0,
      cumulativePrincipal: 0,
      cumulativeMaintenance: 0,
    });
    prevDebt = debtLeft;
  }
  return { series };
}
