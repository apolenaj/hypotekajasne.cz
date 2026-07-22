"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { CookieConsentProvider } from "@/components/consent/CookieConsentProvider";
import { CookieConsentBanner } from "@/components/consent/CookieConsentBanner";
import { ConsentGatedScripts } from "@/components/consent/ConsentGatedScripts";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { AnalyticsAttributionBootstrap } from "@/components/analytics/AnalyticsAttributionBootstrap";
import { LegalDevIncompleteBanner } from "@/components/legal/LegalDevIncompleteBanner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delay={200}>
      <CookieConsentProvider>
        <LegalDevIncompleteBanner />
        <AnalyticsAttributionBootstrap />
        <PageViewTracker />
        {children}
        <CookieConsentBanner />
        <ConsentGatedScripts />
      </CookieConsentProvider>
    </TooltipProvider>
  );
}
