/**
 * Sanitize lead attribution for DB storage (Phase 6.2).
 * - page_intent: allowlist only
 * - UTM: safe alphanumeric tokens only
 * - click IDs (gclid, fbclid, …): never persisted without separate legal basis
 */

import { readSafePageIntent } from "@/lib/leads-ops";

const CLICK_ID_KEYS = [
  "gclid",
  "fbclid",
  "msclkid",
  "gbraid",
  "wbraid",
  "ttclid",
  "li_fat_id",
] as const;

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

const FORBIDDEN_META_KEYS = [
  "name",
  "email",
  "phone",
  "message",
  "raw_body",
  "password",
  ...CLICK_ID_KEYS,
] as const;

function sanitizeUtm(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim().slice(0, 64).toLowerCase();
  if (!trimmed || !/^[a-z0-9._-]+$/.test(trimmed)) return null;
  return trimmed;
}

function sanitizeLandingPath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const path = raw.split("?")[0]?.slice(0, 120) ?? "";
  return path.startsWith("/") ? path : null;
}

export type SanitizedLeadAttribution = {
  page_intent: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  landing_path: string | null;
  /** Metadata safe to store (no click IDs / PII keys). */
  metadata: Record<string, unknown>;
};

/**
 * Build DB-safe attribution + metadata from client payload.
 * Click IDs are stripped even if the client sends them.
 */
export function sanitizeLeadAttribution(
  metadata: Record<string, unknown> | undefined
): SanitizedLeadAttribution {
  const src = metadata ?? {};
  const page_intent = readSafePageIntent(src);
  const utm_source = sanitizeUtm(src.utm_source);
  const utm_medium = sanitizeUtm(src.utm_medium);
  const utm_campaign = sanitizeUtm(src.utm_campaign);
  const utm_content = sanitizeUtm(src.utm_content);
  const utm_term = sanitizeUtm(src.utm_term);
  const landing_path = sanitizeLandingPath(
    src.landing_path ?? src.source_page ?? src.path
  );

  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(src)) {
    const lower = key.toLowerCase();
    if ((FORBIDDEN_META_KEYS as readonly string[]).includes(lower)) continue;
    if ((CLICK_ID_KEYS as readonly string[]).includes(lower as never)) continue;
    if (lower === "page_intent") {
      cleaned.page_intent = page_intent;
      continue;
    }
    if ((UTM_KEYS as readonly string[]).includes(lower as (typeof UTM_KEYS)[number])) {
      continue; // first-class columns; avoid duplicating unsafe raw
    }
    cleaned[key] = value;
  }

  if (page_intent) cleaned.page_intent = page_intent;
  if (utm_source) cleaned.utm_source = utm_source;
  if (utm_medium) cleaned.utm_medium = utm_medium;
  if (utm_campaign) cleaned.utm_campaign = utm_campaign;
  if (utm_content) cleaned.utm_content = utm_content;
  if (utm_term) cleaned.utm_term = utm_term;
  if (landing_path) cleaned.landing_path = landing_path;

  return {
    page_intent,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    landing_path,
    metadata: cleaned,
  };
}

export function isSyntheticRetentionMarker(marker: unknown): boolean {
  if (typeof marker !== "string") return false;
  return (
    /^phase_6_2_[a-z0-9_-]+$/i.test(marker) ||
    /^phase6[_-]conversion/i.test(marker)
  );
}
