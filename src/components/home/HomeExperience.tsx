"use client";

import { CockpitHero } from "@/components/home/CockpitHero";
import { HomeJourney } from "@/components/home/HomeJourney";
import { HomeIntents } from "@/components/home/HomeIntents";
import { HomeTrustBlock } from "@/components/home/HomeTrustBlock";
import { HomeHowItWorks } from "@/components/home/HomeHowItWorks";
import { HomeWhyDecision } from "@/components/home/HomeWhyDecision";
import { LiveDataTrustBar } from "@/components/home/LiveDataTrustBar";
import { HomeFinalCta } from "@/components/home/HomeFinalCta";

/**
 * Veřejná marketingová homepage (/).
 * Personalizovaný dashboard je na /dashboard — kořen se nepřepíná.
 */
export function HomeExperience() {
  return (
    <>
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
