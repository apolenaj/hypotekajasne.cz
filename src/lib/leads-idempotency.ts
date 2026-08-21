/**
 * Lead idempotency + thank-you one-shot token (no PII).
 * Keys are UUIDs only — never derived from name/email/phone.
 */

const IDEMPOTENCY_PREFIX = "hj-lead-idempotency-v1:";
const THANKS_KEY = "hj-lead-thanks-v1";
const THANKS_TTL_MS = 15 * 60 * 1000;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidLeadIdempotencyKey(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value.trim());
}

export function normalizeLeadIdempotencyKey(
  value: unknown
): string | null {
  if (!isValidLeadIdempotencyKey(value)) return null;
  return value.trim().toLowerCase();
}

function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

/**
 * Stable key for retries of the same in-flight submission (per source).
 * Rotates after a successful submit.
 */
export function getOrCreateLeadIdempotencyKey(source: string): string {
  if (typeof window === "undefined") {
    return newIdempotencyKey();
  }
  try {
    const storageKey = `${IDEMPOTENCY_PREFIX}${source}`;
    const existing = sessionStorage.getItem(storageKey);
    if (isValidLeadIdempotencyKey(existing)) {
      return existing.trim().toLowerCase();
    }
    const next = newIdempotencyKey().toLowerCase();
    sessionStorage.setItem(storageKey, next);
    return next;
  } catch {
    return newIdempotencyKey().toLowerCase();
  }
}

export function clearLeadIdempotencyKey(source: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(`${IDEMPOTENCY_PREFIX}${source}`);
  } catch {
    /* ignore */
  }
}

export type LeadThankYouToken = {
  /** Epoch ms when the successful submit happened */
  at: number;
  /** Lead source label key only — not PII */
  source?: string;
};

/** Mark that a real successful lead submit just happened (client-only). */
export function markLeadThankYou(source?: string): void {
  if (typeof window === "undefined") return;
  try {
    const token: LeadThankYouToken = {
      at: Date.now(),
      ...(source ? { source } : {}),
    };
    sessionStorage.setItem(THANKS_KEY, JSON.stringify(token));
  } catch {
    /* ignore */
  }
}

/**
 * Consume one-shot thank-you token. Returns true only once per successful submit.
 * Refresh / direct visit → false.
 */
export function consumeLeadThankYouToken(maxAgeMs = THANKS_TTL_MS): {
  confirmed: boolean;
  source?: string;
} {
  if (typeof window === "undefined") {
    return { confirmed: false };
  }
  try {
    const raw = sessionStorage.getItem(THANKS_KEY);
    sessionStorage.removeItem(THANKS_KEY);
    if (!raw) return { confirmed: false };
    const parsed = JSON.parse(raw) as LeadThankYouToken;
    if (
      typeof parsed?.at !== "number" ||
      !Number.isFinite(parsed.at) ||
      Date.now() - parsed.at > maxAgeMs ||
      parsed.at > Date.now() + 60_000
    ) {
      return { confirmed: false };
    }
    return {
      confirmed: true,
      source:
        typeof parsed.source === "string" ? parsed.source : undefined,
    };
  } catch {
    return { confirmed: false };
  }
}

export { THANKS_KEY as LEAD_THANKS_STORAGE_KEY };
