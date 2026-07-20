export type CountryId =
  | "cz"
  | "dubai"
  | "spain"
  | "italy"
  | "croatia"
  | "bali"
  | "saudi"
  | "slovakia";
export type CurrencyCode = "CZK" | "AED" | "EUR" | "USD" | "SAR";

/**
 * @deprecated Prefer FinancingOptionId from @/lib/financing.
 * Kept for legacy calculateMortgage callers.
 */
export type StandardFinancingType = "annuity" | "linear";
/** @deprecated Prefer FinancingOptionId from @/lib/financing. */
export type DubaiFinancingType =
  | "developer-plan"
  | "non-resident"
  | "american-cz-collateral";
/** @deprecated Prefer FinancingOptionId from @/lib/financing. */
export type FinancingType = StandardFinancingType | DubaiFinancingType;

export interface CountryConfig {
  id: CountryId;
  label: string;
  currency: CurrencyCode;
  defaultPrice: number;
  defaultSavings: number;
  /**
   * Ověřená lokální sazba — null = nevymýšlíme (žádný hardcoded foreign rate).
   * CZ používá live sazby ze Supabase, ne toto pole.
   */
  defaultRate: number | null;
  defaultTerm: number;
  defaultRentalYield: number;
}

export const countryConfigs: Record<CountryId, CountryConfig> = {
  cz: {
    id: "cz",
    label: "ČR",
    currency: "CZK",
    defaultPrice: 5_000_000,
    defaultSavings: 1_000_000,
    defaultRate: null,
    defaultTerm: 30,
    defaultRentalYield: 0.036,
  },
  dubai: {
    id: "dubai",
    label: "Dubaj (SAE)",
    currency: "AED",
    defaultPrice: 2_500_000,
    // Non-resident LTV strop 50 % → min. 50 % equity (ne generických 20 %)
    defaultSavings: 1_250_000,
    defaultRate: null,
    defaultTerm: 25,
    defaultRentalYield: 0.065,
  },
  spain: {
    id: "spain",
    label: "Španělsko",
    currency: "EUR",
    defaultPrice: 350_000,
    // Nerezident typicky max ~70 % LTV → 30 % equity (ne 80 % LTV)
    defaultSavings: 105_000,
    defaultRate: null,
    defaultTerm: 30,
    defaultRentalYield: 0.05,
  },
  italy: {
    id: "italy",
    label: "Itálie",
    currency: "EUR",
    defaultPrice: 400_000,
    defaultSavings: 160_000,
    defaultRate: null,
    defaultTerm: 25,
    defaultRentalYield: 0.0525,
  },
  croatia: {
    id: "croatia",
    label: "Chorvatsko",
    currency: "EUR",
    defaultPrice: 300_000,
    defaultSavings: 120_000,
    defaultRate: null,
    defaultTerm: 20,
    defaultRentalYield: 0.0575,
  },
  bali: {
    id: "bali",
    label: "Bali",
    currency: "USD",
    defaultPrice: 350_000,
    // Bez bankovní hypotéky pro cizince — cash / developer heavy
    defaultSavings: 350_000,
    defaultRate: null,
    defaultTerm: 20,
    defaultRentalYield: 0.125,
  },
  saudi: {
    id: "saudi",
    label: "Saúdská Arábie",
    currency: "SAR",
    defaultPrice: 1_200_000,
    defaultSavings: 480_000,
    defaultRate: null,
    defaultTerm: 25,
    defaultRentalYield: 0.075,
  },
  slovakia: {
    id: "slovakia",
    label: "Slovensko",
    currency: "EUR",
    defaultPrice: 220_000,
    defaultSavings: 88_000,
    defaultRate: null,
    defaultTerm: 30,
    defaultRentalYield: 0.0475,
  },
};

export const countryOrder: CountryId[] = [
  "cz",
  "dubai",
  "spain",
  "italy",
  "croatia",
  "bali",
  "saudi",
  "slovakia",
];

export const banksByCountry: Record<CountryId, string[]> = {
  cz: [
    "Česká spořitelna",
    "Komerční banka",
    "ČSOB Hypoteční banka",
    "Raiffeisen Bank",
    "mBank",
    "UniCredit Bank",
  ],
  dubai: [
    "Emirates NBD",
    "Dubai Islamic Bank",
    "Mashreq Bank",
    "Lokální banka",
  ],
  spain: ["BBVA", "Banco Santander", "CaixaBank", "Lokální banka"],
  italy: ["Intesa Sanpaolo", "UniCredit", "Lokální banka"],
  croatia: ["Zagrebačka banka", "PBZ", "Erste Bank", "Lokální banka"],
  bali: ["Bank Mandiri", "BCA", "Lokální banka", "Mezinárodní financování"],
  saudi: ["Al Rajhi Bank", "Saudi National Bank", "Riyad Bank", "Lokální banka"],
  slovakia: ["VÚB", "Tatra banka", "Slovenská sporiteľňa", "ČSOB SK"],
};

export const standardFinancingOptions = [
  { value: "annuity" as const, label: "Anuitní splácení" },
  { value: "linear" as const, label: "Lineární splácení" },
];

export const dubaiFinancingOptions = [
  {
    value: "developer-plan" as const,
    label: "Developer Payment Plan (Off-plan)",
  },
  { value: "non-resident" as const, label: "Non-resident hypotéka" },
  {
    value: "american-cz-collateral" as const,
    label: "Americká hypotéka (Zástava v ČR)",
  },
];

export const tooltips = {
  price: "Kupní cena nemovitosti včetně všech poplatků spojených s převodem.",
  savings:
    "Vlastní zdroje, které vložíte do koupě. Ovlivňují LTV (poměr úvěru k hodnotě). U vlastního bydlení ČNB cílí na LTV do 80 % (do 36 let až 90 %); u investičních hypoték od 4/2026 doporučuje max. 70 %.",
  financingType:
    "Způsob financování se liší podle země. V Dubaji můžete volit off-plan splátky, hypotéku pro cizince nebo americkou hypotéku s českou zástavou.",
  interestRate:
    "Roční úroková sazba (p.a.) úvěru. U Developer Plan se sazba neuplatňuje – platíte předem stanovené splátky developerovi.",
  termYears: "Doba, za kterou chcete úvěr splatit. Delší splatnost = nižší měsíční splátka, ale vyšší celkový úrok.",
  bank: "Vyberte preferovaného poskytovatele. Finální podmínky závisí na bonitě a konkrétní nabídce banky.",
  americanMortgage:
    "Úvěr v CZK z české banky se zástavou na nemovitost v ČR. Prostředky použijete na koupi v Dubaji – vhodné pro klienty s českým majetkem.",
};

export interface CalculatorInput {
  country: CountryId;
  price: number;
  savings: number;
  interestRate: number;
  termYears: number;
  financingType: FinancingType;
  bank: string;
}

export interface CalculatorResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  loanAmount: number;
  termYears: number;
  ltv: number;
  currency: CurrencyCode;
  collateral: string;
  financingLabel: string;
  showChart: boolean;
  chartData: { year: string; payment: number; balance: number }[];
}

export function getEffectiveCurrency(
  country: CountryId,
  financingType: FinancingType | string
): CurrencyCode {
  if (
    financingType === "american-cz-collateral" ||
    financingType === "CZECH_EQUITY_LOAN"
  ) {
    return "CZK";
  }
  return countryConfigs[country].currency;
}

export function shouldShowInterestRate(
  country: CountryId,
  financingType: FinancingType | string
): boolean {
  return !(
    (country === "dubai" && financingType === "developer-plan") ||
    financingType === "DEVELOPER_PAYMENT_PLAN" ||
    financingType === "CASH"
  );
}

/**
 * @deprecated Prefer calculateFinancing from @/lib/financing.
 * Legacy wrapper — foreign markets no longer invent annuity from hardcoded rates.
 */
export function calculateMortgage(input: CalculatorInput): CalculatorResult {
  const { country, price, savings, interestRate, termYears, financingType } =
    input;
  const currency = getEffectiveCurrency(country, financingType);
  const loanAmount = Math.max(0, price - savings);
  const ltv = price > 0 ? Math.round((loanAmount / price) * 100) : 0;

  if (
    financingType === "developer-plan" ||
    (financingType as string) === "DEVELOPER_PAYMENT_PLAN"
  ) {
    return {
      monthlyPayment: 0,
      totalPayment: Math.round(price),
      totalInterest: 0,
      loanAmount: Math.round(price),
      termYears,
      ltv: 0,
      currency,
      collateral: "Developer payment plan (ne bankovní hypotéka)",
      financingLabel: "Developer Payment Plan",
      showChart: false,
      chartData: [],
    };
  }

  let monthlyPayment = 0;
  let financingLabel = "Anuitní splácení";
  let collateral = `Nemovitost (LTV ${ltv}%)`;
  let showChart = false;

  const hasRate =
    Number.isFinite(interestRate) && interestRate > 0 && loanAmount > 0;

  if (financingType === "american-cz-collateral") {
    financingLabel = "Americká hypotéka (Zástava v ČR)";
    collateral = "Česká nemovitost jako zástava";
    if (hasRate) {
      monthlyPayment = calculateAnnuityPayment(
        loanAmount,
        interestRate,
        termYears
      );
      showChart = true;
    }
  } else if (country === "cz") {
    if (financingType === "linear" && hasRate) {
      financingLabel = "Lineární splácení";
      monthlyPayment = calculateLinearFirstPayment(
        loanAmount,
        interestRate,
        termYears
      );
      showChart = true;
    } else if (hasRate) {
      monthlyPayment = calculateAnnuityPayment(
        loanAmount,
        interestRate,
        termYears
      );
      showChart = true;
    }
  } else if (financingType === "non-resident") {
    financingLabel = "Non-resident hypotéka";
    collateral = `Nemovitost (LTV ${ltv}%)`;
    // Bez ověřené sazby — UI používá calculateFinancing
  } else {
    financingLabel = "Financování — ověřit individuálně";
  }

  monthlyPayment = Math.round(monthlyPayment);
  const totalPayment = Math.round(monthlyPayment * termYears * 12);
  const totalInterest = Math.max(0, totalPayment - loanAmount);

  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    loanAmount,
    termYears,
    ltv,
    currency,
    collateral,
    financingLabel,
    showChart,
    chartData: showChart
      ? generateChartData(loanAmount, monthlyPayment, termYears, interestRate)
      : [],
  };
}

export function calculateAnnuityPayment(
  principal: number,
  annualRatePercent: number,
  years: number
): number {
  if (principal <= 0) return 0;
  const annualRate = annualRatePercent / 100;
  const monthlyRate = annualRate / 12;
  const months = years * 12;
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

export interface AmortizationDataPoint {
  rok: string;
  zůstatek: number;
}

export function generateAmortizationData(
  price: number,
  capital: number,
  rate: number,
  years: number
): AmortizationDataPoint[] {
  const principal = Math.max(0, price - capital);
  if (principal <= 0 || years <= 0) {
    return [];
  }

  const monthlyRate = rate / 100 / 12;
  const totalMonths = years * 12;
  const annuity = calculateAnnuityPayment(principal, rate, years);
  const data: AmortizationDataPoint[] = [];

  for (let i = 1; i <= years; i++) {
    const monthsPassed = i * 12;
    let remainingBalance: number;

    if (monthlyRate === 0) {
      remainingBalance = Math.max(0, principal - annuity * monthsPassed);
    } else {
      remainingBalance =
        principal * Math.pow(1 + monthlyRate, monthsPassed) -
        (annuity * (Math.pow(1 + monthlyRate, monthsPassed) - 1)) / monthlyRate;
    }

    data.push({
      rok: `Rok ${i}`,
      zůstatek: Math.max(0, Math.round(remainingBalance)),
    });
  }

  return data;
}

export function calculateLinearFirstPayment(
  principal: number,
  annualRatePercent: number,
  years: number
): number {
  if (principal <= 0) return 0;
  const annualRate = annualRatePercent / 100;
  const monthlyPrincipal = principal / (years * 12);
  const monthlyInterest = (principal * annualRate) / 12;
  return monthlyPrincipal + monthlyInterest;
}

function generateChartData(
  loanAmount: number,
  monthlyPayment: number,
  termYears: number,
  annualRatePercent: number
) {
  const data: { year: string; payment: number; balance: number }[] = [];
  let balance = loanAmount;
  const annualRate = annualRatePercent / 100;

  for (let year = 1; year <= Math.min(termYears, 15); year++) {
    const yearlyPayment = monthlyPayment * 12;
    const yearlyInterest = balance * annualRate;
    const yearlyPrincipal = Math.max(0, yearlyPayment - yearlyInterest);
    balance = Math.max(0, balance - yearlyPrincipal);

    data.push({
      year: `Rok ${year}`,
      payment: Math.round(yearlyPayment / 1000),
      balance: Math.round(balance / 1000),
    });
  }

  return data;
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode
): string {
  const formatted = new Intl.NumberFormat("cs-CZ", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));

  const suffix = currency === "CZK" ? "Kč" : currency;
  return `${formatted}\u00a0${suffix}`;
}
