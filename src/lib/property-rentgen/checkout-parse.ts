/**
 * Extend property payload parsing with identity + narrative fields.
 * Financial fields remain required for Stripe / math engine.
 */

import type { RentgenCheckoutPropertySnapshot } from "@/lib/property-rentgen/checkout-metadata";
import {
  buildPropertyAddressLine,
  hasExactAddress,
  isValidHttpUrl,
  type RentgenOrderInputSnapshot,
  type RentgenOrderPhotoRef,
} from "@/lib/property-rentgen/order-property";

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.replace(/\s/g, "").replace(",", "."));
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function asString(value: unknown, max = 500): string | undefined {
  if (typeof value !== "string") return undefined;
  const t = value.trim();
  if (!t) return undefined;
  return t.slice(0, max);
}

function parsePhotos(raw: unknown): RentgenOrderPhotoRef[] {
  if (!Array.isArray(raw)) return [];
  const out: RentgenOrderPhotoRef[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (typeof o.id !== "string" || typeof o.storageKey !== "string") continue;
    out.push({
      id: o.id,
      storageKey: o.storageKey,
      mimeType: typeof o.mimeType === "string" ? o.mimeType : "image/jpeg",
      size: typeof o.size === "number" ? o.size : 0,
      position: typeof o.position === "number" ? o.position : out.length,
      originalName:
        typeof o.originalName === "string" ? o.originalName : "photo.jpg",
      createdAt:
        typeof o.createdAt === "string"
          ? o.createdAt
          : new Date().toISOString(),
    });
  }
  return out;
}

export function parsePropertyPayload(
  raw: Record<string, unknown>
): RentgenCheckoutPropertySnapshot | { error: string } {
  const full = parseOrderInputSnapshot(raw, {
    requireIdentity: false,
    requireDescription: false,
  });
  if ("error" in full) return full;
  return {
    label: full.label,
    address: full.address,
    city: full.city,
    areaM2: full.areaM2,
    purchasePriceCzk: full.purchasePriceCzk,
    monthlyGrossRentCzk: full.monthlyGrossRentCzk,
    capexCzk: full.capexCzk ?? 0,
    closingCostsCzk: full.closingCostsCzk ?? 0,
    monthlyOperatingCostsCzk: full.monthlyOperatingCostsCzk ?? 0,
    monthlyReserveCzk: full.monthlyReserveCzk ?? 0,
    vacancyRate: full.vacancyRate ?? 0.05,
    ownFundsCzk: full.ownFundsCzk,
    loanAmountCzk: full.loanAmountCzk,
    annualRatePercent: full.annualRatePercent,
    termYears: full.termYears ?? 30,
    fixationYears: full.fixationYears ?? 5,
    rentGrowthPa: full.rentGrowthPa,
    opexGrowthPa: full.opexGrowthPa,
    propertyAppreciationPa: full.propertyAppreciationPa,
    sp500ReturnPa: full.sp500ReturnPa,
  };
}

/** Full order snapshot including listing URL, description, photos. */
export function parseOrderInputSnapshot(
  raw: Record<string, unknown>,
  opts?: { requireIdentity?: boolean; requireDescription?: boolean }
): RentgenOrderInputSnapshot | { error: string } {
  const requireIdentity = opts?.requireIdentity !== false;
  const requireDescription = opts?.requireDescription !== false;

  const p =
    raw.property && typeof raw.property === "object"
      ? (raw.property as Record<string, unknown>)
      : raw.inputSnapshot && typeof raw.inputSnapshot === "object"
        ? (raw.inputSnapshot as Record<string, unknown>)
        : raw;

  const purchasePriceCzk = asNumber(
    p.purchasePriceCzk ?? p.priceCzk ?? p.cena
  );
  const monthlyGrossRentCzk = asNumber(
    p.monthlyGrossRentCzk ?? p.monthlyRentCzk ?? p.rentMonthlyCzk ?? p.najem
  );
  const ownFundsCzk = asNumber(
    p.ownFundsCzk ?? p.equityCzk ?? p.vlastniProstredky ?? p.equityTowardPurchaseCzk
  );
  const annualRatePercent =
    asNumber(p.annualRatePercent ?? p.interestRatePercent ?? p.sazba) ?? 4.8;

  if (purchasePriceCzk == null || purchasePriceCzk <= 0) {
    return { error: "Chybí platná cena nemovitosti." };
  }
  if (monthlyGrossRentCzk == null || monthlyGrossRentCzk < 0) {
    return { error: "Chybí měsíční nájem." };
  }
  if (ownFundsCzk == null || ownFundsCzk < 0) {
    return { error: "Chybí vlastní prostředky." };
  }
  if (annualRatePercent < 0) {
    return { error: "Neplatná modelová sazba." };
  }

  const street = asString(p.street ?? p.ulice, 200);
  const city = asString(p.city ?? p.mesto, 120);
  const postalCode = asString(p.postalCode ?? p.psc, 20);
  const listingUrlRaw = asString(p.listingUrl ?? p.listing_url, 1000);
  const listingUrl =
    listingUrlRaw && isValidHttpUrl(listingUrlRaw) ? listingUrlRaw : undefined;
  if (listingUrlRaw && !listingUrl) {
    return { error: "Zadejte platný odkaz na inzerát (https://…)." };
  }

  const propertyAddress =
    asString(p.propertyAddress ?? p.address ?? p.adresa, 300) ||
    buildPropertyAddressLine({
      street: street || "",
      city: city || "",
      postalCode: postalCode || "",
    }) ||
    undefined;

  const addressOk = hasExactAddress(street || "", city || "");
  if (requireIdentity && !listingUrl && !addressOk) {
    return { error: "Zadejte přesnou adresu nebo odkaz na inzerát." };
  }

  const propertyDescription = asString(p.propertyDescription, 3000);
  if (requireDescription && !propertyDescription) {
    return { error: "Vyplňte popis nemovitosti." };
  }

  const photos = parsePhotos(p.photos);
  if (!listingUrl && photos.length < 1 && requireIdentity) {
    // Soft: allow if description+address present — photo rule enforced client-side
    // and on draft/checkout when requirePhotos flag set. Keep server flexible for resume.
  }

  const modeRaw = asString(p.identificationMode, 20);
  const identificationMode =
    modeRaw === "url" || modeRaw === "address" || modeRaw === "both"
      ? modeRaw
      : listingUrl && addressOk
        ? "both"
        : listingUrl
          ? "url"
          : "address";

  return {
    label:
      asString(p.label, 200) ||
      propertyAddress ||
      city ||
      undefined,
    address: propertyAddress,
    street,
    city,
    postalCode,
    propertyAddress,
    listingUrl,
    propertyType: asString(p.propertyType, 60),
    layout: asString(p.layout ?? p.dispozice, 40),
    condition: asString(p.condition ?? p.stav, 60),
    ownershipType: asString(p.ownershipType ?? p.vlastnictvi, 60),
    propertyDescription,
    identificationMode,
    areaM2: asNumber(p.areaM2 ?? p.floorArea ?? p.plochaM2 ?? p.m2),
    purchasePriceCzk,
    monthlyGrossRentCzk,
    capexCzk: asNumber(p.capexCzk) ?? 0,
    closingCostsCzk: asNumber(p.closingCostsCzk) ?? 0,
    monthlyOperatingCostsCzk: asNumber(p.monthlyOperatingCostsCzk) ?? 0,
    monthlyReserveCzk: asNumber(p.monthlyReserveCzk) ?? 0,
    vacancyRate: asNumber(p.vacancyRate) ?? 0.05,
    ownFundsCzk,
    loanAmountCzk: asNumber(p.loanAmountCzk),
    annualRatePercent,
    termYears: asNumber(p.termYears) ?? 30,
    fixationYears: asNumber(p.fixationYears) ?? 5,
    photos,
    productCode: asString(p.productCode, 60),
    listingTitle: asString(p.listingTitle, 300),
    listingPrice: asNumber(p.listingPrice),
    listingDescription: asString(p.listingDescription, 2000),
    listingSource: asString(p.listingSource, 120),
    listingRetrievedAt: asString(p.listingRetrievedAt, 40),
  };
}

export function parseEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (!email.includes("@") || email.length < 5) return null;
  return email;
}

export function checkoutBaseUrl(): string {
  const fromBase = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "").trim();
  if (fromBase) return fromBase;
  const fromSite = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "").trim();
  if (fromSite) return fromSite;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://www.hypotekajasne.cz";
}
