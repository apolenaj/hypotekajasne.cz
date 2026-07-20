/**
 * Lightweight A/B experiment framework.
 * Assignment is sticky in localStorage; exposure only after analytics consent
 * when reporting — assignment itself is local UX only.
 */

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
  const key = "hj_exp_seed";
  let seed = localStorage.getItem(key);
  if (!seed) {
    seed =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(key, seed);
  }
  return seed;
}

export function getExperimentVariant<E extends ExperimentId>(
  experimentId: E
): ExperimentVariant<E> {
  if (typeof window === "undefined") {
    return EXPERIMENTS[experimentId].variants[0] as ExperimentVariant<E>;
  }
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
