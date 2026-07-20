/**
 * Majetio ↔ Watchlist sync contract.
 * Status COMING_SOON — no fake listing inventory or similar offers.
 */

export type MajetioWatchSyncStatus = "COMING_SOON" | "BETA" | "LIVE";

export const MAJETIO_WATCH_SYNC_STATUS: MajetioWatchSyncStatus = "COMING_SOON";

/** Payload Majetio may push / HJ may pull when sync goes live */
export type MajetioListingObservation = {
  majetioListingId: string;
  url?: string;
  title?: string;
  priceCzk: number | null;
  pricePerM2?: number | null;
  city?: string | null;
  area?: string | null;
  developerProject?: string | null;
  propertyType?: string | null;
  /** ISO — required for “days on market” alerts */
  listingPublishedAt?: string | null;
  availability?: "available" | "reserved" | "sold" | "unknown";
  estimatedYieldPct?: number | null;
  score?: number | null;
  observedAt: string;
  /**
   * Similar listings — ONLY include when Majetio computed them.
   * Never fabricate on HJ side.
   */
  similarListings?: {
    listingId: string;
    priceCzk: number;
    cheaperThanWatchedPct: number;
    url?: string;
  }[];
};

export type MajetioWatchSyncBlueprint = {
  status: MajetioWatchSyncStatus;
  inbound: {
    /** Webhook or poll endpoint (future) */
    path: "/api/bridge/majetio/watchlist-sync";
    accepts: "MajetioListingObservation[]";
    auth: "shared HMAC / service token";
  };
  outbound: {
    /** HJ registers watch targets with listing ids */
    registerPath: "/api/bridge/majetio/watchlist-register";
    fields: Array<
      | "majetioListingId"
      | "filters.city"
      | "filters.area"
      | "filters.priceBand"
      | "filters.minYield"
      | "filters.maxPricePerM2"
      | "filters.minScore"
    >;
  };
  guarantees: string[];
  nonGoals: string[];
};

export const MAJETIO_WATCH_SYNC_BLUEPRINT: MajetioWatchSyncBlueprint = {
  status: MAJETIO_WATCH_SYNC_STATUS,
  inbound: {
    path: "/api/bridge/majetio/watchlist-sync",
    accepts: "MajetioListingObservation[]",
    auth: "shared HMAC / service token",
  },
  outbound: {
    registerPath: "/api/bridge/majetio/watchlist-register",
    fields: [
      "majetioListingId",
      "filters.city",
      "filters.area",
      "filters.priceBand",
      "filters.minYield",
      "filters.maxPricePerM2",
      "filters.minScore",
    ],
  },
  guarantees: [
    "HJ never invents similar listings or inventory counts.",
    "listingPublishedAt required before ‘days on market’ alerts.",
    "Yield/score alerts only when Majetio or user supplies values.",
  ],
  nonGoals: [
    "Scraping Majetio HTML from the browser",
    "Fake ‘11 % cheaper similar’ without payload",
    "Pushing PII in watch registration",
  ],
};

/**
 * Apply a Majetio observation onto a local target — preserves previous* for diffs.
 */
export function applyMajetioObservation(
  target: import("@/lib/watchlist/types").WatchTarget,
  obs: MajetioListingObservation
): {
  target: import("@/lib/watchlist/types").WatchTarget;
  similarAlerts: import("@/lib/watchlist/types").WatchAlert[];
} {
  const now = obs.observedAt;
  const previousPrice = target.priceCzk;
  const previousYield = target.estimatedYieldPct;

  const next: import("@/lib/watchlist/types").WatchTarget = {
    ...target,
    majetioListingId: obs.majetioListingId,
    majetioUrl: obs.url ?? target.majetioUrl,
    label: obs.title ?? target.label,
    previousPriceCzk:
      obs.priceCzk != null && previousPrice != null && obs.priceCzk !== previousPrice
        ? previousPrice
        : target.previousPriceCzk,
    priceCzk: obs.priceCzk ?? target.priceCzk,
    pricePerM2: obs.pricePerM2 ?? target.pricePerM2,
    city: obs.city ?? target.city,
    area: obs.area ?? target.area,
    developerProject: obs.developerProject ?? target.developerProject,
    propertyType: obs.propertyType ?? target.propertyType,
    listingPublishedAt: obs.listingPublishedAt ?? target.listingPublishedAt,
    availability: obs.availability ?? target.availability,
    previousYieldPct:
      obs.estimatedYieldPct != null &&
      previousYield != null &&
      obs.estimatedYieldPct !== previousYield
        ? previousYield
        : target.previousYieldPct,
    estimatedYieldPct: obs.estimatedYieldPct ?? target.estimatedYieldPct,
    score: obs.score ?? target.score,
    lastObservedAt: now,
    updatedAt: now,
    sourceClaim: "DATA",
  };

  const similarAlerts: import("@/lib/watchlist/types").WatchAlert[] = [];
  if (obs.similarListings && obs.similarListings.length > 0) {
    for (const s of obs.similarListings.slice(0, 3)) {
      if (s.cheaperThanWatchedPct >= 5) {
        similarAlerts.push({
          id: `wa_${target.id}_similar_${s.listingId}`.slice(0, 64),
          targetId: target.id,
          kind: "similar_listing",
          title: `Objevila se podobná nemovitost o ${Math.round(s.cheaperThanWatchedPct)} % levnější.`,
          body: `Majetio similarity pro „${next.label}“ · ${s.priceCzk.toLocaleString("cs-CZ")} Kč.`,
          createdAt: now,
          claimKind: "DATA",
          magnitude: s.cheaperThanWatchedPct,
          href: s.url ?? null,
          severity: s.cheaperThanWatchedPct >= 10 ? "important" : "notable",
        });
      }
    }
  }

  return { target: next, similarAlerts };
}
