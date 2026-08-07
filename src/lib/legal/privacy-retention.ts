/**
 * Central privacy retention configuration.
 *
 * FINAL DAY COUNTS MUST BE OWNER/LEGAL APPROVED before public claims.
 * `null` = not yet approved — do not display null/TODO publicly.
 *
 * Actual behavior today (code audit):
 * - Leads: insert-only into Supabase `public.leads`; no automatic deletion.
 * - Form consent: snapshot in `leads.metadata` only; no consent history table.
 * - Cookie consent: browser localStorage only; no server audit log.
 * - No retention cron for personal data (vercel cron = rate scrape only).
 */

export type RetentionPeriodDays = number | null;

export type RetentionEntry = {
  /** Approved retention in days, or null if not approved yet. */
  days: RetentionPeriodDays;
  /**
   * What the application actually does today.
   * Never claim automatic deletion unless this is `scheduled_deletion`.
   */
  automation:
    | "none"
    | "browser_only"
    | "manual_erasure_request"
    | "scheduled_deletion";
  /** Internal note for legal/ops — not for public UI. */
  internalNote: string;
};

/**
 * INTERNAL SoT — values pending legal confirmation stay `days: null`.
 */
export const privacyRetention = {
  enquiries: {
    days: null,
    automation: "manual_erasure_request",
    internalNote:
      "Supabase public.leads — insert only; no TTL/DELETE cron. Retention period unconfirmed.",
  },
  marketingConsent: {
    days: null,
    automation: "manual_erasure_request",
    internalNote:
      "Stored as leads.metadata.marketing_opt_in + consent snapshot on the lead row. No separate marketing_consent table or purge job.",
  },
  consentHistory: {
    days: null,
    automation: "none",
    internalNote:
      "No dedicated consent_history table. Form consent is one snapshot per lead; cookie consent is localStorage only.",
  },
  technicalLogs: {
    days: null,
    automation: "none",
    internalNote:
      "pipeline_runs / pipeline_alerts are product scrape logs (not lead PII). No personal-data log retention policy in code.",
  },
  accounts: {
    days: null,
    automation: "none",
    internalNote: "No end-user account / auth tables in this codebase.",
  },
  cookiePreferences: {
    days: null,
    automation: "browser_only",
    internalNote:
      "hj_cookie_consent_v1 in localStorage until user changes preference, clears storage, or COOKIE_POLICY_VERSION changes.",
  },
} as const satisfies Record<string, RetentionEntry>;

export type PrivacyRetentionKey = keyof typeof privacyRetention;

/** True when a retention day-count has been owner/legal approved. */
export function isRetentionPeriodApproved(key: PrivacyRetentionKey): boolean {
  return typeof privacyRetention[key].days === "number";
}

/**
 * Public-safe retention wording for GDPR page.
 * Never exposes null, TODO, or false claims of automatic deletion.
 */
export function buildPublicRetentionSummary(privacyEmail: string): string[] {
  return [
    "Preference cookies ukládáme ve vašem prohlížeči do změny preference, smazání úložiště, nebo aktualizace verze zásad cookies.",
    "Údaje z poptávek a související záznamy souhlasů uchováváme po dobu potřebnou k vyřízení poptávky a plnění souvisejících povinností. Automatické mazání po pevném kalendářním termínu v aplikaci aktuálně není nastaveno.",
    `O výmaz nebo upřesnění doby uchování můžete požádat na ${privacyEmail}.`,
  ];
}
