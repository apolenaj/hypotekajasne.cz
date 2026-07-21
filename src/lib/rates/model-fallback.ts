/**
 * Jediný source of truth pro modelovou sazbu při absenci LIVE / OVĚŘENO dat.
 *
 * Hodnota 5 % p.a. je již schválená a používaná napříč produktem:
 * - mortgage-readiness/score.ts
 * - financial-passport/*
 * - copilot context/tools
 * - report-engine builders
 *
 * Nikdy nevydávat za LIVE ani za individuální nabídku banky.
 */
export const MODEL_FALLBACK_RATE_PERCENT = 5 as const;

export const MODEL_FALLBACK_SOURCE_ID = "platform-model-fallback-v1" as const;

export const MODEL_FALLBACK_EXPLANATION =
  "Aktuální sazbu právě ověřujeme. Pro orientační výpočet používáme modelovou sazbu 5 % p.a. Nejde o nabídku banky.";
