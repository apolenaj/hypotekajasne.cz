/**
 * Třívrstvý rate engine: LIVE → VERIFIED_RECENT → MODEL_FALLBACK.
 * Žádná vrstva nevymýšlí ad-hoc číslo — MODEL bere jen explicitní SoT.
 */

import { FRESHNESS_THRESHOLD_MS } from "@/lib/data/freshness";
import {
  MODEL_FALLBACK_EXPLANATION,
  MODEL_FALLBACK_RATE_PERCENT,
  MODEL_FALLBACK_SOURCE_ID,
} from "@/lib/rates/model-fallback";

export type RateLayer = "LIVE" | "VERIFIED_RECENT" | "MODEL_FALLBACK";

/** Veřejný label — nikdy „STALE“. */
export type RateUiKind = "LIVE" | "OVĚŘENO" | "MODEL";

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
  lastVerifiedAt: string | null;
  explanation: string;
  source: string | null;
  isModelFallback: boolean;
  /** Původní LIVE/DB sazba, pokud existovala (i když je starší). */
  liveCandidate: number | null;
};

function ageMs(iso: string | null | undefined, nowMs: number): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return Math.max(0, nowMs - t);
}

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
  if (layer === "VERIFIED_RECENT") return "OVĚŘENO";
  return "MODEL";
}

/**
 * Pořadí:
 * 1) LIVE — číselná sazba z DB, stáří ≤ LIVE threshold (48 h)
 * 2) VERIFIED_RECENT — sazba z DB nebo cache, stáří ≤ VERIFIED threshold (~6 měs.)
 * 3) MODEL_FALLBACK — explicitní SoT (5 %)
 */
export function resolveMortgageRate(
  input: ResolveMortgageRateInput
): ResolvedMortgageRate {
  const nowMs = input.nowMs ?? Date.now();
  const liveThreshold = FRESHNESS_THRESHOLD_MS.LIVE;
  const verifiedThreshold = FRESHNESS_THRESHOLD_MS.VERIFIED;
  const sourceDefault = input.sourceLabel ?? "current_rates / bank_rates";

  const liveCandidate = pickSide(
    input.rateWithInsurance,
    input.rateWithoutInsurance,
    input.hasInsurance
  );
  const liveAge = ageMs(input.updatedAt, nowMs);

  if (liveCandidate != null && liveAge != null && liveAge <= liveThreshold) {
    return {
      ratePercent: liveCandidate,
      layer: "LIVE",
      uiKind: "LIVE",
      lastVerifiedAt: input.updatedAt,
      explanation:
        "Používáme aktuální ověřenou sazbu z datového zdroje. Orientační model — nejde o individuální nabídku banky.",
      source: sourceDefault,
      isModelFallback: false,
      liveCandidate,
    };
  }

  if (
    liveCandidate != null &&
    liveAge != null &&
    liveAge <= verifiedThreshold
  ) {
    return {
      ratePercent: liveCandidate,
      layer: "VERIFIED_RECENT",
      uiKind: "OVĚŘENO",
      lastVerifiedAt: input.updatedAt,
      explanation: `Aktuální sazbu právě ověřujeme. Pro výpočet používáme poslední ověřenou sazbu ${liveCandidate.toFixed(2).replace(".", ",")} % (ověřeno ${formatCsDate(input.updatedAt)}). Nejde o nabídku banky.`,
      source: sourceDefault,
      isModelFallback: false,
      liveCandidate,
    };
  }

  // Sazba bez timestampu — konzervativně OVĚŘENO, ne LIVE
  if (liveCandidate != null && liveAge == null) {
    return {
      ratePercent: liveCandidate,
      layer: "VERIFIED_RECENT",
      uiKind: "OVĚŘENO",
      lastVerifiedAt: input.updatedAt,
      explanation: `Používáme poslední dostupnou sazbu ${liveCandidate.toFixed(2).replace(".", ",")} % bez potvrzeného data aktualizace. Nejde o nabídku banky.`,
      source: sourceDefault,
      isModelFallback: false,
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
  const cachedAge = cached ? ageMs(cached.updatedAt, nowMs) : null;

  if (
    cached != null &&
    cachedRate != null &&
    cachedAge != null &&
    cachedAge <= verifiedThreshold
  ) {
    return {
      ratePercent: cachedRate,
      layer: "VERIFIED_RECENT",
      uiKind: "OVĚŘENO",
      lastVerifiedAt: cached.updatedAt,
      explanation: `Aktuální sazbu právě ověřujeme. Pro orientační výpočet používáme naposledy ověřenou sazbu ${cachedRate.toFixed(2).replace(".", ",")} % (ověřeno ${formatCsDate(cached.updatedAt)}). Nejde o nabídku banky.`,
      source: "local-verified-cache",
      isModelFallback: false,
      liveCandidate,
    };
  }

  return {
    ratePercent: MODEL_FALLBACK_RATE_PERCENT,
    layer: "MODEL_FALLBACK",
    uiKind: "MODEL",
    lastVerifiedAt: input.updatedAt ?? cached?.updatedAt ?? null,
    explanation: MODEL_FALLBACK_EXPLANATION,
    source: MODEL_FALLBACK_SOURCE_ID,
    isModelFallback: true,
    liveCandidate,
  };
}

function formatCsDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  return d.toLocaleDateString("cs-CZ");
}

export function rateUiBadgeClass(kind: RateUiKind): string {
  if (kind === "LIVE") return "bg-emerald-100 text-emerald-900";
  if (kind === "OVĚŘENO") return "bg-sky-100 text-sky-900";
  return "bg-amber-100 text-amber-950";
}
