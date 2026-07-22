"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { HomeDashboard } from "@/components/dashboard/HomeDashboard";
import { CockpitHero } from "@/components/home/CockpitHero";
import { HomeJourney } from "@/components/home/HomeJourney";
import { HomeIntents } from "@/components/home/HomeIntents";
import { HomeTrustBlock } from "@/components/home/HomeTrustBlock";
import { HomeHowItWorks } from "@/components/home/HomeHowItWorks";
import { HomeWhyDecision } from "@/components/home/HomeWhyDecision";
import { LiveDataTrustBar } from "@/components/home/LiveDataTrustBar";
import { HomeFinalCta } from "@/components/home/HomeFinalCta";
import { resolveHomeMode, setHomeMode } from "@/lib/dashboard";
import { loadFinancialProfile } from "@/lib/financial-passport";

function subscribeNoop() {
  return () => {};
}

function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

function MarketingHome({ onEnterDashboard }: { onEnterDashboard: () => void }) {
  const hasProfile =
    typeof window !== "undefined" && loadFinancialProfile() != null;

  return (
    <>
      {hasProfile ? (
        <div className="border-b border-border bg-[#f3f8f6] px-4 py-2.5 text-center text-sm">
          Máte uložený Finanční pas.{" "}
          <button
            type="button"
            onClick={onEnterDashboard}
            className="font-bold text-deep-teal underline"
          >
            Otevřít personalizovaný přehled
          </button>
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

/**
 * Progressive home: positioning cockpit OR personalized dashboard.
 */
export function HomeExperience() {
  const ready = useIsClient();
  const [mode, setMode] = useState<"marketing" | "dashboard" | null>(null);

  const resolved =
    mode ??
    (ready
      ? resolveHomeMode(loadFinancialProfile() != null)
      : "marketing");

  const enterDashboard = useCallback(() => {
    setHomeMode("dashboard");
    setMode("dashboard");
  }, []);

  const showMarketing = useCallback(() => {
    setHomeMode("marketing");
    setMode("marketing");
  }, []);

  if (!ready) {
    return (
      <>
        <CockpitHero />
        <HomeJourney />
      </>
    );
  }

  if (resolved === "dashboard") {
    return <HomeDashboard onShowMarketing={showMarketing} />;
  }

  return <MarketingHome onEnterDashboard={enterDashboard} />;
}
