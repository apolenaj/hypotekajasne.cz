/**
 * Central privacy retention configuration (operational policy).
 *
 * Public GDPR text must match these numbers and the real automation status.
 * Do not claim automatic deletion unless `cleanupScheduledInCron` is true
 * and the cleanup route is registered in vercel.json.
 */

export const privacyRetention = {
  /** Ordinary enquiries that do not proceed */
  inactiveEnquiryMonths: 6,
  /** After an active case closes */
  closedCaseMonths: 6,
  /** Marketing contact inactivity review */
  marketingInactivityMonths: 24,
  /** Security / technical logs (product scrape logs, etc.) */
  technicalLogDays: 90,
  /**
   * Evidence of consent/withdrawal — keep aligned with the related processing
   * period (enquiry or marketing), not longer without a documented need.
   */
  consentEvidenceAlignedWithProcessing: true,
  /**
   * True when `/api/cron/privacy-retention` is registered in vercel.json.
   * Flip to false if the cron entry is removed.
   */
  cleanupScheduledInCron: true,
} as const;

export type PrivacyRetentionConfig = typeof privacyRetention;

/** @deprecated Prefer privacyRetention.*Months / *Days — kept for older tests/helpers. */
export const privacyRetentionLegacyEntries = {
  enquiries: {
    months: privacyRetention.inactiveEnquiryMonths,
    automation: "scheduled_deletion" as const,
  },
  marketingConsent: {
    months: privacyRetention.marketingInactivityMonths,
    automation: "scheduled_deletion" as const,
  },
  technicalLogs: {
    days: privacyRetention.technicalLogDays,
    automation: "scheduled_deletion" as const,
  },
  cookiePreferences: {
    automation: "browser_only" as const,
  },
};

export function addMonths(isoOrDate: Date | string, months: number): Date {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : new Date(isoOrDate);
  const out = new Date(d.getTime());
  out.setUTCMonth(out.getUTCMonth() + months);
  return out;
}

export function addDays(isoOrDate: Date | string, days: number): Date {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : new Date(isoOrDate);
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Compute retention_until for a new/updated enquiry lead.
 * - newsletter / marketing: inactivity window (24 months)
 * - ordinary enquiry: 6 months from last interaction
 * - active_case: null until case closed (cleanup skips active_case = true)
 */
export function computeEnquiryRetentionUntil(input: {
  lastInteractionAt: Date | string;
  source?: string;
  activeCase?: boolean;
  marketingConsent?: boolean;
}): Date | null {
  if (input.activeCase) return null;
  const base = input.lastInteractionAt;
  if (input.source === "newsletter" || input.marketingConsent) {
    return addMonths(base, privacyRetention.marketingInactivityMonths);
  }
  return addMonths(base, privacyRetention.inactiveEnquiryMonths);
}

/**
 * Public-safe retention wording for the GDPR page.
 * Reflects operational policy + whether cleanup cron is registered.
 */
export function buildPublicRetentionSummary(privacyEmail: string): string[] {
  const lines = [
    "Preference cookies ukládáme ve vašem prohlížeči do změny preference, smazání úložiště, nebo aktualizace verze zásad cookies.",
    `Nevyřízené poptávky, u kterých nepokračuje další komunikace: uchováváme nejvýše ${privacyRetention.inactiveEnquiryMonths} měsíců od poslední smysluplné interakce.`,
    `Aktivní případ: po dobu aktivního řešení; po ukončení ještě ${privacyRetention.closedCaseMonths} měsíců od poslední smysluplné interakce, pokud jiná zákonná povinnost nevyžaduje delší uchování.`,
    `Marketingové kontakty (při uděleném souhlasu): do odvolání souhlasu, s revizí nečinnosti nejpozději do ${privacyRetention.marketingInactivityMonths} měsíců.`,
    `Technické / bezpečnostní provozní záznamy: nejvýše ${privacyRetention.technicalLogDays} dní, není-li delší uchování nutné pro šetření nebo bezpečnostní povinnosti.`,
    "Doklady o udělení nebo odvolání souhlasu uchováváme jen po dobu přiměřeně nutnou k prokázání souladu se zpracováním, ke kterému se vztahují.",
  ];

  if (privacyRetention.cleanupScheduledInCron) {
    lines.push(
      "Po uplynutí retenční lhůty mohou být běžné poptávky anonymizovány nebo smazány automatickým úklidem. Záznamy s právním zákazem mazání (legal hold) a aktivní případy se nemažou."
    );
  } else {
    lines.push(
      "Automatický úklid retenčních lhůt není v této instalaci naplánován — o výmaz můžete požádat."
    );
  }

  lines.push(`Žádost o výmaz nebo informace o uchování: ${privacyEmail}.`);
  return lines;
}
