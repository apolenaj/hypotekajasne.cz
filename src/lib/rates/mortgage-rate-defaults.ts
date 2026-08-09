/**
 * Single SoT for the CZ model / fallback mortgage rate percent.
 * All calculators and services must import from here (or via model-fallback re-export).
 * Never invent parallel 5.00 constants elsewhere.
 */

export const DEFAULT_CZ_MODEL_RATE = 5.0 as const;

export const DEFAULT_CZ_MODEL_RATE_SOURCE_ID =
  "platform-model-fallback-v1" as const;
