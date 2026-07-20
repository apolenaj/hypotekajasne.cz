/**
 * Centralizované formátování peněz a sazeb (cs-CZ).
 * Nikdy nemění částku — jen zobrazí správný symbol / kód měny.
 */

export type MoneyCurrency =
  | "CZK"
  | "EUR"
  | "USD"
  | "AED"
  | "SAR"
  | "IDR"
  | "GBP";

const CURRENCY_DISPLAY: Record<
  MoneyCurrency,
  { suffix: string; intlCurrency?: string }
> = {
  CZK: { suffix: "Kč", intlCurrency: "CZK" },
  EUR: { suffix: "€", intlCurrency: "EUR" },
  USD: { suffix: "USD", intlCurrency: "USD" },
  AED: { suffix: "AED", intlCurrency: "AED" },
  SAR: { suffix: "SAR", intlCurrency: "SAR" },
  IDR: { suffix: "IDR", intlCurrency: "IDR" },
  GBP: { suffix: "GBP", intlCurrency: "GBP" },
};

export type FormatMoneyOptions = {
  /** Max. počet desetinných míst (default 0) */
  fractionDigits?: number;
  /** Použít Intl currency style místo suffixu (CZK → „4 500 000 Kč“) */
  style?: "suffix" | "intl";
};

/**
 * Formátuje částku v dané měně. Žádná konverze kurzů.
 */
export function formatMoney(
  amount: number,
  currency: MoneyCurrency = "CZK",
  options: FormatMoneyOptions = {}
): string {
  if (!Number.isFinite(amount)) return "—";
  const digits = options.fractionDigits ?? 0;
  const meta = CURRENCY_DISPLAY[currency] ?? { suffix: currency };

  if (options.style === "intl" && meta.intlCurrency) {
    return new Intl.NumberFormat("cs-CZ", {
      style: "currency",
      currency: meta.intlCurrency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(amount);
  }

  const formatted = new Intl.NumberFormat("cs-CZ", {
    style: "decimal",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(digits === 0 ? Math.round(amount) : amount);

  return `${formatted}\u00a0${meta.suffix}`;
}

/** Úroková / výnosová sazba: „4,59 %“ nebo „4,59 % p. a.“ */
export function formatRate(
  percent: number,
  options: { perAnnum?: boolean; fractionDigits?: number } = {}
): string {
  if (!Number.isFinite(percent)) return "—";
  const digits = options.fractionDigits ?? 2;
  const body = percent.toLocaleString("cs-CZ", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return options.perAnnum ? `${body}\u00a0%\u00a0p.\u00a0a.` : `${body}\u00a0%`;
}

/** Kompaktní osa grafu: 1 200 000 → „1,2 mil.“ / 45 000 → „45 tis.“ */
export function formatMoneyCompact(
  amount: number,
  currency: MoneyCurrency = "CZK"
): string {
  if (!Number.isFinite(amount)) return "—";
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "−" : "";
  const meta = CURRENCY_DISPLAY[currency] ?? { suffix: currency };

  if (abs >= 1_000_000) {
    const mil = abs / 1_000_000;
    return `${sign}${mil.toLocaleString("cs-CZ", {
      maximumFractionDigits: 1,
    })}\u00a0mil.\u00a0${meta.suffix}`;
  }
  if (abs >= 1_000) {
    const tis = abs / 1_000;
    return `${sign}${tis.toLocaleString("cs-CZ", {
      maximumFractionDigits: 0,
    })}\u00a0tis.\u00a0${meta.suffix}`;
  }
  return formatMoney(amount, currency);
}

/** České labely běžných kalkulačkových polí */
export const CALCULATOR_FIELD_LABELS_CS = {
  purchasePrice: "Kupní cena",
  downPayment: "Vlastní prostředky",
  ownFunds: "Vlastní prostředky",
  loanAmount: "Výše úvěru",
  interestRate: "Úroková sazba",
  term: "Doba splatnosti",
  monthlyRent: "Měsíční nájemné",
  vacancy: "Neobsazenost",
  maintenance: "Údržba a opravy",
  management: "Správa nemovitosti",
  annualAppreciation: "Roční růst hodnoty",
  transactionCosts: "Transakční náklady",
  monthlyPayment: "Měsíční splátka",
  totalPaid: "Celkem zaplaceno",
  totalInterest: "Úroky",
  safetyScenario: "Bezpečnostní scénář",
  advancedResults: "Pokročilé výsledky",
} as const;
