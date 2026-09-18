/**
 * Koupě vs. nájem — měsíční cashflow a opportunity cost.
 * Jediný výpočetní zdroj (SSOT) pro vlastní bydlení vs. placení nájmu majiteli.
 *
 * Scénář A (nájem < splátka + provoz): nájemník investuje přebytek.
 * Scénář B (nájem >= splátka + provoz): nájemník nic dalšího neinvestuje
 * (portfolio neklesá), kupující investuje úsporu.
 *
 * Jistina a akontace nejsou utopený náklad.
 * Akontace kupujícího je v equity nemovitosti.
 * Stejná částka u nájemníka startuje portfolio (+ ušetřené transakční náklady).
 */

import { calculateAnnuityPayment } from "@/lib/finance-math/core";

export const RENT_VS_BUY_DEFAULTS = {
  /** ETF / alternativní zhodnocení */
  alternativeAnnualReturn: 0.07,
  annualPropertyGrowth: 0.03,
  annualRentGrowth: 0.02,
  /** 0, dokud UI nepředá sazbu nebo částku */
  transactionCostRate: 0,
} as const;

export type RentVsBuyInputs = {
  propertyPrice: number;
  downPayment: number;
  /** % p.a., např. 4.5 */
  annualMortgageRatePct: number;
  termYears: number;
  /** Provoz a údržba vlastního bydlení, Kč / měsíc */
  monthlyOwnershipCosts: number;
  /** Nájem, který bych platil majiteli, Kč / měsíc */
  monthlyRent: number;
  horizonYears: number;
  /** desetinné, např. 0.07. Default 7 %. */
  alternativeAnnualReturn?: number;
  /** desetinné. Default 3 %. */
  annualPropertyGrowth?: number;
  /** desetinné. Default 2 %. Aplikuje se jednou ročně. */
  annualRentGrowth?: number;
  /**
   * Absolutní transakční náklady (provize, odhad, kolky).
   * Mají přednost před `transactionCostRate`.
   */
  transactionCosts?: number;
  /** Podíl z kupní ceny. Default 0. */
  transactionCostRate?: number;
};

export type AmortizationMonth = {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
};

export type RentVsBuyMonthPoint = {
  month: number;
  year: number;
  tenantNetWorth: number;
  buyerNetWorth: number;
  /** Úroky + provoz + transakční náklady. Bez jistiny a bez akontace. */
  buyerSunkCosts: number;
  /** Skutečně zaplacené nájemné. */
  tenantSunkCosts: number;
  mortgagePayment: number;
  interest: number;
  principal: number;
  debtRemaining: number;
  ownershipCosts: number;
  buyMonthlyOutflow: number;
  rentPaid: number;
  /** Scénář A: kolik nájemník tento měsíc investuje */
  monthlySurplusTenant: number;
  /** Scénář B: kolik kupující tento měsíc investuje */
  monthlySurplusBuyer: number;
  propertyValue: number;
  tenantPortfolio: number;
  buyerSavingsPortfolio: number;
  /** Součet měsíčních přebytků vložených nájemníkem (bez úroku) */
  tenantContributions: number;
  buyerContributions: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
  cumulativeOwnership: number;
  buyerCumulativeCashOut: number;
  transactionCosts: number;
};

export type RentVsBuyYearPoint = {
  year: number;
  label: string;
  tenantNetWorth: number;
  buyerNetWorth: number;
  buyerSunkCosts: number;
  tenantSunkCosts: number;
  propertyValue: number;
  debtRemaining: number;
  monthlyRentInYear: number;
  rentPaidThisYear: number;
  interestPaidThisYear: number;
  principalPaidThisYear: number;
  ownershipPaidThisYear: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
  cumulativeOwnership: number;
  buyerCumulativeCashOut: number;
  buyerSavingsPortfolio: number;
  tenantPortfolio: number;
  tenantContributions: number;
  buyerContributions: number;
};

export type RentVsBuyMilestone = {
  years: number;
  buyerNetWorth: number;
  tenantNetWorth: number;
  gap: number;
  leader: "buy" | "rent" | "tie";
};

export type RentVsBuyResult = {
  loanAmount: number;
  ltvPercent: number;
  monthlyMortgage: number;
  monthlyOwnershipCosts: number;
  monthlyBuyOutflow: number;
  monthlyRent: number;
  transactionCosts: number;
  /** Akontace + ušetřené transakční náklady */
  initialTenantCapital: number;
  schedule: AmortizationMonth[];
  months: RentVsBuyMonthPoint[];
  years: RentVsBuyYearPoint[];
  netWorthAtYears: RentVsBuyMilestone[];
  final: RentVsBuyMonthPoint;
};

function finite(n: number, fallback = 0): number {
  return Number.isFinite(n) ? n : fallback;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function resolveTransactionCosts(
  propertyPrice: number,
  input: Pick<RentVsBuyInputs, "transactionCosts" | "transactionCostRate">
): number {
  const price = Math.max(0, finite(propertyPrice));
  if (input.transactionCosts != null && Number.isFinite(input.transactionCosts)) {
    return Math.max(0, input.transactionCosts);
  }
  const rate = Math.max(
    0,
    finite(input.transactionCostRate ?? RENT_VS_BUY_DEFAULTS.transactionCostRate)
  );
  return price * rate;
}

export function buildAmortizationSchedule(
  principal: number,
  annualRatePct: number,
  termYears: number
): AmortizationMonth[] {
  const loan = Math.max(0, finite(principal));
  const years = clamp(Math.round(finite(termYears)), 1, 50);
  const n = years * 12;
  const ratePct = Math.max(0, finite(annualRatePct));
  if (loan <= 0) return [];

  const scheduled = calculateAnnuityPayment(loan, ratePct, years);
  const r = ratePct / 100 / 12;
  const rows: AmortizationMonth[] = [];
  let balance = loan;

  for (let month = 1; month <= n && balance > 1e-8; month++) {
    const interest = balance * r;
    let principalPart = scheduled - interest;
    if (principalPart > balance || month === n) principalPart = balance;
    if (principalPart < 0) principalPart = 0;
    const payment = interest + principalPart;
    balance = Math.max(0, balance - principalPart);
    if (balance < 0.005) balance = 0;
    rows.push({ month, payment, interest, principal: principalPart, balance });
  }

  return rows;
}

function leaderOf(gap: number): "buy" | "rent" | "tie" {
  if (Math.abs(gap) < 1) return "tie";
  return gap > 0 ? "buy" : "rent";
}

export function simulateRentVsBuy(input: RentVsBuyInputs): RentVsBuyResult {
  const price = Math.max(0, finite(input.propertyPrice));
  const down = clamp(finite(input.downPayment), 0, price);
  const loan = Math.max(0, price - down);
  const termYears = clamp(Math.round(finite(input.termYears, 30)), 1, 50);
  const horizonYears = clamp(Math.round(finite(input.horizonYears, 15)), 1, 60);
  const horizonMonths = horizonYears * 12;
  const ratePct = Math.max(0, finite(input.annualMortgageRatePct));
  const ownership = Math.max(0, finite(input.monthlyOwnershipCosts));
  const rent0 = Math.max(0, finite(input.monthlyRent));
  const alt =
    input.alternativeAnnualReturn ?? RENT_VS_BUY_DEFAULTS.alternativeAnnualReturn;
  const propG =
    input.annualPropertyGrowth ?? RENT_VS_BUY_DEFAULTS.annualPropertyGrowth;
  const rentG = input.annualRentGrowth ?? RENT_VS_BUY_DEFAULTS.annualRentGrowth;
  const tx = resolveTransactionCosts(price, input);
  const initialTenantCapital = down + tx;

  const schedule = buildAmortizationSchedule(loan, ratePct, termYears);
  const monthlyMortgage = schedule[0]?.payment ?? 0;
  const rm = finite(alt) / 12;

  let tenantPortfolio = initialTenantCapital;
  let buyerSavings = 0;
  let cumInterest = 0;
  let cumPrincipal = 0;
  let cumOwnership = 0;
  let cumRent = 0;
  let tenantContributions = 0;
  let buyerContributions = 0;
  let buyerCashOut = down + tx;
  /** Transakční náklady jsou utopené hned při koupi, jistina ne. */
  let buyerSunk = tx;

  const months: RentVsBuyMonthPoint[] = [];

  for (let m = 1; m <= horizonMonths; m++) {
    const amort = schedule[m - 1];
    const interest = amort?.interest ?? 0;
    const principal = amort?.principal ?? 0;
    const mortgagePayment = amort?.payment ?? 0;
    const debt = amort?.balance ?? 0;

    const yearIndex = Math.floor((m - 1) / 12);
    const rentPaid = rent0 * Math.pow(1 + finite(rentG), yearIndex);
    const buyOut = mortgagePayment + ownership;

    const surplusTenant = Math.max(0, buyOut - rentPaid);
    const surplusBuyer = Math.max(0, rentPaid - buyOut);

    tenantPortfolio = tenantPortfolio * (1 + rm) + surplusTenant;
    buyerSavings = buyerSavings * (1 + rm) + surplusBuyer;
    tenantContributions += surplusTenant;
    buyerContributions += surplusBuyer;

    cumInterest += interest;
    cumPrincipal += principal;
    cumOwnership += ownership;
    cumRent += rentPaid;
    buyerSunk += interest + ownership;
    buyerCashOut += buyOut;

    const propertyValue = price * Math.pow(1 + finite(propG), m / 12);
    const buyerNetWorth = propertyValue - debt + buyerSavings;

    months.push({
      month: m,
      year: yearIndex + 1,
      tenantNetWorth: tenantPortfolio,
      buyerNetWorth,
      buyerSunkCosts: buyerSunk,
      tenantSunkCosts: cumRent,
      mortgagePayment,
      interest,
      principal,
      debtRemaining: debt,
      ownershipCosts: ownership,
      buyMonthlyOutflow: buyOut,
      rentPaid,
      monthlySurplusTenant: surplusTenant,
      monthlySurplusBuyer: surplusBuyer,
      propertyValue,
      tenantPortfolio,
      buyerSavingsPortfolio: buyerSavings,
      tenantContributions,
      buyerContributions,
      cumulativeInterest: cumInterest,
      cumulativePrincipal: cumPrincipal,
      cumulativeOwnership: cumOwnership,
      buyerCumulativeCashOut: buyerCashOut,
      transactionCosts: tx,
    });
  }

  const years: RentVsBuyYearPoint[] = [];
  for (let y = 1; y <= horizonYears; y++) {
    const slice = months.filter((p) => p.year === y);
    const end = slice[slice.length - 1]!;
    const sum = (pick: (p: RentVsBuyMonthPoint) => number) =>
      slice.reduce((acc, p) => acc + pick(p), 0);
    years.push({
      year: y,
      label: `Rok ${y}`,
      tenantNetWorth: end.tenantNetWorth,
      buyerNetWorth: end.buyerNetWorth,
      buyerSunkCosts: end.buyerSunkCosts,
      tenantSunkCosts: end.tenantSunkCosts,
      propertyValue: end.propertyValue,
      debtRemaining: end.debtRemaining,
      monthlyRentInYear: end.rentPaid,
      rentPaidThisYear: sum((p) => p.rentPaid),
      interestPaidThisYear: sum((p) => p.interest),
      principalPaidThisYear: sum((p) => p.principal),
      ownershipPaidThisYear: sum((p) => p.ownershipCosts),
      cumulativeInterest: end.cumulativeInterest,
      cumulativePrincipal: end.cumulativePrincipal,
      cumulativeOwnership: end.cumulativeOwnership,
      buyerCumulativeCashOut: end.buyerCumulativeCashOut,
      buyerSavingsPortfolio: end.buyerSavingsPortfolio,
      tenantPortfolio: end.tenantPortfolio,
      tenantContributions: end.tenantContributions,
      buyerContributions: end.buyerContributions,
    });
  }

  const milestoneYears = [5, 10, 15, 30].filter((y) => y <= horizonYears);
  if (!milestoneYears.includes(horizonYears)) milestoneYears.push(horizonYears);

  const netWorthAtYears: RentVsBuyMilestone[] = milestoneYears.map((yearsN) => {
    const p = months[yearsN * 12 - 1]!;
    const gap = p.buyerNetWorth - p.tenantNetWorth;
    return {
      years: yearsN,
      buyerNetWorth: p.buyerNetWorth,
      tenantNetWorth: p.tenantNetWorth,
      gap,
      leader: leaderOf(gap),
    };
  });

  const final = months[months.length - 1]!;

  return {
    loanAmount: loan,
    ltvPercent: price > 0 ? (loan / price) * 100 : 0,
    monthlyMortgage,
    monthlyOwnershipCosts: ownership,
    monthlyBuyOutflow: monthlyMortgage + ownership,
    monthlyRent: rent0,
    transactionCosts: tx,
    initialTenantCapital,
    schedule,
    months,
    years,
    netWorthAtYears,
    final,
  };
}
