/**
 * Lightweight A/B experiment framework.
 * Sticky assignment in localStorage only after analytics consent.
 * Before consent: returns control variant without writing storage.
 */

import {
  COOKIE_STORAGE_KEY,
  type CookieConsentRecord,
} from "@/lib/consent/records";

export const EXPERIMENTS = {
  hero: {
    id: "hero",
    description: "Homepage hero headline / primary CTA copy",
    variants: ["control", "clarity", "affordability"] as const,
  },
  cta: {
    id: "cta",
    description: "Primary CTA label on tool landings",
    variants: ["control", "consult", "score_first"] as const,
  },
  form_length: {
    id: "form_length",
    description: "Lead form field count (short vs full)",
    variants: ["control", "short", "progressive"] as const,
  },
  free_preview: {
    id: "free_preview",
    description: "Rentgen free preview depth before Premium gate",
    variants: ["control", "metrics_only", "metrics_plus_checklist"] as const,
  },
  majetio_cross_sell: {
    id: "majetio_cross_sell",
    description: "Majetio CTA placement after readiness / passport",
    variants: ["control", "inline", "sticky_footer"] as const,
  },
} as const;

export type ExperimentId = keyof typeof EXPERIMENTS;
export type ExperimentVariant<E extends ExperimentId> =
  (typeof EXPERIMENTS)[E]["variants"][number];

const STORAGE_PREFIX = "hj_exp_";
const SEED_KEY = "hj_exp_seed";

function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as CookieConsentRecord;
    return Boolean(parsed?.categories?.analytics);
  } catch {
    return false;
  }
}

function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pickVariant<E extends ExperimentId>(
  experimentId: E,
  seed: string
): ExperimentVariant<E> {
  const variants = EXPERIMENTS[experimentId].variants;
  const idx = hashString(`${experimentId}:${seed}`) % variants.length;
  return variants[idx] as ExperimentVariant<E>;
}

function getOrCreateSeed(): string {
  if (typeof window === "undefined") return "ssr";
  let seed = localStorage.getItem(SEED_KEY);
  if (!seed) {
    seed =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(SEED_KEY, seed);
  }
  return seed;
}

export function getExperimentVariant<E extends ExperimentId>(
  experimentId: E
): ExperimentVariant<E> {
  const control = EXPERIMENTS[experimentId].variants[0] as ExperimentVariant<E>;
  if (typeof window === "undefined") return control;
  if (!hasAnalyticsConsent()) return control;

  const storageKey = `${STORAGE_PREFIX}${experimentId}`;
  const stored = localStorage.getItem(storageKey);
  const allowed = EXPERIMENTS[experimentId].variants as readonly string[];
  if (stored && allowed.includes(stored)) {
    return stored as ExperimentVariant<E>;
  }
  const assigned = pickVariant(experimentId, getOrCreateSeed());
  localStorage.setItem(storageKey, assigned);
  return assigned;
}

/** Clear experiment keys when analytics consent is withdrawn. */
export function clearExperimentStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SEED_KEY);
    for (const id of Object.keys(EXPERIMENTS) as ExperimentId[]) {
      localStorage.removeItem(`${STORAGE_PREFIX}${id}`);
    }
  } catch {
    /* ignore */
  }
}

export type ExperimentAssignment = {
  experiment_id: string;
  variant_id: string;
};

export function getActiveAssignments(
  ids: ExperimentId[] = Object.keys(EXPERIMENTS) as ExperimentId[]
): ExperimentAssignment[] {
  return ids.map((id) => ({
    experiment_id: id,
    variant_id: getExperimentVariant(id),
  }));
}
