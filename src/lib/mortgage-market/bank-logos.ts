import type { PartnerOfferBankId } from "@/lib/mortgage-market/partner-offer-banks";
import { PARTNER_OFFER_BANKS } from "@/lib/mortgage-market/partner-offer-banks";

export type BankLogoSize = "card" | "row" | "compact";

export type BankLogoAsset = {
  /** Static path under /public */
  src: `/images/banks/${string}.svg`;
  /**
   * Optical scale inside the reserved box (1 = fill contain).
   * Slightly smaller for wordmarks that read large at equal height.
   */
  opticalScale: number;
};

/**
 * Partner-offer bank slug → local logo asset.
 * Sources documented in public/images/banks/SOURCES.json.
 */
export const PARTNER_BANK_LOGO_BY_SLUG: Record<
  PartnerOfferBankId,
  BankLogoAsset
> = {
  "komercni-banka": {
    src: "/images/banks/komercni-banka.svg",
    opticalScale: 0.92,
  },
  csob: {
    src: "/images/banks/csob.svg",
    // Emblem-tall mark — keep slightly smaller so it doesn’t dominate.
    opticalScale: 0.88,
  },
  "ceska-sporitelna": {
    src: "/images/banks/ceska-sporitelna.svg",
    opticalScale: 0.95,
  },
  mbank: {
    src: "/images/banks/mbank.svg",
    opticalScale: 0.9,
  },
  unicredit: {
    src: "/images/banks/unicredit.svg",
    opticalScale: 0.92,
  },
  raiffeisenbank: {
    src: "/images/banks/raiffeisenbank.svg",
    opticalScale: 0.94,
  },
  oberbank: {
    src: "/images/banks/oberbank.svg",
    opticalScale: 0.9,
  },
};

const BANK_NAME_TO_SLUG = new Map<string, PartnerOfferBankId>();
for (const bank of PARTNER_OFFER_BANKS) {
  BANK_NAME_TO_SLUG.set(bank.name.toLocaleLowerCase("cs-CZ"), bank.slug);
  BANK_NAME_TO_SLUG.set(bank.scrapeName.toLocaleLowerCase("cs-CZ"), bank.slug);
}

export function resolvePartnerBankLogoSlug(
  slugOrName: string | null | undefined
): PartnerOfferBankId | null {
  if (!slugOrName) return null;
  const raw = slugOrName.trim();
  if (!raw) return null;
  if (raw in PARTNER_BANK_LOGO_BY_SLUG) {
    return raw as PartnerOfferBankId;
  }
  return BANK_NAME_TO_SLUG.get(raw.toLocaleLowerCase("cs-CZ")) ?? null;
}

export function getPartnerBankLogoAsset(
  slugOrName: string | null | undefined
): BankLogoAsset | null {
  const slug = resolvePartnerBankLogoSlug(slugOrName);
  return slug ? PARTNER_BANK_LOGO_BY_SLUG[slug] : null;
}

export const BANK_LOGO_BOX_PX: Record<
  BankLogoSize,
  { width: number; height: number }
> = {
  card: { width: 144, height: 40 },
  row: { width: 96, height: 28 },
  compact: { width: 72, height: 22 },
};
