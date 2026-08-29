"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { DeferredAnalyticsMount } from "@/components/analytics/DeferredAnalyticsMount";
import { CookieConsentBanner } from "@/components/consent/CookieConsentBanner";
import { CookieConsentProvider } from "@/components/consent/CookieConsentProvider";
import { ConsentGatedScripts } from "@/components/consent/ConsentGatedScripts";
import { LegalDevIncompleteBanner } from "@/components/legal/LegalDevIncompleteBanner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delay={200}>
      <CookieConsentProvider>
        <LegalDevIncompleteBanner />
        <DeferredAnalyticsMount />
        {children}
        <CookieConsentBanner />
        <ConsentGatedScripts />
      </CookieConsentProvider>
    </TooltipProvider>
  );
}
