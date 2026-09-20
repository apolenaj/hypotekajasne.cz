/**
 * Order-form property identification + validation for Investiční rentgen checkout.
 * Financial engine fields stay in RentgenCheckoutPropertySnapshot; narrative/ID
 * fields are persisted in order.input_snapshot (not Stripe metadata).
 */

import type { RentgenCheckoutPropertySnapshot } from "@/lib/property-rentgen/checkout-metadata";

export const PROPERTY_DESCRIPTION_MAX = 3000;
export const PROPERTY_DESCRIPTION_MIN = 40;
export const RENTGEN_PHOTO_MAX_COUNT = 20;
export const RENTGEN_PHOTO_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
export const RENTGEN_PHOTO_ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type RentgenPhotoMime = (typeof RENTGEN_PHOTO_ALLOWED_MIME)[number];

export type PropertyIdentificationMode = "url" | "address" | "both";

export type RentgenPropertyType =
  | "Byt"
  | "Rodinný dům"
  | "Bytový dům"
  | "Pozemek"
  | "Komerční"
  | "Jiná"
  | "";

export type RentgenPropertyLayout =
  | "1+kk"
  | "1+1"
  | "2+kk"
  | "2+1"
  | "3+kk"
  | "3+1"
  | "4+kk"
  | "4+1"
  | "5+"
  | "jiná"
  | "";

export type RentgenPropertyCondition =
  | "Novostavba"
  | "Velmi dobrý"
  | "Dobrý"
  | "Před rekonstrukcí"
  | "Po rekonstrukci"
  | "Ve výstavbě"
  | "Jiný"
  | "";

export type RentgenOwnershipType =
  | "Osobní"
  | "Družstevní"
  | "Jiná forma"
  | "";

export type RentgenOrderPhotoRef = {
  id: string;
  storageKey: string;
  mimeType: string;
  size: number;
  position: number;
  originalName: string;
  createdAt: string;
};

/** Full order snapshot — financial + identification + photos. */
export type RentgenOrderInputSnapshot = RentgenCheckoutPropertySnapshot & {
  street?: string;
  postalCode?: string;
  propertyAddress?: string;
  listingUrl?: string;
  propertyType?: RentgenPropertyType | string;
  layout?: RentgenPropertyLayout | string;
  condition?: RentgenPropertyCondition | string;
  ownershipType?: RentgenOwnershipType | string;
  propertyDescription?: string;
  identificationMode?: PropertyIdentificationMode;
  photos?: RentgenOrderPhotoRef[];
  productCode?: string;
  /** Reserved for later listing enrichment (no scraping in v1). */
  listingTitle?: string;
  listingPrice?: number;
  listingDescription?: string;
  listingSource?: string;
  listingRetrievedAt?: string;
};

export type OrderPropertyFormState = {
  identificationMode: PropertyIdentificationMode;
  listingUrl: string;
  street: string;
  city: string;
  postalCode: string;
  propertyDescription: string;
  propertyType: RentgenPropertyType;
  layout: RentgenPropertyLayout;
  floorArea: string;
  condition: RentgenPropertyCondition;
  ownershipType: RentgenOwnershipType;
  purchasePrice: string;
  monthlyRent: string;
  equity: string;
};

export const EMPTY_ORDER_PROPERTY_FORM: OrderPropertyFormState = {
  identificationMode: "url",
  listingUrl: "",
  street: "",
  city: "",
  postalCode: "",
  propertyDescription: "",
  propertyType: "",
  layout: "",
  floorArea: "",
  condition: "",
  ownershipType: "",
  purchasePrice: "",
  monthlyRent: "",
  equity: "",
};

export const PROPERTY_TYPE_OPTIONS: Exclude<RentgenPropertyType, "">[] = [
  "Byt",
  "Rodinný dům",
  "Bytový dům",
  "Pozemek",
  "Komerční",
  "Jiná",
];

export const PROPERTY_LAYOUT_OPTIONS: Exclude<RentgenPropertyLayout, "">[] = [
  "1+kk",
  "1+1",
  "2+kk",
  "2+1",
  "3+kk",
  "3+1",
  "4+kk",
  "4+1",
  "5+",
  "jiná",
];

export const PROPERTY_CONDITION_OPTIONS: Exclude<
  RentgenPropertyCondition,
  ""
>[] = [
  "Novostavba",
  "Velmi dobrý",
  "Dobrý",
  "Před rekonstrukcí",
  "Po rekonstrukci",
  "Ve výstavbě",
  "Jiný",
];

export const OWNERSHIP_TYPE_OPTIONS: Exclude<RentgenOwnershipType, "">[] = [
  "Osobní",
  "Družstevní",
  "Jiná forma",
];

export function isAllowedPhotoMime(mime: string): mime is RentgenPhotoMime {
  return (RENTGEN_PHOTO_ALLOWED_MIME as readonly string[]).includes(mime);
}

export function isValidHttpUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  try {
    const u = new URL(trimmed);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function hasExactAddress(street: string, city: string): boolean {
  return street.trim().length >= 3 && city.trim().length >= 2;
}

export function buildPropertyAddressLine(args: {
  street?: string;
  city?: string;
  postalCode?: string;
}): string {
  const street = args.street?.trim() || "";
  const city = args.city?.trim() || "";
  const postal = args.postalCode?.trim() || "";
  const cityPart = [postal, city].filter(Boolean).join(" ");
  return [street, cityPart].filter(Boolean).join(", ");
}

export type OrderPropertyValidationResult =
  | { ok: true }
  | { ok: false; errors: string[] };

export function validateOrderPropertyForCheckout(args: {
  form: OrderPropertyFormState;
  photoCount: number;
  requirePhotoWithoutListing: boolean;
}): OrderPropertyValidationResult {
  const errors: string[] = [];
  const { form } = args;
  const mode = form.identificationMode;
  const urlOk = isValidHttpUrl(form.listingUrl);
  const addressOk = hasExactAddress(form.street, form.city);
  const wantsUrl = mode === "url" || mode === "both";
  const wantsAddress = mode === "address" || mode === "both";

  if (wantsUrl && form.listingUrl.trim() && !urlOk) {
    errors.push("Zadejte platný odkaz na inzerát (https://…).");
  }
  if (wantsAddress) {
    if (form.street.trim().length < 3) {
      errors.push("Zadejte ulici a číslo popisné.");
    }
    if (form.city.trim().length < 2) {
      errors.push("Zadejte město.");
    }
  }
  if (!urlOk && !addressOk) {
    errors.push("Zadejte přesnou adresu nebo odkaz na inzerát.");
  }

  const desc = form.propertyDescription.trim();
  if (!desc) {
    errors.push("Vyplňte popis nemovitosti.");
  } else if (desc.length < PROPERTY_DESCRIPTION_MIN) {
    errors.push(
      `Popis nemovitosti je příliš krátký (min. ${PROPERTY_DESCRIPTION_MIN} znaků).`
    );
  } else if (desc.length > PROPERTY_DESCRIPTION_MAX) {
    errors.push(
      `Popis nemovitosti je příliš dlouhý (max. ${PROPERTY_DESCRIPTION_MAX} znaků).`
    );
  }

  const price = parseLooseNumber(form.purchasePrice);
  const rent = parseLooseNumber(form.monthlyRent);
  const equity = parseLooseNumber(form.equity);
  if (price == null || price <= 0) {
    errors.push("Zadejte platnou kupní cenu.");
  }
  if (rent == null || rent < 0) {
    errors.push("Zadejte předpokládaný měsíční nájem.");
  }
  if (equity == null || equity < 0) {
    errors.push("Zadejte vlastní kapitál.");
  }

  const hasListing = urlOk;
  if (args.requirePhotoWithoutListing && !hasListing && args.photoCount < 1) {
    errors.push(
      "Nahrajte alespoň jednu fotografii objektu, nebo vložte odkaz na inzerát."
    );
  }
  if (args.photoCount > RENTGEN_PHOTO_MAX_COUNT) {
    errors.push(`Maximálně ${RENTGEN_PHOTO_MAX_COUNT} fotografií.`);
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true };
}

export function parseLooseNumber(raw: string): number | null {
  if (!raw.trim()) return null;
  const n = Number(raw.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function formStateToOrderSnapshot(
  form: OrderPropertyFormState,
  extras?: {
    annualRatePercent?: number;
    termYears?: number;
    areaM2Fallback?: number | null;
    photos?: RentgenOrderPhotoRef[];
    productCode?: string;
  }
): RentgenOrderInputSnapshot {
  const purchasePriceCzk = parseLooseNumber(form.purchasePrice) ?? 0;
  const monthlyGrossRentCzk = parseLooseNumber(form.monthlyRent) ?? 0;
  const ownFundsCzk = parseLooseNumber(form.equity) ?? 0;
  const floorFromForm = parseLooseNumber(form.floorArea);
  const areaM2 =
    floorFromForm != null && floorFromForm > 0
      ? floorFromForm
      : extras?.areaM2Fallback ?? undefined;
  const propertyAddress = buildPropertyAddressLine({
    street: form.street,
    city: form.city,
    postalCode: form.postalCode,
  });
  const listingUrl = isValidHttpUrl(form.listingUrl)
    ? form.listingUrl.trim()
    : undefined;

  return {
    label: propertyAddress || form.city.trim() || undefined,
    address: propertyAddress || undefined,
    street: form.street.trim() || undefined,
    city: form.city.trim() || undefined,
    postalCode: form.postalCode.trim() || undefined,
    propertyAddress: propertyAddress || undefined,
    listingUrl,
    propertyType: form.propertyType || undefined,
    layout: form.layout || undefined,
    condition: form.condition || undefined,
    ownershipType: form.ownershipType || undefined,
    propertyDescription: form.propertyDescription.trim() || undefined,
    identificationMode: form.identificationMode,
    areaM2,
    purchasePriceCzk,
    monthlyGrossRentCzk,
    ownFundsCzk,
    annualRatePercent: extras?.annualRatePercent ?? 4.8,
    termYears: extras?.termYears ?? 30,
    fixationYears: 5,
    capexCzk: 0,
    closingCostsCzk: 0,
    monthlyOperatingCostsCzk: 0,
    monthlyReserveCzk: 0,
    vacancyRate: 0.05,
    photos: extras?.photos ?? [],
    productCode: extras?.productCode,
  };
}

/** Merge engine-critical snapshot for Stripe metadata builder. */
export function toCheckoutPropertySnapshot(
  snap: RentgenOrderInputSnapshot
): RentgenCheckoutPropertySnapshot {
  return {
    label: snap.label,
    address: snap.address || snap.propertyAddress,
    city: snap.city,
    areaM2: snap.areaM2,
    purchasePriceCzk: snap.purchasePriceCzk,
    monthlyGrossRentCzk: snap.monthlyGrossRentCzk,
    capexCzk: snap.capexCzk ?? 0,
    closingCostsCzk: snap.closingCostsCzk ?? 0,
    monthlyOperatingCostsCzk: snap.monthlyOperatingCostsCzk ?? 0,
    monthlyReserveCzk: snap.monthlyReserveCzk ?? 0,
    vacancyRate: snap.vacancyRate ?? 0.05,
    ownFundsCzk: snap.ownFundsCzk,
    loanAmountCzk: snap.loanAmountCzk,
    annualRatePercent: snap.annualRatePercent,
    termYears: snap.termYears ?? 30,
    fixationYears: snap.fixationYears ?? 5,
    rentGrowthPa: snap.rentGrowthPa,
    opexGrowthPa: snap.opexGrowthPa,
    propertyAppreciationPa: snap.propertyAppreciationPa,
    sp500ReturnPa: snap.sp500ReturnPa,
  };
}
