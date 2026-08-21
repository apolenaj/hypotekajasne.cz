/**
 * Distributed lead API rate limiting via Supabase (serverless-safe).
 * Client identity is stored only as HMAC hash — never raw IP or PII.
 */

import { createHmac } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Max accepted lead posts per client hash within WINDOW_SECONDS. */
export const LEAD_RATE_LIMIT_MAX = 8;
/** Sliding fixed window length in seconds (10 minutes). */
export const LEAD_RATE_LIMIT_WINDOW_SECONDS = 600;

export type LeadRateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
  currentCount: number;
  /** True when limiter could not run (fail-open vs fail-closed decided by caller). */
  skipped?: boolean;
  errorCode?: string;
};

function readHmacSecret(): string | null {
  const secret =
    process.env.CRON_SECRET?.trim() ||
    process.env.LEAD_OPS_API_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "";
  return secret || null;
}

/**
 * Hash client identity for rate buckets. Never log or persist the raw input.
 */
export function hashLeadRateClientId(rawClientMaterial: string): string | null {
  const secret = readHmacSecret();
  if (!secret) return null;
  const material = rawClientMaterial.trim().slice(0, 512);
  if (!material) return null;
  return createHmac("sha256", secret).update(material).digest("hex");
}

/** Extract proxy-safe client material from request headers (not logged). */
export function extractLeadRateClientMaterial(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const ip = forwarded || realIp || "unknown";
  // Bind lightly to UA class so shared NATs are not over-blocked as one bot.
  const ua = (request.headers.get("user-agent") ?? "").slice(0, 80);
  return `${ip}|${ua}`;
}

export async function consumeLeadApiRateLimit(
  supabase: SupabaseClient,
  clientHash: string,
  options?: { max?: number; windowSeconds?: number }
): Promise<LeadRateLimitResult> {
  const max = options?.max ?? LEAD_RATE_LIMIT_MAX;
  const windowSeconds = options?.windowSeconds ?? LEAD_RATE_LIMIT_WINDOW_SECONDS;

  const { data, error } = await supabase.rpc("consume_lead_api_rate_limit", {
    p_client_hash: clientHash,
    p_max_requests: max,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    return {
      allowed: false,
      retryAfterSeconds: windowSeconds,
      currentCount: 0,
      skipped: true,
      errorCode: error.code ?? "rate_limit_rpc_error",
    };
  }

  const row = (data ?? {}) as {
    allowed?: unknown;
    retry_after_seconds?: unknown;
    current_count?: unknown;
  };

  return {
    allowed: row.allowed === true,
    retryAfterSeconds:
      typeof row.retry_after_seconds === "number"
        ? Math.max(0, Math.floor(row.retry_after_seconds))
        : windowSeconds,
    currentCount:
      typeof row.current_count === "number"
        ? Math.max(0, Math.floor(row.current_count))
        : 0,
  };
}

/** Pure helper for unit tests — fixed-window arithmetic without DB. */
export function evaluateFixedWindowRateLimit(input: {
  nowMs: number;
  windowStartedAtMs: number;
  requestCount: number;
  max: number;
  windowSeconds: number;
}): LeadRateLimitResult {
  const windowMs = input.windowSeconds * 1000;
  if (input.nowMs - input.windowStartedAtMs >= windowMs) {
    return { allowed: true, retryAfterSeconds: 0, currentCount: 1 };
  }
  if (input.requestCount >= input.max) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil(
        (input.windowStartedAtMs + windowMs - input.nowMs) / 1000
      )
    );
    return {
      allowed: false,
      retryAfterSeconds,
      currentCount: input.requestCount,
    };
  }
  return {
    allowed: true,
    retryAfterSeconds: 0,
    currentCount: input.requestCount + 1,
  };
}
