/**
 * Mapování systémových / API hodnot (snake_case, EN enumy) → české UI labely.
 * Nikdy nevypisuj raw kód do HTML — vždy přes tyto helpery.
 */

import { READINESS_BAND_LABELS } from "@/lib/financial-passport/types";
import { statusBadgeLabel } from "@/lib/data/display";
import type { DataStatus } from "@/lib/data/types";
import type { RateUiKind } from "@/lib/rates/resolve-engine";
import { rateUiBadgeLabel } from "@/lib/rates/resolve-engine";

/** Pásma připravenosti (Finanční pas / Moje možnosti). */
export const READINESS_BAND_LABELS_CS: Record<string, string> = {
  ...READINESS_BAND_LABELS,
  /** Alias / budoucí stavy */
  low_readiness: "Nízká modelová připravenost",
  high_readiness: "Vysoká modelová připravenost",
  moderate_readiness: "Střední modelová připravenost",
  building_readiness: "Budování modelové připravenosti",
  early_exploration: "Raný průzkum (model)",
};

export function readinessBandLabel(band: string | null | undefined): string {
  if (!band) return "Modelová připravenost";
  return (
    READINESS_BAND_LABELS_CS[band] ??
    READINESS_BAND_LABELS[band] ??
    humanizeSystemCode(band)
  );
}

/** Sazba: LIVE → Aktuální data (nikdy surové „LIVE“ v prozaickém textu). */
export function rateUiKindLabel(kind: RateUiKind | string): string {
  return rateUiBadgeLabel(kind as RateUiKind);
}

/** Claim kind v prozaickém kontextu (ne badge taxonomy). */
export const CLAIM_KIND_LABELS_CS: Record<string, string> = {
  DATA: "Data",
  MODEL: "Model",
  ODHAD: "Odhad",
  NEOVERENO: "Neověřeno",
  LIVE: "Aktuální",
  "OVĚŘENO": "Ověřeno",
};

export function claimKindLabel(kind: string | null | undefined): string {
  if (!kind) return "Neznámé";
  return CLAIM_KIND_LABELS_CS[kind] ?? humanizeSystemCode(kind);
}

export const WATCH_ALERT_KIND_LABELS_CS: Record<string, string> = {
  price_drop: "Pokles ceny",
  price_rise: "Růst ceny",
  rate_change: "Změna sazby",
  similar_listing: "Podobná nabídka",
  yield_change: "Změna výnosu",
  liquidity_change: "Změna likvidity",
};

export const SEVERITY_LABELS_CS: Record<string, string> = {
  info: "Informace",
  notable: "Významné",
  important: "Důležité",
  low: "Nízká",
  medium: "Střední",
  high: "Vysoká",
  critical: "Kritická",
};

export function watchAlertKindLabel(kind: string): string {
  return WATCH_ALERT_KIND_LABELS_CS[kind] ?? humanizeSystemCode(kind);
}

export function severityLabel(severity: string): string {
  return SEVERITY_LABELS_CS[severity] ?? humanizeSystemCode(severity);
}

/** DataStatus pro text (badge taxonomy zůstává v DataStatusBadge). */
export function dataStatusTextLabel(status: string): string {
  const known: Record<string, string> = {
    LIVE: "Aktuální",
    VERIFIED: "Ověřeno",
    MODEL: "Model",
    ESTIMATE: "Odhad",
    UNVERIFIED: "Neověřeno",
    PARTNER_QUOTE: "Nabídka partnera",
    STALE: "Vyžaduje aktualizaci",
  };
  if (known[status]) return known[status];
  try {
    return statusBadgeLabel(status as DataStatus);
  } catch {
    return humanizeSystemCode(status);
  }
}

/**
 * Poslední záchrana: snake_case / SCREAMING_SNAKE → čitelný text.
 * Preferuj explicitní mapu; toto jen zabrání úniku kódu do UI.
 */
export function humanizeSystemCode(code: string): string {
  const trimmed = code.trim();
  if (!trimmed) return "—";
  if (!/[_-]/.test(trimmed) && !/^[A-Z]{2,}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

/** Pokud hodnota vypadá jako systémový kód, přelož; jinak vrať jak je (už CS věta). */
export function ensureCzechUiLabel(value: string): string {
  if (!/^[a-z]+(_[a-z0-9]+)+$/.test(value) && !/^[A-Z][A-Z0-9_]+$/.test(value)) {
    return value;
  }
  return (
    READINESS_BAND_LABELS_CS[value] ??
    CLAIM_KIND_LABELS_CS[value] ??
    WATCH_ALERT_KIND_LABELS_CS[value] ??
    SEVERITY_LABELS_CS[value] ??
    humanizeSystemCode(value)
  );
}
