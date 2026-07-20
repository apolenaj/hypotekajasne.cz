import type { AttributionPayload } from "@/lib/majetio/types";

const LIFECYCLE_KEY = "hj-lead-lifecycle-v1";

function randomId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Anonymní lifecycle ID — bez PII, persistuje se lokálně. */
export function getOrCreateLifecycleId(): string {
  if (typeof window === "undefined") {
    return randomId("ll");
  }
  try {
    const existing = localStorage.getItem(LIFECYCLE_KEY);
    if (existing && existing.startsWith("ll_")) return existing;
    const id = randomId("ll");
    localStorage.setItem(LIFECYCLE_KEY, id);
    return id;
  } catch {
    return randomId("ll");
  }
}

export function createReferralId(): string {
  return randomId("ref");
}

export function buildAttribution(input: {
  campaign: string;
  medium?: string;
  content?: string;
  conversionEvent: string;
  product: string;
  source?: "hypoteka-jasne" | "majetio";
}): AttributionPayload {
  const lifecycleId =
    typeof window !== "undefined"
      ? getOrCreateLifecycleId()
      : randomId("ll");
  const referralId = createReferralId();
  const source = input.source ?? "hypoteka-jasne";
  const medium = input.medium ?? "referral";

  return {
    lifecycleId,
    referralId,
    source,
    medium,
    campaign: input.campaign,
    content: input.content,
    conversion: {
      event: input.conversionEvent,
      product: input.product,
      at: new Date().toISOString(),
    },
    utm: {
      utm_source: source,
      utm_medium: medium,
      utm_campaign: input.campaign,
      utm_content: input.content,
    },
  };
}

/** Serializace attribution do lead metadata (HJ API). */
export function attributionToLeadMetadata(
  attr: AttributionPayload
): Record<string, unknown> {
  return {
    lifecycle_id: attr.lifecycleId,
    referral_id: attr.referralId,
    source_attribution: attr.source,
    utm: attr.utm,
    conversion: attr.conversion,
  };
}
