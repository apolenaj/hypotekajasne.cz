import { emptyWatchTarget } from "@/lib/watchlist/types";
import type { WatchTarget, WatchTargetKind } from "@/lib/watchlist/types";
import {
  loadWatchlistStore,
  saveWatchlistStore,
  upsertWatchTarget,
} from "@/lib/watchlist/storage";

function id(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function addPropertyWatch(input: {
  label: string;
  priceCzk: number;
  city?: string;
  area?: string;
  majetioUrl?: string;
  majetioListingId?: string;
  estimatedYieldPct?: number;
  listingPublishedAt?: string;
  /** Reuse Copilot / dashboard id when syncing */
  id?: string;
}): WatchTarget {
  const t = emptyWatchTarget({
    id: input.id ?? id("prop"),
    kind: "property",
    label: input.label,
    priceCzk: input.priceCzk,
    previousPriceCzk: null,
    city: input.city ?? null,
    area: input.area ?? null,
    majetioUrl: input.majetioUrl ?? null,
    majetioListingId: input.majetioListingId ?? null,
    estimatedYieldPct: input.estimatedYieldPct ?? null,
    listingPublishedAt: input.listingPublishedAt ?? null,
    availability: "available",
    sourceClaim: "DATA",
  });
  upsertWatchTarget(t);
  return t;
}

export function addPlaceWatch(input: {
  kind: Extract<
    WatchTargetKind,
    "city" | "area" | "developer_project" | "property_type"
  >;
  label: string;
  city?: string;
  area?: string;
  developerProject?: string;
  propertyType?: string;
}): WatchTarget {
  const t = emptyWatchTarget({
    id: id(input.kind),
    kind: input.kind,
    label: input.label,
    city: input.city ?? (input.kind === "city" ? input.label : null),
    area: input.area ?? (input.kind === "area" ? input.label : null),
    developerProject:
      input.developerProject ??
      (input.kind === "developer_project" ? input.label : null),
    propertyType:
      input.propertyType ??
      (input.kind === "property_type" ? input.label : null),
    sourceClaim: "DATA",
  });
  upsertWatchTarget(t);
  return t;
}

export function addFilterWatch(input: {
  label: string;
  priceBandMin?: number;
  priceBandMax?: number;
  minYieldPct?: number;
  maxPricePerM2?: number;
  minScore?: number;
  city?: string;
}): WatchTarget {
  const t = emptyWatchTarget({
    id: id("filter"),
    kind: "filter",
    label: input.label,
    priceBandMin: input.priceBandMin ?? null,
    priceBandMax: input.priceBandMax ?? null,
    minYieldPct: input.minYieldPct ?? null,
    maxPricePerM2: input.maxPricePerM2 ?? null,
    minScore: input.minScore ?? null,
    city: input.city ?? null,
    sourceClaim: "DATA",
  });
  upsertWatchTarget(t);
  return t;
}

/** Record a new observed price (sets previous for diff alerts). */
export function recordPriceObservation(
  targetId: string,
  newPriceCzk: number
): WatchTarget | null {
  if (newPriceCzk <= 0) return null;
  const store = loadWatchlistStore();
  const t = store.targets.find((x) => x.id === targetId);
  if (!t) return null;
  const updated: WatchTarget = {
    ...t,
    previousPriceCzk: t.priceCzk,
    priceCzk: newPriceCzk,
    updatedAt: new Date().toISOString(),
  };
  store.targets = store.targets.map((x) =>
    x.id === targetId ? updated : x
  );
  saveWatchlistStore(store);
  return updated;
}

export function recordYieldObservation(
  targetId: string,
  newYieldPct: number
): WatchTarget | null {
  const store = loadWatchlistStore();
  const t = store.targets.find((x) => x.id === targetId);
  if (!t) return null;
  const updated: WatchTarget = {
    ...t,
    previousYieldPct: t.estimatedYieldPct,
    estimatedYieldPct: newYieldPct,
    updatedAt: new Date().toISOString(),
  };
  store.targets = store.targets.map((x) =>
    x.id === targetId ? updated : x
  );
  saveWatchlistStore(store);
  return updated;
}
