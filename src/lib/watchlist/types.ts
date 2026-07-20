/**
 * Smart Property Watchlist — retention feature linked to Majetio.
 * Never invent listing counts, yields, or similar offers without source data.
 */

export type ClaimKind = "DATA" | "MODEL" | "ODHAD" | "NEOVERENO";

export type WatchTargetKind =
  | "property"
  | "city"
  | "area"
  | "developer_project"
  | "property_type"
  | "filter";

export type WatchAvailability =
  | "available"
  | "reserved"
  | "sold"
  | "unknown";

export type WatchTarget = {
  id: string;
  kind: WatchTargetKind;
  label: string;
  createdAt: string;
  updatedAt: string;

  /** Majetio listing id when known — never invent */
  majetioListingId: string | null;
  majetioUrl: string | null;

  /** Location / taxonomy */
  city: string | null;
  area: string | null;
  developerProject: string | null;
  propertyType: string | null;

  /** Price observation (user or Majetio sync) */
  priceCzk: number | null;
  previousPriceCzk: number | null;
  pricePerM2: number | null;

  /** Filter criteria (for non-property targets or saved search) */
  priceBandMin: number | null;
  priceBandMax: number | null;
  minYieldPct: number | null;
  maxPricePerM2: number | null;
  minScore: number | null;

  /** Yield / score — only when user entered or Majetio provided */
  estimatedYieldPct: number | null;
  previousYieldPct: number | null;
  score: number | null;

  /**
   * Listing published date from Majetio — null = unknown.
   * Do NOT treat watchlist.createdAt as “days on market”.
   */
  listingPublishedAt: string | null;
  availability: WatchAvailability;

  /** Model rate snapshot when last affordability/rate alert evaluated */
  lastObservedRatePercent: number | null;
  lastObservedAt: string | null;

  notes: string | null;
  sourceClaim: ClaimKind;
};

export type WatchAlertKind =
  | "price_drop"
  | "price_rise"
  | "listing_age"
  | "availability"
  | "yield_change"
  | "affordability"
  | "rate_payment_change"
  | "new_risk"
  | "similar_listing"
  | "filter_match";

export type WatchAlert = {
  id: string;
  targetId: string;
  kind: WatchAlertKind;
  title: string;
  body: string;
  createdAt: string;
  claimKind: ClaimKind;
  /** Numeric magnitude for throttling / digest (e.g. Kč drop, pp yield) */
  magnitude: number | null;
  href: string | null;
  /** Soft — never dark-pattern urgency */
  severity: "info" | "notable" | "important";
};

export type AlertThrottleRecord = {
  /** key = `${targetId}:${kind}` */
  lastEmittedAt: Record<string, string>;
  /** ISO dates of recent alert emissions for daily cap */
  recentEmissionDays: string[];
};

export type WatchlistStoreV2 = {
  version: 2;
  targets: WatchTarget[];
  alerts: WatchAlert[];
  throttle: AlertThrottleRecord;
  preferences: {
    maxAlertsPerDay: number;
    /** Minimum hours between same target+kind */
    minHoursBetweenSameKind: number;
    digestOnly: boolean;
  };
};

export const WATCHLIST_STORAGE_KEY = "hj-smart-watchlist-v2";
export const MAX_WATCH_TARGETS = 40;
export const MAX_STORED_ALERTS = 50;

export function emptyWatchTarget(
  partial: Pick<WatchTarget, "id" | "kind" | "label"> &
    Partial<WatchTarget>
): WatchTarget {
  const now = new Date().toISOString();
  return {
    id: partial.id,
    kind: partial.kind,
    label: partial.label,
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? now,
    majetioListingId: partial.majetioListingId ?? null,
    majetioUrl: partial.majetioUrl ?? null,
    city: partial.city ?? null,
    area: partial.area ?? null,
    developerProject: partial.developerProject ?? null,
    propertyType: partial.propertyType ?? null,
    priceCzk: partial.priceCzk ?? null,
    previousPriceCzk: partial.previousPriceCzk ?? null,
    pricePerM2: partial.pricePerM2 ?? null,
    priceBandMin: partial.priceBandMin ?? null,
    priceBandMax: partial.priceBandMax ?? null,
    minYieldPct: partial.minYieldPct ?? null,
    maxPricePerM2: partial.maxPricePerM2 ?? null,
    minScore: partial.minScore ?? null,
    estimatedYieldPct: partial.estimatedYieldPct ?? null,
    previousYieldPct: partial.previousYieldPct ?? null,
    score: partial.score ?? null,
    listingPublishedAt: partial.listingPublishedAt ?? null,
    availability: partial.availability ?? "unknown",
    lastObservedRatePercent: partial.lastObservedRatePercent ?? null,
    lastObservedAt: partial.lastObservedAt ?? null,
    notes: partial.notes ?? null,
    sourceClaim: partial.sourceClaim ?? "DATA",
  };
}
