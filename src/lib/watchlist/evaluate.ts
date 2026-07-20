import {
  generateWatchAlertCandidates,
  stampObservedRates,
} from "@/lib/watchlist/alerts";
import {
  appendWatchAlerts,
  loadWatchlistStore,
  saveWatchlistStore,
} from "@/lib/watchlist/storage";
import { filterAlertsByThrottle } from "@/lib/watchlist/throttle";
import type { WatchAlert } from "@/lib/watchlist/types";
import type { FinancialPassportDocument } from "@/lib/financial-passport/types";

/**
 * Run observation → candidates → throttle → persist.
 */
export function runWatchlistEvaluation(input: {
  currentRatePercent: number | null;
  doc: FinancialPassportDocument | null;
  now?: Date;
}): {
  accepted: WatchAlert[];
  rejected: string[];
  candidateCount: number;
} {
  const now = input.now ?? new Date();
  const store = loadWatchlistStore();

  const candidates = generateWatchAlertCandidates({
    targets: store.targets,
    currentRatePercent: input.currentRatePercent,
    doc: input.doc,
    now,
  });

  const { accepted, throttle, rejected } = filterAlertsByThrottle(
    candidates,
    store.throttle,
    store.preferences,
    now
  );

  if (accepted.length > 0) {
    appendWatchAlerts(accepted, throttle);
  } else {
    store.throttle = throttle;
    saveWatchlistStore(store);
  }

  // Stamp rates after evaluation so next run can diff
  const stamped = stampObservedRates(
    loadWatchlistStore().targets,
    input.currentRatePercent,
    now
  );
  const s2 = loadWatchlistStore();
  s2.targets = stamped;
  saveWatchlistStore(s2);

  return {
    accepted,
    rejected,
    candidateCount: candidates.length,
  };
}
