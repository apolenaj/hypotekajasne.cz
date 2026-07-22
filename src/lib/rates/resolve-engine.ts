/**
 * Třívrstvý rate engine: LIVE → STALE (ověřená stará) → MODEL_FALLBACK.
 * Žádná vrstva nevymýšlí ad-hoc číslo — MODEL bere jen explicitní SoT.
 * PROMPT 6: LIVE starší než limit → STALE; model ≠ bankovní nabídka.
 */

import {
  RATE_LIVE_MAX_AGE_MS,
  RATE_VERIFIED_MAX_AGE_MS,
  ageMsFromIso,
} from "@/lib/rates/freshness-policy";
import {
  MODEL_FALLBACK_EXPLANATION,
  MODEL_FALLBACK_RATE_PERCENT,
  MODEL_FALLBACK_SOURCE_ID,
} from "@/lib/rates/model-fallback";
import {
  LIVE_RATES_UNAVAILABLE_MESSAGE,
  modelRateDisclaimer,
  type MortgageRateStatus,
} from "@/lib/rates/types";

export type RateLayer = "LIVE" | "STALE" | "MODEL_FALLBACK";

/** Veřejný label pro banner. */
export type RateUiKind = "LIVE" | "STALE" | "OVĚŘENO" | "MODEL";

export type CachedVerifiedRate = {
  rateWithInsurance: number | null;
  rateWithoutInsurance: number | null;
  updatedAt: string;
  cachedAt: string;
};

export type ResolveMortgageRateInput = {
  rateWithInsurance: number | null;
  rateWithoutInsurance: number | null;
  updatedAt: string | null;
  hasInsurance: boolean;
  /** Poslední ověřená hodnota z cache (localStorage / memory). */
  cachedVerified?: CachedVerifiedRate | null;
  nowMs?: number;
  sourceLabel?: string | null;
};

export type ResolvedMortgageRate = {
  ratePercent: number;
  layer: RateLayer;
  uiKind: RateUiKind;
  /** Mapování na MortgageRateRecord.status */
  recordStatus: MortgageRateStatus;
  lastVerifiedAt: string | null;
  explanation: string;
  source: string | null;
  isModelFallback: boolean;
  liveUnavailable: boolean;
  /** Původní LIVE/DB sazba, pokud existovala (i když je starší). */
  liveCandidate: number | null;
};

function pickSide(
  withRate: number | null,
  withoutRate: number | null,
  hasInsurance: boolean
): number | null {
  const n = hasInsurance ? withRate : withoutRate ?? withRate;
  if (n == null || !Number.isFinite(n) || n < 0) return null;
  return n;
}

function toUiKind(layer: RateLayer): RateUiKind {
  if (layer === "LIVE") return "LIVE";
  if (layer === "STALE") return "STALE";
  return "MODEL";
}

function formatCsDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  return d.toLocaleDateString("cs-CZ");
}

/**
 * Pořadí:
 * 1) LIVE — číselná sazba z DB, stáří ≤ LIVE threshold (48 h)
 * 2) STALE — sazba z DB/cache do VERIFIED okna (neprezentovat jako aktuální lístek)
 * 3) MODEL_FALLBACK — explicitní SoT (5 %)
 */
export function resolveMortgageRate(
  input: ResolveMortgageRateInput
): ResolvedMortgageRate {
  const nowMs = input.nowMs ?? Date.now();
  const sourceDefault = input.sourceLabel ?? "current_rates / bank_rates";

  const liveCandidate = pickSide(
    input.rateWithInsurance,
    input.rateWithoutInsurance,
    input.hasInsurance
  );
  const liveAge = ageMsFromIso(input.updatedAt, nowMs);

  if (liveCandidate != null && liveAge != null && liveAge <= RATE_LIVE_MAX_AGE_MS) {
    return {
      ratePercent: liveCandidate,
      layer: "LIVE",
      uiKind: "LIVE",
      recordStatus: "LIVE",
      lastVerifiedAt: input.updatedAt,
      explanation:
        "Používáme aktuální ověřenou sazbu z datového zdroje. Orientační model — nejde o individuální nabídku banky.",
      source: sourceDefault,
      isModelFallback: false,
      liveUnavailable: false,
      liveCandidate,
    };
  }

  if (
    liveCandidate != null &&
    liveAge != null &&
    liveAge <= RATE_VERIFIED_MAX_AGE_MS
  ) {
    return {
      ratePercent: liveCandidate,
      layer: "STALE",
      uiKind: "STALE",
      recordStatus: "STALE",
      lastVerifiedAt: input.updatedAt,
      explanation: `${LIVE_RATES_UNAVAILABLE_MESSAGE} Pro výpočet používáme poslední dostupnou sazbu ${liveCandidate.toFixed(2).replace(".", ",")} % (stav k ${formatCsDate(input.updatedAt)}). Nejde o aktuální nabídku banky.`,
      source: sourceDefault,
      isModelFallback: false,
      liveUnavailable: true,
      liveCandidate,
    };
  }

  // Sazba bez timestampu — STALE, ne LIVE
  if (liveCandidate != null && liveAge == null) {
    return {
      ratePercent: liveCandidate,
      layer: "STALE",
      uiKind: "STALE",
      recordStatus: "STALE",
      lastVerifiedAt: input.updatedAt,
      explanation: `${LIVE_RATES_UNAVAILABLE_MESSAGE} Používáme poslední dostupnou sazbu ${liveCandidate.toFixed(2).replace(".", ",")} % bez potvrzeného data aktualizace. Nejde o aktuální nabídku banky.`,
      source: sourceDefault,
      isModelFallback: false,
      liveUnavailable: true,
      liveCandidate,
    };
  }

  const cached = input.cachedVerified ?? null;
  const cachedRate = cached
    ? pickSide(
        cached.rateWithInsurance,
        cached.rateWithoutInsurance,
        input.hasInsurance
      )
    : null;
  const cachedAge = cached ? ageMsFromIso(cached.updatedAt, nowMs) : null;

  if (
    cached != null &&
    cachedRate != null &&
    cachedAge != null &&
    cachedAge <= RATE_VERIFIED_MAX_AGE_MS
  ) {
    const layer: RateLayer =
      cachedAge <= RATE_LIVE_MAX_AGE_MS ? "LIVE" : "STALE";
    return {
      ratePercent: cachedRate,
      layer,
      uiKind: toUiKind(layer),
      recordStatus: layer === "LIVE" ? "LIVE" : "STALE",
      lastVerifiedAt: cached.updatedAt,
      explanation:
        layer === "LIVE"
          ? "Používáme naposledy ověřenou sazbu z lokální cache. Orientační model — nejde o individuální nabídku banky."
          : `${LIVE_RATES_UNAVAILABLE_MESSAGE} Pro orientační výpočet používáme naposledy ověřenou sazbu ${cachedRate.toFixed(2).replace(".", ",")} % (ověřeno ${formatCsDate(cached.updatedAt)}). Nejde o aktuální nabídku banky.`,
      source: "local-verified-cache",
      isModelFallback: false,
      liveUnavailable: layer !== "LIVE",
      liveCandidate,
    };
  }

  return {
    ratePercent: MODEL_FALLBACK_RATE_PERCENT,
    layer: "MODEL_FALLBACK",
    uiKind: "MODEL",
    recordStatus: "MODEL",
    lastVerifiedAt: input.updatedAt ?? cached?.updatedAt ?? null,
    explanation: [
      LIVE_RATES_UNAVAILABLE_MESSAGE,
      modelRateDisclaimer(MODEL_FALLBACK_RATE_PERCENT),
    ].join(" "),
    source: MODEL_FALLBACK_SOURCE_ID,
    isModelFallback: true,
    liveUnavailable: true,
    liveCandidate,
  };
}

export function rateUiBadgeClass(kind: RateUiKind): string {
  if (kind === "LIVE") return "bg-emerald-100 text-emerald-900";
  if (kind === "STALE") return "bg-slate-200 text-slate-800";
  if (kind === "OVĚŘENO") return "bg-sky-100 text-sky-900";
  return "bg-amber-100 text-amber-950";
}

export function rateUiBadgeLabel(kind: RateUiKind): string {
  if (kind === "LIVE") return "Aktuální data";
  if (kind === "STALE") return "Neaktuální údaj";
  if (kind === "OVĚŘENO") return "Ověřeno";
  return "Modelový výpočet";
}

/** @deprecated — kept for older tests expecting VERIFIED_RECENT naming */
export type LegacyRateLayer = RateLayer | "VERIFIED_RECENT";
