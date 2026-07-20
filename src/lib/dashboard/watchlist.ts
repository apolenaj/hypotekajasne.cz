/**
 * Legacy dashboard watchlist API — thin bridge to Smart Watchlist v2.
 */
import type { WatchlistItem } from "@/lib/dashboard/types";
import {
  listWatchTargets,
  loadWatchlistStore,
  removeWatchTarget,
  saveWatchlistStore,
} from "@/lib/watchlist/storage";
import { emptyWatchTarget } from "@/lib/watchlist/types";
import { loadCopilotProperties } from "@/lib/copilot/context";

function toLegacyItem(
  t: ReturnType<typeof listWatchTargets>[number]
): WatchlistItem | null {
  if (t.kind !== "property" || t.priceCzk == null) return null;
  return {
    id: t.id,
    label: t.label,
    priceCzk: t.priceCzk,
    previousPriceCzk: t.previousPriceCzk,
    countryHint: t.city,
    status: t.availability === "sold" ? "sold" : "watching",
    addedAt: t.createdAt,
    notes: t.notes ?? undefined,
  };
}

export function loadWatchlist(): WatchlistItem[] {
  const items = listWatchTargets()
    .map(toLegacyItem)
    .filter((x): x is WatchlistItem => x != null);

  if (items.length > 0) return items;

  // One-time migrate Copilot session drafts
  try {
    const drafts = loadCopilotProperties();
    if (drafts.length === 0) return [];
    const store = loadWatchlistStore();
    for (const d of drafts) {
      store.targets.unshift(
        emptyWatchTarget({
          id: d.id,
          kind: "property",
          label: d.label,
          priceCzk: d.priceCzk,
          city: d.locationHint ?? d.countryId ?? null,
          availability: "available",
        })
      );
    }
    saveWatchlistStore(store);
    return listWatchTargets()
      .map(toLegacyItem)
      .filter((x): x is WatchlistItem => x != null);
  } catch {
    return [];
  }
}

export function saveWatchlist(items: WatchlistItem[]) {
  const store = loadWatchlistStore();
  const nonProps = store.targets.filter((t) => t.kind !== "property");
  const props = items.map((i) =>
    emptyWatchTarget({
      id: i.id,
      kind: "property",
      label: i.label,
      createdAt: i.addedAt,
      priceCzk: i.priceCzk,
      previousPriceCzk: i.previousPriceCzk ?? null,
      city: i.countryHint ?? null,
      notes: i.notes ?? null,
      availability: i.status === "sold" ? "sold" : "available",
    })
  );
  store.targets = [...props, ...nonProps];
  saveWatchlistStore(store);
}

export function upsertWatchlistItem(item: WatchlistItem) {
  const list = loadWatchlist().filter((x) => x.id !== item.id);
  list.unshift(item);
  saveWatchlist(list);
}

export function removeWatchlistItem(id: string) {
  removeWatchTarget(id);
}

export function clearWatchlist() {
  const store = loadWatchlistStore();
  store.targets = [];
  store.alerts = [];
  saveWatchlistStore(store);
}
