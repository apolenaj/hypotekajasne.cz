"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { bootstrapAnalyticsAttribution } from "@/lib/analytics/attribution";

const CONSENT_EVENT = "hj:cookie-consent";

/**
 * Stages UTM from URL; persists attribution + visitor session only after analytics consent.
 */
export function AnalyticsAttributionBootstrap() {
  const pathname = usePathname();

  useEffect(() => {
    bootstrapAnalyticsAttribution(pathname ?? undefined);
  }, [pathname]);

  useEffect(() => {
    const onConsent = () => bootstrapAnalyticsAttribution(pathname ?? undefined);
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, [pathname]);

  return null;
}
