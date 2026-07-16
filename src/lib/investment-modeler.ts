import { calculateAnnuityPayment } from "@/lib/calculators";
import {
  getAdjustedMetrics,
  getPurposeModifier,
} from "@/lib/market-metrics";

export type ScenarioKey = "conservative" | "moderate" | "optimistic";

export interface ModelerFormInput {
  country: string;
  city: string;
  propertyType: string;
  area: number;
  purpose: string;
  price: number;
  rent: string;
  mortgageAmount: number;
  interestRate: number;
  equity: number;
  monthlyPayment: string;
  durationYears: number;
  purchaseDate: string;
}

export interface ResolvedModelerInput {
  country: string;
  city: string;
  propertyType: string;
  area: number;
  purpose: string;
  price: number;
  rentMonthly: number;
  rentAutoFilled: boolean;
  mortgageAmount: number;
  interestRate: number;
  equity: number;
  monthlyPayment: number;
  paymentAutoFilled: boolean;
  durationYears: number;
  purchaseDate: string;
  ltv: number;
  cashFlow: number;
}

export interface ScenarioConfig {
  key: ScenarioKey;
  label: string;
  priceGrowth: number;
  rentGrowth: number;
}

export const MODELER_SCENARIOS: ScenarioConfig[] = [
  {
    key: "conservative",
    label: "Konzervativní",
    priceGrowth: 0.02,
    rentGrowth: 0.015,
  },
  {
    key: "moderate",
    label: "Střední (Realistický)",
    priceGrowth: 0.04,
    rentGrowth: 0.03,
  },
  {
    key: "optimistic",
    label: "Optimistický",
    priceGrowth: 0.06,
    rentGrowth: 0.05,
  },
];

export const INFLATION_RATE = 0.025;
export const SP500_ANNUAL_RETURN = 0.085;
export const PROJECTION_MONTHS = 360;

export interface ChartProjectionPoint {
  rok: string;
  year: number;
  hodnotaNemovitosti: number;
  zustatekHypoteky: number;
  hodnotaSP500: number;
  nominalniBohatstvi: number;
  realneBohatstvi: number;
  zustatekSnihovaKoule: number;
}

export interface ScenarioResult {
  scenario: ScenarioConfig;
  chartData: ChartProjectionPoint[];
  monthlyPayment: number;
  propertyValue10y: number;
  propertyValue30y: number;
  netYieldAnnual: number;
  acceleratedPayoffYear: number | null;
  crossoverYear: number | null;
  yearsSavedBySnowball: number | null;
  grossProfit30y: number;
  inflationAdjustedProfit30y: number;
  cumulativeRent30y: number;
  nominalWealth30y: number;
  realWealth30y: number;
}

export interface SwotSection {
  title: string;
  items: string[];
  color: "emerald" | "orange" | "blue" | "red";
}

export interface ModelerAnalysis {
  input: ResolvedModelerInput;
  scenarios: Record<ScenarioKey, ScenarioResult>;
}

export const defaultModelerForm: ModelerFormInput = {
  country: "Česká republika",
  city: "Praha",
  propertyType: "Byt",
  area: 70,
  purpose: "Dlouhodobý nájem",
  price: 8_750_000,
  rent: "25521",
  mortgageAmount: 4_000_000,
  interestRate: 4.5,
  equity: 1_000_000,
  monthlyPayment: "",
  durationYears: 30,
  purchaseDate: new Date().toISOString().slice(0, 10),
};

function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : null;
}

export function resolveModelerInput(form: ModelerFormInput): ResolvedModelerInput {
  const metrics = getAdjustedMetrics(
    form.city,
    form.propertyType || "Byt",
    form.purpose || "Dlouhodobý nájem"
  );
  const rentParsed = parseOptionalNumber(form.rent);
  const rentAutoFilled = rentParsed === null;
  const rentMonthly = rentAutoFilled
    ? (form.price * (metrics.yield / 100)) / 12
    : rentParsed;

  const paymentParsed = parseOptionalNumber(form.monthlyPayment);
  const paymentAutoFilled = paymentParsed === null;
  const monthlyPayment = paymentAutoFilled
    ? calculateAnnuityPayment(
        form.mortgageAmount,
        form.interestRate,
        form.durationYears
      )
    : paymentParsed;

  const ltv =
    form.price > 0 ? Math.round((form.mortgageAmount / form.price) * 100) : 0;

  return {
    country: form.country,
    city: form.city,
    propertyType: form.propertyType,
    area: form.area,
    purpose: form.purpose,
    price: form.price,
    rentMonthly,
    rentAutoFilled,
    mortgageAmount: form.mortgageAmount,
    interestRate: form.interestRate,
    equity: form.equity,
    monthlyPayment,
    paymentAutoFilled,
    durationYears: form.durationYears,
    purchaseDate: form.purchaseDate,
    ltv,
    cashFlow: rentMonthly - monthlyPayment,
  };
}

function amortizeMonth(
  balance: number,
  monthlyRate: number,
  payment: number
): number {
  if (balance <= 0) return 0;
  const interest = balance * monthlyRate;
  const principal = Math.min(balance, Math.max(0, payment - interest));
  return Math.max(0, balance - principal);
}

function computeAnnuityPayment(
  principal: number,
  monthlyRate: number,
  months: number
): number {
  if (principal <= 0) return 0;
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

function simulateStandardPayoffYear(
  principal: number,
  monthlyPayment: number,
  monthlyRate: number
): number | null {
  let balance = principal;
  for (let month = 1; month <= PROJECTION_MONTHS; month++) {
    balance = amortizeMonth(balance, monthlyRate, monthlyPayment);
    if (balance <= 0) return Math.ceil(month / 12);
  }
  return null;
}

function buildMonthlyProjection(
  input: ResolvedModelerInput,
  scenario: ScenarioConfig
): ScenarioResult {
  const P = input.price;
  const M = input.mortgageAmount;
  const r = input.interestRate / 100 / 12;
  const N = input.durationYears * 12;
  const purpose = input.purpose || "Dlouhodobý nájem";
  const purposeMod = getPurposeModifier(purpose);
  const metrics = getAdjustedMetrics(
    input.city,
    input.propertyType || "Byt",
    purpose
  );
  const initialRent = input.rentAutoFilled
    ? (P * (metrics.yield / 100)) / 12
    : input.rentMonthly;

  const rentGrowthAnnual = scenario.rentGrowth;
  const propertyGrowthAnnual =
    scenario.priceGrowth * purposeMod.growthMultiplier;
  const sp500ReturnMonthly = SP500_ANNUAL_RETURN / 12;

  const pmt =
    input.paymentAutoFilled
      ? computeAnnuityPayment(M, r, N)
      : input.monthlyPayment;

  let currentMortgage = M;
  let snowballMortgage = M;
  let currentPortfolio = 0;
  let cumulativeRent = 0;
  let crossoverYear: number | null = null;
  let acceleratedPayoffYear: number | null = null;

  const chartData: ChartProjectionPoint[] = [
    {
      rok: "Start",
      year: 0,
      hodnotaNemovitosti: Math.round(P),
      zustatekHypoteky: Math.round(M),
      hodnotaSP500: 0,
      nominalniBohatstvi: Math.round(P - M),
      realneBohatstvi: Math.round(P - M),
      zustatekSnihovaKoule: Math.round(M),
    },
  ];

  for (let month = 1; month <= PROJECTION_MONTHS; month++) {
    const year = Math.ceil(month / 12);
    const yearsElapsed = month / 12;

    const currentRent = initialRent * Math.pow(1 + rentGrowthAnnual, yearsElapsed);
    const currentPropValue = P * Math.pow(1 + propertyGrowthAnnual, yearsElapsed);
    const inflationDiscount = Math.pow(1 + INFLATION_RATE, yearsElapsed);

    cumulativeRent += currentRent;

    currentMortgage = amortizeMonth(currentMortgage, r, pmt);
    snowballMortgage = amortizeMonth(
      snowballMortgage,
      r,
      pmt + currentRent
    );

    if (snowballMortgage <= 0 && acceleratedPayoffYear === null) {
      acceleratedPayoffYear = year;
    }

    const monthlyCF = currentRent - pmt;
    if (monthlyCF > 0) {
      currentPortfolio =
        currentPortfolio * (1 + sp500ReturnMonthly) + monthlyCF;
    }

    if (
      crossoverYear === null &&
      currentMortgage > 0 &&
      currentPortfolio >= currentMortgage
    ) {
      crossoverYear = year;
    }

    const nominalWealth = currentPropValue - currentMortgage + currentPortfolio;
    const realWealth = nominalWealth / inflationDiscount;

    if (month % 12 === 0) {
      chartData.push({
        rok: `Rok ${year}`,
        year,
        hodnotaNemovitosti: Math.round(currentPropValue),
        zustatekHypoteky: Math.round(currentMortgage),
        hodnotaSP500: Math.round(currentPortfolio),
        nominalniBohatstvi: Math.round(nominalWealth),
        realneBohatstvi: Math.round(realWealth),
        zustatekSnihovaKoule: Math.round(Math.max(0, snowballMortgage)),
      });
    }
  }

  const final = chartData[chartData.length - 1];
  const year10 = chartData.find((d) => d.year === 10) ?? final;
  const standardPayoffYear = simulateStandardPayoffYear(M, pmt, r);

  const yearsSavedBySnowball =
    standardPayoffYear && acceleratedPayoffYear
      ? Math.max(0, standardPayoffYear - acceleratedPayoffYear)
      : null;

  const totalMortgagePaid = pmt * PROJECTION_MONTHS;
  const grossProfit30y =
    final.hodnotaNemovitosti +
    cumulativeRent -
    totalMortgagePaid -
    input.equity;
  const inflationFactor = Math.pow(1 + INFLATION_RATE, 30);

  const netYieldAnnual = P > 0 ? ((initialRent * 12) / P) * 100 : 0;

  return {
    scenario,
    chartData,
    monthlyPayment: Math.round(pmt),
    propertyValue10y: year10.hodnotaNemovitosti,
    propertyValue30y: final.hodnotaNemovitosti,
    netYieldAnnual,
    acceleratedPayoffYear,
    crossoverYear,
    yearsSavedBySnowball,
    grossProfit30y: Math.round(grossProfit30y),
    inflationAdjustedProfit30y: Math.round(grossProfit30y / inflationFactor),
    cumulativeRent30y: Math.round(cumulativeRent),
    nominalWealth30y: final.nominalniBohatstvi,
    realWealth30y: final.realneBohatstvi,
  };
}

export function analyzeInvestmentModel(
  form: ModelerFormInput
): ModelerAnalysis {
  const input = resolveModelerInput(form);
  const scenarios = Object.fromEntries(
    MODELER_SCENARIOS.map((scenario) => [
      scenario.key,
      buildMonthlyProjection(input, scenario),
    ])
  ) as Record<ScenarioKey, ScenarioResult>;

  return { input, scenarios };
}

export function generateModelerSwot(
  input: ResolvedModelerInput,
  activeScenario: ScenarioResult
): SwotSection[] {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const opportunities: string[] = [];
  const threats: string[] = [];

  if (input.ltv < 70) {
    strengths.push("Vysoká odolnost vůči poklesu cen (LTV pod 70 %).");
  }
  if (input.cashFlow > 0) {
    strengths.push("Kladné cash-flow od 1. dne — nemovitost se sama platí.");
  }
  if (input.equity >= input.price * 0.3) {
    strengths.push("Silná vlastní kapitálová pozice snižuje úrokové riziko.");
  }

  if (input.cashFlow < 0) {
    weaknesses.push("Investice vyžaduje dotování ze mzdy každý měsíc.");
  }
  if (input.interestRate > 5) {
    weaknesses.push("Vysoká dluhová služba — citlivost na refinancování.");
  }
  if (input.ltv > 80) {
    weaknesses.push("Vysoké LTV zvyšuje riziko při korekci trhu.");
  }

  opportunities.push(
    "Refinancování při poklesu sazeb může výrazně zlepšit měsíční CF."
  );
  if (input.cashFlow > 0 && activeScenario.yearsSavedBySnowball) {
    opportunities.push(
      `Investování přebytků do ETF zkrátí dobu splacení o ${activeScenario.yearsSavedBySnowball} let.`
    );
  }
  if (activeScenario.crossoverYear) {
    opportunities.push(
      `Akciový portfoliový efekt může překonat hypotéku v roce ${activeScenario.crossoverYear}.`
    );
  }

  if (input.durationYears > 25) {
    threats.push("Dlouhá expozice úrokovému riziku (splatnost nad 25 let).");
  }
  threats.push("Výpadek nájemníka nebo prodloužená neobsazenost.");
  if (input.purpose === "Krátkodobý nájem") {
    threats.push("Regulace Airbnb a sezónní výkyvy nájmů.");
  }

  if (strengths.length === 0) {
    strengths.push("Diverzifikace portfolia mimo hotovost na účtu.");
  }
  if (weaknesses.length === 0) {
    weaknesses.push("Citlivost na makroekonomický cyklus v dané lokalitě.");
  }

  return [
    { title: "Silné stránky", items: strengths, color: "emerald" },
    { title: "Slabé stránky", items: weaknesses, color: "orange" },
    { title: "Příležitosti", items: opportunities, color: "blue" },
    { title: "Hrozby", items: threats, color: "red" },
  ];
}

export function formatCzk(amount: number): string {
  return (
    new Intl.NumberFormat("cs-CZ", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(Math.round(amount)) + " CZK"
  );
}
