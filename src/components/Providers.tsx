"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { CookieConsentProvider } from "@/components/consent/CookieConsentProvider";
import { CookieConsentBanner } from "@/components/consent/CookieConsentBanner";
import { ConsentGatedScripts } from "@/components/consent/ConsentGatedScripts";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delay={200}>
      <CookieConsentProvider>
        {children}
        <CookieConsentBanner />
        <ConsentGatedScripts />
      </CookieConsentProvider>
    </TooltipProvider>
  );
}
