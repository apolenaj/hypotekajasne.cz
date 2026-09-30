/**
 * Single source of truth: banks in our mortgage partner's intermediation offer.
 * HypotékaJasně.cz does not claim direct bank partnerships.
 *
 * Historical lenders (Air Bank, MONETA, …) may remain in the import manifest
 * for evidence integrity, but must not appear as current partner-offer banks.
 */

export const PARTNER_OFFER_FRAMING_CS =
  "Banky v nabídce našeho hypotečního partnera" as const;

export const PARTNER_OFFER_DISCLAIMER_CS =
  "Zveřejněné sazby jsou veřejné údaje bank (orientační). Výsledná nabídka závisí na parametrech hypotéky a posouzení banky — nejde o garantovanou sazbu našeho partnera." as const;

export const PUBLIC_RATE_ON_INQUIRY_CS =
  "Sazba na individuální poptávku" as const;

export const PUBLIC_RATE_VERIFY_ON_INQUIRY_CS =
  "Aktuální sazbu ověříme na poptávku" as const;

export const PUBLIC_RATE_PERSONAL_OFFER_ON_INQUIRY_CS =
  "Konkrétní nabídku ověříme na poptávku" as const;

export type PartnerOfferBankId =
  | "komercni-banka"
  | "csob"
  | "ceska-sporitelna"
  | "mbank"
  | "unicredit"
  | "raiffeisenbank"
  | "oberbank";

export type PartnerOfferBank = {
  slug: PartnerOfferBankId;
  name: string;
  /** Display name in scrape / calculator lists when different. */
  scrapeName: string;
  websiteUrl: string;
  /** Order in partner offer (stable). */
  sortOrder: number;
};

/**
 * Exactly these seven banks — order matches product brief.
 */
export const PARTNER_OFFER_BANKS: readonly PartnerOfferBank[] = [
  {
    slug: "komercni-banka",
    name: "Komerční banka",
    scrapeName: "Komerční banka",
    websiteUrl: "https://www.kb.cz/",
    sortOrder: 1,
  },
  {
    slug: "csob",
    name: "ČSOB",
    scrapeName: "ČSOB Hypoteční banka",
    websiteUrl: "https://www.csob.cz/",
    sortOrder: 2,
  },
  {
    slug: "ceska-sporitelna",
    name: "Česká spořitelna",
    scrapeName: "Česká spořitelna",
    websiteUrl: "https://www.csas.cz/",
    sortOrder: 3,
  },
  {
    slug: "mbank",
    name: "mBank",
    scrapeName: "mBank",
    websiteUrl: "https://www.mbank.cz/",
    sortOrder: 4,
  },
  {
    slug: "unicredit",
    name: "UniCredit Bank",
    scrapeName: "UniCredit Bank",
    websiteUrl: "https://www.unicreditbank.cz/",
    sortOrder: 5,
  },
  {
    slug: "raiffeisenbank",
    name: "Raiffeisenbank",
    scrapeName: "Raiffeisen Bank",
    websiteUrl: "https://www.rb.cz/",
    sortOrder: 6,
  },
  {
    slug: "oberbank",
    name: "Oberbank",
    scrapeName: "Oberbank",
    websiteUrl: "https://www.oberbank.cz/",
    sortOrder: 7,
  },
] as const;

export const PARTNER_OFFER_BANK_SLUGS: readonly PartnerOfferBankId[] =
  PARTNER_OFFER_BANKS.map((b) => b.slug);

const PARTNER_SLUG_SET = new Set<string>(PARTNER_OFFER_BANK_SLUGS);

/**
 * Banks kept in the partner offer without a currently publishable numeric rate
 * for ranking. ČS uses a verified public “from” floor instead (see PUBLIC_FLOOR).
 */
export const PARTNER_OFFER_INQUIRY_MESSAGE: Record<
  PartnerOfferBankId,
  typeof PUBLIC_RATE_ON_INQUIRY_CS | typeof PUBLIC_RATE_VERIFY_ON_INQUIRY_CS
> = {
  "komercni-banka": PUBLIC_RATE_ON_INQUIRY_CS,
  csob: PUBLIC_RATE_VERIFY_ON_INQUIRY_CS,
  "ceska-sporitelna": PUBLIC_RATE_VERIFY_ON_INQUIRY_CS,
  mbank: PUBLIC_RATE_ON_INQUIRY_CS,
  unicredit: PUBLIC_RATE_ON_INQUIRY_CS,
  raiffeisenbank: PUBLIC_RATE_ON_INQUIRY_CS,
  oberbank: PUBLIC_RATE_ON_INQUIRY_CS,
};

/**
 * Verified public “from” floor for inquiry cards — never invents a fixation/LTV matrix.
 * ČS: official pomůcka sazeb (platnost od 11. 9. 2026), ověřeno 28. 9. 2026.
 */
export type PartnerOfferPublicFloor = {
  /** Customer-facing rate line, e.g. „Od 5,39 % p. a.“ */
  headline: string;
  /** One short supporting sentence under the rate. */
  summary: string;
  /** Always-visible essentials: LTV, fixation, conditional discounts. */
  conditionsShort: string;
  /** Fuller conditions for the expandable panel. */
  conditions: string;
  /** Human-readable successful verification date (not a mere check attempt). */
  verifiedAtLabel: string;
  sourceValidFromLabel: string;
};

export const PARTNER_OFFER_PUBLIC_FLOOR: Partial<
  Record<PartnerOfferBankId, PartnerOfferPublicFloor>
> = {
  "ceska-sporitelna": {
    headline: "Od 5,39 % p. a.",
    summary: "Veřejná sazba při splnění podmínek.",
    conditionsShort:
      "LTV do 80 % · fixace 1–3 roky · sleva při účtu ČS, pojištění schopnosti splácet a Hypotéce pro budoucnost",
    conditions:
      "Veřejná sazba „od“ při LTV do 80 % a fixaci 1–3 roky. Podmíněné slevy: účet u ČS, pojištění schopnosti splácet a Hypotéka pro budoucnost. Nejde o individuální nabídku klientovi.",
    verifiedAtLabel: "28. 9. 2026",
    sourceValidFromLabel: "11. 9. 2026",
  },
};

/** Short customer-facing copy for pending (inquiry) cards without a numeric floor. */
export type PartnerOfferPendingCardCopy = {
  rateLabel: string;
  blurb: string;
};

export const PARTNER_OFFER_PENDING_CARD_COPY: Partial<
  Record<PartnerOfferBankId, PartnerOfferPendingCardCopy>
> = {
  csob: {
    rateLabel: "Sazba na poptávku",
    blurb: "Ověříme nabídku pro vaše parametry.",
  },
  raiffeisenbank: {
    rateLabel: "Individuální sazba",
    blurb: "Konkrétní sazbu zjistíme na poptávku.",
  },
  oberbank: {
    rateLabel: "Individuální sazba",
    blurb: "Konkrétní sazbu zjistíme na poptávku.",
  },
};

/** @deprecated Use PARTNER_OFFER_PUBLIC_FLOOR — kept for short home-aside labels. */
export const PARTNER_OFFER_FLOOR_NOTE_CS: Partial<
  Record<PartnerOfferBankId, string>
> = {
  "ceska-sporitelna":
    "Od 5,39 % p. a. (s podmínkami). Konkrétní nabídku ověříme na poptávku.",
};

/** Official rate-source URLs for inquiry cards (not marketing Homepages). */
export const PARTNER_OFFER_RATE_SOURCE_URL: Partial<
  Record<PartnerOfferBankId, string>
> = {
  csob: "https://www.csob.cz/lide/poplatky-a-sazby/sazby",
  "ceska-sporitelna":
    "https://cdn0.erstegroup.com/content/dam/cz/csas/www_csas_cz/dokumenty/produkty/osobni-finance/hypoteky/hypoteka/produktova-stranka/pomucka_sazby_hypotecnich_uveru.pdf",
  raiffeisenbank: "https://www.rb.cz/osobni/hypoteky",
  oberbank: "https://www.oberbank.cz/hypotecni-uvery",
  mbank:
    "https://www.mbank.cz/informace-k-produktum/urokovy-listek/osobni-finance/urokovy_listek_aktualni.pdf",
  "komercni-banka":
    "https://www.kb.cz/cs/obcane/pujcky/hypoteky/hypoteka",
  unicredit: "https://www.unicreditbank.cz/cs/ostatni/urokove-sazby.html",
};

const LENDER_SLUG_ALIASES: Record<string, PartnerOfferBankId> = {
  "komercni-banka": "komercni-banka",
  kb: "komercni-banka",
  "kb-cz": "komercni-banka",
  csob: "csob",
  "csob-hypotecni-banka": "csob",
  "ceska-sporitelna": "ceska-sporitelna",
  cs: "ceska-sporitelna",
  mbank: "mbank",
  unicredit: "unicredit",
  "unicredit-bank": "unicredit",
  raiffeisenbank: "raiffeisenbank",
  "raiffeisen-bank": "raiffeisenbank",
  rb: "raiffeisenbank",
  oberbank: "oberbank",
};

export function isPartnerOfferBankSlug(slug: string): boolean {
  return PARTNER_SLUG_SET.has(slug);
}

/**
 * Normalize a client-supplied lender id for lead/metadata storage.
 * Rejects historical market banks (Air Bank, MONETA, …).
 */
export function normalizePartnerLenderSlug(
  raw: unknown
): PartnerOfferBankId | null {
  if (typeof raw !== "string") return null;
  const key = raw.trim().toLowerCase().replace(/\s+/g, "-");
  if (!key) return null;
  return LENDER_SLUG_ALIASES[key] ?? null;
}

export function getPartnerOfferBank(
  slug: string
): PartnerOfferBank | undefined {
  const normalized = normalizePartnerLenderSlug(slug) ?? slug;
  return PARTNER_OFFER_BANKS.find((b) => b.slug === normalized);
}

export function partnerOfferSortOrder(slug: string): number {
  return getPartnerOfferBank(slug)?.sortOrder ?? 999;
}

/**
 * Partner-offer public rates must not include demoted historical rows.
 * ČS Oznámení / campaign rows stay in the full audit catalog only.
 */
export function isPartnerOfferPublicRate(input: {
  lenderSlug: string;
  pricingScenarioKey?: string | null;
}): boolean {
  if (!isPartnerOfferBankSlug(input.lenderSlug)) return false;
  if (input.lenderSlug === "ceska-sporitelna") return false;
  const key = input.pricingScenarioKey ?? "";
  if (key.includes("oznameni")) return false;
  if (key.includes("web_campaign")) return false;
  return true;
}

/**
 * Sort key for rate ranking: numeric rates first (ascending), then missing.
 * Never treat null/NaN as cheapest.
 */
export function compareRatesNullable(
  a: number | null | undefined,
  b: number | null | undefined
): number {
  const aOk = a != null && Number.isFinite(a) && a > 0;
  const bOk = b != null && Number.isFinite(b) && b > 0;
  if (aOk && bOk) return (a as number) - (b as number);
  if (aOk && !bOk) return -1;
  if (!aOk && bOk) return 1;
  return 0;
}
