/**
 * Budoucí SSO — architektura bez předčasné složitosti.
 * Status: COMING SOON. Zatím stačí anonymní lifecycleId + referral.
 */

import type { FeatureStatus } from "@/lib/majetio/types";

export const SSO_FEATURE_STATUS: FeatureStatus = "COMING_SOON";

/**
 * Navrhovaný tok (až bude potřeba):
 * 1. Uživatel je přihlášen na jedné platformě.
 * 2. Handoff vytvoří krátkodobý one-time kód (TTL ~60s) vázaný na lifecycleId.
 * 3. Cílová platforma vymění kód za session přes server-to-server.
 * 4. Žádné sdílení hesel; OAuth/OIDC až při reálné potřebě unified account.
 *
 * Teď: nepřihlašujeme napříč — předáváme jen ne-PII passport + attribution.
 */
export type FutureSsoHandshake = {
  status: typeof SSO_FEATURE_STATUS;
  mechanism: "one_time_code" | "oidc" | "none";
  bindsTo: "lifecycleId";
  doesNotInclude: ["password", "email_by_default", "full_profile"];
  note: string;
};

export const FUTURE_SSO_BLUEPRINT: FutureSsoHandshake = {
  status: "COMING_SOON",
  mechanism: "none",
  bindsTo: "lifecycleId",
  doesNotInclude: ["password", "email_by_default", "full_profile"],
  note:
    "SSO nenasazujeme, dokud není produktová potřeba. Attribution + Financial Passport pokrývají aktuální handoff.",
};
