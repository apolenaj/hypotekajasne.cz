/**
 * Explicitní modelová sazba — NIKDY jako LIVE / bankovní nabídka (PROMPT 6).
 * Numeric SoT lives in mortgage-rate-defaults.ts (one place only).
 */

import {
  DEFAULT_CZ_MODEL_RATE,
  DEFAULT_CZ_MODEL_RATE_SOURCE_ID,
} from "@/lib/rates/mortgage-rate-defaults";
import { modelRateDisclaimer } from "@/lib/rates/types";

/** @deprecated Prefer DEFAULT_CZ_MODEL_RATE — same value, legacy name. */
export const MODEL_FALLBACK_RATE_PERCENT = DEFAULT_CZ_MODEL_RATE;

export const MODEL_FALLBACK_SOURCE_ID = DEFAULT_CZ_MODEL_RATE_SOURCE_ID;

export const MODEL_FALLBACK_EXPLANATION = modelRateDisclaimer(
  MODEL_FALLBACK_RATE_PERCENT
);

export { DEFAULT_CZ_MODEL_RATE, DEFAULT_CZ_MODEL_RATE_SOURCE_ID };
