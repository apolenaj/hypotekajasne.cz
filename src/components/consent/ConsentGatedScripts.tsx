"use client";

import { useEffect } from "react";
import { useCookieConsent } from "@/components/consent/CookieConsentProvider";

/**
 * Načte analytiku / marketing skripty až po consent.
 * Bez Measurement ID / Pixel ID se nenačítá nic (bezpečný default).
 */
export function ConsentGatedScripts() {
  const { ready, analyticsAllowed, marketingAllowed } = useCookieConsent();

  useEffect(() => {
    if (!ready) return;

    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
    if (analyticsAllowed && gaId) {
      injectScriptOnce(
        "hj-ga",
        `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`
      );
      if (!(window as unknown as { dataLayer?: unknown[] }).dataLayer) {
        (window as unknown as { dataLayer: unknown[] }).dataLayer = [];
      }
      const w = window as unknown as {
        dataLayer: unknown[];
        gtag?: (...args: unknown[]) => void;
      };
      w.gtag = function gtag(...args: unknown[]) {
        w.dataLayer.push(args);
      };
      w.gtag("js", new Date());
      w.gtag("config", gaId, { anonymize_ip: true });
    }

    const metaPixel = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
    if (marketingAllowed && metaPixel) {
      // Placeholder — skutečný pixel doplnit po legal review; bez ID se nespouští.
      injectScriptOnce(
        "hj-meta-stub",
        undefined,
        `window.__hjMarketingConsent=true;window.__hjMetaPixelId=${JSON.stringify(metaPixel)};`
      );
    }
  }, [ready, analyticsAllowed, marketingAllowed]);

  return null;
}

function injectScriptOnce(
  id: string,
  src?: string,
  inline?: string
) {
  if (document.getElementById(id)) return;
  const el = document.createElement("script");
  el.id = id;
  if (src) {
    el.async = true;
    el.src = src;
  } else if (inline) {
    el.text = inline;
  }
  document.head.appendChild(el);
}
