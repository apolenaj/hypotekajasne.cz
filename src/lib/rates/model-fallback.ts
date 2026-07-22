/**
 * Explicitní modelová sazba — NIKDY jako LIVE / bankovní nabídka (PROMPT 6).
 */

import { modelRateDisclaimer } from "@/lib/rates/types";

export const MODEL_FALLBACK_RATE_PERCENT = 5 as const;

export const MODEL_FALLBACK_SOURCE_ID = "platform-model-fallback-v1" as const;

export const MODEL_FALLBACK_EXPLANATION = modelRateDisclaimer(
  MODEL_FALLBACK_RATE_PERCENT
);
