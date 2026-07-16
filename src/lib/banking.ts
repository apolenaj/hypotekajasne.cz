import {
  calculateAnnuityPayment,
  type CountryId,
  type CurrencyCode,
  formatCurrency,
} from "@/lib/calculators";

export type IncomeSource =
  | "employee"
  | "osvc"
  | "sro_owner"
  | "rent"
  | "foreign";

export type TaxResidency = "cz" | "eu" | "non-eu";

export const sourceOfIncomeOptions = [
  { value: "employee" as const, label: "Zaměstnanec (HPP)" },
  { value: "osvc" as const, label: "OSVČ (Podnikatel)" },
  { value: "sro_owner" as const, label: "Majitel s.r.o." },
  { value: "rent" as const, label: "Příjmy z pronájmu" },
  { value: "foreign" as const, label: "Příjmy ze zahraničí" },
] as const;

/** @deprecated Use sourceOfIncomeOptions */
export const incomeSourceOptions = sourceOfIncomeOptions;

export const taxResidencyOptions = [
  { value: "cz" as const, label: "Česká republika" },
  { value: "eu" as const, label: "EU" },
  { value: "non-eu" as const, label: "Mimo EU" },
];

export interface RiskProfile {
  incomeSource: IncomeSource;
  taxResidency: TaxResidency;
  ltv: number;
}

export interface BankOffer {
  bankName: string;
  baseRate: number;
  adjustedRate: number;
  monthlyPayment: number;
  riskPremium: number;
  best: boolean;
}

export interface DTIResult {
  ratio: number;
  warning: boolean;
  level: "ok" | "warning" | "danger";
  message: string;
}

const DTI_WARNING_THRESHOLD = 0.4;
const DTI_DANGER_THRESHOLD = 0.45;

const BANK_RATE_OFFSETS = [
  { offset: -0.15, best: true },
  { offset: 0, best: false },
  { offset: 0.1, best: false },
  { offset: 0.25, best: false },
  { offset: 0.4, best: false },
] as const;

const bankNamesByCountry: Record<CountryId, string[]> = {
  cz: [
    "Moneta Money Bank",
    "ČSOB",
    "Česká spořitelna",
    "Komerční banka",
    "Raiffeisenbank",
  ],
  dubai: [
    "Emirates NBD",
    "Mashreq Bank",
    "Dubai Islamic Bank",
    "FAB",
    "ADCB",
  ],
  spain: ["BBVA", "Banco Santander", "CaixaBank", "Sabadell", "Bankinter"],
  italy: [
    "Intesa Sanpaolo",
    "UniCredit",
    "BPER Banca",
    "Banco BPM",
    "Monte dei Paschi",
  ],
  croatia: [
    "Zagrebačka banka",
    "PBZ",
    "Erste Bank",
    "OTP banka",
    "Raiffeisenbank",
  ],
  bali: [
    "Bank Mandiri",
    "BCA",
    "BNI",
    "CIMB Niaga",
    "Mezinárodní financování",
  ],
  saudi: [
    "Al Rajhi Bank",
    "Saudi National Bank",
    "Riyad Bank",
    "SNB Capital",
    "Banque Saudi Fransi",
  ],
  slovakia: [
    "VÚB",
    "Tatra banka",
    "Slovenská sporiteľňa",
    "ČSOB SK",
    "UniCredit SK",
  ],
};

export function calculateRiskPremium(profile: RiskProfile): number {
  let premium = 0;

  if (profile.incomeSource === "osvc" || profile.incomeSource === "sro_owner") {
    premium += 0.3;
  }

  if (profile.incomeSource === "rent") {
    premium += 0.2;
  }

  if (profile.incomeSource === "foreign") {
    premium += 0.35;
  }

  if (profile.taxResidency === "non-eu") {
    premium += 0.3;
  }

  if (profile.ltv > 80) {
    premium += 0.2;
  }

  return premium;
}

const INTERNATIONAL_LENDERS = [
  "HSBC Expat",
  "Barclays Int.",
  "UBS Global",
  "Credit Suisse",
  "Citibank Int.",
] as const;

export const countryBankConfigs: Record<CountryId, { banks: string[] }> =
  Object.fromEntries(
    Object.entries(bankNamesByCountry).map(([country, banks]) => [
      country,
      { banks },
    ])
  ) as Record<CountryId, { banks: string[] }>;

const CZECH_BANKS = [
  "Česká spořitelna",
  "ČSOB",
  "Moneta",
  "Komerční banka",
  "Raiffeisenbank",
] as const;

export interface TripleBankOffers {
  international: BankOffer[];
  local: BankOffer[];
  czech: BankOffer[];
}

/** @deprecated Use TripleBankOffers */
export type DualBankOffers = TripleBankOffers;

function buildOfferSet(
  names: readonly string[],
  rates: number[],
  loanAmount: number,
  termYears: number,
  effectiveBase: number,
  riskPremium: number,
  bestIndex: number
): BankOffer[] {
  return names.map((bankName, index) => {
    const adjustedRate = +rates[index].toFixed(2);
    const monthlyPayment = Math.round(
      calculateAnnuityPayment(loanAmount, adjustedRate, termYears)
    );

    return {
      bankName,
      baseRate: effectiveBase,
      adjustedRate,
      monthlyPayment,
      riskPremium,
      best: index === bestIndex,
    };
  });
}

export function getTripleBankOffers(
  country: CountryId,
  baseRate: number,
  loanAmount: number,
  termYears: number,
  profile: RiskProfile
): TripleBankOffers {
  if (loanAmount <= 0 || termYears <= 0) {
    return { international: [], local: [], czech: [] };
  }

  const riskPremium = calculateRiskPremium(profile);
  const effectiveBase = baseRate + riskPremium;
  const localBanks = countryBankConfigs[country].banks;

  const internationalRates = INTERNATIONAL_LENDERS.map(
    (_, index) => effectiveBase + 0.3 + index * 0.1
  );
  const localRates = localBanks.map((_, index) => effectiveBase + index * 0.15);
  const czechRates = CZECH_BANKS.map(
    (_, index) => effectiveBase + 0.8 + index * 0.1
  );

  return {
    international: buildOfferSet(
      INTERNATIONAL_LENDERS,
      internationalRates,
      loanAmount,
      termYears,
      effectiveBase,
      riskPremium,
      0
    ),
    local: buildOfferSet(
      localBanks,
      localRates,
      loanAmount,
      termYears,
      effectiveBase,
      riskPremium,
      0
    ),
    czech: buildOfferSet(
      CZECH_BANKS,
      czechRates,
      loanAmount,
      termYears,
      effectiveBase,
      riskPremium,
      0
    ),
  };
}

/** @deprecated Use getTripleBankOffers */
export function getDualBankOffers(
  country: CountryId,
  baseRate: number,
  loanAmount: number,
  termYears: number,
  profile: RiskProfile
): TripleBankOffers {
  return getTripleBankOffers(country, baseRate, loanAmount, termYears, profile);
}

export function getBankOffers(
  country: CountryId,
  baseRate: number,
  loanAmount: number,
  termYears: number,
  profile: RiskProfile
): BankOffer[] {
  if (loanAmount <= 0 || termYears <= 0) {
    return [];
  }

  const riskPremium = calculateRiskPremium(profile);
  const effectiveBase = baseRate + riskPremium;
  const bankNames = bankNamesByCountry[country];

  return BANK_RATE_OFFSETS.map((template, index) => {
    const adjustedRate = +(effectiveBase + template.offset).toFixed(2);
    const monthlyPayment = Math.round(
      calculateAnnuityPayment(loanAmount, adjustedRate, termYears)
    );

    return {
      bankName: bankNames[index],
      baseRate: effectiveBase,
      adjustedRate,
      monthlyPayment,
      riskPremium,
      best: template.best,
    };
  });
}

export function checkDTI(
  monthlyPayment: number,
  netIncome: number,
  country: CountryId
): DTIResult {
  if (netIncome <= 0) {
    return {
      ratio: 0,
      warning: false,
      level: "ok",
      message: "",
    };
  }

  const ratio = monthlyPayment / netIncome;
  const percent = Math.round(ratio * 100);

  if (ratio >= DTI_DANGER_THRESHOLD) {
    return {
      ratio,
      warning: true,
      level: "danger",
      message:
        country === "cz"
          ? `Splátka tvoří ${percent} % vašeho příjmu. Překračujete limit ČNB (45 % DSTI) – banka pravděpodobně úvěr neschválí.`
          : `Splátka tvoří ${percent} % vašeho příjmu. Překračujete doporučený limit 45 % – úvěr bude obtížně schvalitelný.`,
    };
  }

  if (ratio >= DTI_WARNING_THRESHOLD) {
    return {
      ratio,
      warning: true,
      level: "warning",
      message:
        country === "cz"
          ? `Splátka tvoří ${percent} % příjmu. Blížíte se k limitu ČNB (45 % DSTI). Zvažte vyšší vlastní zdroje nebo delší splatnost.`
          : `Splátka tvoří ${percent} % příjmu. Blížíte se k doporučenému limitu 45 %.`,
    };
  }

  return {
    ratio,
    warning: false,
    level: "ok",
    message: `Splátka tvoří ${percent} % příjmu – v rámci doporučených limitů.`,
  };
}

export function formatOfferRate(rate: number): string {
  return `${rate.toFixed(2)} %`;
}

export function formatOfferPayment(
  amount: number,
  currency: CurrencyCode
): string {
  return formatCurrency(amount, currency);
}
