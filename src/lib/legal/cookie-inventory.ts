/**
 * Cookie / storage inventory derived from actual application code.
 * Do not invent providers, cookie names, or durations not evidenced in code.
 */

export type CookieCategory = "necessary" | "analytics" | "marketing";

export type CookieInventoryRow = {
  id: string;
  provider: string;
  technology: string;
  purpose: string;
  category: CookieCategory;
  /** Human-readable duration from our implementation — never invented vendor TTLs. */
  duration: string;
  /** True when this deployment has the env/config needed to activate it. */
  activeInDeployment: boolean;
  /** Loads before cookie consent decision. */
  loadsBeforeConsent: boolean;
};

function envConfigured(name: string): boolean {
  const v = process.env[name]?.trim();
  return Boolean(v);
}

/** Google Analytics Measurement ID present in this build/runtime. */
export function isGoogleAnalyticsConfigured(): boolean {
  return envConfigured("NEXT_PUBLIC_GA_MEASUREMENT_ID");
}

/**
 * Meta Pixel ID may be set, but ConsentGatedScripts only writes a consent stub
 * (no fbq / no Facebook script). Treat advertising Pixel as inactive.
 */
export function isMetaPixelScriptActive(): boolean {
  return false;
}

export function isMetaPixelEnvConfigured(): boolean {
  return envConfigured("NEXT_PUBLIC_META_PIXEL_ID");
}

/**
 * Full inventory of privacy-relevant storage and trackers found in code.
 * Rows with `activeInDeployment: false` are supported by code but not live here.
 */
export function getCookieInventory(): CookieInventoryRow[] {
  const gaActive = isGoogleAnalyticsConfigured();

  return [
    {
      id: "consent_preference",
      provider: "Hypotéka Jasně (first-party)",
      technology: "localStorage · hj_cookie_consent_v1",
      purpose: "Uložení volby nezbytné / analytické / marketingové",
      category: "necessary",
      duration:
        "Do změny preference, smazání úložiště prohlížeče, nebo změny verze zásad cookies",
      activeInDeployment: true,
      loadsBeforeConsent: false,
    },
    {
      id: "google_analytics_gtag",
      provider: "Google LLC",
      technology: "gtag.js (googletagmanager.com/gtag/js) + window.gtag / dataLayer",
      purpose:
        "Měření návštěvnosti a produktových událostí (anonymize_ip: true). HTTP cookies Google se nastavují pouze pokud se skript načte.",
      category: "analytics",
      duration:
        "Skript se načítá jen po souhlasu s analytikou. Doba případných cookies Google není v naší konfiguraci pevně nastavena.",
      activeInDeployment: gaActive,
      loadsBeforeConsent: false,
    },
    {
      id: "first_party_attribution",
      provider: "Hypotéka Jasně (first-party)",
      technology:
        "localStorage / sessionStorage · hj-analytics-attribution-v1, hj-analytics-visitor-v1, hj-analytics-session-v1",
      purpose:
        "UTM atributace a anonymní návštěvní kontext pro analytické události",
      category: "analytics",
      duration:
        "Zápis až po souhlasu s analytikou; při odvolání souhlasu se klíče mažou. Do té doby UTM může být dočasně ve sessionStorage (hj-analytics-utm-pending).",
      activeInDeployment: true,
      loadsBeforeConsent: false,
    },
    {
      id: "utm_pending_stage",
      provider: "Hypotéka Jasně (first-party)",
      technology: "sessionStorage · hj-analytics-utm-pending",
      purpose:
        "Dočasné uložení sanitizovaných UTM parametrů z URL před souhlasem (bez trvalého zápisu atributace)",
      category: "analytics",
      duration: "Do souhlasu, odvolání, nebo konce relace prohlížeče",
      activeInDeployment: true,
      loadsBeforeConsent: true,
    },
  ];
}

/** Rows for the public cookies page table. */
export function getPublicCookieTableRows(): CookieInventoryRow[] {
  const all = getCookieInventory();
  return all.filter((row) => {
    if (row.id === "google_analytics_gtag") return row.activeInDeployment;
    return true;
  });
}

/**
 * Public summary lines — no invented processors.
 */
export function getCookiePolicyDeploymentNotes(): string[] {
  const notes: string[] = [];

  if (isGoogleAnalyticsConfigured()) {
    notes.push(
      "Analytika: po souhlasu se může načíst Google Analytics (gtag) dle konfigurace této instalace."
    );
  } else {
    notes.push(
      "V této instalaci není aktivní žádná analytická služba třetí strany (chybí Measurement ID). Souhlas s analytikou je připravený; skript gtag se nenačte, dokud není ID nastaveno."
    );
  }

  notes.push(
    "Marketingové skripty třetích stran (včetně Meta Pixel / fbq) se v současné implementaci nenačítají. Kategorie marketing v banneru je připravená; reklamní cookies třetích stran web sám nenastavuje."
  );

  notes.push(
    "Microsoft Clarity, PostHog, Plausible, Sentry ani Vercel Analytics v kódu nejsou."
  );

  return notes;
}

export const COOKIE_CATEGORY_LABEL_CS: Record<CookieCategory, string> = {
  necessary: "Nezbytné",
  analytics: "Analytické",
  marketing: "Marketingové",
};
