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

export type StandardFinancingType = "annuity" | "linear";
export type DubaiFinancingType =
  | "developer-plan"
  | "non-resident"
  | "american-cz-collateral";
export type FinancingType = StandardFinancingType | DubaiFinancingType;

export interface CountryConfig {
  id: CountryId;
  label: string;
  currency: CurrencyCode;
  defaultPrice: number;
  defaultSavings: number;
  defaultRate: number;
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
    defaultRate: 4.5,
    defaultTerm: 30,
    defaultRentalYield: 0.036,
  },
  dubai: {
    id: "dubai",
    label: "Dubaj (SAE)",
    currency: "AED",
    defaultPrice: 2_500_000,
    defaultSavings: 500_000,
    defaultRate: 4.5,
    defaultTerm: 25,
    defaultRentalYield: 0.065,
  },
  spain: {
    id: "spain",
    label: "Španělsko",
    currency: "EUR",
    defaultPrice: 350_000,
    defaultSavings: 70_000,
    defaultRate: 3.8,
    defaultTerm: 30,
    defaultRentalYield: 0.05,
  },
  italy: {
    id: "italy",
    label: "Itálie",
    currency: "EUR",
    defaultPrice: 400_000,
    defaultSavings: 80_000,
    defaultRate: 4.0,
    defaultTerm: 25,
    defaultRentalYield: 0.0525,
  },
  croatia: {
    id: "croatia",
    label: "Chorvatsko",
    currency: "EUR",
    defaultPrice: 300_000,
    defaultSavings: 60_000,
    defaultRate: 4.2,
    defaultTerm: 20,
    defaultRentalYield: 0.0575,
  },
  bali: {
    id: "bali",
    label: "Bali",
    currency: "USD",
    defaultPrice: 350_000,
    defaultSavings: 70_000,
    defaultRate: 5.5,
    defaultTerm: 20,
    defaultRentalYield: 0.125,
  },
  saudi: {
    id: "saudi",
    label: "Saúdská Arábie",
    currency: "SAR",
    defaultPrice: 1_200_000,
    defaultSavings: 240_000,
    defaultRate: 4.8,
    defaultTerm: 25,
    defaultRentalYield: 0.075,
  },
  slovakia: {
    id: "slovakia",
    label: "Slovensko",
    currency: "EUR",
    defaultPrice: 220_000,
    defaultSavings: 44_000,
    defaultRate: 4.3,
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
  financingType: FinancingType
): CurrencyCode {
  if (country === "dubai" && financingType === "american-cz-collateral") {
    return "CZK";
  }
  return countryConfigs[country].currency;
}

export function shouldShowInterestRate(
  country: CountryId,
  financingType: FinancingType
): boolean {
  return !(country === "dubai" && financingType === "developer-plan");
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

export function calculateMortgage(input: CalculatorInput): CalculatorResult {
  const { country, price, savings, interestRate, termYears, financingType } =
    input;
  const currency = getEffectiveCurrency(country, financingType);
  const loanAmount = Math.max(0, price - savings);
  const ltv = price > 0 ? Math.round((loanAmount / price) * 100) : 0;

  let monthlyPayment = 0;
  let effectiveTerm = termYears;
  let financingLabel = "Anuitní splácení";
  let collateral = `Nemovitost (LTV ${ltv}%)`;
  let showChart = false;

  if (country === "dubai") {
    if (financingType === "developer-plan") {
      const constructionMonths = 36;
      const postHandoverYears = 20;
      const constructionPayment = loanAmount * 0.6;
      const postHandoverLoan = loanAmount * 0.4;
      const constructionMonthly = constructionPayment / constructionMonths;
      const postHandoverMonthly = calculateAnnuityPayment(
        postHandoverLoan,
        4.5,
        postHandoverYears
      );
      monthlyPayment = Math.round(
        constructionMonthly * 0.4 + postHandoverMonthly * 0.6
      );
      effectiveTerm = postHandoverYears + 3;
      financingLabel = "Developer Payment Plan (Off-plan)";
      collateral = "Off-plan nemovitost v SAE";
      showChart = true;
    } else if (financingType === "non-resident") {
      monthlyPayment = calculateAnnuityPayment(
        loanAmount,
        interestRate,
        termYears
      );
      financingLabel = "Non-resident hypotéka";
      collateral = "Nemovitost v SAE (LTV " + ltv + "%)";
      showChart = true;
    } else {
      monthlyPayment = calculateAnnuityPayment(
        loanAmount,
        interestRate,
        termYears
      );
      financingLabel = "Americká hypotéka (Zástava v ČR)";
      collateral = "Česká nemovitost jako zástava";
      showChart = true;
    }
  } else if (financingType === "linear") {
    monthlyPayment = calculateLinearFirstPayment(
      loanAmount,
      interestRate,
      termYears
    );
    financingLabel = "Lineární splácení";
  } else {
    monthlyPayment = calculateAnnuityPayment(
      loanAmount,
      interestRate,
      termYears
    );
    financingLabel = "Anuitní splácení";
  }

  monthlyPayment = Math.round(monthlyPayment);
  const totalPayment = Math.round(monthlyPayment * effectiveTerm * 12);
  const totalInterest = Math.max(0, totalPayment - loanAmount);

  const chartData = showChart
    ? generateChartData(
        loanAmount,
        monthlyPayment,
        effectiveTerm,
        financingType === "developer-plan" ? 4.5 : interestRate
      )
    : [];

  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    loanAmount,
    termYears: effectiveTerm,
    ltv,
    currency,
    collateral,
    financingLabel,
    showChart,
    chartData,
  };
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode
): string {
  return (
    new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ` ${currency}`
  );
}
