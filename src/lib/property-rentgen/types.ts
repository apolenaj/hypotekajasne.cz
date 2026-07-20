/**
 * Investiční rentgen — typy a provenance claimů.
 * Nevymýšlíme právní/technická fakta bez zdroje.
 */

export type ClaimKind = "DATA" | "MODEL" | "ODHAD" | "NEOVERENO";

export const CLAIM_KIND_LABELS: Record<ClaimKind, string> = {
  DATA: "Data",
  MODEL: "Modelový výpočet",
  ODHAD: "Odhad",
  NEOVERENO: "Neověřeno",
};

export const CLAIM_KIND_DESCRIPTIONS: Record<ClaimKind, string> = {
  DATA: "Údaj zadaný vámi nebo ověřený ze zdroje.",
  MODEL: "Orientační model platformy — ne živá kotace ani právní posudek.",
  ODHAD: "Hrubý odhad z dostupných vstupů; vyžaduje ověření.",
  NEOVERENO: "Bez ověřeného zdroje — nezobrazujeme jako fakt.",
};

export type ClaimedValue<T = number | string | null> = {
  value: T;
  kind: ClaimKind;
  note?: string;
};

export type RentgenInputMode = "url" | "manual" | "upload";

export type ManualPropertyInput = {
  country: string;
  city: string;
  propertyType: "Byt" | "Dům" | "Komerce" | "";
  areaM2: number | null;
  priceCzk: number | null;
  rentMonthlyCzk: number | null;
  equityCzk: number | null;
  purpose: "investment" | "own_use" | "";
  listingUrl: string;
};

export type FreePreviewResult = {
  generatedAt: string;
  inputMode: RentgenInputMode;
  orientationalYieldPa: ClaimedValue<number | null>;
  pricePerM2: ClaimedValue<number | null>;
  financingFit: ClaimedValue<string>;
  redFlags: { text: string; kind: ClaimKind }[];
  limitations: string[];
};

export type DemoReportMetric = {
  id: string;
  label: string;
  display: string;
  kind: ClaimKind;
  note?: string;
};

export type DemoReport = {
  id: string;
  title: string;
  subtitle: string;
  disclaimer: string;
  metrics: DemoReportMetric[];
  redFlags: { text: string; kind: ClaimKind }[];
  financingFit: ClaimedValue<string>;
};
