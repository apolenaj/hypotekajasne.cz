/**
 * Shared property payload parsing for rentgen checkout APIs.
 */

import type { RentgenCheckoutPropertySnapshot } from "@/lib/property-rentgen/checkout-metadata";

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.replace(/\s/g, "").replace(",", "."));
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

export function parsePropertyPayload(
  raw: Record<string, unknown>
): RentgenCheckoutPropertySnapshot | { error: string } {
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

  return {
    label: typeof p.label === "string" ? p.label : undefined,
    address:
      typeof p.address === "string"
        ? p.address
        : typeof p.adresa === "string"
          ? p.adresa
          : undefined,
    city: typeof p.city === "string" ? p.city : undefined,
    areaM2: asNumber(p.areaM2 ?? p.plochaM2 ?? p.m2),
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
