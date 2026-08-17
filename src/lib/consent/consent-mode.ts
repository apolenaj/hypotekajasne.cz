/**
 * Google Consent Mode v2 helpers (client-safe).
 */

export type ConsentModeUpdate = {
  analytics: boolean;
  marketing: boolean;
};

export const CONSENT_MODE_DEFAULT_DENIED = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
} as const;

/** Inline snippet for beforeInteractive Script in root layout. */
export const CONSENT_DEFAULTS_INLINE_SCRIPT = `
try {
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  window.gtag = window.gtag || gtag;
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });
} catch (e) {
  console.warn('[consent] default consent init failed', e);
}
`.trim();

/** Update Consent Mode signals without loading Measurement ID. */
export function pushConsentModeUpdate(next: ConsentModeUpdate): void {
  if (typeof window === "undefined") return;
  try {
    const w = window as Window & {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
    };
    w.dataLayer = w.dataLayer || [];
    const gtag =
      w.gtag ||
      function gtag(...args: unknown[]) {
        w.dataLayer!.push(args);
      };
    w.gtag = gtag;
    gtag("consent", "update", {
      analytics_storage: next.analytics ? "granted" : "denied",
      ad_storage: next.marketing ? "granted" : "denied",
      ad_user_data: next.marketing ? "granted" : "denied",
      ad_personalization: next.marketing ? "granted" : "denied",
    });
  } catch {
    /* ignore */
  }
}
