"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { CockpitHero } from "@/components/home/CockpitHero";
import { HomeJourney } from "@/components/home/HomeJourney";
import { HomeIntents } from "@/components/home/HomeIntents";
import { HomeTrustBlock } from "@/components/home/HomeTrustBlock";
import { HomeHowItWorks } from "@/components/home/HomeHowItWorks";
import { HomeWhyDecision } from "@/components/home/HomeWhyDecision";
import { LiveDataTrustBar } from "@/components/home/LiveDataTrustBar";
import { HomeFinalCta } from "@/components/home/HomeFinalCta";
import { loadFinancialProfile } from "@/lib/financial-passport";
import { routes } from "@/lib/routes";

function subscribeNoop() {
  return () => {};
}

function useHasFinancialProfile() {
  return useSyncExternalStore(
    subscribeNoop,
    () => loadFinancialProfile() != null,
    () => false
  );
}

/**
 * Veřejná marketingová homepage (/).
 * Personalizovaný dashboard je na /dashboard — kořen se nepřepíná.
 */
export function HomeExperience() {
  const hasProfile = useHasFinancialProfile();

  return (
    <>
      {hasProfile ? (
        <div className="border-b border-border bg-[#f3f8f6] px-4 py-2.5 text-center text-sm">
          Máte uložený Finanční pas.{" "}
          <Link
            href={routes.dashboard}
            className="font-bold text-deep-teal underline"
          >
            Otevřít personalizovaný přehled
          </Link>
        </div>
      ) : null}
      <CockpitHero />
      <HomeJourney />
      <HomeIntents />
      <HomeTrustBlock />
      <HomeHowItWorks />
      <HomeWhyDecision />
      <LiveDataTrustBar />
      <HomeFinalCta />
    </>
  );
}
