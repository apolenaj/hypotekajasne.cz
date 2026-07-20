"use client";

import Script from "next/script";
import { useCookieConsent } from "@/components/consent/CookieConsentProvider";

/**
 * Načte analytiku / marketing skripty až po consent.
 * Bez Measurement ID / Pixel ID se nenačítá nic (bezpečný default).
 * Chyby skriptů nesmí shodit React strom — proto next/script + defensive guards.
 */
export function ConsentGatedScripts() {
  const { ready, analyticsAllowed, marketingAllowed } = useCookieConsent();

  if (!ready) return null;

  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "";
  const metaPixel = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "";

  const loadGa = analyticsAllowed && Boolean(gaId);
  const loadMarketing = marketingAllowed && Boolean(metaPixel);

  return (
    <>
      {loadGa ? (
        <>
          <Script
            id="hj-ga-src"
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
            strategy="afterInteractive"
            onError={() => {
              console.warn("[analytics] failed to load gtag.js");
            }}
          />
          <Script
            id="hj-ga-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
try {
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', ${JSON.stringify(gaId)}, { anonymize_ip: true });
} catch (e) {
  console.warn('[analytics] gtag init failed', e);
}
              `.trim(),
            }}
          />
        </>
      ) : null}

      {loadMarketing ? (
        <Script
          id="hj-meta-stub"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
try {
  window.__hjMarketingConsent = true;
  window.__hjMetaPixelId = ${JSON.stringify(metaPixel)};
} catch (e) {
  console.warn('[marketing] consent stub failed', e);
}
            `.trim(),
          }}
        />
      ) : null}
    </>
  );
}
