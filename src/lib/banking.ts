import {
  calculateAnnuityPayment,
  countryConfigs,
  type CountryId,
  type CurrencyCode,
  formatCurrency,
} from "@/lib/calculators";

export type IncomeSource =
  | "employee"
  | "self_employed"
  | "company_owner"
  | "rent";

export type TaxResidency = "cz" | "sk" | "other";

export const sourceOfIncomeOptions = [
  { value: "employee" as const, label: "Zaměstnanec" },
  { value: "self_employed" as const, label: "OSVČ / Podnikatel" },
  { value: "company_owner" as const, label: "Majitel firmy" },
  { value: "rent" as const, label: "Příjem z pronájmu" },
] as const;

/** @deprecated Use sourceOfIncomeOptions */
export const incomeSourceOptions = sourceOfIncomeOptions;

export const taxResidencyOptions = [
  { value: "cz" as const, label: "Česká republika" },
  { value: "sk" as const, label: "Slovensko" },
  { value: "other" as const, label: "Jiná země" },
] as const;

export interface RiskProfile {
  incomeSource: IncomeSource;
  taxResidency: TaxResidency;
  ltv: number;
}

export type BankCategory =
  | "domestic"
  | "american"
  | "local"
  | "international";

export function getRateSourceLabel(
  category: BankCategory,
  marketLabel?: string
): string {
  switch (category) {
    case "domestic":
      return "Zdroj: aktuální česká sazba (Supabase)";
    case "american":
      return "Zdroj: česká sazba pro americkou hypotéku (Supabase)";
    case "local":
      return marketLabel
        ? `Zdroj: lokální sazba trhu ${marketLabel}`
        : "Zdroj: lokální sazba trhu";
    case "international":
      return "Zdroj: orientační mezinárodní sazba";
  }
}

/** Text zdroje u karty banky (zobrazení klientovi). */
export function getBankOfferSourceLabel(bankName: string): string {
  return `Zdroj: Oficiální web ${bankName}`;
}

/** Orientační RPSN odvozené od sazby konkrétní banky (dočasně, než bude scraper). */
export const BANK_RPSN_OFFSET = 0.25;

export function estimateBankRpsn(interestRate: number): number {
  return +(interestRate + BANK_RPSN_OFFSET).toFixed(2);
}

/**
 * Formát času aktualizace sazeb ze scrapingu.
 * Bez reálného `updatedAt` neukazujeme umělý čas.
 */
export function formatRatesUpdatedAt(updatedAt: string | null | undefined): string {
  if (!updatedAt || Number.isNaN(Date.parse(updatedAt))) {
    return "Aktualizace probíhá";
  }

  const date = new Date(updatedAt);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `Aktualizováno: ${day}.${month}.${year} v ${hours}:${minutes}`;
}

export type BankDefinition = {
  name: string;
  category: BankCategory;
};

export interface BankOffer {
  bankName: string;
  category: BankCategory;
  baseRate: number;
  adjustedRate: number;
  rpsn: number;
  monthlyPayment: number;
  riskPremium: number;
  best: boolean;
  updatedAt: string | null;
  sourceUrl: string | null;
}

export interface DTIResult {
  ratio: number;
  warning: boolean;
  level: "ok" | "warning" | "danger";
  message: string;
}

export type BankCategorySection = {
  id: BankCategory;
  title: string;
  description: string;
};

/** Kategorie pro český trh (pořadí). */
export const CZ_BANK_CATEGORIES: BankCategorySection[] = [
  {
    id: "domestic",
    title: "Vnitrostátní banky",
    description: "Klasické české hypotéky na nemovitost v ČR",
  },
  {
    id: "american",
    title: "Americké hypotéky",
    description:
      "Neúčelové úvěry zajištěné nemovitostí poskytované z ČR",
  },
  {
    id: "international",
    title: "Mezinárodní banky",
    description: "Mezinárodní financování pro klienty s příjmy ze zahraničí",
  },
];

/** Kategorie pro zahraniční trh — bez českých vnitrostátních bank. */
export const FOREIGN_MARKET_BANK_CATEGORIES: BankCategorySection[] = [
  {
    id: "american",
    title: "Americké hypotéky (z ČR)",
    description:
      "Neúčelové úvěry od českých bank zajištěné českou nemovitostí — slouží k nákupu v zahraničí (české sazby)",
  },
  {
    id: "local",
    title: "Lokální banky vybrané země",
    description:
      "Banky působící na vybraném zahraničním trhu s lokálními úrokovými sazbami",
  },
  {
    id: "international",
    title: "Mezinárodní banky",
    description:
      "Mezinárodní poskytovatelé financování pro klienty žijící v zahraničí",
  },
];

export function getBankCategoriesForMarket(
  country: CountryId
): BankCategorySection[] {
  return country === "cz" ? CZ_BANK_CATEGORIES : FOREIGN_MARKET_BANK_CATEGORIES;
}

/** @deprecated Prefer getBankCategoriesForMarket */
export const BANK_CATEGORIES = CZ_BANK_CATEGORIES;

/** České vnitrostátní banky — jen pro trh ČR */
export const DOMESTIC_BANKS: BankDefinition[] = [
  { name: "Česká spořitelna", category: "domestic" },
  { name: "Komerční banka", category: "domestic" },
  { name: "ČSOB Hypoteční banka", category: "domestic" },
  { name: "Raiffeisen Bank", category: "domestic" },
  { name: "mBank", category: "domestic" },
  { name: "UniCredit Bank", category: "domestic" },
];

/** Americké hypotéky z ČR (české sazby) */
export const AMERICAN_MORTGAGE_BANKS: BankDefinition[] = [
  { name: "Česká spořitelna", category: "american" },
  { name: "Komerční banka", category: "american" },
  { name: "ČSOB Hypoteční banka", category: "american" },
  { name: "Raiffeisen Bank", category: "american" },
  { name: "mBank", category: "american" },
  { name: "UniCredit Bank", category: "american" },
];

/** Lokální banky dané země (ne české) */
export const LOCAL_BANKS_BY_COUNTRY: Record<CountryId, string[]> = {
  cz: [],
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
    "Raiffeisenbank Hrvatska",
  ],
  bali: ["Bank Mandiri", "BCA", "BNI", "CIMB Niaga"],
  saudi: [
    "Al Rajhi Bank",
    "Saudi National Bank",
    "Riyad Bank",
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

/** Mezinárodní / expat financování */
export const INTERNATIONAL_EXPAT_BANKS: BankDefinition[] = [
  { name: "HSBC Expat", category: "international" },
  { name: "Barclays International", category: "international" },
  { name: "UBS Global", category: "international" },
  { name: "Citibank International", category: "international" },
  { name: "Standard Chartered", category: "international" },
];

export function calculateRiskPremium(profile: RiskProfile): number {
  let premium = 0;

  if (
    profile.incomeSource === "self_employed" ||
    profile.incomeSource === "company_owner"
  ) {
    premium += 0.3;
  }

  if (profile.incomeSource === "rent") {
    premium += 0.2;
  }

  if (profile.taxResidency === "other") {
    premium += 0.3;
  }

  if (profile.ltv > 80) {
    premium += 0.2;
  }

  return premium;
}

const DTI_WARNING_THRESHOLD = 0.4;
const DTI_DANGER_THRESHOLD = 0.45;

const BANK_RATE_OFFSETS_DEPRECATED = [
  { offset: -0.15, best: true },
] as const;
void BANK_RATE_OFFSETS_DEPRECATED;

/** @deprecated Prefer DOMESTIC_BANKS / LOCAL_BANKS_BY_COUNTRY */
export const countryBankConfigs: Record<CountryId, { banks: string[] }> =
  Object.fromEntries(
    (Object.keys(LOCAL_BANKS_BY_COUNTRY) as CountryId[]).map((country) => [
      country,
      {
        banks:
          country === "cz"
            ? DOMESTIC_BANKS.map((b) => b.name)
            : LOCAL_BANKS_BY_COUNTRY[country],
      },
    ])
  ) as Record<CountryId, { banks: string[] }>;

export interface CategorizedBankOffers {
  domestic: BankOffer[];
  american: BankOffer[];
  local: BankOffer[];
  international: BankOffer[];
}

/** @deprecated Use CategorizedBankOffers */
export type TripleBankOffers = CategorizedBankOffers;

/** @deprecated Use CategorizedBankOffers */
export type DualBankOffers = CategorizedBankOffers;

export type ScrapedBankRateInput = {
  bankName: string;
  rate: number;
  rpsn: number;
  /** Sazba americké hypotéky (pokud je k dispozici). */
  americanRate: number | null;
  americanRpsn: number | null;
  americanSourceUrl: string | null;
  updatedAt: string | null;
  sourceUrl: string | null;
};

function buildOffersFromScraped(
  banks: readonly BankDefinition[],
  scrapedByName: Map<string, ScrapedBankRateInput>,
  loanAmount: number,
  termYears: number,
  riskPremium: number,
  options: { useAmerican?: boolean } = {}
): BankOffer[] {
  const offers: BankOffer[] = [];
  const useAmerican = options.useAmerican === true;

  for (const bank of banks) {
    const scraped = scrapedByName.get(bank.name);
    if (!scraped) continue;

    const rate = useAmerican
      ? scraped.americanRate ?? null
      : scraped.rate;
    const rpsnValue = useAmerican
      ? scraped.americanRpsn ?? null
      : scraped.rpsn;

    if (rate == null || rpsnValue == null) continue;

    const adjustedRate = +rate.toFixed(2);
    const rpsn = +rpsnValue.toFixed(2);
    const monthlyPayment = Math.round(
      calculateAnnuityPayment(loanAmount, adjustedRate, termYears)
    );

    offers.push({
      bankName: bank.name,
      category: bank.category,
      baseRate: rate,
      adjustedRate,
      rpsn,
      monthlyPayment,
      riskPremium,
      best: false,
      updatedAt: scraped.updatedAt,
      sourceUrl: useAmerican
        ? scraped.americanSourceUrl ?? scraped.sourceUrl
        : scraped.sourceUrl,
    });
  }

  if (offers.length > 0) {
    const bestIndex = offers.reduce(
      (best, offer, index) =>
        offer.adjustedRate < offers[best].adjustedRate ? index : best,
      0
    );
    offers[bestIndex] = { ...offers[bestIndex], best: true };
  }

  return offers;
}

/**
 * Nabídky bank výhradně z vy-scrapovaných dat (`bank_rates`).
 * Banka bez záznamu v DB se do výsledků vůbec nezařadí.
 */
export function getTripleBankOffers(
  country: CountryId,
  loanAmount: number,
  termYears: number,
  profile: RiskProfile,
  scrapedCzechBanks: ScrapedBankRateInput[]
): CategorizedBankOffers {
  if (loanAmount <= 0 || termYears <= 0) {
    return { domestic: [], american: [], local: [], international: [] };
  }

  const riskPremium = calculateRiskPremium(profile);
  const isCzechMarket = country === "cz";
  const scrapedByName = new Map(
    scrapedCzechBanks.map((row) => [row.bankName, row])
  );

  return {
    domestic: isCzechMarket
      ? buildOffersFromScraped(
          DOMESTIC_BANKS,
          scrapedByName,
          loanAmount,
          termYears,
          riskPremium
        )
      : [],
    american: buildOffersFromScraped(
      AMERICAN_MORTGAGE_BANKS,
      scrapedByName,
      loanAmount,
      termYears,
      riskPremium,
      { useAmerican: true }
    ),
    // Zahraniční lokální / expat banky zatím nemají scraper → prázdné
    local: [],
    international: [],
  };
}

/** @deprecated Use getTripleBankOffers */
export function getDualBankOffers(
  country: CountryId,
  _czechBaseRate: number,
  loanAmount: number,
  termYears: number,
  profile: RiskProfile,
  scrapedCzechBanks: ScrapedBankRateInput[] = []
): CategorizedBankOffers {
  return getTripleBankOffers(
    country,
    loanAmount,
    termYears,
    profile,
    scrapedCzechBanks
  );
}

export function getBankOffers(
  country: CountryId,
  _baseRate: number,
  loanAmount: number,
  termYears: number,
  profile: RiskProfile,
  scrapedCzechBanks: ScrapedBankRateInput[] = []
): BankOffer[] {
  const offers = getTripleBankOffers(
    country,
    loanAmount,
    termYears,
    profile,
    scrapedCzechBanks
  );
  return country === "cz" ? offers.domestic : offers.american;
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
          ? `Splátka tvoří ${percent} % vašeho příjmu. Ukazatel DSTI ČNB aktuálně plošně neaktivuje — banky však často interně cílí kolem 40–45 %. Při této zátěži bude schválení obtížnější.`
          : `Splátka tvoří ${percent} % vašeho příjmu. Překračujete obvyklý bankovní práh kolem 45 % — úvěr bude obtížně schvalitelný.`,
    };
  }

  if (ratio >= DTI_WARNING_THRESHOLD) {
    return {
      ratio,
      warning: true,
      level: "warning",
      message:
        country === "cz"
          ? `Splátka tvoří ${percent} % příjmu. DSTI není plošně povinný limit ČNB, ale banky ho běžně sledují. Zvažte vyšší vlastní zdroje nebo delší splatnost.`
          : `Splátka tvoří ${percent} % příjmu. Blížíte se k doporučenému limitu kolem 45 %.`,
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
