"use client";

import { useSyncExternalStore } from "react";
import {
  EXPERIMENTS,
  getExperimentVariant,
  type ExperimentId,
  type ExperimentVariant,
} from "@/lib/analytics/experiments";

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

/**
 * Sticky experiment variant for client components.
 * SSR always sees control (variants[0]) to avoid hydration mismatch.
 */
export function useExperiment<E extends ExperimentId>(
  experimentId: E
): ExperimentVariant<E> {
  return useSyncExternalStore(
    subscribe,
    () => getExperimentVariant(experimentId),
    () => EXPERIMENTS[experimentId].variants[0] as ExperimentVariant<E>
  );
}
