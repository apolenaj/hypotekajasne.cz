/**
 * In-memory telemetry / last successful update for rate pipeline (PROMPT 6).
 * Process-local — Vercel serverless may reset; health also reads DB timestamps.
 */

export type RatePipelineEventLevel = "info" | "warn" | "error";

export type RatePipelineEvent = {
  at: string;
  level: RatePipelineEventLevel;
  code: string;
  message: string;
  meta?: Record<string, unknown>;
};

export type RatePipelineTelemetrySnapshot = {
  lastSuccessfulFetchAt: string | null;
  lastFailedFetchAt: string | null;
  lastError: string | null;
  consecutiveFailures: number;
  recentEvents: RatePipelineEvent[];
};

const MAX_EVENTS = 40;

let lastSuccessfulFetchAt: string | null = null;
let lastFailedFetchAt: string | null = null;
let lastError: string | null = null;
let consecutiveFailures = 0;
const recentEvents: RatePipelineEvent[] = [];

function pushEvent(event: RatePipelineEvent): void {
  recentEvents.unshift(event);
  if (recentEvents.length > MAX_EVENTS) {
    recentEvents.length = MAX_EVENTS;
  }
}

export function recordRateFetchSuccess(meta?: Record<string, unknown>): void {
  const at = new Date().toISOString();
  lastSuccessfulFetchAt = at;
  consecutiveFailures = 0;
  lastError = null;
  pushEvent({
    at,
    level: "info",
    code: "fetch_success",
    message: "Rate fetch succeeded",
    meta,
  });
}

export function recordRateFetchFailure(
  message: string,
  meta?: Record<string, unknown>
): void {
  const at = new Date().toISOString();
  lastFailedFetchAt = at;
  lastError = message;
  consecutiveFailures += 1;
  pushEvent({
    at,
    level: "error",
    code: "fetch_failure",
    message,
    meta,
  });
  console.error("[rates-pipeline]", message, meta ?? "");
}

export function recordRatePipelineInfo(
  code: string,
  message: string,
  meta?: Record<string, unknown>
): void {
  pushEvent({
    at: new Date().toISOString(),
    level: "info",
    code,
    message,
    meta,
  });
}

export function getRatePipelineTelemetry(): RatePipelineTelemetrySnapshot {
  return {
    lastSuccessfulFetchAt,
    lastFailedFetchAt,
    lastError,
    consecutiveFailures,
    recentEvents: [...recentEvents],
  };
}

/** Test helper */
export function resetRatePipelineTelemetryForTests(): void {
  lastSuccessfulFetchAt = null;
  lastFailedFetchAt = null;
  lastError = null;
  consecutiveFailures = 0;
  recentEvents.length = 0;
}
