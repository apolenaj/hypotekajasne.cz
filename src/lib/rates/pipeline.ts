/**
 * Rate pipeline orchestration helpers — fetch resilience + health payload.
 */

import {
  getRatePipelineTelemetry,
  recordRateFetchFailure,
  recordRateFetchSuccess,
  recordRatePipelineInfo,
} from "@/lib/rates/telemetry";

export const RATE_FETCH_TIMEOUT_MS = 8_000;
export const RATE_FETCH_RETRIES = 2;
export const RATE_RETRY_DELAY_MS = 400;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withTimeout<T>(
  promise: PromiseLike<T>,
  ms: number,
  label: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(promise),
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} timeout after ${ms}ms`)),
          ms
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export type RatesHealthPayload = {
  ok: boolean;
  checkedAt: string;
  liveMaxAgeHours: number;
  modelFallbackPercent: number;
  telemetry: ReturnType<typeof getRatePipelineTelemetry>;
  store: {
    currentRatesUpdatedAt: string | null;
    bankRatesCount: number | null;
    bankRatesFreshCount: number | null;
    lastSuccessfulUpdate: string | null;
    error: string | null;
  };
};

export {
  getRatePipelineTelemetry,
  recordRateFetchFailure,
  recordRateFetchSuccess,
  recordRatePipelineInfo,
};
